import { ArrowUpRight, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { BrandMark } from "@/components/ui/navigation";
import { companyProfile } from "@/features/company/company-profile";
import { type AppLocale } from "@/i18n/config";

export function SiteFooter({ locale }: { locale: AppLocale }) {
  const navigation = useTranslations("Navigation");
  const t = useTranslations("Footer");
  const navigate = [[navigation("about"), "about"], [navigation("regions"), "regions"], [navigation("properties"), "properties"], [navigation("projects"), "projects"], [navigation("agents"), "agents"], [navigation("blog"), "blog"]];
  return <footer className="mt-24 bg-[#171613] text-[#f8f4ed]"><div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-12 lg:py-20"><div><BrandMark className="rounded-sm bg-white px-3 py-1" /><p className="mt-6 max-w-xs text-sm leading-7 text-[#c7beb0]">{t("description")}</p></div><div><h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold">{t("discover")}</h2><ul className="mt-5 grid gap-3">{navigate.map(([label, href]) => <li key={href}><Link href={`/${locale}/${href}`} className="text-sm text-[#ddd6cc] hover:text-gold">{label}</Link></li>)}</ul></div><div><h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold">{t("office")}</h2><div className="mt-5 grid gap-4 text-sm leading-6 text-[#ddd6cc]"><p className="flex gap-2"><MapPin className="mt-1 size-4 shrink-0 text-gold" /><span>{companyProfile.addressLines.map((line) => <span key={line}>{line}<br /></span>)}</span></p><a className="flex gap-2 hover:text-gold" href={`tel:${companyProfile.phoneE164}`}><Phone className="mt-1 size-4 shrink-0 text-gold" />{companyProfile.phoneDisplay}</a><Link href={`/${locale}/contact`} className="inline-flex items-center gap-1 font-bold text-gold hover:text-white">{t("contact")} <ArrowUpRight className="size-4" /></Link></div></div></div><div className="border-t border-white/10"><div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-5 py-6 text-xs text-[#9b9387] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12"><span>© {new Date().getFullYear()} {t("copyright")}</span><div className="flex flex-wrap gap-x-5 gap-y-2"><Link href={`/${locale}/privacy-policy`}>{t("privacy")}</Link><Link href={`/${locale}/kvkk`}>{t("kvkk")}</Link><Link href={`/${locale}/cookie-policy`}>{t("cookie")}</Link></div></div></div></footer>;
}
