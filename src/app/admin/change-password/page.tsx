"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { BrandMark } from "@/components/ui/navigation";

export default function RequiredPasswordChangePage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  async function submit(formData: FormData) {
    const currentPassword = String(formData.get("currentPassword") ?? "");
    const newPassword = String(formData.get("newPassword") ?? "");
    const confirmation = String(formData.get("confirmation") ?? "");
    if (newPassword !== confirmation) return setError("Yeni parolalar eşleşmiyor.");
    setLoading(true); setError(null);
    const csrf = await fetch("/api/v1/auth/csrf", { cache: "no-store" });
    const token = csrf.headers.get("x-csrf-token");
    const response = await fetch("/api/v1/auth/change-password", { method: "POST", headers: { "content-type": "application/json", "x-csrf-token": token ?? "" }, body: JSON.stringify({ currentPassword, newPassword }) });
    if (!response.ok) { const body = await response.json().catch(() => null); setError(body?.error?.message ?? "Parola değiştirilemedi."); setLoading(false); return; }
    await signOut({ callbackUrl: "/admin/login" });
  }
  return <main className="grid min-h-dvh place-items-center bg-surface-subtle p-5"><form action={submit} className="w-full max-w-sm rounded-lg bg-surface p-8 shadow-float"><BrandMark /><h1 className="mt-10 font-display text-4xl font-semibold">Parolanızı yenileyin</h1><p className="mt-2 text-sm leading-6 text-ink-muted">İlk girişiniz için güçlü bir parola belirlemeniz gerekiyor.</p><label className="mt-8 grid gap-2 text-sm font-bold">Mevcut parola<input name="currentPassword" type="password" required className="h-11 rounded-sm border border-line px-3 outline-none focus:border-gold" /></label><label className="mt-5 grid gap-2 text-sm font-bold">Yeni parola<input name="newPassword" type="password" minLength={12} required className="h-11 rounded-sm border border-line px-3 outline-none focus:border-gold" /></label><label className="mt-5 grid gap-2 text-sm font-bold">Yeni parolayı tekrar yazın<input name="confirmation" type="password" minLength={12} required className="h-11 rounded-sm border border-line px-3 outline-none focus:border-gold" /></label>{error && <p role="alert" className="mt-3 text-sm font-bold text-danger">{error}</p>}<button disabled={loading} className="mt-7 w-full rounded-sm bg-ink px-5 py-3.5 text-sm font-bold text-surface hover:bg-gold-strong disabled:opacity-50">{loading ? "Güncelleniyor..." : "Parolayı güncelle"}</button></form></main>;
}
