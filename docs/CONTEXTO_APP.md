# Liriun App — Contexto e Decisoes

> Documento de continuidade. Criado em 2026-05-08.
> Retomar a partir daqui na proxima sessao.

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

### Stack do app
| Camada | Tecnologia | Motivo |
|---|---|---|
| App (mobile + web) | **Flutter** (Dart) | Um codebase pra Android + iOS + Web. Melhor performance pra audio/ML on-device (Dart FFI), UI consistente cross-platform, 46% market share 2026, SDK Picovoice disponivel |
| Backend/Auth | **Supabase** (Auth + PostgreSQL + Realtime + Storage) | Serverless, ja usam o DB, free tier generoso, escala automaticamente. Substitui o backend .NET por completo |
| API/Logica | **Supabase Edge Functions** (TypeScript/Deno) | Sem servidor pra manter, serverless, chamadas a Gemini e logica de negocios |
| IA/NLU | **Google Gemini API** | Ja usam, funciona bem pra extrair tarefas de texto natural |
| STT (Speech-to-Text) | **Nativo do dispositivo** (Android/iOS built-in) | Gratis, funciona offline, baixa latencia. Upgrade futuro se necessario |
| TTS (Text-to-Speech) | **Nativo do dispositivo** (flutter_tts) | Gratis, funciona offline. Upgrade futuro pra Fish Audio ou Speechmatics se quiserem voz premium |
| Wake word | **Picovoice Porcupine** (comecar) ou **openWakeWord** (alternativa open source) | On-device, treina wake word por texto em segundos |
| Push | **Firebase Cloud Messaging** | Padrao do mercado pra Android + iOS |
| Lembretes SMS/Ligacao | **Twilio** (futuro) | ~$0.01/SMS, ~$0.02/min ligacao |
| Agendamento | **Supabase Cron + Edge Functions** | Jobs agendados pra lembretes |
| Banco local (offline) | **SQLite** (via Brick ou PowerSync) | Cache local no celular, sync automatico com Supabase quando tem internet |

### Auth
- Email + senha + Google Sign-In + Apple Sign-In (Supabase Auth suporta todos)
- Apple Sign-In obrigatorio pra publicar na App Store quando se oferece login social

### Backend .NET — ARQUIVADO
- O backend .NET existente foi projetado pro site web V1
- Supabase substitui tudo: Auth, CRUD, validacao (RLS), logica (Edge Functions), migrations (CLI)
- Codigo .NET permanece no repo (`backend/`) como referencia de logica de negocio mas nao sera evoluido

### Site web
- **Landing page** (`liriun.com`): site estatico separado pra marketing/SEO (Flutter Web nao eh bom pra SEO)
- **App web** (`app.liriun.com` ou path do Flutter Web): mesmo codebase Flutter compilado pra web — login, tarefas, agente, config. Mesma experiencia do mobile no browser
- Dominio `liriun.com` mantido (ja comprado)

### Offline-first
- App funciona sem internet pra: consultar tarefas em cache, criar/editar/concluir tarefas (modo manual), STT nativo
- Nao funciona sem internet: modo IA (Gemini), sync com nuvem
- SQLite local (Brick ou PowerSync) sincroniza automaticamente com Supabase quando reconecta
- Mesmo padrao de apps como Todoist, Google Keep, Notion

### Wake word — NAO eh MVP
- O wake word (always listening) eh a feature mais complexa e com limitacoes no iOS
- O valor do Liriun esta na **experiencia de conversa com o agente**, nao em como voce abre o app
- Wake word fica pra Fase 3, depois do core validado

### Historico de conversa — NAO persiste
- O agente funciona como interceptador stateless
- Usuario fala -> agente interpreta (Gemini) -> chama Supabase -> responde
- Sem contexto acumulado entre interacoes (mais barato em tokens, mais confiavel)

### Planos/pricing — A DEFINIR
- Sera decidido depois de entender o custo real de uso (Gemini, infra, etc)
- Somente entao define-se modelo freemium, limites, etc

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

> Objetivo: app funcional onde o usuario abre, fala (ou digita), e o Liriun cria/consulta/conclui tarefas.
> Inclui versao web (Flutter Web) com mesma funcionalidade.

### 4.1 Setup do projeto
- [ ] Criar projeto Flutter (`flutter create liriun_app`)
- [ ] Configurar estrutura de pastas (feature-first)
- [ ] Configurar Supabase project (ou reaproveitar o existente)
- [ ] Configurar Supabase CLI local (migrations, Edge Functions, seed)
- [ ] Configurar Firebase project (pra FCM push notifications)
- [ ] Setup CI basico (build Android + iOS + Web)

### 4.2 Auth
- [ ] Tela de login (email + senha)
- [ ] Tela de cadastro (email + senha + nome)
- [ ] Google Sign-In
- [ ] Apple Sign-In
- [ ] Supabase Auth integration no Flutter (supabase_flutter package)
- [ ] Persistencia de sessao (usuario nao precisa logar toda vez)
- [ ] Tela de alterar senha
- [ ] Logout

### 4.3 Banco de dados (Supabase)
- [ ] Tabela `usuarios` (id, email, nome, criado_em)
- [ ] Tabela `categorias` (id, usuario_id, nome, cor, icone, criado_em)
- [ ] Tabela `tarefas` (id, usuario_id, titulo, descricao, prioridade, status, data_prazo, horario_final, criado_em, atualizado_em)
- [ ] Tabela `tarefa_categorias` (tarefa_id, categoria_id) — relacao N:N
- [ ] RLS policies (cada usuario so ve/edita seus proprios dados)
- [ ] Seed com categorias padrao (Trabalho, Faculdade, Casa, Compras, Pessoal)

### 4.4 Offline-first (SQLite local)
- [ ] Configurar Brick ou PowerSync
- [ ] Modelos locais espelhando tabelas do Supabase
- [ ] Sync automatico (background) quando conecta
- [ ] Fila de upload (operacoes offline sobem quando reconecta)
- [ ] Conflict resolution (last-write-wins pro MVP)

### 4.5 Onboarding
- [ ] Fluxo bloqueante no primeiro acesso apos cadastro
- [ ] Escolha de categorias (templates padrao + criar proprias)
- [ ] Escolha do nome do agente (apenas cosmético na Fase 1 — sem wake word ainda)
- [ ] Tutorial rapido de como usar o app

### 4.6 Tela principal — Conversa com o agente
- [ ] Interface de chat/conversa (estilo assistente)
- [ ] Botao de microfone: grava audio -> STT nativo -> texto
- [ ] Input de texto (alternativa ao mic)
- [ ] Enviar texto pro Gemini (via Edge Function) -> recebe JSON estruturado
- [ ] Card de revisao: mostra tarefa extraida pela IA -> usuario confirma ou edita
- [ ] TTS nativo: Liriun fala a resposta de volta
- [ ] Comandos suportados na Fase 1:
  - "Criar tarefa: [descricao livre]"
  - "Quais minhas tarefas de hoje?"
  - "Quais tarefas de [categoria]?"
  - "Concluir tarefa [nome/referencia]"
  - "O que tenho pra essa semana?"
- [ ] Fallback: se Gemini falha/timeout, mensagem de erro + opcao manual
- [ ] Modo manual: form completo (titulo, categorias, data, hora, prioridade)

### 4.7 Tarefas
- [ ] Tela de listagem de tarefas (com filtros: status, prioridade, categoria)
- [ ] Visualizacao lista (MVP — kanban e semana ficam pra depois)
- [ ] Detalhe/edicao de tarefa (modal ou tela)
- [ ] Concluir tarefa (swipe ou botao)
- [ ] Reabrir tarefa concluida
- [ ] Tarefas atrasadas em destaque
- [ ] Status atrasada calculado automaticamente (data_prazo < agora)
- [ ] Tela de concluidas (com filtro por periodo)

### 4.8 Categorias
- [ ] Tela de configuracoes com gerenciamento de categorias
- [ ] Criar, editar, excluir categoria
- [ ] Bloqueio de exclusao se tiver tarefa pendente vinculada
- [ ] Cor e icone por categoria

### 4.9 UI/UX
- [ ] Tema escuro (default) + claro (toggle)
- [ ] Design clean, moderno, profissional (estilo Linear)
- [ ] Responsivo (mobile-first, funciona no web)
- [ ] Animacoes suaves (transicoes de tela, feedback de acoes)
- [ ] Tom de voz do Liriun mantido (seco, discreto, competente)
- [ ] Icones: Font Awesome ou equivalente Flutter (sem emojis)

### 4.10 Push notifications
- [ ] Configurar Firebase Cloud Messaging (Android + iOS)
- [ ] Notificacao quando tarefa esta prestes a vencer (mesmo dia)
- [ ] Notificacao quando tarefa atrasou
- [ ] Permissao de notificacao pedida no onboarding

### 4.11 Edge Functions (Supabase)
- [ ] `interpretar-voz`: recebe texto do usuario + categorias cadastradas -> chama Gemini -> retorna JSON estruturado (titulo, categorias, data, prioridade, observacoes)
- [ ] `responder-agente`: monta resposta textual do Liriun pro TTS (tom de voz correto)
- [ ] Tratamento de rate limit 429 do Gemini
- [ ] Tratamento de JSON invalido do Gemini (fallback)

### 4.12 Deploy MVP
- [ ] Flutter Web buildado e servido (Cloudflare Pages ou Vercel)
- [ ] App Android buildavel localmente (APK/AAB pra teste)
- [ ] App iOS buildavel localmente (precisa de Mac com Xcode)
- [ ] Supabase project configurado (prod separado de dev? ou mesmo pro MVP?)

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

---

## 6. O que falta definir / proximos passos

- [ ] Definir fluxo de onboarding detalhado (telas, steps)
- [ ] Pesquisar publicacao nas lojas (Apple App Store, Google Play) — requisitos, custos, processo
- [ ] Avaliar se Supabase Edge Functions aguentam o pipeline de IA ou se precisa servico dedicado
- [ ] Plano de negocio: modelo freemium? O que eh gratis, o que eh pago? (apos entender custos reais)
- [ ] Definir se o nome "Liriun" continua ou se muda pra refletir a nova proposta
- [ ] Decidir tech da landing page (HTML puro, Astro, Angular atual adaptado, outro)
- [ ] Definir se reaproveita banco Supabase existente ou cria projeto novo
- [ ] Definir state management do Flutter (Riverpod, BLoC, Provider)
- [ ] Definir estrutura de pastas do Flutter (feature-first vs layer-first)
- [ ] Testar build iOS (precisa de Mac com Xcode)

---

## 7. Estrutura do repositorio

```
liriun/
  app/              <- Flutter (Android + iOS + Web logado)
                       Login, cadastro, tarefas, agente, config
  landing/          <- Site marketing estatico (liriun.com)
                       Apresentacao, SEO, link pra download/app
  supabase/         <- "Backend" serverless
                       Migrations, Edge Functions, RLS policies, seed
  docs/             <- Documentacao
  backend/          <- .NET ARQUIVADO (referencia de logica, nao evoluir)
```

---

## 8. Arquivos do projeto — estado atual

### Ativos (docs/)
- `ESTRATEGIA_LIRIUN.md` — posicionamento e corte estrategico
- `FUTURO.md` — lista de features futuras (muitas alinham com app)
- `PLANO_NEGOCIO_TEMPLATE.md` — template de plano de negocio (por preencher)
- `CONTEXTO_APP.md` — **este arquivo**
- `Identidade Visual/` — logos e assets
- `Termos de Uso/` — docs legais

### Arquivados (docs/arquivo/)
- `ARCHITECTURE.md`, `CHECKLIST_PRODUCAO.md`, `CORRECOES_V1.md`, `DEPLOY.md`
- `DESENVOLVIMENTO.md`, `ENTREVISTA.md`, `PROJETO.md`, `banco/MIGRATIONS.md`

### Raiz
- `CLAUDE.md` — contexto pro Claude Code (precisa reescrever pra nova visao)
- `README.md` — README do repo (precisa reescrever)
