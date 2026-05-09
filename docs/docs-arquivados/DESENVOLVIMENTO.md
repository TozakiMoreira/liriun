# Plano de Desenvolvimento — Liriun

Documento de acompanhamento do desenvolvimento do Liriun, do zero até estar publicado e funcional. Cada fase tem um checklist. Marque `[x]` conforme concluir.

---

## Fase 0 — Descoberta e definição

- [x] Entrevista estruturada (ENTREVISTA.md) — propósito, público, dor, casos de uso
- [x] Personas (mesmo sendo single-user, formalizar 1 persona)
- [x] Escopo positivo da V1 (tudo que o app FARÁ)
- [x] Escopo negativo da V1 (tudo que o app NÃO FARÁ — fica pra V2)
- [x] Critérios de "pronto" (Definition of Done da V1)
- [x] Métricas de sucesso pessoais (como saber se o Liriun cumpriu o papel)
- [x] Riscos técnicos conhecidos (rate limits, cold starts, free tier, etc)
- [x] Glossário de termos do projeto
- [ ] **Estratégia de internacionalização (i18n)** — decidir agora como estruturar traduções, mesmo que a V1 saia só em pt-BR. Visão de longo prazo: Liriun publicado globalmente com **suporte a 5+ línguas até o fim de 2026**. Definir: formato dos arquivos de tradução (JSON, XLIFF, PO), fallback de idioma, detecção automática, chave de tradução (camelCase vs dot.notation), handling do tom do Liriun em outros idiomas

## Fase 1 — Design e arquitetura

- [x] Fluxograma completo de navegação (todas as telas e transições)
- [x] Fluxograma dos fluxos principais (criação de anotação com IA, fallback manual, etc)
- [x] Mockups das telas da V1 (estilo Linear — clean e profissional)
- [x] Revisão e aprovação dos mockups
- [x] Modelagem do banco de dados (ER das entidades: Usuario, Tarefa, Categoria, TarefaCategoria — Tag e Prazo unificados/removidos)
- [x] Definição dos contratos de API (endpoints, DTOs de request/response)
- [x] Arquitetura do backend (Clean Architecture — camadas definidas em `backend/ARCHITECTURE.md`)
- [x] Arquitetura do frontend (estrutura de pastas, state management com Signals)
- [x] Estratégia de autenticação (fluxo JWT, expiração, refresh se houver)
- [ ] Arquitetura de i18n no código — nenhuma string hardcoded em pt-BR no código. Todas passam por chave de tradução desde o primeiro componente/endpoint da V1

## Fase 2 — Setup de ambiente

- [x] Criar repositório Git
- [x] Configurar projeto Supabase (banco PostgreSQL)
- [x] Obter chave da Google Gemini API
- [x] Criar projeto .NET 10 Web API com Clean Architecture
- [x] Criar projeto Angular 17+ com standalone components
- [x] Configurar PrimeNG + TailwindCSS no front
- [ ] Configurar ESLint/Prettier (front) e analyzers (back)
- [x] Configurar variáveis de ambiente (user-secrets pra dev)
- [x] README inicial com instruções de setup local

## Fase 3 — Backend

- [x] Migrations/schema inicial do banco (tabelas das entidades)
- [x] Camada de Domain (entidades, enums de prioridade/status)
- [x] Camada de Application (use cases, interfaces) — Auth + Categorias + Tarefas + IA prontos
- [x] Camada de Infrastructure (repositories, EF Core) — repos, auth e `GeminiService` prontos
- [x] Camada de API (controllers, middleware, validação) — Auth/Categorias/Tarefas/Captura + middleware prontos
- [ ] Setup de `IStringLocalizer` (ASP.NET) com resource files — mensagens de erro, validação e respostas do Liriun via chave de tradução (V1 preenche só pt-BR)
- [x] Endpoints de autenticação (cadastro + login + JWT + alterar senha + atualizar perfil + atualizar foto)
- [x] CRUD de categorias
- [x] CRUD de tarefas (com relação N:N com categorias) + concluir + reabrir
- [x] Endpoint de análise pela IA — `POST /captura/conversar` (texto) e `POST /captura/conversar-audio` (multipart)
- [x] Modos one-shot e interativo do Gemini (`GeminiOptions.ModoInterativo`)
- [x] Endpoint de conclusão e reabertura de tarefas
- [x] Filtros no listagem (pendentes, concluídas por período)
- [x] Tratamento de erros global (ExceptionHandlingMiddleware + ProblemDetails RFC 7807)
- [ ] Logs estruturados (Serilog) — hoje só `ILogger<T>` padrão do ASP.NET
- [ ] Health check endpoint (`GET /health`) com verificação de DB

## Fase 4 — Frontend

- [ ] Configurar `@angular/localize` e estrutura de arquivos de tradução (XLIFF ou JSON) desde o primeiro commit — todas as strings do frontend via chave, V1 preenche só pt-BR
- [x] Layout base e shell da aplicação (sidebar colapsável + topbar + bottom nav mobile)
- [x] Sistema de rotas com guards de autenticação (`authGuard` + `guestGuard`, `/app/*` protegido)
- [x] Serviços de API (interceptor de JWT, tratamento de erro, parser ProblemDetails)
- [x] Tela de Login + Cadastro
- [x] Tela de Onboarding (bloqueante, templates de categorias)
- [x] Tela de Configurações (perfil + foto + alterar senha + categorias)
- [x] Tela de Captura Rápida (modo Manual + modo Liriun com chat conversacional + áudio + áudio com gravação)
- [x] Tela de Minhas Tarefas (3 views: Lista, Kanban, Semana — filtros por categoria/prioridade/período/atraso)
- [x] Tela de Concluídas (filtros por dia/semana/mês + reabrir)
- [x] Tela de Visão Geral (dashboard com saudação, resumo, gráficos por categoria/prioridade, timeline)
- [x] Landing pública (`/` com hero, CTA login/cadastro)
- [x] Componentes reutilizáveis (avatar, brand, brand-logo, confirm-modal, foto-perfil-modal, password-input, password-requirements, date-picker, time-picker, theme-toggle)
- [x] Tom de voz do Liriun (mensagens em primeira pessoa, brand `<app-brand />` "Liriun")
- [x] Responsividade desktop + mobile (navegador)
- [x] Theme toggle dark/light (extra fora do escopo original — V1 era dark-only)
- [x] **`data-testid` (IDs de QA) em todos os elementos interativos e estados visíveis** — cobertura ampla em shell, formulários, modals, chat, áudio, filtros

## Fase 5 — Testes

### Testes unitários (backend)

- [x] Setup do projeto de testes (xUnit + Moq + FluentAssertions) — `Liriun.Core.Tests`, `Liriun.Application.Tests`, `Liriun.Api.Tests`
- [x] Testes de Domain (Usuario, Tarefa, Categoria, TarefaCategoria, Result, Error, ErrorType)
- [x] Testes de Application (use cases — Auth, Categorias, Tarefas, ConversarCaptura/IA com mocks)
- [ ] Testes de Infrastructure (repositories com banco em memória ou Testcontainers)
- [x] Testes de API (ExceptionHandlingMiddleware, ResultExtensions, UsuarioLogadoContext)
- [ ] Meta: cobertura alta das camadas críticas (Domain + Application próximas de 100%)

### Testes E2E automatizados (frontend) — "bots de qualidade"

> **Nota pro Pedro:** Stack recomendada é **Playwright com TypeScript** (mesma linguagem do front, suporta Chrome/Firefox/Safari, tem emulação de mobile nativa, é o padrão moderno que substituiu Cypress/Selenium em muitos lugares). Python via Selenium também funciona mas é mais verboso. Decisão final pode ficar pra quando chegarmos nessa fase, mas a premissa — **usar `data-testid` nos elementos desde o desenvolvimento do front** — vale pra qualquer ferramenta escolhida.

- [ ] Decidir stack de E2E (Playwright/TS recomendado)
- [ ] Setup do projeto de testes E2E
- [ ] Configurar execução em viewport desktop E mobile (emulação de navegador mobile)
- [ ] Teste E2E: fluxo de cadastro inicial + login
- [ ] Teste E2E: criar categoria e tag nas configurações
- [ ] Teste E2E: criar anotação com IA (fluxo feliz)
- [ ] Teste E2E: criar anotação com IA falhando (fallback manual)
- [ ] Teste E2E: editar anotação existente
- [ ] Teste E2E: concluir anotação e ver em Concluídas
- [ ] Teste E2E: aplicar filtros no Dashboard
- [ ] Teste E2E: aplicar filtros em Concluídas (dia/semana/mês)
- [ ] Rodar toda a suíte E2E em desktop + mobile antes de cada deploy

### Testes manuais de aceitação

- [ ] Passar manualmente por cada critério de "pronto" da Fase 0
- [ ] Validar tom de voz do Liriun em todas as telas
- [ ] Validar responsividade real em celular (não só emulação)

## Fase 6 — Deploy

- [ ] Configurar Railway (backend + variáveis de ambiente)
- [ ] Configurar Vercel (frontend + variáveis de ambiente)
- [ ] Configurar CORS entre front e back em produção
- [ ] Configurar domínio (se for usar custom) ou usar o padrão das plataformas
- [ ] Deploy inicial do backend
- [ ] Deploy inicial do frontend
- [ ] Smoke test em produção (fluxo feliz end-to-end)
- [ ] Rodar suíte E2E apontando pro ambiente de produção (ou staging)
- [ ] Configurar CI/CD básico (push na main → deploy automático)
- [ ] Monitoramento mínimo (logs do Railway, analytics simples se necessário)

## Fase 7 — Pós-lançamento

- [ ] Usar o Liriun no dia a dia por 1-2 semanas
- [ ] Anotar fricções e bugs encontrados
- [ ] Priorizar backlog da V2 com base no uso real
- [ ] Revisar métricas de sucesso definidas na Fase 0

---

## Backlog pós-V1 (não fazer agora)

- Áudio / transcrição
- Notificações push
- Dark mode (confirmar se vai ser padrão ou toggle)
- Export de anotações
- Offline / PWA
- Subtarefas
- Anexos
- Recuperação de senha por email
- Multi-usuário

---

## Observações

- Plano original era Dia 1 (back + Supabase + Railway) e Dia 2 (front + Vercel). Esse cronograma pode ser mantido como meta agressiva, mas esse documento é o plano "completo e honesto" incluindo descoberta, testes e polimento.
- Atualizar este documento conforme decisões mudam — ele é vivo.
