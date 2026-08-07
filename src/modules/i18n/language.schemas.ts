import { z } from "zod";

export const languageInputSchema = z.object({
  code: z.string().trim().regex(/^[a-z]{2,3}(?:-[A-Z]{2})?$/).max(12),
  nativeName: z.string().trim().min(2).max(100),
  englishName: z.string().trim().min(2).max(100),
  direction: z.enum(["LTR", "RTL"]).default("LTR"),
  isEnabled: z.boolean().default(false),
  isDefault: z.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).max(10_000).default(0),
});

export const translationEntryInputSchema = z.object({
  namespace: z.string().trim().min(1).max(120),
  key: z.string().trim().min(1).max(240),
  value: z.string().trim().min(1).max(100_000),
});
