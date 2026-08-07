import { AiMessageRole, AiTask } from "@prisma/client";
import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { fail, ok } from "@/lib/http";
import { assertCsrf } from "@/lib/security/csrf";
import { requestMetadata } from "@/lib/security/request";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { aiService, parseAiJson } from "@/modules/ai/ai.service";
import { chatInputSchema, chatOutputSchema } from "@/modules/ai/ai.schemas";
import { visitorPropertyCatalog } from "@/modules/ai/ai-context.service";
import { appendConversationMessage, getConversationMessages, resolveConversation } from "@/modules/ai/conversation.manager";

export async function POST(request: NextRequest) {
  try {
    assertCsrf(request);
    const input = chatInputSchema.parse(await request.json());
    const session = await auth();
    const userId = session?.user?.id ?? null;
    await enforceRateLimit("ai", userId ?? requestMetadata(request).ipHash);
    const conversation = await resolveConversation({ conversationId: input.conversationId, task: AiTask.VISITOR_CHAT, locale: input.locale, userId, title: input.message.slice(0, 100) });
    await appendConversationMessage({ conversationId: conversation.id, role: AiMessageRole.USER, content: input.message });
    const [history, catalog] = await Promise.all([getConversationMessages(conversation.id), visitorPropertyCatalog()]);
    const response = await aiService.generate({ task: AiTask.VISITOR_CHAT, locale: input.locale, variables: { locale: input.locale, catalog: JSON.stringify(catalog) }, messages: history, userId, conversationId: conversation.id, responseFormat: "json", maxOutputTokens: 1_400 });
    const parsed = parseAiJson(response.content, (value) => chatOutputSchema.parse(value));
    const recommendations = catalog.filter((property) => parsed.recommendedPropertyIds.includes(property.id));
    await appendConversationMessage({ conversationId: conversation.id, role: AiMessageRole.ASSISTANT, content: parsed.answer, provider: response.provider, model: response.model, promptTemplateId: response.promptTemplateId, metadata: { recommendedPropertyIds: recommendations.map((property) => property.id), requestId: response.requestId } });
    return ok({ conversationId: conversation.id, answer: parsed.answer, recommendations, meta: { requestId: response.requestId, provider: response.provider } });
  } catch (error) { return fail(error); }
}
