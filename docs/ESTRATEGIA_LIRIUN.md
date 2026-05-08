# Estratégia Liriun — Foco, Corte e Próximos Passos

> Documento de discussão interna ToMore. Posicionamento, decisões de produto, roadmap focado.
> **Premissa:** "Quem faz tudo, não faz nada." Vamos cortar feio. Sem peso de trabalho perdido.
> Última atualização: 2026-05-07

---

## 1. Diagnóstico atual

### O que somos hoje
Liriun é um organizador pessoal de tarefas com captura por IA conversacional (texto + voz via Gemini multimodal). Tem páginas públicas (landing, sobre, empresa), auth, onboarding de categorias, captura manual + Liriun, 3 visualizações de tarefas (Lista/Kanban/Semana), concluídas, finanças, configurações, alterar senha. Web responsiva, dark/light theme, i18n PT-BR + EN nas páginas públicas.

### O problema
**Identidade confusa.** Hoje o Liriun parece ao mesmo tempo:
- Todoist (3 views, kanban, lista, semana)
- App de finanças (módulo de contas)
- App casual (onboarding curto, ilustração leve)
- App mental health (marketing "mente leve")
- App social (gamificação ranking amigos em protótipo)

Usuário não sabe o que somos. Mercado pune produto sem identidade clara.

### O mercado real
Lutamos em uma categoria saturada com gigantes consolidados:
- **Todoist** — 30M usuários, 10 anos de polimento, mobile perfeito
- **TickTick** — Pomodoro + hábitos + calendário, baratíssimo
- **Sunsama** — premium calm planner R$100/mês
- **Notion** — wiki + tasks, padrão de mercado
- **Motion / Reclaim** — AI scheduling B2B
- **Goblin Tools** — AI captura para TDAH (concorrente direto, modelo barato)
- **Finch** — self-care + mascote (concorrente direto Tier 7 nosso)

**Bater de frente em produtividade pura é suicídio.** Todoist tem 10 anos de vantagem em integrações, mobile, sincronização. Não vamos ganhar nesse jogo.

---

## 2. Posicionamento escolhido

### A aposta

> **Liriun é o assistente calmo de IA para mentes sobrecarregadas.**
> Para quem tem TDAH, ansiedade, ou simplesmente cansou de apps de produtividade que parecem planilhas.
> A vida cabe na sua cabeça, mas não precisa morar lá.

### Audiência alvo
- Estudantes universitários sobrecarregados
- Profissionais 25-40 com burnout / fadiga digital
- Pessoas com TDAH (mercado underserved gigante)
- Jovens que vivem no celular e não querem mais um app frio

### Concorrentes diretos pós-pivô
- **Goblin Tools** (TDAH + AI)
- **Finch** (self-care + mascote + tarefas)
- **Reflectly** (journaling + IA)

Não Todoist. Não TickTick. Não Notion. **Saímos da briga errada.**

---

## 3. Lista do que matar

> Peso afetivo de código já escrito não importa. Cada feature off-brand custa atenção do usuário e dilui a mensagem.

### Matar imediatamente (deletar ou esconder atrás de feature flag)

| Item | Por que mata |
|------|-------------|
| **Módulo Finanças completo** | Off-brand. "Mente leve" + boletos = contradição. Mata stress inverso. Goblin/Finch não têm e estão bem |
| **Visão Kanban (Quadro)** | Corporate. Audiência alvo não usa kanban. Confunde |
| **Visão Semana (calendário Seg-Dom)** | Power-user feature. Pesa cognição. Quem quer agenda usa Google Calendar |
| **Ranking competitivo amigos** | Anti-calm. Comparação social = ansiedade. Finch acertou em não ter isso |
| **Página Empresa (`/empresa`)** | Vanity. Usuário não liga pra história fundadores no V1. Mata até ter brand reconhecido |
| **Onboarding de categorias bloqueante** | Atrito imediato. Toda app moderna deixa pular. Categorias pode ser sugerido mid-flow |

### Manter só essencial

| Mantém | Por quê |
|--------|---------|
| **Captura por voz multimodal Gemini** | Diferencial real. Único na categoria mass BR |
| **Captura por texto + IA categorização** | Core do produto |
| **Visão Lista** | Única view essencial |
| **Visão Geral (dashboard home)** | Reduzir info: só agenda hoje + saudação |
| **Concluídas** | Pra fechar ciclo emocional ("vi o que fiz") |
| **Recorrência tarefa** | Esperado pelo mercado |
| **Conquistas pessoais (sem ranking)** | Reforço positivo, alinha brand |
| **Streak pessoal** | Dopamina sem comparação |
| **Tema claro/escuro** | Acessibilidade |

### Renomear / repensar

| Antes | Depois | Motivo |
|-------|--------|--------|
| **"Tarefas"** | **"Sua mente"** ou **"Suas anotações"** | "Tarefa" remete a trabalho. "Anotação" alinha brand |
| **"Captura"** | **"Falar com Liriun"** | Captura é frio, técnico |
| **"Visão geral"** | **"Hoje"** | Mais imediato |
| **"Concluídas"** | **"Feito"** ou **"O que você concluiu"** | Mais humano |

---

## 4. O que dobrar (foco total)

### A. Captura por voz como núcleo absoluto
- Botão de microfone gigante, sempre acessível, em qualquer tela
- Atalho global (mobile: 3D touch, atalho lock screen, widget)
- "Falar com Liriun" deve ser ato de 2 segundos
- Hold-to-record (paradigma WhatsApp) — reduz fricção
- Transcrição em tempo real visível enquanto fala
- Auto-stop por silêncio (VAD)
- Captura instantânea sem revisão (modo "confiar na IA") opcional

### B. Mascote do Liriun (Tier 7)
- Pixel art (contratar artista BR — Lucas R$, Pedro R$)
- Liriun ganha rosto. Frases saem em balão de fala dele
- Estados emocionais: feliz quando completa tarefa, calmo quando vazio, ansioso quando muitas atrasadas
- **Diferencial brutal vs Todoist/TickTick** que são caixas de texto frias
- Personalização: paleta + acessórios desbloqueáveis por uso

### C. Companheiro / desabafo (Tier 7)
- Modo "conversa livre": user fala sentimentos, não tarefas
- Liriun escuta, valida, sugere micro-ações
- Guard-rails: detectar crise (ideação suicida, violência) → CVV imediatamente
- Diferencial gigantesco. Ninguém na categoria tasks faz isso

### D. Pomodoro + intervalos saudáveis (Tier 7)
- Timer com mascote em modo foco
- Intervalo: mascote sugere água, alongamento, regra 20-20-20
- Estatística diária

### E. Mobile nativo (PWA primeiro, app store depois)
- PWA instalável Android/iOS (caminho mais rápido)
- Push notifications via Web Push
- Atalho home screen
- Offline read (vê tarefas) + offline create texto (sync depois)
- App store: Capacitor wrapper sobre o web (quando tiver tração)

### F. Notificações inteligentes
- Não notificar TUDO (anti-calm)
- Lembretes de tarefas com prazo se aproximando
- Alerta gentil de tarefa atrasada (1x/dia, não spam)
- Resumo da manhã: "Bom dia, Pedro. Hoje tem 3 coisas, todas leves"
- Resumo da noite: "Você fechou bem hoje. Amanhã tem reunião 14h"

### G. Sincronização Google/Apple Calendar (read-only V1)
- Mostrar eventos do calendar nativo dentro da agenda do Liriun
- Sem editar (V1)
- Reduz fricção: user não precisa abrir 2 apps

---

## 5. Pricing e monetização

### Plano sugerido

| Tier | Preço | O que inclui | Público |
|------|-------|--------------|---------|
| **Free** | R$0 | Captura ilimitada texto, voz limitada (10/dia), tarefas ilimitadas, recorrência básica, tema | Maioria |
| **Plus** | R$14,90/mês ou R$129/ano | Voz ilimitada, mascote básico, Pomodoro, push notifications avançadas, calendar sync read-only | Pessoas comprometidas |
| **Premium** | R$29,90/mês ou R$249/ano | Mascote personalizável + acessórios, minigames, companheiro chat ilimitado, calendar sync read+write, prioridade no suporte | Power users / fãs |

### Métricas alvo (1º ano após lançamento)

- Free → Plus: 4-6% conversão
- Plus → Premium: 15-20% upgrade
- Churn mensal Plus: <8%
- LTV/CAC: alvo 3:1

### Marketing inicial sugerido

- TikTok / Instagram com vídeos de captura por voz (visual forte)
- Comunidade Reddit r/ADHD (mercado underserved)
- Threads X / Twitter brasileiras de produtividade
- Parceria com criadores de conteúdo nicho TDAH / mental health
- App Store Optimization (ASO) com palavras-chave: "TDAH organização", "ansiedade tarefas", "AI assistant Brazil"

---

## 6. Roadmap focado (12 meses)

### Q1 (Mês 1-3) — Cortar e mobilizar

- [ ] Esconder Finanças atrás de feature flag (não deletar, reativar se mudar ideia)
- [ ] Remover Kanban e Semana das views (deixar só Lista)
- [ ] Remover ranking competitivo (manter só conquistas pessoais e streak)
- [ ] Remover página Empresa
- [ ] Onboarding pular-friendly (skippable)
- [ ] Renomear seções (Tarefas → Anotações, Captura → Falar com Liriun, etc)
- [ ] PWA completo (manifest, service worker, install prompt)
- [ ] Push notifications (Web Push API)
- [ ] Offline L2 (read tarefas + create texto)
- [ ] Recuperação de senha (bloqueador real para usuários)
- [ ] OAuth Google login (reduz atrito cadastro)

### Q2 (Mês 4-6) — Diferencial de marca

- [ ] Contratar artista para mascote pixel art
- [ ] Implementar mascote em estados básicos (feliz, calmo, ansioso, dormindo)
- [ ] Integrar mascote em todas mensagens do app (balão de fala)
- [ ] Pomodoro com mascote em modo foco
- [ ] Sugestões saudáveis no intervalo (banco interno de dicas)
- [ ] Calendar sync read-only Google
- [ ] Captura por voz hold-to-record (paradigma WhatsApp)
- [ ] Transcrição em tempo real visível
- [ ] Modo captura instantânea (sem revisão)

### Q3 (Mês 7-9) — Monetização e companheiro

- [ ] Implementar Stripe / pagamento recorrente
- [ ] Paywall e gates de feature (voz limite, mascote básico vs custom)
- [ ] Tela de upgrade clara
- [ ] Companheiro chat (modo conversa livre, com guard-rails de crise)
- [ ] Acessórios desbloqueáveis do mascote
- [ ] Minigame primeiro (cuidar de planta digital — tipo Forest)
- [ ] Estatísticas pessoais detalhadas (gráficos, padrões, "você é mais produtivo nas terças")

### Q4 (Mês 10-12) — Expansão e store

- [ ] App store iOS via Capacitor
- [ ] App store Android via Capacitor
- [ ] i18n EN polido (revisão por nativo)
- [ ] Marketing inicial: TikTok, Instagram, Reddit r/ADHD
- [ ] Programa beta fechado para feedback nativo EN
- [ ] Calendar sync read+write
- [ ] Melhorias performance (bundle size, loading)

---

## 7. Decisões pendentes (votar aqui)

> Marcar X na opção escolhida pela ToMore. Adicionar comentário se quiser justificar.

### 7.1 Finanças

- [ ] Manter como está
- [ ] Esconder atrás de feature flag (recomendado)
- [ ] Deletar tudo

**Comentário:**

### 7.2 Visões de tarefas

- [ ] Manter Lista + Kanban + Semana
- [ ] Manter Lista + Semana
- [ ] Manter só Lista (recomendado)

**Comentário:**

### 7.3 Ranking competitivo amigos

- [ ] Manter como está
- [ ] Manter ranking mas tornar opt-in (deslig padrão)
- [ ] Remover ranking, manter conquistas pessoais e streak (recomendado)

**Comentário:**

### 7.4 Mascote pixel art

- [ ] Sim, contratar artista (recomendado se for plano de produto sério)
- [ ] Não, manter sem mascote
- [ ] Versão simplificada (emoji estilizado / SVG simples interno)

**Comentário:**

### 7.5 Companheiro chat (desabafo)

- [ ] Sim, V2 priority
- [ ] Sim, mas só V3 ou V4 (preocupação compliance / segurança)
- [ ] Não fazer

**Comentário:**

### 7.6 Mobile

- [ ] PWA only (recomendado começar)
- [ ] Capacitor wrapper para app stores (quando tiver tração)
- [ ] Native real (Swift + Kotlin) — caro

**Comentário:**

### 7.7 Pricing free

- [ ] Voz ilimitada no free (mais aquisição, mais custo Gemini)
- [ ] Voz limitada no free 10/dia (recomendado, controla custo)
- [ ] Voz limitada no free 5/dia
- [ ] Voz só no Plus

**Comentário:**

### 7.8 Pricing Plus

- [ ] R$9,90/mês
- [ ] R$14,90/mês (recomendado)
- [ ] R$19,90/mês
- [ ] R$24,90/mês

**Comentário:**

---

## 8. Riscos e como mitigar

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Não diferenciar a tempo, virar Todoist genérico | Alta | Alto | Esse documento. Cortar agora. |
| Custo Gemini API explode com escala | Média | Alto | Limite voz no free, pricing premium leva esse custo |
| Companheiro chat vira problema legal/saúde mental | Média | Alto | Guard-rails sólidos, revisão jurídica antes lançar, parceria com profissional |
| Mobile não acontece, perdemos mercado mass | Alta | Alto | PWA primeiro (rápido), Capacitor depois |
| Sem mascote / arte, brand fica genérico | Alta | Médio | Investir em arte. É o que separa Finch de produtos sem alma |
| Compliance LGPD com finanças | Baixa (se removermos) | Alto | Remover finanças resolve |
| Burnout do time fundador | Média | Alto | Plano focado, não tentar 50 features |

---

## 9. Métricas de sucesso para 12 meses

- 10.000 usuários cadastrados
- 1.500 usuários ativos semanais (WAU)
- 300 assinantes pagos (Plus + Premium combinados)
- MRR R$5.000+
- App store rating ≥ 4.5
- Ser citado como "alternativa do Todoist para TDAH" em pelo menos 3 publicações brasileiras de tecnologia ou saúde mental
- 1 review em vídeo grande no YouTube nicho produtividade BR

---

## 10. Próximas conversas em equipe

- [ ] Revisar este documento com Lucas e Pedro
- [ ] Bater martelo nas decisões da Seção 7
- [ ] Ajustar roadmap conforme decisões
- [ ] Atualizar `CLAUDE.md` com novo escopo focado
- [ ] Iniciar Q1 (cortes + PWA)

---

## Apêndice — Concorrentes detalhados

### Goblin Tools
- AI captura para TDAH
- Modelo barato ($3/mês)
- UI feia, sem polimento
- Diferencial nosso: voz + mascote + tom + UX

### Finch
- Self-care + mascote
- App-only mobile
- Audiência jovem feminina
- Diferencial nosso: foco em tarefas reais, não só self-care; cross-platform; voz

### Reflectly
- Journaling com IA
- Premium $60/ano
- Diferencial nosso: tarefas + journaling combinados

### Todoist
- Mercado consolidado
- Não competimos diretamente. Diferente posicionamento.

### TickTick
- Pomodoro + hábitos
- Diferencial nosso: tom + mascote + voz nativa

---

*Documento vivo. Atualizar conforme decisões em reunião.*
