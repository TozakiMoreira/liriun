# Entrevista de Descoberta — Jarvis V1

Documento consolidado da entrevista de descoberta do projeto Jarvis, realizada entre Pedro e Claude. Serve como fonte autoritativa das decisões de produto da V1. Mudanças posteriores devem atualizar este arquivo.

**Data:** 2026-04-19
**Status:** Fase 0 (Descoberta) — concluída

---

## 1. Visão e propósito

### Em uma frase
O Jarvis permite anotar de forma rápida ideias, lembretes e afazeres, transformando texto genérico em tarefas organizadas e acionáveis. É uma memória efetiva que não deixa passar nada do que o usuário pensa ao longo do dia — uma vez inseridos, os itens são processados e acompanhados até serem concluídos.

### Visão de longo prazo (fora do escopo da V1)
O Jarvis será um app mobile com comando de voz personalizado. O usuário desbloqueia o app, fala o que precisa fazer, e o Jarvis transcreve, categoriza, cria prazo e notifica. No horizonte ainda mais distante, o Jarvis **executa** as tarefas pelo usuário. Hoje é memória; amanhã é execução.

### Dor que motiva o projeto
Apps de notas tradicionais (Notion, Todoist, Apple Notes) exigem input manual estruturado — escolher categoria, definir prazo, marcar prioridade. O Jarvis automatiza essa organização com IA, reduzindo o atrito da captura. O usuário só fala/escreve o que quer lembrar, o Jarvis organiza.

### V1 deliberadamente simples
A V1 é um **site web responsivo** (desktop + mobile browser), com input **por texto escrito** (sem voz), **sem notificações**. É o piloto mínimo pra validar o fluxo com IA funcionando.

---

## 2. Público / Persona

### Persona única — "Pedro (estudante/dev)"
- Estudante de faculdade e profissional em início de carreira
- Volume real de uso: 3-5 tarefas por dia
- Contextos de captura: entre aulas, em reuniões, em deslocamento, à noite antes de dormir
- Usa o app tanto no celular (no meio da rotina) quanto no PC (em casa, revisando)
- Já está acostumado com ferramentas de produtividade, mas tem preguiça do overhead de organização

### Usuários adicionais pra teste
Sócio e namorada do Pedro também vão usar pra testar — cada um com suas tarefas privadas. Por isso o sistema é **multi-user** desde a V1 (mudança em relação ao plano original single-user).

---

## 3. Cenas concretas de uso

1. **Na faculdade**: professor passa dever de casa. Pedro abre o Jarvis no celular, digita rapidamente o que precisa fazer, Jarvis categoriza como "Faculdade" com prazo. Depois, em casa, Pedro abre no PC e vê tudo que anotou.
2. **Comprando algo**: "preciso comprar uma fita métrica". Anota rápido, Jarvis categoriza em "Compras".
3. **Revisão diária/semanal**: Pedro abre "Minhas tarefas" e vê tudo que precisa fazer, agrupado por categoria, atrasadas em destaque.

---

## 4. Escopo POSITIVO da V1 (o que o app FAZ)

### Entidades
- **Usuário** (email + senha)
- **Tarefa** (nome obrigatório, categorias opcionais N:N, prazo opcional, horário final opcional, prioridade opcional, status)
- **Categoria** (criada pelo usuário, pode ser usada em múltiplas tarefas, uma tarefa pode ter várias)
- **Prazo pré-definido** (durações nomeadas — "Hoje", "Amanhã", "Essa semana", etc)

### Autenticação
- Cadastro com email + senha (senha com hash no banco)
- Login com email + senha
- JWT armazenado no `localStorage`
- **V1 não tem**: recuperação de senha, confirmação de email, reset de senha, 2FA

### Funcionalidades principais
- **Onboarding forçado** no primeiro acesso: usuário configura categorias e prazos (ou aceita os templates padrão, ou edita, ou cria do zero)
- **Criar tarefa em 2 modos**:
  - **Manual**: form com nome (obrigatório), categorias (multi-select com opção de criar categoria nova inline), prazo (escolha de lista OU prazo custom só pra essa tarefa), horário final (opcional, default 23:59), prioridade
  - **Jarvis (com IA)**: textarea livre → usuário escreve texto livre → Jarvis chama Gemini passando texto + lista de categorias e prazos do usuário → retorna sugestões → tela de revisão com campos editáveis → usuário salva ou edita antes de salvar
- **Editar tarefa**: categoria, prioridade, prazo (não re-chamar IA ao editar)
- **Excluir tarefa**
- **Concluir tarefa** (marcar como concluída) — ao concluir, o usuário **permanece na tela Minhas Tarefas** (a tarefa desaparece da lista mas a navegação não muda). Isso permite concluir várias em sequência sem fricção.
- **Listar tarefas pendentes** ("Minhas tarefas") com filtro principal configurável (agrupamento por prioridade, por prazo ou por categoria) e ordenação secundária sempre por prazo mais próximo. Tarefas **atrasadas** sempre aparecem primeiro em destaque
- **Listar tarefas concluídas** (tela "Concluídas") — histórico completo desde sempre na V1 (limite pode ser adicionado depois)
- **Gerenciar categorias e prazos** (tela de configurações) — criar, editar, excluir. Excluir é **bloqueado** se a categoria/prazo tiver tarefas pendentes vinculadas
- **Status automático "atrasada"**: calculado pelo backend quando lista tarefas (não é job de background). Uma tarefa pendente vira atrasada quando passa do prazo final + horário final
- **Responsividade**: desktop + mobile browser

### Categorias padrão (template de onboarding)
- Trabalho
- Faculdade
- Casa
- Compras
- Pessoal

### Prazos padrão (template de onboarding)
- Hoje (até 23:59 de hoje)
- Amanhã
- Essa semana (7 dias)
- Esse mês (30 dias)
- Sem prazo

### Prioridades (fixas, não configuráveis)
- Urgente
- Importante
- Normal
- Baixa

### Status (fixos)
- Pendente
- Concluída
- Atrasada (transição automática pendente → atrasada quando passa prazo)

### Telas da V1
1. **Landing** (pública, em `/`, hero + CTA de login/cadastro)
2. **Login** (email + senha)
3. **Cadastro** (primeira vez — email + senha + nome do usuário pra personalização)
4. **Onboarding** (setup de categorias, bloqueante no primeiro acesso — Prazo deixou de existir como entidade)
5. **Captura rápida** (tela principal — escolhe modo Manual ou Jarvis, cria tarefa, volta pra mesma tela após salvar; modo Jarvis aceita texto e áudio gravado)
6. **Visão Geral** (dashboard pós-login: saudação, resumo, gráficos por categoria/prioridade, timeline)
7. **Minhas tarefas** (listagem de pendentes e atrasadas, 3 views: Lista, Kanban, Semana, com filtros por categoria/prioridade/período/atraso)
8. **Concluídas** (histórico de tarefas concluídas, filtro por período — dia/semana/mês, com reabrir)
9. **Configurações** (perfil + foto + alterar senha + gerenciar categorias)

### Identidade visual
- **Paleta**: clonar Linear na cara dura na V1 — dark mode, cinza-azulado, preto, branco, accent roxo/azul
- **Estilo**: clean, profissional, denso, atalhos de teclado bem-vindos
- **Fonte, espaçamento, menus**: copiar Linear como referência
- Isso é provisório — Pedro vai refinar depois

### Tom de voz do Jarvis
- Primeira pessoa, sempre — o Jarvis fala com o usuário
- Arquétipo: Jarvis do Homem de Ferro (não Duolingo)
- Seco, discreto, competente, formal com humor sutil
- Nunca emoji, nunca exclamação dupla, nunca celebração exagerada
- Usa o nome do usuário (capturado no cadastro) com parcimônia — em aberturas e erros, não em toda frase
- Presente em: confirmações de ação, estados vazios, mensagens de erro, loading states
- Exemplos:
  - Criar tarefa manual: *"Anotado, Pedro. Prazo até sexta, 23:59."*
  - Criar tarefa com IA: *"Organizei pra você: categoria Compras, prazo até amanhã. Confere se fiz certo."*
  - Minhas tarefas vazia: *"Tudo em dia, Pedro. Nada pra fazer agora."*
  - Erro IA: *"Não consegui entender dessa vez. Preenche manual que eu salvo."*

---

## 5. Escopo NEGATIVO da V1 (o que o app NÃO faz)

Funcionalidades intencionalmente **fora** da V1. Ficam como backlog pós-V1:

- Áudio / transcrição por voz
- App mobile nativo (V1 é web responsivo)
- Notificações push / email
- Dark mode togglável (V1 é dark-only, clonando Linear)
- Export de tarefas
- Offline / PWA
- Subtarefas
- Anexos
- Recuperação de senha por email
- Confirmação de email no cadastro
- Reset de senha
- Multi-usuário com compartilhamento de tarefas (cada usuário ainda é isolado)
- Busca textual por nome de tarefa
- IA criar categoria ou prazo novo (na V1 a IA só escolhe dos já existentes; se nenhum bate, retorna null no campo)
- Re-categorização automática via IA ao editar tarefa existente
- Desfazer conclusão (voltar concluída pra pendente) ou clonar tarefa concluída
- Métricas de produtividade / metas pessoais dentro do app
- Status intermediários (ex: "em andamento")
- Tags separadas de categorias (unificado — uma tarefa pode ter N categorias)

---

## 6. Comportamento da IA (Gemini)

### Estratégia do prompt
Quando o usuário aciona o modo Jarvis:
1. Frontend envia o texto livre do usuário pro backend
2. Backend monta prompt pro Gemini incluindo:
   - Texto do usuário
   - Lista de categorias cadastradas por esse usuário
   - Lista de prazos pré-definidos por esse usuário
   - Instrução de retornar JSON estruturado com: `titulo`, `categorias[]`, `prazo`, `prioridade`
3. Regra crítica: **a IA só pode escolher de listas existentes**. Se nada bate, retorna `null` no campo.

### Comportamento esperado
- Texto claro (ex: "comprar fita métrica até sexta") → IA preenche tudo com confiança
- Texto vago (ex: "papel") → IA retorna campos em branco/null, tela de revisão abre com o título preenchido e resto vazio
- Usuário revisa e edita livremente antes de confirmar

### Tratamento de erros da IA
Se Gemini falha (timeout > 10s, erro HTTP, rate limit, JSON malformado):
- Mostra toast com mensagem do Jarvis: *"Não consegui dessa vez. Preenche manual que eu salvo."*
- Abre o form manual pré-preenchido com o texto bruto no campo nome
- Usuário completa manualmente

Esse cenário é considerado improvável em uso pessoal (3-5 tarefas/dia), mas precisa existir como fallback.

---

## 7. Regras de domínio importantes

- **Categoria ad-hoc vira modelo**: se o usuário cria uma categoria nova durante a criação de uma tarefa, ela vira permanente e pode ser reutilizada
- **Prazo ad-hoc não vira modelo**: prazos custom criados dentro de uma tarefa valem só pra ela
- **Exclusão bloqueada**: não pode excluir categoria ou prazo que tenha tarefa pendente vinculada. Mostra alerta
- **Atrasada é automático**: transição é calculada no backend quando lista tarefas. Critério: passou do `dataPrazo` + `horaFinal` (default 23:59). Meia-noite = dia seguinte = atrasada
- **Multi-user isolado**: cada usuário só vê suas próprias tarefas, categorias, prazos. Sem compartilhamento

---

## 8. Definition of Done da V1

A V1 é considerada pronta quando:

- [x] Cadastro + login funcionando com hash de senha e JWT
- [x] Onboarding bloqueante no primeiro acesso com templates padrão
- [x] CRUD completo de categorias (Prazo deixou de ser entidade — DataPrazo direto na Tarefa, decisão 2026-04-30)
- [x] Criar tarefa em modo Manual (formulário completo)
- [x] Criar tarefa em modo Jarvis (IA real, Gemini integrado, texto + áudio com gravação)
- [x] Fallback da IA funcionando (texto vago → null; erro → form manual)
- [x] Editar e excluir tarefas
- [x] Marcar tarefa como concluída + reabrir tarefa concluída
- [x] Status atrasada calculando automaticamente no backend
- [x] Tela "Minhas tarefas" com filtro principal configurável (3 views: Lista/Kanban/Semana) e atrasadas em destaque
- [x] Tela "Concluídas" com filtros por período
- [x] Tela "Configurações" (gerenciar categorias com bloqueio de exclusão + perfil + foto + senha)
- [x] Responsivo desktop + mobile browser
- [x] `data-testid` em todos os elementos interativos
- [x] Testes unitários do backend (camadas Domain, Application e Api)
- [ ] Testes E2E automatizados dos fluxos principais (desktop + mobile)
- [ ] Deploy em produção funcionando (frontend + backend + banco)
- [x] Tom do Jarvis consistente em todas as telas

---

## 9. Métricas de sucesso pessoais

Por ser uso pessoal e V1 piloto, **não há métricas formais embutidas no app**. Pedro vai avaliar empiricamente pelo uso.

Ideia futura (pós-V1): sistema de **metas pessoais** — o usuário define metas com data-alvo (ex: "ter Jarvis em produção até Julho", "passar no semestre da facu") e vincula tarefas a metas pra acompanhar progresso. Não entra na V1.

---

## 10. Riscos técnicos conhecidos

- **Gemini free tier**: limite diário de requisições. Pra uso pessoal (3-5 tarefas/dia) dificilmente estoura, mas monitorar
- **Railway free tier**: containers dormem após inatividade (cold start de ~30s no primeiro request)
- **Supabase free tier**: limite de linhas e storage — suficiente pra V1
- **Vercel free**: bandwidth limit existe mas irrelevante pra uso pessoal
- **JSON malformado do Gemini**: IA pode retornar texto que não parseia — precisa de try/catch robusto + fallback manual
- **Timezone**: prazos com horário final precisam lidar com timezone corretamente (servidor UTC vs usuário BR). Definir cedo

### Alternativa de deploy (em avaliação)
Pedro considera **Oracle Cloud Free Tier always-free** (2 VMs ARM + 200GB storage) + **Docker Compose** + **domínio próprio** (~R$50/ano) em vez de Railway. Vantagens: sem cold start, sem bandwidth limit, controle total, aprendizado DevOps real. Desvantagem: Pedro vira sysadmin (nginx, SSL Let's Encrypt, backups, deploy automation). Decisão final na Fase 6.

---

## 11. Terminologia oficial do projeto

- **Tarefa** (não "anotação", não "nota") — é o que o usuário cria
- **Categoria** (não "tag") — rótulo da tarefa, N:N
- **Prazo** / **Prazo final** — duração ou data limite até quando a tarefa deve ser feita
- **Horário final** — hora dentro do dia do prazo (default 23:59)
- **Minhas tarefas** (não "Dashboard") — tela principal de listagem
- **Modo Manual** / **Modo Jarvis** — os dois modos de criação

---

## 12. Próximos passos (conforme DESENVOLVIMENTO.md)

1. Atualizar `CLAUDE.md` com mudanças dessa entrevista
2. Fluxogramas de navegação e fluxos principais
3. Mockups das 7 telas (estilo Linear)
4. Modelagem do banco + contratos de API
5. Setup dos projetos (back + front)
6. Implementação em camadas (back → front)
7. Testes (unitários + E2E)
8. Deploy

---

## 13. Decisões que ficaram adiadas (backlog explícito)

Decisões levantadas durante a entrevista mas conscientemente adiadas pra depois da V1:

- IA criar categoria ou prazo novo automaticamente
- Desfazer conclusão / clonar tarefa concluída
- Limite de histórico em "Concluídas" (hoje é ilimitado)
- Metas pessoais e métricas dentro do app
- Busca textual
- Notificações
- Voz
- App mobile nativo
