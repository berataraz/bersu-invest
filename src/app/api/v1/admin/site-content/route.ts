import { AuditAction, Prisma } from "@prisma/client";
import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/rbac";
import { writeAuditLog } from "@/lib/audit";
import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { assertCsrf } from "@/lib/security/csrf";
import { contentLocales, defaultSiteContent, revalidateSiteContent } from "@/modules/content/site-content.service";

const localeContent = z.record(z.enum(contentLocales), z.record(z.string().max(8_000)));
const inputSchema = z.object({ key: z.enum(["homepage", "aiAssistant", "footer"]), content: localeContent, isPublished: z.boolean().default(true) });

export async function GET() {
  try {
    await requirePermission("content.manage");
    const records = await prisma.siteContent.findMany({ where: { deletedAt: null }, select: { key: true, content: true, isPublished: true, version: true, updatedAt: true } });
    return ok(Object.keys(defaultSiteContent).map((key) => {
      const record = records.find((item) => item.key === key);
      return record ?? { key, content: defaultSiteContent[key], isPublished: true, version: 0, updatedAt: null };
    }));
  } catch (error) { return fail(error); }
}

export async function PUT(request: NextRequest) {
  try {
    assertCsrf(request);
    const user = await requirePermission("content.manage");
    const input = inputSchema.parse(await request.json());
    const existing = await prisma.siteContent.findUnique({ where: { key: input.key } });
    const record = await prisma.siteContent.upsert({
      where: { key: input.key },
      update: { content: input.content as Prisma.InputJsonValue, isPublished: input.isPublished, version: { increment: 1 }, deletedAt: null },
      create: { key: input.key, content: input.content as Prisma.InputJsonValue, isPublished: input.isPublished },
    });
    await writeAuditLog({ actorId: user.id, action: AuditAction.UPDATE, entityType: "SiteContent", entityId: record.id, before: existing?.content as Prisma.InputJsonValue | undefined, after: record.content as Prisma.InputJsonValue });
    revalidateSiteContent();
    return ok(record);
  } catch (error) { return fail(error); }
}
