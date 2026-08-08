"use client";

import { Heart, MapPin, Phone, Share2 } from "lucide-react";
import { useEffect, useState } from "react";

type EventType = "VIEW" | "WHATSAPP_CLICK" | "PHONE_CLICK" | "SHARE" | "MAP_INTERACTION" | "GALLERY_INTERACTION" | "FAVORITE";

function visitorId() {
  const key = "bersu.analytics.visitor";
  const current = window.localStorage.getItem(key);
  if (current) return current;
  const created = crypto.randomUUID();
  window.localStorage.setItem(key, created);
  return created;
}

export function PropertyInteractionControls({ slug, locale, phone, whatsapp, mapUrl, labels }: { slug: string; locale: string; phone?: string | null; whatsapp?: string | null; mapUrl?: string; labels: { save: string; saved: string; share: string; call: string; openMap: string } }) {
  const [saved, setSaved] = useState(false);
  const track = (type: EventType) => {
    void fetch(`/api/v1/public/properties/${encodeURIComponent(slug)}/events`, { method: "POST", headers: { "content-type": "application/json" }, credentials: "same-origin", body: JSON.stringify({ type, visitorId: visitorId(), locale }) }).catch(() => undefined);
  };
  useEffect(() => { track("VIEW"); }, []);
  const share = async () => {
    track("SHARE");
    const url = window.location.href;
    if (navigator.share) await navigator.share({ url, title: document.title });
    else await navigator.clipboard?.writeText(url);
  };
  const whatsappUrl = whatsapp || phone ? `https://wa.me/${(whatsapp ?? phone ?? "").replace(/\D/g, "")}` : undefined;
  return <div className="flex flex-wrap gap-2"><button type="button" onClick={() => { setSaved((value) => !value); track("FAVORITE"); }} className="inline-flex h-10 items-center gap-2 rounded-sm border border-line bg-surface px-3 text-sm font-bold hover:bg-surface-subtle" aria-pressed={saved}><Heart className="size-4" fill={saved ? "currentColor" : "none"} />{saved ? labels.saved : labels.save}</button><button type="button" onClick={() => void share()} className="inline-flex h-10 items-center gap-2 rounded-sm border border-line bg-surface px-3 text-sm font-bold hover:bg-surface-subtle"><Share2 className="size-4" />{labels.share}</button>{phone && <a onClick={() => track("PHONE_CLICK")} href={`tel:${phone.replace(/\s/g, "")}`} className="inline-flex h-10 items-center gap-2 rounded-sm border border-line bg-surface px-3 text-sm font-bold hover:bg-surface-subtle"><Phone className="size-4" />{labels.call}</a>}{whatsappUrl && <a onClick={() => track("WHATSAPP_CLICK")} href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-sm bg-[#23543f] px-3 text-sm font-bold text-white hover:bg-[#173d2d]">WhatsApp</a>}{mapUrl && <a onClick={() => track("MAP_INTERACTION")} href={mapUrl} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-sm border border-line bg-surface px-3 text-sm font-bold hover:bg-surface-subtle"><MapPin className="size-4" />{labels.openMap}</a>}</div>;
}
