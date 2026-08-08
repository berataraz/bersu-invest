import { Prisma, PropertyInteractionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashSensitiveValue } from "@/lib/security/tokens";

type InteractionInput = { propertyId: string; type: PropertyInteractionType; visitorId: string; locale?: string; source?: string | null; deviceCategory?: string };

function metricDate(value = new Date()) {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
}

function counter(type: PropertyInteractionType): Prisma.PropertyAnalyticsUpdateInput {
  switch (type) {
    case "VIEW": return { views: { increment: 1 } };
    case "FAVORITE": return { saves: { increment: 1 } };
    case "CONTACT_SUBMITTED": return { enquiries: { increment: 1 } };
    case "WHATSAPP_CLICK": return { whatsappClicks: { increment: 1 } };
    case "PHONE_CLICK": return { phoneClicks: { increment: 1 } };
    case "SHARE": return { shareClicks: { increment: 1 } };
    case "MAP_INTERACTION": return { mapInteractions: { increment: 1 } };
    case "GALLERY_INTERACTION": return { galleryInteractions: { increment: 1 } };
    case "AI_IMPRESSION": return { aiImpressions: { increment: 1 } };
    case "AI_CLICK": return { aiClicks: { increment: 1 } };
  }
}

function createCounters(type: PropertyInteractionType) {
  const base = { views: 0, uniqueViews: 0, saves: 0, enquiries: 0, whatsappClicks: 0, phoneClicks: 0, shareClicks: 0, mapInteractions: 0, galleryInteractions: 0, aiImpressions: 0, aiClicks: 0 };
  if (type === "VIEW") base.views = 1;
  if (type === "FAVORITE") base.saves = 1;
  if (type === "CONTACT_SUBMITTED") base.enquiries = 1;
  if (type === "WHATSAPP_CLICK") base.whatsappClicks = 1;
  if (type === "PHONE_CLICK") base.phoneClicks = 1;
  if (type === "SHARE") base.shareClicks = 1;
  if (type === "MAP_INTERACTION") base.mapInteractions = 1;
  if (type === "GALLERY_INTERACTION") base.galleryInteractions = 1;
  if (type === "AI_IMPRESSION") base.aiImpressions = 1;
  if (type === "AI_CLICK") base.aiClicks = 1;
  return base;
}

export async function recordPropertyInteraction(input: InteractionInput) {
  const visitorHash = hashSensitiveValue(input.visitorId);
  const now = new Date();
  if (input.type === "VIEW") {
    const duplicate = await prisma.propertyInteractionEvent.findFirst({ where: { propertyId: input.propertyId, type: "VIEW", visitorHash, occurredAt: { gte: new Date(now.getTime() - 30 * 60 * 1_000) } }, select: { id: true } });
    if (duplicate) return { recorded: false };
  }
  const date = metricDate(now);
  await prisma.$transaction(async (tx) => {
    await tx.propertyInteractionEvent.create({ data: { propertyId: input.propertyId, type: input.type, visitorHash, locale: input.locale, source: input.source?.slice(0, 240) ?? null, deviceCategory: input.deviceCategory } });
    await tx.propertyAnalytics.upsert({ where: { propertyId_metricDate: { propertyId: input.propertyId, metricDate: date } }, create: { propertyId: input.propertyId, metricDate: date, ...createCounters(input.type) }, update: counter(input.type) });
    if (input.type === "VIEW") {
      const unique = await tx.propertyAnalyticsVisitor.createMany({ data: { propertyId: input.propertyId, metricDate: date, visitorHash }, skipDuplicates: true });
      if (unique.count) await tx.propertyAnalytics.update({ where: { propertyId_metricDate: { propertyId: input.propertyId, metricDate: date } }, data: { uniqueViews: { increment: 1 } } });
    }
  });
  return { recorded: true };
}

export async function propertyAnalyticsSummary(propertyId: string, days = 30) {
  const from = metricDate(new Date(Date.now() - (days - 1) * 86_400_000));
  const rows = await prisma.propertyAnalytics.findMany({ where: { propertyId, metricDate: { gte: from } }, orderBy: { metricDate: "asc" } });
  const totals = rows.reduce((sum, row) => ({ views: sum.views + row.views, uniqueViews: sum.uniqueViews + row.uniqueViews, leads: sum.leads + row.enquiries, whatsappClicks: sum.whatsappClicks + row.whatsappClicks, phoneClicks: sum.phoneClicks + row.phoneClicks }), { views: 0, uniqueViews: 0, leads: 0, whatsappClicks: 0, phoneClicks: 0 });
  return { totals, rows: rows.map((row) => ({ date: row.metricDate.toISOString().slice(0, 10), views: row.views, uniqueViews: row.uniqueViews, leads: row.enquiries, whatsappClicks: row.whatsappClicks, phoneClicks: row.phoneClicks })) };
}
