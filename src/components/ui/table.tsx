import { type HTMLAttributes, type TableHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

export function TableContainer({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("overflow-x-auto rounded-lg border border-line bg-surface shadow-soft", className)} {...props} />;
}

export const Table = forwardRef<HTMLTableElement, TableHTMLAttributes<HTMLTableElement>>(function Table({ className, ...props }, ref) {
  return <table ref={ref} className={cn("w-full min-w-[42rem] caption-bottom text-left text-sm", className)} {...props} />;
});

export function TableHead({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) { return <thead className={cn("border-b border-line bg-surface-subtle/70", className)} {...props} />; }
export function TableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) { return <tbody className={cn("divide-y divide-line", className)} {...props} />; }
export function TableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) { return <tr className={cn("transition-colors hover:bg-surface-subtle/70", className)} {...props} />; }
export function TableHeader({ className, ...props }: HTMLAttributes<HTMLTableCellElement>) { return <th className={cn("h-11 px-5 text-xs font-bold uppercase tracking-[0.08em] text-ink-muted", className)} {...props} />; }
export function TableCell({ className, ...props }: HTMLAttributes<HTMLTableCellElement>) { return <td className={cn("px-5 py-4 align-middle text-sm text-ink", className)} {...props} />; }
export function TableCaption({ className, ...props }: HTMLAttributes<HTMLTableCaptionElement>) { return <caption className={cn("mt-4 text-sm text-ink-muted", className)} {...props} />; }
