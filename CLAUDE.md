# Contexto do Projeto Liriun

> **Fonte autoritativa de produto e arquitetura:** `docs/CONTEXTO_APP.md`.
> **Estratégia / posicionamento:** `docs/ESTRATEGIA_LIRIUN.md`.
> **Backlog futuro:** `docs/IDEIAS_FUTURO.md`.
> **Plano de negócio (PARKED):** `docs/PLANO_NEGOCIO_TEMPLATE.md`.
> **Style guide visual:** `docs/design-ref/Liriun · Visual Reference · Print.pdf`.
> Este arquivo é resumo rápido. Detalhes técnicos completos em `CONTEXTO_APP.md`.

## Sobre o projeto

- Projeto pessoal — preparação para PI (Projeto Integrador) da faculdade
- Nome: **Liriun** — organizador pessoal de tarefas com agente de voz
- Renomeado de "Jarvis" → "Liriun" em 2026-05-03

## Estado atual (2026-05-09)

### V1 web (Angular + .NET) — FUNCIONAL, no ar
Organizador pessoal de tarefas com captura por IA conversacional (texto + voz Gemini multimodal). Stack: Angular 18 + .NET 10 + Supabase Postgres + Gemini API. Ver seção "V1 — Implementado" abaixo pra detalhes do que tem pronto.

### Pivô (2026-05-08) — produto novo em desenvolvimento
Liriun vira **multi-cliente com agente de voz**:
- **App Flutter mobile** (Android + iOS APENAS, sem Web) com agente de voz como diferencial — **Pedro**
- **Site Next.js** que substitui Angular V1 (funcionalidade completa, não só landing) — **sócio**
- **Backend .NET continua como backend principal centralizado**
- **1 Supabase único** (mesmo do V1, mantemos — sem criar projeto novo) usado SÓ como Postgres
- Adicionar plataforma futura (smartwatch, Alexa, etc) = só implementa front

Padrão: **headless backend / multi-client** (Linear, Asana, Slack fazem assim).

```
Web (Next.js)   ─┐
App Flutter     ─┼─→ Backend .NET ─→ Supabase Postgres (1 banco único)
Plataformas fut ─┘   (REST + JWT + Gemini)
```

### Plano de migração Angular V1 → produto novo
1. ✅ Angular V1 (`front/`) **removido do disco** (2026-06-15) — source no histórico git (`3bad961^`)
2. Pedro cria app Flutter cobrindo tudo que Angular fazia
3. Sócio migra → Next.js (`site/`) cobrindo tudo que Angular fazia
4. Evolução continua só no app + site (novas features daí pra frente)
5. Schema do banco evolui livre — sem mais Angular pra quebrar

## Decisões tomadas (2026-05-09)

### Stack
| Camada | Tecnologia |
|---|---|
| Backend | **.NET 10** + ASP.NET Core Web API + Clean Architecture (Liriun.Core/Application/Infrastructure/Api) |
| Banco | **Supabase Postgres** — **mesmo do V1** (1 banco único, sem criar projeto novo) |
| Auth | **JWT próprio do .NET** + Google/Apple Sign-In via OAuth no .NET |
| App mobile | **Flutter** (Android + iOS APENAS — sem Web) + **Riverpod** + **feature-first** (`/lib/features/{auth,tarefas,agente,categorias,config}`) |
| IDE Flutter | **VS Code** + extensão Flutter + Dart (Android Studio só pra SDK + emulador) |
| Site web | **Next.js 15** (App Router) + Tailwind v4 + shadcn/ui + Framer Motion + React Query |
| HTTP client | dio (Flutter) / fetch + React Query (Next.js) |
| Codegen | OpenAPI Generator (Dart + TypeScript clients gerados a partir do .NET) |
| IA | Google Gemini API (default `gemini-2.0-flash`) |
| STT/TTS | Nativo do dispositivo (sem custo) |
| Push | Firebase Cloud Messaging |
| Hosting backend | Oracle Cloud Free / Railway (decidir mais perto da publicação) |
| Hosting site | Vercel (free tier) |

### Domínio (mantido do V1, evolui no novo)
- 2 entidades: Tarefa e Categoria (N:N entre elas)
- Tag UNIFICADA em Categoria
- `Tarefa.DataPrazo: DateTime?` + `Tarefa.HorarioFinal: TimeSpan?` (ambos opcionais)
- Apresentação relativa ("Hoje", "Amanhã", "Em N dias") calculada na tela
- Categorias ad-hoc na criação viram modelo permanente
- IA só escolhe entre categorias do usuário; retorna null quando não infere
- Prioridades fixas: urgente, importante, normal, baixa
- Status: pendente, concluida, atrasada (calculado no backend, fuso BRT `America/Sao_Paulo`)
- Concluir tarefa: usuário PERMANECE na tela (concluir várias em sequência)
- Exclusão de categoria BLOQUEADA se tiver tarefa pendente vinculada

### Terminologia oficial
- "Tarefa" (não "anotação", não "nota")
- "Categoria" (não "tag")
- "Minhas tarefas" / "Tarefas" (não "Dashboard")
- "Visão geral" pra dashboard home
- "Modo Manual" vs "Modo Liriun" — os dois modos de criação

### Fluxo de criação de tarefa
Usuário escolhe ANTES de digitar qual modo usar (2 botões: Manual ou Liriun).

**Modo Manual:** form (nome, categorias, data, hora, prioridade) → salva direto.

**Modo Liriun:**
1. Texto OU áudio (mic)
2. Backend .NET chama Gemini com texto + categorias do usuário (áudio: multimodal `inlineData`)
3. Gemini retorna JSON: `titulo, categorias[], data, hora?, prioridade, observacoes, transcricaoUsuario`
4. Front mostra card de revisão → usuário edita ou salva
5. Auto-save quando user confirma "salva"/"sim"/"pode salvar" via texto/voz E já tinha sugestão na tela
6. Falha Gemini/timeout/JSON inválido: mensagem específica + opção manual
7. Rate limit 429: `"Bati no limite. Espera ~Xs e tenta de novo."`
8. IA NÃO re-categoriza ao editar tarefa existente

### Modos de IA (one-shot vs interativo)
Controlado por `GeminiOptions.ModoInterativo` (default `false`).
- **One-shot:** Liriun NÃO faz perguntas. Retorna `completo=true`. Observações copiam "onde/como" CRU.
- **Interativo (reservado pro plano pago):** até 3 perguntas + checklist. Código preservado em `GeminiService.MontarInstrucaoInterativo`.

### Onboarding
- Bloqueante no primeiro acesso pós-cadastro
- Pergunta: nome do usuário, nome do agente ("como me chamar?"), categorias
- Templates padrão: Trabalho, Faculdade, Casa, Compras, Pessoal

### Identidade visual
- Style guide oficial: `docs/design-ref/Liriun · Visual Reference · Print.pdf`
- Estilo: misto **Things 3 + Granola + Arc Search + iOS 26 Liquid Glass**
- Dark mode default, gradiente roxo→azul accent, glassmorphism sutil
- Sem emojis. Ícones lineares finos (Lucide pro web, equivalente Flutter)
- App e site compartilham mesma identidade visual

### Tom de voz do Liriun
- Primeira pessoa sempre (mordomo digital seco e competente)
- Nunca emoji, nunca exclamação dupla, nunca celebração exagerada
- Nome do usuário com parcimônia (aberturas, erros — não em toda frase)
- Exemplos: "Anotado, Pedro. Prazo até sexta, 23:59." / "Tudo em dia, Pedro." / "Não consegui entender dessa vez. Preenche manual que eu salvo."
- **Reavaliar pós-MVP** quando definir voz final (TTS nativo no MVP, upgrade futuro se incomodar)

### PARKED (não decidir agora — só pós-MVP funcional)
- Pricing / monetização
- Publicação App Store ($99/ano) + Google Play ($25 único)
- Wake word ("Hey Liriun") — Fase 3
- Lembretes SMS/ligação via Twilio — Fase 5
- Build iOS (sócio testa quando finalizar)
- Offline-first (V2)
- Mascote, Pomodoro, companheiro chat (Tier 7)

---

## V1 — Implementado ✅ (Angular + .NET, ainda no ar)

> Esse foi o produto pré-pivô. Funcionalidade segue funcional. Site Next.js novo vai cobrir tudo isso e substituir.

**Auth & Onboarding**
- ✅ Cadastro/login com JWT + hash BCrypt
- ✅ Onboarding bloqueante de categorias

**Captura**
- ✅ Modo Manual (form completo)
- ✅ Modo Liriun (texto)
- ✅ Modo Liriun por áudio (Gemini multimodal)
  - Waveform AnalyserNode durante gravação
  - Preview/playback antes de enviar
  - Auto-stop em 60s
  - Atalho `Ctrl+Espaço` toggle gravação
- ✅ Auto-save quando user confirma sugestão
- ✅ Quick-reply chips ("Salva", "Muda data", etc)
- ✅ Persistência rascunho/conversa em localStorage (TTL 1h)
- ✅ Continuar conversa pós-save

**Tarefas**
- ✅ 3 visualizações: Lista, Quadro (Kanban), Semana (Seg-Dom com hora atual)
- ✅ Atrasadas em destaque
- ✅ Filtros (status, prioridade, categoria) em dropdown popover
- ✅ Categorias com bloqueio de exclusão
- ✅ Status atrasada respeita fuso BRT
- ✅ Reabrir tarefa concluída
- ✅ Detalhe modal + edit unificado
- ✅ Concluídas com filtro por período

**Visão geral**
- ✅ Dashboard home: 4 stat cards, gráfico atividade semana, donut categorias, agenda do dia (timeline com linha "agora"), pendentes por prioridade

**UI/UX V1 (Angular)**
- ✅ Tema claro/escuro togglável (`ThemeService`)
- ✅ Sidebar collapsible
- ✅ Header global via `PageHeaderService`
- ✅ Microanimações Tailwind keyframes
- ✅ Date/Time pickers customizados (portal pro body)
- ✅ Confirmações destrutivas: `<app-confirm-modal>` (NUNCA `confirm()` nativo)
- ✅ Erros HTTP: helper `extrairProblemDetails(err, fallback)`

**Backend**
- ✅ Clean Architecture (Core/Application/Infrastructure/Api) sem violations
- ✅ Result<T> + ProblemDetails RFC 7807
- ✅ FluentValidation
- ✅ Migrations EF Core aplicadas no Supabase V1
- ✅ Rate limit 429 do Gemini tratado

**Rebrand Jarvis → Liriun (2026-05-03)**
- ✅ Namespaces `Liriun.{Core,Application,Infrastructure,Api}`
- ✅ `LiriunDbContext`, `ConnectionStrings:Liriun`
- ✅ JWT issuer `liriun-api` / audience `liriun-app`
- ✅ Contract `papel: 'liriun'` (`PapelConversa.Liriun`)
- ✅ ProblemDetails Type `https://liriun-api/erros/...`
- ✅ Frontend Angular: `liriun.token`/`liriun.user` localStorage, `PapelMensagem = 'liriun'`
- ✅ Solution `Liriun.slnx`, http file `Liriun.Api.http`

---

## Próxima etapa — produto novo (Fase 1 MVP)

Detalhes em `docs/CONTEXTO_APP.md` seção 4. Resumo das 3 frentes paralelas:

### Backend .NET (mantido — pequenos ajustes)
- Banco continua o **mesmo** (Supabase atual do V1)
- OpenAPI/Swagger detalhado pra codegen
- CORS pra `liriun.com` + `localhost:3000` (dev Next) — Flutter mobile não precisa CORS
- Adicionar Google + Apple Sign-In via OAuth (conforme app evoluir)

### App Flutter — Pedro (do zero)
- Instalar Flutter SDK + Android Studio (só SDK + emulador) + VS Code
- `flutter create liriun_app` na pasta `app/`
- Estrutura feature-first (`/lib/features/{auth,tarefas,agente,categorias,config}`)
- Riverpod, dio, client gerado do OpenAPI
- Telas: login, cadastro, onboarding, conversa com agente, tarefas, configurações
- STT/TTS nativos
- Firebase Cloud Messaging
- Compila pra Android + iOS (sem Web)

### Site Next.js — sócio (substitui Angular V1)
- `create-next-app` + Tailwind + shadcn/ui
- Tokens do design system (`docs/design-ref/`)
- Mesmas funcionalidades do V1 (login, tarefas, agente, config)
- Client TypeScript gerado do OpenAPI
- Deploy Vercel

### Migração Angular V1
- ✅ `front/` Angular removido do disco (2026-06-15) — source no histórico git (`3bad961^`)
- Site `site/` (Next.js) e app Flutter assumem todas as funcionalidades
- Schema banco evolui livre — sem mais Angular pra quebrar

## Roadmap de fases (alto nível)

| Fase | Foco |
|---|---|
| **Fase 1 (MVP)** | Backend + site novo + app Flutter funcionais |
| Fase 2 | Acesso rápido (widgets, atalhos, push) |
| Fase 3 | Wake word + always listening |
| Fase 4 | Integração com calendários (Google, Apple, Outlook) |
| Fase 5 | Lembretes avançados (SMS + ligação via Twilio) |
| Fase 6 | Lojas + monetização |
| Fase 7+ | Mascote, Pomodoro, companheiro chat (Tier 7) |

---

## Arquivos do projeto

### Ativos (raiz)
- `CLAUDE.md` — este arquivo (resumo pra Claude Code)
- `README.md` — README operacional do repo

### Ativos (docs/)
- `CONTEXTO_APP.md` — **fonte autoritativa de arquitetura e decisões técnicas**
- `ESTRATEGIA_LIRIUN.md` — posicionamento, concorrência, pilares
- `IDEIAS_FUTURO.md` — backlog priorizado por tier
- `PLANO_NEGOCIO_TEMPLATE.md` — PARKED até MVP
- `design-ref/` — style guide oficial (PDF + ícones + glyph)

### Arquivados (docs/docs-arquivados/)
Documentos do V1 web mantidos como referência histórica:
- `ARCHITECTURE.md`, `CHECKLIST_PRODUCAO.md`, `CORRECOES_V1.md`, `DEPLOY.md`
- `DESENVOLVIMENTO.md`, `ENTREVISTA.md`, `PROJETO.md`, `banco/MIGRATIONS.md`

### Documentos legais (docs/termos-de-uso/)
- `TERMOS_USO.md`, `POLITICA_PRIVACIDADE.md`

### Código
- `backend/` — .NET (PRINCIPAL, evoluindo)
- `site/` — Next.js 15 (institucional pronto + área logada em construção; substitui o Angular V1) — **sócio**
- `app/` — Flutter mobile (Android + iOS) — **Pedro**
- `front/` — **REMOVIDO** (Angular V1 apagado do disco em 2026-06-15; source preservado no histórico git em `3bad961^` se precisar consultar)

> **Estratégia de repo:** monorepo único (`backend/` + `site/` + `app/` na mesma branch `main`). Decisão e gatilhos de split em `docs/CONTEXTO_APP.md`.
