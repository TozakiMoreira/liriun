import type { Metadata } from "next";
import { Link } from "@/i18n/routing";

export const runtime = "edge";

type StreakData = {
  user: string;
  streak: number;
  totalTasks: number;
  focusPct: number;
  bestDay: string;
};

function fetchStreakData(user: string): StreakData {
  let h = 0;
  for (let i = 0; i < user.length; i++) h = (h * 31 + user.charCodeAt(i)) | 0;
  const abs = Math.abs(h);
  return {
    user,
    streak: 5 + (abs % 40),
    totalTasks: 20 + (abs % 200),
    focusPct: 55 + (abs % 40),
    bestDay: ["Seg", "Ter", "Qua", "Qui", "Sex"][abs % 5],
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ user: string }>;
}): Promise<Metadata> {
  const { user } = await params;
  const data = fetchStreakData(user);
  const title = `${user} tem ${data.streak} dias seguidos no Liriun`;
  const description = `${data.totalTasks} tarefas · ${data.focusPct}% de foco · melhor dia: ${data.bestDay}.`;
  const ogUrl = `/api/og/streak/${user}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogUrl],
    },
  };
}

export default async function StreakPage({
  params,
}: {
  params: Promise<{ user: string }>;
}) {
  const { user } = await params;
  const data = fetchStreakData(user);

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center"
      style={{
        background:
          "radial-gradient(60% 60% at 20% 20%, rgba(156,123,255,0.20) 0%, transparent 60%), radial-gradient(50% 50% at 80% 80%, rgba(91,141,239,0.16) 0%, transparent 60%), var(--liriun-bg)",
      }}
    >
      <div className="font-mono text-[11px] uppercase tracking-[1.8px] text-faint mb-3">
        @{user}
      </div>
      <div
        className="text-[140px] md:text-[220px] font-bold leading-none tracking-[-6px] bg-clip-text text-transparent"
        style={{ backgroundImage: "linear-gradient(135deg, #9C7BFF 0%, #5B8DEF 100%)" }}
      >
        {data.streak}
      </div>
      <div className="text-xl md:text-2xl text-muted mt-2">dias seguidos no Liriun</div>

      <div className="flex flex-wrap justify-center gap-x-10 gap-y-5 mt-12 pt-8 border-t border-border max-w-md">
        <Stat n={data.totalTasks.toString()} l="Tarefas" />
        <Stat n={`${data.focusPct}%`} l="Foco" />
        <Stat n={data.bestDay} l="Melhor dia" />
      </div>

      <Link
        href="/cadastro"
        className="mt-12 px-6 py-3 rounded-full text-sm font-medium text-white"
        style={{
          background: "var(--liriun-grad-brand)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.18), 0 8px 24px rgba(91,141,239,0.30)",
        }}
      >
        Comece sua sequência →
      </Link>
    </main>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="text-3xl md:text-4xl font-semibold tracking-[-0.6px]">{n}</div>
      <div className="font-mono text-[10px] uppercase tracking-[1.4px] text-faint mt-1.5">
        {l}
      </div>
    </div>
  );
}
