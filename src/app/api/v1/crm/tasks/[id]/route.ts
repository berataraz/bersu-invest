import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, noContent, ok } from "@/lib/http";
import { requirePermission } from "@/lib/auth/rbac";
import { assertCsrf } from "@/lib/security/csrf";
import { taskInputSchema } from "@/modules/crm/crm.schemas";
import { prisma } from "@/lib/prisma";
const paramsSchema = z.object({ id: z.string().uuid() });
export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) { try { assertCsrf(request); await requirePermission("crm.manage"); const { id } = paramsSchema.parse(await context.params); const data = taskInputSchema.partial().parse(await request.json()); return ok(await prisma.task.update({ where: { id }, data: { ...data, completedAt: data.status === "COMPLETED" ? new Date() : undefined } })); } catch (error) { return fail(error); } }
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) { try { assertCsrf(request); await requirePermission("crm.manage"); const { id } = paramsSchema.parse(await context.params); await prisma.task.update({ where: { id }, data: { deletedAt: new Date(), status: "CANCELLED" } }); return noContent(); } catch (error) { return fail(error); } }
