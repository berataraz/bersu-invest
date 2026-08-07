import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/http";
import { requirePermission } from "@/lib/auth/rbac";
import { propertyInputSchema, propertyQuerySchema } from "@/modules/properties/property.schemas";
import { createProperty, listProperties } from "@/modules/properties/property.service";
import { writeAuditLog } from "@/lib/audit";
import { requestMetadata } from "@/lib/security/request";
import { assertCsrf } from "@/lib/security/csrf";

export async function GET(request: NextRequest) { try { await requirePermission("properties.read"); const query = propertyQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams)); return ok(await listProperties(query)); } catch (error) { return fail(error); } }
export async function POST(request: NextRequest) { try { assertCsrf(request); const user = await requirePermission("properties.create"); const input = propertyInputSchema.parse(await request.json()); if (input.status === "PUBLISHED") await requirePermission("properties.publish"); const property = await createProperty(input, user.id); await writeAuditLog({ actorId: user.id, action: "CREATE", entityType: "Property", entityId: property.id, after: { propertyId: property.propertyId, status: property.status }, ...requestMetadata(request) }); return ok(property, 201); } catch (error) { return fail(error); } }
