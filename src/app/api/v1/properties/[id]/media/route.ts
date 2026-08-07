import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/rbac";
import { propertyMediaSchema } from "@/modules/properties/property.schemas";
import { assertCsrf } from "@/lib/security/csrf";
const paramsSchema = z.object({ id: z.string().uuid() });
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) { try { assertCsrf(request); await requirePermission("properties.update"); const { id } = paramsSchema.parse(await context.params); const data = propertyMediaSchema.parse(await request.json()); await prisma.$transaction(async (tx) => { if (data.isCover) await tx.propertyMedia.updateMany({ where: { propertyId: id, isCover: true, deletedAt: null }, data: { isCover: false } }); }); const media = await prisma.propertyMedia.create({ data: { propertyId: id, ...data } }); return ok(media, 201); } catch (error) { return fail(error); } }
