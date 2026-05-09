"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { useRouter, usePathname, routing, type Locale } from "@/i18n/routing";

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  function onChange(next: Locale) {
    if (next === locale || pending) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <div
      role="radiogroup"
      aria-label="Idioma"
      className="relative inline-flex items-center rounded-pill border border-border-hi p-[3px] font-mono text-[11px] font-semibold uppercase tracking-[1px]"
      style={{ background: "rgba(255,255,255,0.04)" }}
    >
      {routing.locales.map((l) => {
        const active = l === locale;
        return (
          <button
            key={l}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(l)}
            disabled={pending}
            className={[
              "relative z-10 px-2.5 py-1 rounded-pill transition-colors duration-base",
              active ? "text-white" : "text-muted hover:text-text",
              pending ? "opacity-60 cursor-wait" : "cursor-pointer",
            ].join(" ")}
            style={
              active
                ? {
                    background: "var(--liriun-grad-brand)",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.18), 0 4px 12px rgba(91,141,239,0.28)",
                  }
                : undefined
            }
          >
            {l.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
