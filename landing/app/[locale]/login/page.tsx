"use client";

export const runtime = "edge";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";

import { Link, useRouter } from "@/i18n/routing";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";
import { login } from "@/lib/api/auth";

export default function LoginPage() {
  const t = useTranslations("Auth");
  const { setUsuario } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return setErro(t("erroEmailInvalido"));
    if (senha.length === 0) return setErro(t("erroSenhaCurta"));
    setLoading(true);
    setErro(null);
    try {
      const usuario = await login(email.trim(), senha);
      setUsuario(usuario);
      router.replace("/app/falar");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErro(`${t("erroLogin")} (${msg})`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title={t("loginTitle")} lead={t("loginLead")}>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <Field
          type="email"
          autoComplete="email"
          placeholder={t("email")}
          value={email}
          onChange={(v) => setEmail(v)}
        />
        <Field
          type="password"
          autoComplete="current-password"
          placeholder={t("senha")}
          value={senha}
          onChange={(v) => setSenha(v)}
        />
        {erro && <p className="text-sm text-danger">{erro}</p>}
        <Button type="submit" loading={loading} className="w-full justify-center mt-2">
          {t("entrar")}
        </Button>
        <div className="flex justify-between mt-3 text-sm">
          <Link href="/esqueci-senha" className="text-muted hover:text-text">
            {t("esqueciSenha")}
          </Link>
          <Link href="/cadastro" className="text-violet-300 hover:text-violet-200">
            {t("criarConta")}
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}

function Field({
  type,
  placeholder,
  value,
  onChange,
  autoComplete,
}: {
  type: "text" | "email" | "password";
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) {
  return (
    <input
      type={type}
      autoComplete={autoComplete}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-white/[0.05] border border-border-hi rounded-md px-4 py-3 text-base text-text placeholder:text-faint focus:outline-none focus:border-violet-500/60 transition-colors"
    />
  );
}
