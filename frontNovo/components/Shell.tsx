"use client";

import {
  Bolt,
  CheckCircle2,
  ListChecks,
  LogOut,
  Settings,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Brand } from "@/components/Brand";
import { useAuthStore } from "@/stores/auth";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  shortLabel?: string;
  icon: LucideIcon;
  group: "principal" | "ajustes";
}

const NAV: NavItem[] = [
  { href: "/captura", label: "Captura Rápida", shortLabel: "Captura", icon: Bolt, group: "principal" },
  { href: "/tarefas", label: "Minhas Tarefas", shortLabel: "Tarefas", icon: ListChecks, group: "principal" },
  { href: "/concluidas", label: "Concluídas", icon: CheckCircle2, group: "principal" },
  { href: "/configuracoes", label: "Configurações", shortLabel: "Ajustes", icon: Settings, group: "ajustes" },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const usuario = useAuthStore((s) => s.usuario);
  const clear = useAuthStore((s) => s.clear);

  const sair = () => {
    clear();
    router.replace("/login");
  };

  const inicial = (usuario?.nome ?? "?").charAt(0).toUpperCase();

  return (
    <div className="flex flex-col md:grid md:grid-cols-[232px_1fr] min-h-screen bg-bg text-text">
      {/* Topbar mobile */}
      <header
        className="md:hidden flex items-center justify-between h-12 px-4 border-b border-border bg-bg-surface"
        data-testid="mobile-topbar"
      >
        <Brand size={24} />
        <button
          type="button"
          className="flex items-center gap-1.5 text-text-dim hover:text-text text-xs px-2 py-1"
          onClick={sair}
        >
          <span>{usuario?.nome}</span>
          <LogOut className="h-3 w-3" />
        </button>
      </header>

      {/* Sidebar desktop */}
      <aside className="hidden md:flex bg-bg-surface border-r border-border flex-col p-4">
        <div className="px-2 py-1.5 mb-5">
          <Brand size={24} />
        </div>

        <NavGroup label="Principal" items={NAV.filter((n) => n.group === "principal")} pathname={pathname} />
        <NavGroup label="Ajustes" items={NAV.filter((n) => n.group === "ajustes")} pathname={pathname} className="mt-4" />

        <div className="mt-auto border-t border-border pt-3">
          <button
            type="button"
            onClick={sair}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-bg-elev cursor-pointer w-full group"
          >
            <div
              className="w-6 h-6 rounded-full grid place-items-center text-[11px] font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899)" }}
            >
              {inicial}
            </div>
            <span className="text-[13px] font-medium flex-1 text-left text-text">
              {usuario?.nome}
            </span>
            <LogOut className="h-3.5 w-3.5 text-text-subtle group-hover:text-text-dim" />
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex flex-col min-w-0 flex-1 pb-16 md:pb-0">{children}</main>

      {/* Bottom nav mobile */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 grid grid-cols-4 h-16 bg-bg-surface border-t border-border z-40"
        data-testid="mobile-bottom-nav"
      >
        {NAV.map((item) => {
          const ativo =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 active:bg-bg-elev",
                ativo ? "text-accent" : "text-text-dim",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">
                {item.shortLabel ?? item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function NavGroup({
  label,
  items,
  pathname,
  className,
}: {
  label: string;
  items: NavItem[];
  pathname: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="text-[11px] text-text-subtle px-2 py-1.5 tracking-wider uppercase font-medium">
        {label}
      </div>
      <nav className="flex flex-col gap-px">
        {items.map((item) => {
          const ativo =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-2 py-1.5 rounded text-[13px] font-medium transition-colors",
                ativo
                  ? "bg-bg-elev text-text"
                  : "text-text-dim hover:bg-bg-elev hover:text-text",
              )}
            >
              <Icon
                className={cn(
                  "h-3.5 w-3.5",
                  ativo ? "text-accent" : "text-text-dim",
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
