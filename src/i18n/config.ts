export const baseLocales = ["tr", "en", "de", "ru"] as const;
export type AppLocale = (typeof baseLocales)[number];
export const defaultLocale: AppLocale = "tr";

export function isBaseLocale(locale: string | undefined): locale is AppLocale {
  return Boolean(locale && baseLocales.includes(locale as AppLocale));
}

export const localeMetadata: Record<AppLocale, { name: string; htmlLang: string; openGraphLocale: string }> = {
  tr: { name: "Türkçe", htmlLang: "tr", openGraphLocale: "tr_TR" },
  en: { name: "English", htmlLang: "en", openGraphLocale: "en_US" },
  de: { name: "Deutsch", htmlLang: "de", openGraphLocale: "de_DE" },
  ru: { name: "Русский", htmlLang: "ru", openGraphLocale: "ru_RU" },
};
