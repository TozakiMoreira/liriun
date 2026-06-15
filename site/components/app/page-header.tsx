export function AppPageHeader({
  kicker,
  title,
  lead,
  actions,
}: {
  kicker?: string;
  title: string;
  lead?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="px-6 md:px-12 pt-10 md:pt-14 pb-8 border-b border-border">
      <div className="max-w-[1080px] mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          {kicker && (
            <div className="font-mono text-xs uppercase tracking-[1.4px] text-violet-300 mb-3">
              {kicker}
            </div>
          )}
          <h1 className="text-3xl md:text-[44px] font-semibold tracking-[-1.2px] leading-[1.1]">
            {title}
          </h1>
          {lead && (
            <p className="text-base text-muted leading-[1.55] mt-3 max-w-[640px]">{lead}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
      </div>
    </header>
  );
}
