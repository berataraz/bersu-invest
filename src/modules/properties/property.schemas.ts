import { ListingType, PropertyMediaKind, PropertyStatus } from "@prisma/client";
import { z } from "zod";

const decimal = z.coerce.number().finite().nonnegative();

const propertyBaseSchema = z.object({
  propertyId: z.string().trim().min(3).max(80).regex(/^[A-Za-z0-9][A-Za-z0-9/_-]*$/, "Listing number contains unsupported characters.").optional(),
  typeId: z.string().uuid(), listingType: z.nativeEnum(ListingType), title: z.string().trim().min(5).max(180), summary: z.string().trim().max(500).optional().nullable(), description: z.string().trim().max(20_000).optional().nullable(), price: decimal.optional().nullable(), currencyCode: z.string().length(3).default("TRY"), city: z.string().trim().min(2).max(80), district: z.string().trim().max(80).optional().nullable(), neighborhood: z.string().trim().max(80).optional().nullable(), addressLine: z.string().trim().max(500).optional().nullable(), latitude: z.coerce.number().min(-90).max(90).optional().nullable(), longitude: z.coerce.number().min(-180).max(180).optional().nullable(), grossAreaM2: decimal.optional().nullable(), netAreaM2: decimal.optional().nullable(), bedrooms: z.coerce.number().int().min(0).max(30).optional().nullable(), bathrooms: z.coerce.number().int().min(0).max(30).optional().nullable(), floors: z.coerce.number().int().min(0).max(100).optional().nullable(), featured: z.boolean().default(false), details: z.record(z.string(), z.any()).optional(), status: z.nativeEnum(PropertyStatus).optional(),
  assignedAgentId: z.string().uuid().optional().nullable(),
});

export const propertyInputSchema = propertyBaseSchema;
export const propertyUpdateSchema = propertyBaseSchema.partial();

export const propertyQuerySchema = z.object({ q: z.string().trim().max(100).optional(), status: z.nativeEnum(PropertyStatus).optional(), listingType: z.nativeEnum(ListingType).optional(), typeId: z.string().uuid().optional(), propertyType: z.string().trim().min(1).max(80).optional(), city: z.string().trim().max(80).optional(), district: z.string().trim().max(80).optional(), minPrice: decimal.optional(), maxPrice: decimal.optional(), minArea: decimal.optional(), bedrooms: z.coerce.number().int().min(0).max(30).optional(), sort: z.enum(["newest", "price_asc", "price_desc", "area_desc"]).default("newest"), cursor: z.string().uuid().optional(), limit: z.coerce.number().int().min(1).max(100).default(24) }).superRefine((value, context) => { if (value.minPrice !== undefined && value.maxPrice !== undefined && value.minPrice > value.maxPrice) context.addIssue({ code: z.ZodIssueCode.custom, path: ["maxPrice"], message: "maxPrice must be greater than or equal to minPrice" }); });

export const propertyMediaSchema = z.object({ kind: z.nativeEnum(PropertyMediaKind), url: z.string().url().max(4_096), storageKey: z.string().max(1_024).optional(), title: z.string().trim().max(180).optional(), altText: z.string().trim().max(255).optional(), mimeType: z.string().max(120).optional(), sortOrder: z.coerce.number().int().min(0).max(10_000).default(0), isCover: z.boolean().default(false), isPublic: z.boolean().default(true), metadata: z.record(z.string(), z.any()).optional() });
