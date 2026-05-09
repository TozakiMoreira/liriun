"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { Link, usePathname, useRouter } from "@/i18n/routing";
import { LiriunIcon } from "@/components/brand/liriun-icon";
import { LiriunLockup } from "@/components/brand/liriun-lockup";
import { useAuth } from "@/components/auth/auth-provider";
import { categoriasApi } from "@/lib/api/tarefas";

const STORAGE_COLLAPSE = "liriun.sidebar.collapsed";

const mainItems = [
  { key: "falar", href: "/app/falar", icon: MicIcon },
  { key: "hoje", href: "/app/hoje", icon: TodayIcon },
  { key: "tarefas", href: "/app/tarefas", icon: ListIcon },
  { key: "atividade", href: "/app/atividade", icon: TrophyIcon },
] as const;

const bottomItem = { key: "configuracoes", href: "/app/configuracoes", icon: GearIcon } as const;

const mobileItems = [
  { key: "hoje", href: "/app/hoje", icon: TodayIcon },
  { key: "tarefas", href: "/app/tarefas", icon: ListIcon },
  { key: "falar", href: "/app/falar", icon: MicIcon, highlighted: true },
  { key: "atividade", href: "/app/atividade", icon: TrophyIcon },
  { key: "configuracoes", href: "/app/configuracoes", icon: GearIcon },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("AppShell");
  const pathname = usePathname();
  const router = useRouter();
  const { state, sair } = useAuth();

  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setCollapsed(window.localStorage.getItem(STORAGE_COLLAPSE) === "true");
  }, []);

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_COLLAPSE, String(next));
    }
  }

  const [onboardingChecado, setOnboardingChecado] = useState(false);

  useEffect(() => {
    if (state.status === "anonymous") router.replace("/login");
  }, [state.status, router]);

  useEffect(() => {
    if (state.status !== "authenticated") return;
    let cancelado = false;
    void categoriasApi
      .listar()
      .then((cats) => {
        if (cancelado) return;
        if (cats.length === 0) router.replace("/onboarding");
        else setOnboardingChecado(true);
      })
      .catch(() => {
        if (!cancelado) setOnboardingChecado(true);
      });
    return () => {
      cancelado = true;
    };
  }, [state.status, router]);

  if (state.status !== "authenticated" || !onboardingChecado) {
    return (
      <div className="min-h-screen grid place-items-center text-muted">
        <span className="font-mono text-xs uppercase tracking-[1.4px]">…</span>
      </div>
    );
  }

  const usuario = state.usuario;
  const inicial = usuario.nome.trim().charAt(0).toUpperCase() || "?";

  const sidebarWidth = collapsed ? 72 : 240;

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col border-r border-border shrink-0 sticky top-0 h-screen transition-[width] duration-base"
        style={{
          background: "var(--liriun-bg-translucent)",
          width: sidebarWidth,
        }}
      >
        {/* Top: brand + collapse toggle */}
        <div className="px-3 py-5 flex items-center gap-3 border-b border-border">
          <Link href="/app/falar" aria-label="Liriun home" className="flex-1 min-w-0">
            {collapsed ? (
              <div className="flex justify-center">
                <LiriunIcon size={26} />
              </div>
            ) : (
              <div className="px-2">
                <LiriunLockup iconSize={26} textSize={16} />
              </div>
            )}
          </Link>
          {!collapsed && (
            <button
              type="button"
              onClick={toggleCollapsed}
              aria-label="Recolher menu"
              className="w-8 h-8 rounded-md grid place-items-center text-muted hover:text-text hover:bg-white/[0.06]"
            >
              <ChevronLeftIcon />
            </button>
          )}
        </div>

        {collapsed && (
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label="Expandir menu"
            className="mx-auto mt-2 w-8 h-8 rounded-md grid place-items-center text-muted hover:text-text hover:bg-white/[0.06]"
          >
            <ChevronRightIcon />
          </button>
        )}

        <nav className="flex-1 px-2 py-3 flex flex-col gap-1">
          {mainItems.map((item) => (
            <SidebarItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={t(item.key)}
              active={pathname.startsWith(item.href)}
              collapsed={collapsed}
            />
          ))}
        </nav>

        {/* Bottom: Configurações (separado) + usuário */}
        <div className="border-t border-border px-2 py-3 flex flex-col gap-1">
          <SidebarItem
            href={bottomItem.href}
            icon={bottomItem.icon}
            label={t(bottomItem.key)}
            active={pathname.startsWith(bottomItem.href)}
            collapsed={collapsed}
          />
        </div>

        <div className={`border-t border-border px-2 py-3 flex items-center ${collapsed ? "justify-center" : "gap-3 px-3"}`}>
          {usuario.fotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={usuario.fotoUrl}
              alt={usuario.nome}
              className="w-9 h-9 rounded-pill object-cover border border-border-hi shrink-0"
            />
          ) : (
            <div
              className="w-9 h-9 rounded-pill bg-grad-brand grid place-items-center font-mono text-sm font-semibold text-white shrink-0"
              aria-hidden
            >
              {inicial}
            </div>
          )}
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-text truncate">{usuario.nome}</div>
                <div className="text-xs text-muted truncate">{usuario.email}</div>
              </div>
              <button
                type="button"
                onClick={() => void sair()}
                aria-label={t("sair")}
                title={t("sair")}
                className="w-9 h-9 rounded-md grid place-items-center transition-colors shrink-0"
                style={{
                  color: "var(--liriun-danger)",
                  background: "rgba(238,122,142,0.08)",
                  border: "1px solid rgba(238,122,142,0.25)",
                }}
              >
                <LogoutIcon />
              </button>
            </>
          )}
          {collapsed && (
            <button
              type="button"
              onClick={() => void sair()}
              aria-label={t("sair")}
              title={t("sair")}
              className="w-8 h-8 rounded-md grid place-items-center mt-2 transition-colors"
              style={{
                color: "var(--liriun-danger)",
                background: "rgba(238,122,142,0.08)",
                border: "1px solid rgba(238,122,142,0.25)",
              }}
            >
              <LogoutIcon />
            </button>
          )}
        </div>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 min-w-0 pb-24 md:pb-0">{children}</main>

      {/* Mobile bottom tabbar */}
      <MobileTabBar pathname={pathname} t={t} />

      {/* Mobile FAB nova tarefa */}
      <Link
        href="/app/tarefas?novo=1"
        className="md:hidden fixed bottom-24 right-5 z-30 w-14 h-14 rounded-pill grid place-items-center"
        aria-label="Nova tarefa"
        style={{
          background: "var(--liriun-grad-brand)",
          boxShadow: "0 12px 28px rgba(91,141,239,0.45), inset 0 1px 0 rgba(255,255,255,0.25)",
        }}
      >
        <PlusIcon />
      </Link>
    </div>
  );
}

function SidebarItem({
  href,
  icon: Icon,
  label,
  active,
  collapsed,
}: {
  href: string;
  icon: (p: { active: boolean }) => React.ReactElement;
  label: string;
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium tracking-[-0.1px] transition-colors duration-base ${
        active
          ? "text-text bg-white/[0.05]"
          : "text-muted hover:text-text hover:bg-white/[0.03]"
      } ${collapsed ? "justify-center" : ""}`}
    >
      <Icon active={active} />
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}

function MobileTabBar({
  pathname,
  t,
}: {
  pathname: string;
  t: (k: string) => string;
}) {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border backdrop-blur-md"
      style={{ background: "var(--liriun-bg-translucent)" }}
    >
      <div className="flex items-end justify-around py-2 px-1">
        {mobileItems.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;

          if ((item as { highlighted?: boolean }).highlighted) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="-mt-7 mb-1 w-14 h-14 rounded-pill grid place-items-center transition-transform active:scale-95"
                aria-label={t(item.key)}
                style={{
                  background: "var(--liriun-grad-brand)",
                  boxShadow:
                    "0 12px 28px rgba(91,141,239,0.45), inset 0 1px 0 rgba(255,255,255,0.25)",
                }}
              >
                <Icon active />
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-1 ${
                active ? "text-violet-300" : "text-muted"
              }`}
            >
              <Icon active={active} />
              <span className="font-mono text-[10px] uppercase tracking-[1px]">
                {t(item.key)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// ─── Icons ────────────────────────────────────────────────────────

function MicIcon({ active }: { active: boolean }) {
  const c = active ? "#fff" : "currentColor";
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="3" width="6" height="12" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
    </svg>
  );
}
function TodayIcon({ active }: { active: boolean }) {
  const c = active ? "#B79CFF" : "currentColor";
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
    </svg>
  );
}
function ListIcon({ active }: { active: boolean }) {
  const c = active ? "#B79CFF" : "currentColor";
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round">
      <path d="M4 6h16M4 12h16M4 18h10" />
    </svg>
  );
}
function TrophyIcon({ active }: { active: boolean }) {
  const c = active ? "#B79CFF" : "currentColor";
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 5h10v4a5 5 0 0 1-10 0V5z" />
      <path d="M7 8H4v1a3 3 0 0 0 3 3M17 8h3v1a3 3 0 0 1-3 3" />
      <path d="M9 18h6M12 14v4" />
    </svg>
  );
}
function GearIcon({ active }: { active: boolean }) {
  const c = active ? "#B79CFF" : "currentColor";
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M2 12h3M19 12h3M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" />
    </svg>
  );
}
function ChevronLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}
function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}
