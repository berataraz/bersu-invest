import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/http";
import { requirePermission } from "@/lib/auth/rbac";
import { assertCsrf } from "@/lib/security/csrf";
import { leadInputSchema } from "@/modules/crm/crm.schemas";
import { createLead } from "@/modules/crm/crm.service";
import { prisma } from "@/lib/prisma";
export async function GET(request: NextRequest) { try { await requirePermission("crm.read"); const status = request.nextUrl.searchParams.get("status") ?? undefined; const items = await prisma.lead.findMany({ where: { deletedAt: null, ...(status ? { status: status as never } : {}) }, orderBy: [{ nextFollowUpAt: "asc" }, { createdAt: "desc" }], include: { customer: true, property: { select: { id: true, propertyId: true, title: true } }, owner: { select: { id: true, firstName: true, lastName: true } }, _count: { select: { tasks: true, appointments: true } } } }); return ok(items); } catch (error) { return fail(error); } }
export async function POST(request: NextRequest) { try { assertCsrf(request); const user = await requirePermission("crm.manage"); return ok(await createLead(leadInputSchema.parse(await request.json()), user.id), 201); } catch (error) { return fail(error); } }
