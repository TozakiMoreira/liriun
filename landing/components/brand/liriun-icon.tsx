type Props = {
  size?: number;
  className?: string;
};

/**
 * Liriun symbol — squircle gradiente. Master mark.
 * Conforme `01-logo/liriun-icon.svg` do brand kit.
 */
export function LiriunIcon({ size = 32, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 1024 1024"
      className={className}
      role="img"
      aria-label="Liriun"
    >
      <defs>
        <linearGradient id="liriunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A88BFF" />
          <stop offset="55%" stopColor="#7C7DF6" />
          <stop offset="100%" stopColor="#5B8DEF" />
        </linearGradient>
      </defs>
      <path
        d="M512 32 C 232 32 32 232 32 512 C 32 792 232 992 512 992 C 792 992 992 792 992 512 C 992 232 792 32 512 32 Z"
        fill="url(#liriunGrad)"
      />
      {/* Five-bar waveform (microfone falando) */}
      <g fill="#FFFFFF" opacity="0.96">
        <rect x="332" y="448" width="48" height="128" rx="12" />
        <rect x="412" y="384" width="48" height="256" rx="12" />
        <rect x="492" y="320" width="48" height="384" rx="12" />
        <rect x="572" y="384" width="48" height="256" rx="12" />
        <rect x="652" y="448" width="48" height="128" rx="12" />
      </g>
    </svg>
  );
}
