"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      theme="dark"
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            "bg-bg-elev border border-border text-text shadow-md rounded text-sm",
          description: "text-text-dim text-xs",
          actionButton: "bg-accent text-white",
          cancelButton: "bg-bg-input text-text-dim",
          success: "border-accent/40",
          error: "border-danger/40",
        },
      }}
    />
  );
}
