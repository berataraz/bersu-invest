import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/http";
import { requirePermission } from "@/lib/auth/rbac";
import { assertCsrf } from "@/lib/security/csrf";
import { appointmentInputSchema } from "@/modules/crm/crm.schemas";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requirePermission("crm.read");
    return ok(await prisma.appointment.findMany({ where: { deletedAt: null, startsAt: { gte: new Date() } }, orderBy: { startsAt: "asc" }, include: { customer: true, lead: true, property: { select: { propertyId: true, title: true } }, owner: { select: { firstName: true, lastName: true } } } }));
  } catch (error) { return fail(error); }
}

export async function POST(request: NextRequest) {
  try {
    assertCsrf(request);
    const user = await requirePermission("appointments.manage");
    const input = appointmentInputSchema.parse(await request.json());
    const appointment = await prisma.$transaction(async (tx) => {
      const created = await tx.appointment.create({ data: { ...input, ownerId: input.ownerId ?? user.id } });
      if (created.leadId) await tx.timelineEvent.create({ data: { leadId: created.leadId, customerId: created.customerId, type: "APPOINTMENT_CREATED", label: created.title, metadata: { appointmentId: created.id, startsAt: created.startsAt.toISOString() } } });
      return created;
    });
    return ok(appointment, 201);
  } catch (error) { return fail(error); }
}
