import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/http";
import { requirePermission } from "@/lib/auth/rbac";
import { assertCsrf } from "@/lib/security/csrf";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { aiService, parseAiJson } from "@/modules/ai/ai.service";
import { translationInputSchema, translationOutputSchema } from "@/modules/ai/ai.schemas";

export async function POST(request: NextRequest) {
  try {
    assertCsrf(request);
    const user = await requirePermission("properties.update");
    await enforceRateLimit("ai", user.id);
    const input = translationInputSchema.parse(await request.json());
    const translations: Record<string, Record<string, string>> = {};
    for (const targetLocale of [...new Set(input.targetLocales)].filter((target) => target !== input.sourceLocale)) {
      translations[targetLocale] = {};
      for (const [field, content] of Object.entries(input.content)) {
        const response = await aiService.generate({ task: "TRANSLATION", locale: targetLocale, variables: { sourceLocale: input.sourceLocale, targetLocale, content }, messages: [{ role: "user", content: `Translate the ${field} field.` }], userId: user.id, propertyId: input.propertyId, responseFormat: "json", maxOutputTokens: 2_500 });
        translations[targetLocale][field] = parseAiJson(response.content, (value) => translationOutputSchema.parse(value)).translation;
      }
    }
    return ok({ translations });
  } catch (error) { return fail(error); }
}
