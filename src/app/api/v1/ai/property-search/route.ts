import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/http";
import { assertCsrf } from "@/lib/security/csrf";
import { requestMetadata } from "@/lib/security/request";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { aiService, parseAiJson } from "@/modules/ai/ai.service";
import { propertySearchInputSchema, propertySearchOutputSchema } from "@/modules/ai/ai.schemas";
import { listProperties } from "@/modules/properties/property.service";
import { propertyQuerySchema } from "@/modules/properties/property.schemas";

export async function POST(request: NextRequest) {
  try {
    assertCsrf(request);
    const input = propertySearchInputSchema.parse(await request.json());
    await enforceRateLimit("ai", requestMetadata(request).ipHash);
    const response = await aiService.generate({ task: "PROPERTY_SEARCH", locale: input.locale, variables: { query: input.query }, messages: [{ role: "user", content: input.query }], responseFormat: "json", maxOutputTokens: 600 });
    const parsed = parseAiJson(response.content, (value) => propertySearchOutputSchema.parse(value));
    const filters = propertyQuerySchema.parse({ ...Object.fromEntries(Object.entries(parsed).filter(([, value]) => value !== null && value !== undefined)), limit: 12 });
    return ok({ filters, results: await listProperties(filters), meta: { requestId: response.requestId, provider: response.provider } });
  } catch (error) { return fail(error); }
}
