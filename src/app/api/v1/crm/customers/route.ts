import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/http";
import { requirePermission } from "@/lib/auth/rbac";
import { assertCsrf } from "@/lib/security/csrf";
import { customerInputSchema } from "@/modules/crm/crm.schemas";
import { createCustomer } from "@/modules/crm/crm.service";
import { prisma } from "@/lib/prisma";
export async function GET(request: NextRequest) { try { await requirePermission("crm.read"); const q = request.nextUrl.searchParams.get("q")?.trim(); const items = await prisma.customer.findMany({ where: { deletedAt: null, ...(q ? { OR: [{ firstName: { contains: q, mode: "insensitive" } }, { lastName: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }, { phone: { contains: q, mode: "insensitive" } }] } : {}) }, take: 100, orderBy: { createdAt: "desc" }, include: { _count: { select: { leads: true, appointments: true, tasks: true } } } }); return ok(items); } catch (error) { return fail(error); } }
export async function POST(request: NextRequest) { try { assertCsrf(request); const user = await requirePermission("crm.manage"); return ok(await createCustomer(customerInputSchema.parse(await request.json()), user.id), 201); } catch (error) { return fail(error); } }
