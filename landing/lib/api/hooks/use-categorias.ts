"use client";

import { useCallback, useEffect, useState } from "react";

import { categoriasApi, type Categoria } from "../tarefas";

export function useCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const lista = await categoriasApi.listar();
      setCategorias(lista);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar categorias");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { categorias, loading, error, refresh };
}
