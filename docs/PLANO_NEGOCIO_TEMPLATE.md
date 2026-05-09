# Plano de Negócio — Liriun (ToMore)

> Template para preenchimento pela equipe ToMore.
> Última atualização: 2026-05-09
> **Como usar:** cada seção tem orientações em itálico e campos `[preencher]`. Discutir em equipe e preencher.

> ## ⚠️ STATUS: PARKED até MVP estar pronto
>
> Decisão tomada em 2026-05-09: **não preencher este plano agora**. Foco total no desenvolvimento do MVP do app (Fase 1, ver `CONTEXTO_APP.md`). Pricing, captação, marketing, projeções, lojas — tudo isso será discutido **depois que o app estiver funcional e testável**.
>
> Mantém este template como **estrutura pronta** pra retomar quando chegar a hora. Stack técnica abaixo já foi atualizada para refletir as decisões pós-pivô (Flutter + Supabase + Next.js).

---

## 1. Visão e missão

### 1.1 Visão (onde queremos chegar)
*Frase única. O que o Liriun é em 5 anos? Ex: "Ser o assistente digital padrão de toda mente sobrecarregada que fala português."*

`[preencher]`

### 1.2 Missão (por que existimos)
*Por que a ToMore criou o Liriun? Qual dor real está sendo resolvida?*

`[preencher]`

### 1.3 Valores
*3 a 5 valores inegociáveis. Esses guiam decisões difíceis.*

1. `[preencher]`
2. `[preencher]`
3. `[preencher]`

---

## 2. Problema e solução

### 2.1 Problema central
*Qual dor o Liriun resolve? Ser específico, evitar genérico tipo "produtividade".*

`[preencher]`

### 2.2 Por que dor não é resolvida hoje
*Por que apps existentes (Todoist, Notion, etc) não resolvem? O que falta?*

`[preencher]`

### 2.3 Como o Liriun resolve
*Em 1-2 frases, qual a solução proposta. Sem listar features.*

`[preencher]`

### 2.4 Diferencial defensável
*O que outro time não consegue copiar fácil? Brand? Tecnologia? Audiência? Tom de voz?*

`[preencher]`

---

## 3. Mercado

### 3.1 Tamanho do mercado (TAM / SAM / SOM)

*Pesquisar Statista, IBGE, Datafolha, relatórios de produtividade BR.*

- **TAM** (Total Addressable Market): mercado total mundial. `[preencher — ex: R$ X bilhões — apps de produtividade global]`
- **SAM** (Serviceable Available Market): mercado realista alvo. `[preencher — ex: R$ Y milhões — Brasil + lusófono + LATAM falando espanhol]`
- **SOM** (Serviceable Obtainable Market): fatia que conseguimos pegar realisticamente nos primeiros 3 anos. `[preencher — ex: R$ Z milhões]`

### 3.2 Tendências relevantes

- Aumento de diagnósticos de TDAH em adultos no Brasil (`[preencher número e fonte]`)
- Crescimento mercado mental health digital pós-pandemia
- Apps de IA conversacional explodindo (ChatGPT efeito)
- Saturação de apps "produtividade fria" sem diferencial
- `[adicionar]`

### 3.3 Audiência alvo (personas)

#### Persona primária — `[nome / apelido]`
- Idade: `[preencher]`
- Profissão / situação: `[preencher]`
- Dor principal: `[preencher]`
- Apps que usa hoje: `[preencher]`
- Dispor a pagar: `[R$ por mês]`
- Como descobre apps novos: `[preencher — TikTok? Reddit? Indicação?]`

#### Persona secundária — `[nome / apelido]`
`[mesma estrutura]`

#### Persona terciária — `[nome / apelido]`
`[mesma estrutura]`

---

## 4. Análise competitiva

### 4.1 Concorrentes diretos

| Concorrente | Preço | Forças | Fraquezas | Como ganhamos |
|-------------|-------|--------|-----------|---------------|
| **Google Gemini app** | Free | Voz nativa, integra com Tasks/Calendar/Gmail, ecossistema Google | Genérico, tom corporativo, sem personalização do agente | Vertical em tasks + UX premium + identidade |
| Goblin Tools | $3/mês | AI nativa, audiência TDAH | UI feia | Voz + visual + tom |
| Siri / Google Assistant nativos | Free | Pré-instalados, wake word funcional | Plataforma fechada, tasks rasas | Cross-platform + foco em tasks |
| Finch | Free / $40/ano | Mascote, mental health | Só mobile, sem tarefas reais | Foco em tarefas + voz |
| Reflectly | $60/ano | Journaling + IA | Sem tarefas | Tarefas + voz |
| `[adicionar]` | | | | |

### 4.2 Concorrentes indiretos

*Apps que não fazem o que fazemos mas competem por atenção e bolso.*

- Todoist
- TickTick
- Notion
- Apple Reminders / Google Tasks
- WhatsApp (sim, muita gente usa "salvar pra mim")
- `[adicionar]`

### 4.3 Posicionamento competitivo

*Em uma frase: por que escolher Liriun em vez dos outros?*

`[preencher]`

---

## 5. Modelo de receita

### 5.1 Como ganhamos dinheiro

- Assinatura mensal e anual (freemium)
- `[outras fontes possíveis: enterprise, API paga, parcerias?]`

### 5.2 Tiers de pricing

| Tier | Preço mensal | Preço anual | O que inclui |
|------|--------------|-------------|--------------|
| Free | R$ 0 | — | `[preencher]` |
| Plus | R$ `[preencher]` | R$ `[preencher]` | `[preencher]` |
| Premium | R$ `[preencher]` | R$ `[preencher]` | `[preencher]` |

### 5.3 Custo unitário por usuário (mensal)

*Cada usuário ativo custa quanto pra rodar?*

- Hosting backend .NET (Oracle Free / Railway / VPS): R$ `[preencher — Oracle Free é R$0 até limites]`
- Supabase Postgres (DB only): R$ `[preencher — free até 500MB, depois Pro $25/mês]`
- Gemini API Flash-Lite (custo médio por usuário ativo): R$ `[preencher — ~R$0,007 por usuário/mês com 1000 usuários]`
- Firebase Cloud Messaging (push): R$ `[preencher — free tier generoso]`
- Vercel (site Next.js): R$ `[preencher — free tier serve até X req]`
- Storage / CDN / outros: R$ `[preencher]`
- **Total: R$ `[soma]`**

### 5.4 LTV / CAC

- **LTV** (Lifetime Value): quanto cada usuário pagante traz no tempo de vida. `[preencher cálculo]`
- **CAC** (Customer Acquisition Cost): quanto custamos pra adquirir cada cliente. `[preencher]`
- **LTV/CAC alvo**: 3:1 ou superior

### 5.5 Métricas a acompanhar (KPIs)

- DAU (Daily Active Users)
- WAU (Weekly Active Users)
- MAU (Monthly Active Users)
- Conversão Free → Plus
- Conversão Plus → Premium
- Churn mensal por tier
- MRR (Monthly Recurring Revenue)
- ARR (Annual Recurring Revenue)
- NPS (Net Promoter Score)
- App store rating

---

## 6. Estratégia de aquisição

### 6.1 Canais de aquisição

#### Orgânico
- ASO (App Store Optimization) — palavras-chave: `[preencher]`
- SEO blog (conteúdo sobre TDAH, organização, mental health)
- Programa de indicação amigos
- Comunidade própria (Discord? grupo no WhatsApp?)
- `[adicionar]`

#### Pago
- Meta Ads (Instagram + Facebook) — orçamento inicial: R$ `[preencher]`
- TikTok Ads — orçamento inicial: R$ `[preencher]`
- Google Ads — orçamento inicial: R$ `[preencher]`
- Patrocínio criadores nicho — orçamento: R$ `[preencher]`
- `[adicionar]`

#### Conteúdo / influência
- TikTok orgânico mostrando captura por voz (visual forte)
- Instagram Reels educacional sobre TDAH + organização
- YouTube reviews por criadores nicho
- Threads com fundadores compartilhando jornada
- Reddit r/ADHD (cuidado com regras de auto-promoção)
- `[adicionar]`

### 6.2 Funil de aquisição

```
Awareness → Consideração → Cadastro Free → Ativação (1ª tarefa salva) →
Retenção (uso semana 2) → Conversão paga → Advocacy (indicação)
```

Para cada etapa definir taxa alvo:
- Awareness → Consideração: `[%]`
- Consideração → Cadastro: `[%]`
- Cadastro → Ativação: `[% — alvo 70%+]`
- Ativação → Retenção: `[% — alvo 40%+]`
- Retenção → Pago: `[% — alvo 4-6%]`
- Pago → Advocacy: `[% — alvo 30%+]`

---

## 7. Time e operação

### 7.1 Time atual

| Pessoa | Função | Dedicação |
|--------|--------|-----------|
| Lucas Moreira | `[preencher — ex: produto, dev, marketing?]` | `[full-time / part-time / horas/semana]` |
| Pedro Tozaki | `[preencher]` | `[preencher]` |

### 7.2 Time necessário próximo ano

- `[preencher — designer? artista pixel? marketeiro? customer success?]`

### 7.3 Custos operacionais mensais

- Hosting backend .NET (Oracle Free / Railway / VPS): R$ `[preencher — Oracle Free $0; Railway $5-25/mês; DigitalOcean $30/mês]`
- Supabase Postgres (DB only): R$ `[preencher — free até 500MB, depois Pro $25/mês]`
- Gemini API estimativa: R$ `[preencher — ~$1,30/mês por 1000 usuários ativos]`
- Vercel (site Next.js): R$ `[preencher — free até X bandwidth]`
- Firebase Cloud Messaging: R$ `[preencher — free tier]`
- Domínio + DNS (liriun.com): R$ `[preencher — anual já comprado]`
- Email transacional (Resend / SendGrid): R$ `[preencher]`
- Analytics / monitoring (PostHog / Sentry): R$ `[preencher]`
- Stripe / pagamento (% por transação): `[preencher]`
- Apple Developer Account: $99/ano
- Google Play Developer: $25 único
- **Total fixo: R$ `[soma]`**

### 7.4 Investimentos pontuais

- Arte mascote (artista pixel): R$ `[preencher]`
- Marketing lançamento: R$ `[preencher]`
- Consultoria jurídica (LGPD, compliance, companheiro chat): R$ `[preencher]`
- Design de identidade visual completa: R$ `[preencher]`
- Outros: R$ `[preencher]`

---

## 8. Plano financeiro

### 8.1 Capital necessário

- Capital próprio aportado (Lucas + Pedro): R$ `[preencher]`
- Necessidade de captação externa? Sim / Não. Se sim, quanto: R$ `[preencher]`
- Possíveis fontes: bootstrap, FFF (family/friends/fools), anjo, aceleradora, VC, banco

### 8.2 Projeção 12 meses (cenário base)

| Mês | Usuários ativos | Pagantes | MRR | Custos | Saldo |
|-----|-----------------|----------|-----|--------|-------|
| M1 | `[]` | `[]` | R$ `[]` | R$ `[]` | R$ `[]` |
| M3 | | | | | |
| M6 | | | | | |
| M9 | | | | | |
| M12 | | | | | |

### 8.3 Cenários

- **Conservador:** `[X]` usuários, `[Y]` pagantes, MRR R$ `[Z]`
- **Base:** `[X]` usuários, `[Y]` pagantes, MRR R$ `[Z]`
- **Otimista:** `[X]` usuários, `[Y]` pagantes, MRR R$ `[Z]`

### 8.4 Ponto de equilíbrio (break-even)

*Quando começamos a dar lucro ou cobrir custos? Mês X com Y pagantes.*

`[preencher]`

---

## 9. Marca e identidade

### 9.1 Nome
- Liriun
- Significado / origem: `[preencher se quiser registrar]`

### 9.2 Tom de voz
*Será definido após MVP funcional (parked até escolher TTS final). Histórico V1 web: "mordomo seco e calmo". Reavaliar se mantém ou ajusta para o produto novo (voice agent).*

`[preencher pós-MVP]`

### 9.3 Identidade visual
- **Style guide oficial:** `docs/design-ref/Liriun · Visual Reference · Print.pdf` (paleta, tipografia, componentes, mockups)
- **Estilo:** misto Things 3 + Granola + Arc Search + iOS 26 Liquid Glass — dark default, gradiente roxo→azul accent, glassmorphism sutil
- **Logo / ícones:** `docs/design-ref/liriun-icon-{1024,512,192}.png`, `liriun-glyph.svg`
- **Tipografia:** ver style guide (a confirmar — não é mais Sora do V1 web)
- **Mascote:** Tier 7 / Fase 7 (parked, ver `IDEIAS_FUTURO.md`)

### 9.4 Personalidade da marca
*5 adjetivos. Ex: calmo, sutil, inteligente, acolhedor, presente.*

`[preencher]`

### 9.5 Slogan / tagline
*Frase curta usada em marketing. Ex: "A vida cabe na sua cabeça, mas não precisa morar lá."*

`[preencher]`

---

## 10. Aspectos legais e compliance

### 10.1 Pessoa jurídica
- ToMore: CNPJ `[preencher]`
- Tipo: `[MEI / ME / EIRELI / LTDA]`

### 10.2 Termos de uso
- Já existe versão V1 em `/termos-uso`
- Revisão jurídica antes do lançamento comercial: `[ ] feito / [ ] pendente`

### 10.3 Política de privacidade
- Já existe versão V1 em `/politica-privacidade`
- LGPD compliance review: `[ ] feito / [ ] pendente`

### 10.4 Compliance específico

- **LGPD geral:** revisar tratamento de dados, base legal, direitos do titular
- **Companheiro chat (saúde mental):** consultoria jurídica obrigatória antes de lançar. Risco de responsabilização se má orientação. Avisos claros, redirecionamento CVV em crises
- **Pagamento:** PCI compliance via Stripe (responsabilidade dele)
- **Crianças:** público alvo é 18+? Se houver < 18, consentimento pais

### 10.5 Marca registrada

- Liriun: `[ ] registrado / [ ] em processo / [ ] não iniciado`
- ToMore: `[ ] registrado / [ ] em processo / [ ] não iniciado`

---

## 11. Riscos do negócio

| Risco | Probabilidade | Impacto | Plano de mitigação |
|-------|---------------|---------|--------------------|
| Custo Gemini explodir | Média | Alto | Limite voz free, repassar custo no Plus |
| Concorrente grande copiar | Alta | Médio | Velocidade, brand, comunidade |
| Não conseguir tração inicial | Alta | Alto | Bootstrap, manter custos baixos, paciência |
| Burnout fundadores | Alta | Alto | Roadmap focado, não esticar muito |
| Bug crítico em produção | Média | Alto | Testes automatizados, monitoring, rollback rápido |
| Compliance / processo legal | Baixa | Alto | Revisão jurídica antes lançar, seguro? |
| `[adicionar]` | | | |

---

## 12. Saída / horizonte longo

*Onde queremos chegar e o que faremos quando chegarmos lá?*

### 12.1 Cenários possíveis em 5 anos
- [ ] Continuar bootstrapped, lifestyle business 100k MRR
- [ ] Captar VC e escalar global
- [ ] Vender para player maior (Todoist, Notion, alguém de mental health)
- [ ] Foco regional, dominar mercado lusófono

### 12.2 Critério de sucesso pessoal (Lucas e Pedro)
*Pra cada fundador. O que vocês consideram sucesso pra essa empresa?*

- Lucas: `[preencher]`
- Pedro: `[preencher]`

---

## 13. Próximos passos imediatos

> **STATUS: PARKED.** Foco atual = MVP do app (Fase 1). Retomar este plano só quando MVP estiver funcional.

Quando retomar:
- [ ] Lucas e Pedro relerem `ESTRATEGIA_LIRIUN.md` (já atualizado pra direção voice agent)
- [ ] Definir pricing baseado em custo Gemini real medido durante MVP
- [ ] Preencher seções deste plano com dados reais
- [ ] Definir orçamento de marketing pós-lançamento
- [ ] Decidir captação ou bootstrap
- [ ] Investigar processo de publicação App Store + Google Play

---

## 14. Recursos e referências úteis

### Livros recomendados
- "The Lean Startup" — Eric Ries
- "Hooked" — Nir Eyal (modelo de hábito em produtos)
- "Crossing the Chasm" — Geoffrey Moore
- "Inspired" — Marty Cagan
- "Profit First" — Mike Michalowicz (gestão financeira startup)

### Comunidades para fundadores
- Indie Hackers (en)
- Bootstrapped founders BR (Discord, grupos)
- ProductHunt para lançamento
- HackerNews

### Ferramentas comuns
- Stripe — pagamento
- Mixpanel / PostHog — analytics produto
- Customer.io / Intercom — CRM e onboarding
- Notion / Linear — gestão interna
- Figma — design

### Métricas de referência (benchmark indústria)
- Conversão freemium SaaS B2C: 2-5%
- Churn mensal SaaS B2C: 5-10%
- App store rating de apps top: ≥ 4.5
- Tempo médio até primeira ação valorosa: < 60s

---

*Documento vivo. Atualizar conforme decisões e aprendizados.*

*Próxima revisão completa: `[preencher data — sugestão: 90 dias]`*
