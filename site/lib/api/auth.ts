import { api, clearToken, writeToken } from "./client";

export type Usuario = {
  id: string;
  nome: string;
  email: string;
  fotoUrl: string | null;
  ehAdmin: boolean;
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
  ehAdmin: boolean;
};

function mapAuth(res: AutenticacaoBackend): Usuario {
  return { id: res.usuarioId, nome: res.nome, email: res.email, fotoUrl: res.fotoUrl, ehAdmin: res.ehAdmin ?? false };
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

/** Fuso IANA do dispositivo (ex: "America/Sao_Paulo"). undefined se indisponível. */
function detectarFuso(): string | undefined {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || undefined;
  } catch {
    return undefined;
  }
}

export async function cadastrar(input: {
  nome: string;
  email: string;
  senha: string;
  aceitouTermos: boolean;
  codigoBeta: string;
}): Promise<Usuario> {
  const res = await api<AutenticacaoBackend>("/auth/cadastro", {
    method: "POST",
    body: { ...input, timeZoneId: detectarFuso() },
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
  ehAdmin: boolean;
};

function mapPerfil(p: PerfilBackend): Usuario {
  return { id: p.id, nome: p.nome, email: p.email, fotoUrl: p.fotoUrl, ehAdmin: p.ehAdmin ?? false };
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
