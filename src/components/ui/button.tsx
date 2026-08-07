import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-bold tracking-[0.01em] transition-all duration-200 disabled:pointer-events-none disabled:opacity-45 active:scale-[0.985]",
  {
    variants: {
      variant: {
        primary: "bg-ink text-surface shadow-soft hover:-translate-y-0.5 hover:bg-black dark:hover:bg-white dark:hover:text-black",
        gold: "bg-gold text-white shadow-soft hover:-translate-y-0.5 hover:bg-gold-strong",
        secondary: "border border-line bg-surface text-ink hover:border-ink/25 hover:bg-surface-subtle",
        ghost: "text-ink hover:bg-surface-subtle",
        danger: "bg-danger text-white shadow-soft hover:-translate-y-0.5",
        link: "h-auto p-0 text-gold-strong underline-offset-4 hover:text-ink hover:underline",
      },
      size: {
        xs: "h-8 px-3 text-xs",
        sm: "h-9 px-3.5 text-xs",
        md: "h-11 px-5",
        lg: "h-12 px-6 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({ className, variant, size, loading, children, disabled, ...props }, ref) {
  return <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} disabled={disabled || loading} {...props}>
    {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
    {children}
  </button>;
});

export { buttonVariants };
