# Backend .NET — Liriun

> Regras específicas do backend. Contexto geral do produto e domínio: `../CLAUDE.md`.
> Arquitetura/decisões: `../docs/CONTEXTO_APP.md`. Como rodar/migrations/testes: `../README.md`.
> **Dono:** Pedro. É o **backend principal e centralizado** — serve site Next.js, app Flutter e futuros clientes.

## Stack
.NET 10 · ASP.NET Core Web API · EF Core 9 + Npgsql · PostgreSQL (Supabase, banco único dev=prod) ·
JWT (HS256) + BCrypt — **só e-mail/senha** (Google/Apple não implementados) · FluentValidation ·
Gemini (`gemini-2.5-flash`) · xUnit + FluentAssertions + Moq. Solution: `Liriun.slnx`.

## Clean Architecture — 4 camadas (dependência aponta pra dentro)

| Projeto | Contém | Pode depender de |
|---|---|---|
| `Liriun.Core` | Entidades, Enums, Errors, `Result<T>`, interfaces de repo | **nada externo** |
| `Liriun.Application` | UseCases, InputModels, ViewModels, ReadModels, Validators, IoC | Core |
| `Liriun.Infrastructure` | EF Core, Repositories, Auth (JWT/BCrypt), `Ia/` (GeminiService), Migrations | Core, Application |
| `Liriun.Api` | Controllers, Program.cs, Middlewares, appsettings | Application, Infrastructure |

Entidades: **Tarefa, Categoria, TarefaCategoria** (junção N:N, PK composta), **Usuario**, **CodigoBeta**.
Enums: `Prioridade`, `StatusTarefa`, `TipoRecorrencia`. Controllers: Auth, Captura, Categorias, Tarefas, CodigosBeta.

## Convenções não-negociáveis

- **Erro de negócio → `Result<T>`**, nunca exception. `Result` carrega `ErrorType` (Validation/NotFound/Conflict/Unauthorized/…). Exception é só pra falha **inesperada** (capturada por middleware → 500 padronizado).
- **Tradução pra HTTP num ponto só:** `ResultExtensions.ToActionResult` → status + **ProblemDetails RFC 7807** (`Type` = `https://liriun-api/erros/...`). Controller não monta status na mão.
- **Isolamento por usuário:** toda query de dado do usuário filtra por `UsuarioId` (via `IUsuarioLogado`, extraído do JWT). Nunca confiar em id vindo do body pra autorização.
- **CQRS leve:** escrita = repos rastreados via `UnitOfWork` (transação + rollback); leitura = `AsNoTracking()` projetando pra **ReadModels** (só os campos da tela). Não retornar entidade crua pra leitura.
- **Validação** na Application com FluentValidation, antes do UseCase.
- **Gemini atrás de `IGeminiService`** — Application não conhece HTTP nem Google. Config via Options tipado. Tratar 429 (retry hint) e JSON inválido (fallback) explicitamente. O agente (`CapturaController`) é conversacional: `POST /captura/conversar` (texto) e `POST /captura/conversar-audio` (áudio **multimodal** direto pro Gemini, ~60s/8MB). Faz criar/editar/concluir/excluir + responder sobre tarefas. Sem TTS.
- **Status "atrasada" é calculado** (fuso BRT `America/Sao_Paulo`), nunca persistido. Datas em UTC no banco.
- **Área admin** (códigos beta) protegida por `[Authorize(Policy = "Admin")]`.

## Regras de mudança

- Contrato mudou? O client do site é **escrito à mão** (`site/lib/api/`) — atualizar junto. (Não há codegen OpenAPI hoje; o app será refeito do zero e definirá o próprio client.)
- Nova coluna/tabela → migration EF Core (comandos no `../README.md`). Schema evolui livre (sem mais Angular pra quebrar).
- Rodar testes antes de considerar pronto: `dotnet test backend`. A `Application` mocka `IGeminiService`/repos (não precisa banco nem API key).
