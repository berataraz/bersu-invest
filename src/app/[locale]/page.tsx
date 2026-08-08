import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { AiRealEstateAssistant } from "@/components/public/ai-real-estate-assistant";
import { HomeSearchHero } from "@/components/public/home-search-hero";
import { PropertyCard, SectionTitle } from "@/components/public/public-ui";
import { PropertySearchForm } from "@/components/public/property-search-form";
import { ReviewQueueEmptyState } from "@/components/public/review-queue-empty-state";
import { type Locale } from "@/features/public-site/content";
import { listPublicProperties } from "@/modules/properties/public-property-list.service";
import { propertyQuerySchema } from "@/modules/properties/property.schemas";
import { getSiteContentForLocale } from "@/modules/content/site-content.service";

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const [featured, t, common, homepage, aiAssistant] = await Promise.all([listPublicProperties(propertyQuerySchema.parse({ limit: 6, sort: "newest" })), getTranslations({ locale, namespace: "Home" }), getTranslations({ locale, namespace: "Common" }), getSiteContentForLocale("homepage", locale), getSiteContentForLocale("aiAssistant", locale)]);
  return <><Suspense fallback={<div className="min-h-[47rem] bg-[#171613]" />}><HomeSearchHero locale={locale} content={homepage} assistantContent={aiAssistant} /></Suspense><section className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12"><SectionTitle eyebrow={t("featuredEyebrow")} title={homepage.featuredTitle} body={homepage.featuredDescription} link={{ href: `/${locale}/properties`, label: common("viewAll") }} />{featured.items.length ? <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{featured.items.map((property, index) => <PropertyCard key={property.slug} property={property} locale={locale} index={index} />)}</div> : <div className="mt-9"><ReviewQueueEmptyState locale={locale} /></div>}</section><section id="property-search" className="scroll-mt-24 border-y border-line bg-[#f4f2ed]"><div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 lg:px-12"><SectionTitle eyebrow={homepage.searchTitle} title={homepage.searchTitle} /><div className="mt-8 rounded-md bg-surface p-4 shadow-soft"><Suspense fallback={<div className="h-36" />}><PropertySearchForm locale={locale} /></Suspense></div></div></section><section className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12"><AiRealEstateAssistant locale={locale} content={aiAssistant} /></section></>;
}
