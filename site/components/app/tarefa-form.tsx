"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/app/date-picker";
import { TimePicker } from "@/components/app/time-picker";
import {
  PRIORIDADE_LABEL,
  RECORRENCIA_LABEL,
  type CriarTarefaInput,
  type Prioridade,
  type Tarefa,
  type TipoRecorrencia,
} from "@/lib/api/tarefas";
import { useCategorias } from "@/lib/api/hooks/use-categorias";
import { hojeIso, paraDataLocal } from "@/lib/datetime";

type TarefaFormProps = {
  tarefa?: Tarefa;
  onSubmit: (input: CriarTarefaInput) => Promise<void>;
  onCancel: () => void;
  /**
   * Quando presente e editando uma tarefa não concluída, mostra botão "Concluir".
   * Recebe o input atual (com o tempo cronometrado) pra persistir antes de concluir.
   */
  onConcluir?: (input?: CriarTarefaInput) => void | Promise<void>;
  /** Mostra o cronômetro (só faz sentido editando uma tarefa existente). */
  mostrarCronometro?: boolean;
  /** Avisa o pai quando há tempo cronometrado não salvo (pra confirmar perda ao fechar). */
  onDirtyChange?: (dirty: boolean) => void;
};

const PRIORIDADES: Prioridade[] = [1, 2, 3, 4];
const RECORRENCIAS: TipoRecorrencia[] = [0, 1, 2];

export function TarefaForm({
  tarefa,
  onSubmit,
  onCancel,
  onConcluir,
  mostrarCronometro = false,
  onDirtyChange,
}: TarefaFormProps) {
  const editando = !!tarefa;
  const concluida = tarefa?.status === 2;
  const { categorias } = useCategorias();

  const [nome, setNome] = useState(tarefa?.nome ?? "");
  const [dataPrazo, setDataPrazo] = useState(() => {
    if (!tarefa) return hojeIso();
    const d = paraDataLocal(tarefa.dataPrazo);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  });
  const [horarioFinal, setHorarioFinal] = useState(tarefa?.horarioFinal?.slice(0, 5) ?? "");
  const [prioridade, setPrioridade] = useState<Prioridade>(tarefa?.prioridade ?? 3);
  const [observacoes, setObservacoes] = useState(tarefa?.observacoes ?? "");
  const [recorrencia, setRecorrencia] = useState<TipoRecorrencia>(tarefa?.recorrencia ?? 0);
  const [recorrenciaQuantidade, setRecorrenciaQuantidade] = useState(
    tarefa?.recorrenciaQuantidade ?? 1,
  );
  const [categoriaIds, setCategoriaIds] = useState<string[]>(
    tarefa?.categorias.map((c) => c.id) ?? [],
  );
  const [submitting, setSubmitting] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // ─── Cronômetro (Clockify-like) ──────────────────────────────────
  const cronometroAtivo = mostrarCronometro && editando && !concluida;
  const tempoInicial = tarefa?.tempoGastoSegundos ?? 0;
  const [tempoBase, setTempoBase] = useState(tempoInicial); // segundos já acumulados (pausados)
  const [rodando, setRodando] = useState(false);
  const inicioRef = useRef<number | null>(null); // epoch ms de quando começou a correr
  const [, setTick] = useState(0); // força re-render a cada segundo enquanto roda

  function sessaoCorrente(): number {
    if (!rodando || inicioRef.current == null) return 0;
    return Math.floor((Date.now() - inicioRef.current) / 1000);
  }
  const tempoTotal = tempoBase + sessaoCorrente();

  function iniciarCron() {
    inicioRef.current = Date.now();
    setRodando(true);
  }
  function pausarCron() {
    // Captura o elapsed AGORA (rodando/inicioRef ainda válidos). O updater de
    // setState roda na fase de render — se lesse inicioRef depois de limpar, daria 0.
    const elapsed = sessaoCorrente();
    inicioRef.current = null;
    setRodando(false);
    setTempoBase((b) => b + elapsed);
  }

  useEffect(() => {
    if (!rodando) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [rodando]);

  // "Sujo" = usou o cronômetro e ainda não salvou → pai confirma perda ao fechar.
  const tempoDirty = cronometroAtivo && (rodando || tempoBase !== tempoInicial);
  useEffect(() => {
    onDirtyChange?.(tempoDirty);
  }, [tempoDirty, onDirtyChange]);

  useEffect(() => {
    if (recorrencia === 0 && recorrenciaQuantidade !== 1) {
      setRecorrenciaQuantidade(1);
    }
  }, [recorrencia, recorrenciaQuantidade]);

  function toggleCategoria(id: string) {
    setCategoriaIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  }

  function validar(): boolean {
    if (nome.trim().length === 0) {
      setErro("Nome é obrigatório.");
      return false;
    }
    if (!dataPrazo) {
      setErro("Prazo é obrigatório.");
      return false;
    }
    return true;
  }

  function montarInput(): CriarTarefaInput {
    return {
      nome: nome.trim(),
      prioridade,
      dataPrazo: `${dataPrazo}T00:00:00`,
      categoriaIds,
      horarioFinal: horarioFinal ? `${horarioFinal}:00` : null,
      observacoes: observacoes.trim() || null,
      recorrencia,
      recorrenciaQuantidade,
      // Sempre envia o tempo: preserva o existente mesmo sem cronômetro na tela.
      tempoGastoSegundos: tempoBase + sessaoCorrente(),
    };
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validar()) return;
    setSubmitting(true);
    setErro(null);
    try {
      await onSubmit(montarInput());
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar tarefa");
    } finally {
      setSubmitting(false);
    }
  }

  // Concluir persiste o tempo + edições antes de marcar como concluída.
  async function handleConcluir() {
    if (!onConcluir) return;
    if (!validar()) return;
    setSubmitting(true);
    setErro(null);
    try {
      await onConcluir(montarInput());
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao concluir tarefa");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Nome */}
      <div>
        <Label htmlFor="t-nome">Tarefa</Label>
        <input
          id="t-nome"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: Reunião com a equipe de design"
          className={inputCls}
        />
      </div>

      {/* Cronômetro */}
      {cronometroAtivo && (
        <div>
          <Label>Tempo</Label>
          <div
            className="flex items-center gap-3 rounded-md px-3 py-2.5 border"
            style={{
              borderColor: rodando ? "rgba(156,123,255,0.45)" : "var(--liriun-border-hi)",
              background: rodando ? "rgba(156,123,255,0.08)" : "rgba(255,255,255,0.03)",
            }}
          >
            <button
              type="button"
              onClick={rodando ? pausarCron : iniciarCron}
              aria-label={rodando ? "Pausar" : "Iniciar"}
              className="w-9 h-9 rounded-full grid place-items-center shrink-0 transition-colors"
              style={{
                background: rodando ? "rgba(156,123,255,0.20)" : "rgba(123,215,176,0.16)",
                color: rodando ? "#c4b5fd" : "#7bd7b0",
              }}
            >
              {rodando ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="5" width="4" height="14" rx="1" />
                  <rect x="14" y="5" width="4" height="14" rx="1" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 5.5v13a1 1 0 0 0 1.5.87l11-6.5a1 1 0 0 0 0-1.74l-11-6.5A1 1 0 0 0 7 5.5z" />
                </svg>
              )}
            </button>
            <span className="font-mono text-2xl tabular-nums tracking-tight text-text">
              {fmtHMS(tempoTotal)}
            </span>
            {rodando && (
              <span className="ml-auto flex items-center gap-1.5 text-xs text-muted">
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                contando
              </span>
            )}
          </div>
        </div>
      )}

      {/* Data + horário */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Prazo</Label>
          <DatePicker value={dataPrazo} onChange={setDataPrazo} placeholder="Selecionar data" />
        </div>
        <div>
          <Label>Horário</Label>
          <TimePicker value={horarioFinal} onChange={setHorarioFinal} placeholder="Sem hora" />
        </div>
      </div>

      {/* Prioridade */}
      <div>
        <Label>Prioridade</Label>
        <div className="flex flex-wrap gap-2 mt-1">
          {PRIORIDADES.map((p) => {
            const active = prioridade === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPrioridade(p)}
                className={`px-3 py-1.5 rounded-pill border text-sm font-medium transition-colors ${
                  active
                    ? "border-violet-500/40 text-text"
                    : "border-border-hi text-muted hover:text-text"
                }`}
                style={active ? { background: "rgba(156,123,255,0.12)" } : undefined}
              >
                {PRIORIDADE_LABEL[p]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Categorias */}
      {categorias.length > 0 && (
        <div>
          <Label>Categorias</Label>
          <div className="flex flex-wrap gap-2 mt-1">
            {categorias.map((c) => {
              const active = categoriaIds.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleCategoria(c.id)}
                  className={`px-3 py-1.5 rounded-pill border text-sm font-medium transition-colors ${
                    active
                      ? "border-violet-500/40 text-text"
                      : "border-border-hi text-muted hover:text-text"
                  }`}
                  style={active ? { background: "rgba(156,123,255,0.12)" } : undefined}
                >
                  {c.nome}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Recorrência */}
      <div>
        <Label>Recorrência</Label>
        <div className="flex gap-2 mt-1 items-center flex-wrap">
          {RECORRENCIAS.map((r) => {
            const active = recorrencia === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setRecorrencia(r)}
                className={`px-3 py-1.5 rounded-pill border text-sm font-medium transition-colors ${
                  active
                    ? "border-violet-500/40 text-text"
                    : "border-border-hi text-muted hover:text-text"
                }`}
                style={active ? { background: "rgba(156,123,255,0.12)" } : undefined}
              >
                {RECORRENCIA_LABEL[r]}
              </button>
            );
          })}
          {recorrencia !== 0 && (
            <div className="flex items-center gap-2 ml-2">
              <span className="text-sm text-muted">repetir</span>
              <select
                value={recorrenciaQuantidade}
                onChange={(e) => setRecorrenciaQuantidade(parseInt(e.target.value, 10))}
                className="bg-white/[0.05] border border-border-hi rounded-md px-2 py-1.5 text-sm text-text"
              >
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n} className="bg-surface">
                    {n}x
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Observações */}
      <div>
        <Label htmlFor="t-obs">Observações</Label>
        <textarea
          id="t-obs"
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          rows={3}
          maxLength={4000}
          placeholder="Notas, links, contexto extra…"
          className={inputCls + " resize-none"}
        />
      </div>

      {erro && <p className="text-sm text-danger">{erro}</p>}

      <div className="flex gap-3 items-center justify-between pt-2 border-t border-border">
        <div>
          {editando && !concluida && onConcluir && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleConcluir}
              disabled={submitting}
              className="text-success"
              style={{ borderColor: "rgba(123,215,176,0.40)", background: "rgba(123,215,176,0.08)" }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.5l4.5 4.5L19 7" />
              </svg>
              Concluir
            </Button>
          )}
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" loading={submitting}>
            {editando ? "Salvar" : "Criar tarefa"}
          </Button>
        </div>
      </div>
    </form>
  );
}

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block font-mono text-[11px] uppercase tracking-[1.4px] text-faint mb-2"
    >
      {children}
    </label>
  );
}

const inputCls =
  "w-full bg-white/[0.05] border border-border-hi rounded-md px-3 py-2.5 text-sm text-text placeholder:text-faint focus:outline-none focus:border-violet-500/60 transition-colors";

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function fmtHMS(totalSegundos: number): string {
  const s = Math.max(0, Math.floor(totalSegundos));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const seg = s % 60;
  return `${pad(h)}:${pad(m)}:${pad(seg)}`;
}
