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
  cat: { work: "#7AA9FF", personal: "#C8A0FF", health: "#7BD7B0" },
};

const TASKS = [
  { time: "09:00", task: "Daily standup", state: "done" as const },
  { time: "13:00", task: "Reunião com Marina", state: "current" as const },
  { time: "17:30", task: "Buscar Lucas Jr", state: "pending" as const },
];

export function FooterWidget() {
  const reduce = useReducedMotion();
  return (
    <div
      className="rounded-2xl p-5 max-w-sm relative overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: `1px solid ${G.border}`,
      }}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(156,123,255,0.35) 50%, transparent 100%)",
        }}
      />

      <div
        className="font-mono text-[10px] uppercase tracking-[1.6px] mb-3.5"
        style={{ color: G.faint }}
      >
        Exemplo · Seu dia
      </div>

      <div className="flex flex-col gap-2.5">
        {TASKS.map((t, i) => (
          <motion.div
            key={i}
            initial={reduce ? false : { opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className="flex items-center gap-3"
          >
            <span
              className={`w-3 h-3 rounded-full shrink-0 ${
                t.state === "current" ? "animate-pulse" : ""
              }`}
              style={{
                background:
                  t.state === "done"
                    ? G.grad
                    : t.state === "current"
                      ? "#7BD7B0"
                      : "transparent",
                border: t.state === "pending" ? `1px solid ${G.borderHi}` : "none",
                boxShadow:
                  t.state === "done"
                    ? "0 0 8px rgba(156,123,255,0.45)"
                    : t.state === "current"
                      ? "0 0 8px rgba(123,215,176,0.45)"
                      : "none",
              }}
            />
            <span
              className="text-sm flex-1"
              style={{
                color: t.state === "done" ? G.faint : G.text,
                textDecoration: t.state === "done" ? "line-through" : "none",
              }}
            >
              {t.task}
            </span>
            <span
              className="font-mono text-[10px] tracking-[0.4px]"
              style={{ color: G.faint }}
            >
              {t.time}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
