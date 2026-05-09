import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteNav } from "@/components/site/nav";
import { SiteFooter } from "@/components/site/footer";
import { Prose, ProseNote } from "@/components/site/prose";
import { PrivacidadeBodyPT } from "./body-pt";
import { PrivacidadeBodyEN } from "./body-en";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Privacidade" });
  return { title: t("title"), description: t("description") };
}

export default async function PrivacidadePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Privacidade" });

  return (
    <main>
      <SiteNav />

      <Prose>
        <h1>{t("title")}</h1>
        <p className="font-mono text-xs text-faint uppercase tracking-[1.2px]">
          {t("lastUpdate")}
        </p>

        <ProseNote>{t("notice")}</ProseNote>

        {locale === "en" ? <PrivacidadeBodyEN /> : <PrivacidadeBodyPT />}
      </Prose>

      <SiteFooter showCta={false} />
    </main>
  );
}
