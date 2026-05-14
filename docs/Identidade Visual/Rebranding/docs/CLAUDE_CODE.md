# Liriun · Manual do Dev Agent

> Documento canônico pra Claude Code (ou qualquer agente dev) construir o app **Liriun** e o site **liriun.com**. Lê este arquivo do topo ao fim antes de escrever uma linha.

---

## 0 · Sobre o produto

**Liriun** é um assistente pessoal de tarefas por voz. O usuário aperta um botão, fala como pensa ("reunião com a Marina amanhã às 9, prioridade alta"), e o agente extrai título, data, pessoas, prioridade e categoria. Tudo sincroniza em tempo real entre iOS, Android e web.

**Posicionamento:** companheiro digital noturno e calmo. Não corporativo, não infantil. Pense Things 3 com toque de IA 2026.

**Princípios não-negociáveis:**
- Dark mode é o estado natural. Light mode é opt-in.
- Voz é primária — toda animação reforça o gesto de falar.
- Espaços generosos, tipografia limpa, gradiente roxo→azul com parcimônia.
- Sem emojis. Sem ícones cheios. Sem cores neon. Sem material design.

---

## 1 · Stack obrigatória

### Site (`liriun.com`)
- **Next.js 15** (App Router · TypeScript)
- **Tailwind CSS** (config dado em `liriun-brand-kit/05-tokens/`)
- **Framer Motion** (sempre com `useReducedMotion`)
- **shadcn/ui** (re-skinnado com nossos tokens)
- **lucide-react** (fallback de ícones quando Phosphor não estiver disponível)
- **next/font** (Geist + Geist Mono, weights 300–800)

### App (mobile)
- **Flutter** (recomendado pra unificar iOS + Android)
- Plataformas alvo: iOS 17+, Android 13+
- Pacotes: `flutter_launcher_icons`, `google_fonts` (Geist), `flutter_animate`

> Se o usuário pedir explicitamente nativo (Swift / Kotlin), respeite — mas TODOS os tokens, durações e easings são plataforma-agnósticos.

---

## 2 · Arquivos que você TEM que ler primeiro

Antes de codar qualquer coisa, abra estes:

| Arquivo | O que contém |
|---|---|
| `liriun-brand-kit/README.md` | Estrutura do brand kit, onde cada asset vai |
| `liriun-brand-kit/05-tokens/tokens.css` | **TODAS as cores, fontes, raios, sombras.** Cole em `app/globals.css` |
| `liriun-brand-kit/05-tokens/shadcn-theme.css` | Variáveis HSL pro shadcn. Cole DEPOIS do tokens.css |
| `liriun-brand-kit/05-tokens/tailwind.config.snippet.js` | Bloco `theme.extend` pronto |
| `liriun-brand-kit/05-tokens/tokens.json` | Versão estruturada (Flutter / Style Dictionary) |
| `liriun-brand-kit/06-fonts.md` | Como instalar Geist em Next.js e Flutter |
| `liriun-site.html` | Mockup completo do site marketing |
| `liriun-motion.html` | Mockup completo das telas do app + biblioteca de animações |

Se algum desses estiver faltando, **pare e peça ao usuário** antes de continuar.

---

## 3 · Setup inicial (site Next.js)

```bash
# 1. Criar projeto
pnpm create next-app@latest liriun-web --typescript --tailwind --app --turbo

# 2. Init shadcn (escolher slate como base — vamos sobrescrever)
cd liriun-web
pnpm dlx shadcn@latest init

# 3. Instalar deps
pnpm add framer-motion clsx tailwind-merge

# 4. Componentes shadcn que vamos precisar
pnpm dlx shadcn@latest add button input sheet dialog switch accordion badge avatar toast separator dropdown-menu
```

### Configuração de tokens

1. **Cole `liriun-brand-kit/05-tokens/tokens.css` no topo de `app/globals.css`**
2. **Cole `liriun-brand-kit/05-tokens/shadcn-theme.css` logo abaixo** (variáveis HSL)
3. **Substitua `tailwind.config.ts`** integrando o snippet de `liriun-brand-kit/05-tokens/tailwind.config.snippet.js`

### Assets que vão pra `public/`

```
public/
├─ favicon.ico                ← liriun-brand-kit/03-favicons/favicon.ico (gerar)
├─ favicon.svg                ← liriun-brand-kit/03-favicons/favicon.svg
├─ favicon-16x16.png          ← idem
├─ favicon-32x32.png          ← idem
├─ apple-touch-icon.png       ← idem
├─ icon-192.png               ← idem
├─ icon-512.png               ← idem
├─ icon-maskable-512.png      ← idem
├─ site.webmanifest           ← idem
├─ og-image.png               ← liriun-brand-kit/04-social/og-image-1200x630.png
└─ twitter-card.png           ← liriun-brand-kit/04-social/twitter-card-1200x600.png
```

### Fontes — `app/layout.tsx`

```tsx
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geist = Geist({
  subsets: ['latin'],
  variable: '--liriun-font-sans',
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--liriun-font-mono',
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://liriun.com'),
  title: {
    default: 'Liriun — Sua próxima tarefa, na voz',
    template: '%s · Liriun',
  },
  description: 'Assistente pessoal de tarefas por voz. Diga, está feito.',
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32' },
      { url: '/favicon-16x16.png', sizes: '16x16' },
    ],
    apple: '/apple-touch-icon.png',
  },
  themeColor: '#0E1014',
  openGraph: {
    title: 'Liriun',
    description: 'Sua próxima tarefa, na voz.',
    url: 'https://liriun.com',
    siteName: 'Liriun',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/twitter-card.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${geist.variable} ${geistMono.variable} dark`} data-theme="dark">
      <body className="font-sans bg-bg text-fg antialiased min-h-dvh">
        {children}
      </body>
    </html>
  );
}
```

---

## 4 · Estrutura do site

```
liriun-web/
├─ app/
│  ├─ layout.tsx            ← font + metadata
│  ├─ page.tsx              ← home (hero, features, how, faq, cta)
│  ├─ globals.css           ← tokens + shadcn theme
│  ├─ precos/
│  │  └─ page.tsx           ← pricing
│  └─ (legal)/
│     ├─ privacidade/page.tsx
│     └─ termos/page.tsx
├─ components/
│  ├─ brand/
│  │  ├─ Logo.tsx           ← <Logo size={28} /> usa SVG inline
│  │  └─ Wordmark.tsx
│  ├─ marketing/
│  │  ├─ Nav.tsx            ← "use client" (sticky on scroll)
│  │  ├─ Hero.tsx           ← "use client" (Framer)
│  │  ├─ FeatureCard.tsx
│  │  ├─ Stats.tsx          ← "use client" (counter animation)
│  │  ├─ HowStep.tsx
│  │  ├─ PriceCard.tsx
│  │  ├─ FaqAccordion.tsx   ← shadcn Accordion re-skinned
│  │  ├─ CtaStrip.tsx
│  │  └─ Footer.tsx
│  ├─ phones/
│  │  ├─ PhoneFrame.tsx     ← bezel + status bar + dynamic island
│  │  └─ MiniScreens.tsx    ← mini-screens pro hero
│  └─ ui/                   ← shadcn re-skinnados
└─ lib/
   ├─ motion.ts             ← easings + durations centralizados
   └─ utils.ts              ← cn() etc.
```

### `lib/motion.ts` — single source of truth pra animation

```ts
// Cubic-bezier curves
export const ease = {
  standard: [0.4, 0, 0.2, 1] as const,
  decel:    [0.25, 0.1, 0.25, 1] as const,
  expo:     [0.16, 1, 0.3, 1] as const,
} as const;

// Duration em ms
export const dur = {
  fast:  0.18,
  base:  0.22,
  slow:  0.36,
  xslow: 0.52,
} as const;

// Variants reutilizáveis pra Framer Motion
export const fadeRise = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: dur.slow, ease: ease.standard },
} as const;

export const stagger = (delay = 0.08) => ({
  initial: 'initial',
  whileInView: 'whileInView',
  viewport: { once: true },
  variants: { whileInView: { transition: { staggerChildren: delay } } },
});
```

### Regra de ouro pra animação

```tsx
'use client';
import { motion, useReducedMotion } from 'framer-motion';
import { ease, dur } from '@/lib/motion';

export function FadeIn({ children, delay = 0 }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: dur.slow, ease: ease.standard, delay }}
    >
      {children}
    </motion.div>
  );
}
```

**Nunca anime sem checar `useReducedMotion`.** Usuários com epilepsia, vestibular issues e iOS "reduce motion" DEVEM ter UX equivalente sem animação.

---

## 5 · Páginas do site · resumo das seções

Reveja `liriun-site.html` pra ver o desenho de cada uma. Cada seção tem um painel de anotação ao lado com instruções específicas.

### 5.1 · Home (`app/page.tsx`)

Composição vertical, RSC:

```tsx
import { Nav } from '@/components/marketing/Nav';
import { Hero } from '@/components/marketing/Hero';
import { Features } from '@/components/marketing/Features';
import { Stats } from '@/components/marketing/Stats';
import { HowItWorks } from '@/components/marketing/HowItWorks';
import { Faq } from '@/components/marketing/Faq';
import { CtaStrip } from '@/components/marketing/CtaStrip';
import { Footer } from '@/components/marketing/Footer';

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Features />
        <Stats />
        <HowItWorks />
        <Faq />
        <CtaStrip />
      </main>
      <Footer />
    </>
  );
}
```

### 5.2 · Hero — Detalhes

- Headline em 2 linhas: "Sua lista de tarefas," + **"conduzida por voz."** em gradient
- Use `bg-brand-grad bg-clip-text text-transparent` na segunda linha
- 2 phones flutuando em ângulos (–4° e +5°) com parallax leve no scroll
- Orb glow atrás dos phones com `lm-orb` (animação registrada em globals)
- CTAs: primário (`Começar grátis`) + secundário (`Ver demo · 1 min`)

### 5.3 · Hero · Phones

Reaproveite `components/phones/MiniScreens.tsx`. Cada mini-screen é uma versão simplificada das telas do app (sem interatividade — só visual).

```tsx
<PhoneFrame width={260} className="-rotate-4">
  <MiniChatScreen />
</PhoneFrame>
```

### 5.4 · Pricing

3 planos: Grátis · **Pro** (destacado) · Team. Toggle mensal/anual opcional usando shadcn `Switch`. Plano Pro com ring violet e badge "Mais popular".

### 5.5 · FAQ

shadcn `Accordion` com `type="single" collapsible`. Primeira item aberto por default. Inclua JSON-LD `FAQPage` em `<Script type="application/ld+json">` pra SEO.

---

## 6 · App mobile · arquitetura

Veja `liriun-motion.html` (5 seções, 18 telas animadas + biblioteca de motion-primitivos).

### Mapa de telas

```
[Cold start]
01 · Splash             → onboarding ou home (auth)
02 · Onboarding 1       → Diga, está feito
03 · Onboarding 2       → Liriun te entende
04 · Onboarding 3       → Em qualquer lugar
05 · Mic permission     → permitir / agora não

[Auth — você precisa adicionar]
06 · Sign in            → Apple · Google · email
07 · Email magic link

[Loop principal]
08 · Home idle          → mic FAB com glow
09 · Listening          → giant pulse + waveform
10 · Processing         → shimmer + entendendo
11 · Saved moment       → confetti + check
12 · Task list          → agrupado por hoje/amanhã/próximos (já desenhado em liriun.html)
13 · Task detail sheet  → idem
14 · Calendar week      → strip + timeline

[Empty/Error]
15 · Skeleton list      → shimmer rows
16 · Empty today        → orbit + check
17 · Empty inbox        → cards empilhados
18 · Search idle        → recentes + chips
19 · Offline            → banner âmbar
20 · Generic error      → você adiciona

[Extras]
21 · Search results     → highlight em violet
22 · Settings           → profile + groups
23 · Achievement        → rosette + confetti
24 · Profile/stats      → você adiciona se necessário
```

### Navegação Flutter

```dart
// Estrutura recomendada com go_router
GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(path: '/', builder: (_, __) => const SplashScreen()),
    GoRoute(path: '/onboarding', builder: (_, __) => const OnboardingFlow()),
    GoRoute(path: '/permission', builder: (_, __) => const MicPermission()),
    GoRoute(path: '/auth', builder: (_, __) => const SignIn()),
    ShellRoute(
      builder: (_, __, child) => MainShell(child: child),
      routes: [
        GoRoute(path: '/home',     builder: (_, __) => const HomeIdle()),
        GoRoute(path: '/calendar', builder: (_, __) => const CalendarWeek()),
        GoRoute(path: '/inbox',    builder: (_, __) => const Inbox()),
        GoRoute(path: '/me',       builder: (_, __) => const Settings()),
      ],
    ),
    GoRoute(path: '/task/:id', builder: ...),
    GoRoute(path: '/search',   builder: ...),
    GoRoute(path: '/voice',    builder: ..., pageBuilder: _voicePage), // sheet
  ],
);

// Voice sheet — modal full-screen com page-rise
Page _voicePage(_, __) => CustomTransitionPage(
  child: const VoiceListening(),
  transitionDuration: const Duration(milliseconds: 360),
  reverseTransitionDuration: const Duration(milliseconds: 220),
  transitionsBuilder: (_, anim, ___, child) {
    final curved = CurvedAnimation(parent: anim, curve: Curves.easeOutCubic);
    return SlideTransition(
      position: Tween(begin: const Offset(0, 1), end: Offset.zero).animate(curved),
      child: child,
    );
  },
);
```

### Bottom tab bar

4 abas: **Tarefas · Calendário · Inbox · Eu**. Mic FAB **flutua** no centro inferior (não é tab) — sempre visível. Tap → abre Voice sheet (transição page-rise).

---

## 7 · Biblioteca de motion · referência rápida

Tudo que você precisa pra reproduzir as animações do mockup.

### 7.1 · Durações canônicas

| Token | Valor | Quando usar |
|---|---|---|
| `fast` | 180 ms | hover, focus ring |
| `base` | 220 ms | button states, chips |
| `slow` | 360 ms | sheet, modal, page rise |
| `xslow`| 520 ms | page transitions, hero entry |

### 7.2 · Easings canônicos

| Token | Curva | Quando usar |
|---|---|---|
| `standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | tudo padrão |
| `decel`    | `cubic-bezier(0.25, 0.1, 0.25, 1)` | sheets subindo, elementos entrando |
| `expo`     | `cubic-bezier(0.16, 1, 0.3, 1)` | hero, celebrações |

### 7.3 · Animações específicas (CSS keyframes)

Os mockups injetam estas keyframes globais. Replique em `app/globals.css`:

```css
@keyframes lm-pulse-ring { 0% { transform: scale(0.85); opacity: 0; } 30% { opacity: 0.6; } 100% { transform: scale(1.8); opacity: 0; } }
@keyframes lm-pulse-scale { 0%,100% { transform: scale(1); } 50% { transform: scale(1.06); } }
@keyframes lm-bar-listen { 0%,100% { transform: scaleY(0.25); } 25% { transform: scaleY(0.85); } 75% { transform: scaleY(1); } }
@keyframes lm-shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
@keyframes lm-rise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
@keyframes lm-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes lm-glow { 0%,100% { box-shadow: 0 0 0 0 rgba(168,139,255,0.4); } 70% { box-shadow: 0 0 0 12px rgba(168,139,255,0); } }
@keyframes lm-spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
@keyframes lm-dot { 0%,80%,100% { opacity: 0.2; transform: scale(0.85); } 40% { opacity: 1; transform: scale(1); } }
@keyframes lm-progress { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
@keyframes lm-confetti-1 { 0% { transform: translate(0,0) rotate(0); opacity: 1; } 100% { transform: translate(-40px,-90px) rotate(180deg); opacity: 0; } }
/* ...lm-confetti-2 a lm-confetti-6 (veja motion/liriun-motion-tokens.jsx) */
```

### 7.4 · Componentes Flutter prontos pra implementar

```dart
// MicFAB — botão de voz com 3 estados (idle, listening, processing)
class MicFAB extends StatefulWidget {
  final MicState state; // .idle | .listening | .processing
  final VoidCallback onTap;
  // ...
}

// Idle: glow ring pulsa 2.4s (BoxShadow animado)
// Listening: 3 rings concentric (CustomPainter) + scale loop 1.2s
// Processing: shimmer linear gradient passando

// WaveformBars — 32 barras animadas em real time
class WaveformBars extends StatefulWidget {
  final List<double> levels; // 0-1 de cada barra
  // ...
}
// Use TweenAnimationBuilder pra interpolar suave (200ms)
// Cor: T.violet400 com opacity 0.85

// ShimmerSkeleton — wrap de qualquer Widget
class ShimmerSkeleton extends StatelessWidget {
  final Widget child;
  final bool isLoading;
  // ...
}
// Gradient horizontal -200% → 200% · 1.8s linear infinite
// Cor: violet400 a 10% sobre fundo surface

// ConfettiBurst — pra success moments
// Use o pacote `confetti` (Flutter) configurado com nossas 6 cores
// Trigger: ConfettiController.play() · duration 1.8s
```

---

## 8 · Componentes shadcn re-skinnados

shadcn dá os primitivos; você troca os **Variants** pra usar nossos tokens. Não mude o nome do componente — só o look.

### Exemplo · `components/ui/button.tsx` (re-skinnado)

```tsx
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md font-medium tracking-tight ' +
  'transition-[transform,background,box-shadow] duration-base ease-standard ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/40 ' +
  'disabled:opacity-40 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-brand-grad text-white shadow-glow ' +
                 'hover:-translate-y-[1px] hover:shadow-[0_10px_28px_rgba(91,141,239,0.45),inset_0_1px_0_rgba(255,255,255,0.25)] ' +
                 'active:translate-y-[1px] active:bg-[linear-gradient(135deg,#7C5DE8,#3F71D9)]',
        secondary: 'bg-white/5 text-fg border border-border-hi hover:bg-white/8',
        ghost: 'text-fg-muted hover:bg-white/5 hover:text-fg',
        destructive: 'bg-danger/10 text-[#FFB1BC] border border-danger/28 hover:bg-danger/16',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        default: 'h-11 px-4 text-sm',
        lg: 'h-12 px-5 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, loading, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp ref={ref} className={cn(buttonVariants({ variant, size, className }))} disabled={loading || props.disabled} {...props}>
        {loading ? <SpinnerRing /> : children}
      </Comp>
    );
  }
);
```

### Mapping shadcn → Liriun

| shadcn primitive | Usado em | Notas |
|---|---|---|
| `Button` | tudo | acima |
| `Input` | search, forms | bg `surface/low` · border `border-hi` · focus ring `violet-400/40` |
| `Sheet` | task detail | rise 360ms decel · radius top 28px · backdrop blur 40px |
| `Dialog` | confirm delete | radius 24px · max-w-md |
| `Accordion` | FAQ | chevron rotates 180° · height auto via Framer |
| `Switch` | settings | bg `brand-grad` quando on · shadow-glow |
| `Toast` | feedback | use `sonner` se preferir · richColors=true |
| `Avatar` | profile | bg gradient com initials |
| `Badge` | "Pro", "Pendente" | mono font · letter-spacing wide · uppercase |
| `Separator` | divider | bg `border` |
| `Tooltip` | hover help | dark glass · text-sm |

---

## 9 · Acessibilidade · obrigatório

- **Contraste:** todo texto deve ter contraste AA mínimo. Use `fg-muted` ao invés de `fg-faint` em texto descritivo.
- **Toque:** alvos mínimos 44×44 px (mobile). Mic FAB tem 64 px, tabs têm 44 px.
- **Foco visível:** sempre. `focus-visible:ring-2 ring-violet-400/40 ring-offset-2 ring-offset-bg`.
- **VoiceOver/TalkBack:** todos os ícones-only devem ter `aria-label`. Toggle states devem ser anunciados.
- **Reduced motion:** TODA animação respeita `useReducedMotion()`. Anime opacidade só, ou desligue.
- **Permissões:** sempre justifique ANTES de pedir. Veja tela 1.5 do `liriun-motion.html`.

---

## 10 · Performance · obrigatório

### Site
- **Imagens:** `next/image` sempre. `priority` só no hero (1 imagem).
- **Fontes:** `next/font` com subsets latinos. `display: swap`. **Nunca** `@import url(...)`.
- **Animações:** GPU-only — `transform`, `opacity`, `filter`. Nunca `width`/`height`/`top`/`left`.
- **3rd-party:** load via `<Script strategy="afterInteractive">` ou `lazyOnload`.
- **Lighthouse target:** 95+ em Performance, Accessibility, SEO.

### App
- **Imagens:** asset bundles otimizados (use `flutter_image_compress` no build).
- **Lazy lists:** `ListView.builder` sempre, nunca `ListView()` para >10 itens.
- **Frame budget:** 16 ms (60fps). Em telas com confetti, considere 8 ms (120fps em Pro Motion).

---

## 11 · O que NÃO fazer

### Cores
- ❌ Não use `#hex` direto no JSX. Sempre `bg-violet-500`, `text-fg`, etc.
- ❌ Não invente cores. Tudo está em `tokens.css`.
- ❌ Não use vermelho saturado, verde-limão, magenta neon.

### Tipografia
- ❌ Não use outra fonte que não Geist / Geist Mono.
- ❌ Não use `font-light` (300) em corpo de texto — só em hero displays.
- ❌ Não use `text-align: justify`. Nunca.

### Layout
- ❌ Não use margens negativas. Use `gap`.
- ❌ Não use `<br>` pra espaçamento. Use padding.
- ❌ Não use ícones com fill colorido. Só stroke 1.5–1.6 px.

### Animação
- ❌ Não anime `box-shadow` ou `filter: blur()` (custo de GPU alto).
- ❌ Não use `linear` em transitions. Use `ease.standard` ou `ease.decel`.
- ❌ Não faça animação > 600 ms. Se precisar, é loop.

### UX
- ❌ Não bloqueie a UI durante sync (sem loading screens cheias). Use skeletons.
- ❌ Não use emojis em UI institucional.
- ❌ Não use `alert()`. Use `Toast` ou `Dialog`.

---

## 12 · Checklist de entrega

Antes de marcar uma tela como pronta, verifique:

- [ ] Tokens consumidos via classes Tailwind ou CSS vars — sem `#hex` solto
- [ ] Modo dark default
- [ ] Toda animação tem fallback pra reduced-motion
- [ ] Ícones com `aria-label` quando icon-only
- [ ] Focus visível em todos os elementos interativos
- [ ] Mobile: alvos 44×44 px mínimo
- [ ] Sem `console.log` no código entregue
- [ ] Sem `TODO` sem dono
- [ ] Mockup visual bate com `liriun-motion.html` ou `liriun-site.html`

---

## 13 · Quando duvidar

- Olha o mockup em `liriun-motion.html` ou `liriun-site.html` primeiro.
- Se não tiver mockup, **invente respeitando o sistema**. Token-first, calmo, espaçoso.
- Se a decisão for grande (ex: adicionar uma página nova), **pare e pergunte**.
- Nunca use uma biblioteca de UI que não esteja listada em §1.

---

## 14 · Tarefas iniciais sugeridas

Pra Claude Code começar do zero, pega na ordem:

1. **Setup do projeto Next.js + Tailwind + shadcn + Framer Motion** (§3)
2. **Copy assets do brand kit pro `public/`** (§3)
3. **Implementar `<Logo />` e `<Wordmark />`** (§4)
4. **Implementar Nav + Hero** baseado em `liriun-site.html`
5. **Implementar Features + Stats** com counter animation
6. **Implementar FAQ + CtaStrip + Footer**
7. **Página de Pricing** (`/precos`)
8. **Páginas legais** (privacidade, termos) — usar markdown convertido
9. **Otimizar imagens, Lighthouse, OG, manifest**
10. **Deploy preview (Vercel)** com domínio `staging.liriun.com`

Pra o app Flutter:

1. **Setup do projeto Flutter** com `flutter_launcher_icons` apontando pro brand kit
2. **Tema dark com tokens.json** importado
3. **Splash + Onboarding** (telas 1.1 a 1.4 do `liriun-motion.html`)
4. **Mic permission** (1.5)
5. **Auth scaffold** (Apple/Google)
6. **MainShell** com tab bar + Mic FAB
7. **Home idle + Listening + Processing + Saved** (loop completo)
8. **Task list + Task detail sheet**
9. **Empty states + Skeleton + Offline**
10. **Settings + Profile**

---

## 15 · Glossário de tokens (mais usados)

```
bg            #07080B     fundo da página
surface       #0E1014     cards, painéis
surface-hi    #14161C     elevado, hover
border        rgba(255,255,255,0.06)
border-hi     rgba(255,255,255,0.10)

fg            rgba(244,246,252,0.96)   texto principal
fg-muted      rgba(244,246,252,0.65)   texto secundário
fg-faint      rgba(244,246,252,0.42)   labels mono
fg-dim        rgba(244,246,252,0.28)   dividers, hint

violet-400    #A88BFF                  início do gradient
violet-500    #9C7BFF                  cor primária sólida
violet-600    #7C7DF6                  meio do gradient
violet-700    #5B8DEF                  fim do gradient (azul)

brand-grad    linear-gradient(135deg, #A88BFF 0%, #7C7DF6 55%, #5B8DEF 100%)

success       #4ADE80
warning       #FBBF24
danger        #F87171
info          #5B8DEF

font-sans     'Geist', system-ui, ...
font-mono     'Geist Mono', ui-monospace, ...

radius-md     14px   buttons, inputs
radius-lg     18px   cards
radius-xl     22px   prominent cards
radius-2xl    28px   sheets, CTA strips

shadow-glow   0 6px 18px rgba(91,141,239,0.32)   primary button
shadow-md     0 4px 16px rgba(0,0,0,0.30)        elev/2
shadow-lg     0 12px 32px rgba(0,0,0,0.45)       elev/3
```

---

## 16 · Contato e ownership

Este documento é canônico. Se algo aqui contradisser o mockup, **priorize o mockup** e abra uma issue.

— Última atualização: maio 2026 · v 1.0
