"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { cn } from "@/lib/cn";

export const Accordion = AccordionPrimitive.Root;
export const AccordionItem = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>>(function AccordionItem({ className, ...props }, ref) {
  return <AccordionPrimitive.Item ref={ref} className={cn("border-b border-line", className)} {...props} />;
});
export const AccordionTrigger = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>>(function AccordionTrigger({ className, children, ...props }, ref) {
  return <AccordionPrimitive.Header><AccordionPrimitive.Trigger ref={ref} className={cn("flex w-full items-center justify-between gap-4 py-5 text-left text-sm font-bold text-ink transition hover:text-gold-strong [&[data-state=open]>svg]:rotate-180", className)} {...props}>{children}<ChevronDown className="size-4 shrink-0 transition-transform duration-200" /></AccordionPrimitive.Trigger></AccordionPrimitive.Header>;
});
export const AccordionContent = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>>(function AccordionContent({ className, ...props }, ref) {
  return <AccordionPrimitive.Content ref={ref} className={cn("overflow-hidden text-sm leading-7 text-ink-muted data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down", className)}><div className="pb-5" {...props} /></AccordionPrimitive.Content>;
});
