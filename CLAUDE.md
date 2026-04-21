# Contexto do Projeto Jarvis

> **Fonte autoritativa de produto:** `docs/ENTREVISTA.md` (decisões da entrevista de descoberta).
> **Plano de execução:** `docs/DESENVOLVIMENTO.md`.
> Este arquivo é o resumo rápido pra carregar em contexto.

## Sobre o projeto
- Projeto pessoal de preparacao para o PI (Projeto Integrador) da faculdade
- Objetivo: praticar comunicacao frontend/backend com deploy em producao
- Nome: Jarvis - Organizador Pessoal de Ideias e Tarefas

## Decisoes tomadas

### Stack
- Backend: .NET 10 (LTS) com ASP.NET Core Web API + Clean Architecture
- Frontend: Angular 17+ com standalone components, PrimeNG + TailwindCSS, Signals
- Banco: Supabase (PostgreSQL na nuvem)
- IA: Google Gemini API (free tier - usuario tem ~3-5 tarefas/dia)
- Deploy: Vercel (front) + Railway (back) OU Oracle Cloud Free + Docker + dominio proprio — decisao final na Fase 6

### Auth
- Multi-user (Pedro, socio e namorada vao testar, cada um com tarefas privadas)
- Cadastro pede email + senha + nome do usuario (nome serve pra personalizacao do tom do Jarvis)
- Login pede email + senha
- Senha armazenada com hash no banco
- Token JWT no localStorage
- V1 NAO tem: recuperacao de senha, confirmacao de email, reset de senha

### Dominio
- 2 entidades principais: Tarefa e Categoria (N:N entre elas)
- Tag foi UNIFICADA em Categoria — nao existe mais Tag separada
- Categorias sao criadas/editadas pelo usuario via tela de Configuracoes
- Prazos pre-definidos tambem sao criados pelo usuario (duracoes nomeadas: Hoje, Amanha, Essa semana, etc)
- Prazos custom ad-hoc podem ser criados durante a criacao de uma tarefa (valem so pra aquela tarefa, nao viram modelo)
- Categorias ad-hoc criadas durante criacao de tarefa VIRAM modelo permanente
- IA so pode escolher entre as categorias e prazos ja cadastrados pelo usuario
- IA retorna null nos campos quando nao consegue inferir (texto vago)
- Prioridades fixas: urgente, importante, normal, baixa
- Status: pendente, concluida, atrasada (transicao pendente→atrasada e calculada no backend ao listar tarefas, nao e job)
- Ao concluir uma tarefa na tela Minhas Tarefas, o usuario PERMANECE na mesma tela (tarefa some da lista mas a navegacao nao muda) — facilita concluir varias em sequencia
- Horario final da tarefa: opcional, default 23:59 do dia do prazo
- Exclusao de categoria/prazo: BLOQUEADA se tiver tarefa pendente vinculada

### Terminologia oficial
- "Tarefa" (nao "anotacao", nao "nota")
- "Categoria" (nao "tag")
- "Minhas tarefas" (nao "Dashboard")
- "Modo Manual" vs "Modo Jarvis" — os dois modos de criacao

### Fluxo de criacao de tarefa
Usuario escolhe ANTES de digitar qual modo usar (2 botoes: Manual ou Jarvis).

**Modo Manual:**
- Form com: nome (obrigatorio), categorias (multi-select, pode criar categoria inline), prazo (lista OU custom so pra essa tarefa), horario final (opcional), prioridade
- Salva direto

**Modo Jarvis (com IA):**
1. Textarea livre — usuario escreve texto ("comprar fita metrica ate sexta")
2. Backend chama Gemini passando texto + categorias + prazos do usuario
3. Gemini retorna JSON: titulo, categorias[], prazo, prioridade (pode retornar null em campos)
4. Frontend mostra tela de revisao — usuario edita livremente
5. Usuario confirma e salva
6. Se Gemini falhar/timeout/JSON invalido: toast do Jarvis ("Nao consegui dessa vez, preenche manual") + abre form manual com texto bruto no campo nome
7. IA NAO re-categoriza ao editar uma tarefa existente

### Onboarding
- Bloqueante no primeiro acesso apos cadastro
- Usuario pode: aceitar templates padrao, editar templates, ou criar do zero
- Templates padrao de categorias: Trabalho, Faculdade, Casa, Compras, Pessoal
- Templates padrao de prazos: Hoje, Amanha, Essa semana, Esse mes, Sem prazo

### Telas
- Login (email + senha)
- Cadastro (email + senha + nome)
- Onboarding (setup inicial de categorias e prazos)
- Captura rapida (tela principal — escolhe modo Manual ou Jarvis, volta pra ca apos salvar)
- Minhas tarefas (listagem de pendentes e atrasadas, filtro principal configuravel — agrupamento padrao: categoria, ordenacao secundaria: prazo mais proximo, atrasadas em destaque no topo)
- Concluidas (historico completo, filtros por periodo dia/semana/mes, sem desfazer conclusao na V1)
- Configuracoes (gerenciar categorias e prazos)

### Padroes de UI/UX
- Paleta: clonar Linear na cara dura na V1 (dark, cinza-azulado, preto, branco, accent roxo/azul)
- Estilo: clean, denso, profissional
- NAO usar emojis no app final — usar Font Awesome (Free)
- Responsivo desktop + mobile browser (V1 nao e app nativo)
- data-testid obrigatorio em TODOS os elementos interativos — necessario pros testes E2E (Playwright + TS recomendado)

### Tom de voz do Jarvis
- Primeira pessoa sempre (Jarvis do Homem de Ferro, NAO Duolingo)
- Seco, discreto, competente, formal com humor sutil
- Nunca emoji, nunca exclamacao dupla, nunca celebracao exagerada
- Usa nome do usuario com parcimonia (aberturas, erros — nao em toda frase)
- Presente em confirmacoes, estados vazios, erros, loading
- Exemplos:
  - "Anotado, Pedro. Prazo ate sexta, 23:59."
  - "Organizei pra voce: categoria Compras, prazo ate amanha. Confere se fiz certo."
  - "Tudo em dia, Pedro. Nada pra fazer agora."
  - "Nao consegui entender dessa vez. Preenche manual que eu salvo."

### V1 NAO inclui
- Audio/transcricao/voz
- App mobile nativo (V1 e web responsivo)
- Notificacoes push/email
- Dark mode togglavel (V1 e dark-only)
- Export
- Offline/PWA
- Subtarefas
- Anexos
- Recuperacao de senha, confirmacao de email, reset de senha
- Busca textual
- Desfazer conclusao / clonar tarefa concluida
- IA criar categoria ou prazo novo automaticamente
- Metas pessoais / metricas de produtividade no app

### Plano
- Plano agressivo: Dia 1 (backend + banco + deploy back) / Dia 2 (frontend + deploy front). Ver `docs/DESENVOLVIMENTO.md` pro plano completo em fases (descoberta, design, setup, back, front, testes, deploy, pos-lancamento).

## Arquivos do projeto
- `docs/PROJETO.md` - Documento principal completo
- `docs/ENTREVISTA.md` - Descoberta de produto consolidada (fonte autoritativa de decisoes de produto)
- `docs/DESENVOLVIMENTO.md` - Plano de desenvolvimento em fases com checklist
- `docs/ARQUITETURA.md` - Arquitetura do backend (camadas, padrões, convenções, exceções, JWT)
- `docs/FUTURO.md` - Visão de longo prazo / ideias futuras
- `docs/SEMANA.md` - Planejamento da semana corrente
- `docs/fluxos/` - Diagramas e fluxos de uso
- `docs/mocks/` - Protótipos e mocks de UI
- `docs/reuniões/` - Atas e notas de reunião
- `CLAUDE.md` - Este arquivo, contexto resumido pra Claude (fica na raiz pro Claude Code carregar automaticamente)
