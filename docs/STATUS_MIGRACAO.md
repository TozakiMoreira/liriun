# Status Migração — Liriun

> Tracking da migração da stack atual (Angular V1 + .NET) para a nova arquitetura **multi-client com backend .NET central**.
> Iniciado: 2026-05-09
> Empresa: **ToMore**
> Domínio canônico: **liriun.com**
>
> **Pivô arquitetural 2026-05-09 (commit `7e58b8d` Pedro):** descartada estratégia "Supabase como backend completo". Backend `.NET` continua sendo o backend principal, atendendo Next.js + Flutter + clients futuros via REST + JWT.

---

## 🎯 Stack final esperada (pós-pivô 2026-05-09)

```
Site Next.js (web)  ┐
App Flutter mobile  ├── REST + JWT ──→ Backend .NET ──→ Supabase Postgres (DB only)
Smartwatch/Alexa…   ┘                  (auth, lógica, Gemini)
```

| Camada | Tecnologia | Status |
|---|---|---|
| **Site web `liriun.com`** | Next.js 15 + Tailwind + Framer Motion. **Substitui Angular V1 INTEIRO** (login + tarefas + agente + config — não só institucional) | 🚧 institucional pronto (`site/`); falta área logada |
| **App mobile** | Flutter (Android + iOS + Web opcional) consumindo `.NET` via dio + JWT | 🚧 scaffolding feito (auth REST + 5 telas stub) |
| **Backend** | **`.NET 10` Web API** (`backend/`) — Clean Architecture mantida. Auth JWT, validação, Gemini, EF Core migrations | ✅ existe; precisa CORS + OpenAPI/Swagger + Google/Apple OAuth |
| **Banco** | Supabase Postgres (**DB-only** — não usa Auth/RLS/Edge) | ⏳ projeto prod a criar |
| **IA** | Google Gemini Flash-Lite chamado pelo `.NET` `GeminiService` | ✅ V1 já usa |
| **STT/TTS** | Nativo do dispositivo (Flutter) | ⏳ Flutter only |
| **Wake word** | Picovoice / openWakeWord | ⏳ Fase 3 |
| **Push** | Firebase Cloud Messaging | ⏳ Flutter only |

---

## 📁 Estrutura esperada do repo

```
liriun/   (monorepo único, branch main)
├─ backend/           ← .NET 10 Web API · BACKEND PRINCIPAL ✅ ATIVO
│                       (Postgres host: Supabase Cloud DB-only — connection string em appsettings)
├─ site/              ← Next.js 15 (substitui Angular V1)  🚧 institucional pronto + área logada em construção
│                       (renomeado de landing/ → site/ em 2026-06-15)
├─ app/               ← Flutter (Android + iOS) consumindo .NET via dio + JWT  🚧 scaffolding
│                       (front/ Angular V1 REMOVIDO do disco em 2026-06-15 — source em git 3bad961^)
└─ docs/
   ├─ STATUS_MIGRACAO.md         ← este arquivo
   ├─ CONTEXTO_APP.md            ← decisões pivô (Pedro)
   ├─ ESTRATEGIA_LIRIUN.md
   ├─ design-ref/                ← style guide oficial (PDFs + ícones)
   └─ docs-arquivados/
```

**Sem pasta `supabase/`** — Supabase é usado apenas como provedor de Postgres em produção.
Connection string vai em `backend/src/Liriun.Api/appsettings.Production.json`. Migrations gerenciadas
por **EF Core** (`backend/src/Liriun.Infrastructure/Persistence/Migrations/`).

---

## 📦 Fase A — Site Next.js (substitui Angular V1 INTEIRO)

### Premissas
- Stack: **Next.js 15 (App Router)** + **Tailwind CSS** + **Framer Motion** + **shadcn/ui**
- Tokens: `docs/Identidade Visual/Rebranding/brand-kit/05-tokens/tokens.css`
- Fonte: Geist + Geist Mono
- **Escopo:** site institucional + área logada (login + tarefas + agente + config) — substitui Angular V1 inteiro
- Backend: consome `.NET` via `fetch` + React Query (`@tanstack/react-query`) + cliente TS gerado do OpenAPI
- Idiomas: PT-BR + EN (next-intl)

### Checklist

**A.1 — Setup**
- [x] Criar pasta `landing/`
- [x] `package.json` com deps (Next.js 15, React 19, Tailwind 4, Framer Motion, shadcn deps)
- [x] `tsconfig.json`
- [x] `next.config.ts`
- [x] `tailwind.config.ts` com tokens canônicos
- [x] `postcss.config.mjs`
- [x] `app/layout.tsx` com fonts Geist + metadata + favicon
- [x] `app/globals.css` com tokens.css canônicos + shadcn HSL vars
- [ ] `npm install` rodado (você precisa rodar)
- [ ] Build inicial limpo

**A.2 — Conteúdo institucional (copiado do mockup HTML)**
- [x] `app/page.tsx` — Landing (Nav + Hero + Trust + Recursos + Stats + Footer)
- [x] `app/sobre/page.tsx` — Sobre ToMore + fundadores (Lucas + Pedro) + dados empresa
- [x] `app/empresa/page.tsx` — A empresa ToMore (port da V1: hero + founders Pedro/Lucas com fotos reais + animação Framer Motion To+More + missão 3 parágrafos + produto + 4 valores V1 + contato)
- [x] `app/termos/page.tsx` — Termos de Uso (port condensado de Angular V1, V1 stub jurídico)
- [x] `app/privacidade/page.tsx` — Política de Privacidade (port LGPD V1)
- [x] `app/recursos/page.tsx` — página dedicada com 4 grupos (Voz · Organização · Agente · Plataforma) com 13 features
- [x] `app/precos/page.tsx` — 2 tiers (Beta gratuito · Pro futuro) + FAQ 4 itens
- [ ] `app/blog/` — futuro (V2)
- [x] Trust bar de parceiros falsos removida (não temos parcerias ainda)
- [x] Social icons reais (Instagram, LinkedIn, X) com SVG mono do brand kit
- [x] Page transitions via `template.tsx` (Framer Motion fade-up 420ms + useReducedMotion)

**A.3 — Componentes shared**
- [x] `components/ui/button.tsx` (variants primary/secondary/ghost)
- [x] `components/ui/badge.tsx` (variants violet/neutral/success/warning)
- [x] `components/site/nav.tsx` (sticky com backdrop blur)
- [x] `components/site/footer.tsx` (com CTA strip opcional)
- [x] `components/site/prose.tsx` (Prose wrapper para páginas legais/long-form)
- [x] `components/site/hero-phones.tsx` (port `liriun-screens.jsx` brand kit: PhoneFrame iOS-style + ChatScreen rica + ListScreen)
- [x] `components/brand/liriun-icon.tsx` (SVG inline squircle + waveform)
- [x] `components/brand/liriun-lockup.tsx`
- [ ] `components/brand/liriun-wordmark.tsx`

**A.4 — Microinterações Framer Motion**
- [x] Hover lift (Button já tem `hover:-translate-y-px`)
- [ ] Sheet rise — 360ms decel (não usado ainda)
- [x] Page transition — `template.tsx` 420ms fade-up
- [x] ToMore formula animation `whileInView` em `/empresa`
- [ ] Mic halo loop infinite — 1800ms easeInOut (depende de hero phones extract)
- [x] `useReducedMotion()` em template + tomore-formula

**A.5 — i18n**
- [x] Lib escolhida: **next-intl** v3
- [x] Estrutura `messages/pt.json` + `messages/en.json` (escopo landing-only — chaves do app autenticado vão pra Flutter ARB na Fase B)
- [x] Locale routing `/[locale]/...` com `localePrefix: "as-needed"` (PT em `/`, EN em `/en`)
- [x] `i18n/routing.ts` + `i18n/request.ts` + `middleware.ts`
- [x] Plugin `next-intl/plugin` no `next.config.ts`
- [x] `<NextIntlClientProvider>` + `setRequestLocale` no `[locale]/layout.tsx`
- [x] `generateMetadata` async com `getTranslations` (title/description/OG por locale)
- [x] Locale switcher (`components/site/locale-switcher.tsx`)
- [x] Wire `SiteNav`, `SiteFooter`, `page.tsx`, `sobre`, `termos`, `privacidade`
- [x] Bodies legais bilíngues (TermosBodyPT/EN, PrivacidadeBodyPT/EN) por locale
- [ ] Migrar ~280 chaves do app autenticado (`front/src/app/core/locale/translations.ts`) → `app/lib/l10n/*.arb` na Fase B (Flutter)

**A.6 — Assets**
- [x] Copiar `liriun-assets/` em `public/`
- [x] Copiar favicons em `public/`
- [ ] Copiar OG images sociais em `public/social/`

**A.7 — Deploy** (PARKED — Pedro pediu pra adiar)
- [ ] DNS `liriun.com` apontando pra Vercel/Cloudflare Pages
- [ ] Vercel project conectado no repo (auto-deploy)
- [ ] Variáveis ambiente: `NEXT_PUBLIC_API_BASE_URL` (URL `.NET` prod)
- [ ] Open Graph + Twitter Card validados

**A.8 — Auth + Área logada (substitui Angular V1 inteiro)** ✅ scaffolding pronto
- [x] `lib/api/client.ts` (fetch wrapper + JWT em localStorage + ApiError tipado)
- [x] `lib/api/auth.ts` (login, cadastrar, esqueciSenha, meuPerfil, sair)
- [x] `lib/api/tarefas.ts` (CRUD + concluir/reabrir/excluir + categorias CRUD)
- [x] `lib/api/agente.ts` (POST `/api/agente/interpretar`)
- [x] `components/auth/auth-provider.tsx` (Context com state loading/authenticated/anonymous + useAuth + useUsuarioAtual) plugado no layout
- [x] `app/[locale]/login/page.tsx` (form + erro inline + link esqueci/cadastro)
- [x] `app/[locale]/cadastro/page.tsx` (nome + email + senha + checkbox aceite Termos)
- [x] `app/[locale]/esqueci-senha/page.tsx` (form + estado enviado/erro)
- [x] `components/auth/auth-card.tsx` (wrapper visual com radial gradient + lockup)
- [x] `components/app/app-shell.tsx` (sidebar desktop + tabbar mobile + 5 itens + avatar gradient + sair)
- [x] `components/app/page-header.tsx` (kicker + title + lead + actions)
- [x] `app/[locale]/app/layout.tsx` (route group autenticado, redireciona pra /login se anônimo)
- [x] `app/[locale]/app/falar/page.tsx` (saudação gradient + mic FAB 88px com halo radial — sem STT ainda)
- [x] `app/[locale]/app/hoje/page.tsx` (3 stats + seções Hoje/Atrasadas com empty state)
- [x] `app/[locale]/app/tarefas/page.tsx` (segmented Lista/Quadro/Semana + estados vazios)
- [x] `app/[locale]/app/atividade/page.tsx` (3 stats + 4 conquistas locked + lista vazia)
- [x] `app/[locale]/app/configuracoes/page.tsx` (perfil + idioma + tema + categorias + sair + excluir conta)
- [x] `SiteNav` agora é auth-aware: logado → "Abrir app" pra `/app/falar`; anônimo → "Entrar" + "Baixar app" pra `/cadastro`
- [x] Chaves i18n PT/EN: `Auth.*`, `AppShell.*`, `AppPlaceholder.*`
- [ ] Conectar telas a endpoints reais quando `.NET` expor `/api/usuarios/me`, `/api/tarefas`, `/api/agente/interpretar` (Fase C)
- [ ] Lógica STT na tela Falar (Web Speech API + fallback)

---

## 📦 Fase B — App Flutter (mobile + web)

### Premissas
- Pasta `app/` (paralela a `front/` Angular V1 — V1 INTACTA)
- State mgmt: **Riverpod 2.6**
- Navigation: **go_router 14**
- Backend: consome **`.NET 10` Web API** via `dio` + JWT em `flutter_secure_storage`
- Auth: JWT próprio do `.NET` (`/api/auth/login`, `/api/auth/cadastro`). Google/Apple Sign-In via OAuth do `.NET` (futuro)
- Push: FCM
- I18n: `flutter_localizations` + `.arb` files (Fase B.6)
- Tokens: hardcoded em `lib/core/theme/liriun_tokens.dart` (espelhados do brand kit)
- Offline: PARKED V2 (MVP online-only)

### Concluído (2026-05-09 scaffolding)

**B.1 — Setup**
- [x] Estrutura `app/` criada manualmente (sem `flutter create` ainda — falta SDK na máquina dev)
- [x] `pubspec.yaml` com deps: flutter_riverpod 2.6, go_router 14, dio 5, flutter_secure_storage, pretty_dio_logger, speech_to_text, flutter_tts, firebase_core/messaging, freezed/json_serializable, build_runner, riverpod_generator
- [x] `analysis_options.yaml` com strict-casts + custom_lint + riverpod_lint
- [x] Estrutura feature-first: `lib/features/{auth,shell,falar,hoje,tarefas,atividade,configuracoes}/`
- [x] `lib/core/theme/liriun_tokens.dart` (violet 50-900, surfaces, text alphas, raios, durações)
- [x] `lib/core/theme/liriun_theme.dart` (ThemeData dark Material 3)
- [x] `lib/core/router/app_router.dart` (GoRouter + auth guard via `isAuthenticatedProvider` + ShellRoute 5 abas)
- [x] `lib/core/api/dio_client.dart` (Dio com interceptor JWT + secure storage Keychain/EncryptedSharedPreferences)
- [x] `lib/core/api/auth_api.dart` (endpoints `.NET`: login, cadastro, esqueciSenha, meuPerfil)
- [x] `lib/core/api/session_provider.dart` (AsyncNotifier sessão, lê JWT do storage no boot, valida via `/api/usuarios/me`)
- [x] `lib/main.dart` (ProviderScope + MaterialApp.router — sem inicialização de SDK externo)

**B.2 — Auth**
- [x] `AuthController` (entrar, cadastrar, sair, esqueciSenha) consumindo REST `.NET`
- [x] Tela login (email + senha + erro inline)
- [x] Tela cadastro (nome + email + senha + checkbox aceite Termos/Privacidade)
- [ ] Google Sign-In via OAuth `.NET`
- [ ] Apple Sign-In (obrigatório App Store) via OAuth `.NET`
- [x] Sessão persistente (JWT em `flutter_secure_storage`)

**B.5 — Telas core (stubs)**
- [x] Shell `TabShell` com NavigationBar 5 abas (Falar · Hoje · Tarefas · Atividade · Ajustes)
- [x] `/falar` stub com saudação gradient + mic FAB grande (sem lógica STT)
- [x] `/hoje` stub
- [x] `/tarefas` stub
- [x] `/atividade` stub
- [x] `/configuracoes` com lista de itens + botão Sair funcional

### Pendências (próximo)

**B.1 finalizar**
- [ ] Instalar Flutter SDK na máquina + rodar `flutter create .` pra gerar `android/`, `ios/`, `web/`, `windows/`
- [ ] Importar fontes Geist + Geist Mono em `assets/fonts/`
- [ ] `flutter pub get` + `dart run build_runner build`

**B.2 — Auth (continuar)**
- [ ] Adicionar Google OAuth no `.NET` (`Microsoft.AspNetCore.Authentication.Google`) e Flutter `google_sign_in`
- [ ] Adicionar Apple OAuth no `.NET` e Flutter `sign_in_with_apple`
- [ ] Tela esqueci-senha (Flutter)
- [ ] Onboarding pós-cadastro (mostra categorias padrão criadas pelo backend)

**B.3 — Camada de dados**
- [ ] Models `freezed`: `Tarefa`, `Categoria`, `Usuario` espelhando DTOs do `.NET`
- [ ] `tarefas_api.dart` (GET/POST/PATCH/DELETE em `/api/tarefas`)
- [ ] `categorias_api.dart`
- [ ] `agente_api.dart` → POST `/api/agente/interpretar` retornando tarefa sugerida
- [ ] **OpenAPI codegen** (decisão): `openapi_generator` Dart pra gerar client tipado a partir do Swagger do `.NET`. Substitui APIs manuais acima

**B.5 — Telas core (preencher)**
- [ ] Splash com lockup vertical
- [ ] Hoje (saudação + agenda + stats)
- [ ] Falar (`speech_to_text` → `/api/agente/interpretar` → confirma tarefa)
- [ ] Tarefas (lista + filtros + 3 modos: Lista, Quadro, Semana)
- [ ] Atividade (conquistas + parabenização — port da V1 `concluidas`)
- [ ] Configurações detalhada (perfil, categorias, idioma, tema, sair, excluir conta)
- [ ] Detalhe/edit tarefa (sheet)

**B.6 — I18n**
- [ ] Migrar ~280 chaves de `front/src/app/core/locale/translations.ts` → `lib/l10n/app_pt.arb` + `app_en.arb`
- [ ] `flutter_localizations` + AppLocalizations gerado

**B.7 — Push (FCM)**
- [ ] Firebase project + GoogleService-Info + google-services.json
- [ ] Permissão no onboarding
- [ ] Lembretes prazo (backend `.NET` agenda jobs Hangfire/Quartz e dispara FCM)

**B.8 — Wake word (Fase 3, NÃO MVP)**
- [ ] Picovoice ou openWakeWord
- [ ] Background audio iOS/Android

**B.9 — Stores (PARKED até MVP funcional)**
- [ ] App Store Connect ($99/ano)
- [ ] Google Play Console ($25 lifetime)
- [ ] Submission

---

## 📦 Fase C — Backend `.NET` (ajustes pra multi-client)

### Premissas
- Backend `.NET 10` Web API em `backend/` permanece como backend principal
- Clean Architecture mantida (`Liriun.Core`, `Liriun.Application`, `Liriun.Infrastructure`, `Liriun.Api`)
- Postgres host = **Supabase Cloud** (DB-only, plano free inicial)

### Pendências

**C.1 — Adaptar pra multi-client**
- [ ] Adicionar OpenAPI/Swagger detalhado (anotações + DTOs + responses tipados) pra codegen Next.js + Flutter
- [ ] CORS abrir pra `https://liriun.com`, `http://localhost:3000` (Next dev), `http://localhost:8080` (Flutter Web dev)
- [ ] Endpoint `GET /api/usuarios/me` (perfil do usuário logado a partir do JWT)
- [ ] Endpoint `POST /api/auth/cadastro` aceitando aceite de termos/privacidade
- [ ] Endpoint `POST /api/agente/interpretar` (texto + categorias → Gemini → tarefa sugerida) — pode reutilizar `GeminiService` existente

**C.2 — OAuth social**
- [ ] `Microsoft.AspNetCore.Authentication.Google` configurado com client_id/secret
- [ ] Apple Sign-In (`AspNet.Security.OAuth.Apple` ou implementação manual)
- [ ] Endpoint callback gerando JWT próprio após validar OAuth

**C.3 — Banco em produção**
- [ ] Criar projeto Supabase Cloud (escolher região; us-east-1 hoje, sa-east-1 quando lançado)
- [ ] Setar `ConnectionStrings:Liriun` em `appsettings.Production.json` apontando pro Supabase Postgres
- [ ] Rodar primeira `dotnet ef database update` no Postgres prod
- [ ] Validar backups automáticos (já vem no plano pago)

**C.4 — Hospedagem do `.NET`**
- [ ] Decidir host (Oracle Cloud Free / Railway / Azure / Fly.io) — ver tradeoffs em `docs/CONTEXTO_APP.md`
- [ ] DNS `api.liriun.com` apontando pro host escolhido
- [ ] HTTPS (cert via Caddy/nginx ou plataforma)

**C.5 — Outros**
- [ ] Background jobs (Hangfire/Quartz) pra lembretes agendados
- [ ] Logs estruturados + monitoring (Seq, Logflare ou DataDog)
- [ ] Rate limiting nos endpoints públicos

---

## 📦 Fase D — Substituir Angular V1 / Arquivar

- [ ] Quando `site/` Next.js cobrir 100% das funcionalidades que o `front/` Angular V1 tinha (login + tarefas + agente + config), apontar `liriun.com` pro Next  _(front/ já removido do disco em 2026-06-15 — referência em git `3bad961^`)_
- [ ] Mover `front/` Angular pra `archive/web-v1-angular/` (preserva, não deleta)
- [ ] README.md raiz atualizado com nova estrutura
- [ ] CLAUDE.md atualizado

---

## 📅 Histórico

### 2026-05-09 — Início migração
- Criado este arquivo de status
- Pasta `landing/` criada com setup Next.js 15 inicial (sem `npm install` rodado ainda)
- Tokens canônicos copiados de `Rebranding/brand-kit/05-tokens/tokens.css`
- Layout base + page hero inicial seguindo `liriun-site.html` mockup
- Extraído Nav + Footer + Badge + Prose para `components/site/` e `components/ui/`
- Páginas institucionais criadas: `/sobre`, `/termos`, `/privacidade`
- i18n setup completo com next-intl v3: routing PT/EN (`localePrefix: "as-needed"`), middleware, request config, NextIntlClientProvider, LocaleSwitcher
- Estrutura migrada para `app/[locale]/`
- Bodies legais bilíngues separados (TermosBodyPT/EN + PrivacidadeBodyPT/EN)
- Página `/empresa` rica com fotos reais + animação Framer Motion `whileInView` "Tozaki + Moreira = ToMore"
- Página `/recursos` dedicada com 4 grupos x 13 features
- Página `/precos` com 2 tiers + FAQ 4 itens
- Trust bar de parceiros falsos removida
- Social icons reais (Instagram, LinkedIn, X) via SVG mono do brand kit
- `template.tsx` Framer Motion fade-up 420ms entre páginas com `useReducedMotion`
- Renames "ToMore Tecnologia" → "ToMore" em todas chaves
- Merge `/sobre` → `/empresa` (redirect via `i18n/routing` redirect, chaves `Sobre.*` purgadas, link removido do Nav e Footer)
- LocaleSwitcher reescrito: segmented pill control PT | EN com gradient violet ativo (não usa native `<select>`)
- HeroPhones port de `liriun-screens.jsx` (PhoneFrame iOS-style + ChatScreen rica + ListScreen)
- Domínio `liriun.app` → `liriun.com` em todos arquivos
- Fase B Flutter: scaffolding completo (auth + 5 telas stub) com REST `.NET` + JWT (`dio` + `flutter_secure_storage`)

### 2026-05-09 (tarde) — Pivô arquitetural (commit Pedro `7e58b8d`)
- Decisão: backend `.NET` permanece como backend principal multi-client
- Supabase é usado **APENAS como Postgres gerenciado** (não Auth, não RLS, não Edge Functions)
- Pasta `supabase/` que eu havia criado (migrations + Edge Functions Deno) **deletada inteira** — não pertinente à nova arquitetura. Schema fica no `.NET` via EF Core; lógica + Gemini ficam no `.NET` `GeminiService`
- Flutter `app/` refatorado: removido `supabase_flutter`, adicionado `dio` + `flutter_secure_storage`. Auth controller agora chama `/api/auth/login` no `.NET`
- `landing/` Next.js institucional permanece, mas escopo expande: substitui Angular V1 inteiro (não só institucional)

---

## 🚦 Riscos conhecidos

| Risco | Mitigação |
|---|---|
| 3-6 meses Flutter sem validar mercado | Fase A (Next.js landing) primeiro pra atrair beta testers |
| Supabase Edge Functions pode ter limites Gemini | Testar latência/cold start cedo |
| Apple Sign-In obrigatório iOS | Implementar antes submeter App Store |
| iOS wake word limitado pela Apple | Fase 3 only, não bloqueador MVP |
| Custo Gemini com escala | Flash-Lite ($1.30/mês 1k usuários) — monitorar |
| LGPD com dados financeiros (caso reativem) | Finanças permanece feature-flag off por enquanto |

---

## 👥 Empresa

- **Razão social:** ToMore (a registrar/registrado)
- **Fundadores:** Lucas Moreira + Pedro Tozaki
- **Cidade:** São Paulo, BR
- **Produto:** Liriun (assistente pessoal de tarefas por voz)
- **Domínio:** liriun.com (canonical), liriun.com (redirect)
- **Tagline oficial:** "Sua próxima tarefa, na voz."
