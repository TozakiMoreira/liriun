"use client";

import { motion, useReducedMotion } from "framer-motion";

export function ToMoreFormula({ caption }: { caption: string }) {
  const reduceMotion = useReducedMotion();

  const d = (val: number) => (reduceMotion ? 0 : val);

  return (
    <div className="flex flex-col items-center gap-3 mt-12 py-8 select-none">
      <motion.div
        className="flex items-center gap-3 md:gap-5 text-base md:text-lg"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.5 }}
      >
        {/* Pedro: Tozaki — "To" stays bright, "zaki" fades */}
        <motion.span
          variants={{
            hidden: { x: d(-60), opacity: 0 },
            show: { x: 0, opacity: 1, transition: { duration: d(0.7), ease: [0.16, 1, 0.3, 1] } },
          }}
        >
          <span className="text-violet-300 font-semibold">To</span>
          <motion.span
            className="opacity-60"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: [0.6, 0.6, 0.15],
                transition: { duration: d(2.4), times: [0, 0.55, 1], delay: d(0.6) },
              },
            }}
          >
            zaki
          </motion.span>
        </motion.span>

        {/* + */}
        <motion.span
          className="text-faint"
          variants={{
            hidden: { opacity: 0, scale: 0.7 },
            show: { opacity: 1, scale: 1, transition: { duration: d(0.4), delay: d(0.2) } },
          }}
        >
          +
        </motion.span>

        {/* Lucas: Moreira — "More" stays bright, "ira" fades */}
        <motion.span
          variants={{
            hidden: { x: d(60), opacity: 0 },
            show: { x: 0, opacity: 1, transition: { duration: d(0.7), ease: [0.16, 1, 0.3, 1] } },
          }}
        >
          <span className="text-violet-300 font-semibold">More</span>
          <motion.span
            className="opacity-60"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: [0.6, 0.6, 0.15],
                transition: { duration: d(2.4), times: [0, 0.55, 1], delay: d(0.6) },
              },
            }}
          >
            ira
          </motion.span>
        </motion.span>

        {/* = */}
        <motion.span
          className="text-faint"
          variants={{
            hidden: { opacity: 0, scale: 0.7 },
            show: {
              opacity: 1,
              scale: 1,
              transition: { duration: d(0.4), delay: d(1.4) },
            },
          }}
        >
          =
        </motion.span>

        {/* ToMore — appears with glow */}
        <motion.span
          className="text-2xl md:text-[28px] font-bold tracking-[-0.6px] bg-grad-brand bg-clip-text text-transparent"
          variants={{
            hidden: { opacity: 0, scale: 0.85, filter: "drop-shadow(0 0 0 rgba(139,92,246,0))" },
            show: {
              opacity: 1,
              scale: [0.85, 1.15, 1],
              filter: [
                "drop-shadow(0 0 0 rgba(139,92,246,0))",
                "drop-shadow(0 0 18px rgba(139,92,246,0.7))",
                "drop-shadow(0 0 6px rgba(139,92,246,0.35))",
              ],
              transition: { duration: d(1.2), delay: d(1.6), times: [0, 0.55, 1] },
            },
          }}
        >
          ToMore
        </motion.span>
      </motion.div>

      <motion.p
        className="font-mono text-xs text-faint italic mt-2"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1, transition: { duration: d(0.4), delay: d(2.6) } }}
        viewport={{ once: true, amount: 0.5 }}
      >
        {caption}
      </motion.p>
    </div>
  );
}
