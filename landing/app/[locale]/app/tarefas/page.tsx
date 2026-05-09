"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { AppPageHeader } from "@/components/app/page-header";
import { CategoriasModal } from "@/components/app/categorias-modal";
import { Modal } from "@/components/app/modal";
import { TarefaForm } from "@/components/app/tarefa-form";
import { TarefaRow } from "@/components/app/tarefa-row";
import { Button } from "@/components/ui/button";
import { useTarefas } from "@/lib/api/hooks/use-tarefas";
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
  | "hoje"
  | "amanha"
  | "proximas";

const FILTROS: { id: Filtro; label: string; group: string }[] = [
  { id: "pendentes", label: "Pendentes", group: "Status" },
  { id: "atrasadas", label: "Atrasadas", group: "Status" },
  { id: "concluidas", label: "Concluídas", group: "Status" },
  { id: "todas", label: "Todas", group: "Status" },
  { id: "hoje", label: "Hoje", group: "Período" },
  { id: "amanha", label: "Amanhã", group: "Período" },
  { id: "proximas", label: "Próximas", group: "Período" },
  { id: "urgente", label: "Urgentes", group: "Prioridade" },
  { id: "importante", label: "Importantes", group: "Prioridade" },
];

export default function TarefasPage() {
  const { pendentes, concluidas, loading, error, criar, atualizar, concluir, reabrir, excluir } =
    useTarefas();
  const searchParams = useSearchParams();

  const [modo, setModo] = useState<Modo>("lista");
  const [filtro, setFiltro] = useState<Filtro>("pendentes");
  const [busca, setBusca] = useState("");
  const [filtroAberto, setFiltroAberto] = useState(false);

  const [modalAberto, setModalAberto] = useState(false);
  const [tarefaEditando, setTarefaEditando] = useState<Tarefa | null>(null);
  const [categoriasAberto, setCategoriasAberto] = useState(false);

  // Auto-abrir modal "Nova" via querystring (?novo=1) — vindo do FAB mobile
  useEffect(() => {
    if (searchParams.get("novo") === "1") {
      setTarefaEditando(null);
      setModalAberto(true);
    }
  }, [searchParams]);

  const todas = useMemo(() => [...pendentes, ...concluidas], [pendentes, concluidas]);

  const filtradas = useMemo(() => {
    return todas
      .filter((t) => {
        if (filtro === "pendentes" && t.status !== 1) return false;
        if (filtro === "concluidas" && t.status !== 2) return false;
        if (filtro === "atrasadas" && t.status !== 3) return false;
        if (filtro === "urgente" && t.prioridade !== 1) return false;
        if (filtro === "importante" && t.prioridade !== 2) return false;
        if (filtro === "hoje" && !ehHoje(t.dataPrazo)) return false;
        if (filtro === "amanha" && !ehAmanha(t.dataPrazo)) return false;
        if (filtro === "proximas" && (ehHoje(t.dataPrazo) || ehAmanha(t.dataPrazo) || t.status === 2)) return false;
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

  async function handleSubmitForm(input: Parameters<typeof criar>[0]) {
    if (tarefaEditando) {
      await atualizar(tarefaEditando.id, input);
    } else {
      await criar(input);
    }
    setModalAberto(false);
  }

  async function handleToggle(t: Tarefa) {
    if (t.status === 2) {
      await reabrir(t.id);
    } else {
      await concluir(t.id);
    }
  }

  async function handleDelete(t: Tarefa) {
    if (confirm(`Excluir "${t.nome}"?`)) {
      await excluir(t.id);
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
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <ModoSwitcher value={modo} onChange={setModo} />
          <div className="flex gap-2 items-center">
            <FiltroDropdown
              aberto={filtroAberto}
              setAberto={setFiltroAberto}
              filtroAtivo={filtroAtivo}
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
              tarefas={filtradas}
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
        onClose={() => setModalAberto(false)}
        title={tarefaEditando ? "Editar tarefa" : "Nova tarefa"}
        size="md"
      >
        <TarefaForm
          tarefa={tarefaEditando ?? undefined}
          onSubmit={handleSubmitForm}
          onCancel={() => setModalAberto(false)}
        />
      </Modal>

      <CategoriasModal open={categoriasAberto} onClose={() => setCategoriasAberto(false)} />
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
      className="inline-flex p-[3px] rounded-pill border border-border-hi"
      style={{ background: "rgba(255,255,255,0.04)" }}
    >
      {opts.map((o) => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={`px-4 py-1.5 rounded-pill font-mono text-xs uppercase tracking-[1px] transition-colors ${
              active ? "text-white" : "text-muted hover:text-text"
            }`}
            style={
              active
                ? {
                    background: "var(--liriun-grad-brand)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18), 0 4px 12px rgba(91,141,239,0.28)",
                  }
                : undefined
            }
          >
            {o.label}
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
  onChange,
}: {
  aberto: boolean;
  setAberto: (b: boolean) => void;
  filtroAtivo: { id: Filtro; label: string };
  onChange: (f: Filtro) => void;
}) {
  const groups = ["Status", "Período", "Prioridade"] as const;
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setAberto(!aberto)}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border-hi text-sm font-medium text-text hover:bg-white/[0.04] transition-colors"
        style={{ background: "rgba(255,255,255,0.04)" }}
      >
        <FilterIcon />
        <span>{filtroAtivo.label}</span>
        <ChevronDown />
      </button>

      {aberto && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setAberto(false)} />
          <div
            className="absolute right-0 top-full mt-2 z-40 w-[240px] rounded-md overflow-hidden"
            style={{
              background: "rgba(20,22,28,0.96)",
              border: "1px solid var(--liriun-border-hi)",
              boxShadow: "0 16px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)",
              backdropFilter: "blur(20px)",
            }}
          >
            {groups.map((g, idx) => (
              <div
                key={g}
                style={idx > 0 ? { borderTop: "1px solid var(--liriun-border-hi)" } : undefined}
              >
                <div
                  className="px-3 pt-3 pb-2 font-mono text-[11px] font-semibold uppercase tracking-[1.6px]"
                  style={{
                    color: "var(--liriun-violet-300)",
                    background: "rgba(156,123,255,0.06)",
                  }}
                >
                  {g}
                </div>
                <div className="py-1">
                  {FILTROS.filter((f) => f.group === g).map((f) => {
                    const active = filtroAtivo.id === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => onChange(f.id)}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 ${
                          active
                            ? "bg-white/[0.06] text-text font-medium"
                            : "text-muted hover:text-text hover:bg-white/[0.03]"
                        }`}
                      >
                        {active ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--liriun-violet-300)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                            <path d="M5 12.5l4.5 4.5L19 7" />
                          </svg>
                        ) : (
                          <span className="w-3 shrink-0" aria-hidden />
                        )}
                        <span>{f.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Loading() {
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
        {tarefas.map((t) => (
          <TarefaRow
            key={t.id}
            tarefa={t}
            onToggle={() => onToggle(t)}
            onEdit={() => onEdit(t)}
            onDelete={() => onDelete(t)}
          />
        ))}
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
        </section>
      ))}
    </div>
  );
}

function QuadroView({ tarefas, onToggle, onEdit, onDelete }: ViewProps) {
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
        const items = tarefas.filter((t) => t.status === col.status);
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
