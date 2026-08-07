import { UserStatus } from "@prisma/client";
import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).optional().nullable();

export const managedUserInputSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(254),
  phone: optionalText(40),
  whatsapp: optionalText(40),
  jobTitle: optionalText(120),
  biography: optionalText(10_000),
  image: z.string().url().max(4_096).optional().nullable(),
  preferredLocales: z.array(z.string().trim().min(2).max(12)).max(20).default([]),
  socialLinks: z.record(z.string().url().max(4_096)).optional(),
  displayOrder: z.coerce.number().int().min(0).max(100_000).default(0),
  status: z.nativeEnum(UserStatus).default(UserStatus.ACTIVE),
  roleKey: z.string().trim().min(2).max(80),
  password: z.string().min(12).max(128).optional(),
  mustChangePassword: z.boolean().default(true),
});

export const managedUserUpdateSchema = managedUserInputSchema.partial().omit({ password: true }).extend({
  password: z.string().min(12).max(128).optional(),
});
