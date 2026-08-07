import { AiProvider, AiTask, AiUsageStatus, Prisma } from "@prisma/client";
import { decryptSecret } from "@/lib/security/tokens";
import { ApiError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { type AiGenerationRequest, type AiGenerationResult, AiProviderError, type AiProviderRuntimeConfig } from "@/modules/ai/ai.types";
import { getActivePromptTemplate, renderPrompt } from "@/modules/ai/prompt-template.service";
import { aiProviderRegistry } from "@/modules/ai/providers/registry";

type ProviderConfig = Awaited<ReturnType<typeof configuredProviders>>[number];

function approximateTokens(value: string) { return Math.ceil(value.length / 4); }
function todayStart() { const now = new Date(); return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())); }

async function configuredProviders(preferredProvider?: AiProvider) {
  const configs = await prisma.aiProviderConfiguration.findMany({ where: { isEnabled: true, deletedAt: null }, orderBy: [{ priority: "asc" }, { createdAt: "asc" }] });
  if (!preferredProvider) return configs;
  return [...configs.filter((config) => config.provider === preferredProvider), ...configs.filter((config) => config.provider !== preferredProvider)];
}

async function assertProviderQuota(config: ProviderConfig, anticipatedTokens: number) {
  if (!config.dailyRequestLimit && !config.dailyTokenLimit) return;
  const since = todayStart();
  const [requests, tokens] = await Promise.all([
    config.dailyRequestLimit ? prisma.aiUsageLog.count({ where: { providerConfigId: config.id, createdAt: { gte: since } } }) : Promise.resolve(0),
    config.dailyTokenLimit ? prisma.aiUsageLog.aggregate({ where: { providerConfigId: config.id, createdAt: { gte: since }, status: AiUsageStatus.SUCCEEDED }, _sum: { inputTokens: true, outputTokens: true } }) : Promise.resolve(null),
  ]);
  if (config.dailyRequestLimit && requests >= config.dailyRequestLimit) throw new AiProviderError("Provider daily request limit reached.", "PROVIDER_DAILY_REQUEST_LIMIT", true);
  const usedTokens = (tokens?._sum.inputTokens ?? 0) + (tokens?._sum.outputTokens ?? 0);
  if (config.dailyTokenLimit && usedTokens + anticipatedTokens > config.dailyTokenLimit) throw new AiProviderError("Provider daily token limit reached.", "PROVIDER_DAILY_TOKEN_LIMIT", true);
}

async function writeUsage(input: {
  config: ProviderConfig;
  task: AiTask;
  status: AiUsageStatus;
  userId?: string | null;
  conversationId?: string | null;
  propertyId?: string | null;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  durationMs?: number;
  fallbackAttempt: number;
  errorCode?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  return prisma.aiUsageLog.create({ data: { providerConfigId: input.config.id, provider: input.config.provider, task: input.task, status: input.status, userId: input.userId ?? null, conversationId: input.conversationId ?? null, propertyId: input.propertyId ?? null, model: input.model, inputTokens: input.inputTokens ?? 0, outputTokens: input.outputTokens ?? 0, durationMs: input.durationMs, fallbackAttempt: input.fallbackAttempt, errorCode: input.errorCode, metadata: input.metadata } });
}

export class AIService {
  async generate(request: AiGenerationRequest): Promise<AiGenerationResult> {
    const locale = request.locale ?? "tr";
    const promptTemplate = await getActivePromptTemplate(request.task, locale);
    const systemPrompt = renderPrompt(promptTemplate.template, request.variables ?? {});
    const messages = [{ role: "system" as const, content: systemPrompt }, ...request.messages];
    const maxOutputTokens = Math.min(request.maxOutputTokens ?? 1_500, 8_192);
    const anticipatedTokens = approximateTokens(messages.map((message) => message.content).join("\n")) + maxOutputTokens;
    const providers = await configuredProviders(request.preferredProvider);
    if (!providers.length) throw new ApiError(503, "No AI provider is currently available.", "AI_UNAVAILABLE");

    let lastError: unknown;
    for (const [fallbackAttempt, config] of providers.entries()) {
      const adapter = aiProviderRegistry.get(config.provider);
      if (!adapter || !config.encryptedApiKey) continue;
      const startedAt = Date.now();
      try {
        await assertProviderQuota(config, anticipatedTokens);
        const runtimeConfig: AiProviderRuntimeConfig = { id: config.id, provider: config.provider, baseUrl: config.baseUrl, defaultModel: config.defaultModel, apiKey: decryptSecret(config.encryptedApiKey), timeoutMs: config.timeoutMs, maxOutputTokens: config.maxOutputTokens, additionalConfig: config.additionalConfig };
        const response = await adapter.generate(runtimeConfig, { model: config.defaultModel, messages, temperature: request.temperature ?? 0.2, maxOutputTokens: Math.min(maxOutputTokens, config.maxOutputTokens), responseFormat: request.responseFormat ?? "text" });
        const usage = await writeUsage({ config, task: request.task, status: AiUsageStatus.SUCCEEDED, userId: request.userId, conversationId: request.conversationId, propertyId: request.propertyId, model: response.model, inputTokens: response.inputTokens || approximateTokens(messages.map((message) => message.content).join("\n")), outputTokens: response.outputTokens || approximateTokens(response.content), durationMs: Date.now() - startedAt, fallbackAttempt, metadata: { promptTemplateVersion: promptTemplate.version } });
        return { ...response, provider: config.provider, requestId: usage.requestId, promptTemplateId: promptTemplate.id };
      } catch (error) {
        lastError = error;
        const providerError = error instanceof AiProviderError ? error : new AiProviderError("AI provider execution failed.", "AI_PROVIDER_EXECUTION_FAILED", true);
        await writeUsage({ config, task: request.task, status: providerError.code.includes("LIMIT") ? AiUsageStatus.RATE_LIMITED : AiUsageStatus.FAILED, userId: request.userId, conversationId: request.conversationId, propertyId: request.propertyId, model: config.defaultModel, durationMs: Date.now() - startedAt, fallbackAttempt, errorCode: providerError.code, metadata: { promptTemplateVersion: promptTemplate.version } });
        // A misconfigured or rejected provider must not prevent a healthy fallback from serving the request.
      }
    }
    console.error("AI generation failed after configured provider fallbacks.", lastError);
    throw new ApiError(503, "AI service is temporarily unavailable. Please try again later.", "AI_UNAVAILABLE");
  }
}

export const aiService = new AIService();

export function parseAiJson<T>(content: string, parser: (value: unknown) => T) {
  const normalized = content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try { return parser(JSON.parse(normalized)); } catch { throw new ApiError(422, "AI returned an invalid structured response.", "AI_INVALID_RESPONSE"); }
}
