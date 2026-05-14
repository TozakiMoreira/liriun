# Liriun Site · Guia de Refatoração

> Como melhorar o site **liriun.com** existente (Next.js 15 + Tailwind + Framer Motion + shadcn/ui) com base no app v2. Leia também `liriun-app-v2.html` §6 (recomendações) lado a lado.

---

## 0 · Contexto

Você já tem um site funcionando. O objetivo deste documento é **evoluí-lo**, não recriar. Cada melhoria abaixo é uma issue/PR autocontida.

**Pré-requisitos:**
1. `liriun-brand-kit/05-tokens/tokens.css` já está em `app/globals.css`
2. Tailwind config já tem o snippet aplicado
3. Geist via `next/font` já configurado

Se algum desses não estiver pronto, faça primeiro — está em `CLAUDE_CODE.md`.

---

## 1 · Ordem de prioridade

Faça nesta ordem. Cada uma é entregável independente:

| # | Mudança | Impacto | Esforço | Prioridade |
|---|---|---|---|---|
| 1 | Hero: trocar 2 phones estáticos por carrossel animado (Today + Voice + Insights) | Alto | 4h | 🔴 |
| 2 | Adicionar "O dia" section (3 imagens narrativas) | Alto | 3h | 🔴 |
| 3 | Voice demo interativa (Web Speech API) | Alto | 6h | 🔴 |
| 4 | "Como Liriun aprende" — seção de insights | Médio | 4h | 🟡 |
| 5 | Trocar trust strip fake por reviews reais | Médio | 2h | 🟡 |
| 6 | OG image dinâmica `/streak/[user]` | Médio | 3h | 🟡 |
| 7 | Polish microinterações (hover lift, scroll reveals) | Médio | 4h | 🟡 |
| 8 | Páginas `/comparar/[competitor]` (SEO) | Médio | 6h | 🟢 |
| 9 | Footer com Today widget em loop | Baixo | 2h | 🟢 |

---

## 2 · Mudança #1 · Hero animado

### Antes
Dois iPhones rotacionados com mini-screens estáticos (chat + lista).

### Depois
Hero direito vira um **stack de phones com loop automático**: a cada 4 segundos, troca a tela mostrada. 3 estados em loop:

1. **Voice** (`ScreenVoiceListening` do app-v2) — mic pulsando + waveform
2. **Today morning** (`ScreenTodayMorning`) — day shape + Liriun sugere
3. **Insights** (`ScreenInsights`) — year heat + streak

### Implementação

**Componente novo:** `components/marketing/HeroPhoneCarousel.tsx`

```tsx
'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { VoiceScreen, TodayScreen, InsightsScreen } from './hero-mini-screens';
import { PhoneFrame } from '@/components/phones/PhoneFrame';

const SCREENS = [
  { id: 'voice',    component: VoiceScreen,    label: 'Capture por voz' },
  { id: 'today',    component: TodayScreen,    label: 'Seu dia' },
  { id: 'insights', component: InsightsScreen, label: 'Liriun aprende' },
];

export function HeroPhoneCarousel() {
  const [idx, setIdx] = useState(0);
  const reduce = useReducedMotion();
  
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setIdx(i => (i + 1) % SCREENS.length), 4000);
    return () => clearInterval(t);
  }, [reduce]);
  
  const Current = SCREENS[idx].component;
  
  return (
    <div className="relative h-[580px] flex items-center justify-center">
      {/* Orb glow */}
      <div className="absolute w-[480px] h-[480px] rounded-full bg-violet-500/40 blur-3xl" />
      
      {/* Phones */}
      <div className="relative">
        <PhoneFrame className="-rotate-[4deg] -translate-x-4" width={260}>
          <AnimatePresence mode="wait">
            <motion.div
              key={SCREENS[idx].id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.52, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0"
            >
              <Current />
            </motion.div>
          </AnimatePresence>
        </PhoneFrame>
        
        {/* Indicator dots */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-2">
          {SCREENS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setIdx(i)}
              className={cn(
                'h-1.5 rounded-full transition-all',
                i === idx ? 'w-8 bg-brand-grad' : 'w-1.5 bg-white/20'
              )}
              aria-label={s.label}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
```

**Mini-screens:** componente simplificado de cada uma das 3 telas. Pode ser baseado nas implementações de `app-v2/screens-today.jsx`, `screens-voice.jsx`, `screens-calendar-insights.jsx`.

---

## 3 · Mudança #2 · Seção "O dia"

### Adicionar entre Hero e Features

```tsx
// components/marketing/DayStory.tsx
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const moments = [
  { time: 'MANHÃ',    title: 'Você acorda com clareza.',     img: '/screenshots/today-morning.png',  desc: 'Liriun mostra o dia inteiro de uma vez. Sugere o que importa agora.' },
  { time: 'MEIO-DIA', title: 'Mantém o ritmo.',              img: '/screenshots/today-midday.png',   desc: 'Progress ring + sugestão contextual baseada no que ainda falta.' },
  { time: 'NOITE',    title: 'Reflete, sem culpa.',          img: '/screenshots/today-evening.png',  desc: 'O dia em uma stamp visual. O que ficou pra depois é tratado com gentileza.' },
];

export function DayStory() {
  return (
    <section className="py-24 px-14 max-w-[1280px] mx-auto">
      <div className="mb-16">
        <div className="font-mono text-xs text-violet-300 uppercase tracking-widest mb-4">O DIA</div>
        <h2 className="text-5xl font-semibold tracking-tight leading-[1.1]">
          Liriun te acompanha<br />
          <span className="bg-brand-grad bg-clip-text text-transparent">do nascer ao pôr do sol.</span>
        </h2>
      </div>
      
      <div className="grid grid-cols-3 gap-8">
        {moments.map((m, i) => (
          <motion.div
            key={m.time}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.52, ease: [0.16, 1, 0.3, 1], delay: i * 0.12 }}
          >
            {/* Phone screenshot */}
            <div className="relative aspect-[9/16] rounded-[28px] overflow-hidden bg-surface border border-border-hi shadow-xl mb-6">
              <Image src={m.img} alt={m.title} fill className="object-cover" />
            </div>
            
            <div className="font-mono text-xs text-violet-300 uppercase tracking-wider mb-2">{m.time}</div>
            <h3 className="text-xl font-semibold tracking-tight mb-3">{m.title}</h3>
            <p className="text-sm text-fg-muted leading-relaxed">{m.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
```

**Assets necessários:**
- `public/screenshots/today-morning.png` (~ 540×960, 9:16)
- `public/screenshots/today-midday.png`
- `public/screenshots/today-evening.png`

Gere essas screenshots a partir das telas do `liriun-app-v2.html` (use o Chrome DevTools com device mode 540×960).

---

## 4 · Mudança #3 · Voice Demo Interativa

### Adicionar entre Features e Stats

Botão "Tente falar" que usa Web Speech API + extração simulada (sem backend) pra mostrar a magia em 5 segundos.

```tsx
// components/marketing/VoiceDemo.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type State = 'idle' | 'listening' | 'processing' | 'result';

export function VoiceDemo() {
  const [state, setState] = useState<State>('idle');
  const [transcript, setTranscript] = useState('');
  const [extracted, setExtracted] = useState<any>(null);
  
  const start = async () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      // fallback: rodar versão "scripted" com transcript hardcoded
      runScripted();
      return;
    }
    
    setState('listening');
    setTranscript('');
    
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
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
      // mock extraction (em prod, chamar API)
      await new Promise(r => setTimeout(r, 1200));
      setExtracted(mockExtract(transcript));
      setState('result');
    };
    
    recog.start();
  };
  
  return (
    <section className="py-24 px-14 max-w-[1280px] mx-auto">
      <div className="text-center mb-12">
        <div className="font-mono text-xs text-violet-300 uppercase tracking-widest mb-4">EXPERIMENTE</div>
        <h2 className="text-5xl font-semibold tracking-tight leading-[1.1]">
          Fala como você pensa.
        </h2>
        <p className="text-fg-muted mt-4 max-w-md mx-auto">
          Tente: "Reunião com o cliente amanhã às 14h, prioridade alta"
        </p>
      </div>
      
      {/* Demo surface */}
      <div className="max-w-2xl mx-auto rounded-[28px] bg-surface border border-border-hi p-12 relative overflow-hidden">
        {/* glow */}
        <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_50%,rgba(168,139,255,0.12),transparent)]" />
        
        <AnimatePresence mode="wait">
          {state === 'idle' && <IdleView onStart={start} key="idle" />}
          {state === 'listening' && <ListeningView transcript={transcript} key="listening" />}
          {state === 'processing' && <ProcessingView key="processing" />}
          {state === 'result' && <ResultView data={extracted} onReset={() => setState('idle')} key="result" />}
        </AnimatePresence>
      </div>
    </section>
  );
}

function mockExtract(transcript: string) {
  // Heurística simples baseada em padrões PT-BR
  // (em prod, chama um endpoint /api/extract)
  return {
    title: extractTitle(transcript),
    when: extractWhen(transcript),
    priority: extractPriority(transcript),
    category: detectCategory(transcript),
  };
}
```

**Estados visuais** (cada um inspirado nas telas 2.1, 2.2, 2.3 do v2):
- **Idle**: mic grande pulsando + texto "Aperte e fale"
- **Listening**: rings + waveform + transcript ao vivo
- **Processing**: shimmer + "Entendendo..."
- **Result**: card extraído + botão "Tentar de novo"

---

## 5 · Mudança #4 · "Como Liriun aprende"

### Adicionar depois de Features ou no lugar do "Como funciona"

Conceito: 3 cards de insight estilo o app, mas pra venda. Mostra que Liriun é IA pessoal, não só um app de tarefa.

```tsx
// components/marketing/LearningInsights.tsx
const insights = [
  { icon: '◷', title: 'Aprende seus horários', desc: 'Sabe quando você é mais produtivo, e prioriza tarefas pesadas no seu pico do dia.' },
  { icon: '☾', title: 'Entende seu vocabulário', desc: '"Marina" automaticamente vira contato. "Acme" vira projeto. "Almoço com mãe" vira pessoal.' },
  { icon: '↗', title: 'Te conhece com o tempo', desc: 'Depois de 30 dias, Liriun antecipa lembretes no contexto certo, sem você pedir.' },
];

// renderiza como grid 3-col com gradient sutil em cada card
```

---

## 6 · Mudança #5 · Trust strip real

### Antes
"Acme · NORTH/STAR · verve · Lumen · canopy" — claramente fake.

### Depois
Reviews reais formatados como cards horizontais. Adicione um carrossel horizontal scroll com:

```tsx
const reviews = [
  { source: 'App Store', score: '★★★★★', text: 'O app mais bem-pensado de produtividade desde Things 3.', author: '@designerana' },
  { source: 'ProductHunt', score: '#1 of the day', text: 'Finalmente uma IA de tarefas que entende português direito.', author: 'João Carvalho' },
  // ...
];
```

Se ainda não tem reviews reais, **remova a seção temporariamente**. Melhor não-ter do que parecer falso.

---

## 7 · Mudança #6 · OG image dinâmica de streak

### Nova rota: `app/streak/[user]/page.tsx` + `app/api/og/streak/[user]/route.tsx`

Usuário compartilha link `liriun.com/streak/lucas123` → link gera card lindo automaticamente com:
- Streak number (gradient)
- Username
- Mini stats (tarefas, foco, dia favorito)
- Mark da marca + tagline

```tsx
// app/api/og/streak/[user]/route.tsx
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(req: Request, { params }: { params: { user: string } }) {
  // Buscar dados do user (Redis/DB)
  const data = await fetchStreakData(params.user);
  
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%',
        background: 'linear-gradient(135deg, #1a1429 0%, #0E1014 60%, #0a0d18 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        fontFamily: 'Geist',
        position: 'relative',
      }}>
        {/* Number */}
        <div style={{ fontSize: 280, fontWeight: 700, background: 'linear-gradient(135deg, #A88BFF, #5B8DEF)', backgroundClip: 'text', color: 'transparent' }}>
          {data.streak}
        </div>
        <div style={{ fontSize: 32, color: 'rgba(255,255,255,0.62)', marginTop: -20 }}>dias seguidos</div>
        
        {/* Stats row */}
        <div style={{ display: 'flex', gap: 60, marginTop: 80 }}>
          <Stat n={data.totalTasks} l="TAREFAS" />
          <Stat n={`${data.focusPct}%`} l="FOCO" />
          <Stat n={data.bestDay} l="MELHOR DIA" />
        </div>
        
        {/* Mark + tagline */}
        <div style={{ position: 'absolute', bottom: 40, ... }}>
          <Mark /> Liriun · liriun.com
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

E na página `/streak/[user]/page.tsx`:

```tsx
export async function generateMetadata({ params }) {
  return {
    title: `${params.user} tem ${data.streak} dias de constância no Liriun`,
    openGraph: {
      images: [`/api/og/streak/${params.user}`],
    },
    twitter: { card: 'summary_large_image', images: [`/api/og/streak/${params.user}`] },
  };
}
```

---

## 8 · Mudança #7 · Polish geral de microinterações

Audit e fix em **todas as páginas**:

### a. Hover lift em cards
```tsx
<motion.div
  whileHover={{ y: -2 }}
  transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
  className="rounded-2xl bg-surface border border-border-hi"
>
```

### b. Scroll reveal em sections
Adicione `<FadeIn>` wrapper em cada section header e cada card:

```tsx
// components/marketing/FadeIn.tsx (já deve existir)
export function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.52, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
```

### c. Button states (verifique todos)
- Hover: `translateY(-1px)` + shadow cresce
- Pressed: `translateY(+1px)` + gradient escurece
- Loading: spinner inline
- Disabled: opacity 0.4 + pointer-events none

### d. Focus visível em TODOS interativos
```css
/* globals.css */
*:focus-visible {
  outline: none;
  box-shadow: 0 0 0 4px rgba(168,139,255,0.32);
  border-radius: inherit;
}
```

---

## 9 · Mudança #8 · Páginas de comparação (SEO)

### Estrutura

```
app/
└─ comparar/
   ├─ things-3/page.tsx
   ├─ todoist/page.tsx
   ├─ notion/page.tsx
   └─ apple-reminders/page.tsx
```

### Template (`components/marketing/CompareTable.tsx`)

```tsx
<CompareTable
  competitor={{
    name: 'Things 3',
    pros: ['Design icônico', 'Velocidade nativa Apple'],
    cons: ['Só iOS/macOS', 'Sem voz', 'Sem IA'],
  }}
  liriun={{
    pros: ['iOS · Android · Web', 'Captura por voz', 'IA que aprende seu padrão'],
    cons: ['Mais novo (beta)'],
  }}
  features={[
    { name: 'Captura por voz', liriun: true, competitor: false },
    { name: 'IA pra extração', liriun: true, competitor: false },
    { name: 'Sync multi-plataforma', liriun: true, competitor: false },
    { name: 'Categorias inteligentes', liriun: true, competitor: 'manual' },
    { name: 'Preço mensal', liriun: 'R$19', competitor: 'pago único' },
  ]}
/>
```

**Tom:** sempre respeitoso com competidor. "Things 3 é incrível pra quem só usa Apple. Liriun é pra quem vive entre dispositivos."

---

## 10 · Mudança #9 · Footer com Today widget

No footer atual, adicione embed do widget Today (versão mini, em loop). Sutil, contextual.

```tsx
// components/marketing/FooterWidget.tsx
'use client';

import { motion } from 'framer-motion';

export function FooterWidget() {
  return (
    <div className="rounded-2xl bg-white/[0.025] border border-border p-5 max-w-sm">
      <div className="font-mono text-[10px] text-fg-faint tracking-widest mb-3">EXEMPLO · SEU DIA</div>
      
      <div className="space-y-2">
        {[
          { time: '09:00', task: 'Daily standup',         done: true,  cat: 'work' },
          { time: '13:00', task: 'Reunião com Marina',    done: false, cat: 'work',   current: true },
          { time: '17:30', task: 'Buscar Lucas Jr',       done: false, cat: 'person' },
        ].map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-3"
          >
            <div className={cn('w-3 h-3 rounded-full',
              t.done ? 'bg-violet-500' : t.current ? 'bg-success animate-pulse' : 'border border-border-hi'
            )} />
            <span className={cn('text-sm', t.done && 'line-through text-fg-faint', !t.done && 'text-fg')}>
              {t.task}
            </span>
            <span className="font-mono text-[10px] text-fg-faint ml-auto">{t.time}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
```

---

## 11 · Checklist final pré-deploy

- [ ] Lighthouse 95+ em Performance, Accessibility, SEO
- [ ] Open Graph testado no Twitter Card Validator + LinkedIn Inspector
- [ ] `/sitemap.xml` e `/robots.txt` atualizados (incluir páginas `/comparar/*` e `/streak/*`)
- [ ] OG image `/api/og/streak/[user]` cacheada (revalidate: 3600)
- [ ] Voice demo testado em Safari iOS (Web Speech API tem comportamento diferente)
- [ ] Reduced motion testado: `System Preferences → Accessibility → Reduce Motion`
- [ ] Dark/light mode (se light estiver ligado) testado
- [ ] Páginas legais (Termos, Privacidade) atualizadas com mention de IA + voz

---

## 12 · Onde NÃO mexer

- ❌ **Não troque a paleta.** Tokens já estão consagrados.
- ❌ **Não adicione mais cores semânticas** sem alinhar comigo.
- ❌ **Não use shadcn/ui sem re-skin** — sempre usar nossos tokens, nunca defaults.
- ❌ **Não importe outra font.** Geist é a única.
- ❌ **Não copie imagens de outros sites.** Use screenshots reais do app.

---

— Última atualização: maio 2026 · v 1.0
