import { cva, type VariantProps } from "class-variance-authority";
import { type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em]", {
  variants: {
    variant: {
      neutral: "bg-surface-subtle text-ink-muted",
      gold: "bg-gold-soft text-gold-strong",
      success: "bg-emerald-50 text-success dark:bg-emerald-950/40",
      warning: "bg-amber-50 text-warning dark:bg-amber-950/40",
      danger: "bg-red-50 text-danger dark:bg-red-950/40",
      outline: "border border-line bg-transparent text-ink-muted",
    },
  },
  defaultVariants: { variant: "neutral" },
});

export function Badge({ className, variant, ...props }: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
