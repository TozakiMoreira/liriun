/**
 * Skeleton placeholder com shimmer animado. Use durante load de listas/cards.
 * Reutiliza keyframe `liriun-spin` não — tem própria animação inline via CSS gradient.
 */
export function ShimmerBox({
  width = "100%",
  height,
  rounded = "rounded-md",
  className = "",
}: {
  width?: string | number;
  height: number;
  rounded?: string;
  className?: string;
}) {
  return (
    <div
      style={{ width, height }}
      className={`${rounded} ${className}`}
    >
      <div
        className="w-full h-full rounded-[inherit]"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.10) 50%, rgba(255,255,255,0.04) 100%)",
          backgroundSize: "200% 100%",
          animation: "liriun-shimmer 1.6s linear infinite",
        }}
      />
    </div>
  );
}
