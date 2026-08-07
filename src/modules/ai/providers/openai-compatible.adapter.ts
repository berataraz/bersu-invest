import { AiProvider } from "@prisma/client";
import { type AiProviderAdapter, type AiProviderRequest, type AiProviderResponse, type AiProviderRuntimeConfig, AiProviderError } from "@/modules/ai/ai.types";
import { apiBaseUrl, asNumber, asRecord, asString, postProviderJson } from "@/modules/ai/providers/http";

type OpenAiCompatibleProvider = "OPENAI" | "DEEPSEEK" | "OPENROUTER";

const defaultBases: Record<OpenAiCompatibleProvider, string> = {
  OPENAI: "https://api.openai.com/v1",
  DEEPSEEK: "https://api.deepseek.com/v1",
  OPENROUTER: "https://openrouter.ai/api/v1",
};

export class OpenAiCompatibleAdapter implements AiProviderAdapter {
  constructor(readonly provider: OpenAiCompatibleProvider) {}

  async generate(config: AiProviderRuntimeConfig, input: AiProviderRequest): Promise<AiProviderResponse> {
    const additional = asRecord(config.additionalConfig);
    const headers: HeadersInit = {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
      ...(typeof additional.httpReferer === "string" ? { "HTTP-Referer": additional.httpReferer } : {}),
      ...(typeof additional.appName === "string" ? { "X-Title": additional.appName } : {}),
    };
    const payload = await postProviderJson(apiBaseUrl(config.baseUrl, defaultBases[this.provider], "/chat/completions"), {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: input.model,
        messages: input.messages,
        temperature: input.temperature,
        max_tokens: input.maxOutputTokens,
        ...(input.responseFormat === "json" ? { response_format: { type: "json_object" } } : {}),
      }),
    }, config.timeoutMs);
    const response = asRecord(payload);
    const choices = Array.isArray(response.choices) ? response.choices : [];
    const firstChoice = asRecord(choices[0]);
    const message = asRecord(firstChoice.message);
    const content = asString(message.content);
    if (!content) throw new AiProviderError("Provider returned no assistant content.", "EMPTY_PROVIDER_RESPONSE", true);
    const usage = asRecord(response.usage);
    return { content, model: asString(response.model) || input.model, inputTokens: asNumber(usage.prompt_tokens), outputTokens: asNumber(usage.completion_tokens), raw: payload };
  }
}
