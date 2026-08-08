import { NextRequest } from "next/server";
import { z } from "zod";
import { assertTrustedOrigin } from "@/lib/security/csrf";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { fail, ok } from "@/lib/http";
import { hashSensitiveValue } from "@/lib/security/tokens";
import { prisma } from "@/lib/prisma";
import { recordPropertyInteraction } from "@/modules/properties/property-analytics.service";

const schema = z.object({ firstName: z.string().trim().min(1).max(80), lastName: z.string().trim().max(80).optional(), email: z.string().trim().email().max(254), phone: z.string().trim().min(5).max(40).optional(), message: z.string().trim().min(10).max(5_000), intent: z.enum(["CONTACT", "BUY", "SELL"]).default("CONTACT"), locale: z.string().trim().min(2).max(12).default("tr"), propertySlug: z.string().trim().max(120).optional() });

export async function POST(request: NextRequest) {
  try {
    assertTrustedOrigin(request);
    const input = schema.parse(await request.json());
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "unknown";
    await enforceRateLimit("public-form", `${hashSensitiveValue(ip)}:${hashSensitiveValue(input.email.toLowerCase())}`);
    const property = input.propertySlug ? await prisma.property.findFirst({ where: { slug: input.propertySlug, status: "PUBLISHED", deletedAt: null }, select: { id: true } }) : null;
    const customer = await prisma.$transaction(async (tx) => {
      const created = await tx.customer.create({ data: { firstName: input.firstName, lastName: input.lastName?.trim() || "-", email: input.email, phone: input.phone ?? null, preferredLocale: input.locale, customFields: { requestIntent: input.intent, message: input.message } } });
      await tx.lead.create({ data: { customerId: created.id, propertyId: property?.id ?? null, source: "WEBSITE", title: input.intent === "SELL" ? "Satış talebi" : input.intent === "BUY" ? "Mülk talebi" : "İletişim talebi", customFields: { message: input.message, requestIntent: input.intent, locale: input.locale } } });
      await tx.timelineEvent.create({ data: { customerId: created.id, type: "WEBSITE_REQUEST", label: "Web sitesi üzerinden yeni talep" } });
      return created;
    });
    if (property) {
      try {
        await recordPropertyInteraction({ propertyId: property.id, type: "CONTACT_SUBMITTED", visitorId: `${ip}:${input.email.toLowerCase()}`, locale: input.locale, source: "contact-form" });
      } catch (error) {
        // Analytics cannot invalidate a request already persisted to CRM.
        console.error("Property interaction was not recorded", error);
      }
    }
    return ok({ id: customer.id }, 201);
  } catch (error) { return fail(error); }
}
