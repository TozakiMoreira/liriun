import { api } from "./client";

export type Prioridade = 1 | 2 | 3 | 4;
export type StatusTarefa = 1 | 2 | 3;
export type TipoRecorrencia = 0 | 1 | 2;

export type Categoria = {
  id: string;
  nome: string;
  criadaEm: string;
};

export type TarefaCategoria = {
  id: string;
  nome: string;
};

/** Espelha `TarefaViewModel` do .NET. */
export type Tarefa = {
  id: string;
  nome: string;
  prioridade: Prioridade;
  status: StatusTarefa;
  dataPrazo: string;             // ISO date-time
  horarioFinal: string | null;   // "HH:mm:ss" ou null
  observacoes: string | null;
  recorrencia: TipoRecorrencia;
  recorrenciaQuantidade: number;
  criadaEm: string;
  concluidaEm: string | null;
  categorias: TarefaCategoria[];
};

export type CriarTarefaInput = {
  nome: string;
  prioridade: Prioridade;
  dataPrazo: string;             // ISO YYYY-MM-DDTHH:mm:ss ou só YYYY-MM-DD
  categoriaIds?: string[];
  horarioFinal?: string | null;  // "HH:mm:ss"
  observacoes?: string | null;
  recorrencia?: TipoRecorrencia;
  recorrenciaQuantidade?: number;
};

export const tarefasApi = {
  listarPendentes: () => api<Tarefa[]>("/tarefas/pendentes"),
  listarConcluidas: (de?: string, ate?: string) => {
    const qs = new URLSearchParams();
    if (de) qs.set("de", de);
    if (ate) qs.set("ate", ate);
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return api<Tarefa[]>(`/tarefas/concluidas${suffix}`);
  },
  criar: (input: CriarTarefaInput) =>
    api<Tarefa>("/tarefas", { method: "POST", body: input }),
  atualizar: (id: string, input: CriarTarefaInput) =>
    api<Tarefa>(`/tarefas/${id}`, { method: "PUT", body: input }),
  concluir: (id: string) =>
    api<Tarefa>(`/tarefas/${id}/concluir`, { method: "POST" }),
  reabrir: (id: string) =>
    api<Tarefa>(`/tarefas/${id}/reabrir`, { method: "POST" }),
  excluir: (id: string) =>
    api<void>(`/tarefas/${id}`, { method: "DELETE" }),
};

export const categoriasApi = {
  listar: () => api<Categoria[]>("/categorias"),
  criar: (nome: string) => api<Categoria>("/categorias", { method: "POST", body: { nome } }),
  renomear: (id: string, nome: string) =>
    api<Categoria>(`/categorias/${id}`, { method: "PUT", body: { nome } }),
  excluir: (id: string) => api<void>(`/categorias/${id}`, { method: "DELETE" }),
};

// ─── helpers de mapeamento ─────────────────────────────────────────

export const PRIORIDADE_LABEL: Record<Prioridade, string> = {
  1: "Urgente",
  2: "Importante",
  3: "Normal",
  4: "Baixa",
};

export const STATUS_LABEL: Record<StatusTarefa, string> = {
  1: "Pendente",
  2: "Concluída",
  3: "Atrasada",
};

export const RECORRENCIA_LABEL: Record<TipoRecorrencia, string> = {
  0: "Nenhuma",
  1: "Semanal",
  2: "Mensal",
};
