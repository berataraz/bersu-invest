"use client";

import { useTranslations } from "next-intl";
import { Eyebrow } from "@/components/public/public-ui";
import { PropertySearchForm } from "@/components/public/property-search-form";
import { Reveal } from "@/components/public/reveal";
import { siteImages } from "@/features/public-site/content";

export function HomeSearchHero({ locale }: { locale: string }) {
  const t = useTranslations("Home");
  return <section className="relative isolate min-h-[min(47rem,calc(100svh-4.75rem))] overflow-hidden bg-[#171613] text-white"><img src={siteImages.hero} alt="Fethiye coast" className="absolute inset-0 -z-20 size-full object-cover opacity-75" /><div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(12,12,10,.83),rgba(12,12,10,.34)_58%,rgba(12,12,10,.12))]" /><div className="mx-auto flex min-h-[min(47rem,calc(100svh-4.75rem))] max-w-[1440px] items-end px-5 pb-14 pt-20 sm:px-8 lg:px-12 lg:pb-20"><div className="w-full"><Reveal><Eyebrow className="text-gold">{t("heroEyebrow")}</Eyebrow><h1 className="mt-5 max-w-4xl font-display text-5xl font-semibold leading-[0.91] tracking-tight sm:text-7xl lg:text-8xl">{t("heroTitle")}</h1><p className="mt-6 max-w-xl text-base leading-7 text-white/75">{t("heroBody")}</p></Reveal><div className="mt-10 max-w-5xl rounded-md bg-surface p-4 text-ink shadow-float"><PropertySearchForm locale={locale} /></div></div></div></section>;
}
