# Jarvis - Organizador Pessoal de Ideias e Tarefas

## Objetivo

Criar um app web responsivo para capturar rapidamente pensamentos, ideias e tarefas do dia a dia, substituindo o habito de salvar tudo no WhatsApp. O sistema organiza e categoriza automaticamente usando IA.

Este projeto serve como preparacao para o Projeto Integrador (PI) da faculdade, praticando a comunicacao entre frontend e backend com deploy em producao.

---

## Stack

| Camada               | Tecnologia                                                |
|----------------------|-----------------------------------------------------------|
| **Frontend**         | Angular 17+ (standalone components) + TypeScript          |
| **UI**               | PrimeNG + TailwindCSS                                     |
| **Backend**          | .NET 8 com ASP.NET Core Web API                           |
| **Arquitetura back** | Clean Architecture                                        |
| **Banco**            | Supabase (PostgreSQL na nuvem)                            |
| **IA**               | API do Google Gemini (free tier)                          |
| **Deploy Frontend**  | Vercel (free tier)                                        |
| **Deploy Backend**   | Railway (free tier)                                       |

---

## Arquitetura

### Backend - Clean Architecture (.NET 8)

```
Jarvis.sln
├── src/
│   ├── Jarvis.Domain/            # Entidades, enums, regras de negocio puras
│   │   ├── Entities/             # Note, Category, Tag
│   │   ├── Enums/                # Priority, NoteStatus
│   │   └── Interfaces/           # Contratos de repositorios
│   │
│   ├── Jarvis.Application/       # Casos de uso, DTOs, interfaces de servicos
│   │   ├── UseCases/             # CreateNote, ListNotes, CompleteNote...
│   │   ├── DTOs/
│   │   ├── Interfaces/           # IAiCategorizationService, INoteRepository...
│   │   └── Validators/           # FluentValidation
│   │
│   ├── Jarvis.Infrastructure/    # Implementacoes (banco, APIs externas)
│   │   ├── Persistence/          # EF Core / Supabase client
│   │   ├── Repositories/
│   │   └── Services/             # GeminiAiService, AuthService
│   │
│   └── Jarvis.Api/               # Controllers, middlewares, DI
│       ├── Controllers/
│       ├── Middlewares/
│       └── Program.cs
│
└── tests/                        # (opcional na V1)
```

**Fluxo de dependencia:** Api -> Application -> Domain | Infrastructure -> Application -> Domain

### Frontend - Estrutura por feature (Angular 17+)

```
src/app/
├── core/                  # Servicos globais (singletons)
│   ├── services/          # ApiService, AuthService
│   ├── interceptors/      # AuthInterceptor, ErrorInterceptor
│   └── guards/            # AuthGuard
│
├── shared/                # Componentes/pipes/diretivas reutilizaveis
│   ├── components/
│   └── pipes/
│
├── features/
│   ├── auth/              # Login (so senha)
│   ├── capture/           # Tela principal de captura rapida
│   ├── dashboard/         # Visao geral das anotacoes
│   ├── completed/         # Anotacoes concluidas com filtros
│   └── settings/          # Gerenciar categorias e tags
│
├── layouts/               # Header, sidebar
└── app.routes.ts          # Lazy loading
```

**Padroes:**
- Standalone components (sem NgModules)
- Signals para estado local
- Reactive Forms
- HttpInterceptors para auth e tratamento de erros
- Lazy loading nas rotas

---

## Modelo de dados (Supabase / PostgreSQL)

### `categories`
| Campo       | Tipo      | Notas                         |
|-------------|-----------|-------------------------------|
| id          | uuid (PK) |                               |
| name        | text      | Ex: "Tarefa", "Compra"        |
| created_at  | timestamp |                               |

### `tags`
| Campo       | Tipo      | Notas                         |
|-------------|-----------|-------------------------------|
| id          | uuid (PK) |                               |
| name        | text      | Ex: "trabalho", "faculdade"   |
| created_at  | timestamp |                               |

### `notes`
| Campo         | Tipo      | Notas                                                 |
|---------------|-----------|-------------------------------------------------------|
| id            | uuid (PK) |                                                       |
| title         | text      | Sugerido pela IA, editavel                            |
| content       | text      | Texto original da anotacao                            |
| category_id   | uuid (FK) | -> categories                                         |
| priority      | enum      | urgente, importante, normal, baixa                    |
| due_date      | timestamp | Opcional, detectado pela IA ou preenchido manualmente |
| status        | enum      | pending, completed                                    |
| created_at    | timestamp |                                                       |
| completed_at  | timestamp | Preenchido quando concluida                           |

### `note_tags` (relacao N:N)
| Campo    | Tipo      |
|----------|-----------|
| note_id  | uuid (FK) |
| tag_id   | uuid (FK) |

### `auth_config` (config unica do app)
| Campo            | Tipo |
|------------------|------|
| email            | text |
| password_hash    | text |

---

## Funcionalidades - Versao 1 (MVP)

### Autenticacao
- Cadastro inicial: usuario define **email + senha** na primeira vez que abre o app
- Login: pede **apenas a senha** (email so serve para recuperar senha)
- Token JWT salvo no navegador para manter sessao
- (Recuperacao de senha por email fica para uma versao futura - por ora, login simples)

### Configuracoes (pre-requisito)
- CRUD de **categorias** (ex: Tarefa, Compra, Lembrete, Ideia)
- CRUD de **tags** (ex: trabalho, faculdade, casa)
- O usuario precisa ter pelo menos 1 categoria criada antes de poder criar anotacoes
- As categorias e tags definidas aqui sao as **unicas opcoes** que a IA pode escolher

### Captura rapida (tela principal)
- Campo de texto grande + botao de enviar
- Apos salvar, **continua na mesma tela** para seguir mandando varias anotacoes
- Fluxo:
  1. Usuario digita o conteudo
  2. Sistema chama a IA passando o texto + lista de categorias e tags disponiveis
  3. IA retorna: **titulo**, **categoria**, **tags**, **urgencia**, **prazo final** (se detectado)
  4. Sistema mostra o resultado em uma tela de revisao
  5. Usuario pode **editar qualquer campo** antes de salvar
  6. Usuario confirma e a anotacao e salva

### Fallback se a IA falhar
- Se a API do Gemini estiver fora ou retornar erro, o sistema avisa
- Usuario preenche os campos manualmente e salva normalmente

### Dashboard
- Lista das anotacoes pendentes
- Filtros: por categoria, por tag, por prioridade, por prazo
- Busca por texto
- Acoes em cada item: editar, marcar como concluido, deletar
- IA **nao** re-categoriza ao editar (somente na criacao)

### Concluidas
- Espaco separado para anotacoes concluidas
- Filtro por **data de conclusao**: dia, semana ou mes
- Acoes: deletar (sem arquivar)

---

## Regras de negocio

- Anotacoes ficam salvas para sempre, ate o usuario deletar
- Sem arquivamento - so concluir ou deletar
- IA so e acionada na **criacao** de anotacoes
- A IA so pode escolher entre as categorias e tags **ja cadastradas** pelo usuario
- Para criar uma anotacao e obrigatorio existir ao menos 1 categoria

---

## Padroes de UI/UX

### Iconografia
- **NAO usar emojis no app final.** Eles foram usados apenas nos mockups por simplicidade.
- Usar **Font Awesome** (Free) para todos os icones do projeto
- Manter consistencia visual em tamanhos e estilos (preferencia por solid/regular)

### Tom de voz - "Jarvis em primeira pessoa"
- Toda comunicacao do sistema com o usuario deve ser feita **como se o Jarvis estivesse falando**, em primeira pessoa
- Inspiracao: o Jarvis do Homem de Ferro conversando com o Tony Stark
- **Nao usar:** "A IA analisou seu texto", "O sistema sugere", "Preencha os campos abaixo"
- **Usar:** "Analisei seu texto", "Organizei desse jeito pra voce", "Identifiquei um prazo no que voce escreveu"
- Linguagem natural, leve e proxima - sem ser exageradamente informal
- Mensagens curtas e diretas

---

## Requisitos nao funcionais

- **Responsivo:** funciona bem no navegador do celular
- **Performance:** suficiente para uso pessoal (3 a 5 anotacoes/dia)
- **Disponibilidade:** depende dos free tiers de Vercel e Railway
- **Seguranca minima:** autenticacao por senha unica (basico, sera melhorado depois)
- **Sem offline:** exige conexao com internet
- **Sem export de dados** (V1)
- **Sem notificacoes push** (V1)
- **Sem dark mode** (V1)

---

## Funcionalidades futuras

Mapeadas em arquivo separado: ver `FUTURO.md`.

---

## Plano de execucao

### Dia 1 - Backend e infraestrutura
1. Setup do Supabase (criar projeto, definir tabelas)
2. Setup do projeto .NET 8 com Clean Architecture
3. Implementar entidades e casos de uso (Categories, Tags, Notes)
4. Endpoints REST do CRUD
5. Endpoint de autenticacao (registro inicial + login)
6. Integracao com Gemini API (servico de categorizacao com prompt limitado as categorias/tags do usuario)
7. Deploy no Railway

### Dia 2 - Frontend
1. Setup do projeto Angular 17+ com PrimeNG e Tailwind
2. Estrutura de pastas por feature
3. Tela de login/cadastro inicial
4. Tela de configuracoes (categorias e tags)
5. Tela de captura rapida com fluxo de revisao da IA
6. Tela de dashboard com filtros
7. Tela de concluidas com filtro por data
8. Responsividade mobile
9. Deploy na Vercel
