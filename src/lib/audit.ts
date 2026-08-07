import { AuditAction, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function writeAuditLog(input: {
  actorId?: string | null;
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  before?: Prisma.InputJsonValue;
  after?: Prisma.InputJsonValue;
  ipHash?: string | null;
  userAgent?: string | null;
  requestId?: string | null;
}) {
  await prisma.auditLog.create({ data: input });
}
