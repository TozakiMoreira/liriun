# Liriun Web App · Guia de Refatoração das Páginas Internas

> Como evoluir as páginas **internas do app web** (autenticado) — Falar, Hoje, Tarefas, Atividade, Configurações — usando os padrões do app mobile v2.
>
> **Leia primeiro:** `CLAUDE_CODE_SITE.md` (cobre só marketing). Este aqui cobre o produto logado.
> **Reference visual:** `liriun-app-v2.html` — as 15 telas mobile. A versão desktop é uma **adaptação respeitosa** dessas telas, não uma cópia.

---

## 0 · Contexto · o que existe hoje

Pelas screenshots compartilhadas, hoje a web app tem:

| Rota atual | Conteúdo atual | Problema |
|---|---|---|
| `/falar` | Chat centralizado com mic grande | Mic estático, sem fluxo de extração visível |
| `/hoje` | 3 stat cards (Pendentes/Atrasadas/Concluídas) + lista | Genérico, sem narrativa, sem identidade |
| `/tarefas` | Tabs Lista/Quadro/Semana + filtros | Funcional, mas sem coleções visuais |
| `/atividade` | 3 stat cards (Concluídas/Streak/Nível) + conquistas + recentes | Falta year heat + insights narrativos |
| `/configuracoes` | Perfil/Segurança/Idioma/Tema/Conta | OK, só polish |

Falta também: **quick capture global**, **notificações inteligentes**, **busca command-bar**.

---

## 1 · Princípio guia · "mesma alma, layout diferente"

Pense assim:
- **Mobile** = vertical, single column, full-screen modals
- **Web** = sidebar + main area, modals como dialog, multi-pane onde fizer sentido

Mas **identidade visual idêntica**: mesmo gradient, mesmo tom, mesma motion language.

---

## 2 · Prioridade

| # | Página | Mudança | Esforço | Prioridade |
|---|---|---|---|---|
| 1 | `/falar` | Reescrever como Voice Flow visível (listening → extração → saved) | 8h | 🔴 |
| 2 | `/hoje` | Trocar stat cards por Day Shape + Liriun proativa + featured task | 6h | 🔴 |
| 3 | `/tarefas` | Adicionar 4ª view "Coleções" antes de Lista/Quadro/Semana | 4h | 🟡 |
| 4 | `/atividade` | Adicionar Year Heat + Narrative Insights | 5h | 🟡 |
| 5 | global | Command bar (Cmd+K) com captura instantânea | 6h | 🟡 |
| 6 | global | Notificações in-app (top-right toast com smart actions) | 3h | 🟢 |
| 7 | `/configuracoes` | Polish (avatar maior, agrupamento melhor, idioma com flag) | 2h | 🟢 |
| 8 | global | Skeleton states pra todas as listas | 3h | 🟡 |

---

## 3 · Mudança #1 · `/falar` · Voice Flow visível

### Antes
Tela com mic grande no centro + "Boa noite Lucas. Como posso ajudar?" + botão "PREFIRO ESCREVER".

### Depois
Reproduzir o fluxo do app v2 (telas 2.1, 2.2, 2.3) adaptado pra desktop:

#### Estado idle
- Greeting personalizado por hora (manhã/tarde/noite)
- Mic FAB grande **com glow ring pulsando** (a versão atual não pulsa)
- 3 sugestões clicáveis abaixo do mic ("Tente: 'Reunião com Marina amanhã às 9'")
- Histórico de conversas recentes em sidebar direita (opcional, colapsável)

#### Estado listening (ao apertar mic)
- Layout inteiro escurece com gradient violet
- Rings concêntricos animados (3 rings defasados 0.5s)
- **Live transcription** aparece no topo (Web Speech API)
- Waveform 32 barras animadas
- Botão "Cancelar" embaixo

#### Estado processing
- Mark shimmer aparece
- Transcript com entidades destacadas (Marina em azul, "amanhã às 9" em violet)
- Extração aparece campo-a-campo com stagger 0.2s

#### Estado saved
- Check circle + confetti
- Preview card EXATA da tarefa criada
- "Liriun pergunta" card sugerindo follow-up
- CTAs: "Ver tarefa" / "Falar mais uma"

### Implementação

```tsx
// app/(authed)/falar/page.tsx
'use client';

import { useVoiceFlow } from '@/hooks/use-voice-flow';
import { VoiceIdle, VoiceListening, VoiceProcessing, VoiceSaved } from '@/components/voice/states';
import { AnimatePresence } from 'framer-motion';

export default function FalarPage() {
  const { state, transcript, extracted, start, cancel, reset } = useVoiceFlow();
  
  return (
    <div className="flex-1 flex items-center justify-center relative">
      <AnimatePresence mode="wait">
        {state === 'idle'       && <VoiceIdle       onStart={start}        key="idle" />}
        {state === 'listening'  && <VoiceListening  transcript={transcript} onCancel={cancel} key="listen" />}
        {state === 'processing' && <VoiceProcessing transcript={transcript} key="proc" />}
        {state === 'saved'      && <VoiceSaved      task={extracted}        onReset={reset} key="saved" />}
      </AnimatePresence>
    </div>
  );
}
```

Para o hook `useVoiceFlow`:

```ts
// hooks/use-voice-flow.ts
export function useVoiceFlow() {
  const [state, setState] = useState<'idle'|'listening'|'processing'|'saved'>('idle');
  const [transcript, setTranscript] = useState('');
  const [extracted, setExtracted] = useState<Task | null>(null);
  
  const start = useCallback(() => {
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SR) { alert('Browser não suporta voz'); return; }
    
    setState('listening');
    const recog = new SR();
    recog.lang = 'pt-BR';
    recog.continuous = false;
    recog.interimResults = true;
    recog.onresult = (e: any) => {
      const t = Array.from(e.results).map((r: any) => r[0].transcript).join('');
      setTranscript(t);
    };
    recog.onend = async () => {
      setState('processing');
      const task = await fetch('/api/extract', { method: 'POST', body: JSON.stringify({ transcript }) }).then(r => r.json());
      setExtracted(task);
      // salvar na DB
      await fetch('/api/tasks', { method: 'POST', body: JSON.stringify(task) });
      setState('saved');
    };
    recog.start();
  }, []);
  
  return { state, transcript, extracted, start, cancel: () => setState('idle'), reset: () => setState('idle') };
}
```

---

## 4 · Mudança #2 · `/hoje` · narrativa, não cards

### Antes
3 stat cards (Pendentes 0, Atrasadas 1, Concluídas 0) + lista flat.

### Depois (espelha tela 1.1 do app v2)
Layout 2-pane: esquerda **narrativa do dia**, direita **lista contextual**.

```
┌──────────────────────────────────────────────────────────────┐
│  QUARTA · 13 MAI · 09:14 · ENSOLARADO                        │
│                                                               │
│  Bom dia,                                                     │
│  Lucas.                                                       │
│                                                               │
│  ┌─ O DIA · 4 MOMENTOS ──────────────────────────────────┐   │
│  │  ●━━━━━●━━━━━━●━━━━━━━●━━━━━━●━━━━━━━━━━━━━━━━━━━━━━━│   │
│  │  6     9      12      15     18                       │   │
│  │  AGORA                                                │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─ LIRIUN SUGERE ──────────────────────────────────────┐   │
│  │  ✨ Você tem 2h livres antes da reunião com Marina.  │   │
│  │     Que tal o relatório do trimestre?                 │   │
│  │  [Começar agora]  [Mais tarde]                        │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                               │
│  A SEGUIR · em 3h 46m                                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Reunião com Marina    ● Trabalho  13:00 · 60MIN  ALTA│   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ── Próximas ────────                                        │
│  ○ Revisar contrato Acme  15:30 · 45MIN                      │
│  ○ Buscar Lucas Jr na escola  17:30 · 30MIN                  │
└──────────────────────────────────────────────────────────────┘
```

**Componentes-chave:**
- `<DayShape />` — timeline horizontal com SVG ou flexbox bars
- `<LiriunSuggestion />` — card com gradient soft + CTAs
- `<FeaturedTask />` — destaca a próxima tarefa
- `<UpcomingList />` — lista das próximas, sem foco em "atrasadas"

**Variantes por hora:**
```ts
const variant = useMemo(() => {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 19) return 'midday';
  return 'evening';
}, []);
```

Cada variante renderiza um header diferente:
- **morning**: greeting + day shape + sugestão proativa
- **midday**: progress ring + tarefas restantes + done chips
- **evening**: day stamp (6 dots) + soft-fail card + tomorrow brief

Use `<MorningLayout />`, `<MiddayLayout />`, `<EveningLayout />` como sub-componentes.

---

## 5 · Mudança #3 · `/tarefas` · adicionar Coleções

### Antes
Tabs: Lista · Quadro · Semana

### Depois
Tabs: **Coleções** · Lista · Quadro · Semana

A nova view "Coleções" é a primeira por default. Espelha tela 3.1 do app v2:

```tsx
// app/(authed)/tarefas/components/collections-view.tsx
const collections = [
  { name: 'Trabalho',  color: 'cat-work',    count: 12, done: 5  },
  { name: 'Saúde',     color: 'cat-health',  count: 5,  done: 3  },
  { name: 'Casa',      color: 'cat-home',    count: 8,  done: 2  },
  { name: 'Pessoal',   color: 'cat-person',  count: 6,  done: 1  },
];

export function CollectionsView() {
  return (
    <>
      <div className="grid grid-cols-4 gap-4 mb-8">
        {collections.map(c => <CollectionCard key={c.name} {...c} />)}
      </div>
      
      <div className="mb-2 font-mono text-xs text-fg-faint uppercase tracking-wider">Listas inteligentes</div>
      <div className="rounded-xl bg-white/[0.025] border border-border divide-y divide-border">
        <SmartListRow icon="★" label="Prioritárias" count={3} />
        <SmartListRow icon="◷" label="Agendadas hoje" count={4} />
        <SmartListRow icon="⊘" label="Sem categoria" count={2} />
      </div>
    </>
  );
}

function CollectionCard({ name, color, count, done }) {
  return (
    <Link href={`/tarefas/${color}`} className="group relative rounded-2xl p-5 border bg-gradient-to-br hover:-translate-y-0.5 transition-transform"
      style={{
        background: `linear-gradient(160deg, var(--${color}) 10%, rgba(255,255,255,0.02) 70%)`,
        borderColor: `var(--${color})/30`,
      }}>
      <div className="w-3 h-3 rounded-full mb-12" style={{ background: `var(--${color})`, boxShadow: `0 0 12px var(--${color})` }} />
      <div className="text-xl font-semibold tracking-tight">{name}</div>
      <div className="mt-3 h-1 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full" style={{ width: `${done/count*100}%`, background: `var(--${color})` }} />
      </div>
      <div className="flex justify-between mt-2 font-mono text-[10px] text-fg-faint">
        <span>{done}/{count}</span>
        <span>{Math.round(done/count*100)}%</span>
      </div>
    </Link>
  );
}
```

E ao clicar numa coleção → vai pra `/tarefas/[catId]` (espelha tela 3.2):
- Header com glow da cor da categoria
- Tabs: Abertas / Concluídas / Arquivadas
- Agrupado por: Hoje / Esta semana / Sem prazo
- Tags **"+15M PREP"** quando Liriun adicionou tempo de preparação

---

## 6 · Mudança #4 · `/atividade` · Year Heat + Insights

### Antes
3 stat cards (Concluídas / Streak / Nível) + grid de 4 conquistas + lista de recentes.

### Depois
Manter o que tem + **adicionar duas seções novas** acima:

#### a. Year Heat (52 semanas, GitHub-style)

```tsx
// components/year-heat.tsx
export function YearHeat({ data }: { data: number[] /* 52 valores 0-4 */ }) {
  return (
    <div className="rounded-2xl bg-white/[0.025] border border-border p-6">
      <div className="flex justify-between mb-4">
        <div className="font-mono text-xs text-fg-faint uppercase tracking-wider">52 semanas</div>
        <div className="font-mono text-xs text-violet-300">184 concluídas</div>
      </div>
      <div className="flex gap-[2px]">
        {data.map((e, i) => (
          <div
            key={i}
            className="flex-1 h-6 rounded-[3px]"
            style={{ background: heatColor(e) }}
            title={`Semana ${i+1}: ${e * 5} tarefas`}
          />
        ))}
      </div>
      <div className="flex justify-between mt-2 font-mono text-[10px] text-fg-faint">
        <span>JAN</span><span>ABR</span><span>JUL</span><span>OUT</span><span>DEZ</span>
      </div>
    </div>
  );
}

const heatColor = (e: number) => {
  const colors = [
    'rgba(255,255,255,0.04)',
    'rgba(168,139,255,0.18)',
    'rgba(168,139,255,0.32)',
    'rgba(168,139,255,0.50)',
    'rgba(168,139,255,0.72)',
  ];
  return colors[Math.min(4, Math.max(0, e))];
};
```

#### b. Narrative Insights ("Liriun aprendeu")

```tsx
const insights = [
  { icon: '◷', title: 'Você é mais produtivo às terças',     desc: '4× mais conclusões que outros dias.' },
  { icon: '☾', title: 'Costuma planejar domingo à noite',   desc: 'Maioria das tarefas criadas entre 21h–23h.' },
  { icon: '↗', title: 'Saúde cresceu 40% este mês',          desc: 'Maior salto. Continua assim.' },
  { icon: '✱', title: 'Voz preferida pra captura',           desc: '78% das tarefas criadas falando.' },
];
```

Renderizar como grid 2x2 de cards. Cada card tem ícone colorido + título + descrição.

**Estes insights vêm de queries reais** ao banco — não inventar. Crie um `lib/insights.ts` com funções como `computeBestDay(userId)`, `computeCategoryGrowth(userId, month)`, etc.

#### c. Streak Card visual

Trocar o stat card "Streak 1 dia" por um card **maior, gradient laranja+violet**:

```tsx
<div className="rounded-2xl p-5 bg-gradient-to-br from-amber-500/10 to-violet-500/6 border border-amber-500/24 flex items-center gap-4">
  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-violet-400 flex items-center justify-center shadow-lg shadow-amber-500/30">
    <Flame className="w-5 h-5 text-white" />
  </div>
  <div>
    <div className="text-2xl font-semibold tracking-tight">12 dias</div>
    <div className="font-mono text-[10px] text-amber-400 mt-1 uppercase tracking-wider">STREAK ATUAL · RECORDE 18d</div>
  </div>
  <button className="ml-auto text-xs text-fg-muted hover:text-fg">Compartilhar →</button>
</div>
```

O botão "Compartilhar" → abre modal com o **Achievement Shareable Card** (tela 5.3 do app v2). Geração via `@vercel/og` no servidor — vê seção 7 do `CLAUDE_CODE_SITE.md`.

---

## 7 · Mudança #5 · Command Bar global (Cmd+K)

Captura ultra-rápida + busca de qualquer tarefa, acessível de qualquer página.

```tsx
// components/command-bar.tsx
'use client';

import { Command } from 'cmdk';
import { useEffect, useState } from 'react';

export function CommandBar() {
  const [open, setOpen] = useState(false);
  
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(o => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  
  return (
    <Command.Dialog open={open} onOpenChange={setOpen} className="...">
      <Command.Input placeholder="Buscar ou criar tarefa..." />
      <Command.List>
        <Command.Group heading="CAPTURA RÁPIDA">
          <Command.Item onSelect={() => createTask({ title: query, when: 'hoje' })}>
            <Plus /> Criar "{query}" pra hoje
          </Command.Item>
          <Command.Item>
            <Mic /> Falar uma tarefa
          </Command.Item>
        </Command.Group>
        
        <Command.Group heading="TAREFAS">
          {/* resultados da busca */}
        </Command.Group>
        
        <Command.Group heading="NAVEGAR">
          <Command.Item onSelect={() => router.push('/hoje')}>Ir pra Hoje</Command.Item>
          <Command.Item onSelect={() => router.push('/tarefas')}>Ir pra Tarefas</Command.Item>
          <Command.Item onSelect={() => router.push('/atividade')}>Ir pra Atividade</Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}
```

Use o pacote `cmdk` (Radix-based, mesma stack do shadcn).
Mount no `app/(authed)/layout.tsx` pra ser global.

---

## 8 · Mudança #6 · Notificações in-app

Top-right corner, durante uma sessão, Liriun mostra:

- **Lembretes contextuais**: "Marina te espera em 15 min."
- **Conquistas**: "+1 dia de streak · 13 dias!"
- **Sugestões**: "Você tem 30 min livres. Yoga?"

Use `sonner` (já está no shadcn) **re-skinnado**:

```tsx
// app/(authed)/layout.tsx
import { Toaster } from 'sonner';

<Toaster
  position="top-right"
  toastOptions={{
    className: '!bg-surface-hi !border !border-border-hi !text-fg !rounded-xl !shadow-xl',
    style: { fontFamily: 'var(--liriun-font-sans)' },
  }}
/>
```

E dispare via:

```ts
toast.custom((id) => (
  <LiriunToast
    icon="✨"
    title="Marina te espera em 15 min"
    description="Quer que eu avise que você está a caminho?"
    actions={[
      { label: 'Avisar', onClick: () => notify('marina', 'a-caminho') },
      { label: 'Adiar 10min', onClick: () => snooze(taskId, 10) },
    ]}
  />
));
```

---

## 9 · Mudança #7 · `/configuracoes` · polish

Ajustes pequenos:

- Avatar maior no card de perfil (56→80px) com gradient ring sutil
- Adicionar **Seção "Integração"** entre Idioma e Tema:
  - Google Calendar (conectado/desconectado)
  - Apple Reminders
  - Notion
  - Slack (futuro)
- Idioma com bandeira ao invés de só PT/EN
- Tema: adicionar opção "Auto" como default (sistema)
- Botão "Excluir conta" mais discreto (não vermelho gritante — texto roxo escuro, fundo neutro)

---

## 10 · Mudança #8 · Skeleton states

Toda lista (Tarefas, Atividade recentes, etc) deve ter skeleton durante load. Reutilize o `ShimmerBox`:

```tsx
// components/shimmer-box.tsx
export function ShimmerBox({ width, height }: { width: string | number; height: number }) {
  return (
    <div
      style={{ width, height }}
      className="rounded-md bg-[linear-gradient(90deg,rgba(255,255,255,0.05),rgba(255,255,255,0.10)_50%,rgba(255,255,255,0.05))] bg-[length:200%_100%] animate-[shimmer_1.6s_linear_infinite]"
    />
  );
}

// tailwind.config: keyframes
keyframes: {
  shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
},
```

Use em:
- `/hoje` lista (3-4 rows de skeleton)
- `/tarefas` collections grid (4 cards de skeleton)
- `/atividade` recentes (3 rows)

---

## 11 · Layout · sidebar permanece, mas com polish

Mantenha o sidebar atual, mas:

- **Logo no topo**: clicar volta pra `/hoje` (não `/falar`)
- **Mic FAB flutuante** no canto inferior-direito da main area — sempre visível, atalho rápido sem ir pra `/falar`
- **Profile card no rodapé do sidebar** com avatar maior + status indicator (online/away)
- **Versão colapsável**: clicar no chevron colapsa sidebar pra só ícones (mostrar em viewport < 1200px por default)

---

## 12 · Checklist de entrega

- [ ] `/falar` reescrito com 4 estados (idle, listening, processing, saved)
- [ ] `/hoje` com 3 variantes (morning, midday, evening) + Day Shape
- [ ] `/tarefas` com 4 tabs (Coleções · Lista · Quadro · Semana)
- [ ] `/atividade` com Year Heat + 4 Narrative Insights + Streak Card grande
- [ ] Command Bar global (Cmd+K) com captura
- [ ] Notificações in-app via sonner re-skinnado
- [ ] Skeleton states em todas as listas
- [ ] Mic FAB flutuante na main area (sempre visível)
- [ ] Sidebar colapsável
- [ ] `/configuracoes` polish + seção Integrações

---

## 13 · Anti-patterns

- ❌ Não use os stat cards atuais ("Pendentes 0 · Atrasadas 1 · Concluídas 0"). Eles transmitem ansiedade, não progresso.
- ❌ Não use vermelho gritante em "Atrasadas". Use âmbar suave.
- ❌ Não use ícones Material/Bootstrap. Sempre Phosphor ou Lucide com stroke 1.5.
- ❌ Não use modals padrão do shadcn sem re-skin. Toda transição é cubic-bezier(0.16, 1, 0.3, 1) 360ms.
- ❌ Não polua o sidebar com novos itens. 4 é o máximo (Hoje · Tarefas · Calendário · Insights/Atividade).

---

— Última atualização: maio 2026 · v 1.0
