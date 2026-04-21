# Tarefas da Semana — Jarvis

Arquivo vivo de controle semanal. Cada seção é uma semana com checklist. Marque `[x]` conforme concluir. Ao terminar a semana, mova o que sobrou pra semana seguinte e adicione novos itens.

**Como usar:**
- Topo do arquivo = semana atual
- Abaixo = próximas semanas planejadas
- Mais abaixo = histórico de semanas concluídas (colapsado mentalmente, deixa só pra consulta)
- Referência do plano macro: `DESENVOLVIMENTO.md`

---

## Semana atual — 2026-04-19 a 2026-04-25

**Foco:** fechar Fase 0 (Descoberta) e começar Fase 1 (Design e arquitetura)

- [ ] Validar mockup `07-configuracoes.html` e aprovar
- [ ] Decidir se falta alguma sub-tela da V1 (form de criação manual, textarea + revisão do modo Jarvis)
- [ ] Decidir stack de i18n (JSON vs XLIFF vs PO) — fechar antes de codar qualquer linha
- [ ] Definir estrutura de chave de tradução (camelCase vs dot.notation)
- [ ] Escolher referência de layout nova (Things 3 / Sunsama / Amie) OU confirmar Linear
- [ ] Se trocar referência: refazer 1 mockup piloto com DNA novo antes de refazer todos
- [ ] Revisar `PROJETO.md` e atualizar modelagem do banco (remover tabela `tags`, virar multi-user)

---

## Próxima semana — 2026-04-26 a 2026-05-02

**Foco:** Fase 1 completa (arquitetura pronta pra começar a codar)

- [ ] Modelagem final do banco (ER das entidades: User, Task, Category, Deadline, TaskCategory)
- [ ] Definir contratos de API (endpoints, DTOs de request/response)
- [ ] Arquitetura do backend — camadas da Clean Architecture documentadas
- [ ] Arquitetura do frontend — estrutura de pastas, state management com Signals
- [ ] Estratégia de autenticação — fluxo JWT, expiração, refresh
- [ ] Arquitetura de i18n no código — garantir que está claro como aplicar
- [ ] Mockups mobile das 7 telas (depois dos desktop aprovados)

---

## Semana 3 — 2026-05-03 a 2026-05-09

**Foco:** Fase 2 (Setup de ambiente)

- [ ] Criar repositório Git no GitHub
- [ ] Criar projeto Supabase
- [ ] Obter chave da Google Gemini API
- [ ] Criar projeto .NET 8 Web API com Clean Architecture
- [ ] Criar projeto Angular 17+ com standalone components
- [ ] Configurar PrimeNG + TailwindCSS
- [ ] Configurar ESLint/Prettier + analyzers
- [ ] Configurar variáveis de ambiente (.env, appsettings, secrets)
- [ ] README inicial com instruções de setup local

---

## Semana 4 em diante — a planejar

Próximas semanas serão preenchidas conforme avançar. Baseadas em `DESENVOLVIMENTO.md`:
- Fase 3 (Backend) — ~2-3 semanas
- Fase 4 (Frontend) — ~2-3 semanas
- Fase 5 (Testes) — ~1-2 semanas
- Fase 6 (Deploy) — ~1 semana
- Fase 7 (Pós-lançamento) — uso contínuo

---

## Histórico — semanas concluídas

### Semana 0 — 2026-04-12 a 2026-04-18
- [x] Entrevista estruturada de descoberta (6 rodadas)
- [x] Consolidação em `ENTREVISTA.md`
- [x] Atualização do `CLAUDE.md` com decisões novas
- [x] Criação do `DESENVOLVIMENTO.md` (plano em fases)
- [x] Criação do `FUTURO.md` (backlog em tiers)
- [x] Criação do `TECNOLOGIAS.txt` (stack consolidada)
- [x] Fluxograma `fluxo-usabilidade.drawio`
- [x] Mockups HTML/CSS das telas 01-06 (login, cadastro, onboarding, captura, minhas-tarefas, concluídas)
