import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { tarefasApi } from "@/api/tarefas";
import type { CriarTarefaPayload, Tarefa } from "@/api/types";

const KEY_PEND = ["tarefas", "pendentes"] as const;
const KEY_CONC = ["tarefas", "concluidas"] as const;

export function useTarefasPendentes() {
  return useQuery({
    queryKey: KEY_PEND,
    queryFn: tarefasApi.listarPendentes,
  });
}

export function useTarefasConcluidas(de?: string, ate?: string) {
  return useQuery({
    queryKey: [...KEY_CONC, de, ate] as const,
    queryFn: () => tarefasApi.listarConcluidas(de, ate),
  });
}

export function useCriarTarefa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CriarTarefaPayload) => tarefasApi.criar(payload),
    onSuccess: (nova) => {
      qc.setQueryData<Tarefa[]>(KEY_PEND, (prev) =>
        prev ? [nova, ...prev] : [nova],
      );
    },
  });
}

export function useAtualizarTarefa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CriarTarefaPayload }) =>
      tarefasApi.atualizar(id, payload),
    onSuccess: (atualizada) => {
      qc.setQueryData<Tarefa[]>(KEY_PEND, (prev) =>
        prev?.map((t) => (t.id === atualizada.id ? atualizada : t)),
      );
    },
  });
}

export function useConcluirTarefa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tarefasApi.concluir(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: KEY_PEND });
      const anterior = qc.getQueryData<Tarefa[]>(KEY_PEND);
      qc.setQueryData<Tarefa[]>(KEY_PEND, (prev) =>
        prev?.filter((t) => t.id !== id),
      );
      return { anterior };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.anterior) qc.setQueryData(KEY_PEND, ctx.anterior);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: KEY_CONC });
    },
  });
}

export function useRemoverTarefa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tarefasApi.remover(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: KEY_PEND });
      const anterior = qc.getQueryData<Tarefa[]>(KEY_PEND);
      qc.setQueryData<Tarefa[]>(KEY_PEND, (prev) =>
        prev?.filter((t) => t.id !== id),
      );
      return { anterior };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.anterior) qc.setQueryData(KEY_PEND, ctx.anterior);
    },
  });
}
