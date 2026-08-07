# AI Platform

## Boundary

No feature calls OpenAI, Gemini, Claude, DeepSeek, or OpenRouter directly. Every AI capability calls `AIService`, which owns prompt selection, provider routing, quotas, usage logging, and fallback. Provider-specific HTTP contracts exist only in `src/modules/ai/providers`.

## Provider configuration

Super admins configure providers through the protected API:

- `GET|POST /api/v1/admin/ai/providers`
- `PUT|DELETE /api/v1/admin/ai/providers/:provider`
- `GET|POST /api/v1/admin/ai/templates`
- `DELETE /api/v1/admin/ai/templates/:id`
- `GET /api/v1/admin/ai/usage?from=<ISO>&to=<ISO>`

`ai.manage` is required for providers and prompt templates. `ai.analytics` is required for usage reporting. API keys are encrypted with `AUTH_ENCRYPTION_KEY` using AES-256-GCM, are never returned from the API, and may be omitted on update to preserve the existing key.

Providers are selected by ascending priority. The preferred provider is attempted first when requested, followed by every enabled provider. Every attempt, including quota rejection and fallback failures, writes an `AiUsageLog` record.

## Feature APIs

All POST endpoints require the existing CSRF token and are rate limited. Public endpoints use a hashed IP address; authenticated endpoints use the authenticated user ID.

- `POST /api/v1/ai/property-search`: natural-language query to validated property filters plus matching results.
- `POST /api/v1/ai/listing-generator`: listing description, SEO, and social channel content from verified property data.
- `POST /api/v1/ai/translation`: field-level listing translation to any supported locale.
- `POST /api/v1/ai/chat`: visitor concierge with a bounded published-property catalog and persisted conversation context.
- `POST /api/v1/ai/admin-assistant`: report, trend, agent, and property-performance analysis. Requires `reports.read`.
- `POST /api/v1/ai/crm-assistant`: customer summary and follow-up suggestions. Requires `crm.manage` and recorded customer AI-processing consent.

## Adding a provider

`AIService` is closed to provider details. Add an adapter that implements `AiProviderAdapter`, register it in `src/modules/ai/providers/registry.ts`, and add its configuration entry. Existing features, API routes, prompt templates, usage reporting, and fallback logic do not change. Providers that expose the OpenAI chat-completions contract can reuse `OpenAiCompatibleAdapter` with a configured base URL.

## Data and operations

Run the normal Prisma migration workflow before deployment after this schema change. The new models retain provider configuration, versioned prompt templates, conversations, messages, and usage telemetry. Keep the `AUTH_ENCRYPTION_KEY` stable across deployments; rotating it requires a controlled provider-key re-encryption procedure.
