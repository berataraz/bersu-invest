import Link from "next/link";
import { getTranslations } from "next-intl/server";

export async function ReviewQueueEmptyState({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "ContentState" });
  return <div className="rounded-md border border-dashed border-line bg-surface px-6 py-14 text-center shadow-soft"><h2 className="font-display text-3xl font-semibold">{t("title")}</h2><p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-ink-muted">{t("description")}</p><div className="mt-7 flex flex-wrap justify-center gap-3"><Link href={`/${locale}/properties`} className="rounded-sm bg-ink px-5 py-3 text-sm font-bold text-surface hover:bg-gold-strong">{t("browse")}</Link><Link href={`/${locale}/contact`} className="rounded-sm border border-line px-5 py-3 text-sm font-bold hover:border-gold">{t("contact")}</Link></div></div>;
}
