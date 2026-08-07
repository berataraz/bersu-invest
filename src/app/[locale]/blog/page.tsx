import { PageHero } from "@/components/public/public-ui";
import { ReviewQueueEmptyState } from "@/components/public/review-queue-empty-state";
import { type Locale, siteImages } from "@/features/public-site/content";
import { getTranslations } from "next-intl/server";

export default async function BlogPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ContentState" });
  return <><PageHero eyebrow="Bersu Invest" title={t("journalTitle")} description={t("journalDescription")} image={siteImages.coast} /><section className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-12"><ReviewQueueEmptyState locale={locale} /></section></>;
}
