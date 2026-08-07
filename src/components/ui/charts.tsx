"use client";

import { type ReactNode } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type ChartSeries = { key: string; label: string; color?: string };
export function TrendChart({ data, series, xKey, height = 300, formatValue }: { data: Array<Record<string, string | number>>; series: ChartSeries[]; xKey: string; height?: number; formatValue?: (value: number) => string }) {
  return <div style={{ height }} className="w-full" role="img" aria-label="Trend chart"><ResponsiveContainer width="100%" height="100%"><LineChart data={data} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}><CartesianGrid stroke="var(--line)" strokeDasharray="3 3" vertical={false} /><XAxis dataKey={xKey} stroke="var(--ink-faint)" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} /><YAxis stroke="var(--ink-faint)" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={formatValue} /><Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "10px", boxShadow: "var(--shadow-float)", fontSize: 12 }} formatter={(value: number) => formatValue ? formatValue(value) : value} /><Legend wrapperStyle={{ fontSize: 12, paddingTop: 16 }} />{series.map((item) => <Line key={item.key} type="monotone" dataKey={item.key} name={item.label} stroke={item.color ?? "var(--gold)"} strokeWidth={2.25} dot={false} activeDot={{ r: 4 }} />)}</LineChart></ResponsiveContainer></div>;
}

export function Metric({ label, value, detail, trend }: { label: string; value: ReactNode; detail?: string; trend?: "up" | "down" | "neutral" }) { return <div><p className="text-xs font-bold uppercase tracking-[0.09em] text-ink-muted">{label}</p><p className="mt-2 font-display text-4xl font-semibold tracking-tight">{value}</p>{detail && <p className={trend === "up" ? "mt-2 text-xs font-bold text-success" : trend === "down" ? "mt-2 text-xs font-bold text-danger" : "mt-2 text-xs text-ink-muted"}>{detail}</p>}</div>; }
