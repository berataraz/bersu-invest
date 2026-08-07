import { NextRequest } from "next/server";
import { fail, noContent } from "@/lib/http";
import { requirePermission } from "@/lib/auth/rbac";
import { assertCsrf } from "@/lib/security/csrf";
import { archivePromptTemplate } from "@/modules/ai/ai-admin.service";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) { try { assertCsrf(request); await requirePermission("ai.manage"); const { id } = await params; await archivePromptTemplate(id); return noContent(); } catch (error) { return fail(error); } }
