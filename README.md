# Jarvis

Organizador pessoal de tarefas com IA. Modo Manual (preenche o form) ou Modo Jarvis (texto livre / áudio → Gemini extrai a tarefa).

## Sumário

- [Stack](#stack)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Pré-requisitos](#pré-requisitos)
- [Configuração — backend](#configuração--backend)
- [Configuração — frontend](#configuração--frontend)
- [Como rodar (passo a passo)](#como-rodar-passo-a-passo)
- [Migrations](#migrations)
- [Testes](#testes)
- [URLs locais](#urls-locais)
- [Modos de IA](#modos-de-ia-one-shot-vs-interativo)
- [Documentação adicional](#documentação-adicional)

## Stack

| Camada | Tecnologia |
|--------|------------|
| Backend | .NET 10 + ASP.NET Core Web API + Clean Architecture (Core, Application, Infrastructure, Api) |
| ORM | Entity Framework Core 9 + Npgsql |
| Banco | PostgreSQL (Supabase em dev/prod) |
| Auth | JWT Bearer (HS256) + BCrypt pro hash de senha |
| IA | Google Gemini API (`gemini-2.0-flash` por padrão) |
| Validação | FluentValidation |
| Testes | xUnit + FluentAssertions + Moq |
| Frontend | Angular 18 (standalone components, Signals) |
| UI | PrimeNG 18 + TailwindCSS 3 + Font Awesome Free |
| Deploy | Vercel (front) + Railway (back) — a confirmar |

## Estrutura do repositório

```
Jarvis/
├── backend/
│   ├── ARCHITECTURE.md
│   ├── src/
│   │   ├── Jarvis.Core/             # Entidades, Enums, Errors, Result<T>, interfaces de repo
│   │   ├── Jarvis.Application/      # UseCases, InputModels, ViewModels, Validators, IoC
│   │   ├── Jarvis.Infrastructure/   # EF Core, Repos, Auth (JWT/BCrypt), GeminiService, Migrations
│   │   └── Jarvis.Api/              # Controllers, Program.cs, Middlewares, appsettings
│   └── tests/
│       ├── Jarvis.Core.Tests/
│       ├── Jarvis.Application.Tests/
│       └── Jarvis.Api.Tests/
├── front/                           # Angular 18
│   ├── src/app/
│   │   ├── core/                    # auth, http, api services
│   │   ├── features/                # landing, auth, onboarding, captura, tarefas, concluidas, configuracoes
│   │   ├── layout/                  # shell autenticado
│   │   └── shared/                  # componentes reusáveis
│   └── src/environments/            # environment.ts (dev) / environment.prod.ts
├── docs/
│   ├── PROJETO.md / ENTREVISTA.md / DESENVOLVIMENTO.md / FUTURO.md / SEMANA.md
│   ├── fluxos/  mocks/  reuniões/
├── CLAUDE.md                        # contexto resumido pra Claude Code
├── .env.example                     # template de variáveis (copie pra .env.local)
└── .env.local                       # valores reais (gitignored)
```

## Pré-requisitos

| Ferramenta | Versão | Observação |
|------------|--------|------------|
| .NET SDK | 10.0+ | https://dotnet.microsoft.com/download |
| Node.js | 20.x LTS+ | https://nodejs.org |
| Angular CLI | 18.x | `npm install -g @angular/cli@18` (opcional — também roda via `npx`) |
| EF Core CLI | 9.0+ | `dotnet tool install --global dotnet-ef` |
| Conta Supabase | — | https://supabase.com (free tier serve) |
| Gemini API key | — | https://aistudio.google.com/apikey (free tier) |
| Git | — | — |

## Configuração — backend

A API lê três blocos de configuração obrigatórios:

| Chave | Origem | Obrigatório | Default |
|-------|--------|-------------|---------|
| `ConnectionStrings:Jarvis` | user-secrets / env | Sim | — |
| `Jwt:Secret` | user-secrets / env | Sim | — |
| `Jwt:Issuer` | `appsettings.json` | Não | `jarvis-api` |
| `Jwt:Audience` | `appsettings.json` | Não | `jarvis-app` |
| `Jwt:ExpirationHours` | `appsettings.json` | Não | `24` |
| `Gemini:ApiKey` | user-secrets / env | Sim (pra usar IA) | — |
| `Gemini:Model` | user-secrets / env | Não | `gemini-2.0-flash` |
| `Gemini:BaseUrl` | user-secrets / env | Não | `https://generativelanguage.googleapis.com/v1beta` |
| `Gemini:TimeoutSeconds` | user-secrets / env | Não | `90` |
| `Gemini:ModoInterativo` | user-secrets / env | Não | `false` (ver [Modos de IA](#modos-de-ia-one-shot-vs-interativo)) |

### Opção A — `dotnet user-secrets` (recomendado em dev)

`Jarvis.Api.csproj` já tem `UserSecretsId` configurado. Roda da raiz do repo:

```powershell
cd backend/src/Jarvis.Api

dotnet user-secrets set "ConnectionStrings:Jarvis" "Host=db.SEU-PROJETO.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=SUA-SENHA;SSL Mode=Require;Trust Server Certificate=true"
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
$env:ConnectionStrings__Jarvis = "Host=...;Port=5432;..."
$env:Jwt__Secret = "..."
$env:Gemini__ApiKey = "..."
```

> `.env.local` na raiz é só pra anotação dos valores — o app **não** carrega esse arquivo automaticamente. Você precisa replicar via user-secrets ou variáveis de ambiente.

### Banco

A connection string aponta direto pro PostgreSQL do Supabase. Pega em **Project Settings → Database → Connection string (URI)** e converte pro formato Npgsql:

```
Host=db.<ref>.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=<senha>;SSL Mode=Require;Trust Server Certificate=true
```

### Gemini API key

Cria em https://aistudio.google.com/apikey. Free tier basta pra dev (rate limit ~15 req/min, ~1500 req/dia em `gemini-2.0-flash`). Quando estoura `429`, o backend devolve `IaErrors.LimiteExcedido()` com retry hint.

## Configuração — frontend

Edita `front/src/environments/environment.ts` se a API local rodar em outra porta:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5108',
};
```

Pra build de produção, ajusta `front/src/environments/environment.prod.ts` com a URL pública da API:

```ts
export const environment = {
  production: true,
  apiUrl: 'https://api.jarvis.app',
};
```

CORS no backend libera só `http://localhost:4200` em dev (`Program.cs`). Se mudar a porta do front, atualiza lá também.

## Como rodar (passo a passo)

### 1. Clone e instale dependências

```powershell
git clone <repo> Jarvis
cd Jarvis

# Backend: restore
dotnet restore backend

# Frontend: instala pacotes
cd front
npm install
cd ..
```

### 2. Configura secrets do backend

Veja [Opção A](#opção-a--dotnet-user-secrets-recomendado-em-dev) acima.

### 3. Aplica migrations

```powershell
cd backend/src/Jarvis.Infrastructure

dotnet ef database update --startup-project ../Jarvis.Api
```

### 4. Sobe backend

```powershell
cd backend/src/Jarvis.Api
dotnet run
```

Abre Swagger automático em http://localhost:5108/swagger.

### 5. Sobe frontend

Em outro terminal:

```powershell
cd front
npm start
# ou: ng serve
```

Acessa http://localhost:4200.

## Migrations

Migrations vivem em `backend/src/Jarvis.Infrastructure/Persistence/Migrations`. Comandos sempre da pasta `backend/src/Jarvis.Infrastructure` com `--startup-project ../Jarvis.Api`:

```powershell
# Criar nova migration
dotnet ef migrations add <NomeDaMigration> --startup-project ../Jarvis.Api

# Aplicar
dotnet ef database update --startup-project ../Jarvis.Api

# Reverter pra uma migration anterior
dotnet ef database update <MigrationAnterior> --startup-project ../Jarvis.Api

# Remover a última (só funciona se ainda não foi aplicada)
dotnet ef migrations remove --startup-project ../Jarvis.Api
```

Migrations existentes:

- `20260421210155_InitialCreate`
- `20260430054400_RemoverPrazoEHorarioOpcional`
- `20260501235308_AdicionarFotoPerfilUsuario`
- `20260502033421_TarefaDataPrazoObrigatoriaEObservacoes`

## Testes

```powershell
# Todos
dotnet test backend

# Por projeto
dotnet test backend/tests/Jarvis.Core.Tests
dotnet test backend/tests/Jarvis.Application.Tests
dotnet test backend/tests/Jarvis.Api.Tests
```

Testes da `Application` mockam `IGeminiService` e repos via Moq, não precisam de banco nem API key.

## URLs locais

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:4200 |
| Backend (HTTP) | http://localhost:5108 |
| Backend (HTTPS) | https://localhost:7208 |
| Swagger | http://localhost:5108/swagger |

Pra autenticar no Swagger: `POST /auth/cadastro` ou `POST /auth/login`, copia o `token` da resposta, clica em **Authorize** e cola **só o JWT** (sem o prefixo `Bearer`).

## Modos de IA (one-shot vs interativo)

Controlado por `Gemini:ModoInterativo` em config. Default: `false`.

| Modo | Comportamento | Custo de tokens |
|------|---------------|------------------|
| **One-shot** (default) | Jarvis NÃO faz perguntas. Sempre retorna `completo=true` com a tarefa preenchida. Campos faltantes ficam `null` pro usuário completar na UI de revisão. Observações copiam o "onde/como" cru do texto, sem reescrever. | ~75% menos tokens por tarefa |
| **Interativo** (reservado pro plano pago futuro) | Jarvis pode fazer até 3 perguntas de contexto antes de fechar. Enriquece observações com checklist. Código preservado em `GeminiService.MontarInstrucaoInterativo`. | 2-4× mais tokens por tarefa |

Pra ligar o modo interativo em dev:

```powershell
cd backend/src/Jarvis.Api
dotnet user-secrets set "Gemini:ModoInterativo" "true"
```

Quando o plano pago for implementado, a leitura do flag migra de config global pra campo do usuário (`Usuario.IaInterativa`) — ponto único de mudança em `GeminiService.MontarInstrucaoSistema`.

## Documentação adicional

Tudo em `docs/`:

- **`PROJETO.md`** — documento principal completo
- **`ENTREVISTA.md`** — descoberta de produto consolidada (fonte autoritativa de decisões de produto)
- **`DESENVOLVIMENTO.md`** — plano de desenvolvimento em fases com checklist
- **`FUTURO.md`** — visão de longo prazo / backlog pós-V1
- **`SEMANA.md`** — planejamento da semana corrente
- **`fluxos/`**, **`mocks/`**, **`reuniões/`** — diagramas, protótipos, atas

E **`backend/ARCHITECTURE.md`** detalha a Clean Architecture (Result<T>, ProblemDetails, FluentValidation, padrão Read/Write repos).

## Troubleshooting

| Erro | Causa provável | Solução |
|------|----------------|---------|
| `InvalidOperationException: ConnectionStrings:Jarvis nao configurada` | Connection string não setada | `dotnet user-secrets set "ConnectionStrings:Jarvis" "..."` |
| `InvalidOperationException: Jwt:Secret nao configurada` | JWT secret não setada | Idem acima pra `Jwt:Secret` |
| `IaErrors.NaoConfigurada` na rota de captura | `Gemini:ApiKey` vazia | Setar via user-secrets |
| `IaErrors.LimiteExcedido` (429) | Rate limit do free tier do Gemini | Esperar o `retryAfterSeconds` da resposta |
| CORS bloqueado no front | Front rodando em porta diferente de 4200 | Ajustar policy `FrontDev` em `Program.cs` |
| `dotnet ef` não reconhecido | EF tools não instaladas | `dotnet tool install --global dotnet-ef` |
| Migration falha com SSL | Supabase exige TLS | Garantir `SSL Mode=Require;Trust Server Certificate=true` na conn string |
