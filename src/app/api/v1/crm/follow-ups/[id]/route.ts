import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, noContent, ok } from "@/lib/http";
import { requirePermission } from "@/lib/auth/rbac";
import { assertCsrf } from "@/lib/security/csrf";
import { followUpInputSchema } from "@/modules/crm/crm.schemas";
import { prisma } from "@/lib/prisma";
const paramsSchema = z.object({ id: z.string().uuid() });
export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) { try { assertCsrf(request); await requirePermission("crm.manage"); const { id } = paramsSchema.parse(await context.params); const body = z.object({ ...followUpInputSchema.innerType().shape, completed: z.boolean().optional() }).partial().parse(await request.json()); const { completed, ...data } = body; return ok(await prisma.followUp.update({ where: { id }, data: { ...data, completedAt: completed ? new Date() : undefined } })); } catch (error) { return fail(error); } }
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) { try { assertCsrf(request); await requirePermission("crm.manage"); const { id } = paramsSchema.parse(await context.params); await prisma.followUp.update({ where: { id }, data: { deletedAt: new Date() } }); return noContent(); } catch (error) { return fail(error); } }
