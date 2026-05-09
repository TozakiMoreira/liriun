# Liriun App — Contexto e Decisoes

> Documento de continuidade. Criado em 2026-05-08. Ultima atualizacao 2026-05-09.
> Retomar a partir daqui na proxima sessao.
> **Referencia visual:** `docs/design-ref/Liriun · Visual Reference · Print.pdf` (style guide oficial — paleta, tipografia, componentes, mockups). Icones: `liriun-icon-1024.png`, `liriun-glyph.svg`, etc na mesma pasta.

---

## 1. Visao do produto

O Liriun sera um **app mobile** (Android + iOS + Web) que funciona como um **agente pessoal por voz**, similar a uma Alexa pessoal. O usuario fala e o Liriun organiza, cria, consulta, conclui tarefas e gerencia sua agenda.

O agente funciona como **interceptador**: usuario fala -> agente interpreta -> chama backend -> recebe dados -> responde por voz. Sem historico de conversa persistente, cada interacao eh independente (mais barato, mais confiavel).

### Core features desejadas
- Criar tarefas por voz (com IA extraindo titulo, categoria, prazo, prioridade)
- Consultar tarefas por voz ("quais itens de limpeza da minha lista de mercado?")
- Concluir/reabrir/remanejar tarefas por voz
- Criar tarefas manualmente pelo app (modo manual + modo IA — ja existe no web)
- Nome do agente customizavel pelo usuario (cada um escolhe o nome do seu Liriun)
- Wake word customizado com o nome escolhido (ex: "Hey Bolsonaro")
- Funcionar em background / com tela bloqueada (always listening)
- Integracao com Google Calendar, Apple Calendar, Outlook Calendar
- Lembretes por SMS, ligacao ou push notification
- Personalizacao do agente pelo usuario
- **Resposta por voz (TTS)** — Liriun fala de volta pro usuario

---

## 2. Decisoes tomadas

### Arquitetura geral — multi-client com backend centralizado

```
                    ┌──────────────────┐
App Flutter (iOS)   │                  │
App Flutter (Andr)  │                  │
Site Next.js (web)  ├──REST API────────│ Backend .NET ──→ Supabase Postgres
Smartwatch (futuro) │   (JWT)          │   ├─ Auth (JWT)         (DB only)
Alexa Skill (fut)   │                  │   ├─ Validacao
Browser ext (fut)   │                  │   ├─ Logica de negocio
...                 └──────────────────┘   └─ Chama Gemini API
```

**Padrao "headless backend / multi-client":**
- Backend .NET = fonte unica de verdade (logica + dados + auth)
- Cada cliente novo (web, mobile, smartwatch, Alexa, etc) consome a MESMA API
- Adicionar plataforma nova nao exige mexer no backend, so implementa front
- Padrao usado por Linear, Asana, Slack, Notion, Discord, Spotify
- **Decidido 2026-05-09 apos analise de escalabilidade longo prazo**

### Stack do backend (compartilhado por todos clientes)
| Camada | Tecnologia | Motivo |
|---|---|---|
| Backend | **.NET 10** + ASP.NET Core Web API | Mantem codigo Clean Architecture ja construido (Result<T>, ProblemDetails, FluentValidation, Read/Write repos). Type-safe, escala infinita, padrao de mercado |
| Banco | **Supabase Postgres** (DB only) | Postgres gerenciado, free tier generoso (500MB), backup automatico. NAO usa Auth/RLS/Edge Functions — so como banco |
| Auth | **JWT proprio do .NET** | Ja implementado. Issuer `liriun-api` / audience `liriun-app`. Ainda decidir: Google/Apple Sign-In via OAuth no .NET |
| Migracoes | **EF Core migrations** | Ja em uso. Comandos em `docs/banco/MIGRATIONS.md` (arquivado) |
| IA/NLU | **Google Gemini API (Flash-Lite pago)** | Backend .NET chama Gemini. Mantem API key segura no servidor. ~$1.30/mes com 1000 usuarios |
| Hosting (producao) | **Oracle Cloud Free** ou **Railway** | Oracle Free aguenta MVP+ por anos sem custo. Railway ~$5-25/mes. Decidir mais perto da publicacao |
| Cache (futuro) | Redis | So quando precisar (V2+) |
| Background jobs (futuro) | Hangfire ou Quartz.NET | Lembretes agendados, notificacoes em massa |

### Stack do app mobile (Flutter)
| Camada | Tecnologia | Motivo |
|---|---|---|
| Framework | **Flutter** (Dart) | Um codebase pra Android + iOS + Web. Performance pra audio/ML on-device, UI consistente |
| State management | **Riverpod** | Padrao de mercado 2026, type-safe, escala bem |
| Estrutura de pastas | **Feature-first** (`/auth`, `/tarefas`, `/agente`, `/categorias`) | Features isoladas, navegacao facil |
| HTTP client | **dio** ou `http` package | Comunicacao com backend .NET (REST + JWT) |
| Codegen do client | **OpenAPI Generator** ou **Swagger Codegen** | Gera client Dart a partir do OpenAPI do .NET — type safety end-to-end |
| STT (Speech-to-Text) | **Nativo do dispositivo** | Gratis, offline, baixa latencia |
| TTS (Text-to-Speech) | **`flutter_tts` nativo** | Gratis, offline. Upgrade futuro se qualidade incomodar |
| Wake word | **Adiado pra Fase 3** | So depois do app ter conteudo |
| Push | **Firebase Cloud Messaging** | Padrao Android + iOS |
| Offline-first | **PARKED pra V2** | MVP online-only |

### Stack do site web (Next.js)
| Camada | Tecnologia | Motivo |
|---|---|---|
| Framework | **Next.js 15** (App Router) | React com SSR/SSG, SEO de verdade, deploy 1-clique Vercel |
| Linguagem | TypeScript | Type-safe, padrao moderno |
| Estilizacao | Tailwind CSS v4 | Utility-first, casa com tokens do design system |
| Componentes | shadcn/ui | Componentes copiaveis customizaveis |
| Animacoes | Framer Motion | Padrao React pra animacoes fluidas |
| Icones | Lucide React | Linhas finas, casa com estetica |
| HTTP client | **fetch** + React Query (`@tanstack/react-query`) | Cache de dados, revalidacao automatica |
| Codegen do client | **OpenAPI TypeScript** | Gera client TS a partir do OpenAPI do .NET |
| Deploy | Vercel (free tier) | Made by Next.js team |

### Escopo do site Next.js
- **Substitui o Angular V1 inteiro** (nao eh so landing — tem login, tarefas, agente, config — TUDO que tem hoje)
- Angular V1 atual segue no ar ate o Next.js novo cobrir todas funcionalidades
- Site e app compartilham conta + dados (mesmo backend .NET, mesmo banco)
- Cria tarefa no app -> aparece no site (e vice-versa) — single source of truth no backend

### Auth
- Email + senha (ja implementado no .NET com BCrypt + JWT)
- Google Sign-In + Apple Sign-In (a adicionar no .NET via OAuth library tipo `Microsoft.AspNetCore.Authentication.Google`)
- Apple Sign-In obrigatorio pra publicar na App Store quando se oferece login social
- 1 conta unica vale pra site + app + plataformas futuras

### Backend .NET — RETOMADO COMO BACKEND PRINCIPAL
- Backend .NET continua sendo o **backend principal** do produto novo
- Atende site Next.js, app Flutter mobile, e plataformas futuras (smartwatch, Alexa, etc)
- Mantem Clean Architecture: `Liriun.Core`, `Liriun.Application`, `Liriun.Infrastructure`, `Liriun.Api`
- Reaproveita: Result<T>, ProblemDetails, FluentValidation, Read/Write repos, JWT, GeminiService, migrations
- **Decidido 2026-05-09** apos analise de escalabilidade (vs Supabase direto)

### Supabase — APENAS COMO BANCO
- Supabase usado SO como Postgres gerenciado
- NAO usa Supabase Auth (auth fica no .NET com JWT proprio)
- NAO usa RLS (validacao fica no .NET)
- NAO usa Edge Functions (logica fica no .NET)
- Connection string `ConnectionStrings:Liriun` aponta pro Postgres do Supabase
- Migrations EF Core do .NET aplicam direto no Supabase

### Offline-first — PARKED pra V2
- MVP sera online-only (mais rapido de fazer)
- Quando tiver base de usuarios reclamando, adiciona SQLite local (Brick ou PowerSync) com sync automatico

### Wake word — adiado pra Fase 3
- Feature mais complexa e com limitacoes no iOS
- Valor do Liriun esta na **experiencia de conversa com o agente**, nao em como abre o app
- So depois do app ter conteudo e core validado. **Confirmado 2026-05-09**

### Historico de conversa — NAO persiste
- O agente funciona como interceptador stateless
- Usuario fala -> backend .NET interpreta via Gemini -> backend salva no Supabase -> responde
- Sem contexto acumulado entre interacoes (mais barato em tokens, mais confiavel)

### Planos/pricing — PARKED ate o app estar finalizado
- Decidir SOMENTE quando MVP estiver funcional e com testes
- Por enquanto: foco eh desenvolver e deixar funcionando, nao monetizar
- Quando chegar a hora: pricing, limites, freemium, tudo de uma vez

### Publicacao nas lojas — PARKED ate o app estar finalizado
- Apple App Store ($99/ano) + Google Play ($25 unico) so quando o app estiver pronto
- Por enquanto: build local pra PC, depois passar APK/IPA pro celular pra testar
- Antes de publicar: ajustar appsettings de producao, revisao final, etc

---

## 3. Fases de desenvolvimento

### Fase 1 — MVP: Agente funciona DENTRO do app (detalhado abaixo)

### Fase 2 — Acesso rapido SEM abrir o app
- Widget na home screen (Android + iOS)
- Atalho na Central de Controle (iOS) / Quick Settings (Android)
- Notificacao persistente com botao "Falar com Liriun"
- Lembretes por push notification (prazo se aproximando, tarefa atrasada)

### Fase 3 — Wake word + always listening
- Integracao Picovoice Porcupine (ou openWakeWord)
- Background listening (foreground service Android, background audio iOS)
- Nome do agente customizavel — Porcupine treina modelo por texto em segundos
- Tela bloqueada: funciona no Android, parcial no iOS (limitacoes da Apple)

### Fase 4 — Integracao com calendarios
- Google Calendar API (OAuth, sync bidirecional)
- Apple Calendar via EventKit (nativo iOS)
- Outlook via Microsoft Graph API

### Fase 5 — Lembretes avancados
- SMS via Twilio
- Ligacao via Twilio TTS
- Configuracao de frequencia/horarios pelo usuario

---

## 4. Fase 1 — MVP Detalhado

> Objetivo: produto novo funcional (backend .NET + site Next.js + app Flutter mobile) que substitui o V1 web.
> Site Next.js cobre as mesmas funcionalidades que o Angular V1 tem hoje (login, tarefas, agente, config) — modernizado.
> App Flutter inclui agente de voz como diferencial mobile.

### 4.1 Setup do projeto

#### Backend .NET
- [ ] Subir banco Supabase Postgres novo (projeto separado do V1 web)
- [ ] Atualizar `ConnectionStrings:Liriun` pra apontar pro Supabase novo
- [ ] Rodar migrations EF Core no Supabase novo
- [ ] Adicionar OpenAPI/Swagger detalhado pra codegen dos clients
- [ ] Configurar CORS pra `app.liriun.com` + `liriun.com` + `localhost:3000` (dev Next) + `localhost:8080` (dev Flutter Web)
- [ ] Definir host de prod (Oracle Free / Railway / outro)

#### App Flutter
- [ ] Criar projeto Flutter (`flutter create liriun_app`)
- [ ] Configurar estrutura feature-first (`/lib/features/{auth,tarefas,agente,categorias,config}`)
- [ ] Configurar Riverpod
- [ ] Gerar client Dart a partir do OpenAPI do .NET
- [ ] Configurar dio com interceptor JWT
- [ ] Configurar Firebase project (FCM push)

#### Site Next.js
- [ ] Criar projeto Next.js (`npx create-next-app@latest liriun-site --typescript --tailwind --app`)
- [ ] Adicionar shadcn/ui
- [ ] Configurar tokens do design system (cores, fonts, radii) no `tailwind.config` + CSS vars
- [ ] Gerar client TypeScript a partir do OpenAPI do .NET
- [ ] Configurar React Query + interceptor JWT

#### Compartilhado
- [ ] Setup CI basico (build Android + iOS + Web Next + .NET)

### 4.2 Auth
- [ ] Login email + senha (ja existe no .NET — JWT proprio)
- [ ] Cadastro email + senha + nome (ja existe no .NET)
- [ ] Telas de login/cadastro no app Flutter
- [ ] Telas de login/cadastro no site Next.js
- [ ] Adicionar Google Sign-In no .NET (`Microsoft.AspNetCore.Authentication.Google`)
- [ ] Adicionar Apple Sign-In no .NET
- [ ] Persistencia de sessao no app (`flutter_secure_storage`) e no site (cookie httpOnly + refresh token)
- [ ] Telas de alterar senha em ambos
- [ ] Logout em ambos

### 4.3 Banco de dados (Postgres no Supabase)
- [ ] Schema ja existe do V1 (Tarefas, Categorias, TarefaCategoria, Usuarios)
- [ ] Avaliar se precisa adicionar tabela `MensagensAgente` (historico de conversa) — provavelmente NAO no MVP (stateless)
- [ ] Avaliar se precisa coluna `nome_agente` em `Usuarios` (apos onboarding "como me chamar")
- [ ] Avaliar se precisa coluna `voz_preferida` em `Usuarios` (Fase 2+, parado)
- [ ] Migrations EF Core aplicadas no Supabase novo

### 4.4 Offline-first — PARKED pra V2

### 4.5 Onboarding
- [ ] Fluxo bloqueante no primeiro acesso apos cadastro (igual V1)
- [ ] Passo 1: nome do usuario + nome do agente ("como me chamar?")
- [ ] Passo 2: categorias (templates padrao + criar proprias)
- [ ] Tutorial rapido (opcional)
- [ ] Implementar em site Next.js E em app Flutter

### 4.6 Agente — Conversa por voz/texto

#### Backend .NET
- [ ] Endpoint `POST /api/agente/interpretar` — recebe texto OU audio + categorias do user, chama Gemini, retorna JSON estruturado (titulo, categorias, data, prioridade, observacoes)
- [ ] Reaproveitar `GeminiService` existente do V1
- [ ] Tratar rate limit 429 (mensagem ja existe)
- [ ] Tratar JSON invalido do Gemini (fallback)
- [ ] Endpoint `POST /api/agente/responder` (opcional) — monta resposta do Liriun pro TTS

#### App Flutter
- [ ] Interface de chat/conversa (estilo assistente — ver mockup `docs/design-ref/`)
- [ ] Botao mic gigante (gravar audio)
- [ ] Input de texto (alternativa ao mic)
- [ ] Enviar texto/audio pro backend `.NET /api/agente/interpretar`
- [ ] Card de revisao mostrando tarefa extraida -> user confirma/edita
- [ ] TTS nativo (`flutter_tts`) le resposta do Liriun
- [ ] Comandos MVP: criar tarefa, listar hoje, listar categoria, concluir, listar semana
- [ ] Fallback: erro Gemini -> mensagem + opcao manual
- [ ] Modo manual: form completo (titulo, categorias, data, hora, prioridade)

#### Site Next.js
- [ ] Mesma interface de chat (porem provavelmente sem TTS automatico — Web Speech API se quiser)
- [ ] Modo texto + audio (browser MediaRecorder)
- [ ] Modo manual completo

### 4.7 Tarefas (CRUD)

#### Backend .NET
- [ ] Endpoints existentes do V1 reaproveitados: GET, POST, PATCH, DELETE em `/api/tarefas`
- [ ] Validar que JWT do request pertence a user dono da tarefa
- [ ] Status atrasada calculado no backend ao listar (ja existe)

#### Site Next.js
- [ ] Tela de listagem (filtros: status, prioridade, categoria)
- [ ] Visualizacao Lista (Quadro/Semana ficam pra depois — repensar conforme design)
- [ ] Detalhe/edicao em modal ou bottom sheet
- [ ] Concluir tarefa
- [ ] Reabrir concluida
- [ ] Atrasadas em destaque
- [ ] Tela de concluidas com filtro por periodo

#### App Flutter
- [ ] Mesmas funcionalidades em mobile (lista + detalhe)
- [ ] Swipe pra concluir/excluir
- [ ] Visualizacoes: Lista no MVP (Kanban/Semana se sobrar tempo)

### 4.8 Categorias
#### Backend .NET — endpoints existentes do V1 reaproveitados

#### Site Next.js + App Flutter
- [ ] Tela de configuracoes com gerenciamento
- [ ] Criar/editar/excluir categoria (excluir bloqueado se tarefa pendente vinculada)
- [ ] Cor por categoria (paleta da identidade visual)
- [ ] Icone (lib Lucide pro site, equivalente Flutter)

### 4.9 UI/UX

#### Compartilhado
- [ ] Identidade visual segue `docs/design-ref/Liriun · Visual Reference · Print.pdf`
- [ ] Dark mode default em ambos
- [ ] Tom de voz do Liriun mantido (seco, discreto, competente)
- [ ] Sem emojis (icones Lucide ou equivalente)

#### Site Next.js
- [ ] shadcn/ui customizado pros tokens do design system
- [ ] Animacoes Framer Motion
- [ ] Responsivo (desktop primeiro mas funciona em mobile browser)

#### App Flutter
- [ ] Tema escuro (default) + claro
- [ ] Animacoes nativas Flutter
- [ ] Mockups oficiais como referencia (`docs/design-ref/`)

### 4.10 Push notifications
- [ ] Configurar Firebase Cloud Messaging (app Flutter)
- [ ] Backend .NET dispara notificacao via FCM quando: tarefa vencendo no dia, atrasada
- [ ] Permissao pedida no onboarding mobile

### 4.11 Deploy MVP
- [ ] Backend .NET hospedado (Oracle Free / Railway) com dominio `api.liriun.com`
- [ ] Site Next.js hospedado em Vercel com dominio `liriun.com`
- [ ] Flutter Web (`app.liriun.com`) — opcional MVP, decidir
- [ ] App Android buildavel localmente (APK pra testar no celular)
- [ ] App iOS buildavel quando socio testar (precisa Mac)
- [ ] Banco Supabase Postgres em prod (mesmo que dev por enquanto, separar quando publicar)

---

## 5. Limitacoes conhecidas (pesquisado e confirmado)

### iOS — Wake word com tela bloqueada (Fase 3)
- Apple reserva wake word a nivel de sistema exclusivamente pro Siri
- Apps de terceiros usam background audio mode (AVAudioSession) — funciona mas:
  - iOS mostra indicador vermelho permanente no status bar (mic ativo)
  - Se usuario matar o app (swipe up), para de ouvir — sem como religar sozinho
  - iOS pode matar apps em background quando precisa de RAM
- **Nunca sera identico ao "Hey Siri"** — limitacao da Apple, fora do nosso controle

### Android — Wake word com tela bloqueada (Fase 3)
- Funciona bem via Foreground Service
- Requer notificacao persistente ("Liriun esta ouvindo")
- Nao funciona se usuario forcar encerramento (force stop)

### Picovoice Porcupine — Pricing (Fase 3)
- Free: ate 3 usuarios ativos/mes (perfeito pra dev/teste)
- Pago: a partir de $6.000/ano (Foundation plan pra startups < 5 anos, < 20 funcionarios)
- Alternativa gratuita: openWakeWord (open source, sem SDK Flutter oficial, integracao manual via ONNX)

### Bateria (Fase 3)
- Deteccao leve de wake word consome ~2-5% ao dia com modelos otimizados
- Implementacoes mal feitas podem chegar a 45% drain

### TTS
- Nativo do dispositivo: gratis, funciona offline, qualidade boa (nao incrivel)
- Upgrade futuro: Fish Audio S2 (~$15/1M chars) ou Speechmatics ($0.011/1K chars)

### Gemini API — Custos reais estimados
- Free tier: limitado a Flash models, 5-15 RPM, 100-1000 RPD, precisa renovar diariamente
- **Plano pago (Flash-Lite): $0.10 input / $0.40 output por 1M tokens**
- Cada request do Liriun usa ~500 tokens input + ~200 output
- Custo mensal estimado:
  - Teste (50 req/dia): ~$0.01/mes
  - 100 usuarios: ~$0.13/mes
  - 1.000 usuarios: ~$1.30/mes
  - 10.000 usuarios: ~$13.00/mes
- Como ativar: Google AI Studio > Settings > Billing > adicionar cartao. Mesma API key, sem mudar codigo

---

## 6. O que falta definir / proximos passos

### Decididos em 2026-05-09
- [x] Nome "Liriun" continua
- [x] Arquitetura: **multi-client com backend .NET centralizado** (escalavel, padrao Linear/Asana/Slack)
- [x] Backend principal: **.NET continua** (reaproveita Clean Architecture pronta)
- [x] Site novo Next.js: **substitui Angular V1 inteiro** (login + tarefas + agente + config — nao so landing)
- [x] Tech do site: **Next.js 15** + Tailwind + shadcn/ui + Framer Motion + React Query
- [x] Banco: **Supabase Postgres novo** (so como banco — sem Auth/RLS/Edge Functions)
- [x] Auth: **JWT proprio do .NET** (nao Supabase Auth) + Google/Apple Sign-In via OAuth no .NET
- [x] State management Flutter: **Riverpod**
- [x] Estrutura de pastas Flutter: **feature-first**
- [x] Codegen client: **OpenAPI** -> client TypeScript pro site, client Dart pro Flutter (type safety end-to-end)
- [x] Offline-first: **PARKED pra V2** (MVP online-only)
- [x] TTS: **nativo do dispositivo**
- [x] iOS: socio testa quando finalizar; por enquanto build local pra PC + celular
- [x] Estilo visual: aprovado (mockups + style guide em `docs/design-ref/`)

### Adiados ate o MVP estar pronto
- [ ] Plano de negocio (freemium, limites, precos) — `PLANO_NEGOCIO_TEMPLATE.md`
- [ ] Publicacao lojas (App Store $99/ano, Google Play $25 unico)
- [ ] Tom de voz do Liriun (apos definir voz pelo TTS)
- [ ] Wake word + always listening (Fase 3)
- [ ] Lembretes SMS/ligacao via Twilio (Fase 5)
- [ ] Fluxo de onboarding detalhado (telas, steps) — definir conforme construirmos
- [ ] Build iOS (socio testa, sem urgencia)

---

## 7. Estrutura do repositorio

```
liriun/
  backend/          <- .NET 10 — backend PRINCIPAL (Clean Architecture)
                       Liriun.Core / Application / Infrastructure / Api
                       REST + JWT + EF Core + Gemini integration
                       Atende site Next.js, app Flutter, e plataformas futuras
  app/              <- Flutter (Android + iOS + Web logado)
                       Riverpod, feature-first
                       Estrutura: /lib/features/{auth,tarefas,agente,categorias,config}
                       Comunica com backend .NET via REST + JWT
  site/             <- Next.js 15 (App Router) — substitui Angular V1
                       Login, tarefas, agente, config — funcionalidade completa
                       Tailwind + shadcn/ui + Framer Motion + React Query
                       Comunica com backend .NET via REST + JWT
  frontend/         <- Angular V1 ATUAL (segue no ar ate site Next.js cobrir tudo)
                       Sera arquivado quando Next.js estiver completo
  docs/             <- Documentacao
    design-ref/     <- Style guide oficial (PDF, icones, glyph)
```

> **Banco:** Supabase Postgres usado como database gerenciado (DB only, sem Auth/RLS/Edge Functions).
> Connection string em `appsettings.json` do .NET.

---

## 8. Arquivos do projeto — estado atual

### Ativos (docs/)
- `CONTEXTO_APP.md` — **este arquivo** (fonte autoritativa de decisoes do app)
- `ESTRATEGIA_LIRIUN.md` — posicionamento (revisado 2026-05-09 pra direcao voice agent)
- `IDEIAS_FUTURO.md` — backlog de features futuras
- `PLANO_NEGOCIO_TEMPLATE.md` — template parado ate MVP estar pronto
- `design-ref/` — style guide oficial (PDF visual reference + icones)

### Arquivados (docs/docs-arquivados/)
- `ARCHITECTURE.md`, `CHECKLIST_PRODUCAO.md`, `CORRECOES_V1.md`, `DEPLOY.md`
- `DESENVOLVIMENTO.md`, `ENTREVISTA.md`, `PROJETO.md`, `banco/MIGRATIONS.md`

### Raiz
- `CLAUDE.md` — contexto pro Claude Code (sera reescrito quando o user mandar)
- `README.md` — README do repo (sera reescrito junto com o CLAUDE.md)
