import { api } from "./client";
import type { CriarTarefaPayload, Tarefa } from "./types";

export const tarefasApi = {
  listarPendentes: () => api.get<Tarefa[]>("/tarefas/pendentes"),

  listarConcluidas: (de?: string, ate?: string) =>
    api.get<Tarefa[]>("/tarefas/concluidas", { de, ate }),

  criar: (payload: CriarTarefaPayload) => api.post<Tarefa>("/tarefas", payload),

  atualizar: (id: string, payload: CriarTarefaPayload) =>
    api.put<Tarefa>(`/tarefas/${id}`, payload),

  concluir: (id: string) => api.post<Tarefa>(`/tarefas/${id}/concluir`, {}),

  remover: (id: string) => api.delete(`/tarefas/${id}`),
};
