import type { Metadata } from "next";
import { Suspense } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { baseLocales, isBaseLocale, localeMetadata } from "@/i18n/config";

export function generateStaticParams() { return baseLocales.map((locale) => ({ locale })); }

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isBaseLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return { title: t("title"), description: t("description"), alternates: { canonical: `/${locale}`, languages: Object.fromEntries(baseLocales.map((item) => [item, `/${item}`])) }, openGraph: { title: t("title"), description: t("description"), locale: localeMetadata[locale].openGraphLocale, images: ["/og.png"] } };
}

export default async function PublicLayout({ children, params }: Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!isBaseLocale(locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();
  return <NextIntlClientProvider messages={messages}><Suspense fallback={<div className="h-[5.25rem] border-b border-line bg-white" />}><SiteHeader locale={locale} /></Suspense><main>{children}</main><SiteFooter locale={locale} /></NextIntlClientProvider>;
}
