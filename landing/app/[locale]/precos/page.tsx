export const runtime = "edge";

import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { SiteNav } from "@/components/site/nav";
import { SiteFooter } from "@/components/site/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Precos" });
  return { title: t("title"), description: t("description") };
}

export default async function PrecosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PrecosContent />;
}

function PrecosContent() {
  const t = useTranslations("Precos");
  const tFree = useTranslations("Precos.tiers.free");
  const tPro = useTranslations("Precos.tiers.pro");
  const tFaq = useTranslations("Precos.faq");

  const freeFeatures = (tFree.raw("features") as string[]) ?? [];
  const proFeatures = (tPro.raw("features") as string[]) ?? [];
  const faqIds = ["q1", "q2", "q3", "q4"] as const;

  return (
    <main>
      <SiteNav />

      {/* Hero */}
      <section
        className="relative pb-16"
        style={{
          background:
            "radial-gradient(70% 50% at 80% 0%, rgba(156,123,255,0.16) 0%, transparent 60%), radial-gradient(60% 50% at 10% 80%, rgba(91,141,239,0.12) 0%, transparent 60%), var(--liriun-surface)",
        }}
      >
        <div className="max-w-[1080px] mx-auto px-6 md:px-14 pt-16 md:pt-24 text-center">
          <Badge>{t("kicker")}</Badge>
          <h1 className="text-4xl md:text-[64px] font-semibold tracking-[-2px] leading-[1.05] mt-6">
            {t("heroLine1")}
            <br />
            <span className="bg-grad-brand bg-clip-text text-transparent">{t("heroLine2")}</span>
          </h1>
          <p className="text-lg text-muted leading-[1.65] tracking-[-0.1px] mt-8 max-w-[640px] mx-auto">
            {t("lead")}
          </p>
        </div>
      </section>

      {/* Tiers */}
      <section className="max-w-[1080px] mx-auto px-6 md:px-14 pb-16">
        <div className="grid md:grid-cols-2 gap-6">
          <PricingTier
            highlight
            badge={t("betaBadge")}
            name={tFree("name")}
            price={tFree("price")}
            period={tFree("period")}
            tagline={tFree("tagline")}
            features={freeFeatures}
            ctaLabel={tFree("ctaLabel")}
            ctaHref="/login"
          />
          <PricingTier
            name={tPro("name")}
            price={tPro("price")}
            period={tPro("period")}
            tagline={tPro("tagline")}
            features={proFeatures}
            ctaLabel={tPro("ctaLabel")}
            ctaHref="/contato"
            disabled
          />
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-[760px] mx-auto px-6 md:px-14 pb-24">
        <h2 className="text-2xl md:text-[36px] font-semibold tracking-[-1px] leading-[1.15] mb-8">
          {tFaq("title")}
        </h2>
        <div className="flex flex-col gap-4">
          {faqIds.map((id) => (
            <details
              key={id}
              className="group rounded-2xl border border-border-hi p-6 open:border-violet-500/40 transition-colors"
              style={{ background: "rgba(255,255,255,0.035)" }}
            >
              <summary className="cursor-pointer list-none flex items-center justify-between gap-4">
                <span className="text-base font-semibold tracking-[-0.2px]">
                  {tFaq(`items.${id}.q`)}
                </span>
                <span className="text-violet-300 font-mono text-lg shrink-0 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="text-sm text-muted leading-[1.65] mt-4">{tFaq(`items.${id}.a`)}</p>
            </details>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function PricingTier({
  highlight = false,
  disabled = false,
  badge,
  name,
  price,
  period,
  tagline,
  features,
  ctaLabel,
  ctaHref,
}: {
  highlight?: boolean;
  disabled?: boolean;
  badge?: string;
  name: string;
  price: string;
  period: string;
  tagline: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <div
      className="rounded-2xl p-8 flex flex-col gap-5 transition-transform duration-base ease-standard hover:-translate-y-0.5"
      style={{
        background: highlight
          ? "linear-gradient(180deg, rgba(156,123,255,0.10), rgba(91,141,239,0.04))"
          : "rgba(255,255,255,0.035)",
        border: highlight
          ? "1px solid rgba(156,123,255,0.32)"
          : "1px solid var(--liriun-border-hi)",
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xl font-semibold tracking-[-0.4px]">{name}</h3>
        {badge && (
          <span className="font-mono text-[11px] uppercase tracking-[1px] text-violet-300 px-2 py-1 rounded-pill border border-violet-500/30">
            {badge}
          </span>
        )}
      </div>

      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-semibold tracking-[-1px] bg-grad-brand bg-clip-text text-transparent">
            {price}
          </span>
          <span className="font-mono text-xs text-muted">{period}</span>
        </div>
        <p className="text-sm text-muted mt-3 leading-[1.55]">{tagline}</p>
      </div>

      <ul className="flex flex-col gap-2.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm text-muted leading-[1.5]">
            <span className="text-violet-300 mt-0.5 shrink-0">✓</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-2">
        {disabled ? (
          <Button variant="secondary" disabled className="w-full justify-center">
            {ctaLabel}
          </Button>
        ) : (
          <Link href={ctaHref} className="block">
            <Button className="w-full justify-center">{ctaLabel}</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
