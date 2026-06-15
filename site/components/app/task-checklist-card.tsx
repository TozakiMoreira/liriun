"use client";

import { descricaoRelativa, formatarHorario } from "@/lib/datetime";
import type { Tarefa } from "@/lib/api/tarefas";

const CAT_COLORS = ["#7AA9FF", "#7BD7B0", "#F0B36E", "#C8A0FF", "#9C7BFF", "#EE7A8E"];

function colorFromName(nome: string): string {
  let hash = 0;
  for (let i = 0; i < nome.length; i++) hash = (hash * 31 + nome.charCodeAt(i)) | 0;
  return CAT_COLORS[Math.abs(hash) % CAT_COLORS.length];
}

/**
 * Checklist visual rico quando o agente referencia ≥2 tarefas numa resposta.
 * Identidade Liriun: dark glass + hairline gradient brand topo + microtype mono
 * + checkboxes circle decorativos + linha accent (laranja se atrasada).
 */
export function TaskChecklistCard({
  tarefas,
  titulo = "Suas tarefas",
}: {
  tarefas: Tarefa[];
  titulo?: string;
}) {
  if (tarefas.length === 0) return null;

  const atrasadasCount = tarefas.filter((t) => t.status === 3).length;

  return (
    <div
      className="relative overflow-hidden rounded-2xl animate-fade-in"
      style={{
        background:
          "linear-gradient(180deg, rgba(28,30,38,0.96) 0%, rgba(18,20,26,0.96) 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow:
          "0 12px 36px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      {/* Hairline gradient brand topo */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(156,123,255,0.55) 30%, rgba(91,141,239,0.55) 70%, transparent 100%)",
        }}
      />

      {/* Glow radial sutil canto */}
      <div
        aria-hidden
        className="absolute -top-12 -left-8 w-48 h-48 rounded-pill pointer-events-none"
        style={{
          background:
            "radial-gradient(closest-side, rgba(156,123,255,0.18) 0%, transparent 70%)",
          filter: "blur(8px)",
        }}
      />

      {/* Header */}
      <div className="relative flex items-center justify-between px-5 pt-4 pb-3.5">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="w-5 h-5 rounded-pill grid place-items-center shrink-0"
            style={{ background: "var(--liriun-grad-brand)" }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </span>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[1.8px] text-faint">
              {titulo}
            </div>
            <div className="text-[13px] text-text font-medium tracking-[-0.1px] mt-0.5">
              {tarefas.length}{" "}
              <span className="text-muted font-normal">
                {tarefas.length === 1 ? "tarefa" : "tarefas"}
              </span>
            </div>
          </div>
        </div>

        {atrasadasCount > 0 && (
          <span
            className="font-mono text-[9px] uppercase tracking-[1.6px] px-2.5 py-1 rounded-pill"
            style={{
              color: "#FFB99A",
              background: "rgba(255,185,154,0.10)",
              border: "1px solid rgba(255,185,154,0.25)",
            }}
          >
            {atrasadasCount} atrasada{atrasadasCount > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Linha separadora gradient sutil */}
      <div
        aria-hidden
        className="mx-5 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.10) 50%, transparent 100%)",
        }}
      />

      {/* Items */}
      <ul className="relative px-3 py-2 flex flex-col">
        {tarefas.map((t, i) => {
          const atrasada = t.status === 3;
          const concluida = t.status === 2;
          const horario = formatarHorario(t.horarioFinal);
          const quando = descricaoRelativa(t.dataPrazo);
          const categoria = t.categorias[0];
          const catColor = categoria ? colorFromName(categoria.nome) : undefined;

          return (
            <li
              key={t.id}
              className={`group flex items-center gap-3 px-2 py-3 rounded-xl transition-colors hover:bg-white/[0.03] ${
                i > 0 ? "border-t border-white/[0.04]" : ""
              }`}
              style={i > 0 ? { borderTopWidth: "1px" } : undefined}
            >
              {/* Checkbox decorativo */}
              <span
                aria-hidden
                className="w-5 h-5 rounded-pill shrink-0 grid place-items-center transition-all"
                style={{
                  border: concluida
                    ? "none"
                    : `1.5px solid ${atrasada ? "rgba(255,185,154,0.55)" : "rgba(255,255,255,0.20)"}`,
                  background: concluida ? "var(--liriun-grad-brand)" : "transparent",
                  boxShadow: concluida ? "0 4px 10px rgba(91,141,239,0.30)" : undefined,
                }}
              >
                {concluida && (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12.5l4.5 4.5L19 7" />
                  </svg>
                )}
              </span>

              <div className="min-w-0 flex-1">
                <div
                  className="text-[14px] font-medium tracking-[-0.1px] truncate"
                  style={{
                    color: concluida ? "var(--liriun-text-faint)" : "var(--liriun-text)",
                    textDecoration: concluida ? "line-through" : undefined,
                  }}
                >
                  {t.nome}
                </div>
                <div className="flex items-center gap-2 mt-1 font-mono text-[10px] uppercase tracking-[1.2px]">
                  {categoria && catColor && (
                    <span className="inline-flex items-center gap-1.5 text-faint">
                      <span
                        className="w-1.5 h-1.5 rounded-pill"
                        style={{
                          background: catColor,
                          boxShadow: `0 0 6px ${catColor}66`,
                        }}
                      />
                      {categoria.nome}
                    </span>
                  )}
                  <span
                    className="inline-flex items-center gap-1"
                    style={{ color: atrasada ? "#FFB99A" : "var(--liriun-text-faint)" }}
                  >
                    {atrasada ? "Atrasada" : quando}
                    {horario && !atrasada && ` · ${horario}`}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
