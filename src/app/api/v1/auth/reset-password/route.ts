import { z } from "zod";
import { NextRequest } from "next/server";
import { AuditAction } from "@prisma/client";
import { fail, ok, ApiError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/security/password";
import { assertCsrf } from "@/lib/security/csrf";
import { hashToken } from "@/lib/security/tokens";
import { revokeAllUserSessions } from "@/lib/auth/refresh-tokens";
import { writeAuditLog } from "@/lib/audit";
import { requestMetadata } from "@/lib/security/request";

const bodySchema = z.object({ token: z.string().min(32).max(512), password: z.string().min(12).max(128) });

export async function POST(request: NextRequest) {
  try {
    assertCsrf(request);
    const body = bodySchema.parse(await request.json());
    const reset = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashToken(body.token) } });
    if (!reset || reset.usedAt || reset.expiresAt <= new Date()) throw new ApiError(400, "This reset link is invalid or has expired.", "INVALID_RESET_TOKEN");
    const passwordHash = await hashPassword(body.password);
    await prisma.$transaction([
      prisma.user.update({ where: { id: reset.userId }, data: { passwordHash, failedLoginCount: 0, lockedUntil: null } }),
      prisma.passwordResetToken.update({ where: { id: reset.id }, data: { usedAt: new Date() } }),
      prisma.passwordResetToken.updateMany({ where: { userId: reset.userId, usedAt: null }, data: { usedAt: new Date() } }),
    ]);
    await revokeAllUserSessions(reset.userId, "password_reset");
    await writeAuditLog({ actorId: reset.userId, action: AuditAction.PASSWORD_RESET_COMPLETED, entityType: "User", entityId: reset.userId, ...requestMetadata(request) });
    return ok({ message: "Password reset successfully." });
  } catch (error) { return fail(error); }
}
