"use client";

/**
 * Spinner inline pra dentro de botões durante loading.
 * Substitui o "…" estático. Use direto: `{loading ? <BtnSpinner /> : "Entrar"}`.
 */
export function BtnSpinner({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      role="img"
      style={{ animation: "liriun-spin 0.8s linear infinite" }}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="2.5"
        fill="none"
      />
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="20 50"
        fill="none"
      />
    </svg>
  );
}
