import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashToken, randomToken } from "@/lib/security/tokens";

const REFRESH_TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 30;

export type SessionMetadata = { ipHash?: string | null; userAgent?: string | null };

export async function issueRefreshToken(userId: string, metadata: SessionMetadata) {
  const rawToken = randomToken(48);
  const familyId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

  const session = await prisma.authSession.create({
    data: {
      userId,
      familyId,
      ipHash: metadata.ipHash,
      userAgent: metadata.userAgent,
      expiresAt,
      refreshTokens: {
        create: { userId, familyId, tokenHash: hashToken(rawToken), expiresAt },
      },
    },
    include: { refreshTokens: true },
  });

  return { rawToken, refreshTokenId: session.refreshTokens[0].id, expiresAt, sessionId: session.id };
}

export async function rotateRefreshToken(rawToken: string, metadata?: SessionMetadata) {
  const tokenHash = hashToken(rawToken);
  const current = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { session: true, user: true },
  });

  if (!current) return null;
  const now = new Date();
  if (current.revokedAt || current.expiresAt <= now || current.session.revokedAt || current.session.expiresAt <= now) {
    // A previously rotated token indicates theft or a stale client; revoke the whole family.
    await prisma.$transaction([
      prisma.refreshToken.updateMany({ where: { familyId: current.familyId, revokedAt: null }, data: { revokedAt: now } }),
      prisma.authSession.updateMany({ where: { familyId: current.familyId, revokedAt: null }, data: { revokedAt: now, revokeReason: "refresh_token_reuse" } }),
    ]);
    return null;
  }

  const newRawToken = randomToken(48);
  const newExpiry = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
  const replacement = await prisma.$transaction(async (tx) => {
    const created = await tx.refreshToken.create({
      data: {
        sessionId: current.sessionId,
        userId: current.userId,
        familyId: current.familyId,
        tokenHash: hashToken(newRawToken),
        expiresAt: newExpiry,
      },
    });
    const marked = await tx.refreshToken.updateMany({
      where: { id: current.id, revokedAt: null },
      data: { revokedAt: now, replacedById: created.id, lastUsedAt: now },
    });
    if (marked.count !== 1) throw new Error("Refresh token was concurrently rotated.");
    await tx.authSession.update({
      where: { id: current.sessionId },
      data: { lastSeenAt: now, expiresAt: newExpiry, ipHash: metadata?.ipHash ?? current.session.ipHash, userAgent: metadata?.userAgent ?? current.session.userAgent },
    });
    return created;
  });

  return { rawToken: newRawToken, refreshTokenId: replacement.id, expiresAt: newExpiry, user: current.user };
}

export async function revokeRefreshToken(rawToken: string, reason: string) {
  const token = await prisma.refreshToken.findUnique({ where: { tokenHash: hashToken(rawToken) } });
  if (!token) return;
  const now = new Date();
  await prisma.$transaction([
    prisma.refreshToken.updateMany({ where: { familyId: token.familyId, revokedAt: null }, data: { revokedAt: now } }),
    prisma.authSession.updateMany({ where: { familyId: token.familyId, revokedAt: null }, data: { revokedAt: now, revokeReason: reason } }),
  ]);
}

export async function revokeSession(userId: string, sessionId: string, reason = "user_revoked") {
  const now = new Date();
  const session = await prisma.authSession.findFirst({ where: { id: sessionId, userId } });
  if (!session) return false;
  await prisma.$transaction([
    prisma.authSession.update({ where: { id: session.id }, data: { revokedAt: now, revokeReason: reason } }),
    prisma.refreshToken.updateMany({ where: { sessionId: session.id, revokedAt: null }, data: { revokedAt: now } }),
  ]);
  return true;
}

export async function revokeAllUserSessions(userId: string, reason: string, exceptSessionId?: string) {
  const now = new Date();
  const sessionFilter: Prisma.AuthSessionWhereInput = {
    userId,
    revokedAt: null,
    ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}),
  };
  const sessions = await prisma.authSession.findMany({ where: sessionFilter, select: { id: true } });
  if (!sessions.length) return;
  await prisma.$transaction([
    prisma.authSession.updateMany({ where: sessionFilter, data: { revokedAt: now, revokeReason: reason } }),
    prisma.refreshToken.updateMany({ where: { sessionId: { in: sessions.map((session) => session.id) }, revokedAt: null }, data: { revokedAt: now } }),
  ]);
}
