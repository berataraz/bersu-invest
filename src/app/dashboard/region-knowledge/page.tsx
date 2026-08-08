import { RegionKnowledgeEditor } from "@/components/admin/region-knowledge-editor";
import { requireDashboardPermission } from "@/lib/auth/dashboard-access";
import { prisma } from "@/lib/prisma";

export default async function RegionKnowledgePage() {
  await requireDashboardPermission("content.manage");
  const regions = await prisma.regionKnowledge.findMany({ where: { deletedAt: null }, orderBy: { sortOrder: "asc" }, select: { slug: true, isPublished: true, sortOrder: true, content: true } });
  const localeContent = (content: unknown) => (["tr", "en", "de", "ru"] as const).reduce((result, locale) => ({ ...result, [locale]: ((content as Record<string, Record<string, string>>)?.[locale] ?? {}) }), {} as Record<"tr" | "en" | "de" | "ru", Record<string, string>>);
  return <RegionKnowledgeEditor initialRegions={regions.map((region) => ({ ...region, content: localeContent(region.content) }))} />;
}
