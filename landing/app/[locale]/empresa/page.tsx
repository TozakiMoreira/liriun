import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { SiteNav } from "@/components/site/nav";
import { SiteFooter } from "@/components/site/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ToMoreFormula } from "./tomore-formula";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Empresa" });
  return { title: t("title"), description: t("description") };
}

export default async function EmpresaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <EmpresaContent />;
}

function EmpresaContent() {
  const t = useTranslations("Empresa");

  return (
    <main>
      <SiteNav />

      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section
        className="relative pb-20"
        style={{
          background:
            "radial-gradient(70% 50% at 80% 0%, rgba(156,123,255,0.16) 0%, transparent 60%), radial-gradient(60% 50% at 10% 80%, rgba(91,141,239,0.12) 0%, transparent 60%), var(--liriun-surface)",
        }}
      >
        <div className="max-w-[920px] mx-auto px-6 md:px-14 pt-16 md:pt-24">
          <Badge>{t("eyebrow")}</Badge>
          <h1 className="text-4xl md:text-[64px] font-semibold tracking-[-2px] leading-[1.05] mt-6">
            {t("heroLine1")}{" "}
            <span className="bg-grad-brand bg-clip-text text-transparent">{t("heroBrand")}</span>
            {t("heroLine2")}
          </h1>
          <p className="text-lg text-muted leading-[1.65] tracking-[-0.1px] mt-8 max-w-[680px]">
            {t("lead")}
          </p>
        </div>
      </section>

      {/* ─── Founders + To+More animation ────────────────────────── */}
      <section className="max-w-[920px] mx-auto px-6 md:px-14 py-16">
        <div className="font-mono text-xs uppercase tracking-[1.4px] text-violet-300 mb-3">
          {t("founders.eyebrow")}
        </div>
        <h2 className="text-2xl md:text-[36px] font-semibold tracking-[-1px] leading-[1.15]">
          {t("founders.title")}
        </h2>

        <div className="grid sm:grid-cols-2 gap-4 mt-8">
          <FounderCard
            firstName="Pedro"
            lastNameStart="To"
            lastNameRest="zaki"
            photo="/pedro.jpeg"
            role={t("founders.role")}
            bio={t("founders.pedroBio")}
          />
          <FounderCard
            firstName="Lucas"
            lastNameStart="More"
            lastNameRest="ira"
            photo="/lucas.jpg"
            role={t("founders.role")}
            bio={t("founders.lucasBio")}
          />
        </div>

        <ToMoreFormula caption={t("founders.formulaCaption")} />
      </section>

      {/* ─── Missão ─────────────────────────────────────────────── */}
      <section className="max-w-[920px] mx-auto px-6 md:px-14 pb-16">
        <div className="font-mono text-xs uppercase tracking-[1.4px] text-violet-300 mb-3">
          {t("missao.eyebrow")}
        </div>
        <h2 className="text-2xl md:text-[36px] font-semibold tracking-[-1px] leading-[1.15] mb-6">
          {t("missao.title")}
        </h2>
        <p className="text-base text-muted leading-[1.7] mb-4">{t("missao.p1")}</p>
        <p className="text-base text-muted leading-[1.7] mb-4">{t("missao.p2")}</p>
        <p className="text-base text-muted leading-[1.7]">{t("missao.p3")}</p>
      </section>

      {/* ─── Produto ────────────────────────────────────────────── */}
      <section className="max-w-[920px] mx-auto px-6 md:px-14 pb-16">
        <div className="font-mono text-xs uppercase tracking-[1.4px] text-violet-300 mb-3">
          {t("produto.eyebrow")}
        </div>
        <h2 className="text-2xl md:text-[36px] font-semibold tracking-[-1px] leading-[1.15] mb-6">
          {t("produto.titlePrefix")}{" "}
          <span className="bg-grad-brand bg-clip-text text-transparent">
            {t("produto.titleBrand")}
          </span>
          .
        </h2>
        <p className="text-base text-muted leading-[1.7] mb-6">{t("produto.body")}</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/recursos">
            <Button variant="secondary">{t("produto.ctaSobre")}</Button>
          </Link>
          <Link href="/login">
            <Button>{t("produto.ctaSignup")}</Button>
          </Link>
        </div>
      </section>

      {/* ─── Valores ────────────────────────────────────────────── */}
      <section className="max-w-[920px] mx-auto px-6 md:px-14 pb-16">
        <div className="font-mono text-xs uppercase tracking-[1.4px] text-violet-300 mb-3">
          {t("valores.eyebrow")}
        </div>
        <h2 className="text-2xl md:text-[36px] font-semibold tracking-[-1px] leading-[1.15] mb-8">
          {t("valores.title")}
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <ValueCard title={t("valores.v1.title")} body={t("valores.v1.body")} />
          <ValueCard title={t("valores.v2.title")} body={t("valores.v2.body")} />
          <ValueCard title={t("valores.v3.title")} body={t("valores.v3.body")} />
          <ValueCard title={t("valores.v4.title")} body={t("valores.v4.body")} />
        </div>
      </section>

      {/* ─── Contato ────────────────────────────────────────────── */}
      <section className="max-w-[920px] mx-auto px-6 md:px-14 pb-24">
        <div
          className="rounded-2xl p-8 md:p-10"
          style={{
            background: "linear-gradient(180deg, rgba(156,123,255,0.10), rgba(91,141,239,0.04))",
            border: "1px solid rgba(156,123,255,0.28)",
          }}
        >
          <div className="font-mono text-xs uppercase tracking-[1.4px] text-violet-300 mb-3">
            {t("contato.eyebrow")}
          </div>
          <h2 className="text-2xl font-semibold tracking-[-0.6px] mb-4">{t("contato.title")}</h2>
          <p className="text-base text-muted leading-[1.6] mb-6">
            {t("contato.body")}{" "}
            <a
              href="mailto:contato@liriun.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-400 hover:underline"
            >
              contato@liriun.com
            </a>
            .
          </p>
          <a
            href="mailto:contato@liriun.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button>{t("contato.cta")}</Button>
          </a>
          <p className="text-xs text-faint mt-6 pt-4 border-t border-border">
            {t("contato.footer")}
          </p>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function FounderCard({
  firstName,
  lastNameStart,
  lastNameRest,
  photo,
  role,
  bio,
}: {
  firstName: string;
  lastNameStart: string;
  lastNameRest: string;
  photo: string;
  role: string;
  bio: string;
}) {
  return (
    <div
      className="p-6 rounded-2xl border border-border-hi flex flex-col gap-4"
      style={{ background: "rgba(255,255,255,0.035)" }}
    >
      <div className="flex items-center gap-4">
        <img
          src={photo}
          alt={`${firstName} ${lastNameStart}${lastNameRest}`}
          className="w-16 h-16 rounded-pill object-cover border border-border-hi shrink-0"
        />
        <div className="flex flex-col">
          <h3 className="text-base font-semibold tracking-[-0.2px]">
            {firstName}{" "}
            <span className="text-violet-300 font-bold">{lastNameStart}</span>
            <span>{lastNameRest}</span>
          </h3>
          <span className="font-mono text-xs uppercase tracking-[1.2px] text-faint mt-1">
            {role}
          </span>
        </div>
      </div>
      <p className="text-sm text-muted leading-[1.6]">{bio}</p>
    </div>
  );
}

function ValueCard({ title, body }: { title: string; body: string }) {
  return (
    <div
      className="p-6 rounded-2xl border border-border-hi"
      style={{ background: "rgba(255,255,255,0.035)" }}
    >
      <h3 className="text-base font-semibold tracking-[-0.2px] mb-2">{title}</h3>
      <p className="text-sm text-muted leading-[1.6]">{body}</p>
    </div>
  );
}
