import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { categoriasApi } from "@/lib/api/categorias";
import type { Categoria } from "@/lib/api/types";

const KEY = ["categorias"] as const;

export function useCategorias() {
  return useQuery({ queryKey: KEY, queryFn: categoriasApi.listar });
}

export function useCriarCategoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (nome: string) => categoriasApi.criar(nome),
    onSuccess: (nova) => {
      qc.setQueryData<Categoria[]>(KEY, (prev) =>
        prev
          ? [...prev, nova].sort((a, b) => a.nome.localeCompare(b.nome))
          : [nova],
      );
    },
  });
}

export function useAtualizarCategoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, nome }: { id: string; nome: string }) =>
      categoriasApi.atualizar(id, nome),
    onSuccess: (atualizada) => {
      qc.setQueryData<Categoria[]>(KEY, (prev) =>
        prev?.map((c) => (c.id === atualizada.id ? atualizada : c)),
      );
    },
  });
}

export function useRemoverCategoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoriasApi.remover(id),
    onSuccess: (_, id) => {
      qc.setQueryData<Categoria[]>(KEY, (prev) =>
        prev?.filter((c) => c.id !== id),
      );
    },
  });
}
