"use client";

import { useCallback, useEffect, useState } from "react";

import { tarefasApi, type CriarTarefaInput, type Tarefa } from "../tarefas";

type UseTarefasState = {
  pendentes: Tarefa[];
  concluidas: Tarefa[];
  loading: boolean;
  error: string | null;
};

export function useTarefas() {
  const [state, setState] = useState<UseTarefasState>({
    pendentes: [],
    concluidas: [],
    loading: true,
    error: null,
  });

  const refresh = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const [pendentes, concluidas] = await Promise.all([
        tarefasApi.listarPendentes(),
        tarefasApi.listarConcluidas(),
      ]);
      setState({ pendentes, concluidas, loading: false, error: null });
    } catch (err) {
      setState({
        pendentes: [],
        concluidas: [],
        loading: false,
        error: err instanceof Error ? err.message : "Erro ao carregar tarefas",
      });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const criar = useCallback(
    async (input: CriarTarefaInput) => {
      await tarefasApi.criar(input);
      await refresh();
    },
    [refresh],
  );

  const atualizar = useCallback(
    async (id: string, input: CriarTarefaInput) => {
      await tarefasApi.atualizar(id, input);
      await refresh();
    },
    [refresh],
  );

  const concluir = useCallback(
    async (id: string) => {
      await tarefasApi.concluir(id);
      await refresh();
    },
    [refresh],
  );

  const reabrir = useCallback(
    async (id: string) => {
      await tarefasApi.reabrir(id);
      await refresh();
    },
    [refresh],
  );

  const excluir = useCallback(
    async (id: string) => {
      await tarefasApi.excluir(id);
      await refresh();
    },
    [refresh],
  );

  return { ...state, refresh, criar, atualizar, concluir, reabrir, excluir };
}
