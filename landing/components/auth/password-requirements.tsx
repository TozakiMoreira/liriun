"use client";

import { useTranslations } from "next-intl";

import { avaliarSenha } from "@/lib/auth/password";

export function PasswordRequirements({ senha }: { senha: string }) {
  const t = useTranslations("Auth.passwordReq");
  const reqs = avaliarSenha(senha);

  const items: { key: keyof typeof reqs; label: string }[] = [
    { key: "tamanho", label: t("length") },
    { key: "maiuscula", label: t("uppercase") },
    { key: "especial", label: t("special") },
  ];

  return (
    <ul className="flex flex-col gap-1 text-[11px]" aria-label={t("aria")}>
      {items.map((item) => {
        const ok = reqs[item.key];
        return (
          <li
            key={item.key}
            className={`flex items-center gap-2 transition-colors ${ok ? "text-success" : "text-faint"}`}
            data-met={ok}
          >
            <span className="w-3 inline-flex justify-center">
              {ok ? (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M5 12.5l4.5 4.5L19 7" />
                </svg>
              ) : (
                <span className="w-1 h-1 rounded-pill bg-current opacity-60" aria-hidden />
              )}
            </span>
            <span>{item.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
