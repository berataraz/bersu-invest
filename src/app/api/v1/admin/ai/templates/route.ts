import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/http";
import { requirePermission } from "@/lib/auth/rbac";
import { assertCsrf } from "@/lib/security/csrf";
import { promptTemplateInputSchema } from "@/modules/ai/ai.schemas";
import { createPromptTemplate, listPromptTemplates } from "@/modules/ai/ai-admin.service";

export async function GET() { try { await requirePermission("ai.manage"); return ok(await listPromptTemplates()); } catch (error) { return fail(error); } }
export async function POST(request: NextRequest) { try { assertCsrf(request); const user = await requirePermission("ai.manage"); return ok(await createPromptTemplate(promptTemplateInputSchema.parse(await request.json()), user.id), 201); } catch (error) { return fail(error); } }
