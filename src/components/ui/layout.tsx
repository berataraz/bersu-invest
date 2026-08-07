import { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn("mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12", className)} {...props} />; }
export function ResponsiveGrid({ children, columns = "auto", className }: { children: ReactNode; columns?: 1 | 2 | 3 | 4 | "auto"; className?: string }) {
  const layouts = { 1: "grid-cols-1", 2: "grid-cols-1 md:grid-cols-2", 3: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3", 4: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4", auto: "grid-cols-[repeat(auto-fit,minmax(min(100%,17rem),1fr))]" };
  return <div className={cn("grid gap-5", layouts[columns], className)}>{children}</div>;
}
export function Stack({ children, gap = "md", className }: { children: ReactNode; gap?: "xs" | "sm" | "md" | "lg" | "xl"; className?: string }) { return <div className={cn({ xs: "space-y-2", sm: "space-y-3", md: "space-y-5", lg: "space-y-8", xl: "space-y-12" }[gap], className)}>{children}</div>; }
export function SectionHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) { return <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-gold-strong">{eyebrow}</p><h1 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">{title}</h1>{description && <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-muted">{description}</p>}</div>{action}</div>; }
