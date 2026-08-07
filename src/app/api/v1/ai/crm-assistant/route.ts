import { AiTask } from "@prisma/client";
import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/http";
import { requirePermission } from "@/lib/auth/rbac";
import { assertCsrf } from "@/lib/security/csrf";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { aiService, parseAiJson } from "@/modules/ai/ai.service";
import { crmAssistantInputSchema, crmAssistantOutputSchema } from "@/modules/ai/ai.schemas";
import { customerCrmContext } from "@/modules/ai/ai-context.service";

export async function POST(request: NextRequest) {
  try {
    assertCsrf(request);
    const user = await requirePermission("crm.manage");
    await enforceRateLimit("ai", user.id);
    const input = crmAssistantInputSchema.parse(await request.json());
    const customer = await customerCrmContext(input.customerId);
    const response = await aiService.generate({ task: AiTask.CRM_ASSISTANT, locale: input.locale, variables: { crmContext: JSON.stringify(customer), locale: input.locale }, messages: [{ role: "user", content: input.action === "summary" ? "Summarize this customer history." : "Recommend the best next follow-up actions." }], userId: user.id, maxOutputTokens: 2_000, responseFormat: "json" });
    return ok({ analysis: parseAiJson(response.content, (value) => crmAssistantOutputSchema.parse(value)), meta: { requestId: response.requestId, provider: response.provider } });
  } catch (error) { return fail(error); }
}
