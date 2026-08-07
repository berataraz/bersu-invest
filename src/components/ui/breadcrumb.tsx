import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export type BreadcrumbItem = { label: string; href?: string };
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const t = useTranslations("Common");
  return <nav aria-label={t("breadcrumb")}><ol className="flex flex-wrap items-center gap-1.5 text-sm"><li className="text-ink-faint"><Home className="size-4" aria-label={t("home")} /></li>{items.map((item, index) => <li key={`${item.label}-${index}`} className="flex items-center gap-1.5"><ChevronRight className="size-3.5 text-ink-faint" />{item.href && index < items.length - 1 ? <Link href={item.href} className="text-ink-muted hover:text-ink">{item.label}</Link> : <span className={index === items.length - 1 ? "font-semibold text-ink" : "text-ink-muted"}>{item.label}</span>}</li>)}</ol></nav>;
}
