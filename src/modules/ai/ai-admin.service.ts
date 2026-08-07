import { AiProvider, Prisma } from "@prisma/client";
import { encryptSecret } from "@/lib/security/tokens";
import { prisma } from "@/lib/prisma";
import { type z } from "zod";
import { promptTemplateInputSchema, providerConfigurationInputSchema } from "@/modules/ai/ai.schemas";

type ProviderInput = z.infer<typeof providerConfigurationInputSchema>;
type PromptInput = z.infer<typeof promptTemplateInputSchema>;

export function redactProviderConfiguration<T extends { encryptedApiKey: string | null }>(config: T) {
  const { encryptedApiKey: _secret, ...safe } = config;
  return { ...safe, hasApiKey: Boolean(_secret) };
}

export async function listProviderConfigurations() {
  const configs = await prisma.aiProviderConfiguration.findMany({ where: { deletedAt: null }, orderBy: [{ priority: "asc" }, { provider: "asc" }] });
  return configs.map(redactProviderConfiguration);
}

export async function saveProviderConfiguration(input: ProviderInput, actorId: string) {
  const existing = await prisma.aiProviderConfiguration.findUnique({ where: { provider: input.provider } });
  const data = { displayName: input.displayName, isEnabled: input.isEnabled, priority: input.priority, baseUrl: input.baseUrl ?? null, defaultModel: input.defaultModel, additionalConfig: input.additionalConfig as Prisma.InputJsonValue | undefined, timeoutMs: input.timeoutMs, maxOutputTokens: input.maxOutputTokens, dailyRequestLimit: input.dailyRequestLimit ?? null, dailyTokenLimit: input.dailyTokenLimit ?? null, updatedById: actorId, ...(input.apiKey ? { encryptedApiKey: encryptSecret(input.apiKey) } : {}) };
  const config = existing
    ? await prisma.aiProviderConfiguration.update({ where: { provider: input.provider }, data: { ...data, deletedAt: null } })
    : await prisma.aiProviderConfiguration.create({ data: { provider: input.provider, ...data, encryptedApiKey: input.apiKey ? encryptSecret(input.apiKey) : null, createdById: actorId } });
  return redactProviderConfiguration(config);
}

export async function archiveProviderConfiguration(provider: AiProvider, actorId: string) {
  await prisma.aiProviderConfiguration.update({ where: { provider }, data: { isEnabled: false, deletedAt: new Date(), updatedById: actorId } });
}

export async function listPromptTemplates() {
  return prisma.aiPromptTemplate.findMany({ where: { deletedAt: null }, orderBy: [{ task: "asc" }, { locale: "asc" }, { version: "desc" }] });
}

export async function createPromptTemplate(input: PromptInput, actorId: string) {
  const latest = await prisma.aiPromptTemplate.findFirst({ where: { task: input.task, locale: input.locale }, orderBy: { version: "desc" } });
  return prisma.aiPromptTemplate.create({ data: { ...input, version: input.version ?? (latest?.version ?? 0) + 1, outputSchema: input.outputSchema === null ? Prisma.JsonNull : input.outputSchema as Prisma.InputJsonValue | undefined, createdById: actorId } });
}

export async function archivePromptTemplate(id: string) {
  return prisma.aiPromptTemplate.update({ where: { id }, data: { isActive: false, deletedAt: new Date() } });
}

export async function aiUsageAnalytics(from: Date, to: Date) {
  const where = { createdAt: { gte: from, lte: to } };
  const [totals, byProvider, byTask, recentFailures] = await Promise.all([
    prisma.aiUsageLog.aggregate({ where, _count: { _all: true }, _sum: { inputTokens: true, outputTokens: true, estimatedCostUsd: true }, _avg: { durationMs: true } }),
    prisma.aiUsageLog.groupBy({ by: ["provider", "status"], where, _count: { _all: true }, _sum: { inputTokens: true, outputTokens: true } }),
    prisma.aiUsageLog.groupBy({ by: ["task", "status"], where, _count: { _all: true } }),
    prisma.aiUsageLog.findMany({ where: { ...where, status: { not: "SUCCEEDED" } }, orderBy: { createdAt: "desc" }, take: 25, select: { requestId: true, provider: true, task: true, status: true, errorCode: true, createdAt: true } }),
  ]);
  return { totals, byProvider, byTask, recentFailures };
}
