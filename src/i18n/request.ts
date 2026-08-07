import { getRequestConfig } from "next-intl/server";
import { defaultLocale, isBaseLocale } from "@/i18n/config";

const catalogs = {
  tr: () => import("../../messages/tr.json"),
  en: () => import("../../messages/en.json"),
  de: () => import("../../messages/de.json"),
  ru: () => import("../../messages/ru.json"),
};

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale;
  const locale = isBaseLocale(requestedLocale) ? requestedLocale : defaultLocale;
  return { locale, messages: (await catalogs[locale]()).default };
});
