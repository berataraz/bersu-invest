import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, noContent, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/rbac";
import { propertyUpdateSchema } from "@/modules/properties/property.schemas";
import { updateProperty } from "@/modules/properties/property.service";
import { assertCsrf } from "@/lib/security/csrf";
import { revalidatePublicPropertyCache } from "@/modules/properties/public-property-cache";
import { requestMetadata } from "@/lib/security/request";
import { writeAuditLog } from "@/lib/audit";
const paramsSchema = z.object({ id: z.string().uuid() });
export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) { try { await requirePermission("properties.read"); const { id } = paramsSchema.parse(await context.params); const property = await prisma.property.findFirstOrThrow({ where: { id, deletedAt: null }, include: { type: true, assignedAgent: { select: { id: true, firstName: true, lastName: true, jobTitle: true } }, media: { where: { deletedAt: null }, orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }] }, features: { include: { feature: true } }, leads: { orderBy: { createdAt: "desc" }, take: 10 }, appointments: { orderBy: { startsAt: "desc" }, take: 10 }, _count: { select: { leads: true, appointments: true } } } }); return ok(property); } catch (error) { return fail(error); } }
export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) { try { assertCsrf(request); const user = await requirePermission("properties.update"); const { id } = paramsSchema.parse(await context.params); const input = propertyUpdateSchema.parse(await request.json()); if (input.status === "PUBLISHED") await requirePermission("properties.publish"); const property = await updateProperty(id, input, user.id); await writeAuditLog({ actorId: user.id, action: "UPDATE", entityType: "Property", entityId: id, after: { status: property.status, slug: property.slug }, ...requestMetadata(request) }); return ok(property); } catch (error) { return fail(error); } }
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) { try { assertCsrf(request); const user = await requirePermission("properties.update"); const { id } = paramsSchema.parse(await context.params); await prisma.property.update({ where: { id }, data: { deletedAt: new Date(), status: "ARCHIVED", updatedById: user.id } }); revalidatePublicPropertyCache(); await writeAuditLog({ actorId: user.id, action: "DELETE", entityType: "Property", entityId: id, ...requestMetadata(request) }); return noContent(); } catch (error) { return fail(error); } }
