# Site Next.js — Liriun

> Regras específicas do site. Contexto geral do produto, domínio, terminologia e tom de voz: `../CLAUDE.md`.
> Arquitetura/decisões: `../docs/CONTEXTO_APP.md`. Identidade visual (tokens/fontes): `../docs/Identidade Visual/Rebranding/brand-kit/`.
> **Dono:** sócio. Substitui o Angular V1 — institucional (marketing) **+** área logada, funcionalidade completa.

## Stack
Next.js 15 (App Router) + React 19 · TypeScript · TailwindCSS 3 + shadcn/ui (Radix) + Framer Motion + Lucide ·
next-intl (pt/en) · `fetch` + JWT. Deploy: Cloudflare Pages (`@cloudflare/next-on-pages` + wrangler).

## Estrutura
- `app/[locale]/` — rotas com i18n. Público: `login`, `cadastro`, `esqueci-senha`, `onboarding`, `precos`, `recursos`, `sobre`, `empresa`, `comparar/[competitor]`, `privacidade`, `termos`.
- `app/[locale]/app/` — **área logada:** `falar`, `hoje`, `tarefas`, `atividade`, `configuracoes`.
- `app/api/og/streak/` + `app/streak/[user]/` — OG image dinâmica de streak.
- `components/` — `site/` (marketing), `app/` (logado), `auth/`, `brand/`, `ui/` (shadcn re-skinnados).
- `lib/api/` — client (`client.ts`) + módulos (`auth`, `tarefas`, `agente`, `beta`) + `hooks/`. `lib/auth/`, `lib/cn.ts`, `lib/datetime.ts`.

## Convenções não-negociáveis

- **Backend .NET é a fonte de verdade.** Todo dado vem da API REST via `lib/api/` (JWT no header). Sem lógica de negócio no front, sem acesso direto ao Supabase.
- `NEXT_PUBLIC_API_BASE_URL` obrigatória (`client.ts` lança erro explícito sem ela). Backend libera CORS pra `localhost:3000` + `liriun.com`.
- **Tokens, não hex.** Cores/raios/sombras/fontes vêm do brand-kit (`bg-surface`, `text-fg`, gradiente `brand-grad`). Nunca `#hex` solto no JSX, nunca inventar cor fora dos tokens.
- **Tipografia só Geist / Geist Mono** (`next/font`). Sem outra fonte.
- **Dark mode default.** **Sem emojis** na UI. Ícones lineares (Lucide, stroke fino).
- **shadcn sempre re-skinnado** com nossos tokens — nunca os defaults.
- **Framer Motion sempre com `useReducedMotion`.** Anima `transform`/`opacity`/`filter`; nunca `width`/`height`/`top`/`left`.
- **Terminologia e tom de voz** do Liriun (ver `../CLAUDE.md`): "Tarefa"/"Categoria"/"Visão geral", mordomo seco, sem exclamação dupla.
- i18n: sem string hardcoded — tudo via chave em `messages/pt.json` / `messages/en.json`.

## Rodar
`npm install` → criar `site/.env.local` com `NEXT_PUBLIC_API_BASE_URL=http://localhost:5108` → `npm run dev` (porta 3000). Backend precisa estar de pé (ver `../README.md`).
