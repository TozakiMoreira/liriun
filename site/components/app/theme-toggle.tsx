"use client";

import { useEffect, useState } from "react";

type Tema = "system" | "light" | "dark";
const STORAGE = "liriun.theme";

function resolveResolved(t: Tema): "light" | "dark" {
  if (t !== "system") return t;
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(t: Tema) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = resolveResolved(t);
}

export function ThemeToggle() {
  const [tema, setTema] = useState<Tema>("dark");
  const [hidratado, setHidratado] = useState(false);

  useEffect(() => {
    const saved = (window.localStorage.getItem(STORAGE) as Tema | null) ?? "dark";
    const validado: Tema = saved === "light" || saved === "dark" || saved === "system" ? saved : "dark";
    setTema(validado);
    setHidratado(true);
    applyTheme(validado);

    if (validado === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => applyTheme("system");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, []);

  function escolher(t: Tema) {
    setTema(t);
    window.localStorage.setItem(STORAGE, t);
    applyTheme(t);
  }

  const opts: { id: Tema; label: string; icon: React.ReactNode }[] = [
    { id: "system", label: "Auto", icon: <SystemIcon /> },
    { id: "light", label: "Claro", icon: <SunIcon /> },
    { id: "dark", label: "Escuro", icon: <MoonIcon /> },
  ];

  // Posição do knob: 0=auto, 1=light, 2=dark
  const idx = opts.findIndex((o) => o.id === tema);
  const knobX = hidratado ? `${idx * 56 + 3}px` : "115px";

  return (
    <div
      role="radiogroup"
      aria-label="Tema"
      className="relative inline-flex items-center h-[40px] rounded-pill p-[3px]"
      style={{
        background: "var(--liriun-surface-hi)",
        border: "1px solid var(--liriun-border-hi)",
        boxShadow: "inset 0 1px 2px rgba(0,0,0,0.18)",
        width: 168,
      }}
    >
      {/* Knob deslizante */}
      <span
        className="absolute top-[3px] w-[56px] h-[32px] rounded-pill transition-all duration-base ease-standard pointer-events-none"
        style={{
          left: knobX,
          background: "var(--liriun-grad-brand)",
          boxShadow: "0 4px 12px rgba(91,141,239,0.32), inset 0 1px 0 rgba(255,255,255,0.22)",
        }}
        aria-hidden
      />

      {opts.map((o) => {
        const active = tema === o.id;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => escolher(o.id)}
            className="relative z-10 inline-flex items-center justify-center gap-1.5 w-[56px] h-[32px] rounded-pill font-mono text-[11px] uppercase tracking-[0.6px] transition-colors"
            style={{
              color: active ? "#fff" : "var(--liriun-text-muted)",
            }}
            title={o.label}
          >
            {o.icon}
          </button>
        );
      })}
    </div>
  );
}

function SystemIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M9 21h6M12 17v4" />
    </svg>
  );
}
function SunIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
    </svg>
  );
}
