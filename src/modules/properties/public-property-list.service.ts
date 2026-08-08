import { type ListingType } from "@prisma/client";
import { siteImages } from "@/features/public-site/content";
import { listProperties } from "@/modules/properties/property.service";
import { type propertyQuerySchema } from "@/modules/properties/property.schemas";
import { type z } from "zod";
import { unstable_cache } from "next/cache";
import { PUBLIC_PROPERTIES_CACHE_TAG } from "@/modules/properties/public-property-cache";

type PropertyQuery = z.infer<typeof propertyQuerySchema>;
export type PublicProperty = { slug: string; image: string; title: string; area: string; city: string; district: string | null; type: string; typeKey: string; listingType: ListingType; beds: number; baths: number; areaM2: number; price: string; priceValue: number; tag: string };

function formatPrice(price: number) { return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(price); }
function databaseIsUnavailable(error: unknown) {
  return typeof error === "object" && error !== null && (("code" in error && error.code === "P1001") || ("name" in error && error.name === "PrismaClientInitializationError"));
}

async function listPublicPropertiesFromDatabase(query: PropertyQuery): Promise<{ items: PublicProperty[]; source: "database" | "development-fallback" }> {
  try { const result = await listProperties({ ...query, status: "PUBLISHED" }); return { source: "database", items: result.items.map((property) => ({ slug: property.slug, image: property.media[0]?.url ?? siteImages.pool, title: property.title, area: [property.neighborhood, property.district, property.city].filter(Boolean).join(", "), city: property.city, district: property.district, type: property.type.name, typeKey: property.type.key, listingType: property.listingType, beds: property.bedrooms ?? 0, baths: property.bathrooms ?? 0, areaM2: Number(property.grossAreaM2 ?? 0), price: property.price ? formatPrice(Number(property.price)) : "Fiyat talep üzerine", priceValue: Number(property.price ?? 0), tag: property.featured ? "Öne çıkan" : "İlan" })) }; } catch (error) { if (!databaseIsUnavailable(error)) throw error; return { source: "database", items: [] }; }
}

const cachedPublicProperties = unstable_cache(listPublicPropertiesFromDatabase, ["public-property-list"], { revalidate: 60, tags: [PUBLIC_PROPERTIES_CACHE_TAG] });

export async function listPublicProperties(query: PropertyQuery) {
  return cachedPublicProperties(query);
}
