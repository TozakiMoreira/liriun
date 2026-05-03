# Liriun (Liriun) - Organizador Pessoal de Ideias e Tarefas

> **Branding:** o produto vai a mercado como **Liriun**. Identificadores internos (namespace `Liriun.*`, classe `LiriunDbContext`, prompt da IA com tom "Liriun") foram mantidos. Nas telas usa-se `<app-brand />` que renderiza "Liriun".
> **Fonte autoritativa de produto:** `docs/ENTREVISTA.md`.
> **Plano de execução:** `docs/DESENVOLVIMENTO.md`.
> **Arquitetura back:** `backend/ARCHITECTURE.md`.

## Objetivo

Capturar rapidamente pensamentos, ideias e tarefas do dia a dia, substituindo o hábito de salvar tudo no WhatsApp. O sistema organiza e categoriza usando IA (Gemini) com tom de voz "Liriun" em primeira pessoa.

---

## Stack

| Camada               | Tecnologia                                                |
|----------------------|-----------------------------------------------------------|
| **Frontend**         | Angular 17+ (standalone components) + TypeScript + Signals |
| **UI**               | PrimeNG + TailwindCSS                                     |
| **Backend**          | .NET 10 (LTS) com ASP.NET Core Web API                    |
| **Arquitetura back** | Clean Architecture (Core / Application / Infrastructure / Api) |
| **ORM**              | EF Core 9 + Npgsql                                        |
| **Banco**            | Supabase (PostgreSQL na nuvem)                            |
| **IA**               | Google Gemini (HttpClient direto, free tier)              |
| **Auth**             | JWT Bearer (HS256) + BCrypt                               |
| **Validação**        | FluentValidation 11                                       |
| **Erro**             | `Result<T>` + ProblemDetails RFC 7807                     |
| **Testes**           | xUnit + Moq + FluentAssertions (back)                     |
| **Deploy** *(em avaliação)* | Railway+Vercel OU Oracle Free + Docker + domínio próprio |

---

## Arquitetura

Camadas e regras detalhadas em `backend/ARCHITECTURE.md`. Resumo:

- `Api -> Application -> Core`
- `Infrastructure -> Application -> Core`
- Use cases via `[FromServices]` no controller (sem MediatR, sem AutoMapper)
- Write repos só com entidade cheia + verbos de coleção
- Read repos retornam `ReadModel` via `Select` + `AsNoTracking`
- EF Core mapeia data models POCO em `Persistence/Models/`, mappers manuais convertem dominio <-> data model

### Frontend - Estrutura por feature (Angular 17+)

```
src/app/
├── core/
│   ├── api/              # categorias.service, tarefas.service, ia.service
│   ├── auth/             # auth.service, auth.guard, guestGuard, token.storage, auth.interceptor
│   ├── http/             # error.interceptor, error-message
│   ├── layout/           # page-header.service
│   └── theme/            # theme.service (dark/light)
│
├── shared/               # avatar, brand, brand-logo, confirm-modal, foto-perfil-modal,
│                         # password-input, password-requirements, date-picker, time-picker,
│                         # theme-toggle, problem-details, image-resize, auto-link, diretivas
│
├── features/
│   ├── auth/             # login, cadastro
│   ├── landing/          # landing pública
│   ├── onboarding/       # setup bloqueante de categorias
│   ├── captura/          # captura rápida (modo Manual/Liriun com chat + áudio)
│   ├── visao-geral/      # dashboard
│   ├── tarefas/          # tarefas (Lista/Kanban/Semana) + form + detalhe-modal
│   ├── concluidas/       # histórico + reabrir
│   └── configuracoes/    # perfil + foto + alterar-senha + categorias
│
├── layout/               # shell.component (sidebar + topbar + bottom nav mobile)
└── app.routes.ts         # lazy loading com authGuard / guestGuard
```

**Padrões:**
- Standalone components (sem NgModules)
- Signals para estado local
- Reactive Forms
- HttpInterceptors para auth e tratamento de erros
- Lazy loading nas rotas
- `data-testid` em todos elementos interativos

---

## Modelo de dados (Supabase / PostgreSQL)

> Schema canônico vive nas migrations EF Core em `backend/src/Liriun.Infrastructure/Persistence/Migrations/` e na configuração das entidades em `Persistence/Configurations/`. Resumo das tabelas:

### `usuarios`
| Campo       | Tipo        | Notas                                                |
|-------------|-------------|------------------------------------------------------|
| id          | uuid (PK)   |                                                      |
| nome        | text        | Usado pra personalização do tom Liriun               |
| email       | text unique |                                                      |
| senha_hash  | text        | BCrypt                                               |
| foto_url    | text?       | Foto de perfil em base64 (`data:image/...`, ≤700KB)  |
| criado_em   | timestamp   |                                                      |

### `categorias`
| Campo       | Tipo      | Notas                                                |
|-------------|-----------|------------------------------------------------------|
| id          | uuid (PK) |                                                      |
| usuario_id  | uuid (FK) | -> usuarios                                          |
| nome        | text      | Unique por usuário                                   |
| criado_em   | timestamp |                                                      |

### `tarefas`
| Campo           | Tipo           | Notas                                                  |
|-----------------|----------------|--------------------------------------------------------|
| id              | uuid (PK)      |                                                        |
| usuario_id      | uuid (FK)      | -> usuarios                                            |
| nome            | text           | Obrigatório                                            |
| observacoes     | text?          | Texto livre opcional                                   |
| prioridade      | enum           | urgente, importante, normal, baixa                     |
| status          | enum           | pendente, concluida (atrasada é calculado, não persistido) |
| data_prazo      | date?          | Opcional                                               |
| horario_final   | time?          | Opcional, exige `data_prazo`                           |
| criado_em       | timestamp      |                                                        |
| concluido_em    | timestamp?     | Preenchido ao concluir                                 |

### `tarefas_categorias` (relação N:N)
| Campo        | Tipo      |
|--------------|-----------|
| tarefa_id    | uuid (FK) |
| categoria_id | uuid (FK) |

**Decisões importantes:**
- Tag não é mais entidade — virou Categoria (uma tarefa tem N categorias)
- Prazo não é mais entidade — `data_prazo` + `horario_final` direto na tarefa
- Status `atrasada` é calculado no backend ao listar (passou de `data_prazo` + `horario_final`, default 23:59:59)
- Exclusão de categoria bloqueada se tem tarefa pendente vinculada

---

## Funcionalidades - V1 (status real)

### Autenticação ✅
- Cadastro com **email + senha + nome** (multi-user — Pedro, sócio e namorada testam)
- Login com email + senha
- Senha com hash BCrypt
- JWT (HS256, 24h, sem refresh)
- Alterar senha (exige senha atual)
- Atualizar perfil (nome / email)
- Atualizar foto de perfil (base64 ≤700KB)
- **V1 NÃO tem:** recuperação de senha, confirmação de email, reset de senha, 2FA

### Onboarding ✅
- Bloqueante no primeiro acesso (sem categorias → redireciona pro onboarding)
- Templates de categorias: **Trabalho, Faculdade, Casa, Compras, Pessoal**
- Usuário aceita templates, edita, ou cria do zero

### Configurações ✅
- Aba Perfil (nome, email, foto)
- Aba Alterar senha (subpágina)
- Aba Categorias (CRUD com bloqueio de exclusão se há tarefa pendente)

### Captura rápida ✅
- Tela principal pós-login
- Escolhe modo **Manual** ou **Liriun** antes de digitar
- **Modo Manual:** form com nome, categorias multi-select, data, hora, prioridade
- **Modo Liriun (IA):**
  - Chat conversacional com Gemini
  - Aceita texto e **áudio gravado** (multipart, formatos Opus/WebM/MP4/WAV/FLAC, ≤8MB)
  - Histórico persistido em localStorage (TTL 1h)
  - Quick-reply chips ("Salva", "Muda a data", "Outra categoria", "Cancela")
  - Auto-save em confirmações curtas
  - Sugestão da IA renderizada em card com Ajustar/Salvar
  - Modo **one-shot** (default) ou **interativo** (reservado pro plano pago)
- Após salvar, permanece na mesma tela pra criar várias em sequência
- Fallback IA: erro/timeout/JSON inválido → toast Liriun + form manual com texto bruto

### Visão Geral ✅
- Dashboard pós-login (não estava no escopo original — extra V1)
- Saudação, resumo, gráficos por categoria/prioridade, timeline semanal

### Minhas Tarefas ✅
- Listagem de pendentes e atrasadas
- 3 views: **Lista**, **Kanban**, **Semana**
- Filtros: categorias, prioridades, período, atraso
- Atrasadas em destaque
- Ações: editar, concluir, excluir
- IA NÃO re-categoriza ao editar
- Ao concluir, permanece na mesma tela (tarefa some, navegação não muda)

### Concluídas ✅
- Histórico filtrado por dia/semana/mês
- Ações: **reabrir** (volta pra pendente) e excluir
- Stats com contagem

### IA (Gemini) ✅
- `IGeminiService` (Application) + `GeminiService` (Infrastructure)
- Use case `ConversarCapturaUseCase`
- Endpoints `/captura/conversar` (texto) e `/captura/conversar-audio` (multipart)
- Modo controlado por `GeminiOptions.ModoInterativo` (default `false` = one-shot)
- One-shot: não pergunta, fecha tarefa direto, observações copiam o texto cru
- Interativo: até 3 perguntas de contexto antes de fechar (código preservado em `GeminiService.MontarInstrucaoInterativo` pra plano pago futuro)
- Só escolhe categorias existentes do usuário; retorna `null` se não bate

### Theme ✅
- Toggle dark/light com fallback pra preferência do sistema, persistido em localStorage
- Mudança vs spec original (V1 era dark-only)

### Landing ✅
- Página pública em `/` com hero, CTA login/cadastro, theme toggle

---

## Endpoints REST (resumo)

Lista canônica em `backend/ARCHITECTURE.md` §15. Resumo: `/auth/*` (5), `/categorias/*` (4), `/tarefas/*` (7 incluindo concluir e reabrir), `/captura/*` (2 — texto e áudio).

---

## Regras de negócio

- Tarefas ficam salvas até o usuário deletar (sem arquivamento)
- IA só é acionada na **criação** (modo Liriun)
- IA só pode escolher entre categorias **já cadastradas** pelo usuário
- Categoria ad-hoc criada inline durante criação de tarefa vira modelo permanente
- Pra criar tarefa é obrigatório existir ao menos 1 categoria (garantido pelo onboarding)
- Multi-user isolado: cada usuário só vê suas próprias tarefas e categorias

---

## Padrões de UI/UX

### Iconografia
- **NÃO usar emojis no app final** (foram usados só em mockups)
- **Font Awesome** (Free) para todos os ícones
- Consistência em tamanhos e estilos (preferência por solid/regular)

### Tom de voz - "Liriun em primeira pessoa"
- Toda comunicação como se o Liriun estivesse falando, em primeira pessoa
- Inspiração: Liriun do Homem de Ferro conversando com Tony Stark
- **Não usar:** "A IA analisou seu texto", "O sistema sugere", "Preencha os campos abaixo"
- **Usar:** "Anotei isso", "Organizei desse jeito pra você", "Identifiquei um prazo"
- Seco, discreto, competente, formal com humor sutil
- Nunca emoji, nunca exclamação dupla, nunca celebração exagerada
- Nome do usuário com parcimônia (aberturas, erros — não em toda frase)

---

## Requisitos não funcionais

- **Responsivo:** funciona bem no navegador do celular (sidebar colapsa, bottom nav mobile)
- **Performance:** suficiente para uso pessoal (3 a 5 tarefas/dia)
- **Disponibilidade:** depende dos free tiers escolhidos (a definir na Fase 6)
- **Segurança:** JWT + BCrypt + ProblemDetails sem stack trace; checklist pré-prod em `docs/CHECKLIST_PRODUCAO.md`
- **Sem offline:** exige conexão com internet
- **Sem export de dados** (V1)
- **Sem notificações push** (V1)

---

## Funcionalidades futuras

Mapeadas em `docs/FUTURO.md` (organizado por tier).

---

## Status atual e próximos passos

Acompanhamento contínuo em `docs/DESENVOLVIMENTO.md` (plano por fase).

Resumo em 2026-05-02:
- **Fase 0/1/2/3** — completas (descoberta, design, setup, backend)
- **Fase 4** (frontend) — praticamente completa; falta i18n
- **Fase 5** (testes) — back com testes unitários reais; E2E ainda não iniciado
- **Fase 6** (deploy) — provedor a decidir
- **Fase 7** (pós-lançamento) — futura
