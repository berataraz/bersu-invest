import { AiTask } from "@prisma/client";
import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/http";
import { requirePermission } from "@/lib/auth/rbac";
import { assertCsrf } from "@/lib/security/csrf";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { aiService } from "@/modules/ai/ai.service";
import { adminAssistantInputSchema } from "@/modules/ai/ai.schemas";
import { adminAnalysisContext } from "@/modules/ai/ai-context.service";

export async function POST(request: NextRequest) {
  try {
    assertCsrf(request);
    const user = await requirePermission("reports.read");
    await enforceRateLimit("ai", user.id);
    const input = adminAssistantInputSchema.parse(await request.json());
    const context = await adminAnalysisContext(input.analysis);
    const response = await aiService.generate({ task: AiTask.ADMIN_ANALYSIS, locale: input.locale, variables: { analysisContext: JSON.stringify(context), locale: input.locale }, messages: [{ role: "user", content: input.question }], userId: user.id, maxOutputTokens: 2_500 });
    return ok({ answer: response.content, meta: { requestId: response.requestId, provider: response.provider, model: response.model } });
  } catch (error) { return fail(error); }
}
