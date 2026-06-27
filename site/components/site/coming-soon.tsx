"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Envolve um elemento que ainda NÃO tem função (botão "morto") e mostra um
 * tooltip no tema do Liriun avisando que é "em breve / em desenvolvimento".
 *
 * Funciona em desktop (hover), teclado (foco) e mobile (toque). O clique no
 * filho é neutralizado — não navega, só revela o tooltip.
 */
export function ComingSoon({
  children,
  label,
  className,
}: {
  children: React.ReactNode;
  label: string;
  className?: string;
}) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!show) return;
    function onDoc(e: PointerEvent) {
      if (!ref.current?.contains(e.target as Node)) setShow(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setShow(false);
    }
    document.addEventListener("pointerdown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [show]);

  return (
    <span
      ref={ref}
      className={`relative inline-flex cursor-help ${className ?? ""}`}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocusCapture={() => setShow(true)}
      onBlurCapture={() => setShow(false)}
    >
      <span
        className="inline-flex w-full"
        onClickCapture={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShow(true);
        }}
      >
        {children}
      </span>

      <span
        role="tooltip"
        className="absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+10px)] z-50 whitespace-nowrap transition-all duration-200 ease-out"
        style={{
          opacity: show ? 1 : 0,
          transform: `translateX(-50%) translateY(${show ? "0" : "4px"})`,
          visibility: show ? "visible" : "hidden",
          pointerEvents: "none",
        }}
      >
        <span
          className="block rounded-lg px-3 py-2 text-xs font-medium text-text"
          style={{
            background: "linear-gradient(180deg, rgba(40,36,60,0.98), rgba(22,20,30,0.98))",
            border: "1px solid rgba(156,123,255,0.38)",
            boxShadow: "0 12px 30px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          {label}
          <span
            aria-hidden
            className="absolute left-1/2 w-2 h-2 rotate-45"
            style={{
              top: "100%",
              marginTop: -5,
              transform: "translateX(-50%) rotate(45deg)",
              background: "rgba(22,20,30,0.98)",
              borderRight: "1px solid rgba(156,123,255,0.38)",
              borderBottom: "1px solid rgba(156,123,255,0.38)",
            }}
          />
        </span>
      </span>
    </span>
  );
}
