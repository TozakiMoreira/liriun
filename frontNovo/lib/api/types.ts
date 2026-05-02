export type Prioridade = 1 | 2 | 3 | 4;
export const Prioridade = {
  Urgente: 1 as const,
  Importante: 2 as const,
  Normal: 3 as const,
  Baixa: 4 as const,
};

export type StatusTarefa = 1 | 2 | 3;
export const StatusTarefa = {
  Pendente: 1 as const,
  Concluida: 2 as const,
  Atrasada: 3 as const,
};

export interface TarefaCategoriaRef {
  id: string;
  nome: string;
}

export interface Tarefa {
  id: string;
  nome: string;
  prioridade: Prioridade;
  status: StatusTarefa;
  prazoId: string | null;
  dataPrazo: string | null;
  horarioFinal: string;
  criadaEm: string;
  concluidaEm: string | null;
  categorias: TarefaCategoriaRef[];
}

export interface CriarTarefaPayload {
  nome: string;
  prioridade: Prioridade;
  categoriaIds?: string[];
  prazoId?: string | null;
  dataPrazoCustom?: string | null;
  horarioFinal?: string | null;
}

export interface Categoria {
  id: string;
  nome: string;
  criadaEm: string;
}

export interface Prazo {
  id: string;
  nome: string;
  duracaoDias: number | null;
  criadoEm: string;
}

export interface AutenticacaoResposta {
  usuarioId: string;
  nome: string;
  email: string;
  token: string;
  expiraEm: string;
}

export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  errors?: Record<string, string[]>;
  traceId?: string;
}
