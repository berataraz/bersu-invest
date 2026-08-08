"use client";

import { Save } from "lucide-react";
import { useState } from "react";
import { adminApi } from "@/components/admin/admin-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/form";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";

type Locale = "tr" | "en" | "de" | "ru";
type Content = Record<Locale, Record<string, string>>;
export type SiteContentEditorItem = { key: "homepage" | "aiAssistant" | "footer"; content: Content; isPublished: boolean; version: number };
type Item = SiteContentEditorItem;

const locales: Array<[Locale, string]> = [["tr", "TR"], ["en", "EN"], ["de", "DE"], ["ru", "RU"]];
const fields: Record<Item["key"], Array<{ key: string; label: string; multiline?: boolean }>> = {
  homepage: [
    { key: "heroTitle", label: "Hero başlığı", multiline: true }, { key: "heroSubtitle", label: "Hero açıklaması", multiline: true },
    { key: "primaryCta", label: "Birincil CTA" }, { key: "secondaryCta", label: "İkincil CTA" }, { key: "tertiaryCta", label: "Üçüncül CTA" },
    { key: "featuredTitle", label: "Öne çıkan ilanlar başlığı", multiline: true }, { key: "featuredDescription", label: "Öne çıkan ilanlar açıklaması", multiline: true }, { key: "searchTitle", label: "Arama alanı başlığı" },
  ],
  aiAssistant: [
    { key: "name", label: "Asistan adı" }, { key: "welcome", label: "Karşılama mesajı", multiline: true }, { key: "description", label: "AI alanı açıklaması", multiline: true }, { key: "placeholder", label: "Arama örneği" },
    { key: "promptOne", label: "Önerilen soru 1" }, { key: "promptTwo", label: "Önerilen soru 2" }, { key: "promptThree", label: "Önerilen soru 3" }, { key: "promptFour", label: "Önerilen soru 4" }, { key: "companyIntro", label: "Bersu Invest tanıtımı", multiline: true }, { key: "disclaimer", label: "Bilgilendirme metni", multiline: true },
  ],
  footer: [{ key: "description", label: "Footer açıklaması", multiline: true }, { key: "copyright", label: "Telif metni" }],
};

const labels: Record<Item["key"], string> = { homepage: "Ana Sayfa", aiAssistant: "AI Asistan", footer: "Footer" };

export function SiteContentEditor({ initialItems }: { initialItems: Item[] }) {
  const { toast } = useToast();
  const [items, setItems] = useState(initialItems);
  const [section, setSection] = useState<Item["key"]>("homepage");
  const [locale, setLocale] = useState<Locale>("tr");
  const [saving, setSaving] = useState(false);
  const item = items.find((entry) => entry.key === section)!;
  const update = (field: string, value: string) => setItems((current) => current.map((entry) => entry.key === section ? { ...entry, content: { ...entry.content, [locale]: { ...entry.content[locale], [field]: value } } } : entry));
  const save = async () => {
    setSaving(true);
    try {
      await adminApi("/api/v1/admin/site-content", { method: "PUT", body: JSON.stringify(item) });
      toast({ variant: "success", title: "İçerik kaydedildi", description: "Yayınlanan içerik en geç bir dakika içinde kamu sitesinde güncellenir." });
    } catch (error) { toast({ variant: "error", title: "İçerik kaydedilemedi", description: error instanceof Error ? error.message : undefined }); } finally { setSaving(false); }
  };
  const status = (candidate: Locale) => Object.values(item.content[candidate]).every(Boolean) ? "Tamamlandı" : "Eksik";

  return <div className="mx-auto max-w-5xl"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[.16em] text-gold-strong">Site İçeriği</p><h1 className="mt-2 font-display text-4xl font-semibold">Kamu sitesi metinleri</h1><p className="mt-2 text-sm text-ink-muted">İçerikleri dil bazında düzenleyin. Boş bir çeviri, kamu sitesinde Türkçe içeriğe geri döner.</p></div><Button onClick={() => void save()} loading={saving}><Save className="size-4" />Kaydet</Button></div><div className="mt-8 grid gap-4 lg:grid-cols-[13rem_1fr]"><Card><CardContent className="p-3">{(Object.keys(labels) as Item["key"][]).map((key) => <button key={key} type="button" onClick={() => setSection(key)} className={`w-full rounded-sm px-3 py-3 text-left text-sm font-bold ${section === key ? "bg-gold-soft text-gold-strong" : "hover:bg-surface-subtle"}`}>{labels[key]}</button>)}</CardContent></Card><Card><CardContent className="p-6"><Tabs value={locale} onValueChange={(value) => setLocale(value as Locale)}><TabsList>{locales.map(([code, label]) => <TabsTrigger key={code} value={code}>{label} <span className="ml-1 text-[10px] opacity-60">{status(code) === "Tamamlandı" ? "OK" : "!"}</span></TabsTrigger>)}</TabsList></Tabs><div className="mt-6 grid gap-5">{fields[section].map((field) => <Field key={field.key} label={field.label}>{field.multiline ? <Textarea value={item.content[locale][field.key] ?? ""} onChange={(event) => update(field.key, event.target.value)} className="min-h-28" /> : <Input value={item.content[locale][field.key] ?? ""} onChange={(event) => update(field.key, event.target.value)} />}</Field>)}</div><label className="mt-7 flex items-center gap-3 border-t border-line pt-5 text-sm font-bold"><input type="checkbox" checked={item.isPublished} onChange={(event) => setItems((current) => current.map((entry) => entry.key === section ? { ...entry, isPublished: event.target.checked } : entry))} className="size-4 accent-[var(--gold)]" />Bu içerik yayınlansın</label></CardContent></Card></div></div>;
}
