"use client";

export const runtime = "edge";

import { useEffect, useMemo, useState } from "react";

import { Modal } from "@/components/app/modal";
import { ShimmerBox } from "@/components/app/shimmer-box";
import { TarefaCheckbox } from "@/components/app/tarefa-checkbox";
import { TarefaForm } from "@/components/app/tarefa-form";
import { TarefaRow } from "@/components/app/tarefa-row";
import { ToastViewport, useToasts } from "@/components/app/toast";
import { useUsuarioAtual } from "@/components/auth/auth-provider";
import { useTarefas } from "@/lib/api/hooks/use-tarefas";
import { prefetchCategorias } from "@/lib/api/hooks/use-categorias";
import { ehHoje, paraDataLocal } from "@/lib/datetime";
import type { CriarTarefaInput, Tarefa } from "@/lib/api/tarefas";

export default function HojePage() {
  const { pendentes, concluidas, loading, concluir, reabrir, atualizar } = useTarefas();
  const { toasts, push, dismiss } = useToasts();
  const usuario = useUsuarioAtual();
  const primeiroNome = usuario?.nome.split(" ")[0] ?? "";
  const [tarefaEditando, setTarefaEditando] = useState<Tarefa | null>(null);
  const [saudacao, setSaudacao] = useState("Olá");
  const [lembrete, setLembrete] = useState<string | null>(null);
  useEffect(() => {
    const h = new Date().getHours();
    setSaudacao(h >= 5 && h < 12 ? "Bom dia" : h >= 12 && h < 18 ? "Boa tarde" : "Boa noite");
    setLembrete(escolherLembrete(h));
  }, []);

  // Aquece o cache de categorias ao abrir a tela (o card reusa, sem refetch).
  useEffect(() => {
    prefetchCategorias();
  }, []);

  function abrirEditar(t: Tarefa) {
    setTarefaEditando(t);
  }

  function handleToggle(t: Tarefa) {
    const id = t.id;
    if (t.status === 2) {
      void reabrir(id);
      push({ message: "Desconcluído", actionLabel: "Desfazer", onAction: () => void concluir(id) });
    } else {
      void concluir(id);
      push({ message: "Concluído", actionLabel: "Desfazer", onAction: () => void reabrir(id) });
    }
  }

  function concluirEditando() {
    const t = tarefaEditando;
    if (!t) return;
    void concluir(t.id);
    push({ message: "Concluído", actionLabel: "Desfazer", onAction: () => void reabrir(t.id) });
    setTarefaEditando(null);
  }

  async function handleSubmitForm(input: CriarTarefaInput) {
    if (tarefaEditando) {
      await atualizar(tarefaEditando.id, input);
    }
    setTarefaEditando(null);
  }

  const tarefasHoje = useMemo<Tarefa[]>(
    () =>
      pendentes
        .filter((t) => ehHoje(t.dataPrazo) || t.status === 3)
        .sort(
          (a, b) => paraDataLocal(a.dataPrazo).getTime() - paraDataLocal(b.dataPrazo).getTime(),
        ),
    [pendentes],
  );
  const concluidasHoje = useMemo<Tarefa[]>(
    () => concluidas.filter((t) => t.concluidaEm && ehHoje(t.concluidaEm)),
    [concluidas],
  );

  const stats = {
    pendentes: pendentes.filter((t) => ehHoje(t.dataPrazo)).length,
    atrasadas: pendentes.filter((t) => t.status === 3).length,
    concluidas: concluidasHoje.length,
  };

  // Próxima tarefa = primeira tarefa pendente cujo prazo é hoje (não atrasada)
  const proximaTarefa = useMemo<Tarefa | null>(
    () => tarefasHoje.find((t) => t.status === 1) ?? tarefasHoje[0] ?? null,
    [tarefasHoje],
  );

  const inicial = usuario?.nome.trim().charAt(0).toUpperCase() ?? "?";

  return (
    <div className="pb-24 md:pb-12">
      <header className="px-6 md:px-12 pt-10 md:pt-14 pb-8 border-b border-border">
        <div className="max-w-[1080px] mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="flex items-center gap-5 min-w-0">
            {usuario?.fotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={usuario.fotoUrl}
                alt={usuario.nome}
                className="w-16 h-16 md:w-[72px] md:h-[72px] rounded-pill object-cover border border-border-hi shrink-0"
              />
            ) : (
              <div
                className="w-16 h-16 md:w-[72px] md:h-[72px] rounded-pill bg-grad-brand grid place-items-center font-mono text-xl font-semibold text-white shrink-0"
                aria-hidden
              >
                {inicial}
              </div>
            )}
            <div className="min-w-0">
              <div className="font-mono text-xs uppercase tracking-[1.4px] text-violet-300 mb-2">
                {hoje()}
              </div>
              <h1 className="text-3xl md:text-[44px] font-semibold tracking-[-1.2px] leading-[1.1]">
                {primeiroNome ? `${saudacao}, ${primeiroNome}.` : "Hoje"}
              </h1>
              {lembrete && (
                <p className="text-base text-muted leading-[1.55] mt-2 italic">
                  {lembrete}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      <section className="max-w-[1080px] mx-auto px-6 md:px-12 pt-10 grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6">
        <div>
          <DayShape tarefas={tarefasHoje} />
          <FeaturedNext tarefa={proximaTarefa} onEdit={abrirEditar} onToggle={handleToggle} />
        </div>
        <LiriunSugere
          totalHoje={stats.pendentes}
          concluidas={stats.concluidas}
          atrasadas={stats.atrasadas}
          primeiroNome={primeiroNome}
        />
      </section>

      <section className="max-w-[1080px] mx-auto px-6 md:px-12 pt-10">
        <SectionHeader label="Hoje" count={tarefasHoje.length} />
        {loading ? (
          <Loading />
        ) : tarefasHoje.length === 0 ? (
          <Empty />
        ) : (
          <div className="flex flex-col">
            {tarefasHoje.map((t) => (
              <TarefaRow
                key={t.id}
                tarefa={t}
                onToggle={() => handleToggle(t)}
                onEdit={() => abrirEditar(t)}
              />
            ))}
          </div>
        )}
      </section>


      {concluidasHoje.length > 0 && (
        <section className="max-w-[1080px] mx-auto px-6 md:px-12 pt-10">
          <SectionHeader label="Concluídas hoje" count={concluidasHoje.length} />
          <div className="flex flex-col">
            {concluidasHoje.map((t) => (
              <TarefaRow
                key={t.id}
                tarefa={t}
                onToggle={() => handleToggle(t)}
                onEdit={() => abrirEditar(t)}
              />
            ))}
          </div>
        </section>
      )}

      <Modal
        open={tarefaEditando !== null}
        onClose={() => setTarefaEditando(null)}
        title="Editar tarefa"
        size="md"
      >
        {tarefaEditando && (
          <TarefaForm
            tarefa={tarefaEditando}
            onSubmit={handleSubmitForm}
            onCancel={() => setTarefaEditando(null)}
            onConcluir={concluirEditando}
          />
        )}
      </Modal>

      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "warning" | "success";
}) {
  const accent =
    tone === "warning" ? "text-warning" : tone === "success" ? "text-success" : "text-text";
  // Background e borda sutilmente coloridos por tone — semáforo visual sem agredir.
  const bg =
    tone === "warning"
      ? "rgba(255,185,154,0.06)"
      : tone === "success"
        ? "rgba(123,215,176,0.06)"
        : "rgba(255,255,255,0.035)";
  const borderColor =
    tone === "warning"
      ? "rgba(255,185,154,0.22)"
      : tone === "success"
        ? "rgba(123,215,176,0.22)"
        : "var(--liriun-border-hi)";
  return (
    <div
      className="rounded-2xl border p-4 md:p-5 text-center"
      style={{ background: bg, borderColor }}
    >
      <div className="font-mono text-[10px] md:text-xs uppercase tracking-[1.2px] md:tracking-[1.4px] text-faint mb-2 md:mb-3">
        {label}
      </div>
      <div className={`text-2xl md:text-3xl font-semibold tracking-[-0.4px] md:tracking-[-0.6px] ${accent}`}>
        {value}
      </div>
    </div>
  );
}

function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center gap-3 mb-1.5">
      <span className="font-mono text-xs uppercase tracking-[1.4px] text-text">{label}</span>
      <span className="font-mono text-xs text-dim">{count.toString().padStart(2, "0")}</span>
      <span className="flex-1 h-px bg-border" />
    </div>
  );
}

function Empty() {
  return (
    <div
      className="rounded-2xl border border-border-hi p-8 text-sm text-muted text-center"
      style={{ background: "rgba(255,255,255,0.025)" }}
    >
      Sem tarefas por aqui. Toque <span className="text-violet-300 font-medium">Falar</span> pra
      começar.
    </div>
  );
}

function Loading() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map((i) => (
        <ShimmerBox key={i} height={56} rounded="rounded-lg" />
      ))}
    </div>
  );
}

// Frases curtas e diretas no tom Liriun (mordomo seco). Rotação pseudo-aleatória
// estável por dia/turno pra não ficar trocando a cada render mas variar entre sessões.
const LEMBRETES_MANHA = [
  "Um passo de cada vez. O dia é seu.",
  "Comece pela tarefa que pesa menos.",
  "Hoje só precisa do próximo movimento.",
  "Foco no que está à mão. O resto espera.",
  "A constância vale mais que a pressa.",
];
const LEMBRETES_TARDE = [
  "Meio do dia. Respira antes do próximo passo.",
  "Já fez mais do que parece. Segue.",
  "Pausa rápida — depois retoma com clareza.",
  "Pequenos progressos somam.",
  "Foco no que ainda faz sentido fazer hoje.",
];
const LEMBRETES_NOITE = [
  "Encerre o dia com leveza.",
  "Fechou mais um. Amanhã é página nova.",
  "Descansar também é produtividade.",
  "Anote o que ficou. O sono trabalha por você.",
  "O dia ofereceu o que podia. Acolhe.",
];

function escolherLembrete(h: number): string {
  const pool = h >= 5 && h < 12 ? LEMBRETES_MANHA : h >= 12 && h < 18 ? LEMBRETES_TARDE : LEMBRETES_NOITE;
  const d = new Date();
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate() + (h < 12 ? 0 : h < 18 ? 1 : 2);
  return pool[seed % pool.length];
}

function hoje(): string {
  try {
    const fmt = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "short" });
    return fmt.format(new Date()).toUpperCase();
  } catch {
    return new Date().toDateString();
  }
}

/**
 * Timeline horizontal 6h-24h com marcadores nas tarefas + linha "agora".
 * Inspirado em "Day Shape" do app v2 (CLAUDE_CODE_WEBAPP.md §4).
 */
function DayShape({ tarefas }: { tarefas: Tarefa[] }) {
  const [agora, setAgora] = useState<Date | null>(null);
  useEffect(() => {
    setAgora(new Date());
    const t = setInterval(() => setAgora(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  // Marca posição percentual no eixo 6h-24h (18h faixa)
  const pct = (date: Date) => {
    const h = date.getHours() + date.getMinutes() / 60;
    const clamped = Math.max(6, Math.min(24, h));
    return ((clamped - 6) / 18) * 100;
  };

  const agoraPct = agora ? pct(agora) : 0;
  const marcadores = tarefas
    .filter((t) => t.horarioFinal)
    .map((t) => {
      const [h, m] = (t.horarioFinal ?? "00:00").split(":").map(Number);
      const d = new Date();
      d.setHours(h, m, 0, 0);
      return { id: t.id, pct: pct(d), atrasada: t.status === 3 };
    });

  return (
    <div
      className="rounded-2xl p-5 md:p-6 mb-6"
      style={{
        background:
          "linear-gradient(180deg, rgba(28,30,38,0.96) 0%, rgba(18,20,26,0.96) 100%)",
        border: "1px solid var(--liriun-border-hi)",
      }}
    >
      <div className="font-mono text-[10px] uppercase tracking-[1.6px] text-faint mb-4">
        O dia
      </div>

      <div className="relative h-2 rounded-full overflow-visible" style={{ background: "rgba(255,255,255,0.05)" }}>
        {/* Fill até agora */}
        {agora && (
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              width: `${agoraPct}%`,
              background: "var(--liriun-grad-brand)",
              opacity: 0.55,
            }}
          />
        )}
        {/* Marcadores tarefas */}
        {marcadores.map((m) => (
          <span
            key={m.id}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full"
            style={{
              left: `${m.pct}%`,
              background: m.atrasada ? "#FFB99A" : "var(--liriun-violet-300)",
              boxShadow: `0 0 8px ${m.atrasada ? "rgba(255,185,154,0.6)" : "rgba(156,123,255,0.6)"}`,
            }}
          />
        ))}
        {/* Linha agora */}
        {agora && (
          <span
            aria-hidden
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
            style={{
              left: `${agoraPct}%`,
              width: 3,
              height: 16,
              background: "var(--liriun-grad-brand)",
              borderRadius: 2,
              boxShadow: "0 0 8px rgba(156,123,255,0.7)",
            }}
          />
        )}
      </div>

      <div className="flex justify-between mt-2 font-mono text-[9px] uppercase tracking-[1px] text-faint">
        <span>6H</span>
        <span>12H</span>
        <span>18H</span>
        <span>24H</span>
      </div>

      {agora && (
        <div className="mt-2 font-mono text-[10px] uppercase tracking-[1.4px] text-violet-300">
          Agora · {agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
        </div>
      )}
    </div>
  );
}

function FeaturedNext({
  tarefa,
  onEdit,
  onToggle,
}: {
  tarefa: Tarefa | null;
  onEdit: (t: Tarefa) => void;
  onToggle: (t: Tarefa) => void;
}) {
  if (!tarefa) return null;
  const atrasada = tarefa.status === 3;
  const horario = tarefa.horarioFinal?.slice(0, 5);
  return (
    <div
      className="relative rounded-2xl p-5 md:p-6 transition-transform hover:-translate-y-0.5"
      style={{
        background: atrasada
          ? "linear-gradient(135deg, rgba(255,185,154,0.10) 0%, rgba(238,122,142,0.06) 100%)"
          : "linear-gradient(135deg, rgba(156,123,255,0.14) 0%, rgba(91,141,239,0.08) 100%)",
        border: `1px solid ${atrasada ? "rgba(255,185,154,0.30)" : "rgba(156,123,255,0.30)"}`,
        boxShadow: "0 16px 36px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      {/* Concluir — bolinha no canto */}
      <div className="absolute top-5 right-5 md:top-6 md:right-6 z-10">
        <TarefaCheckbox concluida={false} atrasada={atrasada} onToggle={() => onToggle(tarefa)} />
      </div>

      <button type="button" onClick={() => onEdit(tarefa)} className="w-full text-left pr-9">
        <div
          className="font-mono text-[10px] uppercase tracking-[1.6px] mb-2"
          style={{ color: atrasada ? "#FFB99A" : "var(--liriun-violet-300)" }}
        >
          {atrasada ? "Atrasada · acerte primeiro" : "A seguir"}
        </div>
        <div className="text-xl md:text-2xl font-semibold tracking-[-0.4px]">{tarefa.nome}</div>
        <div className="flex items-center gap-3 mt-3 font-mono text-[10px] uppercase tracking-[1.2px] text-faint">
          {horario && <span>{horario}</span>}
          {tarefa.categorias[0] && (
            <>
              {horario && <span>·</span>}
              <span>{tarefa.categorias[0].nome}</span>
            </>
          )}
        </div>
      </button>
    </div>
  );
}

function LiriunSugere({
  totalHoje,
  concluidas,
  atrasadas,
  primeiroNome,
}: {
  totalHoje: number;
  concluidas: number;
  atrasadas: number;
  primeiroNome: string;
}) {
  // Sugestão proativa baseada em estado do dia
  const sugestao = (() => {
    if (atrasadas > 0) {
      return {
        titulo: atrasadas === 1 ? "1 tarefa atrasada" : `${atrasadas} tarefas atrasadas`,
        desc: "Sugiro começar por elas pra desbloquear o resto do dia.",
      };
    }
    if (totalHoje === 0) {
      return {
        titulo: "Dia leve.",
        desc: primeiroNome
          ? `Aproveita pra adiantar algo, ${primeiroNome}, ou descansar.`
          : "Aproveita pra adiantar algo, ou descansar.",
      };
    }
    if (concluidas >= totalHoje) {
      return {
        titulo: "Tudo em dia.",
        desc: "Você fechou tudo de hoje. Posso adiantar amanhã?",
      };
    }
    const restantes = totalHoje - concluidas;
    return {
      titulo: restantes === 1 ? "1 tarefa restante" : `${restantes} tarefas restantes`,
      desc: "Bora seguindo. Comece pela próxima da lista.",
    };
  })();

  return (
    <aside
      className="relative overflow-hidden rounded-2xl p-5 md:p-6 h-fit"
      style={{
        background:
          "linear-gradient(180deg, rgba(156,123,255,0.14) 0%, rgba(91,141,239,0.06) 100%)",
        border: "1px solid rgba(156,123,255,0.28)",
        boxShadow: "0 16px 36px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(156,123,255,0.55) 50%, transparent 100%)",
        }}
      />

      <div className="flex items-center gap-2 mb-3">
        <span
          className="w-5 h-5 rounded-pill grid place-items-center"
          style={{ background: "var(--liriun-grad-brand)" }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6L12 4z" />
          </svg>
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[1.6px] text-violet-300">
          Liriun sugere
        </span>
      </div>

      <div className="text-lg font-semibold tracking-[-0.2px] leading-snug">
        {sugestao.titulo}
      </div>
      <p className="text-sm text-muted mt-2 leading-[1.5]">{sugestao.desc}</p>

      <div className="flex gap-4 mt-4 pt-4 border-t border-white/[0.06] font-mono text-[10px] uppercase tracking-[1.2px]">
        <div>
          <div className="text-text font-semibold text-base normal-case tracking-[-0.2px]">
            {totalHoje}
          </div>
          <div className="text-faint mt-0.5">Hoje</div>
        </div>
        <div className="border-l border-white/[0.06] pl-4">
          <div className="text-text font-semibold text-base normal-case tracking-[-0.2px]">
            {concluidas}
          </div>
          <div className="text-faint mt-0.5">Feitas</div>
        </div>
        {atrasadas > 0 && (
          <div className="border-l border-white/[0.06] pl-4">
            <div className="text-base font-semibold normal-case tracking-[-0.2px]" style={{ color: "#FFB99A" }}>
              {atrasadas}
            </div>
            <div className="text-faint mt-0.5">Atrasadas</div>
          </div>
        )}
      </div>
    </aside>
  );
}
