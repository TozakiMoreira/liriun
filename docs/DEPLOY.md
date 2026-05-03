# Deploy — Liriun V1

Guia executável passo a passo pra subir o Liriun em produção. Marque `[x]` conforme avançar.

> **Status:** Em execução (iniciado 2026-05-03)
> **Domínio:** liriun.com (registrado na Hostinger)
> **Empresa:** Tomore | **Produto:** Liriun

---

## Decisões finais (combo)

| Camada | Serviço | Custo V1 |
|---|---|---|
| DNS | Cloudflare | Grátis |
| Frontend | Cloudflare Pages | Grátis |
| Backend | **Render Free (Docker)** | Grátis (cold start 30-60s após 15min idle) |
| Banco | Supabase Postgres | Grátis |
| IA | Google Gemini | Grátis (free tier) |
| Email caixas | Zoho Mail Free | Grátis (5 contas, 5GB cada) |
| Email transacional | Resend | Grátis (3k/mês) — só V2 |
| CI/CD | GitHub push (auto-deploy Render + Pages) | Grátis |
| **Total V1** | | **R$ 0/mês** |

> **Por que Render e não Fly?** Avaliei Fly ($4/mo), Railway ($5/mo), Oracle Free, Render Free. Pedro escolheu Render Free pelo custo zero. Trade-off aceito: cold start 30-60s na primeira req depois de 15min idle. Pra V1 com 2-3 testers, tolerável. Se virar produto sério, migrar pra Fly/Railway é trivial (Docker padrão, sem lock-in).

### Endereços de email

- `admin@liriun.com` — conta-mãe usada pra cadastrar todas as plataformas
- `contato@liriun.com` — contato público geral
- `suporte@liriun.com` — pedidos de ajuda
- `noreply@liriun.com` — envios transacionais (V2 — Resend)

Todos forwardam (ou inbox real via Zoho) pro Gmail pessoal: **[a definir]**.

### Subdomínios

- `liriun.com` + `www.liriun.com` → frontend (Cloudflare Pages)
- `api.liriun.com` → backend (Render — `liriun-api.onrender.com`)

---

## Análise de escalabilidade

Stack escolhida cobre 0 → 100k+ users sem trocar fornecedor. Vendor lock-in mínimo.

### Custo projetado por tier

| Users ativos | Custo mensal infra |
|---|---|
| 10 (V1) | R$ 0 |
| 100 | ~R$ 10 |
| 1.000 | ~R$ 250 ($50: Supabase Pro + Fly + Gemini) |
| 10.000 | ~R$ 1.250 ($250) |
| 100.000 | ~R$ 7.500 ($1.500) |

### Pontos pra re-visitar conforme cresce

| Trigger | Ação |
|---|---|
| 1k users concorrentes | Ligar PgBouncer (Supabase porta 6543) |
| Foto perfil entupindo DB | Migrar pra Supabase Storage / Cloudflare R2 |
| Cold start incomodando | Fly.io min-instances=1 (~$2/mo extra) |
| 1k+ users globais | Multi-região Fly + Supabase read replicas |
| Erro em prod sem visibilidade | Adicionar Sentry (free tier 5k events/mês) |
| Time interno >5 pessoas | Zoho Mail Lite $1/conta/mês |

### Lock-in (todos zero ou baixo)

| Fornecedor | Migrar pra... | Tempo estimado |
|---|---|---|
| Cloudflare Pages | Vercel/Netlify/S3+CloudFront | 1h |
| Fly.io | Railway/Render/AWS ECS | 2h |
| Supabase | Neon/RDS/qualquer Postgres | 1 dia |
| Gemini | OpenAI/Claude/Mistral | 2h |
| Resend | SES/Postmark/Mailgun | 1h |
| Zoho | Workspace/Microsoft 365 | 1 dia |
| Cloudflare DNS | Qualquer DNS | 1h |

### Riscos arquiteturais (do app, não infra)

1. Foto perfil base64 no DB — migrar pra storage object antes de 1k users
2. Sem rate limiting próprio — adicionar antes de cadastro público
3. JWT sem refresh token — implementar antes de UX virar problema
4. Sem job queue — adicionar fila quando IA passar de 100 calls/min
5. Single region — usar Fly multi-region quando virar global

---

## Passo a passo

### Fase 1 — Cloudflare (DNS) ✅

> Tudo depende disso. Faz primeiro.

- [x] Criar conta Cloudflare em https://dash.cloudflare.com/sign-up usando email pessoal (tozakimoreira@hotmail.com)
- [x] Add a Site → digitar `liriun.com` → plano **Free**
- [x] Cloudflare escaneia DNS atual da Hostinger automaticamente. Confirma que importou registros existentes.
- [x] Cloudflare mostra **2 nameservers** (`max.ns.cloudflare.com` e `sureena.ns.cloudflare.com`)
- [x] Login no painel Hostinger → Domínios → liriun.com → DNS / Nameservers
- [x] Trocar de "Hostinger Nameservers" pra "Use nameservers diferentes"
- [x] Colar os 2 nameservers da Cloudflare → salvar
- [x] Voltar pra Cloudflare → "Done, check nameservers"
- [x] Cloudflare email confirmando ativação (~10min)
- [x] **Verificação:** painel Cloudflare mostra `liriun.com` como Active

**Concluído 2026-05-03**

### Fase 2 — Email Zoho Mail Free ✅

> Depois que DNS Cloudflare estiver Active. Aqui criamos `admin@liriun.com` pra usar nas próximas plataformas.

> ⚠️ **Aviso 2026:** Zoho escondeu link visível pro Forever Free Plan na página de pricing pública. Existe ainda mas o caminho de descoberta foi via wizard de setup do Zoho Mail (escolher "Crie uma conta de e-mail baseada em domínio" em vez do plano pago). Caso o caminho mude no futuro, alternativas: contatar `support@zohomail.com` pedindo ativação Free, ou pivotar pra Cloudflare Email Routing (forward-only, mas grátis garantido).

- [x] Criar conta Zoho em https://www.zoho.com → cadastro com email pessoal (tozakimoreira@hotmail.com)
- [x] Acessar Zoho Mail → wizard "Bem-vindo ao Zoho Mail" → escolher **"Crie uma conta de e-mail baseada em domínio no Zoho"** (atalho pro Free Plan)
- [x] Adicionar domínio `liriun.com` no Zoho
- [x] Verificação de domínio via TXT record:
  - Type: `TXT` | Name: `@` | Content: `zoho-verification=zb10369672.zmverify.zoho.com`
  - Adicionar no Cloudflare DNS → aguardar ~30s → clicar "Verificar registro TXT" no Zoho
- [x] Criar primeira caixa: **admin@liriun.com** (Superadmin do workspace)
- [x] **Mapeamento de DNS** → escolher "Configurar manualmente" → adicionar 5 registros no Cloudflare:
  ```
  MX  | @                | mx.zoho.com               | Priority 10
  MX  | @                | mx2.zoho.com              | Priority 20
  MX  | @                | mx3.zoho.com              | Priority 50
  TXT | @                | v=spf1 include:zohomail.com ~all
  TXT | zmail._domainkey | v=DKIM1; k=rsa; p=... (valor longo, copiar do Zoho)
  ```
- [x] Voltar pro Zoho → "Verificar todos os registros" → tudo verde
- [x] Criar caixas adicionais (Free permite até 5 contas):
  - [x] contato@liriun.com
  - [x] suporte@liriun.com
  - [x] noreply@liriun.com
- [x] Senhas guardadas em gerenciador
- [x] Teste recebimento: hotmail → admin@liriun.com → chegou na inbox Zoho ✓
- [x] Teste envio: admin@liriun.com → hotmail → chegou (NÃO em spam) ✓
- [ ] (Opcional V2) Configurar Zoho IMAP no app Gmail mobile pra centralizar inboxes

> A partir daqui, **todas as próximas contas usam admin@liriun.com**.

**Concluído 2026-05-03**

### Fase 3 — Preparar repo pra deploy ✅

- [x] Branch principal é `main`
- [x] `.env.local` no `.gitignore` (regra `.env.*`) — confirmado não commitado
- [x] **Resetar senha Supabase** (Settings → Database → Reset password) — Pedro fez no painel
- [x] **Gerar novo `Jwt:Secret`** forte (PowerShell):
  ```powershell
  [Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 } | ForEach-Object { [byte]$_ }))
  ```
- [x] Secrets guardados em gerenciador (Pedro)
- [x] `Dockerfile` criado em `backend/` (multi-stage, .NET 10 SDK + ASP.NET runtime, porta 8080 por default — Render sobrescreve via env var pra 10000)
- [x] `.dockerignore` criado em `backend/`
- [x] `Program.cs` (Liriun.Api) — CORS atualizado pra aceitar `liriun.com` + `www.liriun.com`
- [x] `front/src/environments/environment.prod.ts` apontando pra `https://api.liriun.com`

**Concluído 2026-05-03**

### Fase 4 — Backend Render Free ✅

> Trade-off Render Free: cold start 30-60s após 15min idle. Tolerável pra V1. Migrar pra Fly $4/mo se UX virar problema.

- [x] Criar conta Render em https://render.com com email pessoal
- [x] Connect GitHub → Install Render App na Org `Jarvis-by-ToMore` (selected repo: `Liriun`)
- [x] New → **Web Service** → escolher repo `Liriun`
- [x] Configurar service:
  - Name: `liriun-api`
  - Language: `Docker`
  - Branch: `main`
  - Region: `Virginia (US East)` — mais perto do Brasil que Oregon
  - Root Directory: `backend`
  - Dockerfile Path: `.` (relativo ao Root Directory = `backend/Dockerfile`)
  - Instance Type: **Free** ($0/mês, 512MB RAM, 0.1 CPU)
- [x] Environment Variables:
  ```
  ConnectionStrings__Liriun  = Host=db.lmprlnumgculcdbvktmv.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=NOVA;SSL Mode=Require;Trust Server Certificate=true
  Jwt__Secret                = (gerado novo)
  Gemini__ApiKey             = AIzaSy...
  ASPNETCORE_ENVIRONMENT     = Production
  ASPNETCORE_URLS            = http://+:10000
  ```
  > Notação `.NET` no Render usa `__` (duplo underscore) no lugar de `:`. `ASPNETCORE_URLS=http://+:10000` é crítico — Render espera porta 10000.
- [x] Auto-Deploy: `On Commit` (push na main = build + deploy auto, ~5-10min)
- [x] Deploy Web Service → primeira build OK
- [x] Verificar `https://liriun-api.onrender.com` está Live
- [x] Teste: `https://liriun-api.onrender.com/categorias` → HTTP 401 (correto, exige JWT)

**Concluído 2026-05-03**

### Fase 5 — Custom domain api.liriun.com ✅

- [x] Render dashboard → Settings → **Custom Domains** → Add → `api.liriun.com`
- [x] Render mostra valor CNAME pra adicionar no DNS
- [x] Cloudflare DNS → Add record:
  ```
  Type: CNAME | Name: api | Target: liriun-api.onrender.com | Proxy: DNS only (cinza)
  ```
  > **Crítico:** Proxy DESLIGADO (cinza). Render emite cert SSL próprio via Let's Encrypt — Cloudflare proxy quebraria com erro 1000 ("DNS points to prohibited IP").
- [x] Render → Verify (instantâneo após DNS propagar ~30s)
- [x] Aguardar Certificate Status virar Active (~1-5min Let's Encrypt)
- [x] Teste: `https://api.liriun.com/categorias` → HTTP 401 (correto)

**Concluído 2026-05-03**

### Fase 6 — CORS já configurado ✅

CORS pra `liriun.com` + `www.liriun.com` já incluído no `Program.cs` desde Fase 3 — sem ação extra necessária.

### Fase 7 — Frontend Cloudflare Pages

- [ ] Atualizar `front/src/environments/environment.prod.ts`:
  ```ts
  export const environment = {
    production: true,
    apiUrl: 'https://api.liriun.com',
  };
  ```
- [ ] Commit + push
- [ ] No Cloudflare → Workers & Pages → Create → Pages → **Connect to Git**
- [ ] Autorizar GitHub, escolher repo `Liriun`
- [ ] Configurar build:
  - Project name: `liriun`
  - Production branch: `main`
  - Framework preset: `Angular`
  - Build command: `cd front && npm install && npm run build`
  - Build output directory: `front/dist/front/browser` (verificar nome real após build local)
  - Root directory: `/`
- [ ] Save and Deploy → aguarda primeiro build (~3min)
- [ ] Acessa URL temporária `liriun.pages.dev` → confirma que app carrega

### Fase 8 — Custom domain liriun.com no front

- [ ] No projeto Cloudflare Pages → Custom domains → Set up a custom domain
- [ ] Adicionar `liriun.com` → Cloudflare cria CNAME automaticamente (proxy ativado/laranja é OK aqui)
- [ ] Adicionar `www.liriun.com` também
- [ ] Aguardar SSL (~1-3min — Cloudflare gerencia)
- [ ] Acessar https://liriun.com — deve abrir landing
- [ ] Testar fluxo completo: cadastro → onboarding → criar tarefa → listar

### Fase 9 — CI/CD (já ativo, sem GitHub Actions)

Render auto-deploy `On Commit` + Cloudflare Pages auto-deploy = push na `main` dispara build+deploy automático em ambos. **Zero configuração extra.**

Workflow opcional pra rodar testes antes (não bloqueia deploy hoje):

```yaml
# .github/workflows/test-backend.yml
name: Test Backend
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '10.0.x'
      - run: dotnet test backend
```

### Fase 10 — Smoke test produção

- [ ] Acessar https://liriun.com em desktop
- [ ] Acessar https://liriun.com no celular
- [ ] Cadastrar usuário novo
- [ ] Onboarding (templates de categorias)
- [ ] Criar tarefa modo Manual
- [ ] Criar tarefa modo Jarvis (testa Gemini em prod)
- [ ] Listar pendentes
- [ ] Concluir tarefa
- [ ] Listar concluídas
- [ ] Editar perfil + foto
- [ ] Alterar senha
- [ ] Logout + login
- [ ] Verificar logs Render: dashboard → Logs — sem erros
- [ ] Verificar Cloudflare Analytics: requests chegando
- [ ] Verificar Supabase: dados sendo gravados

---

## Pós-deploy — checklist segurança

- [ ] Confirmar `.env.local` NUNCA commitado
- [ ] Confirmar secrets do Render setados via Environment Variables no painel, não em arquivo
- [ ] Confirmar Cloudflare Pages env vars (se houver) setadas no painel, não em código
- [ ] Habilitar 2FA em todas as contas: Cloudflare, Render, GitHub, Zoho, Supabase, Google
- [ ] Documentar credenciais em gerenciador de senhas compartilhado (Pedro + Lucas)
- [ ] (Opcional) UptimeRobot pingando `https://api.liriun.com/categorias` a cada 5min pra evitar cold start Render Free

## Backlog pós-V1

- [ ] Resend pra emails transacionais (recuperação senha)
- [ ] Sentry pra error tracking
- [ ] Health check endpoint /health
- [ ] Rate limiting nos endpoints /auth/*
- [ ] Migrar foto perfil pra storage object
- [ ] Habilitar backups automáticos Supabase (Pro $25/mo)
- [ ] Política de privacidade + Termos de uso (LGPD)
- [ ] Mecanismo de exclusão de conta (LGPD)
