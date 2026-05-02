import { api } from "./client";
import type { AutenticacaoResposta } from "./types";

export const authApi = {
  login: (email: string, senha: string) =>
    api.post<AutenticacaoResposta>("/auth/login", { email, senha }),

  cadastrar: (nome: string, email: string, senha: string) =>
    api.post<AutenticacaoResposta>("/auth/cadastro", { nome, email, senha }),
};
