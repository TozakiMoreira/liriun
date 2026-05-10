# Backup — código removido do main

Pasta **só existe na branch `producao`**. Não é mergeada pra `main`. Serve como cofre de código que removemos do produto ativo mas pode ser útil consultar/restaurar no futuro.

> **⚠️ Pra Claude (sessões futuras):** Antes de "deletar" qualquer coisa daqui, **pergunta ao Pedro primeiro**. Esses arquivos foram removidos do main intencionalmente, mas mantidos aqui por decisão dele. Não use git rm sem confirmar.

---

## `front-angular-v1/`

**O que é:** site V1 da Liriun em Angular 18 (PWA). Funcional, ficou no ar até `liriun.com` migrar pro Next.js (`landing/`).

**Removido em:** 2026-05-10 (commit `3bad961` no main).

**Por quê:** pivô pra Next.js 15. V2 (`landing/`) cobre 100% das features do V1 + tem multi-cliente (compartilha backend com app Flutter).

**Estado no momento da remoção:**
- Auth (cadastro/login JWT)
- Onboarding bloqueante de categorias
- Captura Modo Manual + Modo Liriun (texto + áudio Gemini multimodal)
- Tarefas (Lista + Quadro + Semana)
- Visão geral (dashboard com stat cards, gráfico, donut, timeline)
- Tema claro/escuro
- Sidebar collapsible

**Tag git que preserva o estado funcional:** `v1-final` → commit `4047a83` ("Fix bug do mobile em logout").

**Como restaurar:**
```bash
# opção 1: trazer tudo de volta como estava (V1 só, sem V2)
git checkout v1-final

# opção 2: copiar tudo pra main mantendo V2
cp -r backup/front-angular-v1 ../Liriun/front
cd ../Liriun && git add front && git commit -m "restore: V1 front"

# opção 3: portar uma feature específica (ex: PageHeaderService)
cp -r backup/front-angular-v1/src/app/core/layout ../Liriun/...
```

**Diferenças vs V2 que valem lembrar:**
- Áudio: V1 usa Gemini **multimodal** (manda áudio bruto pro backend, Gemini transcreve+entende em 1 call). V2 (`landing/app/[locale]/app/falar/page.tsx`) usa Web Speech API browser + Gemini só pra texto. V1 funciona melhor em sotaques carregados / ambientes ruidosos.
- Captura: V1 tem quick-reply chips ("Salva", "Muda data") e persistência de rascunho em localStorage com TTL 1h. V2 não trouxe esses.
- Dashboard: V1 tem `/app/visao-geral` (4 stat cards + gráfico semana + donut categorias + timeline + pendentes por prioridade). V2 trocou por `/app/atividade` (gamificação: streak/níveis/conquistas).

Se Pedro pedir "trazer dashboard V1 de volta", `backup/front-angular-v1/src/app/features/visao-geral/` tem o componente todo.

---

## `financas/`

**O que é:** módulo financeiro do backend .NET (entidade `Lancamento` + use cases + controller `/financas/*`).

**Removido em:** 2026-05-10 (commit `3bad961` no main).

**Por quê:** Pedro decidiu que **finanças nunca vai ser reativado** (2026-05-10). Foi explorado mas não entrou no escopo do produto Liriun (organizador pessoal de tarefas, não app financeiro).

**Migration EF Core:** as duas migrations (`AdicionarLancamentos` + `RemoverLancamentos`) **ficam no histórico do projeto main** (`backend/src/Liriun.Infrastructure/Persistence/Migrations/`). Migrations não vão pro backup porque são fonte de verdade do schema do banco — EF Core precisa do histórico íntegro pra rodar `dotnet ef database update` em qualquer ambiente.

**Estado no momento da remoção:**
- 27 arquivos (Controller, 8 UseCases, 2 Validators, 2 InputModels, 1 ViewModel, 1 ReadModel, 1 ReadRepository interface + impl, 1 Repository interface + impl, 1 Entity, 3 Enums, 1 Errors, 1 EF Configuration, 1 Mapper, 1 Model)
- Tabela `lancamentos` no Supabase: ainda existe no momento do remove. Migration `RemoverLancamentos` faz `DropTable` mas só é aplicada quando alguém rodar `dotnet ef database update` ou redeploy o backend (Render). Verificar se foi aplicada antes de cobrar do banco.

**Como restaurar:**
```bash
# 1. Copiar arquivos de volta pros paths originais
cp -r backup/financas/backend/* backend/

# 2. Recolocar DbSet em LiriunDbContext.cs:
#    public DbSet<LancamentoModel> Lancamentos => Set<LancamentoModel>();

# 3. Recolocar DI:
#    - ApplicationModule.cs: services.AddScoped<{Listar,Criar,Atualizar,Remover,MarcarPago,DesfazerPagamento,ObterBalanco,ObterAnexo}LancamentoUseCase>()
#    - InfrastructureModule.cs: services.AddScoped<ILancamentoRepository, LancamentoRepository>() + ReadRepo

# 4. Reverter migration RemoverLancamentos (rollback):
dotnet ef database update AdicionarRecorrenciaQuantidade --project src/Liriun.Infrastructure --startup-project src/Liriun.Api
# (volta pra antes do RemoverLancamentos, tabela `lancamentos` é recriada)

# 5. Remover a migration RemoverLancamentos do código (não é mais relevante):
dotnet ef migrations remove --project src/Liriun.Infrastructure --startup-project src/Liriun.Api
```

**Decisões importantes que ficaram nos arquivos:**
- `Lancamento.MarcarComoPago` (Entity:109): receita auto-marcada como Pago na criação. Existia bug latente — `MarcarComoPago` silenciosamente sucede pra receita. Se restaurar, considerar split em `Despesa`/`Receita` ou flag `IsReceita`.
- `LancamentoRepository.AdicionarAsync` (Infrastructure:31): bug de mapper duplo (entity→model→entity). Props resetam pra default. Fix: retornar entity passada direto.

---

## Workflow

- Pasta `backup/` mora só na branch `producao`.
- Quando mergear `producao → main`, **excluir esta pasta** do merge (use `.gitattributes` `export-ignore` ou cherry-pick commits sem mexer aqui).
- Adicionar novos itens: criar subpasta + atualizar este README com seção igual às anteriores (o quê, por quê, quando, como restaurar).
