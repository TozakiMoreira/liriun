"use client";

import { useState } from "react";

import { BtnSpinner } from "@/components/ui/btn-spinner";
import { descricaoRelativa, formatarHorario } from "@/lib/datetime";
import type { Tarefa } from "@/lib/api/tarefas";
import type { AcaoSugerida } from "@/lib/api/agente";

type Props = {
  acao: AcaoSugerida;
  tarefa: Tarefa;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
  disabled?: boolean;
};

const LABEL: Record<AcaoSugerida["tipo"], { titulo: string; verb: string; danger?: boolean }> = {
  concluir: { titulo: "Concluir tarefa", verb: "Concluir" },
  excluir: { titulo: "Excluir tarefa", verb: "Excluir", danger: true },
  editar: { titulo: "Editar tarefa", verb: "Aplicar mudanças" },
};

export function AcaoConfirmCard({ acao, tarefa, onConfirm, onCancel, disabled }: Props) {
  const [executando, setExecutando] = useState(false);
  const cfg = LABEL[acao.tipo];

  async function handle() {
    setExecutando(true);
    try {
      await onConfirm();
    } finally {
      setExecutando(false);
    }
  }

  const horario = formatarHorario(tarefa.horarioFinal);
  const quando = descricaoRelativa(tarefa.dataPrazo);
  const mud = acao.mudancas;

  return (
    <div
      className="relative overflow-hidden rounded-2xl px-4 py-4 animate-fade-in"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid var(--liriun-border-hi)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      {/* Faixa accent vertical */}
      <span
        aria-hidden
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{
          background: cfg.danger
            ? "linear-gradient(180deg, #FFB99A, #EE7A8E)"
            : "var(--liriun-grad-brand)",
        }}
      />

      <div className="pl-2">
        <div className="font-mono text-[10px] uppercase tracking-[1.6px] text-faint mb-2">
          {cfg.titulo}
        </div>

        <div className="text-base font-semibold tracking-[-0.2px] text-text">{tarefa.nome}</div>

        <div className="flex items-center gap-2.5 mt-1.5 font-mono text-[10px] uppercase tracking-[1.2px] text-faint">
          {tarefa.categorias[0] && <span>{tarefa.categorias[0].nome}</span>}
          <span>·</span>
          <span>
            {tarefa.status === 3 ? "Atrasada" : quando}
            {horario && tarefa.status !== 3 && ` · ${horario}`}
          </span>
        </div>

        {acao.tipo === "editar" && mud && (
          <div className="mt-3 pt-3 border-t border-border-hi/40">
            <div className="font-mono text-[10px] uppercase tracking-[1.6px] mb-1.5" style={{ color: "var(--liriun-violet-300)" }}>
              Mudanças
            </div>
            <ul className="flex flex-col gap-1 text-sm text-text">
              {mud.titulo && mud.titulo.trim() !== tarefa.nome && (
                <li className="flex gap-2">
                  <span className="text-faint">Nome:</span>
                  <span>{mud.titulo}</span>
                </li>
              )}
              {mud.dataPrazo && (
                <li className="flex gap-2">
                  <span className="text-faint">Data:</span>
                  <span>{descricaoRelativa(mud.dataPrazo)}</span>
                </li>
              )}
              {mud.horarioFinal && (
                <li className="flex gap-2">
                  <span className="text-faint">Hora:</span>
                  <span>{mud.horarioFinal}</span>
                </li>
              )}
              {mud.prioridade != null && (
                <li className="flex gap-2">
                  <span className="text-faint">Prioridade:</span>
                  <span>{prioridadeLabel(mud.prioridade)}</span>
                </li>
              )}
              {mud.categoriaIds.length > 0 && (
                <li className="flex gap-2">
                  <span className="text-faint">Categoria:</span>
                  <span>{mud.categoriaIds.length === 1 ? "nova" : `${mud.categoriaIds.length} categorias`}</span>
                </li>
              )}
            </ul>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={executando || disabled}
            className="flex-1 rounded-md px-4 py-2 text-sm font-medium text-muted border border-border-hi hover:bg-white/[0.04] transition-colors disabled:opacity-50"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void handle()}
            disabled={executando || disabled}
            className="flex-1 rounded-md px-4 py-2 text-sm font-medium text-white transition-all disabled:opacity-50"
            style={{
              background: cfg.danger
                ? "linear-gradient(180deg, #EE7A8E, #C84A60)"
                : "var(--liriun-grad-brand)",
              boxShadow: cfg.danger
                ? "0 4px 12px rgba(238,122,142,0.30)"
                : "0 4px 12px rgba(91,141,239,0.28), inset 0 1px 0 rgba(255,255,255,0.18)",
            }}
          >
            {executando ? <BtnSpinner /> : cfg.verb}
          </button>
        </div>
      </div>
    </div>
  );
}

function prioridadeLabel(p: number): string {
  return p === 1 ? "Urgente" : p === 2 ? "Importante" : p === 3 ? "Normal" : "Baixa";
}
