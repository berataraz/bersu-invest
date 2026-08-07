import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, noContent, ok } from "@/lib/http";
import { requirePermission } from "@/lib/auth/rbac";
import { assertCsrf } from "@/lib/security/csrf";
import { customerInputSchema } from "@/modules/crm/crm.schemas";
import { prisma } from "@/lib/prisma";
const paramsSchema = z.object({ id: z.string().uuid() });
export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) { try { await requirePermission("crm.read"); const { id } = paramsSchema.parse(await context.params); return ok(await prisma.customer.findFirstOrThrow({ where: { id, deletedAt: null }, include: { notes: { where: { deletedAt: null }, orderBy: { createdAt: "desc" } }, leads: { where: { deletedAt: null }, orderBy: { createdAt: "desc" } }, appointments: { where: { deletedAt: null }, orderBy: { startsAt: "desc" } }, tasks: { where: { deletedAt: null, completedAt: null }, orderBy: { dueAt: "asc" } }, timeline: { orderBy: { occurredAt: "desc" } } } })); } catch (error) { return fail(error); } }
export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) { try { assertCsrf(request); await requirePermission("crm.manage"); const { id } = paramsSchema.parse(await context.params); return ok(await prisma.customer.update({ where: { id }, data: customerInputSchema.partial().parse(await request.json()) })); } catch (error) { return fail(error); } }
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) { try { assertCsrf(request); await requirePermission("crm.manage"); const { id } = paramsSchema.parse(await context.params); await prisma.customer.update({ where: { id }, data: { deletedAt: new Date() } }); return noContent(); } catch (error) { return fail(error); } }
