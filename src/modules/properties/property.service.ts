import { Prisma, PropertyStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/http";
import { type z } from "zod";
import { propertyInputSchema, propertyQuerySchema } from "@/modules/properties/property.schemas";
import { revalidatePublicPropertyCache } from "@/modules/properties/public-property-cache";

type PropertyInput = z.infer<typeof propertyInputSchema>;
type PropertyQuery = z.infer<typeof propertyQuerySchema>;

function slugify(value: string) { return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/ı/g, "i").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 90); }
async function uniqueSlug(title: string, excludedId?: string) { const base = slugify(title) || "gayrimenkul"; for (let suffix = 0; suffix < 100; suffix += 1) { const candidate = suffix ? `${base}-${suffix + 1}` : base; const found = await prisma.property.findFirst({ where: { slug: candidate, ...(excludedId ? { id: { not: excludedId } } : {}) }, select: { id: true } }); if (!found) return candidate; } return `${base}-${crypto.randomUUID().slice(0, 8)}`; }
async function automaticPropertyId() { const year = new Date().getFullYear(); const prefix = `BRS-${year}-`; const latest = await prisma.property.findFirst({ where: { propertyId: { startsWith: prefix } }, orderBy: { propertyId: "desc" }, select: { propertyId: true } }); const sequence = latest ? Number(latest.propertyId.slice(prefix.length)) + 1 : 1; return `${prefix}${String(sequence).padStart(5, "0")}`; }

export async function listProperties(query: PropertyQuery) {
  const where: Prisma.PropertyWhereInput = { deletedAt: null, ...(query.status ? { status: query.status } : {}), ...(query.listingType ? { listingType: query.listingType } : {}), ...(query.typeId ? { typeId: query.typeId } : {}), ...(query.propertyType ? { type: { key: query.propertyType } } : {}), ...(query.city ? { city: { equals: query.city, mode: "insensitive" } } : {}), ...(query.district ? { district: { equals: query.district, mode: "insensitive" } } : {}), ...(query.bedrooms !== undefined ? { bedrooms: { gte: query.bedrooms } } : {}), ...(query.minPrice !== undefined || query.maxPrice !== undefined ? { price: { ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}), ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}) } } : {}), ...(query.minArea !== undefined ? { grossAreaM2: { gte: query.minArea } } : {}), ...(query.q ? { OR: [{ title: { contains: query.q, mode: "insensitive" } }, { city: { contains: query.q, mode: "insensitive" } }, { district: { contains: query.q, mode: "insensitive" } }, { propertyId: { contains: query.q, mode: "insensitive" } }] } : {}) };
  const orderBy: Prisma.PropertyOrderByWithRelationInput = query.sort === "price_asc" ? { price: "asc" } : query.sort === "price_desc" ? { price: "desc" } : query.sort === "area_desc" ? { grossAreaM2: "desc" } : { createdAt: "desc" };
  const items = await prisma.property.findMany({ where, orderBy, take: query.limit + 1, ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}), include: { type: true, media: { where: { deletedAt: null }, orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }], take: 1 }, _count: { select: { leads: true, appointments: true } } } });
  const hasNextPage = items.length > query.limit; const results = hasNextPage ? items.slice(0, -1) : items;
  return { items: results, pageInfo: { hasNextPage, endCursor: results.at(-1)?.id ?? null } };
}

export async function createProperty(input: PropertyInput, actorId: string) {
  const status = input.status ?? PropertyStatus.DRAFT;
  const propertyId = input.propertyId ?? await automaticPropertyId();
  const exists = await prisma.property.findUnique({ where: { propertyId }, select: { id: true } });
  if (exists) throw new ApiError(409, "Bu ilan numarası zaten kullanılıyor.", "DUPLICATE_PROPERTY_ID");
  const slug = await uniqueSlug(input.title);
  const { propertyId: _ignoredPropertyId, ...data } = input;
  const property = await prisma.property.create({ data: { ...data, propertyId, slug, status, createdById: actorId, updatedById: actorId, publishedAt: status === PropertyStatus.PUBLISHED ? new Date() : null, searchVector: [input.title, input.city, input.district, input.neighborhood].filter(Boolean).join(" ") } });
  revalidatePublicPropertyCache();
  return property;
}

export async function updateProperty(id: string, input: Partial<PropertyInput>, actorId: string) {
  const current = await prisma.property.findFirstOrThrow({ where: { id, deletedAt: null } }); const status = input.status ?? current.status; const title = input.title ?? current.title;
  if (input.propertyId && input.propertyId !== current.propertyId) {
    const duplicate = await prisma.property.findUnique({ where: { propertyId: input.propertyId }, select: { id: true } });
    if (duplicate) throw new ApiError(409, "Bu ilan numarası zaten kullanılıyor.", "DUPLICATE_PROPERTY_ID");
  }
  const property = await prisma.property.update({ where: { id }, data: { ...input, slug: title !== current.title ? await uniqueSlug(title, id) : undefined, updatedById: actorId, publishedAt: status === PropertyStatus.PUBLISHED && current.status !== PropertyStatus.PUBLISHED ? new Date() : undefined, soldAt: status === PropertyStatus.SOLD && current.status !== PropertyStatus.SOLD ? new Date() : undefined, rentedAt: status === PropertyStatus.RENTED && current.status !== PropertyStatus.RENTED ? new Date() : undefined, searchVector: [title, input.city ?? current.city, input.district ?? current.district, input.neighborhood ?? current.neighborhood].filter(Boolean).join(" ") } });
  revalidatePublicPropertyCache();
  return property;
}
