# Contexto do Projeto Liriun

> Este arquivo é **índice + regras + essenciais de domínio** — o que o Claude precisa carregar
> em toda sessão. Detalhe técnico completo vive nos docs abaixo; **cada assunto tem UM dono**.
> Não duplicar conteúdo aqui: se um fato mora em `CONTEXTO_APP.md`, este arquivo só aponta.

## Mapa de documentação (quem é dono de quê)

| Assunto | Dono (fonte autoritativa) |
|---|---|
| Arquitetura e decisões técnicas | `docs/CONTEXTO_APP.md` ← **em conflito, este vence** |
| Estratégia / posicionamento / concorrência | `docs/ESTRATEGIA_LIRIUN.md` |
| Backlog futuro (por tier) | `docs/IDEIAS_FUTURO.md` |
| Plano de negócio (PARKED) | `docs/PLANO_NEGOCIO_TEMPLATE.md` |
| Identidade visual (tokens, logos, fontes, guias) | `docs/design-ref/` + `docs/Identidade Visual/Rebranding/` |
| Como rodar / setup / migrations / troubleshooting | `README.md` |
| Documentos legais | `docs/termos-de-uso/` |
| Inventário do V1 web (histórico) | `docs/CONTEXTO_APP.md` §9 |

> **Regra de manutenção:** um fato mora em um arquivo só; os outros linkam. Ao mudar uma decisão,
> atualize o dono — não espalhe cópias.

## Preferências de trabalho (Pedro)

- **Nunca** commitar com Claude como co-autor (sem `Co-Authored-By: Claude`).
- **Nunca** usar múltipla escolha no terminal (AskUserQuestion) — perguntar em texto corrido.
- **Nunca** dar commit sem o Pedro pedir explicitamente.
- Quando o Pedro falar **"subir"**, significa **commit + push** (na `main`).
- Projeto pessoal — preparação para o PI (Projeto Integrador) da faculdade.

## O produto em um parágrafo

Liriun é um **organizador pessoal de tarefas com agente de voz**. Arquitetura multi-cliente
com **backend .NET centralizado** (fonte única de verdade: lógica + dados + auth) sobre **1 banco
Supabase Postgres único** (o mesmo do V1). Clientes: **site Next.js** (`site/`, substitui o Angular V1
— sócio) e **app Flutter mobile** (`app/`, Android + iOS apenas, agente de voz como diferencial — Pedro).
Plataformas futuras (smartwatch, Alexa, etc) = só implementar front. Padrão headless backend /
multi-client (Linear, Asana, Slack). **Renomeado de "Jarvis" → "Liriun" em 2026-05-03.**

```
Site (Next.js)   ─┐
App Flutter      ─┼─→ Backend .NET ─→ Supabase Postgres (1 banco único)
Plataformas fut  ─┘   (REST + JWT + Gemini)
```

> Detalhes de stack, fases, plano de migração e o MVP em `docs/CONTEXTO_APP.md`.
> Monorepo único (`backend/` + `site/` + `app/` na branch `main`); gatilhos de split no mesmo doc.

## Essenciais de domínio (aplicam a toda tarefa de código/UX)

### Modelo
- 2 entidades: **Tarefa** e **Categoria** (N:N entre elas). Tag é unificada em Categoria.
- `Tarefa.DataPrazo: DateTime?` + `Tarefa.HorarioFinal: TimeSpan?` (ambos opcionais).
- Prioridades fixas: **urgente, importante, normal, baixa**.
- Status: **pendente, concluida, atrasada** — calculado no backend, fuso BRT `America/Sao_Paulo` (nunca persiste "atrasada").
- Categorias ad-hoc na criação viram modelo permanente.
- IA só escolhe entre categorias do usuário; retorna `null` quando não infere. Não re-categoriza ao editar.
- Concluir tarefa: usuário **permanece na tela** (concluir várias em sequência).
- Exclusão de categoria **bloqueada** se tiver tarefa pendente vinculada.
- Apresentação de prazo relativa ("Hoje", "Amanhã", "Em N dias") calculada na tela.

### Terminologia oficial (usar sempre)
- "Tarefa" (não "anotação"/"nota") · "Categoria" (não "tag") · "Minhas tarefas"/"Tarefas" (não "Dashboard")
- "Visão geral" pro dashboard home · "Modo Manual" vs "Modo Liriun" (os dois modos de criação)

### Fluxo de criação (resumo — detalhe em `CONTEXTO_APP.md`)
Usuário escolhe o modo ANTES de digitar. **Manual:** form → salva direto. **Liriun:** texto/áudio →
backend chama Gemini com as categorias do usuário → JSON estruturado → card de revisão → edita/salva.
Auto-save quando o usuário confirma ("salva"/"sim") e já havia sugestão na tela. Falha de Gemini/timeout/JSON
inválido → mensagem específica + opção manual. Rate limit 429 → mensagem com retry hint.

### Modos de IA
`Gemini:ModoInterativo` (default `false`). **One-shot:** sem perguntas, `completo=true`, ~75% menos tokens.
**Interativo** (reservado ao plano pago): até 3 perguntas + checklist. Detalhe em `README.md`.

### Onboarding
Bloqueante no primeiro acesso pós-cadastro. Pergunta: nome do usuário, nome do agente ("como me chamar?"),
categorias. Templates padrão: Trabalho, Faculdade, Casa, Compras, Pessoal.

### Identidade visual
- Dark mode default · gradiente roxo→azul accent · glassmorphism sutil · **sem emojis** · ícones lineares finos.
- Tipografia **Geist** / Geist Mono. Tokens em `docs/Identidade Visual/Rebranding/brand-kit/05-tokens/`.
- App e site compartilham a mesma identidade. Style guide oficial em `docs/design-ref/`.

### Tom de voz do Liriun
Primeira pessoa (mordomo digital seco e competente). Nunca emoji, nunca exclamação dupla, nunca celebração
exagerada. Nome do usuário com parcimônia (aberturas, erros — não em toda frase).
Ex.: "Anotado, Pedro. Prazo até sexta, 23:59." / "Tudo em dia, Pedro." / "Não consegui entender dessa vez.
Preenche manual que eu salvo." *(Reavaliar pós-MVP ao definir a voz final do TTS.)*

## Estado atual

- **Backend .NET** — principal, funcional, no ar (Render). Evoluindo.
- **Site Next.js** (`site/`) — institucional pronto + área logada em construção (sócio).
- **App Flutter** (`app/`) — em construção (Pedro). Ver `app/README.md`.
- **Angular V1** (`front/`) — **removido do disco** em 2026-06-15 (source no histórico git `3bad961^`).

> Roadmap por fases, MVP detalhado e decisões datadas: `docs/CONTEXTO_APP.md`.
