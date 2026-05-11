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
 * Card compacto pra referenciar uma tarefa dentro do chat do agente.
 * Identidade Liriun: dark glass + accent gradient lateral + microtype mono.
 */
export function TaskCardMini({
  tarefa,
  onClick,
}: {
  tarefa: Tarefa;
  onClick?: () => void;
}) {
  const atrasada = tarefa.status === 3;
  const concluida = tarefa.status === 2;
  const horario = formatarHorario(tarefa.horarioFinal);
  const quando = descricaoRelativa(tarefa.dataPrazo);
  const categoria = tarefa.categorias[0];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className="group relative w-full text-left rounded-2xl px-4 py-3 transition-all overflow-hidden disabled:cursor-default"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid var(--liriun-border-hi)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      {/* Faixa accent vertical (gradient brand) */}
      <span
        aria-hidden
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{
          background: atrasada
            ? "linear-gradient(180deg, #FFB99A, #EE7A8E)"
            : "var(--liriun-grad-brand)",
        }}
      />

      <div className="flex items-center justify-between gap-3 pl-2">
        <div className="min-w-0 flex-1">
          <div
            className="text-sm font-medium tracking-[-0.1px] truncate"
            style={{
              color: concluida ? "var(--liriun-text-faint)" : "var(--liriun-text)",
              textDecoration: concluida ? "line-through" : undefined,
            }}
          >
            {tarefa.nome}
          </div>
          <div className="flex items-center gap-2.5 mt-1 font-mono text-[10px] uppercase tracking-[1.2px]">
            {categoria && (
              <span className="inline-flex items-center gap-1.5 text-faint">
                <span
                  className="w-1.5 h-1.5 rounded-pill"
                  style={{
                    background: colorFromName(categoria.nome),
                    boxShadow: `0 0 6px ${colorFromName(categoria.nome)}66`,
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
        {onClick && (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-faint group-hover:text-text transition-colors shrink-0"
          >
            <path d="M9 6l6 6-6 6" />
          </svg>
        )}
      </div>
    </button>
  );
}
