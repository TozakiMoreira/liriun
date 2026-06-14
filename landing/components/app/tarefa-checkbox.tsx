"use client";

/**
 * Bolinha de concluir/reabrir reutilizável, com tooltip no hover.
 * Usada nas listas (TarefaRow) e no card destacado da tela Hoje.
 */
export function TarefaCheckbox({
  concluida,
  atrasada = false,
  onToggle,
}: {
  concluida: boolean;
  atrasada?: boolean;
  onToggle: () => void;
}) {
  const label = concluida ? "Reabrir" : "Concluir";
  return (
    <span className="relative group/check inline-flex shrink-0">
      <button
        type="button"
        onClick={onToggle}
        aria-label={concluida ? "Reabrir tarefa" : "Concluir tarefa"}
        className="relative w-[22px] h-[22px] rounded-pill grid place-items-center transition-all duration-150 hover:scale-105 active:scale-90"
        style={{
          border: concluida
            ? "none"
            : `1.5px solid ${atrasada ? "rgba(255,185,154,0.65)" : "var(--liriun-border-hi)"}`,
          background: concluida ? "var(--liriun-grad-brand)" : "transparent",
          boxShadow: concluida ? "0 4px 10px rgba(91,141,239,0.3)" : "none",
        }}
      >
        {concluida ? (
          <>
            {/* Check sólido — some no hover */}
            <span className="absolute inset-0 grid place-items-center transition-opacity duration-150 group-hover/check:opacity-0">
              <CheckIcon color="#fff" />
            </span>
            {/* Desfazer — aparece no hover (sinaliza reabrir) */}
            <span className="absolute inset-0 grid place-items-center opacity-0 scale-75 transition-all duration-150 group-hover/check:opacity-100 group-hover/check:scale-100">
              <UndoIcon color="#fff" />
            </span>
          </>
        ) : (
          /* Prévia de check — fraca, aparece no hover (sinaliza concluir) */
          <span className="absolute inset-0 grid place-items-center opacity-0 scale-50 transition-all duration-150 group-hover/check:opacity-60 group-hover/check:scale-100">
            <CheckIcon color={atrasada ? "#FFB99A" : "#B79CFF"} />
          </span>
        )}
      </button>

      {/* Tooltip */}
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 rounded-md text-[11px] font-medium whitespace-nowrap opacity-0 translate-y-1 transition-all duration-150 group-hover/check:opacity-100 group-hover/check:translate-y-0 z-50"
        style={{
          background: "rgba(20,22,28,0.98)",
          border: "1px solid var(--liriun-border-hi)",
          color: "var(--liriun-text)",
          boxShadow: "0 6px 16px rgba(0,0,0,0.45)",
        }}
      >
        {label}
      </span>
    </span>
  );
}

function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
  );
}

function UndoIcon({ color }: { color: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 14L4 9l5-5" />
      <path d="M4 9h11a5 5 0 0 1 0 10h-4" />
    </svg>
  );
}
