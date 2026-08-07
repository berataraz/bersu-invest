import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { issueRefreshToken, revokeRefreshToken, rotateRefreshToken } from "@/lib/auth/refresh-tokens";
import { consumeRecoveryCode, verifyTotp } from "@/lib/auth/two-factor";
import { verifyPassword } from "@/lib/security/password";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { hashSensitiveValue } from "@/lib/security/tokens";

const credentialsSchema = z.object({
  email: z.string().email().max(254).transform((value) => value.toLowerCase().trim()),
  password: z.string().min(1).max(128),
  totp: z.string().regex(/^\d{6}$/).optional(),
  recoveryCode: z.string().min(6).max(64).optional(),
});

const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1_000;
type AppJwt = { refreshToken?: string; accessExpiresAt?: number; mustChangePassword?: boolean; error?: "RefreshAccessTokenError" };

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30, updateAge: 60 * 60 },
  jwt: { maxAge: 60 * 60 * 24 * 30 },
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      name: "Email and password",
      credentials: { email: {}, password: {}, totp: {}, recoveryCode: {} },
      async authorize(credentials, request) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const forwarded = request.headers.get("x-forwarded-for");
        const ip = forwarded?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "unknown";
        const ipHash = hashSensitiveValue(ip);
        await enforceRateLimit("login", `${parsed.data.email}:${ipHash}`);

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          include: { twoFactor: true },
        });
        const genericFailure = async () => {
          await writeAuditLog({ action: "LOGIN_FAILED", entityType: "User", ipHash, userAgent: request.headers.get("user-agent") });
          return null;
        };
        if (!user || !user.passwordHash || user.deletedAt || user.status !== "ACTIVE" || (user.lockedUntil && user.lockedUntil > new Date())) return genericFailure();
        if (!(await verifyPassword(user.passwordHash, parsed.data.password))) {
          const failedLoginCount = user.failedLoginCount + 1;
          await prisma.user.update({ where: { id: user.id }, data: { failedLoginCount, lockedUntil: failedLoginCount >= 5 ? new Date(Date.now() + 15 * 60 * 1_000) : null } });
          return genericFailure();
        }
        if (user.twoFactor?.isEnabled) {
          let valid = false;
          if (parsed.data.totp) valid = verifyTotp(user.twoFactor.encryptedSecret, parsed.data.totp);
          if (!valid && parsed.data.recoveryCode) {
            const result = await consumeRecoveryCode(user.twoFactor.recoveryCodeHashes, parsed.data.recoveryCode);
            valid = result.valid;
            if (valid) await prisma.twoFactorCredential.update({ where: { userId: user.id }, data: { recoveryCodeHashes: result.hashes } });
          }
          if (!valid) return genericFailure();
        }

        const token = await issueRefreshToken(user.id, { ipHash, userAgent: request.headers.get("user-agent") });
        await prisma.user.update({ where: { id: user.id }, data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() } });
        await writeAuditLog({ actorId: user.id, action: "LOGIN", entityType: "User", entityId: user.id, ipHash, userAgent: request.headers.get("user-agent") });
        return { id: user.id, email: user.email, name: `${user.firstName} ${user.lastName}`, image: user.image, refreshToken: token.rawToken, accessExpiresAt: Date.now() + ACCESS_TOKEN_TTL_MS, mustChangePassword: user.mustChangePassword };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const authToken = token as typeof token & AppJwt;
      if (user) {
        authToken.refreshToken = user.refreshToken;
        authToken.accessExpiresAt = user.accessExpiresAt;
        authToken.mustChangePassword = user.mustChangePassword;
        return token;
      }
      if (authToken.accessExpiresAt && Date.now() < authToken.accessExpiresAt) return token;
      if (!authToken.refreshToken) {
        authToken.error = "RefreshAccessTokenError";
        return token;
      }
      const refreshed = await rotateRefreshToken(authToken.refreshToken);
      if (!refreshed || refreshed.user.status !== "ACTIVE" || refreshed.user.deletedAt) {
        authToken.error = "RefreshAccessTokenError";
        delete authToken.refreshToken;
        return token;
      }
      authToken.refreshToken = refreshed.rawToken;
      authToken.accessExpiresAt = Date.now() + ACCESS_TOKEN_TTL_MS;
      return token;
    },
    async session({ session, token }) {
      const authToken = token as typeof token & AppJwt;
      if (token.sub) session.user.id = token.sub;
      session.accessExpiresAt = authToken.accessExpiresAt;
      session.user.mustChangePassword = authToken.mustChangePassword;
      session.error = authToken.error;
      return session;
    },
  },
  events: {
    async signOut(message) {
      const refreshToken = "token" in message ? (message.token as (typeof message.token & AppJwt) | undefined)?.refreshToken : undefined;
      if (refreshToken) await revokeRefreshToken(refreshToken, "logout");
    },
  },
});
