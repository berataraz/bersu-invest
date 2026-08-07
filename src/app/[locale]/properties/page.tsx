import { Grid2X2, List } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { PropertySearchForm } from "@/components/public/property-search-form";
import { Badge } from "@/components/ui/badge";
import { type Locale } from "@/features/public-site/content";
import { propertyQuerySchema } from "@/modules/properties/property.schemas";
import { listPublicProperties } from "@/modules/properties/public-property-list.service";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function scalarParams(values: SearchParams) {
  return Object.fromEntries(Object.entries(values).flatMap(([key, value]) => typeof value === "string" && value.trim() ? [[key, value]] : []));
}

export default async function PropertiesPage({ params, searchParams }: { params: Promise<{ locale: Locale }>; searchParams: Promise<SearchParams> }) {
  const { locale } = await params;
  const parsed = propertyQuerySchema.safeParse(scalarParams(await searchParams));
  const query = parsed.success ? parsed.data : propertyQuerySchema.parse({});
  const { items } = await listPublicProperties(query);
  const t = await getTranslations({ locale, namespace: "Pages.properties" });
  const home = await getTranslations({ locale, namespace: "Home" });
  const listingLabel = query.listingType === "FOR_RENT" ? home("rent") : home("sale");

  return <section className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8 lg:px-12"><div className="flex items-center gap-2 text-xs text-ink-faint"><Link href={`/${locale}`} className="hover:text-ink">{locale === "tr" ? "Anasayfa" : "Home"}</Link><span>/</span><span className="text-ink">{listingLabel}</span></div><div className="mt-6 flex items-end justify-between gap-4"><div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gold-strong">{t("portfolio")}</p><h1 className="mt-2 font-display text-4xl font-semibold">{t("title")}</h1></div><div className="hidden gap-2 sm:flex"><button className="grid size-9 place-items-center rounded-sm bg-ink text-white" aria-label="Grid view"><Grid2X2 className="size-4" /></button><button className="grid size-9 place-items-center rounded-sm border border-line" aria-label="List view"><List className="size-4" /></button></div></div><div className="mt-8 grid gap-6 lg:grid-cols-[19rem_minmax(0,1fr)]"><aside className="h-fit rounded-md border border-line bg-surface p-5"><p className="text-sm font-bold">{t("filters")}</p><div className="mt-4"><PropertySearchForm locale={locale} compact /></div></aside><div><div className="flex flex-col justify-between gap-3 border-b border-line pb-4 sm:flex-row sm:items-center"><p className="text-sm text-ink-muted"><strong className="text-ink">{items.length}</strong> {t("found", { count: items.length })}</p></div>{!parsed.success && <p role="alert" className="mt-4 rounded-sm border border-danger/30 bg-danger/5 p-3 text-sm font-bold text-danger">{home("priceOrder")}</p>}<div className="mt-5 grid gap-4">{items.map((property) => <article key={property.slug} className="group grid gap-4 rounded-md border border-line bg-surface p-3 shadow-soft sm:grid-cols-[13rem_minmax(0,1fr)]"><Link href={`/${locale}/properties/${property.slug}`} className="relative block overflow-hidden rounded-sm"><img src={property.image} alt={property.title} className="aspect-[4/3] size-full object-cover" /><Badge variant="gold" className="absolute left-3 top-3">{property.tag}</Badge></Link><div className="flex min-w-0 flex-col p-1"><p className="text-[10px] font-bold uppercase tracking-[0.1em] text-gold-strong">{property.type} · {property.area}</p><Link href={`/${locale}/properties/${property.slug}`}><h2 className="mt-2 font-display text-2xl font-semibold">{property.title}</h2></Link><div className="mt-auto flex items-end justify-between border-t border-line pt-4"><p className="font-display text-2xl font-semibold text-[#b1771b]">{property.price}</p><Link href={`/${locale}/properties/${property.slug}`} className="rounded-sm bg-[#b88736] px-4 py-2.5 text-xs font-bold text-white">{locale === "tr" ? "Detay" : "Details"}</Link></div></div></article>)}</div>{items.length === 0 && <div className="mt-5 rounded-md border border-dashed border-line p-10 text-center text-ink-muted">{locale === "tr" ? "Bu filtreye uygun ilan bulunamadı." : "No listings match these filters."}</div>}</div></div></section>;
}
