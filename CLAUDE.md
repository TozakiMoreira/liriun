# Contexto do Projeto Liriun

> **Fonte autoritativa de produto:** `docs/ENTREVISTA.md` (decisões da entrevista de descoberta).
> **Plano de execução:** `docs/DESENVOLVIMENTO.md`.
> Este arquivo é o resumo rápido pra carregar em contexto.

## Sobre o projeto
- Projeto pessoal de preparacao para o PI (Projeto Integrador) da faculdade
- Objetivo: praticar comunicacao frontend/backend com deploy em producao
- Nome: **Liriun** — Organizador Pessoal de Ideias e Tarefas
- Renomeado de "Jarvis" → "Liriun" em 2026-05-03. Namespaces .NET (`Jarvis.Core`, `Jarvis.Api`, etc) e localStorage keys de sessao (`jarvis.token`, `jarvis.user`) MANTIDOS por custo de migracao. Backend ainda valida `papel: 'jarvis'` no JSON de conversa — trocar exige migration de validator + use case. Marcado pra V2.

## Decisoes tomadas

### Stack
- Backend: .NET 10 (LTS) com ASP.NET Core Web API + Clean Architecture
- Frontend: Angular 18 com standalone components, signals, TailwindCSS, fonte Sora
- Banco: Supabase (PostgreSQL na nuvem)
- IA: Google Gemini API (default `gemini-2.0-flash`, configuravel via `Gemini:Model`)
- Deploy: Vercel (front) + Railway (back) OU Oracle Cloud Free + Docker + dominio proprio — decisao final na Fase 6

### Auth
- Multi-user (cada usuario com tarefas privadas)
- Cadastro pede email + senha + nome (nome serve pra personalizacao do tom do Liriun)
- Login pede email + senha
- Senha armazenada com hash no banco
- Token JWT no localStorage
- V1 NAO tem: recuperacao de senha, confirmacao de email, reset de senha

### Dominio
- 2 entidades principais: Tarefa e Categoria (N:N entre elas)
- Tag foi UNIFICADA em Categoria — nao existe mais Tag separada
- Categorias sao criadas/editadas pelo usuario via tela de Configuracoes
- **Prazo NAO e entidade.** Cada tarefa tem `DataPrazo: DateTime?` e `HorarioFinal: TimeSpan?` direto, ambos opcionais. Decidido em 2026-04-30.
- Apresentacao relativa ("Hoje", "Amanha", "Em N dias") calculada na tela de Minhas Tarefas a partir de `DataPrazo`.
- Categorias ad-hoc criadas durante criacao de tarefa VIRAM modelo permanente
- IA so pode escolher entre as categorias ja cadastradas pelo usuario
- IA retorna null nos campos quando nao consegue inferir (texto vago)
- Prioridades fixas: urgente, importante, normal, baixa
- Status: pendente, concluida, atrasada (transicao pendente→atrasada calculada no backend ao listar)
- Status atrasada considera fuso BRT (`America/Sao_Paulo`) — backend converte UTC pra local (`Tarefa.ConverterParaFusoUsuario`).
- Ao concluir tarefa, o usuario PERMANECE na mesma tela (facilita concluir varias em sequencia)
- HorarioFinal opcional. Quando null, status atrasado considera fim do dia (23:59:59).
- Exclusao de categoria: BLOQUEADA se tiver tarefa pendente vinculada

### Terminologia oficial
- "Tarefa" (nao "anotacao", nao "nota")
- "Categoria" (nao "tag")
- "Minhas tarefas" / "Tarefas" (nao "Dashboard")
- "Visao geral" pra pagina home/dashboard
- "Modo Manual" vs "Modo Liriun" — os dois modos de criacao
- Componente `<app-brand>` renderiza nome — sempre usar em vez de hardcoded "Liriun"

### Fluxo de criacao de tarefa
Usuario escolhe ANTES de digitar qual modo usar (2 botoes: Manual ou Liriun).

**Modo Manual:**
- Form com: nome (obrigatorio), categorias (multi-select), data (opcional), hora (opcional, exige data), prioridade
- Salva direto

**Modo Liriun (com IA):**
1. Textarea livre OU audio (mic) — usuario escreve/fala texto
2. Backend chama Gemini passando texto + categorias do usuario (audio: multimodal `inlineData`)
3. Gemini retorna JSON: titulo, categorias[], data, hora opcional, prioridade, observacoes, transcricaoUsuario (audio)
4. Frontend mostra card de revisao — usuario edita ou salva
5. Auto-save quando user confirma "salva"/"sim"/"pode salvar" via texto/voz E ja tinha sugestao na tela
6. Se Gemini falhar/timeout/JSON invalido: mensagem de erro especifica + opcao manual
7. Rate limit 429: mensagem `"Bati no limite. Espera ~Xs e tenta de novo."`
8. IA NAO re-categoriza ao editar tarefa existente

### Modos de IA (one-shot vs interativo)
Decidido em 2026-05-02. Controlado por `GeminiOptions.ModoInterativo` (default `false`).

- **One-shot (default):** Liriun NAO faz perguntas. Sempre retorna `completo=true` com tarefa preenchida. Campos faltantes ficam null. Observacoes copiam o "onde/como" CRU.
- **Interativo (reservado pro plano pago):** Liriun pode fazer ate 3 perguntas de contexto e enriquece observacoes com checklist. Codigo PRESERVADO em `GeminiService.MontarInstrucaoInterativo` — nao remover.

Motivacao: economizar tokens. One-shot fecha em 1 turno com prompt ~75% menor.

### Onboarding
- Bloqueante no primeiro acesso apos cadastro
- So pergunta categorias
- Templates padrao: Trabalho, Faculdade, Casa, Compras, Pessoal
- Usuario pode aceitar templates, editar ou criar do zero

### Telas (V1)
- Landing publica em `/`
- Login (email + senha)
- Cadastro (email + senha + nome)
- Onboarding (categorias)
- Visao geral em `/app/visao-geral` — DEFAULT da area autenticada
- Captura rapida em `/app/captura` (escolhe Manual ou Liriun)
- Tarefas em `/app/tarefas` (lista + Quadro + Semana)
- Concluidas em `/app/concluidas`
- Configuracoes em `/app/configuracoes`
- Alterar senha em `/app/configuracoes/alterar-senha`
- Shell autenticado vive em `/app/*` com header global (`PageHeaderService`)

### Padroes de UI/UX
- Paleta: Linear-style (dark default, cinza-azulado, accent roxo). Tema claro disponivel via `ThemeService` (toggle iOS-style global)
- Estilo: clean, denso, profissional
- NAO usar emojis no app — usar Font Awesome (Free)
- Responsivo desktop + mobile browser (V1 nao e app nativo)
- data-testid obrigatorio em TODOS elementos interativos
- Microanimacoes: Tailwind keyframes (`animate-fade-up`, `animate-scale-in`, etc) + diretiva `appStaggerIn` pra entradas em cascade
- Modais sempre com backdrop `animate-fade-in` + card `animate-scale-in`
- Confirmacoes destrutivas: `<app-confirm-modal>` (NUNCA `confirm()` nativo)
- Erros HTTP: helper `extrairProblemDetails(err, fallback)` — nunca ler `err.error.mensagem`
- Botoes submit: desabilitar SO durante carregamento, nunca em `f.invalid`
- Form sem `required`/`pattern` HTML5 — usar `novalidate`, validar em TS
- Botoes icone-only: `aria-label` obrigatorio
- Header global gerenciado por `PageHeaderService`. Cada componente seta `titulo`/`iconeClasse`/`subtituloTpl`/`voltar` no constructor + `ngAfterViewInit`. Limpar em `onDestroy`.
- Date/Time pickers usam portal pro `document.body` (escapa overflow do modal)

### Tom de voz do Liriun
- Primeira pessoa sempre (mordomo digital)
- Seco, discreto, competente, formal com humor sutil
- Nunca emoji, nunca exclamacao dupla, nunca celebracao exagerada
- Usa nome do usuario com parcimonia (aberturas, erros — nao em toda frase)
- Presente em confirmacoes, estados vazios, erros, loading
- Exemplos:
  - "Anotado, Pedro. Prazo ate sexta, 23:59."
  - "Organizei pra voce: categoria Compras, prazo ate amanha. Confere se fiz certo."
  - "Tudo em dia, Pedro. Nada pra fazer agora."
  - "Nao consegui entender dessa vez. Preenche manual que eu salvo."

---

## V1 — Implementado ✅

**Auth & Onboarding**
- ✅ Cadastro/login com JWT + hash
- ✅ Onboarding bloqueante de categorias

**Captura**
- ✅ Modo Manual (form completo)
- ✅ Modo Liriun (texto)
- ✅ Modo Liriun por audio (Gemini multimodal — adicionado em 2026-05-02 a pedido do user, originalmente V2)
  - Waveform AnalyserNode durante gravacao
  - Preview/playback antes de enviar
  - Auto-stop em 60s
  - Atalho `Ctrl+Espaco` toggle gravacao
- ✅ Auto-save quando user confirma sugestao
- ✅ Quick-reply chips ("Salva", "Muda data", etc)
- ✅ Persistencia rascunho/conversa em localStorage (TTL 1h)
- ✅ Continuar conversa pos-save (Liriun pergunta proxima)

**Tarefas**
- ✅ 3 visualizacoes: Lista, Quadro (Kanban), Semana (calendario Seg-Dom com hora atual)
- ✅ Atrasadas em destaque
- ✅ Filtros (status, prioridade, categoria) em dropdown popover
- ✅ Categorias com bloqueio de exclusao
- ✅ Status atrasada respeita fuso BRT
- ✅ Reabrir tarefa concluida (originalmente excluida da V1, adicionado por necessidade UX)
- ✅ Detalhe modal + edit unificado
- ✅ Concluidas com filtro por periodo

**Visao geral (NEW V1)**
- ✅ Dashboard home: 4 stat cards, gráfico atividade semana (barras), donut categorias, agenda do dia (timeline com linha "agora"), pendentes por prioridade, listas pra hoje + feitas semana
- ✅ Saudacao dinamica com nome + foto

**UI/UX**
- ✅ Tema claro/escuro togglavel (originalmente V2 — adicionado por demanda)
- ✅ Toggle de tema iOS-style (componente shared)
- ✅ Sidebar collapsible
- ✅ Header global via `PageHeaderService`
- ✅ Microanimacoes (entrada cascade, hover lift, modais scale-in)
- ✅ Date/Time pickers customizados (portal pro body, evita clip de modal)
- ✅ Toast verde de sucesso ao salvar tarefa
- ✅ Logo correto (`/logocorreta.png`)

**Backend**
- ✅ Clean Architecture (Core/Application/Infrastructure/Api) sem violations
- ✅ Result<T> + ProblemDetails RFC 7807
- ✅ FluentValidation
- ✅ Migrations EF Core aplicadas no Supabase
- ✅ Rate limit 429 do Gemini tratado com mensagem especifica

---

## V2 — Pendente / Backlog 📋

**Pre-V1 (deve entrar antes do demo PI):**
- 🔴 Atualizar `environment.prod.ts` apiUrl (atual aponta `api.jarvis.app` que nao existe)
- 🔴 Mover CORS allowed origins pra config (atualmente hardcoded `localhost:4200`)
- 🔴 Trocar ProblemDetails Type strings `"https://jarvis-api/erros/..."` → `"https://liriun-api/..."`
- 🔴 Onboarding guard: bloquear `/app/*` se categorias.length === 0
- 🔴 5 componentes Angular precisam `OnDestroy.limpar()` no PageHeader (visao-geral, tarefas, concluidas, configuracoes, alterar-senha)
- 🔴 Login/Cadastro: refatorar `aplicarErroBackend` pra usar `extrairProblemDetails` (DRY)
- 🟡 Mensagens de validacao expoem "jarvis" pro user (`ConversarCapturaValidator`, useCase)

**Backend rebrand completo (V2):**
- Renomear assemblies/namespaces `Jarvis.*` → `Liriun.*`
- Trocar `papel: 'jarvis'` no JSON contract → `papel: 'liriun'` (validator, use case, enum)
- JWT issuer/audience `jarvis-api`/`jarvis-app` → `liriun-*`
- localStorage keys `jarvis.token`/`jarvis.user` (forca relogin de todos users)
- data-testid `jarvis-*` restantes

**Features V2:**
- App mobile nativo (Expo lab existe em `/front2`)
- Notificacoes push/email (prazo se aproximando, atrasada)
- Recorrencia de tarefas
- Captura via Telegram/WhatsApp
- Recuperacao de senha (envio email)
- Reset de senha
- Confirmacao de email
- Busca textual
- Subtarefas / checklist
- Anexos (links, imagens)
- Export JSON/CSV
- PWA com modo offline
- Modo "captura instantanea" (sem revisao)
- Streaming de resposta Gemini (SSE)
- Historico de conversas persistido em DB (sidebar tipo ChatGPT)
- FFmpeg conversion webm → ogg (audio compat 100%)
- Gemini 2.5-flash com retry-after exponential backoff
- VAD (auto-stop quando user para de falar)
- Hold-to-record (paradigma WhatsApp puro)
- IA cria categoria nova automaticamente
- Re-categorizacao automatica ao editar
- Metas pessoais / metricas de produtividade
- Insights / analise pessoal
- Templates de anotacao
- Pesquisa semantica (embeddings)
- Lembretes geolocalizacao
- Tema personalizavel pelo user (paleta custom)
- Plano pago: mascote, Pomodoro, minigames, Liriun companheiro

**Excluido permanentemente da V1 (mantido em V2 backlog):**
- Notificacoes push/email
- App mobile nativo
- Modo dark/light togglavel ✅ — JA ENTROU NA V1
- Audio/voz ✅ — JA ENTROU NA V1
- Reabrir concluida ✅ — JA ENTROU NA V1
- Visao geral ✅ — JA ENTROU NA V1

---

## Plano
- Plano agressivo: Dia 1 (backend + banco + deploy back) / Dia 2 (frontend + deploy front). Ver `docs/DESENVOLVIMENTO.md` pro plano completo em fases.

## Arquivos do projeto
- `docs/PROJETO.md` - Documento principal completo
- `docs/ENTREVISTA.md` - Descoberta de produto consolidada (fonte autoritativa de decisoes)
- `docs/DESENVOLVIMENTO.md` - Plano de desenvolvimento em fases com checklist
- `backend/ARCHITECTURE.md` - Arquitetura do backend (Clean Architecture, Result<T>, ProblemDetails, FluentValidation, Read/Write repos)
- `docs/FUTURO.md` - Visão de longo prazo / ideias futuras
- `docs/CHECKLIST_PRODUCAO.md` - Itens a varrer antes de abrir cadastro publico
- `docs/banco/MIGRATIONS.md` - Tutorial de comandos `dotnet ef` pra migrations
- `CLAUDE.md` - Este arquivo, contexto resumido pra Claude (fica na raiz pro Claude Code carregar automaticamente)
