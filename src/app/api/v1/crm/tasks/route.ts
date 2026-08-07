import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/http";
import { requirePermission } from "@/lib/auth/rbac";
import { assertCsrf } from "@/lib/security/csrf";
import { taskInputSchema } from "@/modules/crm/crm.schemas";
import { prisma } from "@/lib/prisma";
export async function GET(request: NextRequest) { try { const user = await requirePermission("crm.read"); const mine = request.nextUrl.searchParams.get("mine") === "true"; return ok(await prisma.task.findMany({ where: { deletedAt: null, ...(mine ? { assignedToId: user.id } : {}) }, orderBy: [{ dueAt: "asc" }, { priority: "desc" }], include: { customer: true, lead: true, property: { select: { title: true, propertyId: true } }, assignedTo: { select: { firstName: true, lastName: true } } } })); } catch (error) { return fail(error); } }
export async function POST(request: NextRequest) { try { assertCsrf(request); const user = await requirePermission("crm.manage"); const input = taskInputSchema.parse(await request.json()); const task = await prisma.$transaction(async (tx) => { const created = await tx.task.create({ data: { ...input, assignedToId: input.assignedToId ?? user.id, createdById: user.id } }); if (created.assignedToId) await tx.notification.create({ data: { userId: created.assignedToId, type: "TASK_ASSIGNED", title: "Yeni görev", body: created.title, payload: { taskId: created.id } } }); return created; }); return ok(task, 201); } catch (error) { return fail(error); } }
