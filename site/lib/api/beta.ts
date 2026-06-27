import { api } from "./client";

export type StatusCodigoBeta = "disponivel" | "usado" | "revogado" | "expirado";

/** Espelha `CodigoBetaViewModel` do backend (.NET). */
export type CodigoBeta = {
  id: string;
  codigo: string;
  status: StatusCodigoBeta;
  criadoEm: string;
  usadoEm: string | null;
  revogadoEm: string | null;
  expiraEm: string | null;
  usadoPorEmail: string | null;
};

/** GET /admin/codigos-beta — exige conta admin. */
export async function listarCodigosBeta(): Promise<CodigoBeta[]> {
  return api<CodigoBeta[]>("/admin/codigos-beta");
}

/** POST /admin/codigos-beta — gera 1..50 códigos. Retorna os gerados. */
export async function gerarCodigoBeta(input?: {
  quantidade?: number;
  expiraEm?: string | null;
}): Promise<CodigoBeta[]> {
  return api<CodigoBeta[]>("/admin/codigos-beta", {
    method: "POST",
    body: {
      quantidade: input?.quantidade ?? 1,
      expiraEm: input?.expiraEm ?? null,
    },
  });
}

/** DELETE /admin/codigos-beta/{id} — revoga um código ainda não usado. */
export async function revogarCodigoBeta(id: string): Promise<void> {
  await api<void>(`/admin/codigos-beta/${id}`, { method: "DELETE" });
}
