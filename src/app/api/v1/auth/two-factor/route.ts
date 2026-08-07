import { NextRequest } from "next/server";
import { z } from "zod";
import QRCode from "qrcode";
import { AuditAction } from "@prisma/client";
import { ApiError, fail, noContent, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser } from "@/lib/auth/rbac";
import { createRecoveryCodeHashes, createTwoFactorSecret, encryptSecret, verifyTotp } from "@/lib/auth/two-factor";
import { assertCsrf } from "@/lib/security/csrf";
import { verifyPassword } from "@/lib/security/password";
import { writeAuditLog } from "@/lib/audit";
import { requestMetadata } from "@/lib/security/request";

const confirmSchema = z.object({ action: z.literal("confirm"), code: z.string().regex(/^\d{6}$/) });
const disableSchema = z.object({ password: z.string().min(1).max(128) });

export async function POST(request: NextRequest) {
  try {
    assertCsrf(request);
    const user = await requireAuthenticatedUser();
    const credential = await prisma.twoFactorCredential.findUnique({ where: { userId: user.id } });
    if (credential?.isEnabled) throw new ApiError(409, "Two-factor authentication is already enabled.", "TWO_FACTOR_ALREADY_ENABLED");
    const setup = createTwoFactorSecret(user.email);
    await prisma.twoFactorCredential.upsert({ where: { userId: user.id }, create: { userId: user.id, encryptedSecret: encryptSecret(setup.secret), recoveryCodeHashes: [] }, update: { encryptedSecret: encryptSecret(setup.secret), isEnabled: false, enabledAt: null, recoveryCodeHashes: [] } });
    return ok({ otpauthUrl: setup.otpauthUrl, qrCodeDataUrl: await QRCode.toDataURL(setup.otpauthUrl, { margin: 1, width: 256 }) });
  } catch (error) { return fail(error); }
}

export async function PUT(request: NextRequest) {
  try {
    assertCsrf(request);
    const user = await requireAuthenticatedUser();
    const body = confirmSchema.parse(await request.json());
    const credential = await prisma.twoFactorCredential.findUnique({ where: { userId: user.id } });
    if (!credential || credential.isEnabled || !verifyTotp(credential.encryptedSecret, body.code)) throw new ApiError(400, "Invalid verification code.", "INVALID_TWO_FACTOR_CODE");
    const recovery = await createRecoveryCodeHashes();
    await prisma.twoFactorCredential.update({ where: { userId: user.id }, data: { isEnabled: true, enabledAt: new Date(), recoveryCodeHashes: recovery.hashes } });
    await writeAuditLog({ actorId: user.id, action: AuditAction.TWO_FACTOR_ENABLED, entityType: "User", entityId: user.id, ...requestMetadata(request) });
    return ok({ recoveryCodes: recovery.codes });
  } catch (error) { return fail(error); }
}

export async function DELETE(request: NextRequest) {
  try {
    assertCsrf(request);
    const user = await requireAuthenticatedUser();
    const { password } = disableSchema.parse(await request.json());
    if (!user.passwordHash || !(await verifyPassword(user.passwordHash, password))) throw new ApiError(400, "Password is incorrect.", "INVALID_CURRENT_PASSWORD");
    await prisma.twoFactorCredential.delete({ where: { userId: user.id } });
    await writeAuditLog({ actorId: user.id, action: AuditAction.TWO_FACTOR_DISABLED, entityType: "User", entityId: user.id, ...requestMetadata(request) });
    return noContent();
  } catch (error) { return fail(error); }
}
