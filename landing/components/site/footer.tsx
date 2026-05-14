import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { LiriunLockup } from "@/components/brand/liriun-lockup";
import { Button } from "@/components/ui/button";
import { FooterWidget } from "@/components/site/footer-widget";

type FooterItem = { key: string; href: string; external?: boolean };

const groups: { title: string; items: FooterItem[] }[] = [
  {
    title: "produto",
    items: [
      { key: "recursos", href: "/recursos" },
      { key: "precos", href: "/precos" },
    ],
  },
  {
    title: "empresa",
    items: [
      { key: "empresa", href: "/empresa" },
      { key: "contato", href: "mailto:contato@liriun.com", external: true },
    ],
  },
  {
    title: "legal",
    items: [
      { key: "termos", href: "/termos" },
      { key: "privacidade", href: "/privacidade" },
    ],
  },
];

export function SiteFooter({ showCta = true }: { showCta?: boolean }) {
  const t = useTranslations("Footer");
  const tCta = useTranslations("FooterCTA");
  const tLinks = useTranslations("Footer.links");

  return (
    <footer style={{ background: "var(--liriun-bg-deep)" }} className="px-6 md:px-14 py-16 mt-20">
      <div className="max-w-[1280px] mx-auto">
        {showCta && (
          <div
            className="rounded-[28px] p-8 md:p-10 mb-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            style={{
              background: "linear-gradient(180deg, rgba(156,123,255,0.10), rgba(91,141,239,0.04))",
              border: "1px solid rgba(156,123,255,0.28)",
            }}
          >
            <div>
              <div className="text-2xl font-semibold tracking-[-0.8px] leading-[1.1]">
                {tCta("title")}
              </div>
              <p className="text-base text-muted mt-[10px] max-w-[460px] leading-[1.5]">
                {tCta("lead")}
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Button>{tCta("primary")}</Button>
              <Button variant="secondary">{tCta("secondary")}</Button>
            </div>
          </div>
        )}

        <div className="mb-12 hidden md:block">
          <FooterWidget />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2">
            <LiriunLockup iconSize={24} textSize={17} />
            <p className="text-sm text-muted mt-[18px] leading-[1.6] max-w-[280px]">
              {t("tagline")}
            </p>
            <div className="flex gap-[10px] mt-6">
              {[
                { id: "instagram", label: "Instagram", href: "https://instagram.com/liriun.com" },
                { id: "linkedin", label: "LinkedIn", href: "https://linkedin.com/company/liriun" },
                { id: "x", label: "X (Twitter)", href: "https://x.com/liriunapp" },
              ].map((s) => (
                <a
                  key={s.id}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="block"
                >
                  <img
                    src={`/social/${s.id}.svg`}
                    alt=""
                    aria-hidden
                    className="w-9 h-9 rounded-sm transition-opacity duration-base hover:opacity-85"
                  />
                </a>
              ))}
            </div>
          </div>
          {groups.map((g) => (
            <div key={g.title}>
              <div className="font-mono text-xs font-semibold tracking-[1.2px] text-faint uppercase mb-[18px]">
                {t(g.title)}
              </div>
              <div className="flex flex-col gap-3">
                {g.items.map((it) =>
                  it.external ? (
                    <a
                      key={it.href}
                      href={it.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted font-medium hover:text-text transition-colors"
                    >
                      {tLinks(it.key)}
                    </a>
                  ) : (
                    <Link
                      key={it.href}
                      href={it.href}
                      className="text-sm text-muted font-medium hover:text-text transition-colors"
                    >
                      {tLinks(it.key)}
                    </Link>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 font-mono text-xs text-faint tracking-[0.4px]">
          <span>{t("copyright")}</span>
          <span>{t("version")}</span>
        </div>
      </div>
    </footer>
  );
}
