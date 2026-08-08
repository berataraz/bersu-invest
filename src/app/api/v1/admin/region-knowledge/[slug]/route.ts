import { AuditAction, Prisma } from "@prisma/client";
import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/rbac";
import { writeAuditLog } from "@/lib/audit";
import { ApiError, fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { assertCsrf } from "@/lib/security/csrf";

const locales = ["tr", "en", "de", "ru"] as const;
const schema = z.object({ content: z.record(z.enum(locales), z.record(z.string().max(8_000))), isPublished: z.boolean(), sortOrder: z.coerce.number().int().min(0).max(10_000) });

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    assertCsrf(request);
    const user = await requirePermission("content.manage");
    const { slug } = await params;
    const input = schema.parse(await request.json());
    const existing = await prisma.regionKnowledge.findFirst({ where: { slug, deletedAt: null } });
    if (!existing) throw new ApiError(404, "Region knowledge record not found.", "REGION_KNOWLEDGE_NOT_FOUND");
    const record = await prisma.regionKnowledge.update({ where: { id: existing.id }, data: { content: input.content as Prisma.InputJsonValue, isPublished: input.isPublished, sortOrder: input.sortOrder } });
    await writeAuditLog({ actorId: user.id, action: AuditAction.UPDATE, entityType: "RegionKnowledge", entityId: record.id, before: existing.content as Prisma.InputJsonValue, after: record.content as Prisma.InputJsonValue });
    return ok(record);
  } catch (error) { return fail(error); }
}
