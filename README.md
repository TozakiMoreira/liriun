# Liriun

Organizador pessoal de tarefas com agente de voz.

## Direção atual (2026-05-09)

O projeto está em **transição** de produto único (V1 web) para **multi-cliente com agente de voz**:

- **V1 web (Angular + .NET)** — funcional, no ar, segue rodando até o site novo cobrir tudo. As instruções de setup deste README cobrem o V1.
- **Produto novo** — backend .NET continua como **backend principal centralizado**, atendendo:
  - **Site Next.js** (substitui Angular V1 com mesma funcionalidade, modernizado)
  - **App Flutter mobile** (Android + iOS, com agente de voz como diferencial)
  - **Plataformas futuras** (smartwatch, Alexa skill, browser extension, etc) — todas consomem a mesma API REST

```
Web (Next.js)   ─┐
App Flutter     ─┼─→ Backend .NET ─→ Supabase Postgres
Plataformas fut ─┘   (REST + JWT + Gemini)
```

> **Fonte autoritativa de decisões técnicas e arquitetura:** [`docs/CONTEXTO_APP.md`](docs/CONTEXTO_APP.md).
> **Style guide visual:** [`docs/design-ref/Liriun · Visual Reference · Print.pdf`](docs/design-ref/).

## Sumário

- [Stack](#stack)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Pré-requisitos](#pré-requisitos)
- [Configuração — backend](#configuração--backend)
- [Configuração — frontend (Angular V1)](#configuração--frontend-angular-v1)
- [Como rodar (passo a passo)](#como-rodar-passo-a-passo)
- [Migrations](#migrations)
- [Testes](#testes)
- [URLs locais](#urls-locais)
- [Modos de IA](#modos-de-ia-one-shot-vs-interativo)
- [Documentação adicional](#documentação-adicional)

## Stack

### Backend (PRINCIPAL — evolui pra produto novo)
| Camada | Tecnologia |
|--------|------------|
| API | .NET 10 + ASP.NET Core Web API + Clean Architecture (Core, Application, Infrastructure, Api) |
| ORM | Entity Framework Core 9 + Npgsql |
| Banco | PostgreSQL no Supabase (em V1) / projeto Supabase NOVO no produto novo |
| Auth | JWT Bearer (HS256) + BCrypt + Google/Apple Sign-In (a adicionar) |
| IA | Google Gemini API (`gemini-2.0-flash` por padrão) |
| Validação | FluentValidation |
| Testes | xUnit + FluentAssertions + Moq |

### Frontend Angular V1 (legado, segue rodando)
| Camada | Tecnologia |
|--------|------------|
| Framework | Angular 18 (standalone components, Signals) |
| UI | PrimeNG 18 + TailwindCSS 3 + Font Awesome Free |

### Produto novo (a construir)
| Camada | Tecnologia |
|--------|------------|
| Site web | Next.js 15 (App Router) + Tailwind v4 + shadcn/ui + Framer Motion + React Query |
| App mobile | Flutter + Riverpod + feature-first + dio |
| Codegen client | OpenAPI Generator (TypeScript pro Next, Dart pro Flutter) |
| STT/TTS | Nativo do dispositivo |
| Push | Firebase Cloud Messaging |

### Hosting (a definir)
- Backend: Oracle Cloud Free / Railway / VPS
- Site: Vercel
- Banco: Supabase Postgres

## Estrutura do repositório

```
Liriun/
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
├── front/                              # Angular V1 (segue rodando até site Next.js cobrir)
│   ├── src/app/
│   │   ├── core/                       # auth, http, api services
│   │   ├── features/                   # landing, auth, onboarding, captura, tarefas, concluidas, configuracoes
│   │   ├── layout/                     # shell autenticado
│   │   └── shared/                     # componentes reusáveis
│   └── src/environments/               # environment.ts (dev) / environment.prod.ts
├── app/                                # Flutter mobile (vazia, a popular — Riverpod + feature-first)
├── site/                               # Next.js (ainda não criado)
├── docs/
│   ├── CONTEXTO_APP.md                 # FONTE AUTORITATIVA — arquitetura e decisões
│   ├── ESTRATEGIA_LIRIUN.md            # posicionamento, concorrência
│   ├── IDEIAS_FUTURO.md                # backlog priorizado por tier
│   ├── PLANO_NEGOCIO_TEMPLATE.md       # PARKED até MVP
│   ├── design-ref/                     # style guide visual oficial (PDF + ícones)
│   ├── docs-arquivados/                # docs históricos do V1 (ARCHITECTURE, ENTREVISTA, etc)
│   └── termos-de-uso/                  # TERMOS_USO.md, POLITICA_PRIVACIDADE.md
├── CLAUDE.md                           # contexto resumido pra Claude Code
├── .env.example                        # template de variáveis (copie pra .env.local)
└── .env.local                          # valores reais (gitignored)
```

## Pré-requisitos

| Ferramenta | Versão | Observação |
|------------|--------|------------|
| .NET SDK | 10.0+ | https://dotnet.microsoft.com/download |
| Node.js | 20.x LTS+ | https://nodejs.org |
| Angular CLI | 18.x | `npm install -g @angular/cli@18` (V1) |
| EF Core CLI | 9.0+ | `dotnet tool install --global dotnet-ef` |
| Conta Supabase | — | https://supabase.com (free tier serve) |
| Gemini API key | — | https://aistudio.google.com/apikey (free tier) |
| Git | — | — |

### Para o produto novo (a instalar quando começar)
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

> **Produto novo:** vai usar projeto Supabase **NOVO** (separado do V1). Free tier permite 2 projetos por organização.

### Gemini API key

Cria em https://aistudio.google.com/apikey. Free tier basta pra dev (rate limit ~15 req/min, ~1500 req/dia em `gemini-2.0-flash`). Quando estoura `429`, o backend devolve `IaErrors.LimiteExcedido()` com retry hint.

## Configuração — frontend (Angular V1)

Edita `front/src/environments/environment.ts` se a API local rodar em outra porta:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5108',
};
```

Pra build de produção, ajusta `front/src/environments/environment.prod.ts` com a URL pública da API.

CORS no backend libera só `http://localhost:4200` em dev (`Program.cs`). Se mudar a porta do front, atualiza lá também.

> **Quando o site Next.js novo for criado**, CORS precisa liberar também `http://localhost:3000` (dev Next) + `http://localhost:8080` (dev Flutter Web) + os domínios de produção.

## Como rodar (passo a passo)

### 1. Clone e instale dependências

```powershell
git clone <repo> Liriun
cd Liriun

# Backend: restore
dotnet restore backend

# Frontend V1 (Angular): instala pacotes
cd front
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

### 5. Sobe frontend Angular V1

Em outro terminal:

```powershell
cd front
npm start
# ou: ng serve
```

Acessa http://localhost:4200.

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
| Frontend V1 (Angular) | http://localhost:4200 |
| Backend (HTTP) | http://localhost:5108 |
| Backend (HTTPS) | https://localhost:7208 |
| Swagger | http://localhost:5108/swagger |
| Site Next.js (novo, futuro) | http://localhost:3000 |
| Flutter Web (novo, futuro) | http://localhost:8080 |

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

### Ativos (foco no produto novo)
- **[`docs/CONTEXTO_APP.md`](docs/CONTEXTO_APP.md)** — **fonte autoritativa** de arquitetura e decisões técnicas
- **[`docs/ESTRATEGIA_LIRIUN.md`](docs/ESTRATEGIA_LIRIUN.md)** — posicionamento, pilares, concorrência
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
| CORS bloqueado no front | Front rodando em porta diferente de 4200 | Ajustar policy `FrontDev` em `Program.cs` |
| `dotnet ef` não reconhecido | EF tools não instaladas | `dotnet tool install --global dotnet-ef` |
| Migration falha com SSL | Supabase exige TLS | Garantir `SSL Mode=Require;Trust Server Certificate=true` na conn string |
