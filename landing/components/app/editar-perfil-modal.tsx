"use client";

import { useRef, useState, type ChangeEvent } from "react";

import { Button } from "@/components/ui/button";
import { BtnSpinner } from "@/components/ui/btn-spinner";
import { Modal } from "@/components/app/modal";
import { useAuth } from "@/components/auth/auth-provider";
import {
  atualizarFotoPerfil,
  atualizarPerfil,
  type Usuario,
} from "@/lib/api/auth";

export function EditarPerfilModal({
  open,
  onClose,
  usuario,
}: {
  open: boolean;
  onClose: () => void;
  usuario: Usuario;
}) {
  const { setUsuario } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [nome, setNome] = useState(usuario.nome);
  const [email, setEmail] = useState(usuario.email);
  const [fotoUrl, setFotoUrl] = useState(usuario.fotoUrl);
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function escolherFoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 700_000) {
      setErro("Foto maior que 700KB. Tente menor.");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setBusy(true);
      setErro(null);
      try {
        const u = await atualizarFotoPerfil(dataUrl);
        setUsuario(u);
        setFotoUrl(u.fotoUrl);
      } catch (err) {
        setErro(err instanceof Error ? err.message : "Erro ao subir foto");
      } finally {
        setBusy(false);
      }
    };
    reader.readAsDataURL(file);
  }

  async function removerFoto() {
    if (!fotoUrl) return;
    setBusy(true);
    setErro(null);
    try {
      const u = await atualizarFotoPerfil(null);
      setUsuario(u);
      setFotoUrl(null);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao remover foto");
    } finally {
      setBusy(false);
    }
  }

  async function salvar() {
    if (nome.trim().length === 0) return setErro("Nome obrigatório.");
    if (!email.includes("@")) return setErro("E-mail inválido.");
    setBusy(true);
    setErro(null);
    try {
      const u = await atualizarPerfil({ nome: nome.trim(), email: email.trim() });
      setUsuario(u);
      onClose();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setBusy(false);
    }
  }

  const inicial = usuario.nome.trim().charAt(0).toUpperCase() || "?";

  return (
    <Modal open={open} onClose={onClose} title="Editar perfil" size="md">
      <div className="flex flex-col gap-5">
        {/* Foto */}
        <div className="flex items-center gap-4">
          <div className="relative">
            {fotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={fotoUrl}
                alt={nome}
                className="w-20 h-20 rounded-pill object-cover border border-border-hi"
              />
            ) : (
              <div
                className="w-20 h-20 rounded-pill bg-grad-brand grid place-items-center font-mono text-2xl font-semibold text-white"
                aria-hidden
              >
                {inicial}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="font-mono text-[11px] uppercase tracking-[1.2px] text-violet-300 hover:text-violet-200 self-start"
            >
              Trocar foto
            </button>
            {fotoUrl && (
              <button
                type="button"
                onClick={() => void removerFoto()}
                disabled={busy}
                className="font-mono text-[11px] uppercase tracking-[1.2px] text-faint hover:text-danger self-start"
              >
                Remover
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={escolherFoto}
              className="hidden"
            />
          </div>
        </div>

        {/* Nome */}
        <div>
          <Label>Nome</Label>
          <Input value={nome} onChange={setNome} maxLength={100} />
        </div>

        {/* Email */}
        <div>
          <Label>E-mail</Label>
          <Input value={email} onChange={setEmail} type="email" />
        </div>

        {erro && <p className="text-sm text-danger">{erro}</p>}

        <div className="flex gap-3 justify-end pt-2 border-t border-border">
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancelar
          </Button>
          <Button onClick={() => void salvar()} disabled={busy}>
            {busy ? <BtnSpinner /> : "Salvar"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block font-mono text-[11px] uppercase tracking-[1.4px] text-faint mb-2">
      {children}
    </label>
  );
}

function Input({
  value,
  onChange,
  type = "text",
  maxLength,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: "text" | "email";
  maxLength?: number;
}) {
  return (
    <input
      type={type}
      maxLength={maxLength}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-white/[0.05] border border-border-hi rounded-md px-3 py-2.5 text-sm text-text focus:outline-none focus:border-violet-500/60"
    />
  );
}
