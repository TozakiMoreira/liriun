import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface UsuarioLogado {
  id: string;
  nome: string;
  email: string;
}

interface AuthState {
  token: string | null;
  usuario: UsuarioLogado | null;
  hidratado: boolean;
  set: (token: string, usuario: UsuarioLogado) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      usuario: null,
      hidratado: false,

      set: (token, usuario) => set({ token, usuario }),

      clear: () => set({ token: null, usuario: null }),
    }),
    {
      name: "jarvis-auth",
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      partialize: (state) => ({ token: state.token, usuario: state.usuario }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hidratado = true;
      },
    },
  ),
);
