import { type AiProvider, type AiTask } from "@prisma/client";

export type AiMessage = { role: "system" | "user" | "assistant" | "tool"; content: string };
export type AiResponseFormat = "text" | "json";

export type AiProviderRuntimeConfig = {
  id: string;
  provider: AiProvider;
  baseUrl: string | null;
  defaultModel: string;
  apiKey: string;
  timeoutMs: number;
  maxOutputTokens: number;
  additionalConfig: unknown;
};

export type AiProviderRequest = {
  model: string;
  messages: AiMessage[];
  temperature: number;
  maxOutputTokens: number;
  responseFormat: AiResponseFormat;
};

export type AiProviderResponse = {
  content: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  raw: unknown;
};

export interface AiProviderAdapter {
  readonly provider: AiProvider;
  generate(config: AiProviderRuntimeConfig, input: AiProviderRequest): Promise<AiProviderResponse>;
}

export type AiGenerationRequest = {
  task: AiTask;
  locale?: string;
  variables?: Record<string, string>;
  messages: AiMessage[];
  userId?: string | null;
  conversationId?: string | null;
  propertyId?: string | null;
  preferredProvider?: AiProvider;
  responseFormat?: AiResponseFormat;
  temperature?: number;
  maxOutputTokens?: number;
};

export type AiGenerationResult = AiProviderResponse & {
  provider: AiProvider;
  requestId: string;
  promptTemplateId: string | null;
};

export class AiProviderError extends Error {
  constructor(message: string, public readonly code: string, public readonly retryable = true) {
    super(message);
  }
}
