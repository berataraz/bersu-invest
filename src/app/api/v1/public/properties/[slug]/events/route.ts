import { NextRequest } from "next/server";
import { PropertyInteractionType } from "@prisma/client";
import { z } from "zod";
import { assertTrustedOrigin } from "@/lib/security/csrf";
import { fail, ok, ApiError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { recordPropertyInteraction } from "@/modules/properties/property-analytics.service";

const paramsSchema = z.object({ slug: z.string().trim().min(1).max(120) });
const bodySchema = z.object({ type: z.nativeEnum(PropertyInteractionType), visitorId: z.string().uuid(), locale: z.string().trim().min(2).max(12).optional() });

function deviceCategory(userAgent: string | null) {
  const value = userAgent?.toLowerCase() ?? "";
  if (/ipad|tablet/.test(value)) return "tablet";
  if (/mobile|android|iphone/.test(value)) return "mobile";
  return "desktop";
}

export async function POST(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  try {
    assertTrustedOrigin(request);
    const { slug } = paramsSchema.parse(await context.params);
    const input = bodySchema.parse(await request.json());
    const property = await prisma.property.findFirst({ where: { slug, status: "PUBLISHED", deletedAt: null }, select: { id: true } });
    if (!property) throw new ApiError(404, "Property not found.", "PROPERTY_NOT_FOUND");
    const referer = request.headers.get("referer");
    let source: string | null = null;
    try { source = referer ? new URL(referer).hostname : null; } catch { source = null; }
    return ok(await recordPropertyInteraction({ propertyId: property.id, ...input, source, deviceCategory: deviceCategory(request.headers.get("user-agent")) }), 201);
  } catch (error) { return fail(error); }
}
