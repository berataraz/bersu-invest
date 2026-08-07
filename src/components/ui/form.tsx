import { ChevronDown, Eye, EyeOff } from "lucide-react";
import { type InputHTMLAttributes, type LabelHTMLAttributes, type ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes, forwardRef, useState } from "react";
import { cn } from "@/lib/cn";

const inputClassName = "flex h-11 w-full rounded-sm border border-line bg-surface px-3.5 text-sm text-ink outline-none transition placeholder:text-ink-faint hover:border-ink/25 focus:border-gold disabled:cursor-not-allowed disabled:bg-surface-subtle disabled:opacity-65";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, type, ...props }, ref) {
  const [visible, setVisible] = useState(false);
  const password = type === "password";
  return <div className="relative">
    <input ref={ref} type={password && visible ? "text" : type} className={cn(inputClassName, password && "pr-11", className)} {...props} />
    {password && <button type="button" onClick={() => setVisible(!visible)} className="absolute inset-y-0 right-0 grid w-11 place-items-center text-ink-faint hover:text-ink" aria-label={visible ? "Hide password" : "Show password"}>
      {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
    </button>}
  </div>;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn(inputClassName, "min-h-28 resize-y py-3", className)} {...props} />;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, children, ...props }, ref) {
  return <div className="relative">
    <select ref={ref} className={cn(inputClassName, "appearance-none pr-10", className)} {...props}>{children}</select>
    <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
  </div>;
});

export function Label({ className, required, ...props }: LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }) {
  return <label className={cn("mb-2 block text-sm font-bold text-ink", className)} {...props}>{props.children}{required && <span className="ml-1 text-gold" aria-hidden="true">*</span>}</label>;
}

export function Field({ label, hint, error, required, className, children }: { label?: string; hint?: string; error?: string; required?: boolean; className?: string; children: ReactNode }) {
  return <div className={cn("space-y-0", className)}>
    {label && <Label required={required}>{label}</Label>}
    {children}
    {error ? <p role="alert" className="mt-1.5 text-xs font-medium text-danger">{error}</p> : hint && <p className="mt-1.5 text-xs leading-5 text-ink-muted">{hint}</p>}
  </div>;
}

export function FormSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return <section className="grid gap-5 border-b border-line py-7 last:border-0 md:grid-cols-[minmax(10rem,0.7fr)_minmax(0,1.3fr)]">
    <div><h3 className="font-display text-xl font-semibold">{title}</h3>{description && <p className="mt-1 text-sm leading-6 text-ink-muted">{description}</p>}</div>
    <div className="grid gap-5">{children}</div>
  </section>;
}
