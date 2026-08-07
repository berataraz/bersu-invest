import { PropertyStatus } from "@prisma/client";
import { ApiError } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function propertyGenerationContext(propertyId: string) {
  const property = await prisma.property.findFirst({ where: { id: propertyId, deletedAt: null }, include: { type: { select: { name: true, key: true } }, features: { include: { feature: { select: { name: true, key: true } } } } } });
  if (!property) throw new ApiError(404, "Property not found.", "PROPERTY_NOT_FOUND");
  return {
    id: property.id, propertyId: property.propertyId, title: property.title, summary: property.summary, description: property.description,
    listingType: property.listingType, type: property.type.name, price: property.price?.toString() ?? null, currencyCode: property.currencyCode,
    city: property.city, district: property.district, neighborhood: property.neighborhood, grossAreaM2: property.grossAreaM2?.toString() ?? null,
    netAreaM2: property.netAreaM2?.toString() ?? null, bedrooms: property.bedrooms, bathrooms: property.bathrooms, floors: property.floors,
    features: property.features.map(({ feature, valueText, valueNumber, valueBool }) => ({ key: feature.key, name: feature.name, value: valueText ?? valueNumber?.toString() ?? valueBool ?? null })),
  };
}

export async function visitorPropertyCatalog() {
  const properties = await prisma.property.findMany({ where: { status: PropertyStatus.PUBLISHED, deletedAt: null }, orderBy: [{ featured: "desc" }, { publishedAt: "desc" }], take: 40, select: { id: true, propertyId: true, title: true, listingType: true, price: true, currencyCode: true, city: true, district: true, neighborhood: true, bedrooms: true, bathrooms: true, grossAreaM2: true, type: { select: { name: true } }, media: { where: { deletedAt: null, isPublic: true }, orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }], take: 1, select: { url: true } } } });
  return properties.map((property) => ({ ...property, price: property.price?.toString() ?? null, grossAreaM2: property.grossAreaM2?.toString() ?? null, coverImage: property.media[0]?.url ?? null, media: undefined }));
}

export async function adminAnalysisContext(analysis: "report" | "market_trends" | "agent_comparison" | "property_performance") {
  const since = new Date(Date.now() - 180 * 24 * 60 * 60 * 1_000);
  const [propertyStatus, analytics, agentPortfolio, leadStatus] = await Promise.all([
    prisma.property.groupBy({ by: ["status", "listingType"], where: { deletedAt: null }, _count: { _all: true }, _avg: { price: true } }),
    prisma.propertyAnalytics.aggregate({ where: { metricDate: { gte: since } }, _sum: { views: true, saves: true, enquiries: true }, _avg: { views: true, saves: true, enquiries: true } }),
    prisma.property.groupBy({ by: ["createdById"], where: { deletedAt: null, createdById: { not: null } }, _count: { _all: true } }),
    prisma.lead.groupBy({ by: ["status"], where: { deletedAt: null, createdAt: { gte: since } }, _count: { _all: true } }),
  ]);
  const userIds = agentPortfolio.map((row) => row.createdById).filter((id): id is string => Boolean(id));
  const users = userIds.length ? await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, firstName: true, lastName: true } }) : [];
  return { analysis, periodStart: since.toISOString(), propertyStatus: propertyStatus.map((row) => ({ ...row, _avg: { price: row._avg.price?.toString() ?? null } })), analytics, agentPortfolio: agentPortfolio.map((row) => ({ agent: users.find((user) => user.id === row.createdById) ? `${users.find((user) => user.id === row.createdById)?.firstName} ${users.find((user) => user.id === row.createdById)?.lastName}` : "Unassigned", properties: row._count._all })), leadStatus: leadStatus.map((row) => ({ status: row.status, count: row._count._all })) };
}

export async function customerCrmContext(customerId: string) {
  const customer = await prisma.customer.findFirst({ where: { id: customerId, deletedAt: null }, include: { owner: { select: { firstName: true, lastName: true } }, notes: { where: { deletedAt: null }, orderBy: { createdAt: "desc" }, take: 20, select: { body: true, createdAt: true } }, leads: { where: { deletedAt: null }, include: { property: { select: { propertyId: true, title: true } }, activities: { orderBy: { occurredAt: "desc" }, take: 10, select: { type: true, subject: true, body: true, occurredAt: true } }, followUps: { where: { deletedAt: null }, orderBy: { dueAt: "asc" }, take: 10, select: { dueAt: true, completedAt: true, note: true } } }, orderBy: { updatedAt: "desc" }, take: 20 }, appointments: { where: { deletedAt: null }, orderBy: { startsAt: "desc" }, take: 10, select: { title: true, status: true, startsAt: true, outcome: true } } } });
  if (!customer) throw new ApiError(404, "Customer not found.", "CUSTOMER_NOT_FOUND");
  if (!customer.consentAt) throw new ApiError(409, "AI processing requires recorded customer consent.", "AI_CONSENT_REQUIRED");
  return customer;
}
