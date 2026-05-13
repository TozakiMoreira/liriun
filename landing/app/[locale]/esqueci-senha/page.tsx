"use client";

export const runtime = "edge";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/routing";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { BtnSpinner } from "@/components/ui/btn-spinner";
import { esqueciSenha } from "@/lib/api/auth";

export default function EsqueciSenhaPage() {
  const t = useTranslations("Auth");

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return setErro(t("erroEmailInvalido"));
    setLoading(true);
    setErro(null);
    try {
      await esqueciSenha(email.trim());
      setEnviado(true);
    } catch (err) {
      setErro(err instanceof Error ? err.message : t("erroLogin"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title={t("recoverTitle")} lead={t("recoverLead")}>
      {enviado ? (
        <div className="text-base text-success leading-[1.55] mt-2">{t("linkEnviado")}</div>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            autoComplete="email"
            placeholder={t("email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/[0.05] border border-border-hi rounded-md px-4 py-3 text-base text-text placeholder:text-faint focus:outline-none focus:border-violet-500/60"
          />
          {erro && <p className="text-sm text-danger">{erro}</p>}
          <Button type="submit" disabled={loading} className="w-full justify-center mt-2">
            {loading ? <BtnSpinner /> : t("enviarLink")}
          </Button>
        </form>
      )}
      <div className="text-center mt-6 text-sm">
        <Link href="/login" className="text-muted hover:text-text">
          {t("voltarLogin")}
        </Link>
      </div>
    </AuthCard>
  );
}
