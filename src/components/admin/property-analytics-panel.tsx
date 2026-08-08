import { BarChart3 } from "lucide-react";
import { Metric, TrendChart } from "@/components/ui/charts";

type PropertyAnalyticsSummary = {
  totals: { views: number; uniqueViews: number; leads: number; whatsappClicks: number; phoneClicks: number };
  rows: Array<{ date: string; views: number; uniqueViews: number; leads: number; whatsappClicks: number; phoneClicks: number }>;
};

export function PropertyAnalyticsPanel({ summary }: { summary: PropertyAnalyticsSummary }) {
  const hasData = summary.rows.length > 0;

  return <section className="mt-6 rounded-md border border-line bg-surface p-5 shadow-soft sm:p-7" aria-labelledby="property-analytics-title">
    <div className="flex items-start justify-between gap-4"><div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gold-strong">Ilan performansı</p><h2 id="property-analytics-title" className="mt-2 font-display text-3xl font-semibold">Son 30 gün</h2></div><BarChart3 className="size-5 text-gold-strong" aria-hidden="true" /></div>
    <div className="mt-7 grid gap-6 border-y border-line py-6 sm:grid-cols-2 lg:grid-cols-5"><Metric label="Görüntülenme" value={summary.totals.views} /><Metric label="Tekil ziyaretçi" value={summary.totals.uniqueViews} /><Metric label="Talep" value={summary.totals.leads} /><Metric label="WhatsApp" value={summary.totals.whatsappClicks} /><Metric label="Telefon" value={summary.totals.phoneClicks} /></div>
    {hasData ? <div className="mt-6"><TrendChart data={summary.rows} xKey="date" height={250} series={[{ key: "views", label: "Görüntülenme", color: "#b88736" }, { key: "uniqueViews", label: "Tekil ziyaretçi", color: "#292722" }, { key: "leads", label: "Talep", color: "#1f7a4d" }]} /></div> : <div className="mt-6 rounded-sm border border-dashed border-line bg-surface-subtle px-5 py-8 text-sm leading-6 text-ink-muted">Bu ilan için henüz ölçülmüş ziyaretçi veya etkileşim verisi yok. İlk gerçek ziyaret gerçekleştiğinde grafik burada oluşur.</div>}
  </section>;
}
