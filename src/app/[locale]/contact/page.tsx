import { Clock3, MapPin, Phone } from "lucide-react";
import { ContactRequestForm } from "@/components/public/contact-request-form";
import { PageHero } from "@/components/public/public-ui";
import { companyProfile } from "@/features/company/company-profile";
import { type Locale, siteImages } from "@/features/public-site/content";

export default async function ContactPage({ params, searchParams }: { params: Promise<{ locale: Locale }>; searchParams: Promise<{ property?: string; intent?: string }> }) {
  const { locale } = await params;
  const query = await searchParams;
  const intent = query.intent === "sell" ? "SELL" : query.intent === "buy" ? "BUY" : "CONTACT";
  return <><PageHero eyebrow="İletişim" title="Bir kahve, bir harita, iyi bir başlangıç." description="Fethiye ofisimizde ya da görüntülü görüşmede, aradığınız yaşamı birlikte konuşalım." image={siteImages.marina} /><section className="mx-auto grid max-w-[1440px] gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-12"><div className="grid gap-6"><p className="flex gap-3 text-sm leading-6"><MapPin className="mt-1 size-4 text-gold-strong" /><span>{companyProfile.addressLines.map((line) => <span key={line}>{line}<br /></span>)}</span></p><a className="flex gap-3 text-sm font-bold hover:text-gold-strong" href={`tel:${companyProfile.phoneE164}`}><Phone className="size-4 text-gold-strong" />{companyProfile.phoneDisplay}</a><p className="flex gap-3 text-sm leading-6"><Clock3 className="mt-1 size-4 text-gold-strong" />Pazartesi - Cumartesi<br />09.00 - 18.00</p></div><ContactRequestForm locale={locale} propertySlug={query.property} intent={intent} /></section></>;
}
