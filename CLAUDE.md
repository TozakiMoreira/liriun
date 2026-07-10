# Contexto do Projeto Liriun

> Índice + regras + essenciais de domínio que o Claude carrega toda sessão.
> Detalhe completo (arquitetura, estado, roadmap): `docs/CONTEXTO_APP.md` — **fonte autoritativa; em conflito, ela vence.**
> Regra de manutenção: **um fato mora em um arquivo só**; os outros linkam. Ao mudar algo, atualize o dono — não espalhe cópias.

## Mapa de documentação

| Assunto | Dono |
|---|---|
| Arquitetura, produto, estado atual, roadmap | `docs/CONTEXTO_APP.md` |
| Regras do backend .NET | `backend/CLAUDE.md` |
| Regras do site Next.js | `site/CLAUDE.md` |
| Regras do app Flutter | `app/CLAUDE.md` |
| Setup / como rodar / migrations | `README.md` |
| Identidade visual (provisória) | `docs/Identidade Visual/Rebranding/brand-kit/` + `docs/design-ref/` |
| Legal | `docs/termos-de-uso/` |

## Preferências de trabalho (Pedro)

- **Nunca** commitar com Claude como co-autor (sem `Co-Authored-By: Claude`).
- **Nunca** usar múltipla escolha no terminal (AskUserQuestion) — perguntar em texto corrido.
- **Nunca** dar commit sem o Pedro pedir explicitamente.
- Quando o Pedro falar **"subir"**, significa **commit + push** (na `main`).

## O que é o Liriun

Organizador pessoal de tarefas com **agente de voz**. **Projeto pessoal e solo do Pedro Tozaki** — sem sócio ativo,
sem empresa (ToMore descontinuada), sem CNPJ, sem relação com faculdade. Objetivo: tirar o protótipo do papel e
virar um **produto real, escalável e usável, capaz de gerar receita** — e servir de portfólio.

**Método de trabalho — vibecoding:** o **Claude Code escreve o código**; o Pedro planeja, valida e refina depois de
funcional. Primeiro deixar funcional, depois melhorar o que fizer sentido.

**Foco atual, em ordem:** (1) **site** funcional, sem erros, com as funcionalidades iniciais bem definidas — é o mais
adiantado; (2) depois **refazer o app do zero** (descartar o app atual). Meta: usabilidade de site e app parecida
(referência Duolingo); se não der, o app tem prioridade de excelência. Sem prazo duro.

```
Site (Next.js)   ─┐
App Flutter      ─┼─→ Backend .NET ─→ Supabase Postgres (1 banco único, dev=prod)
Plataformas fut  ─┘   (REST + JWT + Gemini)
```

> Backend .NET central = fonte única de verdade. Detalhes em `docs/CONTEXTO_APP.md`.

## Essenciais de domínio (aplicam a toda tarefa de código/UX)

### Modelo (verificado no código)
- Entidades: **Usuario, Tarefa, Categoria, TarefaCategoria** (N:N, PK composta), **CodigoBeta**.
- **Tarefa:** `Nome`, **`DataPrazo` obrigatória**, `HorarioFinal?`, `Observacoes?`, `Prioridade`, `Status`,
  `Recorrencia`+`RecorrenciaQuantidade`, `TempoGastoSegundos`, `CriadaEm`, `ConcluidaEm`, `Categorias`.
- **Usuario:** `Nome`, `Email`, `SenhaHash` (BCrypt), `FotoUrl?`, `TimeZoneId` (IANA, default BRT), `EhAdmin`,
  `TermosAceitosEm`. **Não existe "nome do agente"** (ideia aspiracional, nunca construída).
- Prioridades: **urgente(1) · importante(2) · normal(3) · baixa(4)**.
- Status: **pendente · concluida · atrasada** — atrasada é **calculada** no fuso do usuário, nunca persistida.
- Recorrência (Nenhuma/Semanal/Mensal, qtd até 4): existe no domínio mas **não priorizada** — validar antes de usar.
- Excluir categoria **bloqueado** se tiver tarefa pendente vinculada. Concluir tarefa: usuário **permanece na tela**.
- IA só escolhe entre categorias do usuário (null se não infere); **não re-categoriza** ao editar.

### Terminologia oficial
"Tarefa" (não "anotação"/"nota") · "Categoria" (não "tag") · "Minhas tarefas"/"Tarefas" (não "Dashboard") ·
"Visão geral" pro dashboard home.

### Agente de voz (estado real)
Entrada por **voz (áudio multimodal pro Gemini) e texto**; conversacional multi-turno (histórico no cliente,
servidor stateless); **cria/edita/conclui/exclui** tarefas + responde sobre as existentes; card de revisão +
auto-save na confirmação; **sem TTS** (resposta em texto). Modelo Gemini: **`gemini-2.5-flash`**.

### Identidade visual & tom de voz
- Dark default · gradiente roxo→azul · sem emojis · ícones lineares · tipografia **Geist**. Brand kit **provisório**
  (rebranding não finalizado, vai mudar).
- **Tom do Liriun** (estável): mordomo digital seco e competente, 1ª pessoa, sem emoji, sem exclamação dupla, nome
  do usuário com parcimônia. Ex.: "Anotado, Pedro. Prazo até sexta, 23:59."

## Fora de escopo agora
Monetização/pricing/lojas, Google/Apple Sign-In, push (FCM), modo interativo da IA, wake word, calendários externos,
lembretes SMS. Não gastar energia até a hora. Detalhe e itens arquivados em `docs/CONTEXTO_APP.md` §11–12.
