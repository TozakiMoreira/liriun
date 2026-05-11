"use client";

import { useState } from "react";

import { descricaoRelativa, formatarDataCurta, formatarHorario } from "@/lib/datetime";
import {
  PRIORIDADE_LABEL,
  type Prioridade,
  type StatusTarefa,
  type Tarefa,
} from "@/lib/api/tarefas";

const CAT_COLORS = ["#7AA9FF", "#7BD7B0", "#F0B36E", "#C8A0FF", "#9C7BFF", "#EE7A8E"];

function colorFromName(nome: string): string {
  let hash = 0;
  for (let i = 0; i < nome.length; i++) hash = (hash * 31 + nome.charCodeAt(i)) | 0;
  return CAT_COLORS[Math.abs(hash) % CAT_COLORS.length];
}

export function TarefaRow({
  tarefa,
  onToggle,
  onEdit,
  onDelete,
}: {
  tarefa: Tarefa;
  onToggle: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const [hovering, setHovering] = useState(false);

  const concluida = tarefa.status === 2;
  const atrasada = tarefa.status === 3;

  const horario = formatarHorario(tarefa.horarioFinal);
  const dataCurta = formatarDataCurta(tarefa.dataPrazo);
  const quando = descricaoRelativa(tarefa.dataPrazo);

  return (
    <div
      className="group flex items-center gap-4 py-3.5 px-2 -mx-2 rounded-lg hover:bg-white/[0.025] transition-colors"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Checkbox */}
      <button
        type="button"
        onClick={onToggle}
        aria-label={concluida ? "Reabrir tarefa" : "Concluir tarefa"}
        className="w-[22px] h-[22px] rounded-pill grid place-items-center transition-all shrink-0"
        style={{
          border: concluida ? "none" : `1.5px solid ${atrasada ? "rgba(255,185,154,0.65)" : "var(--liriun-border-hi)"}`,
          background: concluida ? "var(--liriun-grad-brand)" : "transparent",
          boxShadow: concluida ? "0 4px 10px rgba(91,141,239,0.3)" : "none",
        }}
      >
        {concluida && (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5l4.5 4.5L19 7" />
          </svg>
        )}
      </button>

      {/* Texto */}
      <button
        type="button"
        onClick={onEdit}
        className="flex-1 min-w-0 text-left"
      >
        <div
          className="text-base font-medium tracking-[-0.1px] truncate"
          style={
            concluida
              ? { color: "var(--liriun-text-faint)", textDecoration: "line-through" }
              : { color: "var(--liriun-text)" }
          }
        >
          {tarefa.nome}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 font-mono text-xs text-faint tracking-[0.3px]">
          {/* Categorias */}
          {tarefa.categorias.slice(0, 2).map((c) => {
            const color = colorFromName(c.nome);
            return (
              <span key={c.id} className="inline-flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-pill"
                  style={{ background: color, boxShadow: `0 0 6px ${color}66` }}
                />
                <span className="uppercase">{c.nome}</span>
              </span>
            );
          })}

          {/* Quando: atrasada / hoje / amanhã / em N dias (+ horário opcional) */}
          <span
            className="inline-flex items-center gap-1"
            style={{ color: atrasada ? "#FFB99A" : undefined }}
          >
            <ClockIcon size={11} color={atrasada ? "#FFB99A" : "currentColor"} />
            {atrasada
              ? `Atrasada · ${dataCurta}`
              : horario
                ? `${quando} · ${horario}`
                : quando}
          </span>

          {/* Prioridade alta */}
          {tarefa.prioridade === 1 && (
            <span className="inline-flex items-center gap-1" style={{ color: "#FFB99A" }}>
              <FlameIcon /> Urgente
            </span>
          )}
          {tarefa.prioridade === 2 && (
            <span className="inline-flex items-center gap-1" style={{ color: "var(--liriun-warning)" }}>
              <FlagIcon /> Importante
            </span>
          )}
        </div>
      </button>

      {/* Ações */}
      <div
        className={`flex items-center gap-1 shrink-0 transition-opacity ${hovering ? "opacity-100" : "opacity-0"}`}
      >
        {onEdit && (
          <IconButton onClick={onEdit} label="Editar">
            <EditIcon />
          </IconButton>
        )}
        {onDelete && (
          <IconButton onClick={onDelete} label="Excluir" danger>
            <TrashIcon />
          </IconButton>
        )}
      </div>
    </div>
  );
}

function IconButton({
  onClick,
  label,
  children,
  danger = false,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`w-8 h-8 rounded-md grid place-items-center hover:bg-white/[0.06] transition-colors ${
        danger ? "text-danger" : "text-muted hover:text-text"
      }`}
    >
      {children}
    </button>
  );
}

function ClockIcon({ size = 12, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

function FlameIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3c2 4-3 6-1 11a5 5 0 0 0 10 0c0-3-2-4-3-6 0 0-1 3-3 3-1 0-2-1-2-3 0-2 1-3-1-5z" />
    </svg>
  );
}

function FlagIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 21V4" />
      <path d="M5 4h11l-2 4 2 4H5" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20h4l11-11-4-4L4 16v4z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h16M9 7V4h6v3M6 7v13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7M10 11v7M14 11v7" />
    </svg>
  );
}

// (StatusTarefa / Prioridade types unused here — re-exported only for completeness)
export type { StatusTarefa, Prioridade, Tarefa };
export { PRIORIDADE_LABEL };
