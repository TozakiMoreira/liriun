"use client";

export const runtime = "edge";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { AppPageHeader } from "@/components/app/page-header";
import { AlterarSenhaModal } from "@/components/app/alterar-senha-modal";
import { EditarPerfilModal } from "@/components/app/editar-perfil-modal";
import { ExcluirContaModal } from "@/components/app/excluir-conta-modal";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { useAuth, useUsuarioAtual } from "@/components/auth/auth-provider";
import { LocaleSwitcher } from "@/components/site/locale-switcher";

export default function ConfiguracoesPage() {
  const t = useTranslations("AppShell");
  const usuario = useUsuarioAtual();
  const { sair } = useAuth();

  const [editarOpen, setEditarOpen] = useState(false);
  const [senhaOpen, setSenhaOpen] = useState(false);
  const [excluirOpen, setExcluirOpen] = useState(false);

  if (!usuario) return null;

  const inicial = usuario.nome.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="pb-24 md:pb-12">
      <AppPageHeader
        kicker="Sua conta"
        title="Configurações"
        lead="Perfil, idioma, tema e segurança."
      />

      <div className="max-w-[760px] mx-auto px-6 md:px-12 pt-10 flex flex-col gap-6">
        {/* Perfil */}
        <Card>
          <SectionTitle>Perfil</SectionTitle>
          <div className="flex items-center gap-5">
            {usuario.fotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={usuario.fotoUrl}
                alt={usuario.nome}
                className="w-16 h-16 rounded-pill object-cover border border-border-hi shrink-0"
              />
            ) : (
              <div
                className="w-16 h-16 rounded-pill bg-grad-brand grid place-items-center font-mono text-lg font-semibold text-white shrink-0"
                aria-hidden
              >
                {inicial}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-base font-semibold tracking-[-0.2px]">{usuario.nome}</div>
              <div className="text-sm text-muted">{usuario.email}</div>
            </div>
            <button
              type="button"
              onClick={() => setEditarOpen(true)}
              className="font-mono text-xs uppercase tracking-[1.2px] text-violet-300 hover:text-violet-200"
            >
              Editar
            </button>
          </div>
        </Card>

        {/* Senha */}
        <Card>
          <SectionTitle>Segurança</SectionTitle>
          <Row
            label="Senha"
            description="Altere sua senha periodicamente. Mínimo 8 caracteres com maiúscula e especial."
            action={
              <button
                type="button"
                onClick={() => setSenhaOpen(true)}
                className="font-mono text-xs uppercase tracking-[1.2px] text-violet-300 hover:text-violet-200"
              >
                Alterar
              </button>
            }
          />
        </Card>

        {/* Idioma */}
        <Card>
          <SectionTitle>Idioma</SectionTitle>
          <Row
            label="Idioma da interface"
            description="Escolha entre Português ou Inglês."
            action={<LocaleSwitcher />}
          />
        </Card>

        {/* Tema */}
        <Card>
          <SectionTitle>Tema</SectionTitle>
          <Row
            label="Aparência"
            description="Auto segue o sistema. Liriun é dark-first."
            action={<ThemeToggle />}
          />
        </Card>

        {/* Conta */}
        <Card tone="danger">
          <SectionTitle>Conta</SectionTitle>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => void sair()}
              className="text-sm font-medium text-text bg-white/[0.05] border border-border-hi rounded-md px-4 py-2.5 hover:bg-white/[0.08] transition-colors"
            >
              {t("sair")}
            </button>
            <button
              type="button"
              onClick={() => setExcluirOpen(true)}
              className="text-sm font-medium text-danger bg-danger/10 border border-danger/30 rounded-md px-4 py-2.5 hover:bg-danger/15 transition-colors"
            >
              Excluir conta
            </button>
          </div>
        </Card>
      </div>

      <EditarPerfilModal
        open={editarOpen}
        onClose={() => setEditarOpen(false)}
        usuario={usuario}
      />
      <AlterarSenhaModal open={senhaOpen} onClose={() => setSenhaOpen(false)} />
      <ExcluirContaModal open={excluirOpen} onClose={() => setExcluirOpen(false)} />
    </div>
  );
}

function Card({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "danger" }) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: "rgba(255,255,255,0.035)",
        border: tone === "danger" ? "1px solid rgba(238,122,142,0.22)" : "1px solid var(--liriun-border-hi)",
      }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-xs uppercase tracking-[1.4px] text-violet-300 mb-4">
      {children}
    </div>
  );
}

function Row({
  label,
  description,
  action,
}: {
  label: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-sm font-medium text-text">{label}</div>
        {description && <p className="text-xs text-muted leading-[1.5] mt-1 max-w-[480px]">{description}</p>}
      </div>
      {action}
    </div>
  );
}
