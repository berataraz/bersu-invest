import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/http";
import { requirePermission } from "@/lib/auth/rbac";
import { assertCsrf } from "@/lib/security/csrf";
import { followUpInputSchema } from "@/modules/crm/crm.schemas";
import { prisma } from "@/lib/prisma";
export async function GET() { try { await requirePermission("crm.read"); return ok(await prisma.followUp.findMany({ where: { deletedAt: null, completedAt: null }, orderBy: { dueAt: "asc" }, include: { customer: true, lead: true, owner: { select: { firstName: true, lastName: true } } } })); } catch (error) { return fail(error); } }
export async function POST(request: NextRequest) { try { assertCsrf(request); const user = await requirePermission("crm.manage"); const input = followUpInputSchema.parse(await request.json()); const followUp = await prisma.followUp.create({ data: { ...input, ownerId: input.ownerId ?? user.id } }); return ok(followUp, 201); } catch (error) { return fail(error); } }
