import { AiTask, Prisma } from "@prisma/client";
import { NextRequest } from "next/server";
import { z } from "zod";
import { ApiError, fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { assertTrustedOrigin } from "@/lib/security/csrf";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { hashSensitiveValue } from "@/lib/security/tokens";

const schema = z.object({
  conversationId: z.string().uuid(),
  firstName: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(5).max(40),
  email: z.string().trim().email().max(254).optional().or(z.literal("")),
  communicationPreference: z.enum(["PHONE", "WHATSAPP", "EMAIL"]).default("PHONE"),
  locale: z.string().trim().min(2).max(12),
  requirements: z.record(z.string(), z.unknown()).default({}),
  summary: z.string().trim().min(1).max(3_000),
  recommendedPropertyIds: z.array(z.string().uuid()).max(5).default([]),
});

export async function POST(request: NextRequest) {
  try {
    assertTrustedOrigin(request);
    const input = schema.parse(await request.json());
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "unknown";
    await enforceRateLimit("public-form", `${hashSensitiveValue(ip)}:${hashSensitiveValue(input.phone)}`);
    const conversation = await prisma.aiConversation.findFirst({ where: { id: input.conversationId, task: AiTask.VISITOR_CHAT, status: "ACTIVE", deletedAt: null }, select: { id: true, customerId: true } });
    if (!conversation) throw new ApiError(404, "Conversation not found.", "AI_CONVERSATION_NOT_FOUND");
    if (conversation.customerId) throw new ApiError(409, "This conversation has already been saved as a request.", "AI_LEAD_ALREADY_CREATED");

    const result = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.create({ data: {
        firstName: input.firstName,
        lastName: "-",
        phone: input.phone,
        email: input.email || null,
        preferredLocale: input.locale,
        consentAt: new Date(),
        customFields: { communicationPreference: input.communicationPreference, source: "AI_ASSISTANT" },
      } });
      const lead = await tx.lead.create({ data: {
        customerId: customer.id,
        source: "AI_ASSISTANT",
        title: "AI Asistan talebi",
        budgetMin: typeof input.requirements.minPrice === "number" ? input.requirements.minPrice : null,
        budgetMax: typeof input.requirements.maxPrice === "number" ? input.requirements.maxPrice : null,
        currencyCode: "TRY",
        customFields: { requirements: input.requirements as Prisma.InputJsonValue, conversationSummary: input.summary, recommendedPropertyIds: input.recommendedPropertyIds, language: input.locale, leadSource: "AI Assistant", communicationPreference: input.communicationPreference },
      } });
      await tx.aiConversation.update({ where: { id: conversation.id }, data: { customerId: customer.id, metadata: { leadId: lead.id, source: "AI_ASSISTANT" } } });
      await tx.timelineEvent.create({ data: { customerId: customer.id, leadId: lead.id, type: "AI_ASSISTANT_REQUEST", label: "AI Asistan üzerinden yeni gayrimenkul talebi", metadata: { conversationId: conversation.id } } });
      return { customerId: customer.id, leadId: lead.id };
    });
    return ok(result, 201);
  } catch (error) { return fail(error); }
}
