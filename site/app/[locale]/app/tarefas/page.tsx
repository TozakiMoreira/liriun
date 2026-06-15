"use client";

export const runtime = "edge";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import { AppPageHeader } from "@/components/app/page-header";
import { CategoriasModal } from "@/components/app/categorias-modal";
import { ConfirmDialog } from "@/components/app/confirm-dialog";
import { LiriunLoader } from "@/components/app/liriun-loader";
import { Modal } from "@/components/app/modal";
import { ShimmerBox } from "@/components/app/shimmer-box";
import { TarefaForm } from "@/components/app/tarefa-form";
import { TarefaRow } from "@/components/app/tarefa-row";
import { ToastViewport, useToasts } from "@/components/app/toast";
import { Button } from "@/components/ui/button";
import { useTarefas } from "@/lib/api/hooks/use-tarefas";
import { prefetchCategorias } from "@/lib/api/hooks/use-categorias";
import { ehAmanha, ehHoje, paraDataLocal } from "@/lib/datetime";
import type { Prioridade, StatusTarefa, Tarefa } from "@/lib/api/tarefas";

type Modo = "lista" | "quadro" | "semana";

type Filtro =
  | "todas"
  | "pendentes"
  | "atrasadas"
  | "concluidas"
  | "urgente"
  | "importante"
  | "normal"
  | "baixa";

const FILTROS: { id: Filtro; label: string; group: string }[] = [
  { id: "pendentes", label: "Pendentes", group: "Status" },
  { id: "atrasadas", label: "Atrasadas", group: "Status" },
  { id: "concluidas", label: "Concluídas", group: "Status" },
  { id: "todas", label: "Todas", group: "Status" },
  { id: "urgente", label: "Urgentes", group: "Prioridade" },
  { id: "importante", label: "Importantes", group: "Prioridade" },
  { id: "normal", label: "Normais", group: "Prioridade" },
  { id: "baixa", label: "Baixas", group: "Prioridade" },
];

// Grupos relevantes por modo: no Quadro/Semana as colunas/dias já mostram status,
// então só prioridade faz sentido. Lista mostra ambos.
function gruposParaModo(modo: Modo): readonly ("Status" | "Prioridade")[] {
  if (modo === "lista") return ["Status", "Prioridade"] as const;
  return ["Prioridade"] as const;
}

function filtroDefaultParaModo(modo: Modo): Filtro {
  if (modo === "quadro" || modo === "semana") return "todas";
  return "pendentes";
}

export default function TarefasPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-24 grid place-items-center">
          <LiriunLoader label="Carregando" />
        </div>
      }
    >
      <TarefasInner />
    </Suspense>
  );
}

function TarefasInner() {
  const { pendentes, concluidas, loading, error, criar, atualizar, concluir, reabrir, excluir } =
    useTarefas();
  const { toasts, push, dismiss } = useToasts();
  const searchParams = useSearchParams();

  // Aquece o cache de categorias ao abrir a tela — assim o card de editar/criar
  // não dispara GET /categorias toda vez que abre.
  useEffect(() => {
    prefetchCategorias();
  }, []);

  const [modo, setModo] = useState<Modo>("lista");
  const [filtro, setFiltro] = useState<Filtro>("pendentes");
  const [busca, setBusca] = useState("");
  const [filtroAberto, setFiltroAberto] = useState(false);

  // Reseta filtro quando muda de modo, caso o grupo atual não exista no novo modo
  useEffect(() => {
    const grupoAtual = FILTROS.find((f) => f.id === filtro)?.group;
    const gruposVisiveis = gruposParaModo(modo);
    if (grupoAtual && !gruposVisiveis.includes(grupoAtual as "Status" | "Prioridade")) {
      setFiltro(filtroDefaultParaModo(modo));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modo]);

  const [modalAberto, setModalAberto] = useState(false);
  const [tarefaEditando, setTarefaEditando] = useState<Tarefa | null>(null);
  const [categoriasAberto, setCategoriasAberto] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState<Tarefa | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [confirmarSaida, setConfirmarSaida] = useState(false);
  // Cronômetro com tempo não salvo? (atualizado pelo TarefaForm via onDirtyChange)
  const tempoDirtyRef = useRef(false);

  // Auto-abrir modal "Nova" via querystring (?novo=1) — vindo do FAB mobile na primeira navegação
  useEffect(() => {
    if (searchParams.get("novo") === "1") {
      setTarefaEditando(null);
      setModalAberto(true);
    }
  }, [searchParams]);

  // FAB mobile dispara CustomEvent quando já está na rota (sem nav)
  useEffect(() => {
    function handler() {
      setTarefaEditando(null);
      setModalAberto(true);
    }
    window.addEventListener("liriun:nova-tarefa", handler);
    return () => window.removeEventListener("liriun:nova-tarefa", handler);
  }, []);

  const todas = useMemo(() => [...pendentes, ...concluidas], [pendentes, concluidas]);

  const filtradas = useMemo(() => {
    return todas
      .filter((t) => {
        if (filtro === "pendentes" && t.status === 2) return false;
        if (filtro === "concluidas" && t.status !== 2) return false;
        if (filtro === "atrasadas" && t.status !== 3) return false;
        if (filtro === "urgente" && t.prioridade !== 1) return false;
        if (filtro === "importante" && t.prioridade !== 2) return false;
        if (filtro === "normal" && t.prioridade !== 3) return false;
        if (filtro === "baixa" && t.prioridade !== 4) return false;
        if (busca && !t.nome.toLowerCase().includes(busca.toLowerCase())) return false;
        return true;
      })
      .sort(ordenarPorData);
  }, [todas, filtro, busca]);

  function abrirCriar() {
    setTarefaEditando(null);
    setModalAberto(true);
  }

  function abrirEditar(t: Tarefa) {
    setTarefaEditando(t);
    setModalAberto(true);
  }

  function fecharModal() {
    tempoDirtyRef.current = false;
    setModalAberto(false);
  }

  // Guarda: se há tempo cronometrado não salvo, abre confirmação em vez de fechar.
  function tentarFecharModal(): boolean {
    if (tempoDirtyRef.current) {
      setConfirmarSaida(true);
      return false;
    }
    return true;
  }

  async function handleSubmitForm(input: Parameters<typeof criar>[0]) {
    if (tarefaEditando) {
      await atualizar(tarefaEditando.id, input);
    } else {
      await criar(input);
    }
    fecharModal();
  }

  function handleToggle(t: Tarefa) {
    const id = t.id;
    if (t.status === 2) {
      // Reabrindo uma concluída
      void reabrir(id);
      push({ message: "Desconcluído", actionLabel: "Desfazer", onAction: () => void concluir(id) });
    } else {
      // Concluindo uma pendente/atrasada
      void concluir(id);
      push({ message: "Concluído", actionLabel: "Desfazer", onAction: () => void reabrir(id) });
    }
  }

  function handleDelete(t: Tarefa) {
    setConfirmarExclusao(t);
  }

  async function confirmarExcluir() {
    if (!confirmarExclusao) return;
    setExcluindo(true);
    try {
      await excluir(confirmarExclusao.id);
      setConfirmarExclusao(null);
    } finally {
      setExcluindo(false);
    }
  }

  const filtroAtivo = FILTROS.find((f) => f.id === filtro)!;

  return (
    <div className="pb-24 md:pb-12">
      <AppPageHeader
        kicker="Suas tarefas"
        title="Tarefas"
        lead="Lista, quadro ou semana — escolha como visualizar."
        actions={
          <>
            <Button variant="ghost" onClick={() => setCategoriasAberto(true)}>
              Categorias
            </Button>
            <Button onClick={abrirCriar}>+ Nova tarefa</Button>
          </>
        }
      />

      <div className="max-w-[1080px] mx-auto px-6 md:px-12 pt-8">
        {/* Modo + Filtro + Busca */}
        <div className="flex flex-col gap-3 items-start md:flex-row md:items-center md:justify-between">
          <ModoSwitcher value={modo} onChange={setModo} />
          <div className="flex gap-2 items-center">
            <FiltroDropdown
              aberto={filtroAberto}
              setAberto={setFiltroAberto}
              filtroAtivo={filtroAtivo}
              modo={modo}
              onChange={(f) => {
                setFiltro(f);
                setFiltroAberto(false);
              }}
            />
            <input
              type="search"
              placeholder="Buscar…"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="bg-white/[0.05] border border-border-hi rounded-md px-3 py-2 text-sm text-text placeholder:text-faint focus:outline-none focus:border-violet-500/60 w-[180px]"
            />
          </div>
        </div>

        {/* Conteúdo */}
        <div className="mt-6">
          {error && (
            <div className="rounded-md border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
              {error}
            </div>
          )}

          {loading ? (
            <Loading />
          ) : modo === "lista" ? (
            <ListaView
              tarefas={filtradas}
              filtro={filtro}
              onToggle={handleToggle}
              onEdit={abrirEditar}
              onDelete={handleDelete}
            />
          ) : modo === "quadro" ? (
            <QuadroView
              tarefas={todas}
              filtro={filtro}
              busca={busca}
              onToggle={handleToggle}
              onEdit={abrirEditar}
              onDelete={handleDelete}
            />
          ) : (
            <SemanaView tarefas={filtradas} onEdit={abrirEditar} />
          )}
        </div>
      </div>

      <Modal
        open={modalAberto}
        onClose={fecharModal}
        onAttemptClose={tentarFecharModal}
        title={tarefaEditando ? "Editar tarefa" : "Nova tarefa"}
        size="md"
        closeOnBackdrop={false}
      >
        <TarefaForm
          tarefa={tarefaEditando ?? undefined}
          mostrarCronometro
          onDirtyChange={(d) => {
            tempoDirtyRef.current = d;
          }}
          onSubmit={handleSubmitForm}
          onCancel={() => {
            if (tentarFecharModal()) fecharModal();
          }}
          onConcluir={
            tarefaEditando
              ? async (input) => {
                  const t = tarefaEditando;
                  // Persiste tempo + edições antes de concluir.
                  if (input) await atualizar(t.id, input);
                  await concluir(t.id);
                  push({ message: "Concluído", actionLabel: "Desfazer", onAction: () => void reabrir(t.id) });
                  fecharModal();
                }
              : undefined
          }
        />
      </Modal>

      <ConfirmDialog
        open={confirmarSaida}
        title="Descartar tempo cronometrado?"
        message="Você cronometrou tempo nesta tarefa mas não salvou. Se sair agora, esse tempo será perdido."
        confirmLabel="Sair sem salvar"
        destructive
        onConfirm={() => {
          setConfirmarSaida(false);
          fecharModal();
        }}
        onCancel={() => setConfirmarSaida(false)}
      />

      <CategoriasModal open={categoriasAberto} onClose={() => setCategoriasAberto(false)} />

      <ConfirmDialog
        open={confirmarExclusao !== null}
        title="Excluir tarefa?"
        message={`A tarefa "${confirmarExclusao?.nome ?? ""}" será removida. Não pode ser desfeito.`}
        confirmLabel="Excluir"
        destructive
        loading={excluindo}
        onConfirm={() => void confirmarExcluir()}
        onCancel={() => setConfirmarExclusao(null)}
      />

      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}

function ModoSwitcher({ value, onChange }: { value: Modo; onChange: (m: Modo) => void }) {
  const opts: { id: Modo; label: string }[] = [
    { id: "lista", label: "Lista" },
    { id: "quadro", label: "Quadro" },
    { id: "semana", label: "Semana" },
  ];
  return (
    <div
      className="relative inline-flex p-[3px] rounded-pill border border-border-hi"
      style={{ background: "rgba(255,255,255,0.04)" }}
    >
      {opts.map((o) => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={`relative px-4 py-1.5 rounded-pill font-mono text-xs uppercase tracking-[1px] transition-colors ${
              active ? "text-white" : "text-muted hover:text-text"
            }`}
          >
            {active && (
              <motion.span
                layoutId="modo-indicator"
                aria-hidden
                className="absolute inset-0 rounded-pill"
                style={{
                  background: "var(--liriun-grad-brand)",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.18), 0 4px 12px rgba(91,141,239,0.28)",
                }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.45 }}
              />
            )}
            <span className="relative z-10">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function FiltroDropdown({
  aberto,
  setAberto,
  filtroAtivo,
  modo,
  onChange,
}: {
  aberto: boolean;
  setAberto: (b: boolean) => void;
  filtroAtivo: { id: Filtro; label: string };
  modo: Modo;
  onChange: (f: Filtro) => void;
}) {
  const groups = gruposParaModo(modo);
  const filtroPadrao = filtroDefaultParaModo(modo);
  const ativo = filtroAtivo.id !== filtroPadrao;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setAberto(!aberto)}
        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-pill text-sm font-medium transition-all duration-base ${
          ativo
            ? "text-white"
            : "text-text border border-border-hi hover:bg-white/[0.06]"
        }`}
        style={
          ativo
            ? {
                background: "var(--liriun-grad-brand)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.18), 0 4px 12px rgba(91,141,239,0.28)",
              }
            : { background: "rgba(255,255,255,0.04)" }
        }
      >
        <FilterIcon />
        <span>{filtroAtivo.label}</span>
        <ChevronDown />
      </button>

      {aberto && (
        <>
          {/* Backdrop — mobile cobre tela, desktop transparente (popover) */}
          <div
            className="fixed inset-0 z-40 md:z-30 md:bg-transparent animate-fade-in"
            style={{ background: "rgba(8,10,14,0.55)", backdropFilter: "blur(3px)" }}
            onClick={() => setAberto(false)}
          />

          <div
            className="z-50 md:z-40 overflow-hidden flex flex-col
              fixed inset-x-0 bottom-0 max-h-[78vh] rounded-t-[28px] animate-slide-up
              md:absolute md:inset-x-auto md:left-auto md:right-0 md:bottom-auto md:top-full md:mt-2 md:max-h-none md:w-[272px] md:rounded-[20px] md:animate-scale-in"
            style={{
              background:
                "linear-gradient(180deg, rgba(28,30,38,0.96) 0%, rgba(18,20,26,0.96) 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow:
                "0 -24px 60px rgba(0,0,0,0.55), 0 24px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)",
              backdropFilter: "blur(24px)",
            }}
          >
            {/* Glow sutil topo (gradient brand) */}
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(156,123,255,0.5) 30%, rgba(91,141,239,0.5) 70%, transparent 100%)",
              }}
            />

            {/* Header mobile: drag handle + título + close */}
            <div className="md:hidden">
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-pill" style={{ background: "rgba(255,255,255,0.20)" }} />
              </div>
              <div className="flex items-center justify-between px-6 pt-2 pb-3">
                <h3 className="text-base font-semibold tracking-[-0.2px]">Filtrar</h3>
                <button
                  type="button"
                  onClick={() => setAberto(false)}
                  aria-label="Fechar"
                  className="w-8 h-8 rounded-pill grid place-items-center text-muted hover:text-text hover:bg-white/[0.08] transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Conteúdo scrollável */}
            <div className="flex-1 overflow-y-auto pt-2 pb-[max(20px,env(safe-area-inset-bottom))] md:pt-3 md:pb-3">
              {groups.map((g, idx) => (
                <div key={g} className={idx > 0 ? "mt-5 md:mt-4" : ""}>
                  <div
                    className="px-6 md:px-5 font-mono text-[9px] font-semibold uppercase tracking-[2px] mb-2"
                    style={{ color: "var(--liriun-violet-300)" }}
                  >
                    {g}
                  </div>
                  <div className="px-3 md:px-2 flex flex-col gap-0.5">
                    {FILTROS.filter((f) => f.group === g).map((f) => {
                      const active = filtroAtivo.id === f.id;
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => onChange(f.id)}
                          className={`group relative w-full text-left px-3.5 py-2.5 md:py-2 rounded-xl text-sm transition-all duration-base flex items-center gap-3 ${
                            active
                              ? "text-text font-medium"
                              : "text-muted hover:text-text hover:bg-white/[0.04]"
                          }`}
                          style={
                            active
                              ? {
                                  background:
                                    "linear-gradient(90deg, rgba(156,123,255,0.18) 0%, rgba(91,141,239,0.10) 60%, transparent 100%)",
                                }
                              : undefined
                          }
                        >
                          {active && (
                            <span
                              aria-hidden
                              className="absolute left-1 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-pill"
                              style={{
                                background: "var(--liriun-grad-brand)",
                                boxShadow: "0 0 8px rgba(156,123,255,0.6)",
                              }}
                            />
                          )}
                          <span className="flex-1">{f.label}</span>
                          {active && (
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="var(--liriun-violet-300)"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="shrink-0"
                            >
                              <path d="M5 12.5l4.5 4.5L19 7" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Limpar filtro — só aparece quando não está no default do modo */}
            {ativo && (
              <div
                className="shrink-0 px-3 md:px-2 py-2"
                style={{
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                  background: "rgba(0,0,0,0.20)",
                }}
              >
                <button
                  type="button"
                  onClick={() => onChange(filtroPadrao)}
                  className="w-full text-left px-3.5 py-2.5 md:py-2 rounded-xl text-sm font-medium text-muted hover:text-text hover:bg-white/[0.04] transition-colors flex items-center gap-2.5"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0"
                  >
                    <path d="M19 7L5 7M10 11v6M14 11v6M5 7l1.5 13a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2L19 7M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
                  </svg>
                  Limpar filtro
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Coleções view: agrupa por categoria + smart lists (prioritárias, hoje, sem categoria).
 * Espelha tela 3.1 do app v2 (CLAUDE_CODE_WEBAPP.md §5).
 */
function Loading() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3, 4].map((i) => (
        <ShimmerBox key={`s-${i}`} height={64} rounded="rounded-lg" />
      ))}
    </div>
  );
}

function LoadingOld() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-16 rounded-lg animate-pulse"
          style={{ background: "rgba(255,255,255,0.025)" }}
        />
      ))}
    </div>
  );
}

type ViewProps = {
  tarefas: Tarefa[];
  onToggle: (t: Tarefa) => void;
  onEdit: (t: Tarefa) => void;
  onDelete: (t: Tarefa) => void;
};

function ListaView({
  tarefas,
  filtro,
  onToggle,
  onEdit,
  onDelete,
}: ViewProps & { filtro: Filtro }) {
  if (tarefas.length === 0) return <EmptyState />;

  // Agrupamento desligado para filtros específicos (mostra só uma seção)
  const agrupar = filtro === "pendentes" || filtro === "todas";

  if (!agrupar) {
    return (
      <div className="flex flex-col">
        <AnimatePresence initial={false}>
          {tarefas.map((t) => (
            <RowSaida key={t.id}>
              <TarefaRow
                tarefa={t}
                onToggle={() => onToggle(t)}
                onEdit={() => onEdit(t)}
                onDelete={() => onDelete(t)}
              />
            </RowSaida>
          ))}
        </AnimatePresence>
      </div>
    );
  }

  const grupos = agruparPorPrazo(tarefas);

  return (
    <div className="flex flex-col gap-8">
      {grupos.map(({ label, items }) => (
        <section key={label}>
          <SectionHeader label={label} count={items.length} />
          <div className="flex flex-col">
            <AnimatePresence initial={false}>
              {items.map((t) => (
                <RowSaida key={t.id}>
                  <TarefaRow
                    tarefa={t}
                    onToggle={() => onToggle(t)}
                    onEdit={() => onEdit(t)}
                    onDelete={() => onDelete(t)}
                  />
                </RowSaida>
              ))}
            </AnimatePresence>
          </div>
        </section>
      ))}
    </div>
  );
}

/** Wrapper que anima a saída da linha (fade + colapso) quando ela some da lista. */
function RowSaida({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, height: 0, marginTop: 0, overflow: "hidden" }}
      transition={{ duration: 0.26, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

function QuadroView({
  tarefas,
  filtro,
  busca,
  onToggle,
  onEdit,
  onDelete,
}: ViewProps & { filtro: Filtro; busca: string }) {
  const cols: {
    status: StatusTarefa;
    label: string;
    accent: string;
    bg: string;
    border: string;
  }[] = [
    {
      status: 1,
      label: "Pendentes",
      accent: "#B79CFF",
      bg: "rgba(156,123,255,0.06)",
      border: "rgba(156,123,255,0.32)",
    },
    {
      status: 3,
      label: "Atrasadas",
      accent: "#F0B36E",
      bg: "rgba(240,179,110,0.06)",
      border: "rgba(240,179,110,0.32)",
    },
    {
      status: 2,
      label: "Concluídas",
      accent: "#7BD7B0",
      bg: "rgba(123,215,176,0.06)",
      border: "rgba(123,215,176,0.32)",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cols.map((col) => {
        const items = tarefas.filter((t) => {
          if (t.status !== col.status) return false;
          if (busca && !t.nome.toLowerCase().includes(busca.toLowerCase())) return false;
          if (filtro === "urgente" && t.prioridade !== 1) return false;
          if (filtro === "importante" && t.prioridade !== 2) return false;
          if (filtro === "normal" && t.prioridade !== 3) return false;
          if (filtro === "baixa" && t.prioridade !== 4) return false;
          return true;
        });
        return (
          <div
            key={col.label}
            className="rounded-2xl p-4 min-h-[260px] flex flex-col"
            style={{
              background: col.bg,
              border: `1px solid ${col.border}`,
            }}
          >
            <div className="flex items-center justify-between mb-3 pb-3" style={{ borderBottom: `1px solid ${col.border}` }}>
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-pill"
                  style={{ background: col.accent, boxShadow: `0 0 8px ${col.accent}77` }}
                  aria-hidden
                />
                <span
                  className="font-mono text-xs uppercase tracking-[1.4px] font-semibold"
                  style={{ color: col.accent }}
                >
                  {col.label}
                </span>
              </div>
              <span
                className="font-mono text-xs font-medium px-2 py-0.5 rounded-pill"
                style={{
                  color: col.accent,
                  background: col.bg,
                  border: `1px solid ${col.border}`,
                }}
              >
                {items.length.toString().padStart(2, "0")}
              </span>
            </div>
            {items.length === 0 ? (
              <p className="text-sm text-faint italic">Vazio</p>
            ) : (
              <div className="flex flex-col">
                {items.map((t) => (
                  <TarefaRow
                    key={t.id}
                    tarefa={t}
                    onToggle={() => onToggle(t)}
                    onEdit={() => onEdit(t)}
                    onDelete={() => onDelete(t)}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SemanaView({
  tarefas,
  onEdit,
}: {
  tarefas: Tarefa[];
  onEdit: (t: Tarefa) => void;
}) {
  const dias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

  const inicio = new Date();
  const dow = inicio.getDay();
  const offsetParaSegunda = (dow + 6) % 7;
  inicio.setDate(inicio.getDate() - offsetParaSegunda);
  inicio.setHours(0, 0, 0, 0);

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
      {dias.map((label, i) => {
        const dia = new Date(inicio);
        dia.setDate(dia.getDate() + i);
        const items = tarefas.filter((t) => {
          const d = paraDataLocal(t.dataPrazo);
          return (
            d.getFullYear() === dia.getFullYear() &&
            d.getMonth() === dia.getMonth() &&
            d.getDate() === dia.getDate()
          );
        });

        const ehHojeDia = dia.getTime() === hoje.getTime();
        const ehPassado = dia.getTime() < hoje.getTime();
        const ehFimDeSemana = i >= 5;

        return (
          <div
            key={label}
            className="rounded-2xl p-3 min-h-[180px] flex flex-col transition-colors"
            style={{
              background: ehHojeDia
                ? "rgba(156,123,255,0.10)"
                : ehPassado
                  ? "rgba(255,255,255,0.015)"
                  : ehFimDeSemana
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(255,255,255,0.025)",
              border: ehHojeDia
                ? "1px solid rgba(156,123,255,0.45)"
                : "1px solid var(--liriun-border-hi)",
              boxShadow: ehHojeDia
                ? "inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 22px rgba(91,141,239,0.15)"
                : undefined,
              opacity: ehPassado ? 0.62 : 1,
            }}
          >
            <div className="flex items-baseline justify-between mb-2">
              <span
                className="font-mono text-xs uppercase tracking-[1.2px] font-medium"
                style={{
                  color: ehHojeDia ? "var(--liriun-violet-300)" : "var(--liriun-text-faint)",
                }}
              >
                {label}
                {ehHojeDia && <span className="ml-1 normal-case tracking-normal">· hoje</span>}
              </span>
              <span
                className="text-base font-semibold"
                style={{
                  color: ehHojeDia ? "var(--liriun-text)" : "var(--liriun-text-muted)",
                }}
              >
                {dia.getDate()}
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              {items.length === 0 ? (
                <span className="text-[11px] text-dim italic">—</span>
              ) : (
                items.map((t) => {
                  const concluida = t.status === 2;
                  const atrasada = t.status === 3;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => onEdit(t)}
                      className="text-left text-xs p-2 rounded-md border transition-colors"
                      style={{
                        background: concluida
                          ? "rgba(123,215,176,0.06)"
                          : atrasada
                            ? "rgba(240,179,110,0.06)"
                            : "rgba(255,255,255,0.04)",
                        borderColor: concluida
                          ? "rgba(123,215,176,0.25)"
                          : atrasada
                            ? "rgba(240,179,110,0.25)"
                            : "var(--liriun-border)",
                      }}
                    >
                      <div
                        className="font-medium truncate"
                        style={{
                          color: concluida ? "var(--liriun-text-faint)" : "var(--liriun-text)",
                          textDecoration: concluida ? "line-through" : "none",
                        }}
                      >
                        {t.nome}
                      </div>
                      {t.horarioFinal && (
                        <div className="font-mono text-[10px] text-faint mt-0.5">
                          {t.horarioFinal.slice(0, 5)}
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
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

function EmptyState() {
  return (
    <div
      className="rounded-2xl border border-border-hi p-12 text-center"
      style={{ background: "rgba(255,255,255,0.025)" }}
    >
      <div className="text-base text-muted">Nada por aqui.</div>
      <div className="text-sm text-faint mt-2">
        Crie tarefas pelo botão acima ou via voz na aba Falar.
      </div>
    </div>
  );
}

function ordenarPorData(a: Tarefa, b: Tarefa): number {
  // Concluídas vão pro fim
  if (a.status === 2 && b.status !== 2) return 1;
  if (b.status === 2 && a.status !== 2) return -1;

  const da = paraDataLocal(a.dataPrazo).getTime();
  const db = paraDataLocal(b.dataPrazo).getTime();
  if (da !== db) return da - db;

  // Mesmo dia: horário
  const ha = parseHora(a.horarioFinal);
  const hb = parseHora(b.horarioFinal);
  if (ha !== hb) return ha - hb;

  // Mesmo prazo: prioridade (1 mais alta)
  return a.prioridade - b.prioridade;
}

function parseHora(h: string | null): number {
  if (!h) return Number.MAX_SAFE_INTEGER;
  const [hh, mm] = h.split(":").map(Number);
  return hh * 60 + (mm || 0);
}

function agruparPorPrazo(tarefas: Tarefa[]): { label: string; items: Tarefa[] }[] {
  const atrasadas = tarefas.filter((t) => t.status === 3);
  const hoje = tarefas.filter((t) => t.status === 1 && ehHoje(t.dataPrazo));
  const amanha = tarefas.filter((t) => t.status === 1 && ehAmanha(t.dataPrazo));
  const proximas = tarefas.filter(
    (t) => t.status === 1 && !ehHoje(t.dataPrazo) && !ehAmanha(t.dataPrazo),
  );
  const concluidas = tarefas.filter((t) => t.status === 2);

  return [
    { label: "Atrasadas", items: atrasadas },
    { label: "Hoje", items: hoje },
    { label: "Amanhã", items: amanha },
    { label: "Próximas", items: proximas },
    { label: "Concluídas", items: concluidas },
  ].filter((g) => g.items.length > 0);
}

function FilterIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 5h18M6 12h12M10 19h4" />
    </svg>
  );
}
function ChevronDown() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
