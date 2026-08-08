import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireDashboardPermission } from "@/lib/auth/dashboard-access";
import { PropertyEditor } from "@/components/admin/property-editor";
import { PropertyAnalyticsPanel } from "@/components/admin/property-analytics-panel";
import { propertyAnalyticsSummary } from "@/modules/properties/property-analytics.service";

export default async function PropertyEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireDashboardPermission("properties.read");
  const { id } = await params;
  const [property, types, agents, analytics] = await Promise.all([prisma.property.findFirst({ where: { id, deletedAt: null }, include: { media: { where: { deletedAt: null }, orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }] } } }), prisma.propertyType.findMany({ where: { isActive: true, deletedAt: null }, orderBy: { position: "asc" }, select: { id: true, name: true } }), prisma.user.findMany({ where: { deletedAt: null, status: "ACTIVE", roles: { some: { role: { key: { in: ["AGENT", "MANAGER", "SUPER_ADMIN"] } } } } }, orderBy: [{ displayOrder: "asc" }, { firstName: "asc" }], select: { id: true, firstName: true, lastName: true, jobTitle: true } }), propertyAnalyticsSummary(id)]);
  if (!property) notFound();
  const serializable = { ...property, price: property.price ? Number(property.price) : null, latitude: property.latitude ? Number(property.latitude) : null, longitude: property.longitude ? Number(property.longitude) : null, grossAreaM2: property.grossAreaM2 ? Number(property.grossAreaM2) : null, netAreaM2: property.netAreaM2 ? Number(property.netAreaM2) : null, details: property.details as Record<string, unknown> | null };
  return <><PropertyEditor property={serializable} types={types} agents={agents} /><PropertyAnalyticsPanel summary={analytics} /></>;
}
