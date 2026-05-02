import { create } from "zustand";

import { secureStore } from "@/lib/secureStore";

interface UsuarioLogado {
  id: string;
  nome: string;
  email: string;
}

interface AuthState {
  token: string | null;
  usuario: UsuarioLogado | null;
  hidratado: boolean;
  hidratar: () => Promise<void>;
  set: (token: string, usuario: UsuarioLogado) => Promise<void>;
  clear: () => Promise<void>;
}

const KEY_TOKEN = "jarvis.token";
const KEY_USUARIO = "jarvis.usuario";

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  usuario: null,
  hidratado: false,

  hidratar: async () => {
    const [token, usuarioRaw] = await Promise.all([
      secureStore.getItem(KEY_TOKEN),
      secureStore.getItem(KEY_USUARIO),
    ]);

    let usuario: UsuarioLogado | null = null;
    if (usuarioRaw) {
      try {
        usuario = JSON.parse(usuarioRaw) as UsuarioLogado;
      } catch {
        usuario = null;
      }
    }

    set({ token, usuario, hidratado: true });
  },

  set: async (token, usuario) => {
    await Promise.all([
      secureStore.setItem(KEY_TOKEN, token),
      secureStore.setItem(KEY_USUARIO, JSON.stringify(usuario)),
    ]);
    set({ token, usuario });
  },

  clear: async () => {
    await Promise.all([
      secureStore.removeItem(KEY_TOKEN),
      secureStore.removeItem(KEY_USUARIO),
    ]);
    set({ token: null, usuario: null });
  },
}));
