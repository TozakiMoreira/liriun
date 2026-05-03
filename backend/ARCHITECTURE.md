# Arquitetura do Backend — Jarvis

Documento de referencia da arquitetura do backend. Define camadas, padroes, convencoes e decisoes tecnicas.

Ultima atualizacao: 2026-05-02.

---

## 1. Stack

| Item | Escolha | Motivo |
|---|---|---|
| Runtime | .NET 10 (LTS) + ASP.NET Core Web API | Performance, EF Core moderno, suporte longo |
| Arquitetura | Clean Architecture | Desacoplamento, testabilidade, independencia de libs externas |
| ORM | EF Core 9 + Npgsql | Produtividade; `AsNoTracking` em leituras |
| Banco | PostgreSQL (Supabase) | Nuvem, free tier, compativel com EF Core |
| Validacao de shape | FluentValidation 11 | Aplicada na borda (Application), agrega todos os erros por campo |
| Erros de negocio | `Result<T>` proprio | Fluxo esperado, nao excepcional |
| Erros de infra/bugs | `Exception` + middleware global | Excepcional e excepcional |
| Padrao de resposta de erro | RFC 7807 (`ProblemDetails`) | Formato unico para qualquer origem de erro |
| Auth | JWT Bearer (HS256) + BCrypt | Stateless, sem refresh token na V1 |
| IA | Google Gemini (HttpClient direto) | One-shot por padrao; modo interativo reservado pro plano pago |
| Testes | xUnit + Moq + FluentAssertions | Unidade em Core, Application e Api (testes reais, nao placeholders) |

**Vedado:**
- **MediatR** — controllers injetam use cases diretamente via `[FromServices]`.
- **AutoMapper** — mapping manual entre entidade, ReadModel e ViewModel.

---

## 2. Principios inviolaveis

1. **Independencia de libs externas.** `Core` e `Application` nao importam nenhum pacote de infraestrutura (EF Core, Dapper, HttpClient, etc.).
2. **Entidade nunca existe em estado invalido.** Invariantes aplicadas no metodo estatico `Criar()` e nos metodos de mutacao, que retornam `Result`.
3. **Erros de negocio retornam `Result.Failure`, nunca `throw`.** `throw` e reservado a falhas reais de infraestrutura e bugs.
4. **Resposta de erro segue sempre `ProblemDetails` (RFC 7807).**
5. **Use case e chamado direto pelo controller** via `[FromServices]` na action. Sem mediator, sem injecao no construtor do controller.
6. **Dependencias sempre apontam pra dentro.** `Api` -> `Application` -> `Core`. `Infrastructure` -> `Core` e `Application`. Nunca o inverso.
7. **Write repository trabalha so com a entidade cheia.** Metodos recebem/retornam `Entidade` ou `Entidade?`. Retornos primitivos (bool, int) ficam no read repository.
8. **Write repository so tem verbos de colecao:** `ObterPorId/Adicionar/Atualizar/Remover`. Verbos de negocio (Concluir, Incrementar, etc.) pertencem a entidade.
9. **Read repository retorna `ReadModel`**, nunca entidade nem ViewModel.
10. **ViewModel nao expoe dados sensiveis.** Credenciais, tokens, secrets nunca fazem parte do contrato de saida.
11. **Entidades de dominio sao independentes do ORM.** EF Core mapeia data models (POCOs em `Persistence/Models/`), nunca as entidades diretamente. Mappers manuais convertem entre dominio e persistencia.

---

## 3. Camadas

```
Api ---------> Application ---------> Core
  |                 |
  +---> Infrastructure ---+---------> Core
```

### 3.1 Jarvis.Core

Coracao do sistema. **Zero dependencia externa** (so BCL).

Contem:
- `Entities/` — Entidades de dominio com metodos estaticos `Criar()` retornando `Result<T>`, metodos de mutacao retornando `Result`, e `Reconstituir()` (internal) para hidratacao a partir da persistencia
- `Enums/` — Prioridade, StatusTarefa
- `Common/` — `Result`, `Result<T>`, `Error`, `ErrorType`
- `Errors/` — Factories de erros conhecidos por agregado (`TarefaErrors.cs`, `CategoriaErrors.cs`, etc.)
- `Interfaces/Repositories/` — Interfaces de write repositories

Nao contem:
- Atributos de ORM
- Referencia a EF Core, Dapper ou qualquer provider
- DTOs de API
- Interfaces de read repositories (vivem em Application)
- Exceptions (substituidas por Result/Error)

`InternalsVisibleTo`: `Jarvis.Infrastructure` e `Jarvis.Core.Tests` tem acesso aos metodos `internal` (como `Reconstituir()`).

### 3.2 Jarvis.Application

Orquestracao. Depende so de Core.

Contem:
- `UseCases/` — Uma classe por caso de uso, metodo `ExecuteAsync()`, retorna `Result<T>`
- `InputModels/` — Records puros (sem validacao no construtor), agrupados por agregado
- `ViewModels/` — Records com factory methods `FromEntity()` e `FromReadModel()`, agrupados por agregado
- `Validators/` — FluentValidation, um validator por InputModel
- `ReadModels/` — Records planos retornados pelos read repositories
- `ReadRepositories/` — Interfaces de read repositories (retornam ReadModel, bool para checagens)
- `Models/Ia/` — Records de contexto e analise da IA (`AnaliseTarefa`, `ContextoAnalise`, `ContextoConversa`, `MensagemConversa`)
- `Interfaces/` — Contratos de infra: `IJwtTokenService`, `IPasswordHasher`, `IUsuarioLogado`, `IUnitOfWork`, `IGeminiService`
- `IoC/ApplicationModule.cs` — Registro de use cases e validators

Nao contem:
- Implementacao concreta de persistencia
- Referencia a `HttpContext`, `IActionResult`

### 3.3 Jarvis.Infrastructure

Detalhes tecnicos. Depende de Core e Application.

Contem:
- `Persistence/JarvisDbContext.cs` — DbContext configurado com Npgsql, usa data models
- `Persistence/Models/` — POCOs planos para EF Core (UsuarioModel, TarefaModel, CategoriaModel, TarefaCategoriaModel)
- `Persistence/Mappers/` — Mappers manuais dominio <-> data model (UsuarioMapper, TarefaMapper, CategoriaMapper)
- `Persistence/Configurations/` — `IEntityTypeConfiguration<TModel>` por data model
- `Persistence/Migrations/` — Migrations do EF Core
- `Persistence/UnitOfWork.cs` — Implementacao de `IUnitOfWork`
- `Repositories/` — Implementacoes dos write repositories (usam data models + mappers, retornam entidades)
- `ReadRepositories/` — Implementacoes dos read repositories (projecao direta para ReadModel via data models, `AsNoTracking`)
- `Auth/` — JwtTokenService, BCryptPasswordHasher, JwtOptions
- `Ia/` — GeminiService (HttpClient pro Gemini), GeminiOptions (config: ApiKey, Modelo, ModoInterativo)
- `IoC/InfrastructureModule.cs` — Registro de repos, read repos, UnitOfWork, auth services, GeminiService

### 3.4 Jarvis.Api

Composition root e fronteira HTTP. Depende de Application e Infrastructure.

Contem:
- `Controllers/` — Magros, so traduzem HTTP <-> use case via `result.ToActionResult()`
- `Extensions/ResultExtensions.cs` — Mapeia `Result` -> `IActionResult` com `ProblemDetails`
- `Middlewares/ExceptionHandlingMiddleware.cs` — Captura exceptions reais, retorna `ProblemDetails` com status 500
- `Auth/UsuarioLogadoContext.cs` — Extrai userId/email dos claims JWT
- `Program.cs` — Composition root, pipeline HTTP

---

## 4. Estrutura de pastas

```
backend/
  Jarvis.slnx
  ARCHITECTURE.md
  src/
    Jarvis.Core/
      Common/                  # Result, Result<T>, Error, ErrorType
      Entities/                # Usuario, Tarefa, Categoria, TarefaCategoria
      Enums/                   # Prioridade, StatusTarefa
      Errors/                  # TarefaErrors, CategoriaErrors, UsuarioErrors
      Interfaces/
        Repositories/          # IUsuarioRepository, ITarefaRepository, ICategoriaRepository
    Jarvis.Application/
      InputModels/
        Auth/                  # CadastrarUsuarioInput, LoginInput, AlterarSenhaInput, AtualizarPerfilInput, AtualizarFotoPerfilInput
        Categorias/            # CriarCategoriaInput, AtualizarCategoriaInput
        Tarefas/               # CriarTarefaInput, AtualizarTarefaInput
        Ia/                    # ConversarCapturaInput
      ViewModels/
        Auth/                  # AutenticacaoViewModel, PerfilViewModel
        Categorias/            # CategoriaViewModel
        Tarefas/               # TarefaViewModel, TarefaCategoriaViewModel
        Ia/                    # ConversaCapturaViewModel
      Validators/
        Auth/                  # CadastrarUsuarioValidator, LoginValidator, AlterarSenhaValidator, AtualizarPerfilValidator, AtualizarFotoPerfilValidator, SenhaRules
        Categorias/            # CriarCategoriaValidator, AtualizarCategoriaValidator
        Tarefas/               # CriarTarefaValidator, AtualizarTarefaValidator
        Ia/                    # ConversarCapturaValidator
      ReadModels/              # CategoriaReadModel, TarefaReadModel
      ReadRepositories/        # ICategoriaReadRepository, ITarefaReadRepository, IUsuarioReadRepository
      Models/Ia/               # AnaliseTarefa, ContextoAnalise, ContextoConversa, MensagemConversa
      UseCases/
        Auth/                  # CadastrarUsuario, Login, AlterarSenha, AtualizarPerfil, AtualizarFotoPerfil
        Categorias/            # CriarCategoria, ListarCategorias, AtualizarCategoria, RemoverCategoria
        Tarefas/               # CriarTarefa, ListarPendentes, ListarConcluidas, Atualizar, Concluir, Reabrir, Remover
        Ia/                    # ConversarCaptura
      Interfaces/
        Auth/                  # IJwtTokenService, IPasswordHasher, IUsuarioLogado
        Ia/                    # IGeminiService
        IUnitOfWork.cs
      IoC/                     # ApplicationModule.cs
    Jarvis.Infrastructure/
      Auth/                    # JwtTokenService, BCryptPasswordHasher, JwtOptions
      Ia/                      # GeminiService, GeminiOptions
      Persistence/
        JarvisDbContext.cs
        UnitOfWork.cs
        Models/                # UsuarioModel, TarefaModel, CategoriaModel, TarefaCategoriaModel
        Mappers/               # UsuarioMapper, TarefaMapper, CategoriaMapper
        Configurations/        # UsuarioConfiguration, TarefaConfiguration, etc.
        Migrations/
      Repositories/            # UsuarioRepository, TarefaRepository, CategoriaRepository
      ReadRepositories/        # UsuarioReadRepository, TarefaReadRepository, CategoriaReadRepository
      IoC/                     # InfrastructureModule.cs
    Jarvis.Api/
      Controllers/             # AuthController, TarefasController, CategoriasController, CapturaController
      Extensions/              # ResultExtensions.cs
      Middlewares/             # ExceptionHandlingMiddleware.cs
      Auth/                    # UsuarioLogadoContext.cs
      Program.cs
      appsettings.json
  tests/
    Jarvis.Core.Tests/
    Jarvis.Application.Tests/
    Jarvis.Api.Tests/
```

---

## 5. Padrao Result<T>

Toda operacao que possa falhar por regra de negocio retorna `Result` ou `Result<T>`.

```csharp
public enum ErrorType
{
    Validation,    // -> 400
    Conflict,      // -> 409
    NotFound,      // -> 404
    Unauthorized,  // -> 401
    Forbidden,     // -> 403
    Failure        // -> 500
}

public sealed class Error
{
    public string Code { get; }                              // ex: "tarefa.nome-obrigatorio"
    public string Message { get; }                           // ex: "Nome da tarefa e obrigatorio"
    public ErrorType Type { get; }
    public IReadOnlyDictionary<string, string[]>? Details { get; }  // erros por campo (FluentValidation)
}

public class Result
{
    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    public Error? Error { get; }
}

public class Result<T> : Result
{
    public T? Value { get; }
}
```

Convencoes:
- `Error.Code` e estavel, no formato `<agregado>.<motivo>` em kebab-case (ex: `tarefa.nome-obrigatorio`, `categoria.nome-ja-existe`).
- Factories de erros conhecidos moram em `Core/Errors/<Agregado>Errors.cs` como metodos estaticos. Nunca construir `Error` ad-hoc fora dessas factories.

---

## 6. Resposta de erro — RFC 7807 (ProblemDetails)

**Toda** resposta de erro segue este formato.

```json
{
  "type": "https://jarvis-api/erros/tarefa.nome-obrigatorio",
  "title": "tarefa.nome-obrigatorio",
  "status": 400,
  "detail": "Nome da tarefa e obrigatorio",
  "errors": { "Nome": ["Nome da tarefa e obrigatorio"] }
}
```

Origens:
- **`Result.Failure`** -> controller chama `result.ToActionResult(...)` que gera `ProblemDetails` a partir de `Error.Code`, `Error.Type` e `Error.Details`.
- **Exception nao tratada** -> `ExceptionHandlingMiddleware` captura, loga, retorna `ProblemDetails` com `status: 500`, `type: https://jarvis-api/erros/interno` e `traceId`. Stack trace nunca vaza.
- **Validacao FluentValidation** -> mapeada pelo use case para `Result.Failure` com `Details` preenchido por campo.

---

## 7. Validacao — divisao de responsabilidades

| Camada | O que valida | Ferramenta |
|---|---|---|
| **Api** | Deserializacao basica do JSON | Model binding do ASP.NET Core |
| **Application** | Shape do InputModel: obrigatoriedade, tamanho, formato | FluentValidation (Validators/) |
| **Core** | Invariantes de negocio do agregado | Metodo `Criar()`/metodos de mutacao, retornando `Result` |

Regra: **toda invariante precisa viver no dominio**, mesmo que redundante com o validator. Validator e conveniencia pra retornar erros agregados. Dominio e a ultima linha de defesa.

---

## 8. Entidades de dominio

Entidades usam **metodo estatico `Criar()`** que retorna `Result<T>`. Metodos de mutacao retornam `Result`. Metodo `Reconstituir()` (internal) permite a Infrastructure hidratar entidades a partir dos data models sem revalidacao.

```csharp
public class Tarefa
{
    // Propriedades com private set
    private Tarefa() { }

    // Hidratacao a partir da persistencia (sem validacao)
    internal static Tarefa Reconstituir(...) => new() { ... };

    // Criacao de nova entidade (com validacao)
    public static Result<Tarefa> Criar(Guid usuarioId, string nome, Prioridade prioridade, ...)
    {
        Tarefa tarefa = new() { ... };
        Result validacao = tarefa.Validar();
        if (validacao.IsFailure)
            return Result<Tarefa>.Failure(validacao.Error!);
        return Result<Tarefa>.Success(tarefa);
    }

    public Result Concluir() { ... }       // retorna Result, nao throw
    public Result Atualizar(...) { ... }   // retorna Result, nao throw

    private Result Validar() { ... }
}
```

Entidades atuais: `Usuario`, `Tarefa`, `Categoria`, `TarefaCategoria` (juncao N:N).

---

## 9. Persistencia

### 9.1 Separacao dominio / data model

EF Core **nunca mapeia entidades de dominio diretamente**. Em vez disso:

- **Data models** (`Persistence/Models/`) sao POCOs planos com propriedades publicas, usados pelo DbContext e EF Core Configurations.
- **Mappers** (`Persistence/Mappers/`) convertem manualmente entre data model e entidade de dominio.
- **Repositories** recebem/retornam entidades de dominio, fazendo a conversao internamente.
- **Read repositories** projetam diretamente dos data models para `ReadModel` via `Select`, sem passar pela entidade.

Fluxo de escrita:
```
UseCase -> entidade dominio -> Repository -> Mapper.ToModel() -> DbContext.SaveChanges
                                          <- Mapper.ToEntity() <- Reload com Includes
```

### 9.2 Write repositories

- **Interface vive em `Core/Interfaces/Repositories/`**.
- **Sempre trabalha com a entidade cheia**: metodos recebem/retornam `Entidade` ou `Entidade?`.
- **So verbos de colecao**: `ObterPorIdAsync`, `AdicionarAsync`, `AtualizarAsync`, `RemoverAsync`.
- **AdicionarAsync retorna a entidade** com estado atualizado (inclui navegacoes carregadas).
- **Autossuficiente por operacao**: cada metodo faz `Add/Update/Delete + SaveChanges` internamente.
- **Reads usam `AsNoTracking`** para evitar conflitos de tracking ao converter model -> entidade -> model.

### 9.3 Read repositories

- **Interface vive em `Application/ReadRepositories/`**, porque retorna `ReadModel` (tipo de Application).
- **Retorna `ReadModel`** (record plano), nunca entidade, nunca ViewModel.
- **Implementacao em `Infrastructure/ReadRepositories/`** projeta direto do data model via `Select`, com `AsNoTracking`.
- Tambem contem metodos de checagem que retornam `bool` (ExisteNome, TodasPertencemAoUsuario, TemTarefaPendente).

### 9.4 IUnitOfWork

Interface `IUnitOfWork` em `Application/Interfaces/`, implementada por `Persistence/UnitOfWork.cs`. Expoe `SaveChangesAsync`. Registrada no DI como Scoped. Disponivel para use cases que precisem coordenar multiplas operacoes em uma unica transacao.

### 9.5 EF Core

- `JarvisDbContext` em `Infrastructure/Persistence/` com `DbSet<TModel>` para cada data model.
- Configurations via `IEntityTypeConfiguration<TModel>` em `Persistence/Configurations/`.
- Tabelas: `usuarios`, `tarefas`, `categorias`, `tarefas_categorias`.
- Indices: `(usuario_id, status)`, `(usuario_id, data_prazo)` em tarefas; `(usuario_id, nome)` unique em categorias.

---

## 10. Use Cases

Uma classe por caso de uso. Metodo `ExecuteAsync()`. Retorna `Result<T>` ou `Result`.

Fluxo padrao:
1. Validar InputModel via FluentValidation. Se invalido, retorna `Result.Failure` com Details por campo.
2. Executar logica de negocio (checagens via read repo, criacao/mutacao via entidade).
3. Persistir via write repo.
4. Mapear entidade/ReadModel para ViewModel e retornar `Result.Success`.

Use cases de leitura usam read repository + ReadModel. Use cases de escrita usam write repository + entidade.

Use cases atuais (17 total):
- **Auth**: CadastrarUsuario, Login, AlterarSenha, AtualizarPerfil, AtualizarFotoPerfil
- **Categorias**: CriarCategoria, ListarCategorias, AtualizarCategoria, RemoverCategoria
- **Tarefas**: CriarTarefa, ListarTarefasPendentes, ListarTarefasConcluidas, AtualizarTarefa, ConcluirTarefa, ReabrirTarefa, RemoverTarefa
- **IA**: ConversarCaptura (texto + audio multipart, suporta one-shot e interativo)

---

## 11. Controllers

Controllers sao **magros**. Responsabilidade unica: traduzir HTTP <-> use case.

**Injecao por action via `[FromServices]`**, nao no construtor.

```csharp
[HttpPost]
public async Task<IActionResult> Criar(
    [FromBody] CriarCategoriaInput input,
    [FromServices] CriarCategoriaUseCase useCase,
    CancellationToken ct)
{
    Result<CategoriaViewModel> result = await useCase.ExecuteAsync(input, ct);
    return result.ToActionResult(view => Created($"/categorias/{view.Id}", view));
}
```

Proibido em controller: regra de negocio, acesso a DbContext/repositorio, try/catch de erro de negocio.

---

## 12. Injecao de dependencia

- `ApplicationModule.AddApplication()` — registra use cases (Scoped) e validators (via `AddValidatorsFromAssembly`).
- `InfrastructureModule.AddInfrastructure(config)` — registra DbContext, write repos, read repos (Scoped), UnitOfWork (Scoped), auth services (Singleton).
- `Program.cs` e o unico composition root.

---

## 13. Autenticacao (JWT)

1. `POST /auth/cadastro` — cria usuario, retorna JWT.
2. `POST /auth/login` — valida credenciais, retorna JWT.
3. Token assinado com HS256, claims: `sub` (userId), `email`, `nome`, `jti`.
4. Expiracao: 24h. Sem refresh token na V1.
5. Endpoints protegidos com `[Authorize]`. Auth/login/cadastro sao publicos.
6. `UsuarioLogadoContext` extrai userId/email dos claims via `IHttpContextAccessor`.
7. CORS: permite `http://localhost:4200` (Angular dev).

---

## 14. Testes

| Projeto | Escopo | Dependencias |
|---|---|---|
| `Application.Tests` | Use cases com interfaces mockadas (Auth, Categorias, Tarefas, IA) | xUnit, Moq, FluentAssertions |
| `Core.Tests` | Invariantes de entidades (Usuario, Tarefa, Categoria, TarefaCategoria, Result, Error) | xUnit, FluentAssertions |
| `Api.Tests` | ExceptionHandlingMiddleware, ResultExtensions, UsuarioLogadoContext | xUnit |

Padrao dos testes:
- Use cases retornam `Result<T>`, testes verificam `result.IsSuccess`/`result.IsFailure` + `result.Error.Code`/`.Type`.
- Validators e read repos sao mockados via Moq.
- Entidades criadas via `Entidade.Criar(...)`.Value!`.

---

## 15. Endpoints

| Metodo | Endpoint | Auth | Status | Descricao |
|--------|----------|------|--------|-----------|
| POST | `/auth/cadastro` | Nao | 201 | Cadastrar usuario |
| POST | `/auth/login` | Nao | 200 | Login + JWT |
| POST | `/auth/alterar-senha` | Sim | 204 | Alterar senha (exige senha atual) |
| PUT | `/auth/perfil` | Sim | 200 | Atualizar nome/email |
| PUT | `/auth/perfil/foto` | Sim | 200 | Atualizar foto de perfil (base64 data:image, ate 700KB) |
| GET | `/categorias` | Sim | 200 | Listar categorias do usuario |
| POST | `/categorias` | Sim | 201 | Criar categoria |
| PUT | `/categorias/{id}` | Sim | 200 | Renomear categoria |
| DELETE | `/categorias/{id}` | Sim | 204 | Remover categoria |
| GET | `/tarefas/pendentes` | Sim | 200 | Listar pendentes + atrasadas |
| GET | `/tarefas/concluidas` | Sim | 200 | Listar concluidas (filtro ?de=&ate=) |
| POST | `/tarefas` | Sim | 201 | Criar tarefa |
| PUT | `/tarefas/{id}` | Sim | 200 | Atualizar tarefa |
| POST | `/tarefas/{id}/concluir` | Sim | 200 | Concluir tarefa |
| POST | `/tarefas/{id}/reabrir` | Sim | 200 | Reabrir tarefa concluida (volta pra pendente) |
| DELETE | `/tarefas/{id}` | Sim | 204 | Remover tarefa |
| POST | `/captura/conversar` | Sim | 200 | Conversar com Jarvis (texto puro) — one-shot ou interativo |
| POST | `/captura/conversar-audio` | Sim | 200 | Conversar com Jarvis via audio (multipart, ate 8MB, formatos Opus/WebM/MP4/WAV/FLAC) |

---

## 16. Melhorias pendentes

- [ ] Co-locar InputModel/ViewModel/Validator junto do UseCase por pasta
- [ ] Migrar use cases para usar `IUnitOfWork` (remover `SaveChanges` dos repositories)
- [ ] Paginacao nos endpoints de listagem
- [ ] Health check endpoint (`GET /health`)
- [ ] Testes de integracao com `WebApplicationFactory`
- [ ] Testes de dominio em `Core.Tests`
