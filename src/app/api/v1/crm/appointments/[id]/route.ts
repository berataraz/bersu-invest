import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, noContent, ok } from "@/lib/http";
import { requirePermission } from "@/lib/auth/rbac";
import { assertCsrf } from "@/lib/security/csrf";
import { appointmentInputSchema } from "@/modules/crm/crm.schemas";
import { prisma } from "@/lib/prisma";
const paramsSchema = z.object({ id: z.string().uuid() });
export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) { try { assertCsrf(request); await requirePermission("appointments.manage"); const { id } = paramsSchema.parse(await context.params); return ok(await prisma.appointment.update({ where: { id }, data: appointmentInputSchema.innerType().partial().parse(await request.json()) })); } catch (error) { return fail(error); } }
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) { try { assertCsrf(request); await requirePermission("appointments.manage"); const { id } = paramsSchema.parse(await context.params); await prisma.appointment.update({ where: { id }, data: { deletedAt: new Date(), status: "CANCELLED" } }); return noContent(); } catch (error) { return fail(error); } }
