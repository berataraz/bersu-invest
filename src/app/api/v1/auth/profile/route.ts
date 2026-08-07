import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser } from "@/lib/auth/rbac";
import { assertCsrf } from "@/lib/security/csrf";
import { writeAuditLog } from "@/lib/audit";
import { requestMetadata } from "@/lib/security/request";

const updateSchema = z.object({ firstName: z.string().trim().min(1).max(80), lastName: z.string().trim().min(1).max(80), image: z.string().url().max(2048).nullable().optional() });

export async function GET() {
  try {
    const user = await requireAuthenticatedUser();
    return ok({ id: user.id, email: user.email, emailVerified: user.emailVerified, firstName: user.firstName, lastName: user.lastName, image: user.image, lastLoginAt: user.lastLoginAt, createdAt: user.createdAt });
  } catch (error) { return fail(error); }
}

export async function PATCH(request: NextRequest) {
  try {
    assertCsrf(request);
    const user = await requireAuthenticatedUser();
    const data = updateSchema.parse(await request.json());
    const updated = await prisma.user.update({ where: { id: user.id }, data });
    await writeAuditLog({ actorId: user.id, action: "UPDATE", entityType: "User", entityId: user.id, before: { firstName: user.firstName, lastName: user.lastName, image: user.image }, after: { firstName: updated.firstName, lastName: updated.lastName, image: updated.image }, ...requestMetadata(request) });
    return ok({ id: updated.id, email: updated.email, firstName: updated.firstName, lastName: updated.lastName, image: updated.image });
  } catch (error) { return fail(error); }
}
