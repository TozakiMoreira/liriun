"use client";

/**
 * Loader oficial Liriun. Anel girando com gradient brand + glow pulsante.
 * Usar em qualquer estado de loading — substitui spinners genéricos e o "…" ascii.
 */
export function LiriunLoader({
  size = "md",
  label,
  fullscreen = false,
}: {
  size?: "sm" | "md" | "lg";
  label?: string;
  fullscreen?: boolean;
}) {
  const dims = { sm: 28, md: 44, lg: 64 }[size];
  const stroke = { sm: 2.5, md: 3, lg: 3.5 }[size];

  const loader = (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: dims, height: dims }}>
        {/* Glow pulsante atrás */}
        <div
          className="absolute inset-0 rounded-pill"
          style={{
            background: "var(--liriun-grad-brand)",
            filter: "blur(14px)",
            animation: "liriun-pulse-glow 1.6s ease-in-out infinite",
          }}
          aria-hidden
        />
        {/* Anel girando — SVG com gradient conic via stroke-dasharray */}
        <svg
          width={dims}
          height={dims}
          viewBox="0 0 50 50"
          className="relative"
          style={{ animation: "liriun-spin 0.9s linear infinite" }}
          aria-hidden
        >
          <defs>
            <linearGradient id="liriun-loader-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#9C7BFF" />
              <stop offset="100%" stopColor="#5B8DEF" />
            </linearGradient>
          </defs>
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={stroke}
          />
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="url(#liriun-loader-grad)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray="40 86"
          />
        </svg>
      </div>
      {label && (
        <span className="font-mono text-[11px] uppercase tracking-[1.6px] text-muted">
          {label}
        </span>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="min-h-screen grid place-items-center animate-fade-in">{loader}</div>
    );
  }
  return loader;
}
