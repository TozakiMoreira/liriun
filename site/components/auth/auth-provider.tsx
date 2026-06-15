"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "@/i18n/routing";

import { meuPerfil, sair as sairApi, type Usuario } from "@/lib/api/auth";

type AuthState =
  | { status: "loading" }
  | { status: "authenticated"; usuario: Usuario }
  | { status: "anonymous" };

type AuthContextValue = {
  state: AuthState;
  refresh: () => Promise<void>;
  setUsuario: (usuario: Usuario) => void;
  sair: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });
  const router = useRouter();

  const refresh = useCallback(async () => {
    try {
      const usuario = await meuPerfil();
      setState({ status: "authenticated", usuario });
    } catch {
      setState({ status: "anonymous" });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const setUsuario = useCallback((usuario: Usuario) => {
    setState({ status: "authenticated", usuario });
  }, []);

  const sair = useCallback(async () => {
    sairApi();
    setState({ status: "anonymous" });
    router.replace("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ state, refresh, setUsuario, sair }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de <AuthProvider>");
  return ctx;
}

export function useUsuarioAtual(): Usuario | null {
  const { state } = useAuth();
  return state.status === "authenticated" ? state.usuario : null;
}
