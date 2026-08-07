import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth/rbac";
import { assertCsrf } from "@/lib/security/csrf";
import { fail, noContent, ok } from "@/lib/http";
import { translationEntryInputSchema } from "@/modules/i18n/language.schemas";
import { archiveLanguage, upsertTranslation } from "@/modules/i18n/language.service";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) { try { assertCsrf(request); await requirePermission("settings.manage"); const { id } = await params; return ok(await upsertTranslation(id, translationEntryInputSchema.parse(await request.json()))); } catch (error) { return fail(error); } }
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) { try { assertCsrf(request); await requirePermission("settings.manage"); const { id } = await params; await archiveLanguage(id); return noContent(); } catch (error) { return fail(error); } }
