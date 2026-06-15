"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export type Toast = {
  id: number;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

type PushInput = Omit<Toast, "id">;

const DURACAO_MS = 4000;

/**
 * Fila de toasts simples (sem context global). O componente que dispara ações
 * — ex: concluir/reabrir tarefa — chama `push` e renderiza `<ToastViewport>`.
 * Auto-dismiss em 4s; acionar a ação (Desfazer) também dispensa o toast.
 */
export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    setToasts((cur) => cur.filter((t) => t.id !== id));
    const tm = timers.current.get(id);
    if (tm) {
      clearTimeout(tm);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (input: PushInput) => {
      const id = ++idRef.current;
      setToasts((cur) => [...cur, { ...input, id }]);
      const tm = setTimeout(() => dismiss(id), DURACAO_MS);
      timers.current.set(id, tm);
      return id;
    },
    [dismiss],
  );

  // Limpa timers pendentes ao desmontar
  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((tm) => clearTimeout(tm));
      map.clear();
    };
  }, []);

  return { toasts, push, dismiss };
}

export function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div className="fixed top-4 right-4 md:top-6 md:right-6 z-[60] flex flex-col items-end gap-2 pointer-events-none">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: "spring", bounce: 0.28, duration: 0.42 }}
            className="pointer-events-auto flex items-center gap-3 rounded-pill px-4 py-2.5 max-w-[90vw]"
            style={{
              background: "linear-gradient(180deg, rgba(28,30,38,0.97) 0%, rgba(18,20,26,0.97) 100%)",
              border: "1px solid rgba(255,255,255,0.10)",
              boxShadow: "0 16px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
              backdropFilter: "blur(20px)",
            }}
          >
            <span
              aria-hidden
              className="grid place-items-center w-[18px] h-[18px] rounded-pill shrink-0"
              style={{
                background: "var(--liriun-grad-brand)",
                boxShadow: "0 2px 6px rgba(91,141,239,0.35)",
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.5l4.5 4.5L19 7" />
              </svg>
            </span>

            <span className="text-sm font-medium text-text tracking-[-0.1px] whitespace-nowrap">
              {t.message}
            </span>

            {t.actionLabel && t.onAction && (
              <button
                type="button"
                onClick={() => {
                  t.onAction?.();
                  onDismiss(t.id);
                }}
                className="ml-1 text-sm font-semibold text-violet-300 hover:text-violet-200 transition-colors"
              >
                {t.actionLabel}
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
