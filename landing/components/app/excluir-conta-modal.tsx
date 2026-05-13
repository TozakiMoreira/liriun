"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { BtnSpinner } from "@/components/ui/btn-spinner";
import { Modal } from "@/components/app/modal";
import { useAuth } from "@/components/auth/auth-provider";
import { excluirConta } from "@/lib/api/auth";

export function ExcluirContaModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { sair } = useAuth();
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const podeExcluir = senha.length > 0 && confirmacao === "EXCLUIR";

  async function confirmar() {
    if (!podeExcluir) return;
    setBusy(true);
    setErro(null);
    try {
      await excluirConta(senha);
      await sair();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao excluir conta");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Excluir conta" size="sm">
      <div className="flex flex-col gap-4">
        <div
          className="rounded-md p-3 text-sm leading-[1.5]"
          style={{ background: "rgba(238,122,142,0.08)", border: "1px solid rgba(238,122,142,0.32)" }}
        >
          <strong className="text-danger">Ação irreversível.</strong>
          <span className="text-muted">
            {" "}
            Suas tarefas, categorias e dados pessoais serão apagados em até 30 dias.
          </span>
        </div>

        <div>
          <label className="block font-mono text-[11px] uppercase tracking-[1.4px] text-faint mb-2">
            Sua senha
          </label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full bg-white/[0.05] border border-border-hi rounded-md px-3 py-2.5 text-sm text-text focus:outline-none focus:border-violet-500/60"
          />
        </div>

        <div>
          <label className="block font-mono text-[11px] uppercase tracking-[1.4px] text-faint mb-2">
            Digite EXCLUIR pra confirmar
          </label>
          <input
            type="text"
            value={confirmacao}
            onChange={(e) => setConfirmacao(e.target.value)}
            className="w-full bg-white/[0.05] border border-border-hi rounded-md px-3 py-2.5 text-sm text-text focus:outline-none focus:border-danger/60"
          />
        </div>

        {erro && <p className="text-sm text-danger">{erro}</p>}

        <div className="flex gap-3 justify-end pt-2 border-t border-border">
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancelar
          </Button>
          <button
            type="button"
            onClick={() => void confirmar()}
            disabled={busy || !podeExcluir}
            className="text-sm font-semibold text-danger bg-danger/10 border border-danger/30 rounded-md px-4 py-2.5 hover:bg-danger/15 transition-colors disabled:opacity-50"
          >
            {busy ? <BtnSpinner /> : "Excluir conta"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
