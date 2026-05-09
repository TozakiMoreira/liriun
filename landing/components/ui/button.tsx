import * as React from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: Variant;
};

const base =
  "inline-flex items-center gap-2 rounded-md px-[18px] py-[11px] text-sm font-medium tracking-[-0.1px] cursor-pointer border border-transparent transition duration-base ease-standard disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-grad-brand text-white shadow-glow hover:-translate-y-px [box-shadow:inset_0_1px_0_rgba(255,255,255,0.20),0_6px_18px_rgba(91,141,239,0.32)]",
  secondary:
    "bg-white/[0.05] text-text border-border-hi hover:bg-white/[0.08]",
  ghost:
    "bg-transparent text-text border-border-hi hover:bg-white/[0.04]",
};

export const Button = React.forwardRef<HTMLButtonElement, Props>(
  ({ className, variant = "primary", ...props }, ref) => (
    <button ref={ref} className={cn(base, variants[variant], className)} {...props} />
  ),
);
Button.displayName = "Button";
