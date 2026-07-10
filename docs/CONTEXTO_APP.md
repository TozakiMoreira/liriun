# Liriun — Contexto do Projeto

> **Fonte autoritativa** de produto, arquitetura e estado atual. Em conflito com qualquer outro doc, este vence.
> Resumo rápido + regras que o Claude aplica sempre: `../CLAUDE.md`. Setup/como rodar: `../README.md`.
> Última revisão: 2026-07-10 (realinhamento completo com a realidade do código).

---

## 1. O que é o Liriun

Organizador pessoal de tarefas com **agente de voz** como diferencial. O usuário fala (ou digita) como pensa
("reunião com a Marina amanhã às 9, prioridade alta") e o Liriun extrai a tarefa estruturada — título, prazo,
categoria, prioridade — e organiza.

- **Projeto pessoal e solo do Pedro Tozaki.** Não é mais um projeto da "ToMore" (descontinuada), não tem sócio
  ativo, não tem CNPJ e **não tem relação com a faculdade** (Pedro faz ADS na FATEC, mas o projeto é independente).
- **Objetivo:** tirar o protótipo do papel e transformar num **produto real** — escalável, usável, capaz de gerar
  receita de verdade — pensando "sem medo", como produto do mundo real. Também serve de **portfólio** (fallback
  pra conseguir emprego se não decolar).
- **Hoje:** em desenvolvimento. Beta fechado; só o Pedro usa (nenhum código de convite foi distribuído ainda).

## 2. Método de trabalho (importante pro Claude)

- **Vibecoding:** o **Claude Code escreve o código**; o Pedro planeja, valida e refina depois que está funcional.
  A ideia é usar a IA pra acelerar o desenvolvimento — com o planejamento do Pedro, mas sem ele codar na mão.
- **Ordem:** primeiro deixar **funcional**; depois melhorar arquitetura/qualidade do que fizer sentido.
- **Foco atual, em ordem:**
  1. **Site** funcional e sem erros + **definir bem as funcionalidades iniciais**. (É o mais adiantado — finalizar primeiro.)
  2. Depois, **refazer o app do zero** e focar 100% nele.
- **Meta de UX:** site e app com usabilidade parecida (referência: Duolingo). Se não der pra manter os dois no mesmo
  nível, o **app tem prioridade de excelência** e o site vira complemento.
- **Sem prazo duro.** Pedro está de férias e sem emprego — dedica 60%+ do tempo livre.

## 3. Arquitetura

Padrão **headless backend / multi-client** (como Linear, Asana, Slack): um backend central serve todos os clientes.

```
Site (Next.js)   ─┐
App Flutter      ─┼─→ Backend .NET ─→ Supabase Postgres (1 banco único)
Plataformas fut  ─┘   (REST + JWT + Gemini)
```

- **Backend .NET** é a **fonte única de verdade** (lógica + dados + auth). Clientes só consomem a API REST.
- **1 Supabase Postgres único** — dev e prod compartilham o **mesmo banco** por enquanto.
- Adicionar plataforma nova (smartwatch, extensão, etc) = só implementar o front; o backend não muda.
- **Monorepo único** (`backend/` + `site/` + `app/`) na branch `main`.

## 4. Stack real (hoje)

| Camada | Tecnologia |
|---|---|
| Backend | .NET 10 + ASP.NET Core Web API + Clean Architecture (Core/Application/Infrastructure/Api) |
| ORM/Banco | EF Core 9 + Npgsql · PostgreSQL no Supabase (banco único, dev=prod) |
| Auth | JWT próprio (HS256) + BCrypt — **só e-mail/senha** (Google/Apple **não** implementados) |
| IA | Google Gemini — modelo default **`gemini-2.5-flash`**. Free tier **com cartão vinculado** (excedente vira pago) |
| Validação | FluentValidation |
| Testes | xUnit + FluentAssertions + Moq |
| Site | Next.js 15 (App Router, várias rotas em `runtime = edge`) + React 19 + Tailwind 3 + shadcn/ui + Framer Motion + next-intl (pt/en) |
| Client HTTP do site | `fetch` + wrapper próprio (`lib/api/`) — **escrito à mão** (sem codegen OpenAPI) |
| App | Flutter (Android + iOS, sem Web) — **a ser refeito do zero** |
| Hosting backend | Render (Docker, free tier — cold start ~30-60s após idle; deploy por push) |
| Hosting site | Cloudflare Pages · domínio **liriun.com** |

## 5. Estado atual por frente

### Backend .NET — em produção, funcional
- No ar no Render (free tier, cold start após idle). Clean Architecture, sem mudanças estruturais.
- Controllers: `auth`, `tarefas`, `categorias`, `captura` (agente), `codigos-beta` (admin).
- Auth: cadastro, login, alterar senha, perfil (+ foto), excluir conta, **recuperação de senha** (`EsqueciSenhaUseCase`).

### Site Next.js — no ar, mas "em desenvolvimento"
- Institucional no ar em **liriun.com** (Cloudflare): landing, preços, recursos, comparar, sobre, empresa, legais.
- **Área logada** (`/app/...`): `falar`, `hoje`, `tarefas`, `atividade`, `configuracoes`. Dá pra cadastrar, logar,
  criar tarefa por voz/texto e ver — **mas considerar em desenvolvimento**: tem muita melhoria e alteração pendente.

### App Flutter — **descartar e refazer do zero**
- Ignorar tudo que existe em `app/`. Será reconstruído do zero quando o site estiver finalizado. Ver `../app/CLAUDE.md`.

### Beta fechado — ativo em produção
- Cadastro exige **código de convite**. A conta admin (do Pedro) gera o código (`codigos-beta`); a pessoa usa o
  código pra criar a conta. Nenhum código distribuído ainda.

## 6. Agente de voz (o diferencial) — como funciona hoje

Verificado no código do site + backend:

- **Entrada por voz e texto.** No site: grava áudio com `MediaRecorder` (até ~60s / 8MB) e envia o **áudio
  multimodal direto pro Gemini** (`POST /captura/conversar-audio`); modo texto usa `POST /captura/conversar`.
- **Conversacional (multi-turno).** O histórico (até 30 mensagens) é mantido no cliente e reenviado a cada turno —
  o servidor é **stateless**. O usuário pode continuar a conversa depois de salvar.
- **Faz mais que criar:** o agente pode **criar, editar, concluir e excluir** tarefas, e **responder sobre tarefas
  existentes** (referencia as pendentes do usuário).
- **Card de revisão + auto-save:** a sugestão aparece num card; salva automaticamente quando o usuário confirma
  ("salva", "sim", "pode salvar", etc) e já havia sugestão na tela.
- **Sem TTS:** o Liriun responde em **texto**, não fala de volta. É voz na entrada, texto na saída.
- **Sem perguntas de follow-up** por padrão (existe um flag `Gemini:ModoInterativo`, desligado — ignorar por ora).
- **Filtros anti-alucinação:** o backend valida categorias/datas/prioridades contra o que é do usuário antes de sugerir.

## 7. Domínio e modelo (verificado no código)

**Entidades:** `Usuario`, `Tarefa`, `Categoria`, `TarefaCategoria` (junção N:N com PK composta), `CodigoBeta`.

- **Tarefa:** `Nome`, **`DataPrazo` (obrigatória)**, `HorarioFinal?` (TimeSpan), `Observacoes?`, `Prioridade`,
  `Status`, `Recorrencia` + `RecorrenciaQuantidade`, `TempoGastoSegundos` (cronômetro acumulado), `CriadaEm`,
  `ConcluidaEm`, `Categorias`.
- **Usuario:** `Nome`, `Email`, `SenhaHash` (BCrypt), `FotoUrl?` (data URI), `TimeZoneId` (IANA, default BRT),
  `EhAdmin`, `TermosAceitosEm`. **Não existe campo "nome do agente"** — a ideia de agente com nome custom nunca foi construída.
- **Prioridade:** urgente(1) · importante(2) · normal(3) · baixa(4).
- **Status:** pendente · concluida · **atrasada é calculada** (`StatusComputado`, no fuso do usuário, nunca persistida).
  Datas guardadas em UTC.
- **Recorrência:** `TipoRecorrencia` = Nenhuma/Semanal/Mensal (qtd até 4). **Implementada** no domínio
  (`GerarOcorrenciasFuturas`), mas foi feita pelo Lucas e **não é prioridade** — validar antes de confiar/evoluir.
- **Regras:** excluir categoria é **bloqueado** se houver tarefa pendente vinculada; concluir tarefa **mantém o
  usuário na tela** (concluir várias em sequência); a IA só escolhe entre categorias do usuário (null se não infere)
  e **não re-categoriza** ao editar.

## 8. Posicionamento (essência — usar como norte de produto)

- Liriun é um **vertical de produtividade pessoal por voz**, com identidade e tom próprios. Não é Todoist/Notion,
  nem clone do app do Gemini.
- **Concorrente-referência:** o **app do Google Gemini** já faz o core (voz, criar/consultar tarefas, grátis,
  pré-instalado no Android). Liriun se diferencia por **foco vertical em tarefas + UX premium + tom próprio**.
- **Público-alvo:** estudantes sobrecarregados, profissionais com fadiga digital, e pessoas com TDAH (captura por
  voz reduz fricção).
- *(Posicionamento/estratégia detalhados da era ToMore foram arquivados fora do repo — ver §12.)*

## 9. Identidade visual & tom de voz

- **Dark mode default**, gradiente roxo→azul accent, glassmorphism sutil, **sem emojis**, ícones lineares finos,
  tipografia **Geist** / Geist Mono.
- Brand kit em `docs/Identidade Visual/Rebranding/brand-kit/` — **provisório**: o rebranding **ainda não foi
  finalizado** e vai mudar. Usar o que existe hoje, sabendo que muda.
- **Tom de voz do Liriun** (estável, não deve mudar): mordomo digital seco e competente, primeira pessoa, nunca
  emoji, nunca exclamação dupla, nome do usuário com parcimônia. Ex.: "Anotado, Pedro. Prazo até sexta, 23:59." /
  "Não consegui entender dessa vez. Preenche manual que eu salvo."
- Tagline "Sua próxima tarefa, na voz" = **rascunho** (vai mudar).

## 10. Infra & operação

- **Backend:** Render (Docker, free tier, cold start ~30-60s após idle). Deploy contínuo por push (hook do Render).
- **Site:** Cloudflare Pages, domínio liriun.com. Deploy por push.
- **Banco:** Supabase Postgres, banco único (dev=prod).
- **Secrets:** variáveis de ambiente (Gemini key, connection string, JWT secret) — provavelmente no Render.
- **CI:** GitHub Actions só builda o APK (`.github/workflows/build-apk.yml`). **Sem** suíte de testes rodando no PR ainda.
- **Sem** monitoramento/error tracking (Sentry, etc) ainda.
- **Git:** uma branch só (`main`), commit direto, tudo sobe pra `main` antes de ir pra produção. Melhorar depois
  que o app estiver pronto.

## 11. Parado / fora de escopo agora

Não gastar energia nisto até chegar a hora (a maioria foi removida dos docs pra não confundir):

- **Monetização / pricing / lojas** — só decidir perto de publicar.
- **Google / Apple Sign-In** — não implementados.
- **Push (FCM)** — estava no app antigo (que será refeito); reavaliar na reconstrução.
- **Modo interativo** (perguntas de follow-up da IA) — flag desligado.
- **Recorrência** — existe mas não priorizada; validar depois.
- **Wake word, integração com calendários, lembretes por SMS/ligação** — futuro distante.
- **Ideias futuras detalhadas** (backlog por tier) — arquivadas fora do repo (§12).

## 12. Documentos do projeto

**Ativos no repo:**
- `CLAUDE.md` (raiz) + `backend/`, `site/`, `app/` `CLAUDE.md` — contexto e regras que o Claude carrega
- `docs/CONTEXTO_APP.md` — **este arquivo** (fonte autoritativa)
- `README.md` + `app/README.md` — setup e operação
- `docs/Identidade Visual/Rebranding/` — brand kit (provisório) + prototypes
- `docs/design-ref/` — style guide visual (PDF)
- `docs/termos-de-uso/` — Termos de Uso + Política de Privacidade

**Arquivados fora do repo** (`~/Desktop/arquivo liriun/`, ignorar até o Pedro pedir):
- `docs-desatualizados/ESTRATEGIA_LIRIUN.md` — estratégia era-ToMore (posicionamento essencial já está no §8)
- `docs-desatualizados/PLANO_NEGOCIO_TEMPLATE.md` — plano de negócio (monetização parada)
- `docs-desatualizados/IDEIAS_FUTURO.md` — backlog de ideias futuras por tier
- `guias-design/CLAUDE_CODE*.md` — guias de design antigos (contradiziam a realidade)
- `ROTEIRO_ENTREVISTA_COMPASS.md` — material pessoal de entrevista
