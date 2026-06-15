"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  value: string;             // "YYYY-MM-DD"
  onChange: (v: string) => void;
  placeholder?: string;
};

const MESES = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

const DIAS_SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];

export function DatePicker({ value, onChange, placeholder = "Selecionar data" }: Props) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const valorDate = useMemo(() => parseISO(value), [value]);
  const [cursor, setCursor] = useState<{ ano: number; mes: number }>(() => {
    const d = valorDate ?? new Date();
    return { ano: d.getFullYear(), mes: d.getMonth() };
  });

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

  const diasGrid = useMemo(() => construirGrid(cursor.ano, cursor.mes), [cursor]);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  function escolher(d: Date) {
    onChange(formatISO(d));
    setAberto(false);
  }

  function navegarMes(delta: number) {
    setCursor(({ ano, mes }) => {
      const novo = new Date(ano, mes + delta, 1);
      return { ano: novo.getFullYear(), mes: novo.getMonth() };
    });
  }

  function irHoje() {
    const d = new Date();
    setCursor({ ano: d.getFullYear(), mes: d.getMonth() });
    onChange(formatISO(d));
    setAberto(false);
  }

  function limpar() {
    onChange("");
    setAberto(false);
  }

  const labelInput = valorDate ? formatarPt(valorDate) : "";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setAberto((a) => !a)}
        className={`w-full flex items-center justify-between gap-2 bg-white/[0.05] border border-border-hi rounded-md px-3 py-2.5 text-sm text-left transition-colors hover:border-violet-500/40 focus:outline-none focus:border-violet-500/60 ${
          labelInput ? "text-text" : "text-faint"
        }`}
      >
        <span>{labelInput || placeholder}</span>
        <CalendarIcon />
      </button>

      {aberto && (
        <div
          className="absolute z-50 mt-2 left-0 w-[300px] rounded-2xl p-4"
          style={{
            background: "rgba(20,22,28,0.98)",
            border: "1px solid var(--liriun-border-hi)",
            boxShadow: "0 16px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Header mês */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => navegarMes(-1)}
              aria-label="Mês anterior"
              className="w-8 h-8 rounded-md grid place-items-center text-muted hover:text-text hover:bg-white/[0.06]"
            >
              <ChevronLeft />
            </button>
            <div className="font-medium tracking-[-0.2px]">
              <span className="capitalize">{MESES[cursor.mes]}</span>{" "}
              <span className="text-muted font-mono">{cursor.ano}</span>
            </div>
            <button
              type="button"
              onClick={() => navegarMes(1)}
              aria-label="Próximo mês"
              className="w-8 h-8 rounded-md grid place-items-center text-muted hover:text-text hover:bg-white/[0.06]"
            >
              <ChevronRight />
            </button>
          </div>

          {/* Cabeçalho dias da semana */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DIAS_SEMANA.map((d, i) => (
              <div
                key={i}
                className="font-mono text-[10px] uppercase tracking-[1.2px] text-faint text-center py-1"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 gap-1">
            {diasGrid.map((d, i) => {
              const noMes = d.getMonth() === cursor.mes;
              const ehHoje = sameDay(d, hoje);
              const ehSelecionado = valorDate ? sameDay(d, valorDate) : false;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => escolher(d)}
                  className={`relative h-9 rounded-md text-sm font-medium transition-colors ${
                    !noMes ? "text-dim" : ehSelecionado ? "text-white" : "text-text hover:bg-white/[0.06]"
                  }`}
                  style={
                    ehSelecionado
                      ? {
                          background: "var(--liriun-grad-brand)",
                          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18), 0 4px 12px rgba(91,141,239,0.30)",
                        }
                      : ehHoje
                        ? { border: "1px solid rgba(156,123,255,0.45)" }
                        : undefined
                  }
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>

          {/* Footer */}
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
              onClick={irHoje}
              className="font-mono text-[11px] uppercase tracking-[1px] text-violet-300 hover:text-violet-200"
            >
              Hoje
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function parseISO(iso: string): Date | null {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function formatISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatarPt(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function construirGrid(ano: number, mes: number): Date[] {
  const inicio = new Date(ano, mes, 1);
  const dow = inicio.getDay(); // 0 = domingo
  const grid: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(ano, mes, 1 - dow + i);
    grid.push(d);
  }
  return grid;
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
    </svg>
  );
}
function ChevronLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}
function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}
