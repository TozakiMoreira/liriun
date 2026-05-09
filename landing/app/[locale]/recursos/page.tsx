export const runtime = "edge";

import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { SiteNav } from "@/components/site/nav";
import { SiteFooter } from "@/components/site/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "RecursosPage" });
  return { title: t("title"), description: t("description") };
}

export default async function RecursosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <RecursosContent />;
}

function RecursosContent() {
  const t = useTranslations("RecursosPage");

  return (
    <main>
      <SiteNav />

      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section
        className="relative pb-24 md:pb-32 overflow-hidden"
        style={{
          background:
            "radial-gradient(70% 50% at 80% 0%, rgba(156,123,255,0.18) 0%, transparent 60%), radial-gradient(60% 50% at 10% 80%, rgba(91,141,239,0.12) 0%, transparent 60%), var(--liriun-surface)",
        }}
      >
        <div className="max-w-[1080px] mx-auto px-6 md:px-14 pt-20 md:pt-28 text-center">
          <Badge>{t("kicker")}</Badge>
          <h1 className="text-5xl md:text-[88px] font-semibold tracking-[-2.6px] leading-[1.0] mt-8">
            {t("heroLine1")}
            <br />
            <span className="bg-grad-brand bg-clip-text text-transparent">{t("heroLine2")}</span>
          </h1>
          <p className="text-lg md:text-xl text-muted leading-[1.55] tracking-[-0.1px] mt-8 max-w-[640px] mx-auto">
            {t("lead")}
          </p>
        </div>
      </section>

      {/* ─── 4 momentos do produto ─────────────────────────────── */}
      <Moment
        kicker={t("voz.kicker")}
        title={t("voz.title")}
        lead={t("voz.lead")}
        ornament={<Waveform />}
        align="left"
      />

      <Moment
        kicker={t("agente.kicker")}
        title={t("agente.title")}
        lead={t("agente.lead")}
        ornament={<Sparkle />}
        align="right"
      />

      <Moment
        kicker={t("organizacao.kicker")}
        title={t("organizacao.title")}
        lead={t("organizacao.lead")}
        ornament={<ThreeDots />}
        align="left"
      />

      <Moment
        kicker={t("privacidade.kicker")}
        title={t("privacidade.title")}
        lead={t("privacidade.lead")}
        ornament={<Shield />}
        align="right"
        last
      />

      {/* ─── CTA ───────────────────────────────────────────────── */}
      <section className="px-6 md:px-14 py-24 md:py-32">
        <div
          className="max-w-[920px] mx-auto rounded-[28px] p-10 md:p-14 text-center"
          style={{
            background: "linear-gradient(180deg, rgba(156,123,255,0.10), rgba(91,141,239,0.04))",
            border: "1px solid rgba(156,123,255,0.28)",
          }}
        >
          <h2 className="text-3xl md:text-[52px] font-semibold tracking-[-1.4px] leading-[1.05]">
            {t("ctaTitle")}
          </h2>
          <p className="text-base text-muted leading-[1.55] mt-4">{t("ctaLead")}</p>
          <Link href="/cadastro" className="inline-block mt-8">
            <Button>{t("ctaButton")}</Button>
          </Link>
        </div>
      </section>

      <SiteFooter showCta={false} />
    </main>
  );
}

function Moment({
  kicker,
  title,
  lead,
  ornament,
  align,
  last = false,
}: {
  kicker: string;
  title: string;
  lead: string;
  ornament: React.ReactNode;
  align: "left" | "right";
  last?: boolean;
}) {
  return (
    <section
      className="relative px-6 md:px-14 py-20 md:py-28"
      style={{
        borderBottom: last ? undefined : "1px solid var(--liriun-border)",
      }}
    >
      <div
        className={`max-w-[1080px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center ${
          align === "right" ? "lg:[&>*:first-child]:order-2" : ""
        }`}
      >
        {/* Texto */}
        <div>
          <div className="font-mono text-xs uppercase tracking-[1.4px] text-violet-300 mb-4">
            {kicker}
          </div>
          <h2 className="text-3xl md:text-[52px] font-semibold tracking-[-1.4px] leading-[1.05]">
            {title}
          </h2>
          <p className="text-lg text-muted leading-[1.6] tracking-[-0.1px] mt-6 max-w-[480px]">
            {lead}
          </p>
        </div>

        {/* Ornamento visual */}
        <div className="relative h-[280px] md:h-[360px] flex items-center justify-center">
          <div
            aria-hidden
            className="absolute inset-0 rounded-2xl"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(156,123,255,0.22), rgba(91,141,239,0.08) 50%, transparent 75%)",
              filter: "blur(8px)",
            }}
          />
          <div className="relative z-10">{ornament}</div>
        </div>
      </div>
    </section>
  );
}

function Waveform() {
  // 5-bar waveform (brand glyph)
  const bars = [54, 96, 144, 96, 54];
  return (
    <svg width="240" height="160" viewBox="0 0 240 160" fill="none" aria-hidden>
      <defs>
        <linearGradient id="grad-wave" x1="0" y1="0" x2="240" y2="160">
          <stop offset="0%" stopColor="#A88BFF" />
          <stop offset="55%" stopColor="#7C7DF6" />
          <stop offset="100%" stopColor="#5B8DEF" />
        </linearGradient>
      </defs>
      {bars.map((h, i) => (
        <rect
          key={i}
          x={20 + i * 44}
          y={80 - h / 2}
          width="24"
          height={h}
          rx="6"
          fill="url(#grad-wave)"
        />
      ))}
    </svg>
  );
}

function Sparkle() {
  return (
    <svg width="200" height="200" viewBox="0 0 200 200" fill="none" aria-hidden>
      <defs>
        <linearGradient id="grad-sparkle" x1="0" y1="0" x2="200" y2="200">
          <stop offset="0%" stopColor="#A88BFF" />
          <stop offset="100%" stopColor="#5B8DEF" />
        </linearGradient>
      </defs>
      <path
        d="M100 20 L116 84 L180 100 L116 116 L100 180 L84 116 L20 100 L84 84 Z"
        fill="url(#grad-sparkle)"
      />
      <path
        d="M155 30 L162 50 L182 57 L162 64 L155 84 L148 64 L128 57 L148 50 Z"
        fill="url(#grad-sparkle)"
        opacity="0.6"
      />
    </svg>
  );
}

function ThreeDots() {
  return (
    <svg width="240" height="160" viewBox="0 0 240 160" fill="none" aria-hidden>
      <defs>
        <linearGradient id="grad-dots" x1="0" y1="0" x2="240" y2="160">
          <stop offset="0%" stopColor="#A88BFF" />
          <stop offset="100%" stopColor="#5B8DEF" />
        </linearGradient>
      </defs>
      <rect x="20" y="20" width="60" height="60" rx="14" fill="url(#grad-dots)" opacity="0.95" />
      <rect x="90" y="20" width="60" height="120" rx="14" fill="url(#grad-dots)" opacity="0.65" />
      <rect x="160" y="20" width="60" height="60" rx="14" fill="url(#grad-dots)" opacity="0.4" />
      <rect x="20" y="90" width="60" height="50" rx="14" fill="url(#grad-dots)" opacity="0.3" />
      <rect x="160" y="90" width="60" height="50" rx="14" fill="url(#grad-dots)" opacity="0.5" />
    </svg>
  );
}

function Shield() {
  return (
    <svg width="180" height="200" viewBox="0 0 180 200" fill="none" aria-hidden>
      <defs>
        <linearGradient id="grad-shield" x1="0" y1="0" x2="180" y2="200">
          <stop offset="0%" stopColor="#A88BFF" />
          <stop offset="100%" stopColor="#5B8DEF" />
        </linearGradient>
      </defs>
      <path
        d="M90 12 L156 38 L156 100 C156 144 128 174 90 188 C52 174 24 144 24 100 L24 38 Z"
        fill="url(#grad-shield)"
        opacity="0.9"
      />
      <path
        d="M62 100 L82 120 L122 78"
        stroke="#fff"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
