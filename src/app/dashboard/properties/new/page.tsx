import { prisma } from "@/lib/prisma";
import { requireDashboardPermission } from "@/lib/auth/dashboard-access";
import { PropertyEditor } from "@/components/admin/property-editor";

export default async function NewPropertyPage() {
  await requireDashboardPermission("properties.create");
  const [types, agents] = await Promise.all([prisma.propertyType.findMany({ where: { isActive: true, deletedAt: null }, orderBy: { position: "asc" }, select: { id: true, name: true } }), prisma.user.findMany({ where: { deletedAt: null, status: "ACTIVE", roles: { some: { role: { key: { in: ["AGENT", "MANAGER", "SUPER_ADMIN"] } } } } }, orderBy: [{ displayOrder: "asc" }, { firstName: "asc" }], select: { id: true, firstName: true, lastName: true, jobTitle: true } })]);
  return <PropertyEditor types={types} agents={agents} />;
}
