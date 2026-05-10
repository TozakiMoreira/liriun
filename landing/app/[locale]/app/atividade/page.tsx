"use client";

export const runtime = "edge";

import { useMemo } from "react";

import { AppPageHeader } from "@/components/app/page-header";
import { TarefaRow } from "@/components/app/tarefa-row";
import { useTarefas } from "@/lib/api/hooks/use-tarefas";
import type { Tarefa } from "@/lib/api/tarefas";

type Conquista = {
  id: string;
  label: string;
  desc: string;
  icon: string;
  unlocked: boolean;
};

type Stats = {
  total: number;
  streak: number;
  nivel: number;
  pontosNivel: number;
  pontosProximoNivel: number;
};

export default function AtividadePage() {
  const { concluidas, loading, reabrir } = useTarefas();

  const stats = useMemo<Stats>(() => calcularStats(concluidas), [concluidas]);

  const conquistas = useMemo<Conquista[]>(
    () => calcularConquistas(stats, concluidas),
    [stats, concluidas],
  );

  const concluidasRecentes = useMemo<Tarefa[]>(
    () =>
      [...concluidas]
        .sort((a, b) => {
          const da = a.concluidaEm ? new Date(a.concluidaEm).getTime() : 0;
          const db = b.concluidaEm ? new Date(b.concluidaEm).getTime() : 0;
          return db - da;
        })
        .slice(0, 10),
    [concluidas],
  );

  return (
    <div className="pb-24 md:pb-12">
      <AppPageHeader
        kicker="Sua jornada"
        title="Atividade"
        lead="Tarefas concluídas + conquistas. Sem ranking, sem comparação — só você."
      />

      <div className="max-w-[1080px] mx-auto px-6 md:px-12 pt-10 grid grid-cols-3 gap-4">
        <Stat
          label="Concluídas"
          value={loading ? "—" : stats.total.toString()}
          sub="total"
        />
        <Stat
          label="Streak atual"
          value={loading ? "—" : stats.streak.toString()}
          sub={loading ? undefined : stats.streak === 1 ? "dia" : "dias"}
          tone="violet"
        />
        <Stat
          label="Nível"
          value={loading ? "—" : stats.nivel.toString()}
          sub={loading ? undefined : `${stats.pontosNivel}/${stats.pontosProximoNivel}`}
        />
      </div>

      <section className="max-w-[1080px] mx-auto px-6 md:px-12 pt-10">
        <div className="font-mono text-xs uppercase tracking-[1.4px] text-violet-300 mb-3">
          Conquistas
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {conquistas.map((a) => (
            <div
              key={a.id}
              className="rounded-2xl border border-border-hi p-5 flex flex-col items-center text-center transition-colors"
              style={{
                background: a.unlocked ? "rgba(156,123,255,0.06)" : "var(--liriun-overlay-soft)",
                borderColor: a.unlocked ? "rgba(156,123,255,0.32)" : "var(--liriun-border-hi)",
              }}
            >
              <div
                className="w-14 h-14 rounded-pill grid place-items-center mb-3"
                style={{
                  background: a.unlocked ? "var(--liriun-grad-brand)" : "rgba(255,255,255,0.05)",
                  border: "1px solid var(--liriun-border-hi)",
                  boxShadow: a.unlocked
                    ? "0 8px 22px rgba(91,141,239,0.30), inset 0 1px 0 rgba(255,255,255,0.22)"
                    : "none",
                  opacity: a.unlocked ? 1 : 0.5,
                }}
              >
                <span className="text-xl">{a.icon}</span>
              </div>
              <div
                className="text-sm font-semibold tracking-[-0.1px]"
                style={{ color: a.unlocked ? "var(--liriun-text)" : "var(--liriun-text-muted)" }}
              >
                {a.label}
              </div>
              <div className="text-xs text-muted mt-1 leading-[1.4]">{a.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-[1080px] mx-auto px-6 md:px-12 pt-10">
        <div className="font-mono text-xs uppercase tracking-[1.4px] text-violet-300 mb-3">
          Concluídas recentemente
        </div>
        {loading ? (
          <Loading />
        ) : concluidasRecentes.length === 0 ? (
          <div
            className="rounded-2xl border border-border-hi p-8 text-sm text-muted text-center"
            style={{ background: "var(--liriun-overlay-soft)" }}
          >
            Conclua a primeira tarefa pra ver aqui.
          </div>
        ) : (
          <div className="flex flex-col">
            {concluidasRecentes.map((t) => (
              <TarefaRow key={t.id} tarefa={t} onToggle={() => reabrir(t.id)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  tone = "neutral",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "neutral" | "violet";
}) {
  return (
    <div
      className="rounded-2xl border border-border-hi p-4 md:p-6 text-center flex flex-col items-center"
      style={{ background: "var(--liriun-overlay-soft)" }}
    >
      {/* Zona 1 — label: sempre reserva 2 linhas (lida com label de 1 ou 2 linhas em qualquer viewport) */}
      <div className="font-mono text-[10px] md:text-xs uppercase tracking-[1.2px] md:tracking-[1.4px] text-faint min-h-[2lh] flex items-center justify-center leading-tight">
        {label}
      </div>
      {/* Zona 2 — valor: número grande, sempre presente */}
      <div
        className={`text-2xl md:text-3xl font-semibold tracking-[-0.4px] md:tracking-[-0.6px] truncate my-2 md:my-3 ${
          tone === "violet" ? "bg-grad-brand bg-clip-text text-transparent" : "text-text"
        }`}
      >
        {value}
      </div>
      {/* Zona 3 — sub: sempre reserva 1 linha (nbsp como placeholder se não tiver sub) */}
      <div className="font-mono text-[10px] md:text-[11px] text-faint truncate min-h-[1lh]">
        {sub ?? " "}
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="flex flex-col gap-2">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-14 rounded-lg animate-pulse"
          style={{ background: "var(--liriun-overlay-soft)" }}
        />
      ))}
    </div>
  );
}

// ─── lógica ─────────────────────────────────────────────────────────

function calcularStats(concluidas: Tarefa[]): Stats {
  const total = concluidas.length;

  // Streak: dias seguidos terminando hoje com ≥1 conclusão
  const datas = new Set(
    concluidas
      .filter((t) => t.concluidaEm)
      .map((t) => {
        const d = new Date(t.concluidaEm!);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      }),
  );

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  while (datas.has(cursor.getTime())) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  // Nível: cada 10 concluídas = 1 nível. Pontos = total mod 10.
  const nivel = Math.floor(total / 10) + 1;
  const pontosNivel = total % 10;
  const pontosProximoNivel = 10;

  return { total, streak, nivel, pontosNivel, pontosProximoNivel };
}

function calcularConquistas(stats: Stats, concluidas: Tarefa[]): Conquista[] {
  // Voz veterana: tarefas criadas via captura de voz não está taggeada no model atual.
  // Por ora, fallback baseado em count (usar quando model expor origem).
  return [
    {
      id: "first-task",
      label: "Primeira tarefa",
      desc: "Você concluiu sua primeira tarefa.",
      icon: "🌱",
      unlocked: stats.total >= 1,
    },
    {
      id: "10-tasks",
      label: "10 concluídas",
      desc: "10 tarefas finalizadas.",
      icon: "💎",
      unlocked: stats.total >= 10,
    },
    {
      id: "streak-7",
      label: "7 dias seguidos",
      desc: "Uma semana de constância.",
      icon: "🔥",
      unlocked: stats.streak >= 7,
    },
    {
      id: "50-tasks",
      label: "50 concluídas",
      desc: "Você não para.",
      icon: "🚀",
      unlocked: stats.total >= 50,
    },
  ];
}

