export const runtime = "edge";

import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiteNav } from "@/components/site/nav";
import { SiteFooter } from "@/components/site/footer";
import { HeroPhones } from "@/components/site/hero-phones";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HomeContent />;
}

function HomeContent() {
  const tHero = useTranslations("Hero");
  const tRec = useTranslations("Recursos");
  const tStats = useTranslations("Stats");

  return (
    <main>
      <SiteNav />

      {/* ─── Hero ────────────────────────────────────────────────── */}
      <section
        className="relative pt-2 pb-10 md:pb-14"
        style={{
          background:
            "radial-gradient(80% 60% at 80% 0%, rgba(156,123,255,0.18) 0%, transparent 60%), radial-gradient(70% 60% at 10% 80%, rgba(91,141,239,0.14) 0%, transparent 60%), var(--liriun-surface)",
        }}
      >
        <div className="max-w-[1280px] mx-auto px-6 md:px-14">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 md:gap-12 items-center pt-8 md:pt-10">
            <div>
              <Badge>
                <SparkleIcon />
                {tHero("badge")}
              </Badge>
              <h1 className="text-[40px] sm:text-[56px] md:text-[76px] font-semibold tracking-[-1.2px] md:tracking-[-2.4px] leading-[1.05] md:leading-[1.0] mt-[18px] md:mt-[22px]">
                {tHero("title1")}
                <br />
                <span className="bg-grad-brand bg-clip-text text-transparent">
                  {tHero("title2")}
                </span>
              </h1>
              <p className="text-base md:text-[19px] text-muted leading-[1.5] tracking-[-0.1px] max-w-[480px] mt-5 md:mt-[22px]">
                {tHero("lead")}
              </p>
              <div className="flex flex-wrap gap-3 mt-6 md:mt-8">
                <Button>
                  {tHero("ctaPrimary")}
                  <ArrowIcon />
                </Button>
                <Button variant="secondary">
                  <PlayIcon />
                  {tHero("ctaSecondary")}
                </Button>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-6 md:mt-8 font-mono text-xs text-faint tracking-[0.3px]">
                <span>{tHero("rating")}</span>
                <span>{tHero("users")}</span>
              </div>
            </div>

            <HeroPhones />
          </div>
        </div>
      </section>


      {/* ─── Recursos ───────────────────────────────────────────── */}
      <section id="recursos" className="max-w-[1280px] mx-auto px-6 md:px-14 pt-12 md:pt-[72px] pb-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 md:gap-10 mb-8 md:mb-10">
          <div>
            <div className="font-mono text-xs font-medium uppercase tracking-[1.4px] text-violet-300">
              {tRec("kicker")}
            </div>
            <h2 className="text-[32px] md:text-[52px] font-semibold tracking-[-0.8px] md:tracking-[-1.4px] leading-[1.1] md:leading-[1.05] mt-3 md:mt-[14px]">
              {tRec("title1")}
              <br />
              {tRec("title2")}
            </h2>
          </div>
          <p className="text-base text-muted max-w-[380px] leading-[1.5]">
            {tRec("lead")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[22px] pb-8">
          <FeatureCard
            accent
            icon={<MicIcon />}
            title={tRec("voz.title")}
            desc={tRec("voz.desc")}
          />
          <FeatureCard
            icon={<SparkleIcon size={22} color="#C8B6FF" />}
            title={tRec("agente.title")}
            desc={tRec("agente.desc")}
          />
          <FeatureCard
            icon={<DevicesIcon />}
            title={tRec("multi.title")}
            desc={tRec("multi.desc")}
          />
        </div>

        <div
          className="mt-7 p-5 md:p-8 rounded-2xl border border-border-hi grid grid-cols-2 md:grid-cols-4 gap-y-5 gap-x-4 md:gap-7"
          style={{ background: "rgba(255,255,255,0.035)" }}
        >
          {[
            ["12k+", tStats("users")],
            ["98%", tStats("accuracy")],
            ["< 800ms", tStats("latency")],
            ["LGPD", tStats("lgpd")],
          ].map(([n, label]) => (
            <div key={label} className="md:not-first:pl-6 md:not-first:border-l border-border">
              <div className="text-[26px] md:text-[36px] font-semibold tracking-[-0.6px] md:tracking-[-1px] leading-none bg-grad-brand bg-clip-text text-transparent">
                {n}
              </div>
              <div className="font-mono text-[10px] md:text-xs text-muted mt-2 tracking-[0.3px] uppercase">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

/* ─── Feature card ──────────────────────────────────────────── */
function FeatureCard({
  icon,
  title,
  desc,
  accent = false,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  accent?: boolean;
}) {
  return (
    <div
      className="p-5 md:p-7 rounded-2xl backdrop-blur-md"
      style={{
        background: accent
          ? "linear-gradient(180deg, rgba(156,123,255,0.10), rgba(91,141,239,0.04))"
          : "rgba(255,255,255,0.035)",
        border: `1px solid ${accent ? "rgba(156,123,255,0.28)" : "var(--liriun-border-hi)"}`,
      }}
    >
      <div
        className="w-12 h-12 rounded-md grid place-items-center mb-5 md:mb-6"
        style={{
          background: accent ? "var(--liriun-grad-brand)" : "rgba(255,255,255,0.06)",
          border: "1px solid var(--liriun-border-hi)",
          boxShadow: accent ? "0 8px 20px rgba(91,141,239,0.3), inset 0 1px 0 rgba(255,255,255,0.2)" : "none",
        }}
      >
        {icon}
      </div>
      <h3 className="text-xl md:text-[22px] font-semibold tracking-[-0.4px] leading-[1.2] m-0">{title}</h3>
      <p className="text-sm text-muted mt-[10px] leading-[1.55] tracking-[-0.1px]">{desc}</p>
    </div>
  );
}

/* ─── Icons inline ──────────────────────────────────────────── */
function SparkleIcon({ size = 12, color = "#C8B6FF" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="2" strokeLinecap="round">
      <path d="M12 3 L13 10 L20 12 L13 14 L12 21 L11 14 L4 12 L11 10 Z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

function MicIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <line x1="12" y1="18" x2="12" y2="22" />
    </svg>
  );
}

function DevicesIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--liriun-text)" strokeWidth="1.5" strokeLinecap="round">
      <rect x="3.5" y="3" width="11" height="18" rx="2.5" />
      <rect x="16" y="6" width="5" height="15" rx="1.5" />
      <path d="M9 7h.01" />
    </svg>
  );
}
