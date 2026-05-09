# Estratégia Liriun — Posicionamento e Decisões Estratégicas

> Documento estratégico interno ToMore.
> **Última atualização: 2026-05-09** — revisado após pivô para app mobile com agente de voz (ver `CONTEXTO_APP.md`).
> **Premissa:** "Quem faz tudo, não faz nada." Sem peso de trabalho perdido.

---

## 0. Histórico do produto

- **V1 web (Angular + .NET)** — organizador pessoal de tarefas com captura por IA conversacional. Funcional, no ar, com paleta dark Linear-style.
- **Pivô (2026-05-08)** — produto vira multi-cliente com **agente pessoal por voz** como diferencial mobile. Site Angular V1 vai ser substituído por Next.js. Adicionado app Flutter mobile.
- **Decisão arquitetural (2026-05-09)** — backend .NET continua como **backend principal centralizado** (não substituído por Supabase). Padrão multi-client / headless backend. Site + app + plataformas futuras consomem a mesma API REST. Supabase usado só como Postgres gerenciado.

A estratégia abaixo é para o **produto novo** (multi-client com agente de voz).

---

## 1. Diagnóstico — onde estamos hoje (2026-05-09)

### O produto novo
Liriun é um **organizador pessoal de tarefas multi-plataforma com agente de voz**. Web e mobile compartilham a mesma conta e dados (single source of truth no backend .NET). Diferencial: agente de voz no mobile, identidade visual premium em todos clientes.

### Como nos posicionamos
- Não somos Todoist (gigante de produtividade).
- Não somos Notion (wiki + tasks).
- Não somos um clone de Gemini app.
- Somos um **vertical de produtividade pessoal por voz, com identidade visual e tom próprios**.

### Maior risco competitivo
**Google Gemini app já faz o core do que pretendemos** — voz, criação/consulta de tarefas no Google Tasks, integração com Calendar/Gmail. Gratuito e pré-instalado em Android. Liriun precisa convencer que vale **substituir ou complementar** Gemini para o público alvo.

### Vantagens defensáveis (potenciais)
1. **Foco vertical em tarefas** — Gemini é genérico e raso em tasks; Liriun pode ser profundo (categorias com cor, prioridade, prazo hora-exata, recorrência rica).
2. **Personalização do agente** — nome custom, voz custom, personalidade. Gemini não permite.
3. **UX premium dedicada** — visual AI-native (ver `docs/design-ref/`), não app Google plano.
4. **Privacidade/controle** — promessa "seus dados, seu agente", não Google sabendo tudo.
5. **Multi-canal futuro** — Telegram/WhatsApp/SMS via Twilio (Fase 5). Gemini não faz.

---

## 2. Posicionamento

### A aposta

> **Liriun é o seu assistente pessoal de tarefas por voz.**
> Para quem cansou de apps de produtividade frios e quer um companheiro que escuta, organiza e responde — com identidade própria.
> A vida cabe na sua cabeça, mas não precisa morar lá.

### Audiência alvo
- Estudantes universitários sobrecarregados que querem capturar ideias rápido por voz.
- Profissionais 25-40 com fadiga digital, que falam com Siri/Gemini mas querem algo mais focado.
- Pessoas com TDAH (mercado underserved gigante) — captura por voz reduz fricção.
- Jovens que vivem no celular e gostam de assistentes/companheiros AI.

### Concorrência real
| Tipo | Concorrente | Como ganhamos |
|---|---|---|
| Direto AI assistant geral | **Google Gemini app**, **Siri**, Alexa | Foco vertical em tasks + UX premium + personalização |
| Direto AI tasks | **Goblin Tools** ($3/mês) | Voz nativa + visual cuidado + tom próprio |
| Indireto produtividade | Todoist, TickTick, Notion | Não competimos em features — vendemos experiência diferente |
| Indireto self-care | Finch, Reflectly | Foco em tarefas reais, não só humor/journaling |

---

## 3. Pilares estratégicos do MVP

### A. Voz como núcleo absoluto
- Botão de microfone gigante, sempre acessível, em qualquer tela (já desenhado nos mockups oficiais — ver `docs/design-ref/`).
- "Falar com Liriun" deve ser ato de 2 segundos.
- Gemini multimodal interpreta texto + áudio em uma chamada.
- Resposta por voz (TTS nativo do dispositivo no MVP).
- Wake word ("Hey Liriun") fica para Fase 3 — primeiro entregar valor dentro do app.

### B. Identidade visual premium
- Estilo definido: misto **Things 3 + Granola + Arc Search + iOS 26 Liquid Glass** (decidido 2026-05-09).
- Dark mode default, gradiente roxo→azul como accent, glassmorphism sutil.
- Style guide oficial: `docs/design-ref/Liriun · Visual Reference · Print.pdf`.
- App Flutter e site Next.js compartilham a mesma identidade.

### C. Personalização do agente
- Nome custom desde o cadastro ("como você quer me chamar?").
- Voz nativa do dispositivo no MVP. Upgrade futuro (Fish Audio, ElevenLabs) se incomodar.
- Tom de voz definido lá na frente (parked até MVP funcional).

### D. Multi-plataforma desde o dia 1
- **Backend .NET centralizado** atende todos clientes (web, mobile, futuro: smartwatch, Alexa, browser ext).
- Flutter compila pra iOS + Android (e potencialmente Web logado).
- Site Next.js cobre web (login, tarefas, agente, config).
- Adicionar plataforma nova = só implementar front, backend não muda.
- Single source of truth: cria tarefa no app → vê no site → reflete em todo lugar.

---

## 4. Pricing — PARKED

> **Status:** Decidir SOMENTE após MVP funcional. Não tentar definir pricing antes de medir custo real (Gemini, infra, suporte).

Quando chegar a hora, modelo provável (rascunho não-vinculante):

| Tier | Preço sugerido | Inclui |
|---|---|---|
| Free | R$0 | Captura limitada, tarefas ilimitadas, recorrência básica |
| Plus | R$ a definir | Voz ilimitada, integrações de calendário, push avançado |
| Premium | R$ a definir | Personalização total do agente, voz premium TTS, mascote/Pomodoro (Fase 7) |

Discutir pricing com base em:
- Custo real Gemini API por usuário ativo.
- Benchmarks: Todoist Premium, TickTick, Goblin Tools, Finch.
- Alavancagem do diferencial (UX + voz + tom).

---

## 5. Roadmap de longo prazo (alto nível)

> Roadmap detalhado por fase está em `CONTEXTO_APP.md` seções 3 e 4. Aqui é só visão estratégica.

| Fase | Foco | Deliverable de marca |
|---|---|---|
| **Fase 1 (MVP)** | Agente funcional dentro do app | App instalável local (PC + APK celular) |
| **Fase 2** | Acesso rápido sem abrir app | Widget, atalhos, push |
| **Fase 3** | Wake word + always listening | "Hey Liriun" custom |
| **Fase 4** | Integração com calendários | Google + Apple + Outlook |
| **Fase 5** | Lembretes avançados | SMS + ligação via Twilio |
| **Fase 6** | Lojas + monetização | App Store + Play Store + pricing |
| **Fase 7+** | Mascote, Pomodoro, companheiro chat | Plano premium (ver `IDEIAS_FUTURO.md` Tier 7) |

Cada fase só começa quando a anterior estiver consolidada. **Nada de pular fase.**

---

## 6. Métricas de sucesso (12 meses pós-lançamento)

> Serão revisadas quando MVP estiver pronto e tivermos dados reais.

Rascunho:
- 5.000 usuários cadastrados
- 800 usuários ativos semanais (WAU)
- 150 assinantes pagos (após Fase 6)
- App store rating ≥ 4.5
- 1 review em vídeo grande no YouTube de tech BR
- Citado como "alternativa ao Gemini app focada em tarefas" em pelo menos 2 publicações BR

---

## 7. Riscos estratégicos

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Google integra Gemini ainda mais ao Android e Liriun fica obsoleto | Alta | Alto | Foco em UX + personalização que Google não entrega |
| Custo Gemini API explode com escala | Média | Alto | Limite voz no Free, pricing premium absorve custo |
| MVP demora demais e perde momento | Alta | Alto | Roadmap focado, online-only no MVP, sem feature creep |
| Burnout do time fundador | Média | Alto | Uma fase por vez, sem multitarefa estratégica |
| Apple barra wake word custom no iOS (já barra) | Confirmada | Médio | Comunicar limitação no onboarding, focar Android primeiro |
| Compliance LGPD ao expandir (calendar, SMS, dados sensíveis) | Média | Alto | Revisão jurídica antes da Fase 4+ |

---

## 8. Decisões pendentes

> Itens parados aguardando momento certo. **NÃO discutir agora** — registrar pra retomar pós-MVP.

- [ ] Modelo de pricing definitivo (Free/Plus/Premium, valores, limites)
- [ ] Estratégia de marketing/aquisição (canais, orçamento, criadores)
- [ ] Decisão sobre captação externa vs bootstrap
- [ ] Tom de voz exato do agente (após escolher TTS final)
- [ ] Política de wake word (custom name por usuário ou fixo "Liriun")
- [ ] Mascote pixel art (Tier 7) — manter parado ou começar a investigar artistas?
- [ ] Companheiro chat / desabafo (Tier 7) — risco compliance saúde mental, parado

---

## 9. Apêndice — Concorrentes detalhados

### Google Gemini app — **concorrente principal**
- Funcionalidade: voz nativa, conversação multi-turno (Gemini Live), integração com Tasks/Calendar/Gmail/Maps, gratuito.
- Pontos fortes: ecossistema Google, sempre disponível, modelo state-of-the-art.
- Pontos fracos: genérico (não foca em tasks profundamente), tom corporativo Google, sem personalização do agente, dados no Google.
- **Como ganhamos:** vertical, UX, personalização, identidade.

### Goblin Tools
- AI captura para TDAH ($3/mês).
- UI feia, sem polimento.
- **Como ganhamos:** voz + visual premium + tom + multi-plataforma.

### Siri / Alexa
- Plataformas fechadas (Siri = só iOS, Alexa = ecossistema Amazon).
- **Como ganhamos:** cross-platform, focado em tarefas (Siri/Alexa são genéricos).

### Finch
- Self-care + mascote, audiência jovem feminina.
- Não tem tasks reais, é mais hábitos.
- **Como ganhamos:** foco em tarefas + voz nativa.

### Todoist / TickTick / Notion
- Concorrentes indiretos. Públicos diferentes. Não brigamos por recursos.

---

*Documento vivo. Atualizar conforme decisões em reunião com Lucas.*
