import { Phone } from "lucide-react";
import { notFound } from "next/navigation";
import { CtaBand } from "@/components/public/public-ui";
import { agents, type Locale } from "@/features/public-site/content";

export default async function AgentDetail({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  const agent = agents.find((item) => item.slug === slug);
  if (!agent) notFound();
  return <><section className="mx-auto grid max-w-[1120px] gap-10 px-5 py-16 sm:px-8 md:grid-cols-[0.75fr_1.25fr] lg:py-24"><img src={agent.image} alt={agent.name} className="aspect-[4/5] w-full rounded-md object-cover" /><div className="self-center"><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold-strong">Bersu danışmanı</p><h1 className="mt-4 font-display text-6xl font-semibold">{agent.name}</h1><p className="mt-3 text-lg text-ink-muted">{agent.role}</p><p className="mt-8 text-base leading-8 text-ink-muted">Fethiye'nin yaşam ve yatırım dinamiklerini, müşterilerinin gerçek ihtiyaçlarıyla bir araya getiren kişisel bir danışmanlık yaklaşımı sunar.</p><div className="mt-8 grid gap-3 text-sm"><a href={`tel:${agent.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 font-bold hover:text-gold-strong"><Phone className="size-4" />{agent.phone}</a></div></div></section><div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12"><CtaBand locale={locale} /></div></>;
}
