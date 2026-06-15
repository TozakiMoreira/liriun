"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/app/modal";
import { PasswordRequirements } from "@/components/auth/password-requirements";
import { alterarSenha } from "@/lib/api/auth";
import { senhaAtendeRequisitos } from "@/lib/auth/password";

export function AlterarSenhaModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [atual, setAtual] = useState("");
  const [nova, setNova] = useState("");
  const [confirma, setConfirma] = useState("");
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  async function salvar() {
    setErro(null);
    if (atual.length === 0) return setErro("Informe a senha atual.");
    if (!senhaAtendeRequisitos(nova)) return setErro("Nova senha não atende todos os requisitos.");
    if (nova !== confirma) return setErro("Confirmação não confere com a nova senha.");
    setBusy(true);
    try {
      await alterarSenha({ senhaAtual: atual, novaSenha: nova });
      setSucesso(true);
      setAtual("");
      setNova("");
      setConfirma("");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao alterar senha");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Alterar senha" size="sm">
      {sucesso ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-success">Senha atualizada com sucesso.</p>
          <div className="flex justify-end">
            <Button onClick={onClose}>Fechar</Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <Field type="password" label="Senha atual" value={atual} onChange={setAtual} />
          <Field type="password" label="Nova senha" value={nova} onChange={setNova} />
          <PasswordRequirements senha={nova} />
          <Field type="password" label="Confirmar nova senha" value={confirma} onChange={setConfirma} />

          {erro && <p className="text-sm text-danger">{erro}</p>}

          <div className="flex gap-3 justify-end pt-2 border-t border-border">
            <Button variant="secondary" onClick={onClose} disabled={busy}>
              Cancelar
            </Button>
            <Button onClick={() => void salvar()} loading={busy}>
              Salvar
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: "text" | "password";
}) {
  return (
    <div>
      <label className="block font-mono text-[11px] uppercase tracking-[1.4px] text-faint mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/[0.05] border border-border-hi rounded-md px-3 py-2.5 text-sm text-text focus:outline-none focus:border-violet-500/60"
      />
    </div>
  );
}
