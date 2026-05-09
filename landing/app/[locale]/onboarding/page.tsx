"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";

import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";
import { categoriasApi } from "@/lib/api/tarefas";

const TEMPLATE_KEYS = ["trabalho", "faculdade", "casa", "compras", "pessoal"] as const;

export default function OnboardingPage() {
  const t = useTranslations("Onboarding");
  const { state } = useAuth();
  const router = useRouter();

  const templates = useMemo(
    () => TEMPLATE_KEYS.map((k) => ({ key: k, label: t(`templates.${k}`) })),
    [t],
  );

  const [selecionadas, setSelecionadas] = useState<string[]>([]);
  const [custom, setCustom] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [verificando, setVerificando] = useState(true);

  // Auth gate + skip se já tem categorias
  useEffect(() => {
    if (state.status === "loading") return;
    if (state.status === "anonymous") {
      router.replace("/login");
      return;
    }
    void categoriasApi
      .listar()
      .then((cats) => {
        if (cats.length > 0) router.replace("/app/falar");
        else setVerificando(false);
      })
      .catch(() => setVerificando(false));
  }, [state.status, router]);

  function toggleTemplate(label: string) {
    setSelecionadas((prev) =>
      prev.includes(label) ? prev.filter((c) => c !== label) : [...prev, label],
    );
  }

  function adicionarCustom(e: FormEvent) {
    e.preventDefault();
    const nome = custom.trim();
    if (!nome) return;
    if (selecionadas.includes(nome)) return;
    setSelecionadas((prev) => [...prev, nome]);
    setCustom("");
  }

  function remover(nome: string) {
    setSelecionadas((prev) => prev.filter((c) => c !== nome));
  }

  async function continuar() {
    if (selecionadas.length === 0) {
      setErro(t("vazioErro"));
      return;
    }
    setSalvando(true);
    setErro(null);
    try {
      for (const nome of selecionadas) {
        await categoriasApi.criar(nome);
      }
      router.replace("/app/falar");
    } catch {
      setErro(t("salvarErro"));
      setSalvando(false);
    }
  }

  if (verificando) {
    return (
      <div className="min-h-screen grid place-items-center text-muted">
        <span className="font-mono text-xs uppercase tracking-[1.4px]">…</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 md:px-12 py-12 md:py-16">
      <div className="max-w-[640px] mx-auto">
        <div className="font-mono text-[11px] uppercase tracking-[1.6px] text-muted mb-3">
          {t("kicker")}
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.4px] text-text">
          {t("title")}
        </h1>
        <p className="text-base text-muted leading-[1.55] mt-4 max-w-[520px]">
          {t("lead")}
        </p>

        <section className="mt-10">
          <div className="font-mono text-[11px] uppercase tracking-[1.4px] text-muted mb-3">
            {t("templatesTitle")}
          </div>
          <div className="flex flex-wrap gap-2">
            {templates.map((tpl) => {
              const ativa = selecionadas.includes(tpl.label);
              return (
                <button
                  key={tpl.key}
                  type="button"
                  onClick={() => toggleTemplate(tpl.label)}
                  className={`px-4 py-2 rounded-pill text-sm font-medium transition-colors duration-base border ${
                    ativa
                      ? "bg-grad-brand text-white border-transparent shadow-glow"
                      : "bg-white/[0.05] text-text border-border-hi hover:bg-white/[0.08]"
                  }`}
                  aria-pressed={ativa}
                >
                  {tpl.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-8">
          <div className="font-mono text-[11px] uppercase tracking-[1.4px] text-muted mb-3">
            {t("customTitle")}
          </div>
          <form onSubmit={adicionarCustom} className="flex gap-2">
            <input
              type="text"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder={t("customPlaceholder")}
              maxLength={30}
              className="flex-1 bg-white/[0.05] border border-border-hi rounded-md px-4 py-3 text-base text-text placeholder:text-faint focus:outline-none focus:border-violet-500/60"
            />
            <Button type="submit" variant="secondary" disabled={!custom.trim()}>
              {t("adicionar")}
            </Button>
          </form>
        </section>

        {selecionadas.length > 0 && (
          <section className="mt-8">
            <div className="font-mono text-[11px] uppercase tracking-[1.4px] text-muted mb-3">
              {t("selecionadas")} · {selecionadas.length}
            </div>
            <div className="flex flex-wrap gap-2">
              {selecionadas.map((nome) => (
                <span
                  key={nome}
                  className="inline-flex items-center gap-2 pl-4 pr-2 py-1.5 rounded-pill bg-white/[0.05] border border-border-hi text-sm text-text"
                >
                  {nome}
                  <button
                    type="button"
                    onClick={() => remover(nome)}
                    aria-label={`${t("remover")} ${nome}`}
                    className="w-6 h-6 rounded-pill grid place-items-center text-muted hover:text-text hover:bg-white/[0.08]"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          </section>
        )}

        {erro && <p className="text-sm text-danger mt-6">{erro}</p>}

        <div className="mt-10">
          <Button
            type="button"
            onClick={continuar}
            disabled={salvando || selecionadas.length === 0}
            className="w-full justify-center md:w-auto md:min-w-[200px]"
          >
            {salvando ? t("salvando") : t("continuar")}
          </Button>
        </div>
      </div>
    </div>
  );
}
