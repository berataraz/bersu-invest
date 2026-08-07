"use client";

import { ExternalLink, MapPin } from "lucide-react";
import { useEffect, useRef } from "react";
import { Field, Input } from "@/components/ui/form";

type Value = { latitude: number | null; longitude: number | null; address: string | null };

export function GoogleMapPicker({ value, onChange }: { value: Value; onChange: (value: Value) => void }) {
  const element = useRef<HTMLDivElement>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const latitude = value.latitude ?? 36.621;
  const longitude = value.longitude ?? 29.116;

  useEffect(() => {
    if (!apiKey || !element.current) return;
    const initialize = () => {
      const google = (window as Window & { google?: { maps?: { Map: new (node: HTMLElement, options: object) => { addListener: (event: string, listener: (event: { latLng?: { lat: () => number; lng: () => number } }) => void) => void }; Marker: new (options: object) => { setPosition: (position: object) => void; addListener: (event: string, listener: (event: { latLng?: { lat: () => number; lng: () => number } }) => void) => void }; LatLng: new (lat: number, lng: number) => object } } }).google;
      if (!google?.maps || !element.current || element.current.dataset.ready) return;
      element.current.dataset.ready = "true";
      const map = new google.maps.Map(element.current, { center: { lat: latitude, lng: longitude }, zoom: 12, streetViewControl: false, mapTypeControl: false });
      const marker = new google.maps.Marker({ map, position: { lat: latitude, lng: longitude }, draggable: true });
      const update = (point?: { lat: () => number; lng: () => number }) => { if (point) onChange({ ...value, latitude: Number(point.lat().toFixed(7)), longitude: Number(point.lng().toFixed(7)) }); };
      map.addListener("click", (event) => { if (event.latLng) { marker.setPosition(event.latLng); update(event.latLng); } });
      marker.addListener("dragend", (event: { latLng?: { lat: () => number; lng: () => number } }) => update(event.latLng));
    };
    const existing = document.querySelector("script[data-bersu-google-maps]");
    if (existing) { existing.addEventListener("load", initialize); initialize(); return () => existing.removeEventListener("load", initialize); }
    const script = document.createElement("script");
    script.dataset.bersuGoogleMaps = "true";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}`;
    script.async = true;
    script.addEventListener("load", initialize);
    document.head.appendChild(script);
    return () => script.removeEventListener("load", initialize);
  }, [apiKey, latitude, longitude, onChange, value]);

  const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
  return <div className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><Field label="Enlem"><Input type="number" step="0.0000001" value={value.latitude ?? ""} onChange={(event) => onChange({ ...value, latitude: event.target.value === "" ? null : Number(event.target.value) })} /></Field><Field label="Boylam"><Input type="number" step="0.0000001" value={value.longitude ?? ""} onChange={(event) => onChange({ ...value, longitude: event.target.value === "" ? null : Number(event.target.value) })} /></Field></div>{apiKey ? <div ref={element} className="h-80 overflow-hidden rounded-md border border-line bg-surface-subtle" aria-label="İlan konum haritası" /> : <div className="rounded-md border border-dashed border-line bg-surface-subtle p-4 text-sm leading-6 text-ink-muted"><MapPin className="mb-2 size-5 text-gold-strong" />Google Maps anahtarı tanımlanmadığı için koordinatları manuel girin. Anahtar eklendiğinde burada haritaya tıklayarak veya işaretçiyi sürükleyerek konum seçebilirsiniz.</div>}<a href={mapUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-gold-strong hover:text-ink"><ExternalLink className="size-4" />Google Maps&apos;te aç</a></div>;
}
