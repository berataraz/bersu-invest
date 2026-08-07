import { AiProvider } from "@prisma/client";
import { type AiProviderAdapter } from "@/modules/ai/ai.types";
import { ClaudeAdapter } from "@/modules/ai/providers/claude.adapter";
import { GeminiAdapter } from "@/modules/ai/providers/gemini.adapter";
import { OpenAiCompatibleAdapter } from "@/modules/ai/providers/openai-compatible.adapter";

class AiProviderRegistry {
  private readonly adapters = new Map<AiProvider, AiProviderAdapter>();

  register(adapter: AiProviderAdapter) { this.adapters.set(adapter.provider, adapter); }
  get(provider: AiProvider) { return this.adapters.get(provider); }
}

export const aiProviderRegistry = new AiProviderRegistry();
aiProviderRegistry.register(new OpenAiCompatibleAdapter(AiProvider.OPENAI));
aiProviderRegistry.register(new GeminiAdapter());
aiProviderRegistry.register(new ClaudeAdapter());
aiProviderRegistry.register(new OpenAiCompatibleAdapter(AiProvider.DEEPSEEK));
aiProviderRegistry.register(new OpenAiCompatibleAdapter(AiProvider.OPENROUTER));
