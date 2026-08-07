import { AiProvider } from "@prisma/client";
import { NextRequest } from "next/server";
import { fail, noContent, ok } from "@/lib/http";
import { requirePermission } from "@/lib/auth/rbac";
import { assertCsrf } from "@/lib/security/csrf";
import { providerConfigurationInputSchema } from "@/modules/ai/ai.schemas";
import { archiveProviderConfiguration, saveProviderConfiguration } from "@/modules/ai/ai-admin.service";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ provider: string }> }) { try { assertCsrf(request); const user = await requirePermission("ai.manage"); const { provider } = await params; const input = providerConfigurationInputSchema.parse({ ...await request.json(), provider: AiProvider[provider as keyof typeof AiProvider] ?? provider }); return ok(await saveProviderConfiguration(input, user.id)); } catch (error) { return fail(error); } }
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ provider: string }> }) { try { assertCsrf(request); const user = await requirePermission("ai.manage"); const { provider } = await params; const parsed = AiProvider[provider as keyof typeof AiProvider] ?? provider; if (!Object.values(AiProvider).includes(parsed as AiProvider)) throw new Error("Unknown AI provider."); await archiveProviderConfiguration(parsed as AiProvider, user.id); return noContent(); } catch (error) { return fail(error); } }
