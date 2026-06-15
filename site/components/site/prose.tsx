import * as React from "react";
import { cn } from "@/lib/cn";

export function Prose({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <article
      className={cn(
        "max-w-3xl mx-auto px-6 md:px-14 py-12 md:py-16 flex flex-col gap-6",
        "text-base text-muted leading-[1.7] tracking-[-0.05px]",
        "[&>h1]:text-text [&>h1]:text-3xl [&>h1]:md:text-4xl [&>h1]:font-semibold [&>h1]:tracking-[-1px] [&>h1]:leading-[1.1] [&>h1]:mb-2",
        "[&>h2]:text-text [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:tracking-[-0.4px] [&>h2]:mt-8 [&>h2]:mb-1",
        "[&>h3]:text-text [&>h3]:text-base [&>h3]:font-semibold [&>h3]:mt-4",
        "[&_strong]:text-text [&_strong]:font-semibold",
        "[&_a]:text-violet-400 [&_a]:underline-offset-2 hover:[&_a]:underline",
        "[&>ul]:list-disc [&>ul]:pl-6 [&>ul]:flex [&>ul]:flex-col [&>ul]:gap-1",
        "[&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:flex [&>ol]:flex-col [&>ol]:gap-1",
        className,
      )}
      {...props}
    >
      {children}
    </article>
  );
}

export function ProseNote({ children }: { children: React.ReactNode }) {
  return (
    <aside
      className="rounded-md border border-warning/30 px-4 py-3 text-sm text-muted leading-[1.6]"
      style={{ background: "rgba(240,179,110,0.06)" }}
    >
      <strong className="text-warning">Aviso · </strong>
      {children}
    </aside>
  );
}
