import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, noContent, ok, ApiError } from "@/lib/http";
import { requirePermission } from "@/lib/auth/rbac";
import { assertCsrf } from "@/lib/security/csrf";
import { prisma } from "@/lib/prisma";
import { revalidatePublicPropertyCache } from "@/modules/properties/public-property-cache";

const paramsSchema = z.object({ id: z.string().uuid(), mediaId: z.string().uuid() });
const updateSchema = z.object({ isCover: z.boolean().optional(), sortOrder: z.coerce.number().int().min(0).max(10_000).optional(), altText: z.string().trim().max(255).optional().nullable(), title: z.string().trim().max(180).optional().nullable() });

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string; mediaId: string }> }) {
  try {
    assertCsrf(request);
    await requirePermission("properties.update");
    const { id, mediaId } = paramsSchema.parse(await context.params);
    const data = updateSchema.parse(await request.json());
    const media = await prisma.propertyMedia.findFirst({ where: { id: mediaId, propertyId: id, deletedAt: null }, select: { id: true } });
    if (!media) throw new ApiError(404, "Medya kaydı bulunamadı.", "MEDIA_NOT_FOUND");
    const updated = await prisma.$transaction(async (tx) => {
      if (data.isCover) await tx.propertyMedia.updateMany({ where: { propertyId: id, deletedAt: null }, data: { isCover: false } });
      return tx.propertyMedia.update({ where: { id: mediaId }, data });
    });
    revalidatePublicPropertyCache();
    return ok(updated);
  } catch (error) { return fail(error); }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string; mediaId: string }> }) {
  try {
    assertCsrf(request);
    await requirePermission("properties.update");
    const { id, mediaId } = paramsSchema.parse(await context.params);
    const updated = await prisma.propertyMedia.updateMany({ where: { id: mediaId, propertyId: id, deletedAt: null }, data: { deletedAt: new Date(), isCover: false } });
    if (!updated.count) throw new ApiError(404, "Medya kaydı bulunamadı.", "MEDIA_NOT_FOUND");
    const replacement = await prisma.propertyMedia.findFirst({ where: { propertyId: id, deletedAt: null }, orderBy: { sortOrder: "asc" }, select: { id: true } });
    if (replacement) await prisma.propertyMedia.update({ where: { id: replacement.id }, data: { isCover: true } });
    revalidatePublicPropertyCache();
    return noContent();
  } catch (error) { return fail(error); }
}
