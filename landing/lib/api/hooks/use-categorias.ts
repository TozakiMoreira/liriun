"use client";

import { useCallback, useEffect, useReducer } from "react";

import { categoriasApi, type Categoria } from "../tarefas";

/**
 * Cache em memória compartilhado entre todos os consumidores de useCategorias.
 *
 * Antes, cada TarefaForm montado (abrir card de editar/criar) disparava um
 * GET /categorias. Agora a lista é buscada UMA vez (aquecida ao abrir a tela
 * de Tarefas/Hoje via prefetchCategorias) e reusada por todos os cards.
 * Mutações (criar/renomear/excluir) chamam refresh() e atualizam todos os
 * componentes inscritos.
 */
let cache: Categoria[] | null = null;
let inflight: Promise<void> | null = null;
let erro: string | null = null;
const listeners = new Set<() => void>();

function emitir() {
  listeners.forEach((l) => l());
}

function carregar(forcar = false): Promise<void> {
  if (!forcar && cache !== null) return Promise.resolve();
  if (inflight) return inflight; // dedup: várias montagens simultâneas = 1 request
  erro = null;
  inflight = categoriasApi
    .listar()
    .then((lista) => {
      cache = lista;
    })
    .catch((err) => {
      erro = err instanceof Error ? err.message : "Erro ao carregar categorias";
    })
    .finally(() => {
      inflight = null;
      emitir();
    });
  return inflight;
}

/** Aquece o cache. Chamar ao abrir telas que contêm o card (Tarefas, Hoje). */
export function prefetchCategorias(): void {
  void carregar();
}

export function useCategorias() {
  const [, rerender] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    listeners.add(rerender);
    void carregar(); // usa cache se já existir; senão busca uma vez
    return () => {
      listeners.delete(rerender);
    };
  }, []);

  const refresh = useCallback(() => carregar(true), []);

  return {
    categorias: cache ?? [],
    loading: cache === null && erro === null,
    error: erro,
    refresh,
  };
}
