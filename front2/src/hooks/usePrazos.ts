import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { prazosApi } from "@/api/prazos";
import type { Prazo } from "@/api/types";

const KEY = ["prazos"] as const;

export function usePrazos() {
  return useQuery({
    queryKey: KEY,
    queryFn: prazosApi.listar,
  });
}

export function useCriarPrazo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ nome, duracaoDias }: { nome: string; duracaoDias: number | null }) =>
      prazosApi.criar(nome, duracaoDias),
    onSuccess: (novo) => {
      qc.setQueryData<Prazo[]>(KEY, (prev) => (prev ? [...prev, novo] : [novo]));
    },
  });
}

export function useAtualizarPrazo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      nome,
      duracaoDias,
    }: {
      id: string;
      nome: string;
      duracaoDias: number | null;
    }) => prazosApi.atualizar(id, nome, duracaoDias),
    onSuccess: (atualizado) => {
      qc.setQueryData<Prazo[]>(KEY, (prev) =>
        prev?.map((p) => (p.id === atualizado.id ? atualizado : p)),
      );
    },
  });
}

export function useRemoverPrazo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => prazosApi.remover(id),
    onSuccess: (_, id) => {
      qc.setQueryData<Prazo[]>(KEY, (prev) => prev?.filter((p) => p.id !== id));
    },
  });
}
