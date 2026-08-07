"use client";

import { CheckCircle2, CircleAlert, Info, X, XCircle } from "lucide-react";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type ToastVariant = "success" | "error" | "warning" | "info";
type Toast = { id: string; title: string; description?: string; variant: ToastVariant };
type ToastContextValue = { toast: (input: Omit<Toast, "id">) => void; dismiss: (id: string) => void };
const ToastContext = createContext<ToastContextValue | null>(null);
const icons = { success: CheckCircle2, error: XCircle, warning: CircleAlert, info: Info };
const colours = { success: "text-success", error: "text-danger", warning: "text-warning", info: "text-gold-strong" };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const dismiss = useCallback((id: string) => setItems((current) => current.filter((item) => item.id !== id)), []);
  const toast = useCallback((input: Omit<Toast, "id">) => {
    const id = crypto.randomUUID();
    setItems((current) => [...current, { ...input, id }]);
    window.setTimeout(() => dismiss(id), 5_000);
  }, [dismiss]);
  return <ToastContext.Provider value={{ toast, dismiss }}>{children}<div className="fixed bottom-5 right-5 z-[100] grid w-[calc(100%-2.5rem)] max-w-sm gap-3" aria-live="polite">{items.map((item) => <ToastItem key={item.id} item={item} onDismiss={dismiss} />)}</div></ToastContext.Provider>;
}

function ToastItem({ item, onDismiss }: { item: Toast; onDismiss: (id: string) => void }) {
  const Icon = icons[item.variant];
  return <div className="animate-bersu-in rounded-md border border-line bg-surface p-4 shadow-float"><div className="flex gap-3"><Icon className={cn("mt-0.5 size-5 shrink-0", colours[item.variant])} /><div className="min-w-0 flex-1"><p className="text-sm font-bold">{item.title}</p>{item.description && <p className="mt-1 text-sm leading-5 text-ink-muted">{item.description}</p>}</div><button onClick={() => onDismiss(item.id)} className="-mr-1 -mt-1 rounded-sm p-1 text-ink-faint hover:bg-surface-subtle hover:text-ink" aria-label="Dismiss notification"><X className="size-4" /></button></div></div>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider.");
  return context;
}
