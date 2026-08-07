import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, ok } from "@/lib/http";
import { requirePermission } from "@/lib/auth/rbac";
import { assertCsrf } from "@/lib/security/csrf";
import { noteInputSchema } from "@/modules/crm/crm.schemas";
import { prisma } from "@/lib/prisma";
const paramsSchema = z.object({ id: z.string().uuid() });
export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) { try { await requirePermission("crm.read"); const { id } = paramsSchema.parse(await context.params); return ok(await prisma.customerNote.findMany({ where: { customerId: id, deletedAt: null }, orderBy: { createdAt: "desc" }, include: { author: { select: { firstName: true, lastName: true } } } })); } catch (error) { return fail(error); } }
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) { try { assertCsrf(request); const user = await requirePermission("crm.manage"); const { id } = paramsSchema.parse(await context.params); const note = await prisma.$transaction(async (tx) => { const created = await tx.customerNote.create({ data: { customerId: id, authorId: user.id, ...noteInputSchema.parse(await request.json()) } }); await tx.timelineEvent.create({ data: { customerId: id, type: "NOTE_CREATED", label: "Yeni müşteri notu eklendi" } }); return created; }); return ok(note, 201); } catch (error) { return fail(error); } }
