"use client";

import { motion, useReducedMotion } from "framer-motion";

type Moment = {
  time: string;
  title: string;
  desc: string;
  illustration: React.ReactNode;
};

const G = {
  text: "rgba(244,246,252,0.96)",
  muted: "rgba(244,246,252,0.62)",
  faint: "rgba(244,246,252,0.38)",
  border: "rgba(255,255,255,0.07)",
  borderHi: "rgba(255,255,255,0.12)",
  violet300: "#B79CFF",
  grad: "linear-gradient(135deg, #9C7BFF 0%, #5B8DEF 100%)",
  cat: { work: "#7AA9FF", health: "#7BD7B0", home: "#F0B36E", personal: "#C8A0FF" },
};

function MorningIllustration() {
  return (
    <div
      className="relative w-full aspect-[9/12] rounded-[24px] overflow-hidden p-5 flex flex-col"
      style={{
        background:
          "radial-gradient(120% 80% at 30% 0%, rgba(240,179,110,0.18) 0%, transparent 55%), linear-gradient(180deg, #16181F 0%, #0E1014 100%)",
        border: `1px solid ${G.borderHi}`,
        boxShadow: "0 16px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      <div className="font-mono text-[10px] uppercase tracking-[1.6px]" style={{ color: G.faint }}>
        Quinta · 07:42
      </div>
      <div className="text-[22px] font-semibold tracking-[-0.4px] mt-1" style={{ color: G.text }}>
        Bom dia, Lucas.
      </div>

      {/* Day shape — barra horizontal mostrando o dia */}
      <div className="mt-4">
        <div className="font-mono text-[9px] uppercase tracking-[1.4px] mb-2" style={{ color: G.faint }}>
          Seu dia
        </div>
        <div className="relative h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ width: "8%", background: G.grad, boxShadow: "0 0 8px rgba(156,123,255,0.5)" }}
          />
          <div className="absolute inset-y-0 left-[28%] w-[3px]" style={{ background: G.cat.work }} />
          <div className="absolute inset-y-0 left-[48%] w-[3px]" style={{ background: G.cat.work }} />
          <div className="absolute inset-y-0 left-[72%] w-[3px]" style={{ background: G.cat.personal }} />
        </div>
        <div className="flex justify-between mt-1.5 font-mono text-[8px]" style={{ color: G.faint }}>
          <span>7H</span>
          <span>12H</span>
          <span>18H</span>
          <span>23H</span>
        </div>
      </div>

      {/* Liriun suggestion */}
      <div
        className="mt-5 p-3 rounded-xl"
        style={{
          background: "linear-gradient(135deg, rgba(156,123,255,0.14), rgba(91,141,239,0.08))",
          border: "1px solid rgba(156,123,255,0.22)",
        }}
      >
        <div
          className="font-mono text-[9px] font-semibold uppercase tracking-[1.4px]"
          style={{ color: G.violet300 }}
        >
          Liriun sugere
        </div>
        <div className="text-[12px] font-medium mt-1.5 leading-snug" style={{ color: G.text }}>
          Comece pela revisão — você é mais focado de manhã.
        </div>
      </div>

      {/* Mini tasks preview */}
      <div className="mt-auto flex flex-col gap-1.5">
        {[
          { t: "Revisar proposta", c: "TRABALHO", color: G.cat.work },
          { t: "Daily standup", c: "TRABALHO", color: G.cat.work },
          { t: "Almoço com Marina", c: "PESSOAL", color: G.cat.health },
        ].map((it) => (
          <div key={it.t} className="flex items-center gap-2.5">
            <span
              className="w-[14px] h-[14px] rounded-full"
              style={{ border: `1.5px solid rgba(255,255,255,0.18)` }}
            />
            <span className="text-[11px]" style={{ color: G.text }}>
              {it.t}
            </span>
            <span
              className="ml-auto font-mono text-[8px] uppercase tracking-[0.6px]"
              style={{ color: it.color }}
            >
              {it.c}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiddayIllustration() {
  return (
    <div
      className="relative w-full aspect-[9/12] rounded-[24px] overflow-hidden p-5 flex flex-col"
      style={{
        background:
          "radial-gradient(120% 80% at 50% 0%, rgba(156,123,255,0.15) 0%, transparent 60%), linear-gradient(180deg, #16181F 0%, #0E1014 100%)",
        border: `1px solid ${G.borderHi}`,
        boxShadow: "0 16px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      <div className="font-mono text-[10px] uppercase tracking-[1.6px]" style={{ color: G.faint }}>
        Quinta · 13:08
      </div>

      {/* Progress ring */}
      <div className="flex items-center gap-4 mt-3">
        <svg width="76" height="76" viewBox="0 0 100 100" className="shrink-0">
          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="9" />
          <defs>
            <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#9C7BFF" />
              <stop offset="100%" stopColor="#5B8DEF" />
            </linearGradient>
          </defs>
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="url(#ring-grad)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={`${0.62 * 2 * Math.PI * 42} ${2 * Math.PI * 42}`}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div>
          <div className="text-[28px] font-semibold tracking-[-0.6px] leading-none" style={{ color: G.text }}>
            5/8
          </div>
          <div className="font-mono text-[9px] uppercase tracking-[1.4px] mt-1.5" style={{ color: G.faint }}>
            Tarefas feitas hoje
          </div>
        </div>
      </div>

      {/* Current focus */}
      <div className="mt-5 flex-1 flex flex-col">
        <div className="font-mono text-[9px] uppercase tracking-[1.4px] mb-2" style={{ color: G.faint }}>
          Agora
        </div>
        <div
          className="p-3 rounded-xl"
          style={{
            background: G.grad,
            boxShadow: "0 10px 24px rgba(91,141,239,0.32), inset 0 1px 0 rgba(255,255,255,0.18)",
          }}
        >
          <div className="text-[13px] font-semibold tracking-[-0.2px]" style={{ color: "#fff" }}>
            Ligar pro João
          </div>
          <div
            className="font-mono text-[10px] uppercase tracking-[1.2px] mt-1"
            style={{ color: "rgba(255,255,255,0.78)" }}
          >
            13:30 · Trabalho
          </div>
        </div>
        <div className="font-mono text-[9px] uppercase tracking-[1.4px] mt-4 mb-2" style={{ color: G.faint }}>
          Próximas
        </div>
        <div className="space-y-1.5">
          {[
            { t: "Revisar proposta", time: "16:30" },
            { t: "Buscar Lucas Jr", time: "17:30" },
          ].map((it) => (
            <div key={it.t} className="flex items-center gap-2.5 text-[11px]" style={{ color: G.text }}>
              <span
                className="w-[12px] h-[12px] rounded-full"
                style={{ border: `1.5px solid rgba(255,255,255,0.18)` }}
              />
              <span>{it.t}</span>
              <span className="ml-auto font-mono text-[9px]" style={{ color: G.faint }}>
                {it.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EveningIllustration() {
  return (
    <div
      className="relative w-full aspect-[9/12] rounded-[24px] overflow-hidden p-5 flex flex-col"
      style={{
        background:
          "radial-gradient(120% 80% at 70% 100%, rgba(91,141,239,0.18) 0%, transparent 55%), linear-gradient(180deg, #16181F 0%, #0E1014 100%)",
        border: `1px solid ${G.borderHi}`,
        boxShadow: "0 16px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      <div className="font-mono text-[10px] uppercase tracking-[1.6px]" style={{ color: G.faint }}>
        Quinta · 22:10
      </div>
      <div className="text-[22px] font-semibold tracking-[-0.4px] mt-1" style={{ color: G.text }}>
        Bom trabalho hoje.
      </div>

      {/* Stamp — circular badge */}
      <div className="flex justify-center my-6">
        <div
          className="relative w-28 h-28 rounded-full grid place-items-center"
          style={{
            background: "linear-gradient(135deg, rgba(156,123,255,0.20), rgba(91,141,239,0.10))",
            border: "1px solid rgba(156,123,255,0.30)",
          }}
        >
          <div
            className="absolute inset-2 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(156,123,255,0.18) 0%, transparent 70%)",
            }}
          />
          <div className="relative text-center">
            <div
              className="text-[36px] font-bold leading-none tracking-[-1.6px]"
              style={{
                background: G.grad,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              6/8
            </div>
            <div
              className="font-mono text-[8px] uppercase tracking-[1.4px] mt-1"
              style={{ color: G.violet300 }}
            >
              Feitas
            </div>
          </div>
        </div>
      </div>

      {/* Leftovers / gentle */}
      <div
        className="mt-auto p-3 rounded-xl"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="font-mono text-[9px] uppercase tracking-[1.4px]" style={{ color: G.faint }}>
          2 ficaram pra amanhã
        </div>
        <div className="text-[12px] mt-1.5 leading-snug" style={{ color: G.muted }}>
          Realoquei sem pressa. Sua semana ainda é leve.
        </div>
      </div>
    </div>
  );
}

const MOMENTS: Moment[] = [
  {
    time: "MANHÃ",
    title: "Você acorda com clareza.",
    desc: "Liriun mostra o dia inteiro de uma vez. Sugere o que importa agora.",
    illustration: <MorningIllustration />,
  },
  {
    time: "MEIO-DIA",
    title: "Mantém o ritmo.",
    desc: "Progress ring + sugestão contextual baseada no que ainda falta.",
    illustration: <MiddayIllustration />,
  },
  {
    time: "NOITE",
    title: "Reflete, sem culpa.",
    desc: "O dia em uma stamp visual. O que ficou pra depois é tratado com gentileza.",
    illustration: <EveningIllustration />,
  },
];

export function DayStory() {
  const reduce = useReducedMotion();
  return (
    <section className="py-20 md:py-28 px-6 md:px-14 max-w-[1280px] mx-auto">
      <div className="mb-12 md:mb-16">
        <div className="font-mono text-xs uppercase tracking-[1.4px]" style={{ color: G.violet300 }}>
          O DIA
        </div>
        <h2 className="text-[36px] md:text-[52px] font-semibold tracking-[-0.8px] md:tracking-[-1.4px] leading-[1.1] mt-3 max-w-[680px]">
          Liriun te acompanha{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: G.grad }}
          >
            do nascer ao pôr do sol.
          </span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {MOMENTS.map((m, i) => (
          <motion.div
            key={m.time}
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: i * 0.12 }}
          >
            <div className="mb-5">{m.illustration}</div>
            <div
              className="font-mono text-[10px] uppercase tracking-[1.6px] mb-2"
              style={{ color: G.violet300 }}
            >
              {m.time}
            </div>
            <h3 className="text-[20px] md:text-[22px] font-semibold tracking-[-0.3px] mb-2.5" style={{ color: G.text }}>
              {m.title}
            </h3>
            <p className="text-sm leading-[1.55]" style={{ color: G.muted }}>
              {m.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
