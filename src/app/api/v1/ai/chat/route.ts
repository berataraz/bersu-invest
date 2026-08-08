import { AiMessageRole, AiTask } from "@prisma/client";
import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { fail, ok } from "@/lib/http";
import { assertCsrf } from "@/lib/security/csrf";
import { requestMetadata } from "@/lib/security/request";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { aiService, parseAiJson } from "@/modules/ai/ai.service";
import { chatInputSchema, chatOutputSchema } from "@/modules/ai/ai.schemas";
import { appendConversationMessage, getConversationMessages, resolveConversation } from "@/modules/ai/conversation.manager";
import { findPublicAssistantProperties, findPublicRegionKnowledge, interpretPublicAssistantMessage, publicAssistantFallback } from "@/modules/ai/public-assistant.service";

export async function POST(request: NextRequest) {
  try {
    assertCsrf(request);
    const input = chatInputSchema.parse(await request.json());
    const session = await auth();
    const userId = session?.user?.id ?? null;
    await enforceRateLimit("ai", userId ?? requestMetadata(request).ipHash);
    const conversation = await resolveConversation({ conversationId: input.conversationId, task: AiTask.VISITOR_CHAT, locale: input.locale, userId, title: input.message.slice(0, 100) });
    await appendConversationMessage({ conversationId: conversation.id, role: AiMessageRole.USER, content: input.message });
    const interpreted = interpretPublicAssistantMessage(input.message);
    const canSearchProperties = ["BUY_PROPERTY", "RENT_PROPERTY", "INVESTMENT", "PROPERTY_COMPARISON"].includes(interpreted.intent);
    const [recommendations, regions] = await Promise.all([canSearchProperties ? findPublicAssistantProperties(interpreted.filters) : Promise.resolve([]), ["REGION_RESEARCH", "PROPERTY_COMPARISON"].includes(interpreted.intent) ? findPublicRegionKnowledge(input.message, input.locale) : Promise.resolve([])]);
    const fallback = await publicAssistantFallback({ locale: input.locale, intent: interpreted.intent, matches: recommendations, regions });
    let answer = fallback.answer;
    let meta: { requestId?: string; provider?: string; fallback: boolean } = { fallback: true };

    // The provider may improve phrasing, but it can never select or create listings. Search results always come from the database query above.
    try {
      const history = await getConversationMessages(conversation.id);
      const response = await aiService.generate({ task: AiTask.VISITOR_CHAT, locale: input.locale, variables: { locale: input.locale, catalog: JSON.stringify(recommendations) }, messages: history, userId, conversationId: conversation.id, responseFormat: "json", maxOutputTokens: 700 });
      const parsed = parseAiJson(response.content, (value) => chatOutputSchema.parse(value));
      answer = parsed.answer;
      meta = { requestId: response.requestId, provider: response.provider, fallback: false };
      await appendConversationMessage({ conversationId: conversation.id, role: AiMessageRole.ASSISTANT, content: answer, provider: response.provider, model: response.model, promptTemplateId: response.promptTemplateId, metadata: { intent: interpreted.intent, filters: interpreted.filters, recommendedPropertyIds: recommendations.map((property) => property.id), requestId: response.requestId } });
    } catch {
      // An unavailable provider must not make the published inventory search unavailable to visitors.
      await appendConversationMessage({ conversationId: conversation.id, role: AiMessageRole.ASSISTANT, content: answer, metadata: { intent: interpreted.intent, filters: interpreted.filters, recommendedPropertyIds: recommendations.map((property) => property.id), providerFallback: true } });
    }
    return ok({ conversationId: conversation.id, answer, recommendations, intent: interpreted.intent, filters: interpreted.filters, needsLead: fallback.needsLead, meta });
  } catch (error) { return fail(error); }
}
