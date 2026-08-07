import { NextRequest } from "next/server";
import { z } from "zod";
import { AuditAction } from "@prisma/client";
import { ApiError, fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser } from "@/lib/auth/rbac";
import { assertCsrf } from "@/lib/security/csrf";
import { hashPassword, verifyPassword } from "@/lib/security/password";
import { revokeAllUserSessions } from "@/lib/auth/refresh-tokens";
import { writeAuditLog } from "@/lib/audit";
import { requestMetadata } from "@/lib/security/request";

const bodySchema = z.object({ currentPassword: z.string().min(1).max(128), newPassword: z.string().min(12).max(128) });

export async function POST(request: NextRequest) {
  try {
    assertCsrf(request);
    const user = await requireAuthenticatedUser();
    const body = bodySchema.parse(await request.json());
    if (!user.passwordHash || !(await verifyPassword(user.passwordHash, body.currentPassword))) throw new ApiError(400, "Current password is incorrect.", "INVALID_CURRENT_PASSWORD");
    const passwordHash = await hashPassword(body.newPassword);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash, mustChangePassword: false } });
    await revokeAllUserSessions(user.id, "password_changed");
    await writeAuditLog({ actorId: user.id, action: AuditAction.PASSWORD_CHANGED, entityType: "User", entityId: user.id, ...requestMetadata(request) });
    return ok({ message: "Password changed. Please sign in again." });
  } catch (error) { return fail(error); }
}
