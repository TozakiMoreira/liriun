import { LiriunIcon } from "./liriun-icon";

type Props = {
  iconSize?: number;
  textSize?: number;
  className?: string;
};

export function LiriunLockup({ iconSize = 28, textSize = 17, className }: Props) {
  return (
    <span className={className} style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <LiriunIcon size={iconSize} />
      <span
        style={{
          fontSize: textSize,
          fontWeight: 600,
          letterSpacing: "-0.5px",
          color: "var(--liriun-text)",
        }}
      >
        Liriun
      </span>
    </span>
  );
}
