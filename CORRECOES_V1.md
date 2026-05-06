# Correções V1

> Lista de mudanças feitas na pasta de **dev local** (`LiriunProducao\liriun`).
> Cada item será avaliado depois pra decidir se entra no oficial (`Workspace\Liriun\Liriun`).

---

## 2026-05-06

### 1. Página/artefatos de loading
**Problema:** Backend carregando deixa página estática, sem indicador.

**Solução:**
- `LoadingService` (signal counter) — `core/loading/loading.service.ts`
- `loadingInterceptor` — inc/dec por request HTTP, opt-out via `SKIP_LOADING` token (`core/loading/loading.interceptor.ts`)
- `<app-loading-bar>` — barra topo global com shimmer + atraso 120ms (anti-flash) + mín 320ms visível (anti-piscar). Montado em `app.component.html`
- `<app-spinner>` — spinner reutilizável (sm/md/lg)
- `<app-skeleton>` — placeholder shimmer
- `<app-loading-overlay>` — splash full-screen com brand+logo+mensagem (uso opcional em boot ou ações pesadas)

**Arquivos novos:**
- `front/src/app/core/loading/loading.service.ts`
- `front/src/app/core/loading/loading.interceptor.ts`
- `front/src/app/shared/loading-bar.component.ts`
- `front/src/app/shared/spinner.component.ts`
- `front/src/app/shared/skeleton.component.ts`
- `front/src/app/shared/loading-overlay.component.ts`

**Arquivos editados:**
- `front/src/app/app.config.ts` (registra interceptor)
- `front/src/app/app.component.ts` + `app.component.html` (monta barra global)

---

### 2. Tarefas no mesmo horário se entrelaçam
**Problema:** Visão geral (Agenda hoje) + Tarefas (Semana) — 2 tarefas mesma hora ficam sobrepostas.

**Solução:**
- Utilitário `calcularLayoutAgenda` — algoritmo greedy estilo Google Calendar. Agrupa overlaps em clusters, distribui em colunas, retorna `col`/`totalCols`.
- Visão geral e Semana usam `[style.left]`/`[style.width]` % calculado → tarefas ficam lado a lado.
- Funciona desktop + mobile (% based).

**Arquivos novos:**
- `front/src/app/shared/agenda-layout.ts`

**Arquivos editados:**
- `front/src/app/features/visao-geral/visao-geral.component.ts`
- `front/src/app/features/tarefas/tarefas.component.ts`

---

### 3. Click na tarefa do calendário
**Problema:** Agenda da tela inicial não permitia clicar na tarefa pra abrir card.

**Solução:**
- Card virou `<button>` com `cursor-pointer` + hover `brightness-110`
- Click abre `<app-tarefa-detalhe-modal>` **inline** (sem navegação)
- Concluir/Reabrir → API + recarrega pendentes + fecha modal
- Editar/Excluir → navega `/app/tarefas?detalhe=<id>` (delega flow completo)
- Tarefas → `ngOnInit` lê `detalhe` query param, abre modal após carregar

**Arquivos editados:**
- `front/src/app/features/visao-geral/visao-geral.component.ts`
- `front/src/app/features/tarefas/tarefas.component.ts`

---

### 4. Toggle de visualização sem indicador no mobile
**Problema:** Lista/Quadro/Semana só mostra ícones em mobile, 3 botões soltos sem rótulo.

**Solução:**
- Label `Modo` (uppercase, text-subtle) ao lado do toggle, visível só em mobile (`sm:hidden`).

**Arquivos editados:**
- `front/src/app/features/tarefas/tarefas.component.ts`

---

### 5. Recorrência de tarefas (semanal/mensal)
**Pedido:** Tarefa pode repetir toda semana ou todo mês.

**Solução:**
- Domain: enum `TipoRecorrencia` (Nenhuma|Semanal|Mensal). Campo `Recorrencia` em `Tarefa` (default Nenhuma).
- `Tarefa.GerarProximaOcorrencia()` — quando concluir tarefa recorrente, backend cria nova: data avançada (+7d ou +1 mês), mesmas categorias/prioridade, status pendente. Original vai pra Concluídas (histórico preservado).
- Migration EF `AdicionarRecorrenciaTarefa` aplicada no Supabase.
- Frontend form: 3 chips (Sem repetir / Toda semana / Todo mês) com ícone `fa-repeat` em ativos.
- Modal detalhe mostra recorrência se houver.

**Arquivos novos:**
- `backend/src/Liriun.Core/Enums/TipoRecorrencia.cs`
- `backend/src/Liriun.Infrastructure/Persistence/Migrations/20260506xxxxxx_AdicionarRecorrenciaTarefa.cs`

**Arquivos editados:**
- `backend/src/Liriun.Core/Entities/Tarefa.cs` (+ campo + métodos `GerarProximaOcorrencia`)
- `backend/src/Liriun.Application/InputModels/Tarefas/CriarTarefaInput.cs`, `AtualizarTarefaInput.cs`
- `backend/src/Liriun.Application/ReadModels/TarefaReadModel.cs`
- `backend/src/Liriun.Application/ViewModels/Tarefas/TarefaViewModel.cs`
- `backend/src/Liriun.Application/UseCases/Tarefas/CriarTarefaUseCase.cs`, `AtualizarTarefaUseCase.cs`, `ConcluirTarefaUseCase.cs`
- `backend/src/Liriun.Infrastructure/Persistence/Models/TarefaModel.cs`
- `backend/src/Liriun.Infrastructure/Persistence/Mappers/TarefaMapper.cs`
- `backend/src/Liriun.Infrastructure/Persistence/Configurations/TarefaConfiguration.cs`
- `backend/src/Liriun.Infrastructure/ReadRepositories/TarefaReadRepository.cs`
- `front/src/app/core/api/tarefas.service.ts`
- `front/src/app/features/tarefas/tarefa-form.component.ts`
- `front/src/app/features/tarefas/tarefa-detalhe-modal.component.ts`

---

### 6. Módulo de Finanças / Contas a pagar
**Pedido:** Página com salário, contas a pagar (vencimento, valor, boleto anexo), balanço mensal/anual, recorrência (aluguel etc), cálculo de quanto sobra.

**Domain (1 entidade unificada `Lancamento`):**
- Tipo (Receita | Despesa)
- Categorias fixas via enum (`CategoriaLancamento`):
  - Receitas: Salário, Freelance, Investimento, Outros
  - Despesas: Moradia, Alimentação, Transporte, Saúde, Educação, Lazer, Serviços, Compras, Outros
- Status (Pendente | Pago — relevante só pra despesa; receita vira Pago automático)
- Recorrência (reusa enum `TipoRecorrencia`)
- AnexoBoleto (base64, até 1MB, PDF ou imagem)
- Quando despesa recorrente é marcada paga → backend gera próxima ocorrência

**Endpoints (`/financas`):**
- `GET /lancamentos?ano=&mes=`
- `POST /lancamentos`
- `PUT /lancamentos/{id}`
- `DELETE /lancamentos/{id}`
- `POST /lancamentos/{id}/pagar`
- `GET /lancamentos/{id}/anexo`
- `GET /balanco?ano=&mes=` — totais + por categoria + por mês

**Frontend (`/app/financas`):**
- Sidebar (desktop + mobile) com `fa-wallet`
- Header com toggle Mensal | Anual + navegação ano/mês
- 3 stat cards animados: Recebido (verde), Despesas (rosa, paga + pendente), Saldo (gradient com %economia)
- Lista de lançamentos com filtros (Tudo/Recebimentos/Pagamentos × Todos/A pagar/Pagos)
  - Ícone categoria, descrição, recorrência, anexo, prazo ("vence em 3d")
  - Botão check inline pra marcar pago
  - Botão remover
- Modal `<app-lancamento-form>` — toggle tipo (recebimento/pagamento), descrição, valor, data, categoria com grid de ícones, recorrência, drag-drop boleto, observações
- Mini-calendário do mês com dots em dias com lançamentos
- Breakdown despesas por categoria (barras horizontais)
- Modo anual: gráfico barras receita+despesa mês a mês
- Empty state com CTA

**Arquivos novos backend:**
- `backend/src/Liriun.Core/Entities/Lancamento.cs`
- `backend/src/Liriun.Core/Enums/TipoLancamento.cs`, `StatusLancamento.cs`, `CategoriaLancamento.cs`
- `backend/src/Liriun.Core/Errors/LancamentoErrors.cs`
- `backend/src/Liriun.Core/Interfaces/Repositories/ILancamentoRepository.cs`
- `backend/src/Liriun.Application/InputModels/Lancamentos/{Criar,Atualizar}LancamentoInput.cs`
- `backend/src/Liriun.Application/Validators/Lancamentos/{Criar,Atualizar}LancamentoValidator.cs`
- `backend/src/Liriun.Application/ReadModels/LancamentoReadModel.cs`
- `backend/src/Liriun.Application/ReadRepositories/ILancamentoReadRepository.cs`
- `backend/src/Liriun.Application/ViewModels/Lancamentos/LancamentoViewModel.cs`
- `backend/src/Liriun.Application/UseCases/Lancamentos/*` (Criar/Atualizar/Remover/MarcarPago/Listar/ObterBalanco/ObterAnexo)
- `backend/src/Liriun.Infrastructure/Persistence/Models/LancamentoModel.cs`
- `backend/src/Liriun.Infrastructure/Persistence/Mappers/LancamentoMapper.cs`
- `backend/src/Liriun.Infrastructure/Persistence/Configurations/LancamentoConfiguration.cs`
- `backend/src/Liriun.Infrastructure/Persistence/Migrations/20260506xxxxxx_AdicionarLancamentos.cs`
- `backend/src/Liriun.Infrastructure/Repositories/LancamentoRepository.cs`
- `backend/src/Liriun.Infrastructure/ReadRepositories/LancamentoReadRepository.cs`
- `backend/src/Liriun.Api/Controllers/FinancasController.cs`

**Arquivos novos frontend:**
- `front/src/app/core/api/financas.service.ts`
- `front/src/app/features/financas/financas.component.ts`
- `front/src/app/features/financas/lancamento-form.component.ts`

**Arquivos editados:**
- `backend/src/Liriun.Application/IoC/ApplicationModule.cs`
- `backend/src/Liriun.Infrastructure/IoC/InfrastructureModule.cs`
- `backend/src/Liriun.Infrastructure/Persistence/LiriunDbContext.cs`
- `front/src/app/app.routes.ts`
- `front/src/app/layout/shell.component.ts`

**Migration aplicada no Supabase:** `AdicionarLancamentos` (cria tabela `lancamentos` com índices).

---

### 7. Polish Finanças (bug categoria + UX período + 1 só botão + 3 vistas)

**Bugs/UX:**
- Categorias do form mostravam itens errados ao trocar tipo (Recebimento mostrava categorias de Despesa). Causa: `tipo` era property comum, `categoriasDoTipo` computed nunca recalculava. Fix: `tipo` virou signal.
- Header tinha 2 botões (Recebimento + Lançar) confuso. Removido. Agora só `+ Novo lançamento` (default tipo despesa). Tabs Recebimento/Pagamento ficam dentro do modal.
- Navegação ano/mês simples → popover bonito: trio prev/label/next num pill, click no centro abre painel com setas pra ano + grid 3×4 de meses (mês atual em azul, selecionado em roxo) + botões Hoje/Fechar. Click fora fecha.

**Visualizações de lançamentos:**
- Toggle 3 modos no topo: **Lista** | **Calendário** | **Categoria**
- **Lista** (atual): item por item com filtros tipo+status, botão pagar inline
- **Calendário** (novo): grid 7 colunas mensal, cada célula com até 3 lançamentos coloridos (verde recebimento / âmbar a pagar / rosa pago), legenda no rodapé. Click no item abre edição
- **Categoria** (novo): cards agrupados por categoria com header (ícone + nome + total + qtde + "X a pagar" em âmbar) e lista de itens dentro

**Arquivos editados:**
- `front/src/app/features/financas/lancamento-form.component.ts` (tipo signal)
- `front/src/app/features/financas/financas.component.ts` (popover + view toggle + 3 vistas + agrupamento)

---

### 8. Widget Finanças na tela inicial (substitui Atividade da semana)

**Pedido:** Remover gráfico de barras "Atividade da semana", colocar widget de finanças bonito.

**Solução:**
- Card link clicável (`<a routerLink="/app/financas">`)
- Background com gradient sutil + glow blur (verde se saldo positivo, vermelho se negativo)
- Saldo grande à esquerda + % de economia
- Mini-barras à direita: Recebido (verde) + Despesas (rosa+âmbar para pago/pendente)
- Aviso "X a pagar" se houver pendentes
- Estado vazio bonito com CTA "Abrir Finanças"
- Hover: chevron pra direita "ver mais"

**Arquivos editados:**
- `front/src/app/features/visao-geral/visao-geral.component.ts`

---

### 9. Diagnóstico IA — todo prompt vira "Bati no limite da IA"

**Sintoma:** Toda chamada do modo Liriun retorna "Bati no limite". User reporta tokens não consumidos hoje.

**Causa provável (baseada em código):** Backend só retorna essa msg se Google responde HTTP 429. Tokens não usados = quota daily zerada (free tier reset UTC), key revogada, ou modelo deprecated.

**Mudanças:**
- Default model `gemini-2.0-flash` → **`gemini-2.5-flash`** (current 2026, free tier ativo)
- Tratamento de erros no `GeminiService.ChamarGeminiAsync`:
  - 400/404 → `ia.nao-configurada` ("Servico de IA nao esta configurado") em vez de "Falha na análise" (modelo deprecated/inválido)
  - 401/403 → `ia.nao-configurada` (key inválida/sem permissão)
  - 429 mantém "Bati no limite"
  - Log inclui modelo usado + body 1500 chars (era 500)

**Pra diagnóstico real:**
1. Para API rodando, rebuilda
2. Tenta chamada IA novamente
3. Olha log: `Gemini retornou {StatusCode} (...modelo=X): {Body}` — body do Google traz `error.message` real
4. Se "RESOURCE_EXHAUSTED" → quota esgotada (espera 24h ou ativa billing)
5. Se "API key not valid" → renovar key no Google AI Studio
6. Se "model not found" → modelo deprecated (já trocado pra 2.5-flash)

**Arquivos editados:**
- `backend/src/Liriun.Infrastructure/Ia/GeminiOptions.cs`
- `backend/src/Liriun.Infrastructure/Ia/GeminiService.cs`

**Erro real identificado:** user-secrets tinha valor errado `Gemini:Model = "modelo=gemini-2.5-flash"` (prefixo `modelo=` indevido). URL Google ficava `models/modelo=gemini-2.5-flash:generateContent` → 400 → "ia.nao-configurada". Fix: `dotnet user-secrets set "Gemini:Model" "gemini-2.5-flash-lite"`.

---

### 10. Prompt da IA — instruções melhores (qualidade)

**Sintoma:** "tenho psi amanha" → IA criava tarefa com título "salvar" e respondia "Faltou o que fazer".

**Causa:** prompt one-shot tinha fallback fraco (primeiras 6-8 palavras) + sem regras pra inferir verbo implícito de substantivos eventuais ("tenho X", "consulta", "reuniao"). Em conversas multi-turno, IA puxava palavras de turnos anteriores.

**Solução:** rewrite de `MontarInstrucaoOneShot`:
- **Inferência de verbo implícito**: substantivo + prazo → ação imperativa (`tenho psi` → `Sessao de psicologia`, `tenho medico` → `Consulta com medico`, `tenho reuniao` → `Reuniao`)
- **Bloqueio explícito**: nunca usar `salvar`, `anotar`, `tarefa`, `nova`, `ok` como título
- **Foco no turno atual**: regra explícita "NAO reaproveite titulos/palavras de turnos anteriores"
- **Regras refinadas** de prioridade (palavras-chave) e categoria (matching óbvio)
- **Mensagem**: proibido dizer "Faltou o que fazer" se conseguiu inferir título
- **4 exemplos concretos** colados no prompt (psi, comprar, reunião, aniversário) — Gemini segue padrão melhor

**Iteração 2 — turnos de pergunta/conversa:**
Sintoma: user pergunta "pode me indicar sites pra isso?" após criar tarefa → IA respondia "Anotado." e criava tarefa duplicada com título estranho.

Causa: prompt forçava `tarefa preenchida sempre` mesmo quando turno era pergunta.

Solução:
- **Classificação obrigatória de 4 tipos de turno**: NOVA TAREFA / AJUSTE / CONFIRMAÇÃO / PERGUNTA-CONVERSA
- **Pergunta/conversa** retorna `tarefa=null` + mensagem responde curto. Pode citar nomes de sites/apps consagrados (Booking, Uber, iFood) — sem inventar URLs
- **Confirmação** ("salva", "ok", "pode salvar") mantém tarefa do turno anterior intacta
- **Mais 3 exemplos**: pergunta sobre hospedagem, confirmação "salva", pergunta de clima

**Arquivos editados:**
- `backend/src/Liriun.Infrastructure/Ia/GeminiService.cs`

---
