import { cache } from "react";
import { auth } from "@/auth";
import { ApiError } from "@/lib/http";
import { prisma } from "@/lib/prisma";

const activeAt = new Date();

export const getEffectivePermissions = cache(async (userId: string) => {
  const user = await prisma.user.findFirst({
    where: { id: userId, status: "ACTIVE", deletedAt: null },
    select: {
      roles: {
        where: { OR: [{ expiresAt: null }, { expiresAt: { gt: activeAt } }] },
        select: { role: { select: { key: true, permissions: { select: { permission: { select: { key: true } } } } } } },
      },
      permissionOverrides: {
        where: { OR: [{ expiresAt: null }, { expiresAt: { gt: activeAt } }] },
        select: { effect: true, permission: { select: { key: true } } },
      },
    },
  });
  if (!user) return { exists: false, isSuperAdmin: false, permissions: new Set<string>() };
  const isSuperAdmin = user.roles.some(({ role }) => role.key === "SUPER_ADMIN");
  const permissions = new Set(user.roles.flatMap(({ role }) => role.permissions.map(({ permission }) => permission.key)));
  for (const override of user.permissionOverrides) {
    if (override.effect === "DENY") permissions.delete(override.permission.key);
    else permissions.add(override.permission.key);
  }
  return { exists: true, isSuperAdmin, permissions };
});

export async function hasPermission(userId: string, permission: string) {
  const effective = await getEffectivePermissions(userId);
  return effective.exists && (effective.isSuperAdmin || effective.permissions.has(permission));
}

export async function requireAuthenticatedUser() {
  const session = await auth();
  if (!session?.user?.id || session.error === "RefreshAccessTokenError") throw new ApiError(401, "Authentication is required.", "UNAUTHENTICATED");
  const user = await prisma.user.findFirst({ where: { id: session.user.id, status: "ACTIVE", deletedAt: null } });
  if (!user) throw new ApiError(401, "Authentication is required.", "UNAUTHENTICATED");
  return user;
}

export async function requirePermission(permission: string) {
  const user = await requireAuthenticatedUser();
  if (!(await hasPermission(user.id, permission))) throw new ApiError(403, "You do not have permission to perform this action.", "FORBIDDEN");
  return user;
}
