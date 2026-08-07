import { AiProvider } from "@prisma/client";
import { type AiProviderAdapter, type AiProviderRequest, type AiProviderResponse, type AiProviderRuntimeConfig, AiProviderError } from "@/modules/ai/ai.types";
import { apiBaseUrl, asNumber, asRecord, asString, postProviderJson } from "@/modules/ai/providers/http";

export class GeminiAdapter implements AiProviderAdapter {
  readonly provider = AiProvider.GOOGLE_GEMINI;

  async generate(config: AiProviderRuntimeConfig, input: AiProviderRequest): Promise<AiProviderResponse> {
    const system = input.messages.filter((message) => message.role === "system").map((message) => message.content).join("\n\n");
    const contents = input.messages.filter((message) => message.role !== "system").map((message) => ({ role: message.role === "assistant" ? "model" : "user", parts: [{ text: message.content }] }));
    const payload = await postProviderJson(`${apiBaseUrl(config.baseUrl, "https://generativelanguage.googleapis.com/v1beta", `/models/${encodeURIComponent(input.model)}:generateContent`)}?key=${encodeURIComponent(config.apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
        contents,
        generationConfig: { temperature: input.temperature, maxOutputTokens: input.maxOutputTokens, ...(input.responseFormat === "json" ? { responseMimeType: "application/json" } : {}) },
      }),
    }, config.timeoutMs);
    const response = asRecord(payload);
    const candidates = Array.isArray(response.candidates) ? response.candidates : [];
    const candidate = asRecord(candidates[0]);
    const content = asRecord(candidate.content);
    const parts = Array.isArray(content.parts) ? content.parts : [];
    const text = parts.map((part) => asString(asRecord(part).text)).join("\n");
    if (!text) throw new AiProviderError("Provider returned no assistant content.", "EMPTY_PROVIDER_RESPONSE", true);
    const usage = asRecord(response.usageMetadata);
    return { content: text, model: input.model, inputTokens: asNumber(usage.promptTokenCount), outputTokens: asNumber(usage.candidatesTokenCount), raw: payload };
  }
}
