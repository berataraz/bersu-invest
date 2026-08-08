import { PropertyStatus } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { PUBLIC_PROPERTIES_CACHE_TAG } from "@/modules/properties/public-property-cache";

const cachedPublicPropertyBySlug = unstable_cache(async (slug: string) => {
  return prisma.property.findFirst({
    where: { slug, status: PropertyStatus.PUBLISHED, deletedAt: null },
    include: {
      type: { select: { name: true } },
      media: { where: { deletedAt: null, isPublic: true }, orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }] },
      assignedAgent: { select: { firstName: true, lastName: true, phone: true, whatsapp: true, jobTitle: true, image: true } },
    },
  });
}, ["public-property-detail"], { revalidate: 60, tags: [PUBLIC_PROPERTIES_CACHE_TAG] });

export async function getPublicPropertyBySlug(slug: string) {
  return cachedPublicPropertyBySlug(slug);
}
