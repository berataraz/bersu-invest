import { z } from "zod";
import { NextRequest } from "next/server";
import { AuditAction } from "@prisma/client";
import { ApiError, fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { assertCsrf } from "@/lib/security/csrf";
import { hashToken } from "@/lib/security/tokens";
import { requestMetadata } from "@/lib/security/request";
import { writeAuditLog } from "@/lib/audit";

const bodySchema = z.object({ token: z.string().min(32).max(512) });

export async function POST(request: NextRequest) {
  try {
    assertCsrf(request);
    const { token } = bodySchema.parse(await request.json());
    const verification = await prisma.emailVerificationToken.findUnique({ where: { tokenHash: hashToken(token) } });
    if (!verification || verification.usedAt || verification.expiresAt <= new Date()) throw new ApiError(400, "This verification link is invalid or has expired.", "INVALID_VERIFICATION_TOKEN");
    await prisma.$transaction([
      prisma.user.update({ where: { id: verification.userId }, data: { emailVerified: new Date(), status: "ACTIVE" } }),
      prisma.emailVerificationToken.update({ where: { id: verification.id }, data: { usedAt: new Date() } }),
    ]);
    await writeAuditLog({ actorId: verification.userId, action: AuditAction.EMAIL_VERIFIED, entityType: "User", entityId: verification.userId, ...requestMetadata(request) });
    return ok({ message: "Email verified successfully." });
  } catch (error) { return fail(error); }
}
