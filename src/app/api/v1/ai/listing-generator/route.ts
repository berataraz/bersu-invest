import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/http";
import { requirePermission } from "@/lib/auth/rbac";
import { assertCsrf } from "@/lib/security/csrf";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { aiService, parseAiJson } from "@/modules/ai/ai.service";
import { listingGeneratorInputSchema, listingGeneratorOutputSchema } from "@/modules/ai/ai.schemas";
import { propertyGenerationContext } from "@/modules/ai/ai-context.service";

export async function POST(request: NextRequest) {
  try {
    assertCsrf(request);
    const user = await requirePermission("properties.update");
    await enforceRateLimit("ai", user.id);
    const input = listingGeneratorInputSchema.parse(await request.json());
    const property = input.propertyId ? await propertyGenerationContext(input.propertyId) : input.property;
    const response = await aiService.generate({ task: "LISTING_GENERATION", locale: input.locale, variables: { listingContext: JSON.stringify({ tone: input.tone, property }), locale: input.locale }, messages: [{ role: "user", content: "Generate the requested listing deliverables from the verified property context." }], userId: user.id, propertyId: input.propertyId, responseFormat: "json", maxOutputTokens: 4_000 });
    return ok({ content: parseAiJson(response.content, (value) => listingGeneratorOutputSchema.parse(value)), meta: { requestId: response.requestId, provider: response.provider } });
  } catch (error) { return fail(error); }
}
