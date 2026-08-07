import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser } from "@/lib/auth/rbac";
import { assertCsrf } from "@/lib/security/csrf";
import { revokeAllUserSessions } from "@/lib/auth/refresh-tokens";
import { writeAuditLog } from "@/lib/audit";
import { requestMetadata } from "@/lib/security/request";

export async function GET() {
  try {
    const user = await requireAuthenticatedUser();
    const sessions = await prisma.authSession.findMany({ where: { userId: user.id, revokedAt: null, expiresAt: { gt: new Date() } }, orderBy: { lastSeenAt: "desc" }, select: { id: true, userAgent: true, createdAt: true, lastSeenAt: true, expiresAt: true } });
    return ok(sessions);
  } catch (error) { return fail(error); }
}

export async function DELETE(request: NextRequest) {
  try {
    assertCsrf(request);
    const user = await requireAuthenticatedUser();
    await revokeAllUserSessions(user.id, "user_revoked_all_sessions");
    await writeAuditLog({ actorId: user.id, action: "SESSION_REVOKED", entityType: "User", entityId: user.id, ...requestMetadata(request) });
    return ok({ message: "All sessions have been revoked." });
  } catch (error) { return fail(error); }
}
