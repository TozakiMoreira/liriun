import { LiriunLockup } from "@/components/brand/liriun-lockup";
import { IllustrativeBanner } from "@/components/site/illustrative-banner";
import { Link } from "@/i18n/routing";

export function AuthCard({
  title,
  lead,
  children,
  note,
}: {
  title: string;
  lead?: string;
  children: React.ReactNode;
  note?: string;
}) {
  return (
    <>
      <IllustrativeBanner />
      <main
      className="min-h-[calc(100vh-2.5rem)] flex items-center justify-center px-6 py-16"
      style={{
        background:
          "radial-gradient(70% 50% at 80% 0%, rgba(156,123,255,0.16) 0%, transparent 60%), radial-gradient(60% 50% at 10% 80%, rgba(91,141,239,0.12) 0%, transparent 60%), var(--liriun-surface)",
      }}
    >
      <div className="w-full max-w-[420px] text-center">
        <Link href="/" className="inline-flex items-center mb-12" aria-label="Liriun home">
          <LiriunLockup iconSize={56} textSize={32} />
        </Link>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-[-0.6px] leading-[1.15] text-left">
          {title}
        </h1>
        {lead && <p className="text-base text-muted leading-[1.55] mt-3 text-left">{lead}</p>}
        <div className="mt-8 text-left">{children}</div>
        {note && (
          <div
            className="mt-6 text-left rounded-md px-4 py-3 text-xs leading-[1.55] text-muted"
            style={{
              background: "rgba(156,123,255,0.06)",
              border: "1px solid rgba(156,123,255,0.18)",
            }}
          >
            {note}
          </div>
        )}
      </div>
      </main>
    </>
  );
}
