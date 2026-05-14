import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Link } from "@/i18n/routing";
import { SiteNav } from "@/components/site/nav";
import { SiteFooter } from "@/components/site/footer";

export const runtime = "edge";

type CompetitorSlug = "things-3" | "todoist" | "notion" | "apple-reminders";

type Competitor = {
  slug: CompetitorSlug;
  name: string;
  pros: string[];
  cons: string[];
  features: { name: string; liriun: string | boolean; competitor: string | boolean }[];
  closing: string;
};

const COMPETITORS: Record<CompetitorSlug, Competitor> = {
  "things-3": {
    slug: "things-3",
    name: "Things 3",
    pros: ["Design icônico", "Velocidade nativa Apple", "Setup sem fricção"],
    cons: ["Só iOS / macOS", "Sem voz", "Sem IA", "Sem sync com web ou Android"],
    features: [
      { name: "Captura por voz", liriun: true, competitor: false },
      { name: "IA pra extração", liriun: true, competitor: false },
      { name: "iOS · Android · Web", liriun: true, competitor: "só Apple" },
      { name: "Categorias inteligentes", liriun: true, competitor: "manual" },
      { name: "Preço", liriun: "R$ 19/mês", competitor: "pago único ~R$ 90" },
    ],
    closing:
      "Things 3 é incrível pra quem só usa Apple. Liriun é pra quem vive entre dispositivos.",
  },
  todoist: {
    slug: "todoist",
    name: "Todoist",
    pros: ["Multi-plataforma", "Natural language pra datas", "Templates"],
    cons: ["IA limitada", "Sem agente de voz nativo", "UI carregada"],
    features: [
      { name: "Captura por voz", liriun: true, competitor: "limitada" },
      { name: "Agente conversacional", liriun: true, competitor: false },
      { name: "Aprende seu padrão", liriun: true, competitor: false },
      { name: "Multi-plataforma", liriun: true, competitor: true },
      { name: "Preço Pro", liriun: "R$ 19/mês", competitor: "R$ 25/mês" },
    ],
    closing:
      "Todoist é o veterano. Liriun é o agente moderno — entende o que você fala, não só o que digita.",
  },
  notion: {
    slug: "notion",
    name: "Notion",
    pros: ["Flexível", "Wiki + tarefas", "Bom pra times"],
    cons: ["Lento", "Curva de aprendizado", "Mobile fraco", "Setup pesado"],
    features: [
      { name: "Captura instantânea", liriun: true, competitor: false },
      { name: "IA extrai tarefa de fala", liriun: true, competitor: false },
      { name: "Foco em tarefas pessoais", liriun: true, competitor: "Notion AI add-on" },
      { name: "Performance mobile", liriun: "nativa", competitor: "lenta" },
      { name: "Preço", liriun: "R$ 19/mês", competitor: "R$ 50/mês com AI" },
    ],
    closing:
      "Notion é wiki + projetos. Liriun é organizador pessoal por voz — pegou e foi.",
  },
  "apple-reminders": {
    slug: "apple-reminders",
    name: "Apple Reminders",
    pros: ["Grátis", "Integrado ao Siri", "Simples"],
    cons: ["Só Apple", "IA limitada", "Sem categorias inteligentes", "Sem insights"],
    features: [
      { name: "Captura por voz", liriun: "Gemini multimodal", competitor: "Siri básico" },
      { name: "Multi-plataforma", liriun: true, competitor: "só Apple" },
      { name: "IA aprende padrões", liriun: true, competitor: false },
      { name: "Insights de produtividade", liriun: true, competitor: false },
    ],
    closing:
      "Reminders é suficiente pra recados rápidos. Liriun é pra quem quer um agente que aprende.",
  },
};

const SLUGS = Object.keys(COMPETITORS) as CompetitorSlug[];

function isSlug(v: string): v is CompetitorSlug {
  return (SLUGS as string[]).includes(v);
}

export async function generateStaticParams() {
  return SLUGS.map((competitor) => ({ competitor }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ competitor: string }>;
}): Promise<Metadata> {
  const { competitor } = await params;
  if (!isSlug(competitor)) return {};
  const c = COMPETITORS[competitor];
  return {
    title: `Liriun vs ${c.name} — qual organizador pessoal escolher`,
    description: `Comparativo direto entre Liriun e ${c.name}. ${c.closing}`,
  };
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ competitor: string }>;
}) {
  const { competitor } = await params;
  if (!isSlug(competitor)) notFound();
  const c = COMPETITORS[competitor];

  return (
    <main>
      <SiteNav />

      <section
        className="relative pt-12 md:pt-20 pb-12 md:pb-16 px-6 md:px-14"
        style={{
          background:
            "radial-gradient(70% 50% at 80% 0%, rgba(156,123,255,0.16) 0%, transparent 60%), radial-gradient(60% 50% at 10% 80%, rgba(91,141,239,0.12) 0%, transparent 60%), var(--liriun-surface)",
        }}
      >
        <div className="max-w-[1080px] mx-auto">
          <div className="font-mono text-xs uppercase tracking-[1.4px] text-violet-300 mb-3">
            COMPARATIVO
          </div>
          <h1 className="text-[36px] md:text-[64px] font-semibold tracking-[-1px] md:tracking-[-2px] leading-[1.05]">
            Liriun{" "}
            <span className="text-faint font-normal">vs</span>{" "}
            <span className="bg-grad-brand bg-clip-text text-transparent">{c.name}</span>
          </h1>
          <p className="text-base md:text-[18px] text-muted mt-5 max-w-[520px] leading-[1.5]">
            {c.closing}
          </p>
        </div>
      </section>

      <section className="max-w-[1080px] mx-auto px-6 md:px-14 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card title="Liriun" pros={["iOS · Android · Web", "Captura por voz", "IA que aprende seu padrão", "Categorias automáticas"]} cons={["Mais novo (beta)"]} highlight />
          <Card title={c.name} pros={c.pros} cons={c.cons} />
        </div>

        <div className="mt-12 md:mt-16">
          <div className="font-mono text-[11px] uppercase tracking-[1.6px] text-violet-300 mb-4">
            Lado a lado
          </div>
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid var(--liriun-border-hi)",
            }}
          >
            <div
              className="grid grid-cols-[1.5fr_1fr_1fr] text-xs md:text-sm font-mono uppercase tracking-[1.2px]"
              style={{ background: "rgba(156,123,255,0.06)", color: "var(--liriun-violet-300)" }}
            >
              <div className="px-4 md:px-6 py-3">Recurso</div>
              <div className="px-4 md:px-6 py-3 text-center">Liriun</div>
              <div className="px-4 md:px-6 py-3 text-center">{c.name}</div>
            </div>
            {c.features.map((f, i) => (
              <div
                key={f.name}
                className="grid grid-cols-[1.5fr_1fr_1fr] text-sm items-center"
                style={{ borderTop: i > 0 ? "1px solid var(--liriun-border)" : "none" }}
              >
                <div className="px-4 md:px-6 py-3.5 text-text">{f.name}</div>
                <div className="px-4 md:px-6 py-3.5 text-center">
                  <Mark value={f.liriun} positive />
                </div>
                <div className="px-4 md:px-6 py-3.5 text-center">
                  <Mark value={f.competitor} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 md:mt-16 flex justify-center">
          <Link
            href="/cadastro"
            className="px-6 py-3 rounded-full text-sm font-medium text-white"
            style={{
              background: "var(--liriun-grad-brand)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.18), 0 8px 24px rgba(91,141,239,0.30)",
            }}
          >
            Experimentar Liriun grátis →
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function Card({
  title,
  pros,
  cons,
  highlight = false,
}: {
  title: string;
  pros: string[];
  cons: string[];
  highlight?: boolean;
}) {
  return (
    <div
      className="rounded-2xl p-6 md:p-7 relative overflow-hidden"
      style={{
        background: highlight
          ? "linear-gradient(180deg, rgba(156,123,255,0.10), rgba(91,141,239,0.04))"
          : "rgba(255,255,255,0.035)",
        border: `1px solid ${highlight ? "rgba(156,123,255,0.28)" : "var(--liriun-border-hi)"}`,
      }}
    >
      {highlight && (
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(156,123,255,0.55) 50%, transparent 100%)",
          }}
        />
      )}
      <h3 className="text-2xl font-semibold tracking-[-0.4px]">{title}</h3>

      <div className="font-mono text-[10px] uppercase tracking-[1.6px] text-violet-300 mt-5 mb-2">
        Pontos fortes
      </div>
      <ul className="space-y-1.5">
        {pros.map((p) => (
          <li key={p} className="text-sm text-text flex gap-2.5">
            <span style={{ color: "#7BD7B0" }}>✓</span> {p}
          </li>
        ))}
      </ul>

      <div className="font-mono text-[10px] uppercase tracking-[1.6px] text-faint mt-5 mb-2">
        Limitações
      </div>
      <ul className="space-y-1.5">
        {cons.map((c) => (
          <li key={c} className="text-sm text-muted flex gap-2.5">
            <span className="text-faint">·</span> {c}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Mark({ value, positive = false }: { value: string | boolean; positive?: boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <span style={{ color: positive ? "#7BD7B0" : "var(--liriun-text)" }}>✓</span>
    ) : (
      <span className="text-faint">—</span>
    );
  }
  return (
    <span className="text-text">{value}</span>
  );
}
