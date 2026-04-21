# Checklist pré-produção — Jarvis

Itens a resolver **antes** de publicar o Jarvis pra uso real (usuários além de Pedro/sócio/namorada em dev).

## Segurança / Secrets

- [ ] **Trocar `Jwt:Secret`** por string aleatória forte (min 48 chars). A atual é placeholder exposto em chat.
  - Gerar: `[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))`
  - Aplicar via variável de ambiente no deploy (não user-secrets em prod).
- [ ] **Resetar senha do banco Supabase** (Settings → Database → Reset database password) — senha atual foi colada em chat.
- [ ] Revisar todas as connection strings — garantir que estão via secrets manager do provedor (Railway/Vercel/etc), nunca commitadas.
- [ ] Validar que `appsettings.json` não tem nenhum secret real commitado.

## Auth / JWT

- [ ] Definir estratégia de refresh token (hoje expiração de 24h sem refresh).
- [ ] Considerar lockout após N tentativas de login falhas.
- [ ] Adicionar rate limiting nos endpoints de `/auth/*`.

## Banco

- [ ] Habilitar backups automáticos no Supabase (Settings → Database → Backups).
- [ ] Revisar índices com carga real depois do lançamento.
- [ ] Processo de aplicar migrations em prod via CI/CD, não manual.

## Observabilidade

- [ ] Integrar logging estruturado (Serilog) com destino externo (Seq, Grafana, Datadog free tier).
- [ ] Integrar error tracking (Sentry free tier).
- [ ] Health check endpoint (`/health`) com verificação de DB.

## Compliance / LGPD

- [ ] Política de privacidade pública.
- [ ] Termo de uso.
- [ ] Mecanismo de exclusão de conta (direito ao esquecimento).
- [ ] Validar que senhas nunca aparecem em logs (review de ILogger usages).

## Infra

- [ ] Definir provedor final (ver discussão — Hetzner + Docker ou Railway).
- [ ] Domínio próprio com HTTPS (Cloudflare na frente).
- [ ] CI/CD com GitHub Actions (build → test → deploy).
- [ ] Variáveis de ambiente centralizadas no provedor.

## Antes de abrir cadastro público

- [ ] Rate limit no endpoint de cadastro (spam/abuso).
- [ ] Confirmação de email (decisão adiada pra pós-V1 — reavaliar).
- [ ] Monitoramento de custos (Gemini API, Supabase, hospedagem).

---

**Como usar:** quando Pedro sinalizar que vai publicar ("deploy pra prod", "subir pro mundo", etc), varrer esse checklist item por item.
