"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const L = {
  bg: "#0E1014",
  bgTop: "#11141B",
  surface: "rgba(255,255,255,0.035)",
  surfaceHi: "rgba(255,255,255,0.06)",
  border: "rgba(255,255,255,0.07)",
  borderHi: "rgba(255,255,255,0.12)",
  text: "rgba(244,246,252,0.96)",
  textMuted: "rgba(244,246,252,0.62)",
  textFaint: "rgba(244,246,252,0.38)",
  textDim: "rgba(244,246,252,0.24)",
  violet300: "#B79CFF",
  accentGrad: "linear-gradient(135deg, #9C7BFF 0%, #5B8DEF 100%)",
  accentGradSoft: "linear-gradient(135deg, rgba(156,123,255,0.14), rgba(91,141,239,0.10))",
  accentGlow: "radial-gradient(circle at 50% 50%, rgba(156,123,255,0.28), rgba(91,141,239,0) 70%)",
  cat: { work: "#7AA9FF", health: "#7BD7B0", home: "#F0B36E", personal: "#C8A0FF" } as const,
  font: '"Geist", system-ui, -apple-system, sans-serif',
  mono: '"Geist Mono", ui-monospace, monospace',
};

const Icon = {
  mic: (s = 18, c = "currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="3" width="6" height="12" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
    </svg>
  ),
  check: (s = 13, c = "currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
  ),
  flame: (s = 12, c = "currentColor") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3c2 4-3 6-1 11a5 5 0 0 0 10 0c0-3-2-4-3-6 0 0-1 3-3 3-1 0-2-1-2-3 0-2 1-3-1-5z" />
    </svg>
  ),
  waveform: () => (
    <svg width="86" height="22" viewBox="0 0 86 22" fill="none">
      {[3, 7, 12, 5, 9, 14, 8, 4, 11, 6, 3, 8, 12, 5, 9, 14, 8, 4, 11, 6, 3, 7, 11, 6].map((h, i) => (
        <rect key={i} x={i * 3.5} y={11 - h / 2} width="1.6" height={h} rx="0.8" fill="rgba(244,246,252,0.65)" />
      ))}
    </svg>
  ),
};

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "relative",
        width: 300,
        height: 620,
        borderRadius: 44,
        background: "linear-gradient(180deg,#1a1c22 0%,#0c0d11 100%)",
        padding: 6,
        boxShadow:
          "0 50px 100px rgba(0,0,0,0.55), inset 0 0 0 6px #1a1a1c, inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 38,
          overflow: "hidden",
          background: `radial-gradient(120% 60% at 50% -10%, ${L.bgTop} 0%, ${L.bg} 60%)`,
          color: L.text,
          fontFamily: L.font,
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 28px 0",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600 }}>9:41</span>
          <span style={{ fontSize: 14, letterSpacing: 1 }}>•••</span>
        </div>
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: -120,
            left: "50%",
            transform: "translateX(-50%)",
            width: 480,
            height: 320,
            background: L.accentGlow,
            opacity: 0.55,
            pointerEvents: "none",
          }}
        />
        {children}
      </div>
    </div>
  );
}

// ─── 1. Voice Screen ───────────────────────────────────────
function VoiceScreen() {
  return (
    <div style={{ position: "absolute", inset: 0, padding: "60px 22px 30px" }}>
      <div
        style={{
          fontFamily: L.mono,
          fontSize: 10,
          color: L.textFaint,
          letterSpacing: 1.6,
          textTransform: "uppercase",
        }}
      >
        Quinta · 19:24
      </div>
      <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: -0.5, marginTop: 6, lineHeight: 1.1 }}>
        Como posso{" "}
        <span
          style={{
            background: L.accentGrad,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          ajudar?
        </span>
      </div>

      <div style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 10 }}>
        {/* User bubble */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div
            style={{
              maxWidth: "82%",
              background: L.accentGrad,
              padding: "10px 14px",
              borderRadius: "16px 16px 4px 16px",
              fontSize: 12,
              fontWeight: 500,
              color: "#fff",
              lineHeight: 1.35,
              boxShadow: "0 8px 18px rgba(91,141,239,0.30)",
            }}
          >
            &ldquo;Lembre de ligar pro João depois do almoço&rdquo;
          </div>
        </div>

        {/* Liriun processando — waveform pill */}
        <div style={{ display: "flex", justifyContent: "flex-start", marginTop: 4 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              borderRadius: 99,
              background: "rgba(255,255,255,0.05)",
              border: `1px solid ${L.border}`,
            }}
          >
            {Icon.waveform()}
          </div>
        </div>

        {/* Review card */}
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            border: `1px solid ${L.borderHi}`,
            borderRadius: 16,
            padding: 12,
            marginTop: 4,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: -0.2 }}>
            Ligar para o João
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 6,
              fontSize: 10,
              fontFamily: L.mono,
              color: L.textFaint,
              letterSpacing: 0.4,
              textTransform: "uppercase",
            }}
          >
            <span>14:00</span>
            <span>·</span>
            <span style={{ color: L.cat.work }}>TRABALHO</span>
            <span>·</span>
            <span>MÉDIA</span>
          </div>
        </div>
      </div>

      {/* Mic FAB */}
      <div
        style={{
          position: "absolute",
          bottom: 36,
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <div style={{ position: "relative" }}>
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: -12,
              left: "50%",
              transform: "translateX(-50%)",
              width: 100,
              height: 100,
              borderRadius: 99,
              background: "radial-gradient(circle, rgba(156,123,255,0.35) 0%, rgba(91,141,239,0) 65%)",
              filter: "blur(4px)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 99,
              background: L.accentGrad,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow:
                "0 14px 30px rgba(91,141,239,0.45), inset 0 1px 0 rgba(255,255,255,0.3), 0 0 0 5px rgba(255,255,255,0.04)",
              position: "relative",
            }}
          >
            {Icon.mic(24, "#fff")}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 2. Today Screen ───────────────────────────────────────
type Task = {
  title: string;
  cat: string;
  catColor: keyof typeof L.cat;
  time?: string;
  completed?: boolean;
};

const TASKS: Task[] = [
  { title: "Café com Marina", cat: "PESSOAL", catColor: "health", time: "09:00", completed: true },
  { title: "Daily standup", cat: "TRABALHO", catColor: "work", time: "10:30", completed: true },
  { title: "Ligar pro João", cat: "TRABALHO", catColor: "work", time: "14:00" },
  { title: "Revisar proposta", cat: "LIRIUN", catColor: "personal", time: "16:30" },
  { title: "Buscar Lucas Jr", cat: "PESSOAL", catColor: "health", time: "17:30" },
];

function TodayScreen() {
  return (
    <div style={{ position: "absolute", inset: 0, padding: "60px 22px 30px" }}>
      <div
        style={{
          fontFamily: L.mono,
          fontSize: 10,
          color: L.textFaint,
          letterSpacing: 1.6,
          textTransform: "uppercase",
        }}
      >
        Hoje · 5 tarefas · 2 feitas
      </div>
      <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.8, marginTop: 4 }}>Quinta</div>
      <div
        style={{
          fontSize: 13,
          color: L.textMuted,
          marginTop: 6,
          lineHeight: 1.4,
        }}
      >
        <span style={{ color: L.violet300, fontFamily: L.mono, fontSize: 10, letterSpacing: 0.8 }}>LIRIUN</span>{" "}
        sugere começar pelo João — antes da próxima reunião.
      </div>

      <div style={{ marginTop: 22 }}>
        {TASKS.map((t, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "9px 0",
              borderBottom: i < TASKS.length - 1 ? `1px solid rgba(255,255,255,0.04)` : "none",
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 99,
                flexShrink: 0,
                border: t.completed ? "none" : `1.5px solid ${L.borderHi}`,
                background: t.completed ? L.cat[t.catColor] : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: t.completed ? `0 4px 10px ${L.cat[t.catColor]}55` : "none",
              }}
            >
              {t.completed && Icon.check(11, "#fff")}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 12.5,
                  fontWeight: 500,
                  letterSpacing: -0.1,
                  color: t.completed ? L.textFaint : L.text,
                  textDecoration: t.completed ? "line-through" : "none",
                }}
              >
                {t.title}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  marginTop: 2,
                  fontSize: 9,
                  fontFamily: L.mono,
                  color: L.textFaint,
                  letterSpacing: 0.4,
                }}
              >
                {t.time && <span>{t.time}</span>}
                {t.time && <span>·</span>}
                <span style={{ color: t.completed ? L.textDim : L.cat[t.catColor] }}>{t.cat}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 3. Insights Screen ────────────────────────────────────
function InsightsScreen() {
  // Heatmap fake: 5 semanas x 7 dias
  const heat = (e: number) => {
    if (e === 0) return "rgba(255,255,255,0.03)";
    if (e === 1) return "rgba(156,123,255,0.18)";
    if (e === 2) return "rgba(156,123,255,0.38)";
    if (e === 3) return "rgba(156,123,255,0.62)";
    return "rgba(156,123,255,0.92)";
  };
  const days: { d: number | ""; e: number; today?: boolean }[][] = [
    [{ d: "", e: 0 }, { d: "", e: 0 }, { d: 1, e: 2 }, { d: 2, e: 1 }, { d: 3, e: 3 }, { d: 4, e: 2 }, { d: 5, e: 0 }],
    [{ d: 6, e: 1 }, { d: 7, e: 4 }, { d: 8, e: 2 }, { d: 9, e: 3 }, { d: 10, e: 4 }, { d: 11, e: 2 }, { d: 12, e: 0 }],
    [{ d: 13, e: 3, today: true }, { d: 14, e: 0 }, { d: 15, e: 0 }, { d: 16, e: 0 }, { d: 17, e: 0 }, { d: 18, e: 0 }, { d: 19, e: 0 }],
  ];

  return (
    <div style={{ position: "absolute", inset: 0, padding: "60px 22px 30px" }}>
      <div
        style={{
          fontFamily: L.mono,
          fontSize: 10,
          color: L.textFaint,
          letterSpacing: 1.6,
          textTransform: "uppercase",
        }}
      >
        Maio · 12 dias seguidos
      </div>

      {/* Streak hero number */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 6 }}>
        <span
          style={{
            fontSize: 56,
            fontWeight: 700,
            letterSpacing: -2,
            lineHeight: 1,
            background: L.accentGrad,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          12
        </span>
        <span
          style={{
            color: L.violet300,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontFamily: L.mono,
            fontSize: 10,
            letterSpacing: 0.8,
            textTransform: "uppercase",
          }}
        >
          {Icon.flame(13, L.violet300)} STREAK
        </span>
      </div>

      {/* Stats row */}
      <div
        style={{
          marginTop: 20,
          padding: "12px 0",
          borderTop: `1px solid ${L.border}`,
          borderBottom: `1px solid ${L.border}`,
          display: "flex",
        }}
      >
        {[
          ["52", "TAREFAS"],
          ["38", "FEITAS"],
          ["73%", "FOCO"],
        ].map(([n, lab], i) => (
          <div
            key={lab}
            style={{
              flex: 1,
              paddingLeft: i ? 10 : 0,
              paddingRight: i < 2 ? 10 : 0,
              borderLeft: i ? `1px solid ${L.border}` : "none",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: -0.3, lineHeight: 1 }}>{n}</div>
            <div
              style={{
                fontFamily: L.mono,
                fontSize: 8,
                color: L.textFaint,
                marginTop: 3,
                letterSpacing: 0.4,
              }}
            >
              {lab}
            </div>
          </div>
        ))}
      </div>

      {/* Heatmap */}
      <div style={{ marginTop: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6 }}>
          {["D", "S", "T", "Q", "Q", "S", "S"].map((w, i) => (
            <div
              key={i}
              style={{
                fontFamily: L.mono,
                fontSize: 9,
                color: L.textFaint,
                textAlign: "center",
                letterSpacing: 0.4,
              }}
            >
              {w}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {days.map((row, ri) => (
            <div key={ri} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
              {row.map((d, ci) => (
                <div
                  key={ci}
                  style={{
                    aspectRatio: "1",
                    borderRadius: 6,
                    background: d.today ? L.accentGrad : heat(d.e),
                    border: d.today ? "none" : `1px solid ${d.e ? "rgba(156,123,255,0.10)" : L.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: d.today ? "0 6px 14px rgba(91,141,239,0.32)" : "none",
                  }}
                >
                  {d.d !== "" && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: d.today ? 700 : 500,
                        color: d.today ? "#fff" : d.e ? L.text : L.textFaint,
                        letterSpacing: -0.1,
                      }}
                    >
                      {d.d}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Liriun insight callout */}
      <div
        style={{
          marginTop: 16,
          padding: 12,
          borderRadius: 12,
          background: L.accentGradSoft,
          border: "1px solid rgba(156,123,255,0.22)",
        }}
      >
        <div
          style={{
            fontFamily: L.mono,
            fontSize: 9,
            fontWeight: 600,
            color: L.violet300,
            letterSpacing: 1.2,
            textTransform: "uppercase",
          }}
        >
          Liriun aprende
        </div>
        <div style={{ fontSize: 12, color: L.text, fontWeight: 500, marginTop: 5, letterSpacing: -0.1, lineHeight: 1.35 }}>
          Suas terças são as mais produtivas. Continuo agendando o pesado nesse dia.
        </div>
      </div>
    </div>
  );
}

// ─── Carrossel ─────────────────────────────────────────────
const SCREENS = [
  { id: "voice", Component: VoiceScreen, label: "Capture por voz" },
  { id: "today", Component: TodayScreen, label: "Seu dia" },
  { id: "insights", Component: InsightsScreen, label: "Liriun aprende" },
] as const;

const AUTO_MS = 4500;

export function HeroPhoneCarousel() {
  const reduceMotion = useReducedMotion();
  const [idx, setIdx] = React.useState(0);
  const [paused, setPaused] = React.useState(false);

  React.useEffect(() => {
    if (reduceMotion || paused) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % SCREENS.length), AUTO_MS);
    return () => clearInterval(t);
  }, [reduceMotion, paused]);

  const Current = SCREENS[idx].Component;

  return (
    <div
      className="relative h-[640px] hidden lg:flex items-center justify-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Orb glow grande atrás */}
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(156,123,255,0.34) 0%, rgba(91,141,239,0.18) 45%, transparent 75%)",
        }}
      />

      <div className="relative">
        <PhoneFrame>
          <AnimatePresence mode="wait">
            <motion.div
              key={SCREENS[idx].id}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.97, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: -8 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              style={{ position: "absolute", inset: 6, borderRadius: 38, overflow: "hidden" }}
            >
              <Current />
            </motion.div>
          </AnimatePresence>
        </PhoneFrame>

        {/* Indicator dots */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-2 items-center">
          {SCREENS.map((s, i) => {
            const active = i === idx;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setIdx(i)}
                aria-label={s.label}
                className="h-1.5 rounded-full transition-all duration-300 ease-out"
                style={{
                  width: active ? 32 : 6,
                  background: active ? "var(--liriun-grad-brand)" : "rgba(255,255,255,0.20)",
                  boxShadow: active ? "0 0 12px rgba(156,123,255,0.45)" : "none",
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
