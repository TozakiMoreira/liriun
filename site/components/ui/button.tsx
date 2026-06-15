import * as React from "react";
import { cn } from "@/lib/cn";
import { BtnSpinner } from "@/components/ui/btn-spinner";

type Variant = "primary" | "secondary" | "ghost";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: Variant;
  /** Mostra spinner inline e desabilita o botão. */
  loading?: boolean;
};

// Base: transição padronizada, focus-visible já vem do globals.css.
// Hover lift (-1px) e active dip (+1px) em todas variantes.
const base =
  "inline-flex items-center justify-center gap-2 rounded-md px-[18px] py-[11px] text-sm font-medium tracking-[-0.1px] cursor-pointer border border-transparent transition duration-base ease-standard disabled:opacity-50 disabled:pointer-events-none hover:-translate-y-px active:translate-y-px active:duration-75";

const variants: Record<Variant, string> = {
  primary:
    "bg-grad-brand text-white shadow-glow [box-shadow:inset_0_1px_0_rgba(255,255,255,0.20),0_6px_18px_rgba(91,141,239,0.32)] hover:[box-shadow:inset_0_1px_0_rgba(255,255,255,0.24),0_10px_24px_rgba(91,141,239,0.40)] active:[box-shadow:inset_0_1px_0_rgba(255,255,255,0.16),0_3px_10px_rgba(91,141,239,0.28)]",
  secondary:
    "bg-white/[0.05] text-text border-border-hi hover:bg-white/[0.08] active:bg-white/[0.06]",
  ghost:
    "bg-transparent text-text border-border-hi hover:bg-white/[0.04] active:bg-white/[0.02]",
};

export const Button = React.forwardRef<HTMLButtonElement, Props>(
  ({ className, variant = "primary", loading = false, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(base, variants[variant], className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <BtnSpinner /> : children}
    </button>
  ),
);
Button.displayName = "Button";
