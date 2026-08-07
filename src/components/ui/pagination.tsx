import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Pagination({ page, pageCount, onPageChange, className }: { page: number; pageCount: number; onPageChange: (page: number) => void; className?: string }) {
  const pages = visiblePages(page, pageCount);
  return <nav className={cn("flex items-center justify-between gap-3", className)} aria-label="Pagination"><p className="hidden text-sm text-ink-muted sm:block">Page {page} of {pageCount}</p><div className="ml-auto flex items-center gap-1"><PageButton label="Previous page" disabled={page === 1} onClick={() => onPageChange(page - 1)}><ChevronLeft className="size-4" /></PageButton>{pages.map((item, index) => item === "…" ? <span key={`${item}-${index}`} className="grid size-9 place-items-center text-ink-faint"><MoreHorizontal className="size-4" /></span> : <PageButton key={item} active={item === page} onClick={() => onPageChange(item)}>{item}</PageButton>)}<PageButton label="Next page" disabled={page === pageCount} onClick={() => onPageChange(page + 1)}><ChevronRight className="size-4" /></PageButton></div></nav>;
}

function PageButton({ children, active, label, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean; label?: string }) { return <button className={cn("grid size-9 place-items-center rounded-sm text-sm font-bold transition-colors hover:bg-surface-subtle disabled:opacity-35", active && "bg-ink text-surface hover:bg-ink")} aria-current={active ? "page" : undefined} aria-label={label} {...props}>{children}</button>; }
function visiblePages(page: number, pageCount: number): Array<number | "…"> { if (pageCount <= 7) return Array.from({ length: pageCount }, (_, index) => index + 1); const middle = [page - 1, page, page + 1].filter((value) => value > 1 && value < pageCount); return [1, ...(middle[0] > 2 ? ["…" as const] : []), ...middle, ...(middle.at(-1)! < pageCount - 1 ? ["…" as const] : []), pageCount]; }
