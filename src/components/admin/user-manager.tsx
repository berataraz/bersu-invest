"use client";

import { Plus, Save, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminApi } from "@/components/admin/admin-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";

type UserRecord = { id: string; firstName: string; lastName: string; email: string; phone?: string | null; whatsapp?: string | null; jobTitle?: string | null; biography?: string | null; preferredLocales: string[]; displayOrder: number; status: string; roles: { role: { key: string; name: string } }[]; _count: { propertiesAssigned: number } };
type Role = { key: string; name: string };

export function UserManager({ users, roles, title, fixedRole }: { users: UserRecord[]; roles: Role[]; title: string; fixedRole?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<UserRecord | null>(null);
  const roleOf = (user?: Pick<UserRecord, "roles"> | null) => user?.roles[0]?.role.key ?? "";

  const submit = async (form: HTMLFormElement) => {
    setSaving(true);
    try {
      const data = new FormData(form);
      const password = String(data.get("password") ?? "") || undefined;
      if (!editing && !password) throw new Error("Yeni kullanıcı için en az 12 karakterlik güvenli bir parola gerekir.");
      await adminApi(editing ? `/api/v1/admin/users/${editing.id}` : "/api/v1/admin/users", { method: editing ? "PATCH" : "POST", body: JSON.stringify({ firstName: data.get("firstName"), lastName: data.get("lastName"), email: data.get("email"), phone: String(data.get("phone") ?? "").trim() || null, whatsapp: String(data.get("whatsapp") ?? "").trim() || null, jobTitle: String(data.get("jobTitle") ?? "").trim() || null, biography: String(data.get("biography") ?? "").trim() || null, preferredLocales: String(data.get("preferredLocales") ?? "").split(",").map((item) => item.trim()).filter(Boolean), displayOrder: Number(data.get("displayOrder") ?? 0), status: data.get("status"), roleKey: fixedRole ?? data.get("roleKey"), password, mustChangePassword: true }) });
      toast({ variant: "success", title: editing ? "Kullanıcı güncellendi" : "Kullanıcı oluşturuldu" });
      setOpen(false); setEditing(null); router.refresh();
    } catch (error) { toast({ variant: "error", title: "Kullanıcı kaydedilemedi", description: error instanceof Error ? error.message : undefined }); } finally { setSaving(false); }
  };

  return <div className="mx-auto max-w-[1280px]">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold-strong">Ekip Yönetimi</p><h1 className="mt-2 font-display text-4xl font-semibold">{title}</h1><p className="mt-2 text-sm text-ink-muted">Personel rollerini, erişim durumunu ve profil bilgisini gerçek kayıtlar üzerinden yönetin.</p></div><Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="size-4" />Yeni Kayıt</Button></div>
    {users.length === 0 ? <Card className="mt-7"><CardContent className="py-16 text-center"><UserRound className="mx-auto size-8 text-gold-strong" /><h2 className="mt-4 font-display text-2xl font-semibold">Henüz kayıt yok.</h2><Button className="mt-5" onClick={() => setOpen(true)}>İlk Kaydı Oluştur</Button></CardContent></Card> : <div className="mt-7 overflow-hidden rounded-md border border-line bg-surface"><div className="overflow-x-auto"><table className="w-full min-w-[740px] text-sm"><thead className="bg-surface-subtle text-left text-xs uppercase tracking-wide text-ink-muted"><tr><th className="px-5 py-4">Kullanıcı</th><th className="px-5 py-4">Rol</th><th className="px-5 py-4">İletişim</th><th className="px-5 py-4">Atanan İlan</th><th className="px-5 py-4">Durum</th><th className="px-5 py-4" /></tr></thead><tbody className="divide-y divide-line">{users.map((user) => <tr key={user.id}><td className="px-5 py-4"><p className="font-bold">{user.firstName} {user.lastName}</p><p className="mt-1 text-xs text-ink-muted">{user.jobTitle ?? user.email}</p></td><td className="px-5 py-4"><span className="rounded-full bg-gold-soft px-2.5 py-1 text-xs font-bold text-gold-strong">{roleOf(user)}</span></td><td className="px-5 py-4 text-ink-muted">{user.phone ?? user.email}</td><td className="px-5 py-4 text-ink-muted">{user._count.propertiesAssigned}</td><td className="px-5 py-4"><span className={user.status === "ACTIVE" ? "text-success" : "text-danger"}>{user.status}</span></td><td className="px-5 py-4"><Button type="button" size="xs" variant="secondary" onClick={() => { setEditing(user); setOpen(true); }}>Düzenle</Button></td></tr>)}</tbody></table></div></div>}
    {open && <div className="fixed inset-0 z-50 overflow-y-auto bg-black/35 p-4 sm:p-8"><div className="mx-auto my-6 max-w-2xl rounded-lg bg-surface p-6 shadow-float"><div className="mb-6 flex items-start justify-between"><div><h2 className="font-display text-2xl font-semibold">{editing ? "Kullanıcıyı Düzenle" : "Yeni Kullanıcı"}</h2><p className="mt-1 text-sm text-ink-muted">Parola hiçbir zaman tekrar gösterilmez.</p></div><button className="text-sm font-bold text-ink-muted hover:text-ink" onClick={() => { setOpen(false); setEditing(null); }}>Kapat</button></div><form onSubmit={(event) => { event.preventDefault(); void submit(event.currentTarget); }} className="grid gap-4 sm:grid-cols-2"><Field label="Ad" required><Input name="firstName" required defaultValue={editing?.firstName} /></Field><Field label="Soyad" required><Input name="lastName" required defaultValue={editing?.lastName} /></Field><Field label="E-posta" required><Input name="email" type="email" required defaultValue={editing?.email} /></Field><Field label="Telefon"><Input name="phone" defaultValue={editing?.phone ?? ""} /></Field><Field label="WhatsApp"><Input name="whatsapp" defaultValue={editing?.whatsapp ?? ""} /></Field><Field label="Unvan"><Input name="jobTitle" defaultValue={editing?.jobTitle ?? ""} /></Field>{!fixedRole && <Field label="Rol" required><Select name="roleKey" required defaultValue={roleOf(editing)}><option value="" disabled>Rol seçin</option>{roles.map((role) => <option key={role.key} value={role.key}>{role.name}</option>)}</Select></Field>}<Field label="Durum"><Select name="status" defaultValue={editing?.status ?? "ACTIVE"}><option value="ACTIVE">Aktif</option><option value="SUSPENDED">Askıya alındı</option><option value="INVITED">Davet bekliyor</option></Select></Field><Field label={editing ? "Yeni Parola (isteğe bağlı)" : "Geçici Parola"} required={!editing} className="sm:col-span-2"><Input name="password" type="password" required={!editing} minLength={12} placeholder="En az 12 karakter, büyük/küçük harf ve rakam" /></Field><Field label="Tercih Edilen Diller"><Input name="preferredLocales" defaultValue={editing?.preferredLocales.join(", ") ?? "tr"} placeholder="tr, en, de, ru" /></Field><Field label="Sıralama"><Input name="displayOrder" type="number" min="0" defaultValue={editing?.displayOrder ?? 0} /></Field><Field label="Biyografi" className="sm:col-span-2"><Textarea name="biography" defaultValue={editing?.biography ?? ""} /></Field><div className="flex justify-end gap-2 sm:col-span-2"><Button type="button" variant="secondary" onClick={() => { setOpen(false); setEditing(null); }}>Vazgeç</Button><Button type="submit" loading={saving}><Save className="size-4" />Kaydet</Button></div></form></div></div>}
  </div>;
}
