"use client";

import { useEffect, useState, type FormEvent } from "react";

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
  /** Quando presente e editando uma tarefa não concluída, mostra botão "Concluir". */
  onConcluir?: () => void;
};

const PRIORIDADES: Prioridade[] = [1, 2, 3, 4];
const RECORRENCIAS: TipoRecorrencia[] = [0, 1, 2];

export function TarefaForm({ tarefa, onSubmit, onCancel, onConcluir }: TarefaFormProps) {
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

  useEffect(() => {
    if (recorrencia === 0 && recorrenciaQuantidade !== 1) {
      setRecorrenciaQuantidade(1);
    }
  }, [recorrencia, recorrenciaQuantidade]);

  function toggleCategoria(id: string) {
    setCategoriaIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (nome.trim().length === 0) {
      setErro("Nome é obrigatório.");
      return;
    }
    if (!dataPrazo) {
      setErro("Prazo é obrigatório.");
      return;
    }
    setSubmitting(true);
    setErro(null);
    try {
      await onSubmit({
        nome: nome.trim(),
        prioridade,
        dataPrazo: `${dataPrazo}T00:00:00`,
        categoriaIds,
        horarioFinal: horarioFinal ? `${horarioFinal}:00` : null,
        observacoes: observacoes.trim() || null,
        recorrencia,
        recorrenciaQuantidade,
      });
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar tarefa");
    } finally {
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
              onClick={onConcluir}
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
