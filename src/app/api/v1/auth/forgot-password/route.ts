import { z } from "zod";
import { NextRequest } from "next/server";
import { AuditAction } from "@prisma/client";
import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { appUrl, sendTransactionalEmail } from "@/lib/auth/email";
import { assertCsrf } from "@/lib/security/csrf";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { requestMetadata } from "@/lib/security/request";
import { hashToken, randomToken } from "@/lib/security/tokens";
import { writeAuditLog } from "@/lib/audit";

const bodySchema = z.object({ email: z.string().email().max(254).transform((value) => value.toLowerCase().trim()) });

export async function POST(request: NextRequest) {
  try {
    assertCsrf(request);
    const { email } = bodySchema.parse(await request.json());
    const metadata = requestMetadata(request);
    await enforceRateLimit("password-reset", `${email}:${metadata.ipHash}`);
    const user = await prisma.user.findFirst({ where: { email, status: "ACTIVE", deletedAt: null } });
    if (user) {
      const rawToken = randomToken(48);
      await prisma.$transaction([
        prisma.passwordResetToken.updateMany({ where: { userId: user.id, usedAt: null }, data: { usedAt: new Date() } }),
        prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash: hashToken(rawToken), expiresAt: new Date(Date.now() + 60 * 60 * 1_000), requestedIpHash: metadata.ipHash } }),
      ]);
      await sendTransactionalEmail({ to: user.email, subject: "Reset your Bersu Invest password", html: `<p>Use the secure link below to reset your password. This link expires in one hour.</p><p><a href="${appUrl(`/reset-password?token=${encodeURIComponent(rawToken)}`)}">Reset password</a></p>` });
      await writeAuditLog({ actorId: user.id, action: AuditAction.PASSWORD_RESET_REQUESTED, entityType: "User", entityId: user.id, ...metadata });
    }
    return ok({ message: "If the account exists, password reset instructions have been sent." });
  } catch (error) { return fail(error); }
}
