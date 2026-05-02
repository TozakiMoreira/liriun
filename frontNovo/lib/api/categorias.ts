import { api } from "./client";
import type { Categoria } from "./types";

export const categoriasApi = {
  listar: () => api.get<Categoria[]>("/categorias"),
  criar: (nome: string) => api.post<Categoria>("/categorias", { nome }),
  atualizar: (id: string, nome: string) =>
    api.put<Categoria>(`/categorias/${id}`, { nome }),
  remover: (id: string) => api.delete(`/categorias/${id}`),
};
