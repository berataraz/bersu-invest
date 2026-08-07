import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, ok } from "@/lib/http";
import { requirePermission } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";
const paramsSchema = z.object({ id: z.string().uuid() });
export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) { try { await requirePermission("crm.read"); const { id } = paramsSchema.parse(await context.params); const [timeline, activities, tasks, appointments, followUps] = await Promise.all([prisma.timelineEvent.findMany({ where: { leadId: id }, orderBy: { occurredAt: "desc" } }), prisma.leadActivity.findMany({ where: { leadId: id }, orderBy: { occurredAt: "desc" } }), prisma.task.findMany({ where: { leadId: id, deletedAt: null }, orderBy: { createdAt: "desc" } }), prisma.appointment.findMany({ where: { leadId: id, deletedAt: null }, orderBy: { startsAt: "desc" } }), prisma.followUp.findMany({ where: { leadId: id, deletedAt: null }, orderBy: { dueAt: "asc" } })]); return ok({ timeline, activities, tasks, appointments, followUps }); } catch (error) { return fail(error); } }
