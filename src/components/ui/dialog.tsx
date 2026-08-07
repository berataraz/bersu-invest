"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { type ComponentPropsWithoutRef, type HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export const DialogContent = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof DialogPrimitive.Content>>(function DialogContent({ className, children, ...props }, ref) {
  return <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/35 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out" />
    <DialogPrimitive.Content ref={ref} className={cn("fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-5 rounded-lg border border-line bg-surface p-6 shadow-float data-[state=open]:animate-in data-[state=closed]:animate-out", className)} {...props}>
      {children}<DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm p-1 text-ink-muted hover:bg-surface-subtle hover:text-ink"><X className="size-4" /><span className="sr-only">Close</span></DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>;
});
export function DialogHeader(props: HTMLAttributes<HTMLDivElement>) { return <div className="space-y-1.5" {...props} />; }
export function DialogTitle(props: ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) { return <DialogPrimitive.Title className="font-display pr-8 text-2xl font-semibold" {...props} />; }
export function DialogDescription(props: ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) { return <DialogPrimitive.Description className="text-sm leading-6 text-ink-muted" {...props} />; }
export function DialogFooter(props: HTMLAttributes<HTMLDivElement>) { return <div className="flex flex-col-reverse justify-end gap-2 pt-2 sm:flex-row" {...props} />; }
