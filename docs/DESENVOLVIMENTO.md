# Plano de Desenvolvimento — Jarvis

Documento de acompanhamento do desenvolvimento do Jarvis, do zero até estar publicado e funcional. Cada fase tem um checklist. Marque `[x]` conforme concluir.

---

## Fase 0 — Descoberta e definição (estamos aqui)

- [ ] Entrevista estruturada (ENTREVISTA.md) — propósito, público, dor, casos de uso
- [ ] Personas (mesmo sendo single-user, formalizar 1 persona)
- [ ] Escopo positivo da V1 (tudo que o app FARÁ)
- [ ] Escopo negativo da V1 (tudo que o app NÃO FARÁ — fica pra V2)
- [ ] Critérios de "pronto" (Definition of Done da V1)
- [ ] Métricas de sucesso pessoais (como saber se o Jarvis cumpriu o papel)
- [ ] Riscos técnicos conhecidos (rate limits, cold starts, free tier, etc)
- [ ] Glossário de termos do projeto
- [ ] **Estratégia de internacionalização (i18n)** — decidir agora como estruturar traduções, mesmo que a V1 saia só em pt-BR. Visão de longo prazo: Jarvis publicado globalmente com **suporte a 5+ línguas até o fim de 2026**. Definir: formato dos arquivos de tradução (JSON, XLIFF, PO), fallback de idioma, detecção automática, chave de tradução (camelCase vs dot.notation), handling do tom do Jarvis em outros idiomas

## Fase 1 — Design e arquitetura

- [ ] Fluxograma completo de navegação (todas as telas e transições)
- [ ] Fluxograma dos fluxos principais (criação de anotação com IA, fallback manual, etc)
- [ ] Mockups das telas da V1 (estilo Linear — clean e profissional)
- [ ] Revisão e aprovação dos mockups
- [ ] Modelagem do banco de dados (ER das entidades: User, Note, Category, Tag, NoteTag)
- [ ] Definição dos contratos de API (endpoints, DTOs de request/response)
- [ ] Arquitetura do backend (Clean Architecture — camadas definidas)
- [ ] Arquitetura do frontend (estrutura de pastas, state management com Signals)
- [ ] Estratégia de autenticação (fluxo JWT, expiração, refresh se houver)
- [ ] Arquitetura de i18n no código — nenhuma string hardcoded em pt-BR no código. Todas passam por chave de tradução desde o primeiro componente/endpoint da V1

## Fase 2 — Setup de ambiente

- [x] Criar repositório Git
- [x] Configurar projeto Supabase (banco PostgreSQL)
- [ ] Obter chave da Google Gemini API
- [x] Criar projeto .NET 10 Web API com Clean Architecture
- [ ] Criar projeto Angular 17+ com standalone components
- [ ] Configurar PrimeNG + TailwindCSS no front
- [ ] Configurar ESLint/Prettier (front) e analyzers (back)
- [x] Configurar variáveis de ambiente (user-secrets pra dev)
- [x] README inicial com instruções de setup local

## Fase 3 — Backend

- [x] Migrations/schema inicial do banco (tabelas das entidades)
- [x] Camada de Domain (entidades, enums de prioridade/status)
- [~] Camada de Application (use cases, interfaces) — Auth pronto; falta Categorias/Prazos/Tarefas/IA
- [~] Camada de Infrastructure (repositories, EF Core) — repos e auth prontos; falta cliente Gemini
- [~] Camada de API (controllers, middleware, validação) — AuthController + middleware prontos
- [ ] Setup de `IStringLocalizer` (ASP.NET) com resource files — mensagens de erro, validação e respostas do Jarvis via chave de tradução (V1 preenche só pt-BR)
- [x] Endpoints de autenticação (cadastro + login + JWT)
- [ ] CRUD de categorias
- [ ] CRUD de prazos
- [ ] CRUD de tarefas (com relação N:N com categorias)
- [ ] Endpoint de análise pela IA (recebe texto, retorna sugestões)
- [ ] Endpoint de conclusão de tarefas
- [ ] Filtros no listagem (pendentes, concluídas por período)
- [x] Tratamento de erros global (ExceptionHandlingMiddleware)
- [ ] Logs estruturados (Serilog)

## Fase 4 — Frontend

- [ ] Configurar `@angular/localize` e estrutura de arquivos de tradução (XLIFF ou JSON) desde o primeiro commit — todas as strings do frontend via chave, V1 preenche só pt-BR
- [ ] Layout base e shell da aplicação (estilo Linear)
- [ ] Sistema de rotas com guards de autenticação
- [ ] Serviços de API (interceptor de JWT, tratamento de erro)
- [ ] Tela de Login
- [ ] Tela de Configurações (gerenciar categorias e tags)
- [ ] Tela de Captura Rápida (input principal + fluxo IA + revisão)
- [ ] Tela de Dashboard (anotações pendentes com filtros)
- [ ] Tela de Concluídas (filtros por dia/semana/mês)
- [ ] Componentes reutilizáveis (cards, chips, inputs, botões)
- [ ] Tom de voz do Jarvis (mensagens em primeira pessoa)
- [ ] Responsividade desktop + mobile (navegador)
- [ ] **Adicionar `data-testid` (IDs de QA) em todos os elementos interativos e estados visíveis** — necessários pros testes automatizados da Fase 5

## Fase 5 — Testes

### Testes unitários (backend)

- [ ] Setup do projeto de testes (xUnit)
- [ ] Testes de Domain (regras de negócio das entidades)
- [ ] Testes de Application (use cases com mocks)
- [ ] Testes de Infrastructure (repositories com banco em memória ou Testcontainers)
- [ ] Testes de API (controllers, validações)
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
- [ ] Validar tom de voz do Jarvis em todas as telas
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

- [ ] Usar o Jarvis no dia a dia por 1-2 semanas
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
