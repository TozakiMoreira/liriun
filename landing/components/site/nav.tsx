"use client";

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/routing";
import { LiriunLockup } from "@/components/brand/liriun-lockup";
import { Button } from "@/components/ui/button";
import { LocaleSwitcher } from "@/components/site/locale-switcher";
import { useAuth } from "@/components/auth/auth-provider";

const links = [
  { key: "produto", href: "/recursos" },
  { key: "precos", href: "/precos" },
  { key: "empresa", href: "/empresa" },
] as const;

export function SiteNav() {
  const t = useTranslations("Nav");
  const { state } = useAuth();
  const logado = state.status === "authenticated";

  return (
    <nav
      className="sticky top-0 z-40 backdrop-blur-md border-b border-border"
      style={{ background: "var(--liriun-bg-translucent)" }}
    >
      <div className="max-w-[1280px] mx-auto px-6 md:px-14 py-5 flex items-center justify-between">
        <Link href="/" aria-label={t("homeAria")}>
          <LiriunLockup iconSize={28} textSize={17} />
        </Link>
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
        <div className="flex gap-3 items-center">
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
      </div>
    </nav>
  );
}
