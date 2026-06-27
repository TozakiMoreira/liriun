"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/routing";
import { LiriunLockup } from "@/components/brand/liriun-lockup";
import { Button } from "@/components/ui/button";
import { LocaleSwitcher } from "@/components/site/locale-switcher";
import { IllustrativeBanner } from "@/components/site/illustrative-banner";
import { useAuth } from "@/components/auth/auth-provider";

const links = [
  { key: "produto", href: "/recursos" },
  { key: "precos", href: "/precos" },
] as const;

export function SiteNav() {
  const t = useTranslations("Nav");
  const { state } = useAuth();
  const logado = state.status === "authenticated";
  const [aberto, setAberto] = useState(false);

  function fechar() {
    setAberto(false);
  }

  return (
    <>
      <IllustrativeBanner />
      <nav
      className="sticky top-0 z-40 backdrop-blur-md border-b border-border"
      style={{ background: "var(--liriun-bg-translucent)" }}
    >
      <div className="max-w-[1280px] mx-auto px-6 md:px-14 py-5 flex items-center justify-between gap-4">
        <Link href="/" aria-label={t("homeAria")} onClick={fechar}>
          <LiriunLockup iconSize={28} textSize={17} />
        </Link>

        {/* Links centro — só desktop */}
        <div className="hidden md:flex gap-7 items-center">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-muted font-medium tracking-[-0.1px] hover:text-text transition-colors duration-base"
            >
              {t(l.key)}
            </Link>
          ))}
        </div>

        {/* CTAs direita — só desktop */}
        <div className="hidden md:flex gap-3 items-center">
          <LocaleSwitcher />
          {logado ? (
            <Link href="/app/falar">
              <Button>Abrir app</Button>
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm text-muted font-medium hover:text-text">
                {t("entrar")}
              </Link>
              <Link href="/cadastro">
                <Button>{t("baixarApp")}</Button>
              </Link>
            </>
          )}
        </div>

        {/* Hamburger — só mobile */}
        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          aria-label={aberto ? "Fechar menu" : "Abrir menu"}
          aria-expanded={aberto}
          className="md:hidden w-10 h-10 grid place-items-center text-text -mr-1.5"
        >
          {aberto ? <CloseIcon /> : <BurgerIcon />}
        </button>
      </div>

      {/* Painel mobile */}
      {aberto && (
        <div
          className="md:hidden relative animate-fade-in"
          style={{
            background:
              "linear-gradient(180deg, rgba(28,30,38,0.96) 0%, rgba(18,20,26,0.96) 100%)",
            backdropFilter: "blur(24px)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "0 12px 36px rgba(0,0,0,0.45)",
          }}
        >
          {/* Hairline brand topo */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(156,123,255,0.55) 30%, rgba(91,141,239,0.55) 70%, transparent 100%)",
            }}
          />

          <div className="px-3 py-3 flex flex-col gap-0.5">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={fechar}
                className="group flex items-center justify-between px-4 py-3.5 rounded-xl text-text text-base font-medium transition-all hover:bg-white/[0.04] active:bg-white/[0.06]"
              >
                <span>{t(l.key)}</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-faint group-hover:text-violet-300 transition-colors"
                >
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </Link>
            ))}

            <div
              className="mt-3 pt-4 px-1 flex items-center gap-3"
              style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
            >
              <LocaleSwitcher />
              <div className="flex-1" />
              {logado ? (
                <Link href="/app/falar" onClick={fechar} className="shrink-0">
                  <Button>Abrir app</Button>
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={fechar}
                    className="text-sm text-muted font-medium hover:text-text px-2 transition-colors"
                  >
                    {t("entrar")}
                  </Link>
                  <Link href="/cadastro" onClick={fechar} className="shrink-0">
                    <Button>{t("baixarApp")}</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      </nav>
    </>
  );
}

function BurgerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}
