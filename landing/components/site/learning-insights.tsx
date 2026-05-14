"use client";

import { motion, useReducedMotion } from "framer-motion";

const G = {
  text: "rgba(244,246,252,0.96)",
  muted: "rgba(244,246,252,0.62)",
  faint: "rgba(244,246,252,0.38)",
  border: "rgba(255,255,255,0.07)",
  borderHi: "rgba(255,255,255,0.12)",
  violet300: "#B79CFF",
  grad: "linear-gradient(135deg, #9C7BFF 0%, #5B8DEF 100%)",
};

const INSIGHTS = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.5V12l3 2" />
      </svg>
    ),
    title: "Aprende seus horários",
    desc: "Sabe quando você é mais produtivo, e prioriza tarefas pesadas no seu pico do dia.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6L12 4z" />
      </svg>
    ),
    title: "Entende seu vocabulário",
    desc: '"Marina" automaticamente vira contato. "Acme" vira projeto. "Almoço com mãe" vira pessoal.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 19l14-14M11 5h8v8" />
      </svg>
    ),
    title: "Te conhece com o tempo",
    desc: "Depois de 30 dias, Liriun antecipa lembretes no contexto certo, sem você pedir.",
  },
];

export function LearningInsights() {
  const reduce = useReducedMotion();
  return (
    <section className="py-20 md:py-28 px-6 md:px-14 max-w-[1280px] mx-auto">
      <div className="text-center mb-12 md:mb-16">
        <div
          className="font-mono text-xs uppercase tracking-[1.4px] mb-3"
          style={{ color: G.violet300 }}
        >
          IA QUE APRENDE
        </div>
        <h2
          className="text-[36px] md:text-[52px] font-semibold tracking-[-0.8px] md:tracking-[-1.4px] leading-[1.1]"
          style={{ color: G.text }}
        >
          Não é só um app de tarefa.
          <br />
          <span className="bg-clip-text text-transparent" style={{ backgroundImage: G.grad }}>
            É um agente pessoal.
          </span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
        {INSIGHTS.map((it, i) => (
          <motion.div
            key={it.title}
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 }}
            whileHover={reduce ? undefined : { y: -2 }}
            className="relative overflow-hidden rounded-2xl p-7 md:p-8 transition-shadow"
            style={{
              background:
                "linear-gradient(180deg, rgba(28,30,38,0.96) 0%, rgba(18,20,26,0.96) 100%)",
              border: `1px solid ${G.borderHi}`,
              boxShadow: "0 16px 40px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
          >
            {/* Hairline brand */}
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(156,123,255,0.45) 50%, transparent 100%)",
              }}
            />
            {/* Glow canto */}
            <div
              aria-hidden
              className="absolute -top-12 -right-8 w-40 h-40 rounded-full pointer-events-none"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(156,123,255,0.14) 0%, transparent 70%)",
                filter: "blur(8px)",
              }}
            />

            <div
              className="relative w-12 h-12 rounded-xl grid place-items-center mb-6"
              style={{
                background: G.grad,
                boxShadow:
                  "0 8px 20px rgba(91,141,239,0.30), inset 0 1px 0 rgba(255,255,255,0.20)",
              }}
            >
              {it.icon}
            </div>
            <h3 className="text-xl font-semibold tracking-[-0.3px] leading-snug" style={{ color: G.text }}>
              {it.title}
            </h3>
            <p className="text-sm mt-3 leading-[1.6]" style={{ color: G.muted }}>
              {it.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
