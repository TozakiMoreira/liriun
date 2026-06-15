import { api, clearToken, writeToken } from "./client";

export type Usuario = {
  id: string;
  nome: string;
  email: string;
  fotoUrl: string | null;
};

/**
 * Resposta plana de auth do .NET — `AutenticacaoViewModel`.
 */
type AutenticacaoBackend = {
  usuarioId: string;
  nome: string;
  email: string;
  fotoUrl: string | null;
  token: string;
  expiraEm: string;
};

function mapAuth(res: AutenticacaoBackend): Usuario {
  return { id: res.usuarioId, nome: res.nome, email: res.email, fotoUrl: res.fotoUrl };
}

export async function login(email: string, senha: string): Promise<Usuario> {
  const res = await api<AutenticacaoBackend>("/auth/login", {
    method: "POST",
    body: { email, senha },
    auth: false,
  });
  writeToken(res.token);
  return mapAuth(res);
}

export async function cadastrar(input: {
  nome: string;
  email: string;
  senha: string;
  aceitouTermos: boolean;
}): Promise<Usuario> {
  const res = await api<AutenticacaoBackend>("/auth/cadastro", {
    method: "POST",
    body: input,
    auth: false,
  });
  writeToken(res.token);
  return mapAuth(res);
}

export async function esqueciSenha(email: string): Promise<void> {
  await api<void>("/auth/esqueci-senha", {
    method: "POST",
    body: { email },
    auth: false,
  });
}

type PerfilBackend = {
  id: string;
  nome: string;
  email: string;
  fotoUrl: string | null;
};

function mapPerfil(p: PerfilBackend): Usuario {
  return { id: p.id, nome: p.nome, email: p.email, fotoUrl: p.fotoUrl };
}

export async function meuPerfil(): Promise<Usuario> {
  const res = await api<PerfilBackend>("/auth/perfil");
  return mapPerfil(res);
}

export async function atualizarPerfil(input: { nome: string; email: string }): Promise<Usuario> {
  const res = await api<PerfilBackend>("/auth/perfil", { method: "PUT", body: input });
  return mapPerfil(res);
}

export async function atualizarFotoPerfil(fotoUrl: string | null): Promise<Usuario> {
  const res = await api<PerfilBackend>("/auth/perfil/foto", {
    method: "PUT",
    body: { fotoUrl },
  });
  return mapPerfil(res);
}

export async function alterarSenha(input: {
  senhaAtual: string;
  novaSenha: string;
}): Promise<void> {
  await api<void>("/auth/alterar-senha", { method: "POST", body: input });
}

export async function excluirConta(senha: string): Promise<void> {
  await api<void>("/auth/conta", { method: "DELETE", body: { senha } });
}

export function sair(): void {
  clearToken();
}
