import * as React from "react";

import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, type, ...props }, ref) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-9 w-full rounded border border-border bg-bg-elev px-3 py-2 text-sm text-text",
        "placeholder:text-text-subtle",
        "transition-colors hover:border-border-strong",
        "focus:outline-none focus:border-accent focus:bg-bg-input",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
});
