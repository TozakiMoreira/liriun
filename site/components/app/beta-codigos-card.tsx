"use client";

import { useCallback, useEffect, useState } from "react";

import {
  gerarCodigoBeta,
  listarCodigosBeta,
  revogarCodigoBeta,
  type CodigoBeta,
  type StatusCodigoBeta,
} from "@/lib/api/beta";

const STATUS_LABEL: Record<StatusCodigoBeta, string> = {
  disponivel: "disponível",
  usado: "usado",
  revogado: "revogado",
  expirado: "expirado",
};

const STATUS_STYLE: Record<StatusCodigoBeta, { color: string; background: string; border: string }> = {
  disponivel: {
    color: "var(--liriun-violet-300)",
    background: "rgba(156,123,255,0.10)",
    border: "1px solid rgba(156,123,255,0.28)",
  },
  usado: {
    color: "var(--liriun-muted)",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid var(--liriun-border-hi)",
  },
  revogado: {
    color: "var(--liriun-danger)",
    background: "rgba(248,113,113,0.08)",
    border: "1px solid rgba(248,113,113,0.32)",
  },
  expirado: {
    color: "var(--liriun-muted)",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid var(--liriun-border-hi)",
  },
};

export function BetaCodigosCard() {
  const [codigos, setCodigos] = useState<CodigoBeta[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [copiado, setCopiado] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setCodigos(await listarCodigosBeta());
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não consegui carregar os códigos.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function gerar() {
    setGerando(true);
    setErro(null);
    try {
      const novos = await gerarCodigoBeta({ quantidade: 1 });
      setCodigos((atuais) => [...novos, ...atuais]);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não consegui gerar o código.");
    } finally {
      setGerando(false);
    }
  }

  async function revogar(id: string) {
    setErro(null);
    try {
      await revogarCodigoBeta(id);
      setCodigos((atuais) =>
        atuais.map((c) =>
          c.id === id ? { ...c, status: "revogado", revogadoEm: new Date().toISOString() } : c,
        ),
      );
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não consegui revogar o código.");
    }
  }

  async function copiar(codigo: string) {
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(codigo);
      window.setTimeout(() => setCopiado((atual) => (atual === codigo ? null : atual)), 1600);
    } catch {
      // navegador sem clipboard API — silencioso
    }
  }

  const disponiveis = codigos.filter((c) => c.status === "disponivel").length;

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: "rgba(156,123,255,0.05)",
        border: "1px solid rgba(156,123,255,0.22)",
      }}
    >
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="font-mono text-xs uppercase tracking-[1.4px] text-violet-300">
          Códigos beta · admin
        </div>
        <button
          type="button"
          onClick={() => void gerar()}
          disabled={gerando}
          className="font-mono text-xs uppercase tracking-[1.2px] px-3 py-1.5 rounded-md text-white disabled:opacity-50"
          style={{ background: "var(--liriun-grad-brand)" }}
        >
          {gerando ? "Gerando…" : "Gerar código"}
        </button>
      </div>

      <p className="text-xs text-muted leading-[1.5] mb-4 max-w-[520px]">
        Cada código permite a criação de uma única conta. Compartilhe apenas com quem você quer no
        beta fechado. {disponiveis > 0 && <span className="text-violet-300">{disponiveis} disponível(is).</span>}
      </p>

      {erro && <p className="text-sm text-danger mb-3">{erro}</p>}

      {carregando ? (
        <p className="text-sm text-faint">Carregando…</p>
      ) : codigos.length === 0 ? (
        <p className="text-sm text-faint">Nenhum código ainda. Gere o primeiro acima.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {codigos.map((c) => {
            const ativo = c.status === "disponivel";
            return (
              <li key={c.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span
                      className={`font-mono text-sm tracking-[1px] ${ativo ? "text-text" : "text-faint line-through"}`}
                    >
                      {c.codigo}
                    </span>
                    <span
                      className="font-mono text-[10px] uppercase tracking-[1.2px] px-2 py-0.5 rounded-pill"
                      style={STATUS_STYLE[c.status]}
                    >
                      {STATUS_LABEL[c.status]}
                    </span>
                  </div>
                  {c.usadoPorEmail && (
                    <div className="text-xs text-muted mt-1 truncate">por {c.usadoPorEmail}</div>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {ativo && (
                    <>
                      <button
                        type="button"
                        onClick={() => void copiar(c.codigo)}
                        className="font-mono text-xs uppercase tracking-[1.2px] text-violet-300 hover:text-violet-200"
                      >
                        {copiado === c.codigo ? "Copiado!" : "Copiar"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void revogar(c.id)}
                        className="font-mono text-xs uppercase tracking-[1.2px] hover:opacity-80"
                        style={{ color: "var(--liriun-danger)" }}
                      >
                        Revogar
                      </button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
