import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, noContent, ok } from "@/lib/http";
import { requirePermission } from "@/lib/auth/rbac";
import { assertCsrf } from "@/lib/security/csrf";
import { leadInputSchema } from "@/modules/crm/crm.schemas";
import { prisma } from "@/lib/prisma";
const paramsSchema = z.object({ id: z.string().uuid() });
export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) { try { assertCsrf(request); const user = await requirePermission("crm.manage"); const { id } = paramsSchema.parse(await context.params); const data = leadInputSchema.partial().parse(await request.json()); const lead = await prisma.$transaction(async (tx) => { const updated = await tx.lead.update({ where: { id }, data: { ...data, closedAt: data.status === "WON" || data.status === "LOST" ? new Date() : undefined, lastContactedAt: new Date() } }); await tx.timelineEvent.create({ data: { leadId: id, customerId: updated.customerId, type: "LEAD_UPDATED", label: "Lead durumu güncellendi", metadata: { actorId: user.id, status: updated.status } } }); return updated; }); return ok(lead); } catch (error) { return fail(error); } }
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) { try { assertCsrf(request); await requirePermission("crm.manage"); const { id } = paramsSchema.parse(await context.params); await prisma.lead.update({ where: { id }, data: { deletedAt: new Date() } }); return noContent(); } catch (error) { return fail(error); } }
