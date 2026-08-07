import { AiProvider } from "@prisma/client";
import { type AiProviderAdapter, type AiProviderRequest, type AiProviderResponse, type AiProviderRuntimeConfig, AiProviderError } from "@/modules/ai/ai.types";
import { apiBaseUrl, asNumber, asRecord, asString, postProviderJson } from "@/modules/ai/providers/http";

export class ClaudeAdapter implements AiProviderAdapter {
  readonly provider = AiProvider.ANTHROPIC_CLAUDE;

  async generate(config: AiProviderRuntimeConfig, input: AiProviderRequest): Promise<AiProviderResponse> {
    const system = input.messages.filter((message) => message.role === "system").map((message) => message.content).join("\n\n");
    const messages = input.messages.filter((message) => message.role !== "system" && message.role !== "tool").map((message) => ({ role: message.role === "assistant" ? "assistant" : "user", content: message.content }));
    const payload = await postProviderJson(apiBaseUrl(config.baseUrl, "https://api.anthropic.com/v1", "/messages"), {
      method: "POST",
      headers: { "x-api-key": config.apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: input.model, max_tokens: input.maxOutputTokens, temperature: input.temperature, ...(system ? { system } : {}), messages }),
    }, config.timeoutMs);
    const response = asRecord(payload);
    const content = Array.isArray(response.content) ? response.content : [];
    const text = content.map((part) => asString(asRecord(part).text)).join("\n");
    if (!text) throw new AiProviderError("Provider returned no assistant content.", "EMPTY_PROVIDER_RESPONSE", true);
    const usage = asRecord(response.usage);
    return { content: text, model: asString(response.model) || input.model, inputTokens: asNumber(usage.input_tokens), outputTokens: asNumber(usage.output_tokens), raw: payload };
  }
}
