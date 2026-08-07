"use client";

import { Menu, Moon, PanelLeftClose, PanelLeftOpen, Search, Sun, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";

export function BrandMark({ compact = false, className }: { compact?: boolean; className?: string }) {
  if (compact) return <div className={cn("grid size-9 place-items-center border border-gold text-lg font-semibold text-gold", className)}><span className="font-display">B</span></div>;
  return <div className={cn("inline-flex items-center", className)}><img src="/brand/bersu-logo.png" alt="Bersu Yatırım Invest" className="h-14 w-auto object-contain" /></div>;
}

export type NavigationItem = { label: string; href: string; icon?: ReactNode; badge?: string | number; children?: Array<{ label: string; href: string }> };

export function Sidebar({ items, currentPath, className }: { items: NavigationItem[]; currentPath?: string; className?: string }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside className={cn("relative hidden h-dvh shrink-0 border-r border-line bg-surface transition-[width] duration-300 lg:block", collapsed ? "w-[4.5rem]" : "w-64", className)}>
      <div className="flex h-20 items-center border-b border-line px-5">{collapsed ? <BrandMark compact /> : <BrandMark />}</div>
      <nav className="space-y-1 p-3" aria-label="Primary navigation">
        {items.map((item) => <SidebarItem key={item.href} item={item} active={currentPath === item.href || currentPath?.startsWith(`${item.href}/`)} collapsed={collapsed} />)}
      </nav>
      <button onClick={() => setCollapsed(!collapsed)} className="absolute -right-3 top-24 grid size-6 place-items-center rounded-full border border-line bg-surface text-ink-muted shadow-soft hover:text-ink" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
        {collapsed ? <PanelLeftOpen className="size-3.5" /> : <PanelLeftClose className="size-3.5" />}
      </button>
    </aside>
  );
}

function SidebarItem({ item, active, collapsed }: { item: NavigationItem; active?: boolean; collapsed: boolean }) {
  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={cn("flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-bold transition-colors", active ? "bg-gold-soft text-gold-strong" : "text-ink-muted hover:bg-surface-subtle hover:text-ink")}
    >
      {item.icon && <span className="size-4 shrink-0">{item.icon}</span>}
      {!collapsed && <>
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
        {item.badge !== undefined && <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] text-ink-muted">{item.badge}</span>}
      </>}
    </Link>
  );
}

export function Navbar({ title, actions, onMenuClick }: { title?: string; actions?: ReactNode; onMenuClick?: () => void }) { return <header className="flex h-20 items-center justify-between border-b border-line bg-surface px-5 sm:px-8"><div className="flex items-center gap-3"><button onClick={onMenuClick} className="grid size-9 place-items-center rounded-sm hover:bg-surface-subtle lg:hidden" aria-label="Open navigation"><Menu className="size-5" /></button>{title && <h1 className="font-display text-2xl font-semibold">{title}</h1>}</div><div className="flex items-center gap-2">{actions}<ThemeToggle /></div></header>; }

export function MobileNavigation({ open, onClose, items, currentPath }: { open: boolean; onClose: () => void; items: NavigationItem[]; currentPath?: string }) { return <div className={cn("fixed inset-0 z-50 lg:hidden", !open && "pointer-events-none")} aria-hidden={!open}><button className={cn("absolute inset-0 bg-black/35 transition-opacity", open ? "opacity-100" : "opacity-0")} onClick={onClose} aria-label="Close navigation" /><aside className={cn("absolute inset-y-0 left-0 w-72 border-r border-line bg-surface p-4 shadow-float transition-transform", open ? "translate-x-0" : "-translate-x-full")}><div className="flex h-12 items-center justify-between"><BrandMark /><button onClick={onClose} className="grid size-9 place-items-center rounded-sm hover:bg-surface-subtle"><X className="size-5" /></button></div><nav className="mt-6 space-y-1">{items.map((item) => <SidebarItem key={item.href} item={item} active={currentPath === item.href} collapsed={false} />)}</nav></aside></div>; }

export function SearchField({ placeholder = "Search", className }: { placeholder?: string; className?: string }) { return <label className={cn("relative hidden w-72 sm:block", className)}><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" /><input type="search" placeholder={placeholder} className="h-10 w-full rounded-sm border border-line bg-surface-subtle pl-9 pr-3 text-sm outline-none transition focus:border-gold focus:bg-surface" /></label>; }

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => { const stored = localStorage.getItem("bersu-theme"); const enabled = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches; setDark(enabled); document.documentElement.classList.toggle("dark", enabled); }, []);
  function toggle() { const next = !dark; setDark(next); document.documentElement.classList.toggle("dark", next); localStorage.setItem("bersu-theme", next ? "dark" : "light"); }
  return <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle colour mode">{dark ? <Sun className="size-4" /> : <Moon className="size-4" />}</Button>;
}
