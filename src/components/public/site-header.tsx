"use client";

import { ChevronDown, Menu, Phone, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { BrandMark } from "@/components/ui/navigation";
import { companyProfile } from "@/features/company/company-profile";
import { type AppLocale, baseLocales } from "@/i18n/config";
import { cn } from "@/lib/cn";

export function SiteHeader({ locale }: { locale: AppLocale }) {
  const [open, setOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const pathname = usePathname(); const searchParams = useSearchParams();
  const t = useTranslations("Navigation");
  const extra = useTranslations("NavigationExtra");
  const language = useTranslations("Language");
  const links = [["", t("home")], ["properties?listingType=FOR_SALE", extra("sale")], ["properties?listingType=FOR_RENT", extra("rent")], ["projects", t("projects")], ["regions", t("regions")], ["agents", t("agents")], ["blog", t("blog")], ["about", t("about")], ["contact", t("contact")]] as const;
  const hrefFor = (target: string) => `/${locale}${target ? `/${target}` : ""}`;
  const switchLocale = (target: AppLocale) => `${pathname.replace(`/${locale}`, `/${target}`)}${searchParams.size ? `?${searchParams.toString()}` : ""}`;
  const active = (target: string) => target ? pathname === `/${locale}/${target.split("?")[0]}` : pathname === `/${locale}`;

  return <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur-xl"><div className="mx-auto flex h-[5.25rem] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12"><Link href={`/${locale}`} aria-label={t("home")}><BrandMark /></Link><nav className="hidden items-center gap-3 xl:flex" aria-label={t("primary")}>{links.map(([target, label]) => <Link key={target} href={hrefFor(target)} aria-current={active(target) ? "page" : undefined} className={cn("text-[10px] font-bold transition-colors hover:text-gold-strong", active(target) ? "text-gold-strong" : "text-ink")}>{label}</Link>)}</nav><div className="hidden items-center gap-3 md:flex"><a href={`tel:${companyProfile.phoneE164}`} className="text-xs font-bold text-ink-muted hover:text-ink"><Phone className="mr-1 inline size-3.5" />{companyProfile.phoneDisplay}</a><div className="relative"><button onClick={() => setLanguageOpen(!languageOpen)} className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.1em] text-ink hover:text-gold-strong" aria-label={language("label")} aria-expanded={languageOpen}>{locale}<ChevronDown className="size-3.5" /></button>{languageOpen && <div className="absolute right-0 top-8 w-32 rounded-md border border-line bg-surface p-1.5 shadow-float">{baseLocales.map((item) => <Link key={item} href={switchLocale(item)} onClick={() => setLanguageOpen(false)} className={cn("block rounded-sm px-3 py-2 text-xs font-bold hover:bg-surface-subtle", item === locale && "text-gold-strong")}>{language(item)}</Link>)}</div>}</div><Link href="/admin/login" className="rounded-sm border border-line px-3 py-2 text-xs font-bold text-ink transition hover:border-gold hover:text-gold-strong">{extra("authorizedLogin")}</Link><Link href={`/${locale}/contact?intent=sell`} className="rounded-sm bg-[#b88736] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-ink">{t("listProperty")}</Link></div><button className="grid size-10 place-items-center xl:hidden" onClick={() => setOpen(!open)} aria-label={open ? t("close") : t("open")} aria-expanded={open}>{open ? <X className="size-5" /> : <Menu className="size-5" />}</button></div>{open && <div className="border-t border-line bg-surface px-5 py-5 xl:hidden"><nav className="grid gap-1">{links.map(([target, label]) => <Link key={target} href={hrefFor(target)} onClick={() => setOpen(false)} className={cn("rounded-sm px-3 py-3 text-sm font-bold hover:bg-surface-subtle", active(target) && "text-gold-strong")}>{label}</Link>)}<Link href="/admin/login" onClick={() => setOpen(false)} className="mt-2 rounded-sm border border-line px-3 py-3 text-center text-sm font-bold">{extra("authorizedLogin")}</Link><Link href={`/${locale}/contact?intent=sell`} onClick={() => setOpen(false)} className="rounded-sm bg-[#b88736] px-3 py-3 text-center text-sm font-bold text-white">{t("listProperty")}</Link></nav></div>}</header>;
}
