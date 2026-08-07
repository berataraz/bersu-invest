"use client";

import Link from "next/link";
import { CalendarPlus, CheckSquare, MessageSquarePlus, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminApi } from "@/components/admin/admin-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FormSection, Input, Select, Textarea } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";

type Agent = { id: string; firstName: string; lastName: string };
type Customer = { id: string; firstName: string; lastName: string; email?: string | null; phone?: string | null; nationality?: string | null; preferredLocale?: string | null; status: string; ownerId?: string | null; tags: string[]; customFields?: Record<string, unknown> | null; notes?: { id: string; body: string; createdAt: string | Date }[]; timeline?: { id: string; label: string; occurredAt: string | Date }[] };
const text = (data: FormData, key: string) => String(data.get(key) ?? "").trim() || null;
const number = (data: FormData, key: string) => { const value = text(data, key); return value ? Number(value) : null; };

export function CustomerEditor({ customer, agents }: { customer?: Customer; agents: Agent[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [addingNote, setAddingNote] = useState(false);
  const custom = customer?.customFields ?? {};

  const save = async (form: HTMLFormElement) => {
    setSaving(true);
    try {
      const values = new FormData(form);
      const customFields = { whatsapp: text(values, "whatsapp"), company: text(values, "company"), leadSource: text(values, "leadSource"), purpose: values.get("purpose"), propertyType: text(values, "propertyType"), province: text(values, "province"), district: text(values, "district"), neighborhood: text(values, "neighborhood"), minBudget: number(values, "minBudget"), maxBudget: number(values, "maxBudget"), currency: values.get("currency"), minRooms: number(values, "minRooms"), minArea: number(values, "minArea"), maxArea: number(values, "maxArea"), desiredFeatures: text(values, "desiredFeatures"), investmentPurpose: text(values, "investmentPurpose"), citizenshipRequirement: values.get("citizenshipRequirement") === "on", residenceRequirement: values.get("residenceRequirement") === "on", requirements: text(values, "requirements") };
      const result = await adminApi<Customer>(customer ? `/api/v1/crm/customers/${customer.id}` : "/api/v1/crm/customers", { method: customer ? "PATCH" : "POST", body: JSON.stringify({ ownerId: String(values.get("ownerId") ?? "") || null, firstName: values.get("firstName"), lastName: values.get("lastName"), email: text(values, "email"), phone: text(values, "phone"), nationality: text(values, "nationality"), preferredLocale: String(values.get("preferredLocale") ?? "") || null, status: values.get("status"), tags: String(values.get("tags") ?? "").split(",").map((tag) => tag.trim()).filter(Boolean), customFields }) });
      toast({ variant: "success", title: "Müşteri kaydedildi" });
      if (!customer) router.replace(`/dashboard/customers/${result.id}`); else router.refresh();
    } catch (error) { toast({ variant: "error", title: "Müşteri kaydedilemedi", description: error instanceof Error ? error.message : undefined }); } finally { setSaving(false); }
  };

  const addNote = async (form: HTMLFormElement) => {
    if (!customer) return;
    setAddingNote(true);
    try {
      const body = String(new FormData(form).get("body") ?? "").trim();
      if (!body) return;
      await adminApi(`/api/v1/crm/customers/${customer.id}/notes`, { method: "POST", body: JSON.stringify({ body, isPrivate: true }) });
      form.reset(); toast({ variant: "success", title: "Not eklendi" }); router.refresh();
    } catch (error) { toast({ variant: "error", title: "Not eklenemedi", description: error instanceof Error ? error.message : undefined }); } finally { setAddingNote(false); }
  };

  return <div className="mx-auto max-w-[1180px] pb-12">
    <div className="mb-7"><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold-strong">CRM</p><h1 className="mt-2 font-display text-4xl font-semibold">{customer ? `${customer.firstName} ${customer.lastName}` : "Yeni Müşteri"}</h1><p className="mt-2 text-sm text-ink-muted">İletişim, ihtiyaç ve takip bilgisini tek müşteri kaydında yönetin.</p></div>
    <form onSubmit={(event) => { event.preventDefault(); void save(event.currentTarget); }}>
      <Card><CardContent className="px-6"><FormSection title="Kişisel Bilgiler"><div className="grid gap-5 sm:grid-cols-2"><Field label="Ad" required><Input name="firstName" required defaultValue={customer?.firstName} /></Field><Field label="Soyad" required><Input name="lastName" required defaultValue={customer?.lastName} /></Field><Field label="Telefon"><Input name="phone" defaultValue={customer?.phone ?? ""} /></Field><Field label="WhatsApp"><Input name="whatsapp" defaultValue={String(custom.whatsapp ?? "")} /></Field><Field label="E-posta"><Input name="email" type="email" defaultValue={customer?.email ?? ""} /></Field><Field label="Uyruk"><Input name="nationality" defaultValue={customer?.nationality ?? ""} /></Field><Field label="Tercih Edilen Dil"><Select name="preferredLocale" defaultValue={customer?.preferredLocale ?? ""}><option value="">Seçiniz</option><option value="tr">Türkçe</option><option value="en">English</option><option value="de">Deutsch</option><option value="ru">Русский</option></Select></Field><Field label="Firma"><Input name="company" defaultValue={String(custom.company ?? "")} /></Field><Field label="Atanan Danışman"><Select name="ownerId" defaultValue={customer?.ownerId ?? ""}><option value="">Oturum sahibi</option>{agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.firstName} {agent.lastName}</option>)}</Select></Field><Field label="CRM Durumu"><Select name="status" defaultValue={customer?.status ?? "LEAD"}><option value="LEAD">Yeni</option><option value="PROSPECT">Potansiyel</option><option value="ACTIVE">Aktif</option><option value="INACTIVE">Pasif</option></Select></Field><Field label="Lead Kaynağı"><Input name="leadSource" defaultValue={String(custom.leadSource ?? "")} placeholder="Web sitesi, referans, reklam" /></Field><Field label="Etiketler"><Input name="tags" defaultValue={customer?.tags.join(", ") ?? ""} placeholder="yatırımcı, yabancı müşteri" /></Field></div></FormSection>
      <FormSection title="Arama Kriterleri" description="Müşterinin aradığı portföy bilgisini tutun."><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"><Field label="İşlem"><Select name="purpose" defaultValue={String(custom.purpose ?? "BUY")}><option value="BUY">Satın alma</option><option value="RENT">Kiralama</option></Select></Field><Field label="Gayrimenkul Tipi"><Input name="propertyType" defaultValue={String(custom.propertyType ?? "")} /></Field><Field label="İl"><Input name="province" defaultValue={String(custom.province ?? "Muğla")} /></Field><Field label="İlçe"><Input name="district" defaultValue={String(custom.district ?? "")} /></Field><Field label="Mahalle"><Input name="neighborhood" defaultValue={String(custom.neighborhood ?? "")} /></Field><Field label="Para Birimi"><Select name="currency" defaultValue={String(custom.currency ?? "TRY")}><option value="TRY">TRY</option><option value="EUR">EUR</option><option value="USD">USD</option></Select></Field><Field label="Minimum Bütçe"><Input name="minBudget" type="number" min="0" defaultValue={String(custom.minBudget ?? "")} /></Field><Field label="Maksimum Bütçe"><Input name="maxBudget" type="number" min="0" defaultValue={String(custom.maxBudget ?? "")} /></Field><Field label="Minimum Oda"><Input name="minRooms" type="number" min="0" defaultValue={String(custom.minRooms ?? "")} /></Field><Field label="Minimum Alan (m²)"><Input name="minArea" type="number" min="0" defaultValue={String(custom.minArea ?? "")} /></Field><Field label="Maksimum Alan (m²)"><Input name="maxArea" type="number" min="0" defaultValue={String(custom.maxArea ?? "")} /></Field><Field label="Yatırım Amacı"><Input name="investmentPurpose" defaultValue={String(custom.investmentPurpose ?? "")} /></Field><Field label="İstenen Özellikler" className="sm:col-span-2"><Textarea name="desiredFeatures" className="min-h-20" defaultValue={String(custom.desiredFeatures ?? "")} /></Field><Field label="Ek Gereksinimler" className="sm:col-span-2"><Textarea name="requirements" defaultValue={String(custom.requirements ?? "")} /></Field></div><div className="mt-5 flex flex-wrap gap-5 text-sm font-bold"><label className="flex items-center gap-2"><input name="citizenshipRequirement" type="checkbox" defaultChecked={Boolean(custom.citizenshipRequirement)} />Vatandaşlık gereksinimi</label><label className="flex items-center gap-2"><input name="residenceRequirement" type="checkbox" defaultChecked={Boolean(custom.residenceRequirement)} />İkamet gereksinimi</label></div></FormSection></CardContent></Card>
      <div className="mt-6 flex justify-end"><Button type="submit" loading={saving}><Save className="size-4" />Müşteriyi Kaydet</Button></div>
    </form>
    {customer && <div className="mt-7 grid gap-6 lg:grid-cols-2"><Card><CardHeader><CardTitle>Notlar</CardTitle></CardHeader><CardContent><form onSubmit={(event) => { event.preventDefault(); void addNote(event.currentTarget); }} className="space-y-3"><Textarea name="body" placeholder="Görüşme notu ekleyin" /><Button type="submit" size="sm" loading={addingNote}><MessageSquarePlus className="size-4" />Not Ekle</Button></form><div className="mt-5 space-y-3">{customer.notes?.length ? customer.notes.map((note) => <div key={note.id} className="rounded-sm bg-surface-subtle p-3 text-sm"><p>{note.body}</p><p className="mt-2 text-xs text-ink-muted">{new Date(note.createdAt).toLocaleString("tr-TR")}</p></div>) : <p className="text-sm text-ink-muted">Henüz not yok.</p>}</div></CardContent></Card><Card><CardHeader><CardTitle>Takip Akışı</CardTitle></CardHeader><CardContent><div className="flex flex-wrap gap-2"><Link href="/dashboard/tasks" className="inline-flex h-9 items-center gap-2 rounded-sm border border-line px-3 text-xs font-bold hover:bg-surface-subtle"><CheckSquare className="size-4" />Görev Oluştur</Link><Link href="/dashboard/appointments" className="inline-flex h-9 items-center gap-2 rounded-sm border border-line px-3 text-xs font-bold hover:bg-surface-subtle"><CalendarPlus className="size-4" />Randevu Oluştur</Link></div><div className="mt-5 space-y-3">{customer.timeline?.length ? customer.timeline.map((event) => <div key={event.id} className="border-l-2 border-gold pl-3 text-sm"><p className="font-bold">{event.label}</p><p className="mt-1 text-xs text-ink-muted">{new Date(event.occurredAt).toLocaleString("tr-TR")}</p></div>) : <p className="text-sm text-ink-muted">Henüz aktivite yok.</p>}</div></CardContent></Card></div>}
  </div>;
}
