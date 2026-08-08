"use client";

import { useTranslations } from "next-intl";
import { AiRealEstateAssistant } from "@/components/public/ai-real-estate-assistant";
import { Eyebrow } from "@/components/public/public-ui";
import { Reveal } from "@/components/public/reveal";
import { siteImages } from "@/features/public-site/content";

export function HomeSearchHero({ locale, content, assistantContent }: { locale: string; content: Record<string, string>; assistantContent: Record<string, string> }) {
  const t = useTranslations("Home");
  return <section className="relative isolate min-h-[calc(100svh-5.25rem)] overflow-hidden bg-[#171613] text-white"><img src={siteImages.hero} alt="Fethiye coast" className="absolute inset-0 -z-20 size-full scale-[1.035] object-cover opacity-80 motion-safe:animate-[hero-drift_18s_ease-in-out_infinite_alternate]" /><div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(12,12,10,.86),rgba(12,12,10,.44)_54%,rgba(12,12,10,.18))]" /><div className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-[#171613]/70 to-transparent" /><div className="mx-auto flex min-h-[calc(100svh-5.25rem)] max-w-[1440px] items-end px-5 pb-16 pt-24 sm:px-8 lg:px-12 lg:pb-20"><div className="w-full"><Reveal><Eyebrow className="text-gold">{t("heroEyebrow")}</Eyebrow><h1 className="mt-5 max-w-5xl font-display text-5xl font-semibold leading-[0.94] tracking-tight sm:text-7xl lg:text-[5.6rem]">{content.heroTitle}</h1><p className="mt-6 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">{content.heroSubtitle}</p></Reveal><AiRealEstateAssistant locale={locale} variant="hero" content={{ ...assistantContent, primaryCta: content.primaryCta, secondaryCta: content.secondaryCta, tertiaryCta: content.tertiaryCta }} /><a href="#property-search" className="mt-10 inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.18em] text-white/70 transition hover:text-gold"><span className="block h-9 w-px bg-gold" />{content.searchTitle}</a></div></div></section>;
}
