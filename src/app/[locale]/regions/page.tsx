import { PageHero } from "@/components/public/public-ui";
import { ReviewQueueEmptyState } from "@/components/public/review-queue-empty-state";
import { type Locale, siteImages } from "@/features/public-site/content";
import { getTranslations } from "next-intl/server";

export default async function RegionsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ContentState" });
  return <><PageHero eyebrow="Bersu Invest" title={t("regionsTitle")} description={t("regionsDescription")} image={siteImages.marina} /><section className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-12"><ReviewQueueEmptyState locale={locale} /></section></>;
}
