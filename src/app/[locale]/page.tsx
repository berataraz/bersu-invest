import { Suspense } from "react";
import { HomeSearchHero } from "@/components/public/home-search-hero";
import { ReviewQueueEmptyState } from "@/components/public/review-queue-empty-state";
import { type Locale } from "@/features/public-site/content";

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return <><Suspense fallback={<div className="min-h-[47rem] bg-[#171613]" />}><HomeSearchHero locale={locale} /></Suspense><section className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12"><ReviewQueueEmptyState locale={locale} /></section></>;
}
