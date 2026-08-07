import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, noContent, ok, ApiError } from "@/lib/http";
import { requirePermission } from "@/lib/auth/rbac";
import { assertCsrf } from "@/lib/security/csrf";
import { managedUserUpdateSchema } from "@/modules/admin/admin.schemas";
import { hashPassword } from "@/lib/security/password";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { requestMetadata } from "@/lib/security/request";

const paramsSchema = z.object({ id: z.string().uuid() });

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    assertCsrf(request);
    const actor = await requirePermission("users.manage");
    const { id } = paramsSchema.parse(await context.params);
    const input = managedUserUpdateSchema.parse(await request.json());
    const current = await prisma.user.findFirst({ where: { id, deletedAt: null }, select: { id: true, email: true } });
    if (!current) throw new ApiError(404, "Kullanıcı bulunamadı.", "USER_NOT_FOUND");
    if (input.email && input.email !== current.email) {
      const duplicate = await prisma.user.findUnique({ where: { email: input.email }, select: { id: true } });
      if (duplicate) throw new ApiError(409, "Bu e-posta adresi zaten kullanılıyor.", "DUPLICATE_EMAIL");
    }
    const { roleKey, password, ...data } = input;
    const user = await prisma.$transaction(async (tx) => {
      if (roleKey) {
        const role = await tx.role.findFirst({ where: { key: roleKey, deletedAt: null }, select: { id: true } });
        if (!role) throw new ApiError(400, "Seçilen rol bulunamadı.", "ROLE_NOT_FOUND");
        await tx.userRole.deleteMany({ where: { userId: id } });
        await tx.userRole.create({ data: { userId: id, roleId: role.id, assignedById: actor.id } });
      }
      return tx.user.update({ where: { id }, data: { ...data, ...(password ? { passwordHash: await hashPassword(password), mustChangePassword: true } : {}), ...(data.status && data.status !== "ACTIVE" ? { lockedUntil: null, failedLoginCount: 0 } : {}) } });
    });
    await writeAuditLog({ actorId: actor.id, action: "UPDATE", entityType: "User", entityId: id, after: { email: user.email, role: roleKey, status: user.status }, ...requestMetadata(request) });
    return ok({ id: user.id });
  } catch (error) { return fail(error); }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    assertCsrf(request);
    const actor = await requirePermission("users.manage");
    const { id } = paramsSchema.parse(await context.params);
    if (id === actor.id) throw new ApiError(400, "Kendi hesabınızı arşivleyemezsiniz.", "SELF_ARCHIVE_FORBIDDEN");
    await prisma.user.update({ where: { id }, data: { status: "ARCHIVED", deletedAt: new Date() } });
    await writeAuditLog({ actorId: actor.id, action: "DELETE", entityType: "User", entityId: id, ...requestMetadata(request) });
    return noContent();
  } catch (error) { return fail(error); }
}
