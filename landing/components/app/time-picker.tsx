"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  value: string;             // "HH:mm" ou ""
  onChange: (v: string) => void;
  placeholder?: string;
  step?: number;             // step minutos. Default 15.
};

export function TimePicker({ value, onChange, placeholder = "Selecionar horário", step = 15 }: Props) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setAberto(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberto(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [aberto]);

  const [hh, mm] = parseHHMM(value);
  const horas = Array.from({ length: 24 }, (_, i) => i);
  const minutos = Array.from({ length: Math.ceil(60 / step) }, (_, i) => i * step);

  function escolherHora(h: number) {
    onChange(`${pad(h)}:${pad(mm ?? 0)}`);
  }
  function escolherMinuto(m: number) {
    onChange(`${pad(hh ?? 8)}:${pad(m)}`);
  }
  function limpar() {
    onChange("");
    setAberto(false);
  }
  function confirmar() {
    setAberto(false);
  }

  const labelInput = value || "";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setAberto((a) => !a)}
        className={`w-full flex items-center justify-between gap-2 bg-white/[0.05] border border-border-hi rounded-md px-3 py-2.5 text-sm text-left transition-colors hover:border-violet-500/40 focus:outline-none focus:border-violet-500/60 ${
          labelInput ? "text-text font-mono" : "text-faint"
        }`}
      >
        <span>{labelInput || placeholder}</span>
        <ClockIcon />
      </button>

      {aberto && (
        <div
          className="absolute z-50 mt-2 left-0 w-[260px] rounded-2xl p-4"
          style={{
            background: "rgba(20,22,28,0.98)",
            border: "1px solid var(--liriun-border-hi)",
            boxShadow: "0 16px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="flex justify-center mb-3 font-mono text-2xl font-semibold tracking-[-0.6px]">
            <span className={hh != null ? "text-text" : "text-dim"}>{hh != null ? pad(hh) : "--"}</span>
            <span className="text-faint mx-1">:</span>
            <span className={mm != null ? "text-text" : "text-dim"}>{mm != null ? pad(mm) : "--"}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Coluna
              label="HORA"
              items={horas}
              selecionado={hh}
              onPick={escolherHora}
            />
            <Coluna
              label="MIN"
              items={minutos}
              selecionado={mm}
              onPick={escolherMinuto}
            />
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={limpar}
              className="font-mono text-[11px] uppercase tracking-[1px] text-faint hover:text-text"
            >
              Limpar
            </button>
            <button
              type="button"
              onClick={confirmar}
              className="font-mono text-[11px] uppercase tracking-[1px] text-violet-300 hover:text-violet-200"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Coluna({
  label,
  items,
  selecionado,
  onPick,
}: {
  label: string;
  items: number[];
  selecionado: number | null;
  onPick: (v: number) => void;
}) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[1.2px] text-faint mb-1.5 text-center">
        {label}
      </div>
      <div
        className="h-[180px] overflow-y-auto rounded-md py-1"
        style={{
          background: "rgba(255,255,255,0.025)",
          border: "1px solid var(--liriun-border)",
        }}
      >
        {items.map((n) => {
          const ativo = selecionado === n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onPick(n)}
              className={`w-full px-3 py-1.5 text-sm font-mono transition-colors ${
                ativo ? "text-white font-semibold" : "text-muted hover:text-text"
              }`}
              style={
                ativo
                  ? {
                      background: "var(--liriun-grad-brand)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
                    }
                  : undefined
              }
            >
              {pad(n)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function parseHHMM(v: string): [number | null, number | null] {
  if (!v) return [null, null];
  const [hStr, mStr] = v.split(":");
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  return [Number.isNaN(h) ? null : h, Number.isNaN(m) ? null : m];
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function ClockIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}
