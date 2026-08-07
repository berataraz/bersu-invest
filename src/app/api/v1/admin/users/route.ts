import { NextRequest } from "next/server";
import { fail, ok, ApiError } from "@/lib/http";
import { requirePermission } from "@/lib/auth/rbac";
import { assertCsrf } from "@/lib/security/csrf";
import { managedUserInputSchema } from "@/modules/admin/admin.schemas";
import { hashPassword } from "@/lib/security/password";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { requestMetadata } from "@/lib/security/request";

export async function GET(request: NextRequest) {
  try {
    await requirePermission("users.read");
    const role = request.nextUrl.searchParams.get("role")?.trim();
    const q = request.nextUrl.searchParams.get("q")?.trim();
    const items = await prisma.user.findMany({
      where: {
        deletedAt: null,
        ...(role ? { roles: { some: { role: { key: role } } } } : {}),
        ...(q ? { OR: [{ firstName: { contains: q, mode: "insensitive" } }, { lastName: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] } : {}),
      },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, whatsapp: true, jobTitle: true, biography: true, image: true, preferredLocales: true, socialLinks: true, displayOrder: true, status: true, mustChangePassword: true, lastLoginAt: true, createdAt: true, roles: { select: { role: { select: { key: true, name: true } } } }, _count: { select: { propertiesAssigned: true } } },
    });
    return ok(items);
  } catch (error) { return fail(error); }
}

export async function POST(request: NextRequest) {
  try {
    assertCsrf(request);
    const actor = await requirePermission("users.manage");
    const input = managedUserInputSchema.parse(await request.json());
    if (!input.password) throw new ApiError(400, "Yeni kullanıcı için güvenli bir parola gereklidir.", "PASSWORD_REQUIRED");
    const role = await prisma.role.findFirst({ where: { key: input.roleKey, deletedAt: null }, select: { id: true } });
    if (!role) throw new ApiError(400, "Seçilen rol bulunamadı.", "ROLE_NOT_FOUND");
    const existing = await prisma.user.findUnique({ where: { email: input.email }, select: { id: true } });
    if (existing) throw new ApiError(409, "Bu e-posta adresi zaten kullanılıyor.", "DUPLICATE_EMAIL");
    const { roleKey: _roleKey, password, ...data } = input;
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({ data: { ...data, passwordHash: await hashPassword(password), mustChangePassword: input.mustChangePassword } });
      await tx.userRole.create({ data: { userId: created.id, roleId: role.id, assignedById: actor.id } });
      return created;
    });
    await writeAuditLog({ actorId: actor.id, action: "CREATE", entityType: "User", entityId: user.id, after: { email: user.email, role: input.roleKey, status: user.status }, ...requestMetadata(request) });
    return ok({ id: user.id }, 201);
  } catch (error) { return fail(error); }
}
