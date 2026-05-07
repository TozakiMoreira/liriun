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
(continua abaixo)

---

### 11. Recorrência tarefas — quantidade upfront (fix bug "não vejo próxima")

**Problema:** Tarefa recorrente só gerava próxima ocorrência ao concluir. Se user não concluía, nunca via outras semanas.

**Solução:**
- Novo campo `RecorrenciaQuantidade` (1-4) em `Tarefa`
- `GerarOcorrenciasFuturas()` cria N-1 tarefas upfront (datas avançadas +7d ou +1mês)
- `CriarTarefaUseCase` cria tarefa original + chama upfront — todas instâncias visíveis imediatamente
- Auto-renew on conclude **removido** (substituído por upfront determinístico)
- `Atualizar` aceita quantidade
- Migration `AdicionarRecorrenciaQuantidade` aplicada Supabase
- Form: ao escolher recorrência, aparece bloco "Por quantas semanas/meses?" com chips 1x/2x/3x/4x + texto preview

**Arquivos editados:**
- `backend/src/Liriun.Core/Entities/Tarefa.cs`
- `backend/src/Liriun.Application/InputModels/Tarefas/{Criar,Atualizar}TarefaInput.cs`
- `backend/src/Liriun.Application/ReadModels/TarefaReadModel.cs`
- `backend/src/Liriun.Application/ViewModels/Tarefas/TarefaViewModel.cs`
- `backend/src/Liriun.Application/UseCases/Tarefas/{Criar,Atualizar,Concluir}TarefaUseCase.cs`
- `backend/src/Liriun.Infrastructure/Persistence/Models/TarefaModel.cs`
- `backend/src/Liriun.Infrastructure/Persistence/Mappers/TarefaMapper.cs`
- `backend/src/Liriun.Infrastructure/Persistence/Configurations/TarefaConfiguration.cs`
- `backend/src/Liriun.Infrastructure/ReadRepositories/TarefaReadRepository.cs`
- `front/src/app/core/api/tarefas.service.ts`
- `front/src/app/features/tarefas/tarefa-form.component.ts`

---

### 12. Reestruturação completa da página Tarefas + bulk select

**Pedido:** estruturar igual Finanças. Bulk operations (excluir/concluir múltiplas).

**Solução:**
- Header local mobile redundante removido
- Hero: subtítulo dinâmico (`12 pendentes · 3 atrasadas`) + botão `+ Nova tarefa` desktop
- 3 stat cards: Pendentes / Atrasadas (vermelho se >0) / Hoje (roxo)
- Toolbar 2 grupos: View tabs (Lista/Quadro/Semana) à esquerda; Filtros + Selecionar agrupados à direita (`md:ml-auto`)
- FAB mobile flutuante bottom-right com **pop-in animation** ao entrar (scale spring) e **collapse suave** (max-width + opacity transition) após 2.5s — vira bolinha
- Bulk: signal `selecionando` + `selecionados` Set
- Botão "Selecionar"/"Cancelar" toggle (bg accent quando ativo)
- Modo seleção: bolinha de concluir some, slot vira **checkbox quadrado** (rounded-md, 20px) distinto
- Action bar contextual sticky bottom: count + selecionar todas + botões Concluir (verde) / Excluir (vermelho)
- Bulk operations rodam em paralelo (loop subscribe), feedback toast

**Filtros mobile:** painel agora é **bottom-sheet fullwidth** com backdrop (não mais popover estreito que virava coluna).

**Arquivos editados:**
- `front/src/app/features/tarefas/tarefas.component.ts`

---

### 13. Auto-scroll agenda home pra hora atual

**Pedido:** ao abrir tela inicial, agenda já mostrar horário atual no topo (não 0h).

**Solução:**
- `ngAfterViewInit` chama scroll **3x** (imediato + 250ms + 800ms) — garante pegar após tarefas async chegarem
- Linha "agora" posicionada ~80px do topo do scroll (antes era centro)

**Arquivo:** `front/src/app/features/visao-geral/visao-geral.component.ts`

---

### 14. Badge mobile bottom-nav refatorado

**Problema:** 2 badges sobrepostos (atrasadas vermelho + pendentes accent) ficavam ilegíveis no ícone.

**Solução:**
- 1 badge única à direita com **count total pendentes** em accent (sempre)
- Dot vermelho 10px com `animate-pulse` à esquerda **só quando há atrasadas** — alerta sutil sem dominar
- Border `bg-sidebar` pra destaque limpo (estilo iOS)
- Posicionado relativo ao ícone, não ao botão inteiro

**Arquivo:** `front/src/app/layout/shell.component.ts`

---

### 15. Reestruturação Finanças mobile + título destacado

**Pedido:** página Finanças mobile bagunçada, calendário pequeno demais.

**Soluções:**
- Hero: label "BALANÇO" pequeno + **H1 grande do período** (`Maio 2026` / `2026`) + botão "Novo lançamento" desktop alinhado direita
- Vista Calendário **mobile**: trocou grid 7 cols por **agenda vertical** (1 dia por linha com lançamentos legíveis, ícone, descrição, valor, status)
- Vista Calendário **desktop**: grid 7 cols mantido (`hidden md:block`)
- Mini-calendar lateral só `xl:flex` — esconde mobile/tablet
- Vista Lista item refatorado: 3 linhas internas verticais (descrição+ícones / categoria·data / valor+status+prazo) — sem mais sobreposição mobile

**Arquivos:** `front/src/app/features/financas/financas.component.ts`

---

### 16. Botão "Pagar" claro (sem confundir com status)

**Problema:** ícone check verde solto parecia status "pago" mesmo quando lançamento estava pendente.

**Solução:** botão virou **pill verde com border** + ícone `fa-check` + texto "Pagar" (`hidden sm:inline`). Clearly action, not state.

**Arquivos:** `front/src/app/features/financas/financas.component.ts`

---

### 17. Data de pagamento editável + desfazer

**Pedido:** ao marcar pago, sistema setava `pagoEm = hoje`. User pode ter pago em outro dia.

**Solução:**
- Form lança bloco "Data do pagamento" (bg verde sutil) quando editing && tipo=despesa && status=pago
- Date picker editável com tip
- Botão "↺ Voltar pra a pagar" (âmbar) chama API `desfazer-pagamento`
- Limpar data ao salvar → frontend chama `desfazerPagamento` + `atualizar` em chain (switchMap)
- Backend: `Lancamento.Atualizar` aceita `dataPagamento` opcional (atualiza `PagoEm` se status=Pago)
- Backend: novo `DesfazerPagamentoUseCase` chama `MarcarComoPendente()`
- Endpoint: `POST /financas/lancamentos/{id}/desfazer-pagamento`
- Data de pagamento exibida nas 3 vistas (Lista/Calendário mobile/Categoria) quando status=pago

**Arquivos novos:**
- `backend/src/Liriun.Application/UseCases/Lancamentos/DesfazerPagamentoUseCase.cs`

**Arquivos editados:**
- `backend/src/Liriun.Core/Entities/Lancamento.cs`
- `backend/src/Liriun.Application/InputModels/Lancamentos/AtualizarLancamentoInput.cs`
- `backend/src/Liriun.Application/UseCases/Lancamentos/AtualizarLancamentoUseCase.cs`
- `backend/src/Liriun.Application/IoC/ApplicationModule.cs`
- `backend/src/Liriun.Api/Controllers/FinancasController.cs`
- `front/src/app/core/api/financas.service.ts`
- `front/src/app/features/financas/lancamento-form.component.ts`
- `front/src/app/features/financas/financas.component.ts`

---

### 18. Form de tarefa estruturado em seções

**Pedido:** form bagunçado, agrupar visualmente.

**Solução:** template refatorado:
- Header com ícone (`fa-pen` edit / `fa-plus` novo) + título + subtítulo de contexto
- 4 seções com bg sutil + ícones uppercase:
  - **Sobre**: Prioridade + Categorias (pills mais arredondados)
  - **Quando**: Data + Hora (grid 2 cols)
  - **Recorrência**: chips + sub-bloco quantidade quando ativo
  - **Detalhes**: Observações com counter
- Nome input grande (16px, py-3)
- Footer sticky bottom com botão Cancelar + Salvar (com check icon)

**Arquivos:** `front/src/app/features/tarefas/tarefa-form.component.ts`

---

### 19. FAB mobile com pop-in + collapse suave

**Pedido:** efeito de POP no botão ao entrar, depois recolher virando bolinha.

**Solução:**
- Keyframe `fab-pop-in` (700ms cubic-bezier spring): scale 0.5 → 1.12 → 0.96 → 1
- Após 2.5s: collapse via transition `max-width: 160 → 0` + `opacity: 1 → 0` no texto (600ms ease-out)
- Padding/gap também transitam suave
- Aplicado em Tarefas + Finanças

**Arquivos:**
- `front/src/app/features/tarefas/tarefas.component.ts`
- `front/src/app/features/financas/financas.component.ts`

---
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
