import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, ok, ApiError } from "@/lib/http";
import { requirePermission } from "@/lib/auth/rbac";
import { assertCsrf } from "@/lib/security/csrf";
import { prisma } from "@/lib/prisma";
import { saveLocalPropertyFile } from "@/modules/media/local-property-storage";
import { revalidatePublicPropertyCache } from "@/modules/properties/public-property-cache";

export const runtime = "nodejs";
const paramsSchema = z.object({ id: z.string().uuid() });

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    assertCsrf(request);
    await requirePermission("properties.update");
    const { id } = paramsSchema.parse(await context.params);
    const property = await prisma.property.findFirst({ where: { id, deletedAt: null }, select: { id: true } });
    if (!property) throw new ApiError(404, "İlan bulunamadı.", "PROPERTY_NOT_FOUND");
    const formData = await request.formData();
    const files = formData.getAll("files").filter((entry): entry is File => entry instanceof File);
    if (!files.length) throw new ApiError(400, "Yüklenecek dosya bulunamadı.", "MEDIA_REQUIRED");
    if (files.length > 20) throw new ApiError(400, "Bir seferde en fazla 20 dosya yüklenebilir.", "TOO_MANY_FILES");
    const currentCount = await prisma.propertyMedia.count({ where: { propertyId: id, deletedAt: null } });
    const saved = await Promise.all(files.map((file) => saveLocalPropertyFile(id, file)));
    const media = await prisma.$transaction(async (tx) => Promise.all(saved.map((item, index) => tx.propertyMedia.create({ data: { propertyId: id, ...item, title: files[index].name.slice(0, 180), sortOrder: currentCount + index, isCover: currentCount === 0 && index === 0 } }))));
    revalidatePublicPropertyCache();
    return ok(media, 201);
  } catch (error) { return fail(error); }
}
