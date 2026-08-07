import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { baseLocales, defaultLocale, type AppLocale } from "@/i18n/config";

function preferredLocale(acceptLanguage: string | null): AppLocale {
  const requested = acceptLanguage?.split(",").map((entry) => entry.trim().split(";")[0]?.toLowerCase().split("-")[0]).filter(Boolean) ?? [];
  return requested.find((locale): locale is AppLocale => baseLocales.includes(locale as AppLocale)) ?? defaultLocale;
}

export default async function RootPage() {
  redirect(`/${preferredLocale((await headers()).get("accept-language"))}`);
}
