import { type LanguageDirection } from "@prisma/client";
import { ApiError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { type z } from "zod";
import { languageInputSchema, translationEntryInputSchema } from "@/modules/i18n/language.schemas";

type LanguageInput = z.infer<typeof languageInputSchema>;
type TranslationInput = z.infer<typeof translationEntryInputSchema>;

export async function listLanguages() {
  return prisma.language.findMany({ where: { deletedAt: null }, orderBy: [{ sortOrder: "asc" }, { code: "asc" }], include: { _count: { select: { translations: { where: { deletedAt: null } } } } } });
}

export async function saveLanguage(input: LanguageInput) {
  return prisma.$transaction(async (tx) => {
    if (input.isDefault) await tx.language.updateMany({ where: { isDefault: true, code: { not: input.code } }, data: { isDefault: false } });
    return tx.language.upsert({ where: { code: input.code }, create: { ...input, direction: input.direction as LanguageDirection }, update: { ...input, direction: input.direction as LanguageDirection, deletedAt: null } });
  });
}

export async function archiveLanguage(id: string) {
  const language = await prisma.language.findUnique({ where: { id } });
  if (!language || language.deletedAt) throw new ApiError(404, "Language not found.", "LANGUAGE_NOT_FOUND");
  if (language.isDefault) throw new ApiError(409, "The default language cannot be archived.", "DEFAULT_LANGUAGE_ARCHIVE_FORBIDDEN");
  return prisma.language.update({ where: { id }, data: { isEnabled: false, deletedAt: new Date() } });
}

export async function upsertTranslation(languageId: string, input: TranslationInput) {
  const language = await prisma.language.findFirst({ where: { id: languageId, deletedAt: null }, select: { id: true } });
  if (!language) throw new ApiError(404, "Language not found.", "LANGUAGE_NOT_FOUND");
  return prisma.translationEntry.upsert({ where: { languageId_namespace_key: { languageId, namespace: input.namespace, key: input.key } }, create: { languageId, ...input }, update: { value: input.value, deletedAt: null } });
}
