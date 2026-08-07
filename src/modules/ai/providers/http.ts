import { AiProviderError } from "@/modules/ai/ai.types";

export async function postProviderJson(url: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal, cache: "no-store" });
    const body = await response.text();
    let parsed: unknown = body;
    try { parsed = body ? JSON.parse(body) : null; } catch { /* Provider response remains text for diagnostics. */ }
    if (!response.ok) {
      const retryable = response.status === 429 || response.status >= 500;
      throw new AiProviderError(`Provider request failed with status ${response.status}.`, `PROVIDER_HTTP_${response.status}`, retryable);
    }
    return parsed;
  } catch (error) {
    if (error instanceof AiProviderError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") throw new AiProviderError("Provider request timed out.", "PROVIDER_TIMEOUT", true);
    throw new AiProviderError("Provider request could not be completed.", "PROVIDER_NETWORK_ERROR", true);
  } finally {
    clearTimeout(timeout);
  }
}

export function apiBaseUrl(configuredUrl: string | null, defaultUrl: string, path: string) {
  return `${(configuredUrl ?? defaultUrl).replace(/\/$/, "")}${path}`;
}

export function asRecord(value: unknown) {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

export function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}
