"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, ChevronRight } from "lucide-react";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { cn } from "@/lib/cn";

export const Dropdown = DropdownMenu.Root;
export const DropdownTrigger = DropdownMenu.Trigger;
export const DropdownGroup = DropdownMenu.Group;
export const DropdownRadioGroup = DropdownMenu.RadioGroup;
export const DropdownSub = DropdownMenu.Sub;

export const DropdownContent = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof DropdownMenu.Content>>(function DropdownContent({ className, sideOffset = 8, ...props }, ref) {
  return <DropdownMenu.Portal><DropdownMenu.Content ref={ref} sideOffset={sideOffset} className={cn("z-50 min-w-48 overflow-hidden rounded-md border border-line bg-surface p-1.5 text-ink shadow-float data-[state=open]:animate-in data-[state=closed]:animate-out", className)} {...props} /></DropdownMenu.Portal>;
});

export const DropdownItem = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof DropdownMenu.Item>>(function DropdownItem({ className, ...props }, ref) {
  return <DropdownMenu.Item ref={ref} className={cn("relative flex cursor-default select-none items-center gap-2 rounded-sm px-3 py-2 text-sm outline-none transition-colors focus:bg-surface-subtle data-[disabled]:pointer-events-none data-[disabled]:opacity-45", className)} {...props} />;
});

export function DropdownLabel(props: ComponentPropsWithoutRef<typeof DropdownMenu.Label>) { return <DropdownMenu.Label className="px-3 py-2 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-faint" {...props} />; }
export function DropdownSeparator(props: ComponentPropsWithoutRef<typeof DropdownMenu.Separator>) { return <DropdownMenu.Separator className="my-1.5 h-px bg-line" {...props} />; }
export function DropdownCheckboxItem({ children, checked, ...props }: ComponentPropsWithoutRef<typeof DropdownMenu.CheckboxItem>) { return <DropdownMenu.CheckboxItem checked={checked} className="relative flex cursor-default select-none items-center rounded-sm py-2 pl-8 pr-3 text-sm outline-none focus:bg-surface-subtle" {...props}><span className="absolute left-3">{checked && <Check className="size-3.5" />}</span>{children}</DropdownMenu.CheckboxItem>; }
export function DropdownSubTrigger({ children, ...props }: ComponentPropsWithoutRef<typeof DropdownMenu.SubTrigger>) { return <DropdownMenu.SubTrigger className="flex cursor-default select-none items-center rounded-sm px-3 py-2 text-sm outline-none focus:bg-surface-subtle" {...props}>{children}<ChevronRight className="ml-auto size-4" /></DropdownMenu.SubTrigger>; }
