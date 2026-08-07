import { NextRequest } from "next/server";
import { z } from "zod";
import { fail, noContent, ApiError } from "@/lib/http";
import { requireAuthenticatedUser } from "@/lib/auth/rbac";
import { assertCsrf } from "@/lib/security/csrf";
import { revokeSession } from "@/lib/auth/refresh-tokens";
import { writeAuditLog } from "@/lib/audit";
import { requestMetadata } from "@/lib/security/request";

const paramsSchema = z.object({ sessionId: z.string().uuid() });

export async function DELETE(request: NextRequest, context: { params: Promise<{ sessionId: string }> }) {
  try {
    assertCsrf(request);
    const user = await requireAuthenticatedUser();
    const { sessionId } = paramsSchema.parse(await context.params);
    if (!(await revokeSession(user.id, sessionId))) throw new ApiError(404, "Session not found.", "SESSION_NOT_FOUND");
    await writeAuditLog({ actorId: user.id, action: "SESSION_REVOKED", entityType: "AuthSession", entityId: sessionId, ...requestMetadata(request) });
    return noContent();
  } catch (error) { return fail(error); }
}
