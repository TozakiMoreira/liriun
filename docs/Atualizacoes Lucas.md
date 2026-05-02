# Atualizações — Lucas

> Registro do que foi feito na sessão e o que vem amanhã.

---

## 2026-04-30 — Sessão 1 (auth + senha)

- Fix de connection string com vírgula sobrando em `secrets.json`.
- Cadastro/login: tratamento de erro com `ProblemDetails` lido corretamente, validação inline por campo, botão sempre clicável.
- Senha: backend exige 8+ chars + maiúscula + especial. Frontend tem lista visual reativa de requisitos (verde quando atende).
- Landing page pública em `/`. Shell autenticado em `/app/*`.

## 2026-04-30 — Sessão 2 (refatoração mal interpretada de Prazo)

Implementei `Prazo` como entidade reusável com `Data + Hora?`. **Não era isso que era pedido.** Reverti na sessão 3.

## 2026-04-30 — Sessão 3 (simplificação radical)

### Decisão de produto
**Prazo deixou de existir como entidade.** Cada tarefa tem direto sua `dataPrazo: DateTime?` + `horarioFinal: TimeSpan?` (ambos nullable, opcionais). O usuário escolhe a data ao criar/editar a tarefa, com input de data nativo (date picker do browser). Hora é separada e opcional.

A apresentação relativa ("Hoje", "Amanhã", "Em 28 dias", "Em 3 meses", "Em 2 anos") é **só renderização** em "Minhas Tarefas" — calculada a partir de `dataPrazo` no momento do display.

### Backend — apagado

Files removidos completamente:
- `Jarvis.Core/Entities/Prazo.cs`
- `Jarvis.Core/Errors/PrazoErrors.cs`
- `Jarvis.Core/Interfaces/Repositories/IPrazoRepository.cs`
- `Jarvis.Application/UseCases/Prazos/` (4 use cases)
- `Jarvis.Application/Validators/Prazos/` (2 validators)
- `Jarvis.Application/InputModels/Prazos/` (2 inputs)
- `Jarvis.Application/ViewModels/Prazos/PrazoViewModel.cs`
- `Jarvis.Application/ReadModels/PrazoReadModel.cs`
- `Jarvis.Application/ReadRepositories/IPrazoReadRepository.cs`
- `Jarvis.Infrastructure/Persistence/Models/PrazoModel.cs`
- `Jarvis.Infrastructure/Persistence/Configurations/PrazoConfiguration.cs`
- `Jarvis.Infrastructure/Persistence/Mappers/PrazoMapper.cs`
- `Jarvis.Infrastructure/Repositories/PrazoRepository.cs`
- `Jarvis.Infrastructure/ReadRepositories/PrazoReadRepository.cs`
- `Jarvis.Api/Controllers/PrazosController.cs`
- Tests de Prazo (entity + 4 use cases)

### Backend — alterado

- **`Tarefa` entity**: removido `PrazoId`. `HorarioFinal` virou `TimeSpan?` (era `TimeSpan` com default 23:59). `Tarefa.StatusComputado(agora)` usa `HorarioFinal ?? 23:59:59` quando precisa de limite.
- **`TarefaErrors`**: removidos `PrazoNaoEncontrado` e `PrazoEDataCustomConflito`.
- **`TarefaModel` / `TarefaConfiguration` / `TarefaMapper`**: sem `PrazoId`. Coluna `horario_final` agora nullable. FK pra `prazos` removida.
- **`CriarTarefaInput` / `AtualizarTarefaInput`**: campo `PrazoId` removido. `DataPrazoCustom` renomeado pra `DataPrazo`.
- **`CriarTarefaValidator` / `AtualizarTarefaValidator`**: regra "use prazo cadastrado ou data custom, não os dois" foi descartada (não faz mais sentido).
- **`CriarTarefaUseCase` / `AtualizarTarefaUseCase`**: sem dependência de `IPrazoRepository`. Recebem `DataPrazo` direto do input.
- **`TarefaReadRepository` / `TarefaReadModel` / `TarefaViewModel`**: sem `PrazoId`. `HorarioFinal` nullable.
- **`JarvisDbContext`**: `DbSet<PrazoModel>` removido.
- **`InfrastructureModule`**: registros de `IPrazoRepository`, `IPrazoReadRepository` removidos.
- **`ApplicationModule`**: 4 use cases de Prazo removidos.
- **Tests de Tarefa** (entity + 2 use cases) atualizados.
- **`ARCHITECTURE.md`** atualizado pra remover referências a Prazo.

### Frontend — apagado

- `core/api/prazos.service.ts`

### Frontend — alterado

- **`core/api/tarefas.service.ts`**: `Tarefa.prazoId` removido. `Tarefa.horarioFinal: string | null`. Payload renomeado pra `TarefaPayload` com `dataPrazo` + `horarioFinal`.
- **`features/tarefas/tarefa-form.component.ts`**: removido o select de Prazo. Em seu lugar, dois inputs lado a lado:
  - **Data (opcional)** — input `type="date"`, browser nativo (com picker flutuante e suporte a digitação)
  - **Hora (opcional)** — input `type="time"`, desabilitado se não tiver data
  - Validação: se preencher hora sem data, dá erro inline.
- **`features/tarefas/tarefas.component.ts`** — `formatarPrazo` reescrito:
  - Sem data → `"sem prazo"`
  - Hoje → `Hoje[, HH:MM]`
  - Amanhã → `Amanhã[, HH:MM]`
  - Ontem → `Ontem[, HH:MM]`
  - Em até 30 dias futuro → `Em N dias`
  - Em até 12 meses futuro → `Em N meses` (usa diff de mês com ajuste por dia)
  - Acima → `Em N anos`
  - Passado mais distante → `N dias/meses/anos atrás`
- **`features/configuracoes/configuracoes.component.ts`**: seção de Prazos removida. Restou Conta + Categorias.
- **`features/onboarding/onboarding.component.ts`**: seção de Prazos removida. Onboarding agora só pergunta categorias.

### Migration EF Core gerada e aplicada ✅

Migration `20260430054400_RemoverPrazoEHorarioOpcional` criada com `dotnet ef migrations add` e aplicada com `dotnet ef database update` no Supabase.

SQL executado:
```sql
ALTER TABLE tarefas DROP CONSTRAINT "FK_tarefas_prazos_prazo_id";
DROP TABLE prazos;
DROP INDEX "IX_tarefas_prazo_id";
ALTER TABLE tarefas DROP COLUMN prazo_id;
ALTER TABLE tarefas ALTER COLUMN horario_final DROP NOT NULL;
```

Schema do banco agora bate com o código. Backend compila zero warning.

---

---

## 2026-05-02 — Sessão 11 (Modo Jarvis vira chat conversacional)

A versão one-shot da sessão 10 (mandar texto → IA preenche → abre form) era OK, mas faltava interação. Refeita pra **chat de verdade**: o Jarvis pergunta o que falta até a tarefa estar pronta.

### Backend — refatorado de `analisar` pra `conversar`

**Models** (`Application/Models/Ia/`):
- `MensagemConversa { Papel: Usuario|Jarvis, Texto: string }`
- `ContextoConversa { Mensagens[], NomeUsuario, HojeUtc, Categorias[] }`
- `RespostaConversa { Mensagem: string, Tarefa: AnaliseTarefa?, Completo: bool }`
- `AnaliseTarefa` ganhou `Observacoes`

**`IGeminiService.ConversarAsync`** (renomeado de `AnalisarTextoAsync`):
- Recebe histórico inteiro da conversa em cada turno (stateless — front guarda o estado)
- Manda pra Gemini com **systemInstruction** (regras de comportamento) + **contents** (histórico em formato `user`/`model`)
- Schema de resposta força:
  ```json
  { "completo": bool, "mensagem": "...", "tarefa": null | {...} }
  ```
- Parser tolerante de hora (aceita `"18h"`, `"18:00"`, `"18"`, `"18h30"`)

**Prompt** (em português, pseudo-resumido):
> Você é Jarvis. Por meio de conversa breve, ajude a registrar UMA tarefa.
>
> Regras:
> 1. Se faltar título OU data → `{completo: false, mensagem: "<pergunta>", tarefa: null}`
> 2. Se tem básico mas faltam opcionais → pode perguntar 1 coisa OU fechar com defaults
> 3. Quando o usuário disser "salva"/"ta bom"/"sim" → fecha imediatamente com `{completo: true, tarefa: {...}}`
> 4. Limite a 3-4 perguntas. Mensagens curtas (1-2 frases). Sem emoji.

**`ConversarCapturaUseCase`**:
- Recebe array de mensagens
- Filtros de defesa (mesmas garantias da v1: data passada → null, categoria que não pertence → removida, prioridade fora de 1-4 → null, observações > 4000 chars → truncadas)

**Endpoint**: `POST /captura/conversar` (substitui `/captura/analisar`).

**Tests**: `ConversarCapturaUseCaseTests` com 6 cenários — pergunta sem fechar, fechamento com tarefa, filtros de alucinação, falha do Gemini, validation. **63 tests passando** no total.

### Frontend — captura virou chat de verdade

**`IaService.conversar(mensagens)`** retorna `{ mensagem, tarefa, completo }`. Front mantém o histórico no signal `mensagens`.

**`captura.component`**:
- Card "Jarvis" agora abre **uma janela de chat** (bubbles estilo WhatsApp/Linear):
  - Avatar do Jarvis (J em gradiente) + bubble cinza pro bot
  - Bubble accent à direita pro usuário
  - Indicador "pensando..." com 3 bolinhas pulsando
- **Mensagem inicial automática**: "Boa tarde, Lucas. O que você precisa anotar?"
- Usuário digita → backend processa → resposta vira nova bubble
- **Quando o bot devolve `tarefa != null`** (geralmente quando `completo: true`):
  - Aparece **mini-card "Tarefa pronta"** com preview (título, data, hora, categorias, prioridade, observações)
  - Botões: **"Ajustar"** (abre o tarefa-form completo pra edição manual) ou **"Salvar tarefa"** (POST direto, sem abrir form)
- **Salvar**: cria via `POST /tarefas`, toast "Anotado, Lucas." e fecha o chat
- **Ajustar**: abre o `tarefa-form` pré-preenchido com a sugestão (reusa o componente que já existia)
- Fechar (×) ou Esc → cancela tudo
- Enter envia mensagem (Shift+Enter quebra linha)
- Auto-scroll pro fim da conversa

### Como vai ficar na prática

```
Você: preciso reunir com pedro
Jarvis: Pra que dia?
Você: amanhã às 18h
Jarvis: Vai em qual categoria?
Você: trabalho
Jarvis: Quer adicionar alguma observação?
Você: sala 3
Jarvis: Anotado: Reunir com Pedro pra amanhã 18:00. Posso salvar?
       [Tarefa pronta — preview + botões Ajustar / Salvar tarefa]
Você (clica Salvar) → toast "Anotado, Lucas."
```

Se você for direto:
```
Você: reunir com pedro amanhã 18h, trabalho
Jarvis: Anotado: Reunir com Pedro pra amanhã 18:00. Posso salvar?
       [preview + botões]
```

### Gotchas

- Se a Gemini falhar por quota/erro 4xx — toast vermelho dentro do chat com a mensagem do backend
- Se o usuário fechar no meio, o histórico é descartado (não persistimos conversas — V2 vai armazenar)
- Cada mensagem do usuário re-envia o histórico inteiro pro backend (stateless). Pra V1 com 3-4 turnos isso é OK; pra V2 com conversas mais longas, dá pra trocar pra sessão server-side ou usar a função `chat` nativa do Gemini SDK.

---

## 2026-05-02 — Sessão 10 (Modo Jarvis com Gemini — versão one-shot, substituída pela sessão 11)

Integração da IA do Google (Gemini 2.0 Flash) pra interpretar texto livre e devolver tarefa estruturada.

### Como rodar (passo crítico — precisa fazer)

A chave da API **NÃO** vai pro `appsettings.json` (que está no git). Vai no **user-secrets** do .NET, que fica numa pasta da sua máquina, fora do repo.

**Comando** (rodar uma vez no terminal, dentro de `c:/Workspace/Jarvis/Jarvis/backend`):

```bash
dotnet user-secrets set "Gemini:ApiKey" "<COLE_SUA_CHAVE_AQUI>" -p src/Jarvis.Api
```

Depois disso, **reinicia o backend**. Pra conferir que pegou:

```bash
dotnet user-secrets list -p src/Jarvis.Api
```

Se quiser mudar o modelo (default `gemini-2.0-flash`):
```bash
dotnet user-secrets set "Gemini:Model" "gemini-2.0-flash" -p src/Jarvis.Api
```

### Backend — como ficou (Clean Architecture)

A regra: **camada Application não conhece HTTP**. Quem fala com a API do Google é a Infrastructure. A Application só pede "analisa esse texto" via uma interface.

**1. Core** — `Jarvis.Core/Errors/IaErrors.cs`:
- `TextoObrigatorio`, `TextoMuitoLongo` (validação)
- `FalhaNaAnalise` (Gemini falhou — timeout, 5xx, etc.)
- `RespostaInvalida` (Gemini respondeu mas o JSON não bate com o schema)
- `NaoConfigurada` (chave não setada — vai dar isso até você rodar o comando acima)

**2. Application** — define o contrato:
- `Interfaces/Ia/IGeminiService.cs` — só uma interface: `Task<Result<AnaliseTarefa>> AnalisarTextoAsync(ContextoAnalise, ct)`
- `Models/Ia/AnaliseTarefa.cs` — record com o que a IA devolve: `Titulo, CategoriaIds[], DataPrazo?, HorarioFinal?, Prioridade?`
- `Models/Ia/ContextoAnalise.cs` — o que a Application envia pra IA: texto + nome do usuário + data de hoje + lista de categorias dele
- `InputModels/Ia/AnalisarCapturaInput.cs` — `{ Texto: string }` que vem do front
- `ViewModels/Ia/AnaliseCapturaViewModel.cs` — o que volta pro front
- `Validators/Ia/AnalisarCapturaValidator.cs` — texto não vazio, max 2000 chars
- `UseCases/Ia/AnalisarCapturaUseCase.cs` — orquestra:
  1. Valida o input
  2. Busca o usuário e as categorias dele no banco
  3. Monta o `ContextoAnalise`
  4. Chama `_gemini.AnalisarTextoAsync(...)` (não sabe que isso é HTTP!)
  5. **Filtra a resposta** (defesa contra IA inventando):
     - Se sugeriu data passada → zera
     - Se sugeriu categoria que não pertence ao usuário → remove
     - Se sugeriu prioridade fora de 1–4 → zera
  6. Devolve `AnaliseCapturaViewModel`

**3. Infrastructure** — implementa o contrato:
- `Ia/GeminiOptions.cs` — `{ ApiKey, Model, BaseUrl, TimeoutSeconds }` lido da configuração
- `Ia/GeminiService.cs` — implementa `IGeminiService`:
  - Recebe `HttpClient` injetado (padrão typed client do .NET — `services.AddHttpClient<IGeminiService, GeminiService>(...)`)
  - Monta um **prompt em texto** com o contexto + regras pra cada campo
  - Chama `POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={chave}`
  - Usa o **JSON mode** do Gemini: `responseMimeType: "application/json"` + `responseSchema` que descreve o formato esperado. Isso faz o Gemini **garantidamente** devolver JSON válido conforme o schema (não precisa parsear texto solto).
  - Parse robusto: cada campo é checado individualmente, qualquer formato errado vira null. Nunca lança exception por causa de payload inesperado.
  - Logging: erros são logados via `ILogger<GeminiService>` mas a mensagem que volta pro usuário é genérica (não vaza detalhes da IA).

**4. Api** — `Controllers/CapturaController.cs`:
- `POST /captura/analisar` (autenticado)
- Body: `{ texto: string }`
- Response: `AnaliseCapturaViewModel`

**5. DI**:
- `ApplicationModule`: registra `AnalisarCapturaUseCase` (Scoped)
- `InfrastructureModule`: lê `GeminiOptions` da configuração + `services.AddHttpClient<IGeminiService, GeminiService>` (typed client com timeout configurável)

**6. Tests** — `AnalisarCapturaUseCaseTests` com 6 cenários (mocka o `IGeminiService`):
- Sugestão completa volta intacta
- Categoria que não é do usuário é filtrada
- Data passada vira null
- Prioridade fora de 1–4 vira null
- Erro do Gemini propaga
- Validator falha sem chamar o Gemini

**63 tests passando** no total.

### Frontend

**1. `core/api/ia.service.ts`** — `IaService.analisarCaptura(texto)` faz `POST /captura/analisar`. Tipo `AnaliseCaptura` reflete o ViewModel do back.

**2. `tarefa-form.component.ts`** — novo `@Input() sugestao: SugestaoTarefa | null`. Quando vem preenchido (e a tarefa não é edição), pré-popula nome, categoriaIds, data, hora e prioridade no formulário. Usuário pode editar tudo antes de salvar.

**3. `captura.component.ts`** — fluxo refeito:

```
[Card Manual] [Card Jarvis]
       ↓ click no Jarvis
[textarea grande livre + botão "Analisar"]
       ↓ click Analisar (ou Ctrl+Enter)
chama backend → recebe sugestão
       ↓
[tarefa-form pré-preenchido com a sugestão] ← usuário revisa
       ↓ Salvar
volta pro home da captura
```

**Fallback quando Gemini falha** (timeout, sem internet, JSON inválido, chave errada):
- Toast no canto inferior direito: "Não consegui dessa vez. Preenche manual que eu salvo."
- Abre o tarefa-form pré-preenchido **com o texto bruto no campo nome** (até 200 chars). Usuário não perde o que escreveu.
- Sem categoria/data/hora/prioridade pré-selecionados — preenche manual.

**Atalhos:**
- `J` no home → abre Modo Jarvis
- `M` no home → abre Manual (já existia)
- `Ctrl+Enter` na textarea → analisar
- `Esc` na textarea → cancelar e voltar

### Como funciona o Modo Jarvis na prática

Texto do usuário: *"comprar fita métrica até sexta de manhã, urgente"*

Backend monta este prompt e manda pro Gemini:
```
Voce e Jarvis, um assistente pessoal de tarefas. Analise o texto livre do usuario e estruture em JSON.

Hoje (UTC): 2026-05-02
Nome do usuario: Lucas

Categorias cadastradas pelo usuario (use APENAS essas, copie o id exatamente):
- id=<uuid>: Trabalho
- id=<uuid>: Compras
- id=<uuid>: Casa

Texto do usuario:
"comprar fita metrica ate sexta de manha, urgente"

Regras pra cada campo:
- titulo: ...
- categoriaIds: ...
- data: YYYY-MM-DD ...
- hora: HH:MM ...
- prioridade: 1=Urgente, 2=Importante, 3=Normal, 4=Baixa
```

Gemini retorna (graças ao `responseSchema`, **garantidamente** este shape):
```json
{
  "titulo": "Comprar fita métrica",
  "categoriaIds": ["<uuid de Compras>"],
  "data": "2026-05-08",
  "hora": "10:00",
  "prioridade": 1
}
```

Backend filtra (data >= hoje? sim; categoria existe? sim; prioridade entre 1–4? sim) e devolve pro front. Front pré-preenche o `tarefa-form` e o usuário só revisa e clica em Criar.

### Custo / limite (Gemini free tier)

- `gemini-2.0-flash` tem **15 RPM** (requests por minuto) e **1500 RPD** (por dia) no free tier.
- Cada análise = 1 request com ~500 tokens input + ~50 tokens output.
- Pra o uso esperado (5 tarefas/dia × 3 usuários = 15 requests/dia), está MUITO dentro da margem.

---

## 2026-05-02 — Sessão 9 (reworking da UX de reabrir)

A UX do "fa-rotate-left no fim da linha" não estava clara — parecia ícone de replicar, e ficava longe do contexto. Refeita pra ser intuitiva:

### Mudanças

**Modal de detalhes da tarefa** (`tarefa-detalhe-modal`):
- Footer agora **adapta ao status**:
  - Pendente / Atrasada → [Excluir] [Editar tarefa] [Concluir] (como antes)
  - **Concluída** → [Excluir] [**Reabrir como pendente**] (com ícone `fa-rotate-left` + texto explícito)
- "Editar tarefa" some em concluídas (backend bloqueia a edição mesmo).
- Novo `@Output() reabrir` no modal.

**Tela Concluídas** (`concluidas.component`):
- **Click no check verde** = reabrir. O botão era estático antes, agora é clicável: estado normal mostra `fa-check`; no hover do row, troca pro `fa-rotate-left` (sinaliza visualmente "desmarcar"). `aria-label="Desmarcar e reabrir como pendente"`. Ação direta sem confirm.
- **Click na linha (fora do check)** abre o modal de detalhes — mesma UX da tela Pendentes. Permite ver categorias, observações com auto-link, prazo formatado.
- **Botão `fa-rotate-left` lateral REMOVIDO** — era confuso, parecia replicar. A função foi distribuída entre o check (atalho) e o modal (com texto explícito).
- Confirm modal pra exclusão a partir do detalhe.

### Como testar
1. Conclua tarefa em Minhas Tarefas
2. Vá em Concluídas: hover no card → check verde vira ícone de undo
3. Clique no check → reabre direto, tarefa some da lista
4. Concluir outra, abrir Concluídas, **clicar na linha (fora do check)** → modal abre com observações
5. No modal de uma concluída, ver botão "Reabrir como pendente" no lugar de "Concluir"

---

## 2026-05-02 — Sessão 8 (reabrir tarefa concluída — v1)

Defesa contra click acidental em "concluir" — usuário pode resgatar a tarefa.

### Backend
- **`Tarefa.Reabrir()`**: nova operação na entidade. Reseta `Status` pra Pendente e `ConcluidaEm` pra null. Falha com `Conflict` se a tarefa não estiver concluída.
- **`TarefaErrors.NaoConcluidaParaReabrir()`**: novo erro (`tarefa.nao-concluida-para-reabrir`).
- **`ReabrirTarefaUseCase`**: paralelo ao `ConcluirTarefaUseCase`. Busca tarefa, chama `Reabrir()`, persiste.
- **Endpoint `POST /tarefas/{id}/reabrir`** no `TarefasController` (autenticado).
- Registro em `ApplicationModule`.
- **5 tests novos** (2 na entidade + 3 no use case). **57 Application + 79 Core tests passando.**
- **`TarefasService.reabrir(id)`** no front consome o endpoint.

---

## 2026-05-02 — Sessão 7 (data obrigatória + observações + filtros + kanban)

5 melhorias grandes em "Minhas Tarefas".

### 1. Data obrigatória, hora opcional

- **Backend**: `Tarefa.DataPrazo` virou `DateTime` (não-nullable). `Tarefa.Criar(...)` agora exige data. `StatusComputado` simplificado (não tem mais branch de "sem data").
- **`TarefaErrors`**: novos `DataPrazoObrigatoria()` e `DataPrazoNoPassado()`.
- **Validators de Tarefa**: exigem `DataPrazo != default` e `>= UtcNow.Date.AddDays(-1)` (margem de 1 dia pra fuso horário do cliente).
- **Migration `TarefaDataPrazoObrigatoriaEObservacoes`** (timestamp `20260502033421`):
  - `UPDATE tarefas SET data_prazo = CURRENT_DATE WHERE data_prazo IS NULL` (preserva tarefas órfãs antes de NOT NULL).
  - `ALTER TABLE tarefas ALTER COLUMN data_prazo SET NOT NULL`.
  - `ALTER TABLE tarefas ADD observacoes text` (item 3).
  - **Aplicada no Supabase**.
- **Frontend `tarefa-form`**: label "Data" sem "(opcional)", `min={hoje-iso}` no input HTML (browser bloqueia escolha visual de datas passadas), validação client-side `data >= dataMinima` com mensagem inline. `Tarefa.dataPrazo` virou `string` não-nullable no service.

### 2. Enfeite na linha da tarefa

- Barra colorida vertical no canto esquerdo (3px) com cor da prioridade (`absolute left-0 top-1.5 bottom-1.5`). Urgente tem `box-shadow` accent vermelho sutil.
- Hover: `-translate-y-px` + `shadow-md` (sensação de card flutuando).
- Linha agora é `cursor-pointer` (preparando pro item 3).

### 3. Card de detalhes da tarefa com Observações

- **Backend**: `Tarefa.Observacoes: string?` na entidade (max 4000 chars), normalização (string vazia/whitespace vira null), validação na entidade + validator. `CriarTarefaInput` e `AtualizarTarefaInput` ganharam `Observacoes`. `TarefaViewModel` e `TarefaReadModel` também.
- **Frontend `auto-link.ts`**: helper `quebrarTextoEmSegmentos` que detecta URLs em texto plano via regex `/(https?:\/\/[^\s<>"']+)/g` e devolve segmentos seguros pra renderizar (sem `innerHTML`, sem XSS).
- **Frontend `tarefa-detalhe-modal.component.ts`**: novo modal com:
  - Cabeçalho: nome + barra lateral colorida da prioridade
  - Grid: prioridade, prazo (formatado relativo "Hoje/Amanhã/etc"), status
  - Categorias como chips
  - Seção **Observações** com modo leitura (auto-link) e modo edição (textarea + Salvar/Cancelar)
  - Footer: Excluir, Editar tarefa (abre o tarefa-form completo), Concluir
- **Click no row da lista** abre o modal. Botões internos têm `$event.stopPropagation()` pra não disparar o click do row.
- **`tarefa-form`** ganhou textarea de Observações (3 linhas, maxlength 4000).

### 4. Filtros em "Minhas Tarefas"

- Botão "Filtros" no header com badge contando filtros ativos. Painel expansível abaixo com:
  - **Status**: Todas / No prazo / Atrasadas (radio)
  - **Prioridade**: chips Urgente / Importante / Normal / Baixa (multi)
  - **Categorias**: chips das categorias presentes nas tarefas pendentes (multi)
- Persistência em `localStorage` chave `jarvis.tarefas.filtros`. Recarrega na próxima visita.
- Computed `tarefasFiltradas` aplica os filtros. `grupos` (lista) e `colunasKanban` consomem dele.
- Botão "Limpar filtros" quando há filtros ativos.
- Estado vazio dedicado quando filtros não casam com nenhuma tarefa.

### 5. Toggle Lista / Quadro (Kanban)

- Toggle de view no header: **Lista** | **Quadro** (ícones FA), persistido em `localStorage` chave `jarvis.tarefas.view`.
- **View Kanban**: 4 colunas por prioridade (Urgente, Importante, Normal, Baixa) com cores e header de coluna mostrando contagem.
- Cards compactos com nome + categorias + prazo. Atrasadas ganham borda danger.
- Click no card abre o mesmo modal de detalhes do item 3.
- Sem drag-and-drop na V1 (planejado pra V2).
- Layout responsivo: 1 col mobile, 2 cols tablet, 4 cols desktop xl.

### Tests
- `TarefaTests` atualizado: novos casos pra observações + data obrigatória + observações > 4000 chars.
- `CriarTarefaUseCaseTests` e `AtualizarTarefaUseCaseTests` ajustados pra nova assinatura.
- `RemoverTarefaUseCaseTests` e `ConcluirTarefaUseCaseTests` ajustados.
- **54 tests passando** no Application.Tests.

---

## 2026-05-01 — Sessão 6 (foto de perfil)

### Backend

- **`Usuario` entity**: novo campo `FotoUrl: string?` + método `AtualizarFotoPerfil(string?)` que valida prefixo `data:image/...` e tamanho máx 700K chars (~500KB de imagem). Aceita `null` pra remover.
- **`UsuarioErrors`**: `FotoFormatoInvalido()`, `FotoMuitoGrande()`.
- **Persistence**: `UsuarioModel` ganhou `FotoUrl?`, `UsuarioConfiguration` mapeou pra coluna `foto_url text NULL`, `UsuarioMapper` ajustado, `Usuario.Reconstituir(...)` recebe novo parâmetro.
- **`AtualizarFotoPerfilInput { FotoUrl: string? }`** + `AtualizarFotoPerfilValidator` (defesa em profundidade — valida prefixo e tamanho antes da entidade).
- **`AtualizarFotoPerfilUseCase`**: valida input → busca usuário → chama `AtualizarFotoPerfil` → persiste → retorna `PerfilViewModel`.
- **`PerfilViewModel`** e **`AutenticacaoViewModel`** ganharam `FotoUrl: string?`. Login, cadastro e atualizar perfil retornam a foto junto.
- **Endpoint `PUT /auth/perfil/foto`** (autenticado) recebe `{ fotoUrl }`. `null` remove a foto.
- **5 tests novos** do `AtualizarFotoPerfilUseCase` (sucesso, remover, validator falha, entidade rejeita, usuário não existe). **Total: 54 tests passando.**
- **Migration `AdicionarFotoPerfilUsuario`** (timestamp `20260501235308`) gerada e aplicada no Supabase: `ALTER TABLE usuarios ADD foto_url text;`.

### Frontend

**Peças novas em `shared/`:**
- **`avatar.component.ts`** — componente reusável que mostra `<img>` se tem `fotoUrl`, senão fallback pra inicial gradiente. Aceita `[nome]`, `[fotoUrl]`, `[size]`, `[alt]`. Tem `(error)` no `<img>` que cai pro fallback se a URL quebrar.
- **`image-resize.ts`** — helper async `resizeImageToDataUrl(file, size, quality)`. Lê o `File` com `FileReader` → carrega num `<img>` em memória → `<canvas>` com crop quadrado central → exporta JPEG quality 85 → data URL. Rejeita SVG (XSS), e arquivos não-imagem.
- **`foto-perfil-modal.component.ts`** — modal com preview (usa `<app-avatar>`), botões `[Escolher arquivo]` (abre `<input type="file" accept="image/png,image/jpeg,image/webp">` escondido), `[Remover foto]` (se já tem foto), `[Cancelar]`, `[Salvar]`. Texto explicativo "PNG, JPG ou WebP. Vou recortar quadrado e redimensionar pra 256×256."

**Storage + service:**
- `TokenStorage.UsuarioLocal` ganhou `fotoUrl: string | null`.
- `AuthService.AutenticacaoResposta` e `PerfilResposta` também.
- Novo método `AuthService.atualizarFotoPerfil(fotoUrl: string | null)` chamando `PUT /auth/perfil/foto`, persiste retorno no storage.

**Integração nos 3 lugares:**
- **`configuracoes.component.ts`**: na seção Perfil, o avatar virou um botão (96px) com **overlay-hover** mostrando ícone de câmera + texto "Trocar". Click abre o modal. Salva via `salvarFoto` ou remove via `removerFoto`. Modal renderizado condicional no fim do template.
- **`shell.component.ts`** (sidebar desktop e topbar mobile): trocada a inicial gradiente pelo `<app-avatar>` reusável. Quando o usuário tem foto, aparece nos 2 lugares automaticamente (signal reativo). Método `inicial()` órfão removido.

### Como testar (subindo back+front)

1. **Backend já está com a migration aplicada** — só subir.
2. **Logar com usuário existente** → o JWT atual continua válido. Mas o localStorage pode estar com `usuario` sem `fotoUrl: null`. Workaround: deslogar e logar de novo (a resposta agora inclui `fotoUrl: null`), OU limpar localStorage no DevTools.
3. **Configurações > Perfil**: passar mouse sobre o avatar → ver overlay "Trocar". Click → modal.
4. **Escolher arquivo**: PNG/JPG/WebP. Modal mostra preview já cropado quadrado em 256×256.
5. **Salvar**: backend valida, salva, retorna. Avatar atualiza nos 3 lugares (sidebar, topbar mobile, configurações) instantaneamente via signal.
6. **Remover foto**: botão no modal quando já tem foto. Backend recebe `{ fotoUrl: null }`, zera coluna, retorna. Volta pra inicial.

### Limites/decisões V1 (a documentar pra V2)

- Foto vai como base64 na coluna `foto_url` (Opção A da auditoria) — simples, 1 migration, backup junto. Quando virar gargalo: migrar pra Supabase Storage sem mudar a interface da API (continua mandando string).
- Sem crop UI manual — só crop quadrado central automático. V2 pode plugar cropper.js.
- GIF animado vira JPEG estático. Aceito.
- Limite backend: 700K chars (~500KB). Front comprime pra ~30–60KB, então essa margem é defesa contra burlar.

---

## 2026-05-01 — Sessão 5 (auditoria + Perfil + reorg da troca de senha)

### Backend — atualizar perfil
- `Usuario.AtualizarPerfil(nome, email)` na entidade.
- `AtualizarPerfilInput` + `AtualizarPerfilValidator` (regras de nome e email reusáveis).
- `AtualizarPerfilUseCase`: valida input, busca usuário, **só checa unicidade do email se ele mudou**, atualiza, retorna `PerfilViewModel { Id, Nome, Email }`.
- Endpoint `PUT /auth/perfil` (autenticado).
- Registro em `ApplicationModule`.
- 5 testes do use case (sucesso sem email change, com email change, conflict de email já em uso, not found, validation).
- **Total: 49 tests passando.**

### Frontend — reorganização das Configurações
A UX da troca de senha que tinha sido inserida na sessão 4 não estava boa. Refatorada:

- `TokenStorage.atualizarUsuario(parcial)` — atualiza nome/email no localStorage e no signal sem mexer no token.
- `AuthService.atualizarPerfil(nome, email)` — chama `PUT /auth/perfil`, persiste retorno no storage.
- **`AlterarSenhaComponent` extraído** pra `features/configuracoes/alterar-senha.component.ts` como página dedicada na rota `/app/configuracoes/alterar-senha`. Header com breadcrumb "Configurações / Trocar senha" + card centralizado com o formulário (mesmo do design anterior). Botões Cancelar/Trocar senha. Ao salvar, redireciona pra `/app/configuracoes` após 1.2s.
- **`ConfiguracoesComponent` reorganizada:**
  - Seção **"Perfil"** (era "Sua conta"): mostra nome + email read-only, botão **"Editar perfil"** no canto superior direito.
  - Modo edição inline: campos viram inputs com validação de email + erros inline (lê `ProblemDetails.errors`). Botões Cancelar/Salvar.
  - Quando não está editando, mostra um separator embaixo com botão **"Alterar senha"** (ícone de chave) que linka pra `/app/configuracoes/alterar-senha`.
  - Seção **"Categorias"** abaixo (sem mudança).
  - Removida a seção "Segurança" inline da sessão 4.

### Polimentos de UX

1. **Toggle mostrar/ocultar senha** — novo `shared/password-input.component.ts` reusável, com botão olho à direita do input (`fa-eye` / `fa-eye-slash`), aria-label dinâmico, `aria-pressed`. Aplicado em 5 lugares:
   - Login (1 campo)
   - Cadastro (1 campo)
   - Alterar senha (3 campos: atual, nova, confirmar)
2. **Botão "Início" no login + cadastro** — link discreto no canto superior esquerdo (`fa-arrow-left` + texto "Início") que volta pra `/`. data-testid: `login-home-link` / `signup-home-link`.
3. **Landing — respiração entre seções + fade-in independente por seção**:
   - "Role pra conhecer" tirado do bloco animado do hero e ancorado em `absolute bottom-10` (some progressivamente via computed `rolarIndicadorOpacity`).
   - **Refatoração estrutural:** a seção monolítica "Sobre" virou **3 seções independentes**, cada uma `min-h-screen` com seu próprio fade-in:
     - **Sobre** (título + descrição + 4 cards de feature)
     - **Preview** (mockup CSS-art / imagem real + quote do Jarvis)
     - **CTA Final** (`min-h-[60vh]`, "Pronto pra organizar suas ideias?" + botão)
   - **Diretiva `fadeInOnView`** nova em `shared/fade-in-on-view.directive.ts`: usa `IntersectionObserver` (threshold 0.2) pra adicionar a classe `fade-in-visible` quando a seção entra na viewport. Suporte a `prefers-reduced-motion` (sem transição se o usuário pediu).
   - **CSS** em `styles.css` (utilities layer): `.fade-in-init` (opacity 0, translateY 40px) → `.fade-in-visible` (opacity 1, translateY 0) com `cubic-bezier(0.16, 1, 0.3, 1)` em 0.9s.
   - **Divisores visuais** entre cada seção: linha gradient `accent → transparent` + pontinho central com ring contra o fundo. Total: 3 divisores (Hero→Sobre, Sobre→Preview, Preview→CTA).
   - Computed `sobreOpacity` e `sobreTransform` removidos da landing (não eram mais necessários — a diretiva cuida).

4. **Seção Preview na landing** — entre o grid de features e o CTA final:
   - Headline "Seu próximo dia, organizado em segundos."
   - Subheadline "Escreve a ideia. Eu cuido do resto..."
   - Frame `<img src="/jarvis-preview.png">` que cai num **mockup CSS-art** (sidebar mock + 3 tarefas com prazos relativos "Ontem", "Hoje, 18:00", "Em 3 dias") quando a imagem não está. Robusto via `(error)` handler que seta `previewQuebrou` signal.
   - Quote estilo Jarvis: "Anotado. Categoria Faculdade, prazo até sexta. Te aviso se atrasar."
   - Quando o Lucas/Pedro tiver a imagem real, basta dropar em `front/public/jarvis-preview.png` que o `<img>` assume sozinho.

### Pequenos fixes pós-auditoria

- **Verificada a alegação A da auditoria** ("CadastrarUsuarioUseCase não checa email único"): **falsa**. [CadastrarUsuarioUseCase.cs:50-51](backend/src/Jarvis.Application/UseCases/Auth/CadastrarUsuarioUseCase.cs#L50-L51) já chama `_usuarioRead.ExisteEmailAsync` e retorna `EmailJaCadastrado` (Conflict 409). O teste `Retorna_conflict_quando_email_ja_existe` já cobre. Issue inexistente.
- **Fix B aplicado** — [tarefa-form.component.ts](front/src/app/features/tarefas/tarefa-form.component.ts): subscribe de `categoriasApi.listar()` agora tem error handler. Estado de loading e erro adicionados ao template. Botão "Tentar de novo" disponível em caso de falha.
- **Fix bônus** — [configuracoes.component.ts:313](front/src/app/features/configuracoes/configuracoes.component.ts#L313): mesmo padrão. `aplicarErroCat` é reusado no error handler.
- Grep confirmado: **zero subscribes sem error handler** no front.

### Documentação alinhada com o código

A auditoria pegou que `ARCHITECTURE.md` e `CLAUDE.md` ainda mencionavam `Prazo` como entidade, endpoints `/prazos`, e fluxos antigos. Atualizado:
- `ARCHITECTURE.md`: lista de entidades, tabelas, índices, lista de use cases (era 16, agora **14** com os novos de auth), tabela de endpoints (sem `/prazos`, com `/auth/alterar-senha` e `/auth/perfil`).
- `CLAUDE.md`: domínio (Prazo não é mais entidade), fluxo de criação (input de data direto, hora opcional), onboarding (sem prazos), telas (com Landing, Alterar senha, shell em `/app/*`).

### Backend

- **`SenhaRules.cs`** novo em `Validators/Auth/`: extension method `RuleBuilder.SenhaForte()` que aplica as 5 regras (NotEmpty, Min 8, Max 100, maiúscula, especial). `CadastrarUsuarioValidator` foi atualizado pra usar.
- **`UsuarioErrors`**: novos `NaoEncontrado()` e `SenhaAtualIncorreta()`.
- **`Usuario.cs`**: novo método `AlterarSenha(novoHash)` que valida o hash e atualiza.
- **`AlterarSenhaInput.cs`** (record com `SenhaAtual`, `NovaSenha`).
- **`AlterarSenhaValidator.cs`**: SenhaAtual NotEmpty, NovaSenha usa `SenhaForte()`, regra extra "nova senha precisa ser diferente da atual".
- **`AlterarSenhaUseCase`**: valida input, busca usuário pelo `_usuarioLogado.Id`, verifica senha atual com `IPasswordHasher.Verificar`, hasheia nova, salva.
- Endpoint `POST /auth/alterar-senha` (com `[Authorize]`) em `AuthController`.
- Registro em `ApplicationModule`.

### Tests
- `AlterarSenhaUseCaseTests`: 4 testes (sucesso, senha atual incorreta, usuário não existe, validator falha).
- `CadastrarUsuarioValidatorTests`: 8 testes cobrindo todas as regras (era pendência da sessão 1).
- `AlterarSenhaValidatorTests`: 4 testes.
- **44 tests passando** no total no `Jarvis.Application.Tests`.

### Frontend

- **`shared/password-requirements.component.ts`** novo: componente reusável com `[senha]` input + `testid` configurável. Exporta também as funções `avaliarSenha(senha)` e `senhaAtendeRequisitos(senha)` pra reuso em validações.
- **`cadastro.component.ts`**: refatorado pra usar o componente. Removeu o computed `requisitos` e os 60 linhas de markup duplicado.
- **`auth.service.ts`**: novo método `alterarSenha(senhaAtual, novaSenha)` chamando `POST /auth/alterar-senha`.
- **`configuracoes.component.ts`**: nova seção "Segurança" com:
  - Input "Senha atual"
  - Input "Nova senha" + lista visual de requisitos reativa (`<app-password-requirements>`)
  - Input "Confirmar nova senha" + indicador em tempo real (✓ verde quando bate / ✗ vermelho quando não)
  - Validações client-side: senha atual obrigatória, nova atende requisitos, nova ≠ atual, confirmação bate
  - Botão "Trocar senha" só habilita quando `podeTrocarSenha` (computed): senha atual preenchida + 3 requisitos verdes + confirmação bate
  - Mensagem de sucesso com tom Jarvis ("Senha trocada, Lucas.")
  - Tratamento de erro via `extrairProblemDetails` (mensagem "A senha atual não confere" do backend cai inline no campo)

---

## Próximos passos

### Imediato (próxima sessão)

1. **Limpar tarefa "Detran" stale** (foi criada com modelo intermediário, está com `data_prazo=NULL` mas `horario_final='09:15:00'` — estado inválido no modelo atual):
   ```sql
   DELETE FROM tarefas_categorias WHERE tarefa_id = 'ba9017fc-1648-4119-b3b7-2cf1e6bcff19';
   DELETE FROM tarefas WHERE id = 'ba9017fc-1648-4119-b3b7-2cf1e6bcff19';
   ```
2. **Subir back + front** e testar end-to-end:
   - Cadastro → onboarding (só categorias) → captura
   - Criar tarefa sem data → ver `"sem prazo"` em "Minhas Tarefas"
   - Criar tarefa pra hoje → ver `"Hoje"` ou `"Hoje, HH:MM"`
   - Criar tarefa pra amanhã → ver `"Amanhã"`
   - Criar tarefa daqui a 5 dias → ver `"Em 5 dias"`
   - Criar tarefa daqui a 60 dias → ver `"Em 2 meses"`
   - Criar tarefa daqui a 2 anos → ver `"Em 2 anos"`
   - Editar tarefa, mudar data → display atualiza
   - Tentar pôr hora sem data → erro inline
   - Tarefa atrasada (data no passado) → grupo "Atrasadas" com `"N dias atrás"` ou `"Ontem"`
3. **Apagar `landing-hero.jpg` do TODO** se ainda quiser landing com imagem (drop manual em `front/public/`).

### Curto prazo

4. **Foto de perfil** (sessão 4 vai abrir agora ou na próxima — usuário pediu junto com alterar senha):
   - Backend: coluna `foto_url text NULL` em `usuarios`, endpoint `PUT /auth/perfil` com `{ fotoUrl }` (data URL base64), validação de tamanho (~500KB).
   - Frontend: nova seção "Perfil" em Configurações com upload + canvas resize 256x256 + preview. Avatar do shell troca pra `<img>` quando tem foto, fallback pra inicial.
5. **Testes do `CriarTarefaValidator`** — agora simplificado, vale cobrir nome obrigatório/200 chars + horário inválido.
6. **Filtros + ordenação configurável em "Minhas Tarefas"** (CLAUDE.md prometia).
7. **Categoria inline no `tarefa-form`** (CLAUDE.md prometia).
8. **Tarefa multi-categoria — agrupamento melhor:** hoje só usa `categorias[0]`. Considerar agrupar por prioridade ou por janela de prazo (Hoje / Esta semana / Este mês / Mais distante / Sem prazo).

### Decisões pendentes (precisam de input)

- **Gemini na V1?** Botão "Modo Jarvis" existe no `captura.component`, mas backend não tem endpoint `/tarefas/analisar`.
- **i18n agora ou V1 pt-BR fixo?**

### Médio prazo

- Logging estruturado (Serilog).
- Health check (`/health`).
- Pipeline behavior pra deduplicar boilerplate de validação nos use cases.
- IClock injection (atual: `DateTime.UtcNow` direto na entidade — sem testabilidade temporal).
- Setup E2E (Playwright + TS).
- Paginação em `/tarefas/pendentes`, `/concluidas`, `/categorias`.
- Deploy: Railway (back) + Vercel (front) + CI/CD.
- Pré-prod: rotacionar `Jwt:Secret`, resetar senha Supabase, rate limiting em `/auth`.

---

## Para Claude lembrar (na próxima sessão)

- **Prazo NÃO é mais entidade.** Tarefa tem `dataPrazo` + `horarioFinal` direto. Sem `Prazo.cs`, sem `prazos.service.ts`, sem `PrazosController`. Qualquer código que mencione `PrazoId`, `IPrazoRepository`, `PrazoModel` etc é stale e foi removido.
- `HorarioFinal` na entidade Tarefa é **nullable agora** (`TimeSpan?`). Quando null, status atrasado considera fim do dia (23:59:59).
- O input do tarefa-form não tem mais select de Prazo — só `type="date"` + `type="time"` lado a lado.
- A apresentação "Hoje/Amanhã/Em N dias/meses/anos" é **só client-side**, computada em `tarefas.component.formatarPrazo()` baseada em `dataPrazo`.
- Migration `RemoverPrazoEHorarioOpcional` (timestamp `20260430054400`) **já foi aplicada no Supabase**. Schema do banco bate com o código.
- Confirm modal e helper de ProblemDetails continuam em `front/src/app/shared/`. Adicionou-se `password-requirements.component.ts` no mesmo lugar — reusado em cadastro e configurações.
- Endpoints autenticados de auth: `POST /auth/alterar-senha`, `PUT /auth/perfil`.
- Regras de senha forte ficam em `Validators/Auth/SenhaRules.cs` como extension method `SenhaForte()`. Reusar em qualquer novo validator que precise.
- AlterarSenha vive em página própria: `/app/configuracoes/alterar-senha`.
- Configurações tem 2 seções: Perfil (com edit inline + botão alterar senha) e Categorias.
- Shell autenticado vive em `/app/*`. Landing pública é `/`.
