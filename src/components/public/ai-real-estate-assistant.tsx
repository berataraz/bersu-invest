"use client";

import { ArrowRight, Bot, Building2, LoaderCircle, MessageCircle, Phone, Send, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { companyProfile } from "@/features/company/company-profile";

type Property = { id: string; slug: string; propertyId: string; title: string; listingType: string; price: string | null; currencyCode: string; city: string; district: string | null; neighborhood: string | null; bedrooms: number | null; bathrooms: number | null; grossAreaM2: string | null; type: string; image: string | null; agent: { firstName: string; lastName: string; phone: string | null; whatsapp: string | null } | null };
type AssistantReply = { conversationId: string; answer: string; recommendations: Property[]; intent: string; filters: Record<string, unknown>; needsLead: boolean };
type Message = { role: "assistant" | "user"; content: string; recommendations?: Property[]; needsLead?: boolean; filters?: Record<string, unknown> };

function localeForNumber(locale: string) { return locale === "tr" ? "tr-TR" : locale === "de" ? "de-DE" : locale === "ru" ? "ru-RU" : "en-GB"; }

async function csrfToken() {
  const response = await fetch("/api/v1/auth/csrf", { credentials: "same-origin", cache: "no-store" });
  if (!response.ok) throw new Error("CSRF");
  return response.headers.get("x-csrf-token") ?? "";
}

export function AiRealEstateAssistant({ locale, variant = "section", content = {} }: { locale: string; variant?: "hero" | "section"; content?: Record<string, string> }) {
  const t = useTranslations("AiAssistant");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [leadOpen, setLeadOpen] = useState(false);
  const [leadState, setLeadState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const lastReply = useRef<Message | null>(null);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  const ask = async (value: string) => {
    const message = value.trim();
    if (!message || sending) return;
    setOpen(true); setDraft(""); setSending(true); setLeadOpen(false);
    setMessages((current) => [...current, { role: "user", content: message }]);
    try {
      const token = await csrfToken();
      const response = await fetch("/api/v1/ai/chat", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json", "x-csrf-token": token }, body: JSON.stringify({ message, locale, conversationId }) });
      const payload = await response.json() as { data?: AssistantReply; error?: { message?: string } };
      if (!response.ok || !payload.data) throw new Error(payload.error?.message ?? "AI_REQUEST_FAILED");
      setConversationId(payload.data.conversationId);
      const assistantMessage: Message = { role: "assistant", content: payload.data.answer, recommendations: payload.data.recommendations, needsLead: payload.data.needsLead, filters: payload.data.filters };
      lastReply.current = assistantMessage;
      setMessages((current) => [...current, assistantMessage]);
    } catch {
      setMessages((current) => [...current, { role: "assistant", content: t("unavailable") }]);
    } finally { setSending(false); }
  };

  const saveLead = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!conversationId || !lastReply.current) return;
    setLeadState("sending");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/v1/public/ai-leads", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({
        conversationId, locale, firstName: form.get("firstName"), phone: form.get("phone"), email: form.get("email"), communicationPreference: form.get("communicationPreference"), requirements: lastReply.current.filters ?? {}, summary: lastReply.current.content, recommendedPropertyIds: lastReply.current.recommendations?.map((property) => property.id) ?? [],
      }) });
      if (!response.ok) throw new Error("LEAD_REQUEST_FAILED");
      setLeadState("success");
    } catch { setLeadState("error"); }
  };

  const copy = (key: string, fallbackKey: Parameters<typeof t>[0]) => content[key]?.trim() || t(fallbackKey);
  const prompts = [copy("promptOne", "promptInvestment"), copy("promptTwo", "promptVilla"), copy("promptThree", "promptRent"), copy("promptFour", "promptSell")];
  const openWithPrompt = (prompt: string) => { setOpen(true); void ask(prompt); };
  const whatsappMessage = encodeURIComponent(`${t("whatsappPrefix")} ${lastReply.current?.content ?? ""}`);
  const whatsappUrl = `https://wa.me/${companyProfile.phoneE164.replace(/\D/g, "")}?text=${whatsappMessage}`;

  return <>
    {variant === "hero" ? <div className="mt-9 flex flex-wrap gap-3"><button type="button" onClick={() => setOpen(true)} className="inline-flex h-12 items-center gap-2 rounded-sm bg-gold px-5 text-sm font-bold text-[#1d1810] shadow-soft transition hover:bg-white"><Sparkles className="size-4" />{copy("primaryCta", "ask")}</button><a href="#property-search" className="inline-flex h-12 items-center gap-2 rounded-sm border border-white/40 px-5 text-sm font-bold text-white transition hover:border-white hover:bg-white/10">{copy("secondaryCta", "detailedSearch")}<ArrowRight className="size-4" /></a><Link href={`/${locale}/contact?intent=sell`} className="inline-flex h-12 items-center gap-2 px-2 text-sm font-bold text-white/80 transition hover:text-gold">{copy("tertiaryCta", "promptSell")}<ArrowRight className="size-4" /></Link></div> : <section className="overflow-hidden rounded-lg border border-line bg-[#efede7] p-6 sm:p-10 lg:p-14"><div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end"><div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold-strong">{t("eyebrow")}</p><h2 className="mt-4 max-w-2xl font-display text-4xl font-semibold leading-[.96] tracking-tight sm:text-5xl">{copy("name", "title")}</h2><p className="mt-5 max-w-xl text-sm leading-7 text-ink-muted">{copy("description", "body")}</p></div><form onSubmit={(event) => { event.preventDefault(); void ask(draft); }} className="rounded-md bg-white p-3 shadow-soft"><label className="sr-only" htmlFor="ai-assistant-entry">{t("inputLabel")}</label><textarea id="ai-assistant-entry" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={copy("placeholder", "placeholder")} className="min-h-24 w-full resize-none bg-transparent p-3 text-sm leading-6 outline-none placeholder:text-ink-faint" /><button type="submit" disabled={!draft.trim()} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-sm bg-ink px-4 text-sm font-bold text-white transition hover:bg-gold-strong disabled:cursor-not-allowed disabled:opacity-50"><Sparkles className="size-4" />{t("ask")}</button></form></div><div className="mt-8 flex flex-wrap gap-2">{prompts.map((prompt) => <button key={prompt} type="button" onClick={() => openWithPrompt(prompt)} className="rounded-full border border-line bg-white px-3.5 py-2 text-xs font-bold text-ink transition hover:border-gold hover:text-gold-strong">{prompt}</button>)}</div></section>}

    {open && <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/45 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="presentation"><section role="dialog" aria-modal="true" aria-labelledby="ai-assistant-title" className="flex h-[min(46rem,100dvh)] w-full max-w-4xl flex-col overflow-hidden rounded-t-xl bg-[#fbfaf7] shadow-float sm:h-[min(46rem,calc(100dvh-3rem))] sm:rounded-xl"><header className="flex items-center justify-between border-b border-line bg-white px-5 py-4 sm:px-7"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-[#1d1a14] text-gold"><Bot className="size-5" /></span><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-gold-strong">{t("eyebrow")}</p><h2 id="ai-assistant-title" className="font-display text-xl font-semibold">{t("name")}</h2></div></div><button type="button" onClick={() => setOpen(false)} className="grid size-10 place-items-center rounded-sm text-ink-muted transition hover:bg-surface-subtle hover:text-ink" aria-label={t("close")}><X className="size-5" /></button></header>
      <div className="flex-1 overflow-y-auto p-5 sm:p-7"><div className="max-w-2xl rounded-md bg-[#ece8df] p-4 text-sm leading-6 text-ink"><p>{copy("welcome", "welcome")}</p><p className="mt-2 text-xs text-ink-muted">{copy("disclaimer", "disclaimer")}</p></div><div className="mt-5 grid gap-4">{messages.map((message, index) => <div key={`${message.role}-${index}`} className={message.role === "user" ? "ml-auto max-w-[85%] rounded-md bg-ink px-4 py-3 text-sm leading-6 text-white" : "max-w-3xl rounded-md bg-white p-4 text-sm leading-6 text-ink shadow-soft"}><p>{message.content}</p>{message.recommendations?.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{message.recommendations.map((property) => <article key={property.id} className="overflow-hidden rounded-sm border border-line bg-surface"><div className="aspect-[16/9] bg-surface-subtle">{property.image ? <img src={property.image} alt={property.title} className="size-full object-cover" /> : <div className="grid size-full place-items-center text-ink-faint"><Building2 className="size-6" /></div>}</div><div className="p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-gold-strong">{property.propertyId} · {property.type}</p><h3 className="mt-1 font-display text-lg font-semibold leading-tight">{property.title}</h3><p className="mt-1 text-xs text-ink-muted">{[property.neighborhood, property.district, property.city].filter(Boolean).join(", ")}</p><div className="mt-3 flex items-end justify-between gap-2"><strong className="text-sm">{property.price ? new Intl.NumberFormat(localeForNumber(locale), { style: "currency", currency: property.currencyCode, maximumFractionDigits: 0 }).format(Number(property.price)) : t("priceOnRequest")}</strong><Link href={`/${locale}/properties/${property.slug}`} className="inline-flex items-center gap-1 text-xs font-bold text-gold-strong">{t("viewProperty")}<ArrowRight className="size-3.5" /></Link></div></div></article>)}</div> : null}{message.needsLead ? <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => setLeadOpen(true)} className="inline-flex h-10 items-center gap-2 rounded-sm bg-ink px-4 text-xs font-bold text-white hover:bg-gold-strong"><Send className="size-3.5" />{t("saveRequest")}</button><a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-sm border border-line px-4 text-xs font-bold hover:border-gold"><MessageCircle className="size-3.5" />{t("whatsapp")}</a></div> : null}</div>)}</div>{sending && <div className="mt-5 flex items-center gap-2 text-sm text-ink-muted"><LoaderCircle className="size-4 animate-spin text-gold-strong" />{t("thinking")}</div>}{leadOpen && <form onSubmit={saveLead} className="mt-6 max-w-2xl rounded-md border border-gold/35 bg-gold-soft p-4"><p className="font-display text-xl font-semibold">{t("leadTitle")}</p><p className="mt-1 text-xs leading-5 text-ink-muted">{t("leadBody")}</p><div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="grid gap-1.5 text-xs font-bold">{t("leadName")}<input name="firstName" required minLength={2} className="h-10 rounded-sm border border-line bg-white px-3 text-sm" /></label><label className="grid gap-1.5 text-xs font-bold">{t("leadPhone")}<input name="phone" required type="tel" className="h-10 rounded-sm border border-line bg-white px-3 text-sm" /></label><label className="grid gap-1.5 text-xs font-bold sm:col-span-2">{t("leadEmail")}<input name="email" type="email" className="h-10 rounded-sm border border-line bg-white px-3 text-sm" /></label><label className="grid gap-1.5 text-xs font-bold sm:col-span-2">{t("communication")}<select name="communicationPreference" className="h-10 rounded-sm border border-line bg-white px-3 text-sm"><option value="PHONE">{t("phone")}</option><option value="WHATSAPP">WhatsApp</option><option value="EMAIL">{t("email")}</option></select></label></div>{leadState === "success" ? <p role="status" className="mt-4 text-sm font-bold text-success">{t("leadSuccess")}</p> : <button disabled={leadState === "sending"} className="mt-4 inline-flex h-10 items-center gap-2 rounded-sm bg-ink px-4 text-xs font-bold text-white disabled:opacity-60"><Phone className="size-3.5" />{leadState === "sending" ? t("sending") : t("submitRequest")}</button>}{leadState === "error" ? <p role="alert" className="mt-3 text-xs font-bold text-danger">{t("leadError")}</p> : null}</form>}</div>
      <form onSubmit={(event) => { event.preventDefault(); void ask(draft); }} className="border-t border-line bg-white p-4 sm:px-7"><label className="sr-only" htmlFor="assistant-message">{t("inputLabel")}</label><div className="flex gap-2"><input id="assistant-message" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={t("placeholder")} className="h-12 min-w-0 flex-1 rounded-sm border border-line bg-surface px-4 text-sm outline-none transition focus:border-gold" /><button type="submit" disabled={sending || !draft.trim()} className="grid size-12 place-items-center rounded-sm bg-ink text-white transition hover:bg-gold-strong disabled:cursor-not-allowed disabled:opacity-50" aria-label={t("send")}><Send className="size-4" /></button></div></form>
    </section></div>}
  </>;
}
