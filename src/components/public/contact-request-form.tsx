"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function ContactRequestForm({ locale, propertySlug, intent = "CONTACT" }: { locale: string; propertySlug?: string; intent?: "CONTACT" | "BUY" | "SELL" }) {
  const t = useTranslations("Pages.contact");
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const submit = async (form: HTMLFormElement) => {
    setState("sending");
    const values = new FormData(form);
    const name = String(values.get("name") ?? "").trim();
    const [firstName, ...lastName] = name.split(/\s+/);
    try {
      const response = await fetch("/api/v1/public/requests", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ firstName, lastName: lastName.join(" "), email: values.get("email"), phone: values.get("phone"), message: values.get("message"), intent, locale, propertySlug }) });
      if (!response.ok) throw new Error();
      form.reset(); setState("success");
    } catch { setState("error"); }
  };
  return <form onSubmit={(event) => { event.preventDefault(); void submit(event.currentTarget); }} className="grid gap-5 rounded-md bg-surface-subtle p-6 sm:grid-cols-2 sm:p-8"><label className="grid gap-2 text-sm font-bold">{t("name")}<input name="name" required minLength={2} className="h-11 rounded-sm border border-line bg-surface px-3" /></label><label className="grid gap-2 text-sm font-bold">{t("email")}<input name="email" type="email" required className="h-11 rounded-sm border border-line bg-surface px-3" /></label><label className="grid gap-2 text-sm font-bold sm:col-span-2">{t("phone")}<input name="phone" type="tel" className="h-11 rounded-sm border border-line bg-surface px-3" /></label><label className="grid gap-2 text-sm font-bold sm:col-span-2">{t("message")}<textarea name="message" required minLength={10} className="min-h-32 rounded-sm border border-line bg-surface p-3" /></label>{state === "success" && <p role="status" className="sm:col-span-2 text-sm font-bold text-success">✓ {t("send")}</p>}{state === "error" && <p role="alert" className="sm:col-span-2 text-sm font-bold text-danger">{t("send")}</p>}<button disabled={state === "sending"} className="rounded-sm bg-ink px-5 py-3.5 text-sm font-bold text-surface hover:bg-gold-strong disabled:opacity-60 sm:col-span-2">{state === "sending" ? "…" : t("send")}</button></form>;
}
