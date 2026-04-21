# Arquitetura do Backend — Jarvis

Documento de referência da arquitetura do backend. Define camadas, padrões, convenções e decisões técnicas.

---

## Stack

- **.NET 10** (LTS) + ASP.NET Core Web API
- **Entity Framework Core** (ORM padrão) + **Dapper** (consultas específicas/pesadas)
- **PostgreSQL** (Supabase)
- **xUnit** + **Moq** + **FluentAssertions** (testes)
- **JWT** (autenticação)

---

## Estrutura de pastas

Padrão moderno com `src/` e `tests/` (usado pela Microsoft, templates de Clean Architecture referência, e projetos open-source modernos).

```
backend/
├── Jarvis.sln                          # Solution (agrupa todos os projetos)
├── src/
│   ├── Jarvis.Core/                    # Entidades, DTOs compartilhados, Enums, Exceptions base
│   ├── Jarvis.Application/             # UseCases, Services, InputModels, ViewModels, Interfaces
│   ├── Jarvis.Infra/                   # Repositories, Partials, DbContext, GeminiClient, JwtService, IoC
│   └── Jarvis.Api/                     # Controllers, Middlewares, Program.cs, appsettings
└── tests/
    ├── Jarvis.Core.Tests/
    ├── Jarvis.Application.Tests/
    └── Jarvis.Api.Tests/
```

**Cada camada = 1 projeto (`.csproj`) + 1 pasta.** A `Jarvis.sln` é UM único arquivo que referencia todos os projetos.

---

## Camadas e responsabilidades

### Core
Coração do domínio. Não depende de ninguém.
- **Entidades** (Tarefa, Categoria, Prazo, Usuario) — com `Validar()` no construtor
- **Enums** (Prioridade, Status)
- **DTOs compartilhados**
- **Exceptions base** (DomainException, hierarquia completa abaixo)

### Application
Orquestração de casos de uso. Depende só de Core.
- **UseCases** — 1 operação de negócio específica (ex: `CriarTarefaUseCase`, `ConcluirTarefaUseCase`). Chamam repositories, services e entidades.
- **Services** — lógica reutilizada entre UseCases (ex: validação complexa, cálculos compartilhados)
- **InputModels** — request de entrada, com `Validar()` no construtor (campos obrigatórios, formato básico)
- **ViewModels** — response de saída, modelam o que a API retorna
- **Interfaces** — contratos que a Infra vai implementar (ex: `ITarefaRepository`, `IGeminiService`)

### Infra
Detalhes técnicos. Depende de Application + Core.
- **Repositories** — operações CRUD padrão (GetAll, GetById, Create, Update, Delete)
- **Partials** — consultas personalizadas/específicas (arquivos `.partial.cs` do mesmo repository)
- **DbContext** — EF Core configurado pra PostgreSQL
- **GeminiClient** — integração com Google Gemini API
- **JwtService** — geração e validação de tokens JWT
- **IoC** — `DependencyInjection.AddInfrastructure(IServiceCollection services)` registra tudo

### Api
Entrada HTTP. Depende de todas.
- **Controllers** — endpoints REST, delegam pra UseCases
- **Middlewares** — ExceptionHandling, Authentication, CORS, Logging
- **Program.cs** — bootstrap, pipeline do ASP.NET
- **appsettings.json** — configuração não-sensível (logging levels, CORS origins)

### Regra de dependência (Clean Architecture)

```
Api → Infra → Application → Core
        ↓          ↓
        └──→  ← ───┘
```

- `Core` não depende de ninguém
- `Application` depende só de `Core`
- `Infra` depende de `Application` e `Core`
- `Api` depende de todas

**Core e Application nunca importam nada de Infra ou Api.** Isso é a regra inviolável do Clean — garante que domínio é testável sem banco, sem HTTP, sem nada.

---

## Padrão "Always Valid" (entidades e InputModels)

Toda entidade e InputModel valida **no próprio construtor**. Se estiver inválido, lança exceção. **Nunca pode existir objeto num estado inválido** circulando pelo sistema.

### Entidade

```csharp
public class Tarefa
{
    public Guid Id { get; private set; }
    public string Nome { get; private set; }
    public DateTime Prazo { get; private set; }
    public Prioridade Prioridade { get; private set; }

    public Tarefa(string nome, DateTime prazo, Prioridade prioridade)
    {
        Nome = nome;
        Prazo = prazo;
        Prioridade = prioridade;
        Validar();
    }

    private void Validar()
    {
        if (string.IsNullOrWhiteSpace(Nome))
            throw new TarefaException("Nome da tarefa é obrigatório");

        if (Nome.Length > 200)
            throw new TarefaException("Nome não pode passar de 200 caracteres");

        if (Prazo < DateTime.UtcNow.Date)
            throw new TarefaException("Prazo não pode ser no passado");
    }
}
```

- `Validar()` é **private** — só a própria entidade se valida
- Lança **exceção da própria entidade** (`TarefaException`, `CategoriaException`)
- **Regras de negócio** vão aqui (ex: "prazo não pode ser no passado", "categoria deve ter nome único")

### InputModel

Mesmo padrão. Construtor chama `Validar()`. Mas aqui validamos **só campos obrigatórios e formato básico**, não regras de negócio (essas ficam na entidade).

```csharp
public class CriarTarefaInputModel
{
    public string Nome { get; private set; }
    public DateTime Prazo { get; private set; }
    public int PrioridadeId { get; private set; }

    public CriarTarefaInputModel(string nome, DateTime prazo, int prioridadeId)
    {
        Nome = nome;
        Prazo = prazo;
        PrioridadeId = prioridadeId;
        Validar();
    }

    private void Validar()
    {
        if (string.IsNullOrWhiteSpace(Nome))
            throw new ValidationException("Nome é obrigatório");

        if (Prazo == default)
            throw new ValidationException("Prazo é obrigatório");

        if (PrioridadeId <= 0)
            throw new ValidationException("Prioridade é obrigatória");
    }
}
```

- `ValidationException` (não `TarefaException`) — é erro de **input**, não de **regra de negócio**
- Validações simples: obrigatoriedade, formato, range

**Divisão de responsabilidades:**
- **InputModel.Validar()** → "o input tá bem formado?" (validação de formato)
- **Entidade.Validar()** → "o negócio permite isso?" (regra de domínio)

---

## Exceções

Todas herdam de `DomainException` (abstrata).

```
DomainException                    [base abstrata, no Core]
├── TarefaException                [regra da tarefa quebrada - lançada pela entidade]
├── CategoriaException             [regra da categoria quebrada - lançada pela entidade]
├── PrazoException                 [lançada pela entidade]
├── UsuarioException               [lançada pela entidade]
├── ApplicationLayerException      [qualquer erro da camada Application - UseCases/Services/InputModels]
└── InfrastructureException        [falha em serviço externo → 503]
```

A `ApplicationLayerException` aceita `statusCode` opcional (default 400) pra casos específicos:

```csharp
throw new ApplicationLayerException("Tarefa não encontrada", 404);
throw new ApplicationLayerException("Senha muito curta");          // default 400
throw new ApplicationLayerException("Sem permissão", 403);
```

### Classe base

```csharp
public abstract class DomainException : Exception
{
    public int StatusCode { get; }
    public string ErrorCode { get; }

    protected DomainException(string message, int statusCode, string errorCode)
        : base(message)
    {
        StatusCode = statusCode;
        ErrorCode = errorCode;
    }
}
```

### Especializações

```csharp
public class TarefaException : DomainException
{
    public TarefaException(string message)
        : base(message, 400, "TAREFA_INVALIDA") { }
}

public class ApplicationLayerException : DomainException
{
    public ApplicationLayerException(string message, int statusCode = 400, string errorCode = "REGRA_APLICACAO")
        : base(message, statusCode, errorCode) { }
}
```

### Quem lança de onde?

- **Core (entidades)** → `TarefaException`, `CategoriaException`, `UsuarioException`, `PrazoException` (regra de negócio violada pela entidade)
- **Application (UseCases/Services/InputModels)** → `ApplicationLayerException` pra qualquer erro de orquestração. Passa `statusCode` quando precisa (404, 403, etc.)
- **Infra** → `InfrastructureException` (timeout Gemini, banco fora, etc.)
- **Middleware global na Api** → captura qualquer `DomainException`, lê `StatusCode` + `ErrorCode`, devolve JSON padronizado

---

## Middlewares (pipeline da Api)

Ordem no `Program.cs`:

1. **ExceptionHandlingMiddleware** (customizado) — captura toda exceção não tratada. Se for `DomainException`, usa `StatusCode` e `ErrorCode` dela. Se for `Exception` genérica, retorna 500 com mensagem genérica.
2. **CORS** — permite o frontend (Vercel) chamar o backend (Railway).
3. **AuthenticationMiddleware** (built-in do ASP.NET) — valida JWT do header `Authorization: Bearer <token>`. Extrai claims pro `HttpContext.User`.
4. **AuthorizationMiddleware** (built-in) — verifica se o usuário autenticado tem permissão pra o endpoint (via atributo `[Authorize]`).
5. **LoggingMiddleware** (customizado, opcional) — loga request/response pra debug em produção.

### Response padrão de erro (do ExceptionHandlingMiddleware)

```json
{
  "errorCode": "TAREFA_INVALIDA",
  "message": "Nome da tarefa é obrigatório",
  "statusCode": 400,
  "timestamp": "2026-04-21T14:30:00Z"
}
```

---

## Autenticação (JWT)

### Fluxo

1. `POST /auth/login` com `{ email, senha }`
2. UseCase valida credenciais (senha comparada com hash no banco)
3. Se OK, `JwtService` gera token com claims: `sub` (userId), `email`, `name`, `exp` (expiração 24h)
4. Token assinado com `JWT_SECRET` do `.env`
5. Frontend recebe `{ token, user }` e armazena token no `localStorage`
6. Toda request subsequente vai com `Authorization: Bearer <token>`
7. `AuthenticationMiddleware` valida, extrai claims
8. Controllers acessam `userId` via helper `HttpContext.User.FindFirst("sub")?.Value`

### Configuração

- **Expiração:** 24h (`JWT_EXPIRATION_MINUTES=1440` no `.env`)
- **Sem refresh token na V1** — expirou, usuário faz login de novo
- **Secret:** `JWT_SECRET` do `.env`, mínimo 64 chars aleatórios

### Endpoints protegidos

Controllers/actions protegidas com atributo `[Authorize]`. Endpoints públicos (login, cadastro) com `[AllowAnonymous]`.

---

## Repositories e Partials

Cada entidade tem seu repository, dividido em dois arquivos:

### Repository principal — operações padrão

`src/Jarvis.Infra/Repositories/TarefaRepository.cs`

```csharp
public partial class TarefaRepository : ITarefaRepository
{
    private readonly JarvisDbContext _context;

    public TarefaRepository(JarvisDbContext context) => _context = context;

    public async Task<Tarefa?> GetByIdAsync(Guid id) { ... }
    public async Task<List<Tarefa>> GetAllAsync(Guid userId) { ... }
    public async Task CreateAsync(Tarefa tarefa) { ... }
    public async Task UpdateAsync(Tarefa tarefa) { ... }
    public async Task DeleteAsync(Guid id) { ... }
}
```

### Partial — consultas específicas

`src/Jarvis.Infra/Repositories/Partials/TarefaRepository.Partial.cs`

```csharp
public partial class TarefaRepository
{
    // Consultas personalizadas, ocasionais, ou pesadas (Dapper)
    public async Task<List<TarefaComCategoriasViewModel>> GetPendentesComCategoriasAsync(Guid userId)
    {
        // Query Dapper otimizada quando EF ficaria lento
    }
}
```

**Quando usar Dapper:** quando a consulta ficaria pesada com EF (ex: carregando entidade dentro de entidade em várias camadas). Pra o resto, EF Core.

---

## Injeção de Dependência (IoC)

Cada camada expõe um método de extensão em `DependencyInjection.cs` que registra seus serviços.

### Infra

`src/Jarvis.Infra/IoC/DependencyInjection.cs`

```csharp
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<JarvisDbContext>(opt =>
            opt.UseNpgsql(configuration.GetConnectionString("Default")));

        services.AddScoped<ITarefaRepository, TarefaRepository>();
        services.AddScoped<ICategoriaRepository, CategoriaRepository>();
        services.AddScoped<IGeminiService, GeminiService>();
        services.AddScoped<IJwtService, JwtService>();

        return services;
    }
}
```

### Application

```csharp
public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<ICriarTarefaUseCase, CriarTarefaUseCase>();
        // ... outros UseCases e Services
        return services;
    }
}
```

### Program.cs

```csharp
builder.Services
    .AddApplication()
    .AddInfrastructure(builder.Configuration);
```

---

## Testes

### Estrutura

- **`Jarvis.Core.Tests/`** — testa entidades (regras de `Validar()`), enums, exceptions
- **`Jarvis.Application.Tests/`** — testa UseCases com mocks dos repositories (Moq)
- **`Jarvis.Api.Tests/`** — testes de integração dos controllers (pode usar `WebApplicationFactory` + banco em memória ou Testcontainers)

### Stack

- **xUnit** — framework de testes
- **Moq** — mocks de interfaces
- **FluentAssertions** — asserts legíveis: `tarefa.Nome.Should().Be("comprar fita")`

### Meta de cobertura

- Core + Application: próximo de 100% (regras críticas)
- Api: cobertura dos fluxos principais (não precisa de 100%)

---

## Convenções de código

- **Nomes em português** nas entidades e regras de negócio (Tarefa, Categoria, Prazo) — consistente com o domínio do usuário
- **Nomes em inglês** em termos técnicos (Repository, Service, UseCase, Middleware)
- **`private set;`** em propriedades de entidades — só o construtor/métodos da entidade alteram estado (encapsulamento)
- **`async/await`** em tudo que toca IO (banco, HTTP, arquivo)
- **Métodos de UseCase** — `Handle(input)` ou `ExecuteAsync(input)` por convenção

---

## Referências e inspirações

- **Jason Taylor's Clean Architecture Template** — https://github.com/jasontaylordev/CleanArchitecture
- **Ardalis Clean Architecture** — https://github.com/ardalis/CleanArchitecture
- **Microsoft eShopOnContainers** — referência de Clean Arch em .NET
- **Eric Evans — Domain-Driven Design** — livro base do conceito "Always Valid Entity"
