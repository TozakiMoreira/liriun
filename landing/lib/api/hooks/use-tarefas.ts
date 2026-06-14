"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { tarefasApi, type CriarTarefaInput, type StatusTarefa, type Tarefa } from "../tarefas";

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

  // Espelho do state pra capturar snapshot síncrono em updates otimistas
  // (rollback em caso de falha de rede) sem depender do closure do setState.
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

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

  // Conclui de forma otimista: move pendentes → concluídas na hora, depois
  // sincroniza com o servidor em background. Rollback se a rede falhar.
  // Sem refetch da lista (concluir só vira status, não gera recorrência).
  const concluir = useCallback(async (id: string) => {
    const snapshot = stateRef.current;
    const alvo = snapshot.pendentes.find((t) => t.id === id);
    if (!alvo) return;

    const otimista: Tarefa = {
      ...alvo,
      status: 2 as StatusTarefa,
      concluidaEm: new Date().toISOString(),
    };
    setState((s) => ({
      ...s,
      pendentes: s.pendentes.filter((t) => t.id !== id),
      concluidas: [otimista, ...s.concluidas],
    }));

    try {
      const servidor = await tarefasApi.concluir(id);
      setState((s) => ({
        ...s,
        concluidas: s.concluidas.map((t) => (t.id === id ? servidor : t)),
      }));
    } catch (err) {
      setState(snapshot); // rollback — o checkbox volta sozinho
      console.error("Falha ao concluir tarefa:", err);
    }
  }, []);

  // Reabre de forma otimista: move concluídas → pendentes na hora. O servidor
  // recalcula o status real (pendente/atrasada) e reconciliamos na resposta.
  const reabrir = useCallback(async (id: string) => {
    const snapshot = stateRef.current;
    const alvo = snapshot.concluidas.find((t) => t.id === id);
    if (!alvo) return;

    const otimista: Tarefa = {
      ...alvo,
      status: 1 as StatusTarefa,
      concluidaEm: null,
    };
    setState((s) => ({
      ...s,
      concluidas: s.concluidas.filter((t) => t.id !== id),
      pendentes: [otimista, ...s.pendentes],
    }));

    try {
      const servidor = await tarefasApi.reabrir(id);
      setState((s) => ({
        ...s,
        pendentes: s.pendentes.map((t) => (t.id === id ? servidor : t)),
      }));
    } catch (err) {
      setState(snapshot); // rollback
      console.error("Falha ao reabrir tarefa:", err);
    }
  }, []);

  const excluir = useCallback(
    async (id: string) => {
      await tarefasApi.excluir(id);
      await refresh();
    },
    [refresh],
  );

  return { ...state, refresh, criar, atualizar, concluir, reabrir, excluir };
}
