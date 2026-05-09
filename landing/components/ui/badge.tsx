import * as React from "react";
import { cn } from "@/lib/cn";

type Variant = "violet" | "neutral" | "success" | "warning";

type Props = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: Variant;
};

const variants: Record<Variant, string> = {
  violet:
    "bg-[rgba(156,123,255,0.10)] border-[rgba(156,123,255,0.25)] text-[#C8B6FF]",
  neutral:
    "bg-white/[0.05] border-border-hi text-muted",
  success:
    "bg-[rgba(123,215,176,0.12)] border-[rgba(123,215,176,0.32)] text-success",
  warning:
    "bg-[rgba(240,179,110,0.12)] border-[rgba(240,179,110,0.32)] text-warning",
};

export function Badge({ className, variant = "violet", ...props }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 px-3 py-[7px] rounded-pill border font-mono text-xs font-medium uppercase tracking-[0.4px]",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
