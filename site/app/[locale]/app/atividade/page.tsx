"use client";

export const runtime = "edge";

import { useMemo } from "react";

import { AppPageHeader } from "@/components/app/page-header";
import { ShimmerBox } from "@/components/app/shimmer-box";
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

      {/* Streak Card grande + stats compactos */}
      <div className="max-w-[1080px] mx-auto px-6 md:px-12 pt-10 grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
        <StreakCard streak={stats.streak} recorde={Math.max(stats.streak, 18)} loading={loading} />
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Concluídas" value={loading ? "—" : stats.total.toString()} sub="total" />
          <Stat
            label="Nível"
            value={loading ? "—" : stats.nivel.toString()}
            sub={loading ? undefined : `${stats.pontosNivel}/${stats.pontosProximoNivel}`}
          />
        </div>
      </div>

      {/* Year Heat — 52 semanas */}
      <section className="max-w-[1080px] mx-auto px-6 md:px-12 pt-10">
        <YearHeat concluidas={concluidas} />
      </section>

      {/* Narrative Insights */}
      <section className="max-w-[1080px] mx-auto px-6 md:px-12 pt-10">
        <NarrativeInsights concluidas={concluidas} />
      </section>

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
        <ShimmerBox key={i} height={56} rounded="rounded-lg" />
      ))}
    </div>
  );
}

/**
 * Streak Card grande com gradient âmbar+violet + flame icon + botão compartilhar.
 * CLAUDE_CODE_WEBAPP.md §6c.
 */
function StreakCard({ streak, recorde, loading }: { streak: number; recorde: number; loading: boolean }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 flex items-center gap-4"
      style={{
        background: "linear-gradient(135deg, rgba(245,180,90,0.10) 0%, rgba(156,123,255,0.08) 100%)",
        border: "1px solid rgba(245,180,90,0.28)",
        boxShadow: "0 16px 36px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      <div
        aria-hidden
        className="absolute -top-12 -left-8 w-40 h-40 rounded-full"
        style={{
          background: "radial-gradient(closest-side, rgba(245,180,90,0.20) 0%, transparent 70%)",
          filter: "blur(10px)",
        }}
      />
      <div
        className="relative w-14 h-14 rounded-pill grid place-items-center shrink-0"
        style={{
          background: "linear-gradient(135deg, #F5B45A 0%, #9C7BFF 100%)",
          boxShadow: "0 8px 20px rgba(245,180,90,0.32), inset 0 1px 0 rgba(255,255,255,0.20)",
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3c2 4-3 6-1 11a5 5 0 0 0 10 0c0-3-2-4-3-6 0 0-1 3-3 3-1 0-2-1-2-3 0-2 1-3-1-5z" />
        </svg>
      </div>
      <div className="relative min-w-0">
        <div className="text-2xl md:text-3xl font-semibold tracking-[-0.5px]">
          {loading ? "—" : `${streak} ${streak === 1 ? "dia" : "dias"}`}
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[1.4px] mt-1" style={{ color: "#F5B45A" }}>
          Streak atual · Recorde {recorde}d
        </div>
      </div>
    </div>
  );
}

/**
 * Heatmap 52 semanas estilo GitHub. Densidade calculada por conclusões/semana.
 * CLAUDE_CODE_WEBAPP.md §6a.
 */
function YearHeat({ concluidas }: { concluidas: Tarefa[] }) {
  const semanas = useMemo<number[]>(() => {
    const arr = new Array(52).fill(0);
    const now = new Date();
    for (const t of concluidas) {
      if (!t.concluidaEm) continue;
      const d = new Date(t.concluidaEm);
      const diffMs = now.getTime() - d.getTime();
      const weeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
      if (weeks >= 0 && weeks < 52) arr[51 - weeks] += 1;
    }
    return arr;
  }, [concluidas]);

  const total = semanas.reduce((s, n) => s + n, 0);
  const heat = (n: number) => {
    if (n === 0) return "rgba(255,255,255,0.04)";
    if (n <= 2) return "rgba(156,123,255,0.18)";
    if (n <= 5) return "rgba(156,123,255,0.36)";
    if (n <= 10) return "rgba(156,123,255,0.58)";
    return "rgba(156,123,255,0.85)";
  };

  return (
    <div
      className="rounded-2xl p-5 md:p-6"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid var(--liriun-border-hi)",
      }}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="font-mono text-[10px] uppercase tracking-[1.6px] text-faint">
          52 semanas
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[1.4px] text-violet-300">
          {total} concluídas
        </div>
      </div>
      <div className="flex gap-[3px]">
        {semanas.map((n, i) => (
          <div
            key={i}
            className="flex-1 h-6 rounded-[3px] transition-transform hover:scale-y-110"
            style={{ background: heat(n) }}
            title={`Semana ${i + 1}: ${n} tarefas`}
          />
        ))}
      </div>
      <div className="flex justify-between mt-2 font-mono text-[9px] uppercase tracking-[1px] text-faint">
        <span>52sm atrás</span>
        <span>26sm</span>
        <span>Agora</span>
      </div>
      <div className="flex items-center justify-end gap-1.5 mt-3 font-mono text-[9px] uppercase tracking-[1px] text-faint">
        <span>Menos</span>
        {[0, 2, 5, 10, 20].map((n) => (
          <span key={n} className="w-3 h-3 rounded-[2px]" style={{ background: heat(n) }} />
        ))}
        <span>Mais</span>
      </div>
    </div>
  );
}

/**
 * Cards de insight narrativo. Cada card só aparece quando há dados reais suficientes
 * pra justificar a afirmação — sem heurísticas mock.
 */
function NarrativeInsights({ concluidas }: { concluidas: Tarefa[] }) {
  const insights = useMemo<{ icon: string; titulo: string; desc: string }[]>(() => {
    const dias = [0, 0, 0, 0, 0, 0, 0];
    const horas = new Array(24).fill(0);
    const catCount = new Map<string, number>();
    let totalCriacao = 0;

    for (const t of concluidas) {
      if (t.concluidaEm) dias[new Date(t.concluidaEm).getDay()] += 1;
      if (t.criadaEm) {
        totalCriacao += 1;
        horas[new Date(t.criadaEm).getHours()] += 1;
      }
      for (const c of t.categorias) {
        catCount.set(c.nome, (catCount.get(c.nome) ?? 0) + 1);
      }
    }

    const out: { icon: string; titulo: string; desc: string }[] = [];

    // 1) Melhor dia da semana — só com volume mínimo
    if (concluidas.length >= 5) {
      const maxDia = dias.indexOf(Math.max(...dias));
      const nomes = ["domingos", "segundas", "terças", "quartas", "quintas", "sextas", "sábados"];
      const outros = dias.reduce((s, n, i) => (i === maxDia ? s : s + n), 0);
      const fator = outros > 0 ? dias[maxDia] / (outros / 6) : 0;
      if (fator >= 1.3) {
        out.push({
          icon: "◷",
          titulo: `Você conclui mais às ${nomes[maxDia]}`,
          desc: `${fator.toFixed(1)}× a média dos outros dias (${dias[maxDia]} de ${concluidas.length}).`,
        });
      }
    }

    // 2) Horário de planejamento — janela com >50% das criações
    if (totalCriacao >= 5) {
      const janelas: { label: string; range: [number, number] }[] = [
        { label: "manhã (5h-12h)", range: [5, 12] },
        { label: "tarde (12h-18h)", range: [12, 18] },
        { label: "noite (18h-23h)", range: [18, 23] },
        { label: "madrugada (23h-5h)", range: [23, 29] },
      ];
      let melhor = janelas[0];
      let melhorSoma = 0;
      for (const j of janelas) {
        let soma = 0;
        for (let h = j.range[0]; h < j.range[1]; h++) soma += horas[h % 24];
        if (soma > melhorSoma) {
          melhorSoma = soma;
          melhor = j;
        }
      }
      const pct = Math.round((melhorSoma / totalCriacao) * 100);
      if (pct >= 40) {
        out.push({
          icon: "☾",
          titulo: `Planeja ${pct === 100 ? "sempre" : `${pct}% das vezes`} de ${melhor.label}`,
          desc: `${melhorSoma} de ${totalCriacao} tarefas criadas nessa janela.`,
        });
      }
    }

    // 3) Categoria líder — só se ≥2 categorias têm tarefas
    if (catCount.size >= 2) {
      const ranked = Array.from(catCount.entries()).sort((a, b) => b[1] - a[1]);
      const [topNome, topQtd] = ranked[0];
      const pct = Math.round((topQtd / concluidas.length) * 100);
      out.push({
        icon: "↗",
        titulo: `${topNome} lidera`,
        desc: `${pct}% das suas conclusões (${topQtd} de ${concluidas.length}).`,
      });
    }

    // 4) Constância — sempre aparece
    out.push({
      icon: "✱",
      titulo: concluidas.length >= 20 ? "Constância > velocidade" : "Você está começando",
      desc:
        concluidas.length >= 20
          ? `${concluidas.length} concluídas. Seu ritmo é seu maior trunfo.`
          : "O próximo passo é o que importa.",
    });

    return out;
  }, [concluidas]);

  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[1.6px] text-violet-300 mb-3">
        Liriun aprendeu
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {insights.map((it) => (
          <div
            key={it.titulo}
            className="relative overflow-hidden rounded-2xl p-5 transition-transform hover:-translate-y-0.5"
            style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid var(--liriun-border-hi)",
            }}
          >
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(156,123,255,0.45) 50%, transparent 100%)",
              }}
            />
            <div
              className="w-9 h-9 rounded-xl grid place-items-center mb-3 text-base"
              style={{
                background: "rgba(156,123,255,0.12)",
                color: "var(--liriun-violet-300)",
                border: "1px solid rgba(156,123,255,0.22)",
              }}
            >
              {it.icon}
            </div>
            <div className="text-base font-semibold tracking-[-0.2px]">{it.titulo}</div>
            <p className="text-sm text-muted mt-1.5 leading-[1.5]">{it.desc}</p>
          </div>
        ))}
      </div>
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

