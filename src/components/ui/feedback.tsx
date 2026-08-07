import { Loader2, SearchX } from "lucide-react";
import { type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";

export function Spinner({ className, label = "Loading" }: { className?: string; label?: string }) {
  return <span role="status" className={cn("inline-flex items-center gap-2 text-sm text-ink-muted", className)}><Loader2 className="size-4 animate-spin" aria-hidden="true" /><span className="sr-only">{label}</span></span>;
}

export function LoadingBlock({ label = "Loading content" }: { label?: string }) {
  return <div className="grid min-h-48 place-items-center rounded-lg border border-dashed border-line bg-surface-subtle/50"><Spinner label={label} /></div>;
}

export function Skeleton({ className }: { className?: string }) { return <div className={cn("animate-pulse rounded-sm bg-line/70", className)} aria-hidden="true" />; }

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: { label: string; onClick: () => void } }) {
  return <div className="grid min-h-72 place-items-center rounded-lg border border-dashed border-line bg-surface px-6 py-12 text-center"><div className="max-w-sm"><div className="mx-auto grid size-12 place-items-center rounded-full bg-gold-soft text-gold-strong">{icon ?? <SearchX className="size-5" />}</div><h3 className="mt-5 font-display text-2xl font-semibold text-ink">{title}</h3>{description && <p className="mt-2 text-sm leading-6 text-ink-muted">{description}</p>}{action && <Button variant="secondary" size="sm" className="mt-5" onClick={action.onClick}>{action.label}</Button>}</div></div>;
}
