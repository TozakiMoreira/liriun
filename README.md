# Liriun

Organizador pessoal de tarefas com agente de voz.

## Direção atual

Produto **multi-cliente com agente de voz**, **projeto pessoal e solo do Pedro Tozaki**, em **monorepo único** (branch `main`):

- **Backend .NET centralizado** — fonte única de verdade (lógica + dados + auth), **1 banco Supabase único** (dev=prod). Atende:
  - **Site Next.js** (`site/`) — institucional + área logada. No ar em **liriun.com**, em desenvolvimento. **Foco atual.**
  - **App Flutter mobile** (`app/`, Android + iOS APENAS — sem Web) — agente de voz como diferencial. **Será refeito do zero** depois do site.
  - **Plataformas futuras** (smartwatch, extensão, etc) — todas consomem a mesma API REST

```
Site (Next.js)   ─┐
App Flutter      ─┼─→ Backend .NET ─→ Supabase Postgres (1 banco único, dev=prod)
Plataformas fut  ─┘   (REST + JWT + Gemini)
```

> O Angular V1 (`front/`) foi removido em 2026-06-15 (source no histórico git `3bad961^`). O app Flutter atual será
> descartado e reconstruído. Tudo (site + app) é feito pelo Pedro.

> **Fonte autoritativa de decisões técnicas, arquitetura e estado atual:** [`docs/CONTEXTO_APP.md`](docs/CONTEXTO_APP.md).
> **Style guide visual (provisório):** [`docs/design-ref/`](docs/design-ref/) + `docs/Identidade Visual/Rebranding/brand-kit/`.

## Sumário

- [Stack](#stack)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Pré-requisitos](#pré-requisitos)
- [Configuração — backend](#configuração--backend)
- [Configuração — site (Next.js)](#configuração--site-nextjs)
- [Como rodar (passo a passo)](#como-rodar-passo-a-passo)
- [Migrations](#migrations)
- [Testes](#testes)
- [URLs locais](#urls-locais)
- [Modos de IA](#modos-de-ia-one-shot-vs-interativo)
- [Documentação adicional](#documentação-adicional)

## Stack

### Backend (PRINCIPAL)
| Camada | Tecnologia |
|--------|------------|
| API | .NET 10 + ASP.NET Core Web API + Clean Architecture (Core, Application, Infrastructure, Api) |
| ORM | Entity Framework Core 9 + Npgsql |
| Banco | PostgreSQL no Supabase (mesmo banco do V1, mantemos) |
| Auth | JWT Bearer (HS256) + BCrypt + Google/Apple Sign-In (a adicionar) |
| IA | Google Gemini API (`gemini-2.5-flash` por padrão) |
| Validação | FluentValidation |
| Testes | xUnit + FluentAssertions + Moq |

### Site web (`site/`)
| Camada | Tecnologia | Responsável |
|--------|------------|-------------|
| Framework | Next.js 15 (App Router) + React 19 | Pedro |
| UI | TailwindCSS 3 + shadcn/ui (Radix) + Framer Motion + Lucide | Pedro |
| i18n | next-intl (pt / en) | Pedro |
| HTTP client | `fetch` + JWT (lib `site/lib/api/`) | Pedro |
| Codegen client | OpenAPI Generator (TypeScript a partir do .NET) | Ambos |

### App mobile (`app/`)
| Camada | Tecnologia | Responsável |
|--------|------------|-------------|
| Framework | Flutter (Android + iOS apenas, sem Web) + Riverpod + feature-first + dio | Pedro |
| IDE | VS Code + extensão Flutter + Dart | Pedro |
| SDK Android | Android Studio (só pra SDK + emulador) | Pedro |
| Codegen client | OpenAPI Generator (Dart a partir do .NET) | Pedro |
| STT/TTS | Nativo do dispositivo | Pedro |
| Push | Firebase Cloud Messaging | Pedro |

### Hosting
- Backend: **Render** (Docker, free tier — cold start ~30-60s após idle)
- Site: **Cloudflare Pages** (`@cloudflare/next-on-pages` + wrangler)
- Banco: Supabase Postgres

## Estrutura do repositório

```
Liriun/   (monorepo único — branch main)
├── backend/                            # .NET 10 — backend principal
│   ├── src/
│   │   ├── Liriun.Core/                # Entidades, Enums, Errors, Result<T>, interfaces de repo
│   │   ├── Liriun.Application/         # UseCases, InputModels, ViewModels, Validators, IoC
│   │   ├── Liriun.Infrastructure/      # EF Core, Repos, Auth (JWT/BCrypt), GeminiService, Migrations
│   │   └── Liriun.Api/                 # Controllers, Program.cs, Middlewares, appsettings
│   └── tests/
│       ├── Liriun.Core.Tests/
│       ├── Liriun.Application.Tests/
│       └── Liriun.Api.Tests/
├── site/                               # Next.js 15 — web (institucional + app logado) · no ar, em dev
│   ├── app/                            # App Router (rotas [locale]/, área logada em app/)
│   ├── components/                     # app/, auth/, site/, ui/, brand/
│   ├── lib/                            # api/ (client escrito à mão + hooks), auth/, utils
│   ├── i18n/ · messages/               # next-intl (pt.json / en.json)
│   └── public/                         # assets, ícones, og-images
├── app/                                # Flutter mobile (Android + iOS apenas, sem Web) · SERÁ REFEITO DO ZERO
├── docs/
│   ├── CONTEXTO_APP.md                 # FONTE AUTORITATIVA — arquitetura, produto, estado
│   ├── design-ref/                     # style guide visual (PDF) — provisório
│   ├── Identidade Visual/Rebranding/   # brand kit (tokens, logos, fontes) — provisório
│   └── termos-de-uso/                  # TERMOS_USO.md, POLITICA_PRIVACIDADE.md
├── CLAUDE.md                           # contexto resumido pra Claude Code
├── .env.example                        # template de variáveis do backend (copie pra .env.local)
└── .env.local                          # valores reais (gitignored)
```

> **`front/` (Angular V1) não existe mais** — removido em 2026-06-15. Referência no histórico git (`3bad961^`).

## Pré-requisitos

| Ferramenta | Versão | Observação |
|------------|--------|------------|
| .NET SDK | 10.0+ | https://dotnet.microsoft.com/download |
| Node.js | 20.x LTS+ | https://nodejs.org (pro site Next.js) |
| EF Core CLI | 9.0+ | `dotnet tool install --global dotnet-ef` |
| Conta Supabase | — | https://supabase.com (free tier serve) |
| Gemini API key | — | https://aistudio.google.com/apikey (free tier) |
| Git | — | — |

### Para o app Flutter (a instalar quando começar)
| Ferramenta | Versão | Observação |
|------------|--------|------------|
| Flutter SDK | 3.x+ | https://flutter.dev/docs/get-started/install |
| Android Studio | — | pra emulador Android e debug |
| Xcode | — | pra build iOS (precisa de Mac — a resolver) |

## Configuração — backend

A API lê três blocos de configuração obrigatórios:

| Chave | Origem | Obrigatório | Default |
|-------|--------|-------------|---------|
| `ConnectionStrings:Liriun` | user-secrets / env | Sim | — |
| `Jwt:Secret` | user-secrets / env | Sim | — |
| `Jwt:Issuer` | `appsettings.json` | Não | `liriun-api` |
| `Jwt:Audience` | `appsettings.json` | Não | `liriun-app` |
| `Jwt:ExpirationHours` | `appsettings.json` | Não | `24` |
| `Gemini:ApiKey` | user-secrets / env | Sim (pra usar IA) | — |
| `Gemini:Model` | user-secrets / env | Não | `gemini-2.5-flash` |
| `Gemini:BaseUrl` | user-secrets / env | Não | `https://generativelanguage.googleapis.com/v1beta` |
| `Gemini:TimeoutSeconds` | user-secrets / env | Não | `90` |
| `Gemini:ModoInterativo` | user-secrets / env | Não | `false` (ver [Modos de IA](#modos-de-ia-one-shot-vs-interativo)) |

### Opção A — `dotnet user-secrets` (recomendado em dev)

`Liriun.Api.csproj` já tem `UserSecretsId` configurado. Roda da raiz do repo:

```powershell
cd backend/src/Liriun.Api

dotnet user-secrets set "ConnectionStrings:Liriun" "Host=db.SEU-PROJETO.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=SUA-SENHA;SSL Mode=Require;Trust Server Certificate=true"
dotnet user-secrets set "Jwt:Secret" "SECRET_BASE64_FORTE_DE_512_BITS"
dotnet user-secrets set "Gemini:ApiKey" "AIzaSy..."
```

Pra gerar `Jwt:Secret` aleatório:

```powershell
# PowerShell
[Convert]::ToBase64String((1..64 | %{ Get-Random -Maximum 256 } | %{ [byte]$_ }))
```

### Opção B — variáveis de ambiente

Use o `.env.example` como referência. ASP.NET Core lê variáveis com `__` no lugar de `:`:

```powershell
$env:ConnectionStrings__Liriun = "Host=...;Port=5432;..."
$env:Jwt__Secret = "..."
$env:Gemini__ApiKey = "..."
```

> `.env.local` na raiz é só pra anotação dos valores — o app **não** carrega esse arquivo automaticamente. Você precisa replicar via user-secrets ou variáveis de ambiente.

### Banco

A connection string aponta direto pro PostgreSQL do Supabase. Pega em **Project Settings → Database → Connection string (URI)** e converte pro formato Npgsql:

```
Host=db.<ref>.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=<senha>;SSL Mode=Require;Trust Server Certificate=true
```

> **Produto novo:** mantém o **mesmo projeto Supabase do V1** (1 banco único). Sem criar projeto novo.

### Gemini API key

Cria em https://aistudio.google.com/apikey. Free tier basta pra dev (rate limit ~15 req/min, ~1500 req/dia em `gemini-2.5-flash`). Quando estoura `429`, o backend devolve `IaErrors.LimiteExcedido()` com retry hint.

## Configuração — site (Next.js)

O site lê a URL da API de uma env pública `NEXT_PUBLIC_API_BASE_URL`. Cria `site/.env.local`:

```bash
# site/.env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:5108
```

> Sem essa env o client lança erro explícito (`site/lib/api/client.ts`). Em produção, aponta pra URL pública do backend.

CORS no backend (`Program.cs`) já libera `http://localhost:3000` (dev Next) + `https://liriun.com` / `https://www.liriun.com`. Se mudar a porta do site, atualiza lá também. Flutter mobile NÃO precisa de CORS (CORS é browser-only).

## Como rodar (passo a passo)

### 1. Clone e instale dependências

```powershell
git clone <repo> Liriun
cd Liriun

# Backend: restore
dotnet restore backend

# Site (Next.js): instala pacotes
cd site
npm install
cd ..
```

### 2. Configura secrets do backend

Veja [Opção A](#opção-a--dotnet-user-secrets-recomendado-em-dev) acima.

### 3. Aplica migrations

```powershell
cd backend/src/Liriun.Infrastructure

dotnet ef database update --startup-project ../Liriun.Api
```

### 4. Sobe backend

```powershell
cd backend/src/Liriun.Api
dotnet run
```

Abre Swagger automático em http://localhost:5108/swagger.

### 5. Sobe o site Next.js

Em outro terminal (com `site/.env.local` configurado):

```powershell
cd site
npm run dev
```

Acessa http://localhost:3000.

## Migrations

Migrations vivem em `backend/src/Liriun.Infrastructure/Persistence/Migrations`. Comandos sempre da pasta `backend/src/Liriun.Infrastructure` com `--startup-project ../Liriun.Api`:

```powershell
# Criar nova migration
dotnet ef migrations add <NomeDaMigration> --startup-project ../Liriun.Api

# Aplicar
dotnet ef database update --startup-project ../Liriun.Api

# Reverter pra uma migration anterior
dotnet ef database update <MigrationAnterior> --startup-project ../Liriun.Api

# Remover a última (só funciona se ainda não foi aplicada)
dotnet ef migrations remove --startup-project ../Liriun.Api
```

## Testes

```powershell
# Todos
dotnet test backend

# Por projeto
dotnet test backend/tests/Liriun.Core.Tests
dotnet test backend/tests/Liriun.Application.Tests
dotnet test backend/tests/Liriun.Api.Tests
```

Testes da `Application` mockam `IGeminiService` e repos via Moq, não precisam de banco nem API key.

## URLs locais

| Serviço | URL |
|---------|-----|
| Site Next.js (`site/`) | http://localhost:3000 |
| Backend (HTTP) | http://localhost:5108 |
| Backend (HTTPS) | https://localhost:7208 |
| Swagger | http://localhost:5108/swagger |

Pra autenticar no Swagger: `POST /auth/cadastro` ou `POST /auth/login`, copia o `token` da resposta, clica em **Authorize** e cola **só o JWT** (sem o prefixo `Bearer`).

## Modos de IA (one-shot vs interativo)

Controlado por `Gemini:ModoInterativo` em config. Default: `false`.

| Modo | Comportamento | Custo de tokens |
|------|---------------|------------------|
| **One-shot** (default) | Liriun NÃO faz perguntas de follow-up. Retorna a tarefa preenchida; campos faltantes ficam `null` pro usuário completar no card de revisão. | ~75% menos tokens |
| **Interativo** (desligado, ignorar por ora) | Liriun poderia fazer até 3 perguntas antes de fechar. Código preservado em `GeminiService.MontarInstrucaoInterativo`, mas não é foco. | 2-4× mais tokens |

> O agente é conversacional (multi-turno) e faz criar/editar/concluir/excluir tarefas independente desse flag.
> Pra ligar o interativo em dev: `dotnet user-secrets set "Gemini:ModoInterativo" "true"` na pasta `Liriun.Api`.

## Documentação adicional

### Ativos
- **[`docs/CONTEXTO_APP.md`](docs/CONTEXTO_APP.md)** — **fonte autoritativa** de arquitetura, produto e estado atual
- **[`docs/design-ref/`](docs/design-ref/)** + `docs/Identidade Visual/Rebranding/` — identidade visual (provisória)
- **[`CLAUDE.md`](CLAUDE.md)** + `backend/`, `site/`, `app/` `CLAUDE.md` — contexto e regras pra Claude Code

### Fora do repo
Estratégia (era-ToMore), plano de negócio e o backlog de ideias futuras foram arquivados em `~/Desktop/arquivo liriun/`
(fora de escopo agora). Docs históricos do V1 web e `STATUS_MIGRACAO.md` seguem só no histórico git.

### Documentos legais
Em `docs/termos-de-uso/`: `TERMOS_USO.md`, `POLITICA_PRIVACIDADE.md`.

## Troubleshooting

| Erro | Causa provável | Solução |
|------|----------------|---------|
| `InvalidOperationException: ConnectionStrings:Liriun nao configurada` | Connection string não setada | `dotnet user-secrets set "ConnectionStrings:Liriun" "..."` |
| `InvalidOperationException: Jwt:Secret nao configurada` | JWT secret não setada | Idem acima pra `Jwt:Secret` |
| `IaErrors.NaoConfigurada` na rota de captura | `Gemini:ApiKey` vazia | Setar via user-secrets |
| `IaErrors.LimiteExcedido` (429) | Rate limit do free tier do Gemini | Esperar o `retryAfterSeconds` da resposta |
| `NEXT_PUBLIC_API_BASE_URL não definida` no site | `.env.local` ausente em `site/` | Criar `site/.env.local` com a URL do backend |
| CORS bloqueado no site | Site rodando em porta diferente de 3000 | Ajustar a policy de CORS em `Program.cs` |
| `dotnet ef` não reconhecido | EF tools não instaladas | `dotnet tool install --global dotnet-ef` |
| Migration falha com SSL | Supabase exige TLS | Garantir `SSL Mode=Require;Trust Server Certificate=true` na conn string |
