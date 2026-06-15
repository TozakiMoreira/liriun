"use client";

import { useEffect } from "react";

export function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
  closeOnBackdrop = true,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  closeOnBackdrop?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const widths: Record<typeof size, string> = {
    sm: "max-w-[420px]",
    md: "max-w-[560px]",
    lg: "max-w-[760px]",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6 animate-fade-in"
      style={{ background: "rgba(8,10,14,0.65)", backdropFilter: "blur(2px)" }}
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        className={`w-full ${widths[size]} max-h-[92vh] overflow-y-auto rounded-t-[28px] md:rounded-2xl p-6 md:p-7 animate-slide-up md:animate-scale-in`}
        style={{
          background: "rgba(20,22,28,0.96)",
          border: "1px solid var(--liriun-border-hi)",
          boxShadow: "0 -20px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle mobile */}
        <div className="md:hidden flex justify-center pb-3">
          <div className="w-10 h-1 rounded-pill" style={{ background: "rgba(255,255,255,0.18)" }} />
        </div>

        {title && (
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold tracking-[-0.3px]">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="w-8 h-8 rounded-md grid place-items-center text-muted hover:text-text hover:bg-white/[0.06]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
