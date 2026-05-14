import { ImageResponse } from "next/og";

export const runtime = "edge";

type StreakData = {
  user: string;
  streak: number;
  totalTasks: number;
  focusPct: number;
  bestDay: string;
};

// Em prod, buscar de DB/Redis. Por ora, dados consistentes por user via hash.
function fetchStreakData(user: string): StreakData {
  let h = 0;
  for (let i = 0; i < user.length; i++) h = (h * 31 + user.charCodeAt(i)) | 0;
  const abs = Math.abs(h);
  const streak = 5 + (abs % 40);
  const totalTasks = 20 + (abs % 200);
  const focusPct = 55 + (abs % 40);
  const days = ["Seg", "Ter", "Qua", "Qui", "Sex"];
  const bestDay = days[abs % days.length];
  return { user, streak, totalTasks, focusPct, bestDay };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ user: string }> },
) {
  const { user } = await params;
  const data = fetchStreakData(user);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(60% 60% at 20% 20%, rgba(156,123,255,0.30) 0%, transparent 60%), radial-gradient(50% 50% at 80% 80%, rgba(91,141,239,0.22) 0%, transparent 60%), linear-gradient(135deg, #1a1429 0%, #0E1014 60%, #0a0d18 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "sans-serif",
          position: "relative",
          color: "rgba(244,246,252,0.96)",
        }}
      >
        {/* Hairline brand topo */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background:
              "linear-gradient(90deg, transparent 0%, rgba(156,123,255,0.55) 30%, rgba(91,141,239,0.55) 70%, transparent 100%)",
            display: "flex",
          }}
        />

        {/* Username kicker */}
        <div
          style={{
            fontSize: 18,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "rgba(244,246,252,0.45)",
            display: "flex",
          }}
        >
          @{data.user}
        </div>

        {/* Hero streak number */}
        <div
          style={{
            fontSize: 280,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: -10,
            backgroundImage: "linear-gradient(135deg, #9C7BFF 0%, #5B8DEF 100%)",
            backgroundClip: "text",
            color: "transparent",
            marginTop: 8,
            display: "flex",
          }}
        >
          {data.streak}
        </div>
        <div
          style={{
            fontSize: 30,
            color: "rgba(244,246,252,0.62)",
            marginTop: -8,
            display: "flex",
          }}
        >
          dias seguidos
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            gap: 70,
            marginTop: 60,
            paddingTop: 30,
            paddingLeft: 60,
            paddingRight: 60,
            borderTop: "1px solid rgba(255,255,255,0.10)",
          }}
        >
          <Stat n={data.totalTasks.toString()} l="TAREFAS" />
          <Stat n={`${data.focusPct}%`} l="FOCO" />
          <Stat n={data.bestDay} l="MELHOR DIA" />
        </div>

        {/* Mark + tagline */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 999,
              background:
                "linear-gradient(135deg, #9C7BFF 0%, #5B8DEF 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 6px 18px rgba(91,141,239,0.40)",
            }}
          >
            <div style={{ color: "#fff", fontSize: 18, fontWeight: 700, display: "flex" }}>L</div>
          </div>
          <div style={{ fontSize: 18, color: "rgba(244,246,252,0.78)", display: "flex" }}>
            Liriun · liriun.com
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ fontSize: 56, fontWeight: 600, letterSpacing: -2, color: "rgba(244,246,252,0.96)", display: "flex" }}>
        {n}
      </div>
      <div
        style={{
          fontSize: 14,
          letterSpacing: 3,
          marginTop: 6,
          color: "rgba(244,246,252,0.48)",
          display: "flex",
        }}
      >
        {l}
      </div>
    </div>
  );
}
