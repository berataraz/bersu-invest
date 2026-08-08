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
type Region = { slug: string; isPublished: boolean; sortOrder: number; content: Record<Locale, Record<string, string>> };
const locales: Array<[Locale, string]> = [["tr", "TR"], ["en", "EN"], ["de", "DE"], ["ru", "RU"]];
const fields = [["name", "Bölge adı", false], ["shortDescription", "Kısa açıklama", true], ["lifestyle", "Yaşam tarzı", true], ["investmentProfile", "Yatırım profili", true], ["advantages", "Avantajlar", true], ["considerations", "Dikkat edilmesi gerekenler", true]] as const;

export function RegionKnowledgeEditor({ initialRegions }: { initialRegions: Region[] }) {
  const { toast } = useToast(); const [regions, setRegions] = useState(initialRegions); const [slug, setSlug] = useState(initialRegions[0]?.slug ?? ""); const [locale, setLocale] = useState<Locale>("tr"); const [saving, setSaving] = useState(false);
  const region = regions.find((item) => item.slug === slug);
  if (!region) return null;
  const update = (key: string, value: string) => setRegions((current) => current.map((item) => item.slug === slug ? { ...item, content: { ...item.content, [locale]: { ...item.content[locale], [key]: value } } } : item));
  const save = async () => { setSaving(true); try { await adminApi(`/api/v1/admin/region-knowledge/${region.slug}`, { method: "PUT", body: JSON.stringify(region) }); toast({ variant: "success", title: "Bölge bilgisi kaydedildi" }); } catch (error) { toast({ variant: "error", title: "Bölge bilgisi kaydedilemedi", description: error instanceof Error ? error.message : undefined }); } finally { setSaving(false); } };
  return <div className="mx-auto max-w-5xl"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[.16em] text-gold-strong">Site İçeriği / Bölgeler</p><h1 className="mt-2 font-display text-4xl font-semibold">Bölge bilgi bankası</h1><p className="mt-2 text-sm text-ink-muted">Yalnızca yayınlanan bölge kayıtları kamu AI asistanı tarafından kullanılabilir.</p></div><Button onClick={() => void save()} loading={saving}><Save className="size-4" />Kaydet</Button></div><div className="mt-8 grid gap-4 lg:grid-cols-[13rem_1fr]"><Card><CardContent className="p-3">{regions.map((item) => <button key={item.slug} type="button" onClick={() => setSlug(item.slug)} className={`w-full rounded-sm px-3 py-3 text-left text-sm font-bold ${item.slug === slug ? "bg-gold-soft text-gold-strong" : "hover:bg-surface-subtle"}`}>{item.content.tr.name || item.slug}</button>)}</CardContent></Card><Card><CardContent className="p-6"><Tabs value={locale} onValueChange={(value) => setLocale(value as Locale)}><TabsList>{locales.map(([code, label]) => <TabsTrigger key={code} value={code}>{label}</TabsTrigger>)}</TabsList></Tabs><div className="mt-6 grid gap-5">{fields.map(([key, label, multiline]) => <Field key={key} label={label}>{multiline ? <Textarea value={region.content[locale][key] ?? ""} onChange={(event) => update(key, event.target.value)} className="min-h-24" /> : <Input value={region.content[locale][key] ?? ""} onChange={(event) => update(key, event.target.value)} />}</Field>)}</div><div className="mt-6 grid gap-4 border-t border-line pt-5 sm:grid-cols-2"><Field label="Sıralama"><Input type="number" value={region.sortOrder} onChange={(event) => setRegions((current) => current.map((item) => item.slug === slug ? { ...item, sortOrder: Number(event.target.value) } : item))} /></Field><label className="mt-7 flex items-center gap-3 text-sm font-bold"><input type="checkbox" checked={region.isPublished} onChange={(event) => setRegions((current) => current.map((item) => item.slug === slug ? { ...item, isPublished: event.target.checked } : item))} className="size-4 accent-[var(--gold)]" />AI’da yayınla</label></div></CardContent></Card></div></div>;
}
