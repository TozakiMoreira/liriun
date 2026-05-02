import { api } from "./client";
import type { Prazo } from "./types";

export const prazosApi = {
  listar: () => api.get<Prazo[]>("/prazos"),
  criar: (nome: string, duracaoDias: number | null) =>
    api.post<Prazo>("/prazos", { nome, duracaoDias }),
  atualizar: (id: string, nome: string, duracaoDias: number | null) =>
    api.put<Prazo>(`/prazos/${id}`, { nome, duracaoDias }),
  remover: (id: string) => api.delete(`/prazos/${id}`),
};
