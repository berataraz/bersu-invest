import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth/rbac";
import { assertCsrf } from "@/lib/security/csrf";
import { fail, ok } from "@/lib/http";
import { languageInputSchema } from "@/modules/i18n/language.schemas";
import { listLanguages, saveLanguage } from "@/modules/i18n/language.service";

export async function GET() { try { await requirePermission("settings.manage"); return ok(await listLanguages()); } catch (error) { return fail(error); } }
export async function POST(request: NextRequest) { try { assertCsrf(request); await requirePermission("settings.manage"); return ok(await saveLanguage(languageInputSchema.parse(await request.json())), 201); } catch (error) { return fail(error); } }
