import { cn } from "@/lib/utils";

export function Brand({
  size = 28,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className="rounded-md bg-logo-grad grid place-items-center text-white font-bold tracking-tight"
        style={{
          width: size,
          height: size,
          fontSize: size * 0.45,
        }}
        aria-hidden="true"
      >
        J
      </div>
      <span
        className="font-semibold tracking-tight text-text"
        style={{ fontSize: size * 0.6 }}
      >
        Jarvis
      </span>
    </div>
  );
}
