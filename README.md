# Liriun

Organizador pessoal de tarefas com agente de voz.

## Direção atual (2026-06-15)

Produto **multi-cliente com agente de voz**, em **monorepo único** (branch `main`):

- **Backend .NET centralizado** — fonte única de verdade (lógica + dados + auth), **1 banco Supabase único** (mesmo do V1, sem criar novo). Atende:
  - **Site Next.js** (`site/`) — substitui o Angular V1, mesma funcionalidade modernizada — **sócio**
  - **App Flutter mobile** (`app/`, Android + iOS APENAS — sem Web) — agente de voz como diferencial — **Pedro**
  - **Plataformas futuras** (smartwatch, Alexa skill, browser extension, etc) — todas consomem a mesma API REST

```
Site (Next.js)   ─┐
App Flutter      ─┼─→ Backend .NET ─→ Supabase Postgres (1 banco único)
Plataformas fut  ─┘   (REST + JWT + Gemini)
```

> **Angular V1 (`front/`) foi removido** do disco em 2026-06-15. Era o produto pré-pivô; o source segue preservado no histórico git (commit `3bad961^`) pra consulta — `git show 3bad961^:front/src/...`.

### Plano de migração
1. ✅ Angular V1 (`front/`) removido — source no histórico git (`3bad961^`)
2. Pedro cria app Flutter cobrindo tudo que o Angular fazia
3. Sócio migra → Next.js (`site/`) cobrindo tudo que o Angular fazia
4. Evolução continua só no app + site (novas features daí pra frente)
5. Schema do banco evolui livre — sem mais Angular pra quebrar

> **Estratégia de repo:** monorepo único. Decisão + gatilhos de split em [`docs/CONTEXTO_APP.md`](docs/CONTEXTO_APP.md).
> **Fonte autoritativa de decisões técnicas e arquitetura:** [`docs/CONTEXTO_APP.md`](docs/CONTEXTO_APP.md).
> **Style guide visual:** [`docs/design-ref/Liriun · Visual Reference · Print.pdf`](docs/design-ref/).

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
| IA | Google Gemini API (`gemini-2.0-flash` por padrão) |
| Validação | FluentValidation |
| Testes | xUnit + FluentAssertions + Moq |

### Site web (`site/`)
| Camada | Tecnologia | Responsável |
|--------|------------|-------------|
| Framework | Next.js 15 (App Router) + React 19 | Sócio |
| UI | TailwindCSS 3 + shadcn/ui (Radix) + Framer Motion + Lucide | Sócio |
| i18n | next-intl (pt / en) | Sócio |
| HTTP client | `fetch` + JWT (lib `site/lib/api/`) | Sócio |
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

### Hosting (a definir)
- Backend: Oracle Cloud Free / Railway / VPS
- Site: Vercel (free tier)
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
├── site/                               # Next.js 15 — web (institucional + app logado) — sócio
│   ├── app/                            # App Router (rotas [locale]/, área logada em app/)
│   ├── components/                     # app/, auth/, site/, ui/, brand/
│   ├── lib/                            # api/ (client + hooks), auth/, utils
│   ├── i18n/ · messages/               # next-intl (pt.json / en.json)
│   └── public/                         # assets, ícones, og-images
├── app/                                # Flutter mobile (Android + iOS apenas, sem Web) — Pedro
├── docs/
│   ├── CONTEXTO_APP.md                 # FONTE AUTORITATIVA — arquitetura e decisões
│   ├── ESTRATEGIA_LIRIUN.md            # posicionamento, concorrência
│   ├── STATUS_MIGRACAO.md              # tracking da migração V1 → produto novo
│   ├── IDEIAS_FUTURO.md                # backlog priorizado por tier
│   ├── PLANO_NEGOCIO_TEMPLATE.md       # PARKED até MVP
│   ├── design-ref/                     # style guide visual oficial (PDF + ícones)
│   ├── docs-arquivados/                # docs históricos do V1 (ARCHITECTURE, ENTREVISTA, etc)
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
| Xcode | — | pra build iOS (sócio testa em Mac) |

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
| `Gemini:Model` | user-secrets / env | Não | `gemini-2.0-flash` |
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

Cria em https://aistudio.google.com/apikey. Free tier basta pra dev (rate limit ~15 req/min, ~1500 req/dia em `gemini-2.0-flash`). Quando estoura `429`, o backend devolve `IaErrors.LimiteExcedido()` com retry hint.

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
| **One-shot** (default) | Liriun NÃO faz perguntas. Sempre retorna `completo=true` com a tarefa preenchida. Campos faltantes ficam `null` pro usuário completar na UI de revisão. Observações copiam o "onde/como" cru do texto, sem reescrever. | ~75% menos tokens por tarefa |
| **Interativo** (reservado pro plano pago futuro) | Liriun pode fazer até 3 perguntas de contexto antes de fechar. Enriquece observações com checklist. Código preservado em `GeminiService.MontarInstrucaoInterativo`. | 2-4× mais tokens por tarefa |

Pra ligar o modo interativo em dev:

```powershell
cd backend/src/Liriun.Api
dotnet user-secrets set "Gemini:ModoInterativo" "true"
```

Quando o plano pago for implementado, a leitura do flag migra de config global pra campo do usuário (`Usuario.IaInterativa`) — ponto único de mudança em `GeminiService.MontarInstrucaoSistema`.

## Documentação adicional

### Ativos
- **[`docs/CONTEXTO_APP.md`](docs/CONTEXTO_APP.md)** — **fonte autoritativa** de arquitetura e decisões técnicas
- **[`docs/ESTRATEGIA_LIRIUN.md`](docs/ESTRATEGIA_LIRIUN.md)** — posicionamento, pilares, concorrência
- **[`docs/STATUS_MIGRACAO.md`](docs/STATUS_MIGRACAO.md)** — tracking da migração V1 → produto novo
- **[`docs/IDEIAS_FUTURO.md`](docs/IDEIAS_FUTURO.md)** — backlog priorizado por tier
- **[`docs/PLANO_NEGOCIO_TEMPLATE.md`](docs/PLANO_NEGOCIO_TEMPLATE.md)** — PARKED até MVP
- **[`docs/design-ref/`](docs/design-ref/)** — style guide visual oficial (PDF + ícones)
- **[`CLAUDE.md`](CLAUDE.md)** — contexto resumido pra Claude Code

### Arquivados (referência histórica V1 web)
Em `docs/docs-arquivados/`: `ARCHITECTURE.md`, `CHECKLIST_PRODUCAO.md`, `CORRECOES_V1.md`, `DEPLOY.md`, `DESENVOLVIMENTO.md`, `ENTREVISTA.md`, `PROJETO.md`, `banco/MIGRATIONS.md`.

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
