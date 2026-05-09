"use client";

export const runtime = "edge";

import { useMemo } from "react";

import { TarefaRow } from "@/components/app/tarefa-row";
import { useUsuarioAtual } from "@/components/auth/auth-provider";
import { useTarefas } from "@/lib/api/hooks/use-tarefas";
import { ehHoje, paraDataLocal } from "@/lib/datetime";
import type { Tarefa } from "@/lib/api/tarefas";

export default function HojePage() {
  const { pendentes, concluidas, loading, concluir, reabrir } = useTarefas();
  const usuario = useUsuarioAtual();
  const primeiroNome = usuario?.nome.split(" ")[0] ?? "";

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
    pendentes: pendentes.filter((t) => t.status === 1 && ehHoje(t.dataPrazo)).length,
    atrasadas: pendentes.filter((t) => t.status === 3).length,
    concluidas: concluidasHoje.length,
  };

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
                {primeiroNome ? `Olá, ${primeiroNome}.` : "Hoje"}
              </h1>
              <p className="text-base text-muted leading-[1.55] mt-2">
                Tarefas com prazo hoje, próximas e atrasadas.
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1080px] mx-auto px-6 md:px-12 pt-10 grid grid-cols-3 gap-4">
        <Stat label="Pendentes" value={loading ? "—" : stats.pendentes.toString()} />
        <Stat label="Atrasadas" value={loading ? "—" : stats.atrasadas.toString()} tone="warning" />
        <Stat label="Concluídas" value={loading ? "—" : stats.concluidas.toString()} tone="success" />
      </div>

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
                onToggle={() => (t.status === 2 ? reabrir(t.id) : concluir(t.id))}
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
                onToggle={() => reabrir(t.id)}
              />
            ))}
          </div>
        </section>
      )}
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
  return (
    <div
      className="rounded-2xl border border-border-hi p-5"
      style={{ background: "rgba(255,255,255,0.035)" }}
    >
      <div className="font-mono text-xs uppercase tracking-[1.4px] text-faint mb-3">{label}</div>
      <div className={`text-3xl font-semibold tracking-[-0.6px] ${accent}`}>{value}</div>
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
      {[1, 2].map((i) => (
        <div
          key={i}
          className="h-14 rounded-lg animate-pulse"
          style={{ background: "rgba(255,255,255,0.025)" }}
        />
      ))}
    </div>
  );
}

function hoje(): string {
  try {
    const fmt = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "short" });
    return fmt.format(new Date()).toUpperCase();
  } catch {
    return new Date().toDateString();
  }
}
