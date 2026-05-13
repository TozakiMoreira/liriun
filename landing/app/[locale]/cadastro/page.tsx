"use client";

export const runtime = "edge";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";

import { Link, useRouter } from "@/i18n/routing";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { BtnSpinner } from "@/components/ui/btn-spinner";
import { useAuth } from "@/components/auth/auth-provider";
import { PasswordRequirements } from "@/components/auth/password-requirements";
import { cadastrar } from "@/lib/api/auth";
import { senhaAtendeRequisitos } from "@/lib/auth/password";

export default function CadastroPage() {
  const t = useTranslations("Auth");
  const { setUsuario } = useAuth();
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (nome.trim().length === 0) return setErro(t("erroNomeObrigatorio"));
    if (!email.includes("@")) return setErro(t("erroEmailInvalido"));
    if (!senhaAtendeRequisitos(senha)) return setErro(t("erroSenhaCurta"));
    if (!aceitouTermos) return setErro(t("erroAceiteTermos"));
    setLoading(true);
    setErro(null);
    try {
      const usuario = await cadastrar({ nome: nome.trim(), email: email.trim(), senha, aceitouTermos });
      setUsuario(usuario);
      router.replace("/app/falar");
    } catch (err) {
      setErro(err instanceof Error ? err.message : t("erroLogin"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title={t("signupTitle")} lead={t("signupLead")}>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          autoComplete="name"
          placeholder={t("nome")}
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full bg-white/[0.05] border border-border-hi rounded-md px-4 py-3 text-base text-text placeholder:text-faint focus:outline-none focus:border-violet-500/60"
        />
        <input
          type="email"
          autoComplete="email"
          placeholder={t("email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-white/[0.05] border border-border-hi rounded-md px-4 py-3 text-base text-text placeholder:text-faint focus:outline-none focus:border-violet-500/60"
        />
        <input
          type="password"
          autoComplete="new-password"
          placeholder={t("senha")}
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full bg-white/[0.05] border border-border-hi rounded-md px-4 py-3 text-base text-text placeholder:text-faint focus:outline-none focus:border-violet-500/60"
        />
        <div className="mt-1">
          <PasswordRequirements senha={senha} />
        </div>
        <div className="flex items-start gap-3 mt-2 text-sm text-muted leading-[1.5]">
          <input
            id="aceite-termos"
            type="checkbox"
            checked={aceitouTermos}
            onChange={(e) => setAceitouTermos(e.target.checked)}
            className="mt-1 w-4 h-4 accent-violet-500 cursor-pointer shrink-0"
          />
          <label htmlFor="aceite-termos" className="cursor-pointer">
            {t("aceitarTermosPrefixo")}{" "}
            <Link href="/termos" target="_blank" className="text-violet-300 hover:text-violet-200 underline-offset-2 hover:underline">
              {t("termosLink")}
            </Link>
            {t("aceitarTermosE")}{" "}
            <Link href="/privacidade" target="_blank" className="text-violet-300 hover:text-violet-200 underline-offset-2 hover:underline">
              {t("privacidadeLink")}
            </Link>
            .
          </label>
        </div>
        {erro && <p className="text-sm text-danger">{erro}</p>}
        <Button type="submit" disabled={loading} className="w-full justify-center mt-3">
          {loading ? <BtnSpinner /> : t("criarConta")}
        </Button>
        <div className="text-center mt-3 text-sm">
          <Link href="/login" className="text-violet-300 hover:text-violet-200">
            {t("jaTemConta")}
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}
