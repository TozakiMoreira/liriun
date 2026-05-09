# Liriun · Brand Kit

> **Liriun** — assistente pessoal de tarefas por voz. Identidade dark-first, cápsula roxo→azul, tipografia geométrica.

Este kit é a **fonte da verdade visual** do produto. Use os arquivos aqui em qualquer canal: app mobile (Flutter), site web (Next.js 15 + Tailwind + Framer Motion + shadcn/ui), App Store, Play Store, redes sociais e qualquer comunicação de marca.

---

## 📁 Estrutura do kit

```
liriun-brand-kit/
├─ README.md                       ← este arquivo
├─ 01-logo/                        ← marca em todas as variações vetoriais
├─ 02-app-icons/                   ← ícones para lojas e dispositivos
│   ├─ ios/                        ← iOS / iPadOS / macOS
│   └─ android/                    ← Android (incl. adaptive icon)
├─ 03-favicons/                    ← web (favicon, apple-touch, manifest)
├─ 04-social/                      ← OG, avatares, banners, posts
├─ 05-tokens/                      ← cores, tipografia, sombras (CSS, JSON, Tailwind)
└─ 06-fonts.md                     ← como instalar e licenciar a tipografia
```

---

## 🎯 Conceito da marca

| Atributo  | Valor                                                          |
|-----------|----------------------------------------------------------------|
| Nome      | **Liriun**                                                     |
| Tagline   | *Sua próxima tarefa, na voz*                                   |
| Voz       | Calma · direta · pessoal                                       |
| Símbolo   | Waveform de cinco barras + ponto-acento (microfone falando)    |
| Forma     | Squircle Apple HIG (continuous corner ≈ 22,4 % do lado)        |
| Gradiente | `#A88BFF → #7C7DF6 → #5B8DEF` a 135° (lavanda → índigo → azul) |

**Por que squircle e não círculo?** O squircle é o container nativo de ícones em iOS 17+ e a Apple-HIG-recommended shape. Renderiza igual em iPhone, iPad, macOS e ícones de pasta no iCloud. Em Android, a forma é mascarada automaticamente pelo launcher (adaptive icon — temos foreground + background separados na pasta `02-app-icons/android/`).

---

## 1️⃣ `01-logo/` — Marca

| Arquivo                              | Quando usar                                              |
|--------------------------------------|----------------------------------------------------------|
| `liriun-icon.svg`                    | **Master**. Squircle gradiente. Use sempre que possível. |
| `liriun-icon-mono-white.svg`         | Sobre fundo escuro sólido (preto, marinho, etc).         |
| `liriun-icon-mono-black.svg`         | Impressão monocromática · documentos · faxes.            |
| `liriun-glyph.svg`                   | Só as cinco barras (sem squircle). Inline em texto.      |
| `liriun-wordmark.svg`                | Texto "Liriun" tipograficamente travado.                 |
| `liriun-lockup-horizontal.svg`       | Ícone + wordmark lado a lado. Cabeçalhos largos.         |
| `liriun-lockup-vertical.svg`         | Ícone empilhado em cima do wordmark. Avatares.           |

**Regra de ouro:** o ícone master é vetorial e escala de 16 px até 4096 px sem perda. Prefira sempre o SVG. Use os PNGs apenas onde a plataforma exigir raster (App Store, Play Store, OG image).

**Espaço de proteção:** mínimo `0.25 × altura do ícone` em todos os lados. Não amasse texto contra a borda do squircle.

---

## 2️⃣ `02-app-icons/` — Lojas e dispositivos

### iOS / Flutter (iOS build)

Adicione todos os PNGs em `ios/Runner/Assets.xcassets/AppIcon.appiconset/`. O `Contents.json` do Xcode mapeia os tamanhos.

| Arquivo               | Tamanho   | Onde aparece                                            |
|-----------------------|-----------|---------------------------------------------------------|
| `icon-1024.png`       | 1024×1024 | App Store Connect (marketing icon)                      |
| `icon-180.png`        | 180×180   | iPhone @3x (home screen)                                |
| `icon-167.png`        | 167×167   | iPad Pro                                                |
| `icon-152.png`        | 152×152   | iPad / iPad mini                                        |
| `icon-120.png`        | 120×120   | iPhone @2x                                              |
| `icon-87.png`         | 87×87     | iPhone Settings @3x                                     |
| `icon-80.png`         | 80×80     | iPhone Spotlight @2x                                    |
| `icon-76.png`         | 76×76     | iPad legacy                                             |
| `icon-60.png`         | 60×60     | iPhone Notification @3x                                 |
| `icon-58.png`         | 58×58     | iPhone Settings @2x                                     |
| `icon-40.png`         | 40×40     | iPad Spotlight @1x                                      |
| `icon-29.png`         | 29×29     | iPhone Settings @1x                                     |
| `icon-20.png`         | 20×20     | iPhone Notification @1x                                 |

> **Flutter:** o jeito mais rápido é rodar [`flutter_launcher_icons`](https://pub.dev/packages/flutter_launcher_icons) apontando para `liriun-icon.svg` — ele gera tudo isso automaticamente.

### Android / Flutter (Android build)

Adicione em `android/app/src/main/res/`. Use o **adaptive icon** (Android 8+):

| Arquivo                          | Tamanho   | Onde vai                                                  |
|----------------------------------|-----------|-----------------------------------------------------------|
| `icon-512.png`                   | 512×512   | Google Play Store (high-res icon)                         |
| `icon-192.png`                   | 192×192   | `mipmap-xxxhdpi/ic_launcher.png`                          |
| `icon-144.png`                   | 144×144   | `mipmap-xxhdpi/ic_launcher.png`                           |
| `icon-96.png`                    | 96×96     | `mipmap-xhdpi/ic_launcher.png`                            |
| `icon-72.png`                    | 72×72     | `mipmap-hdpi/ic_launcher.png`                             |
| `icon-48.png`                    | 48×48     | `mipmap-mdpi/ic_launcher.png`                             |
| `adaptive-foreground.png`        | 432×432   | `mipmap-anydpi-v26/ic_launcher_foreground.png`            |
| `adaptive-background.png`        | 432×432   | `mipmap-anydpi-v26/ic_launcher_background.png`            |
| `monochrome.png`                 | 432×432   | `mipmap-anydpi-v26/ic_launcher_monochrome.png` (Android 13+ themed icons) |

> **Adaptive icon:** Android corta foreground+background com a máscara que o launcher do usuário escolheu (círculo, squircle, teardrop, etc). É por isso que o **foreground** tem padding generoso (≈ 25 % de cada lado) — para o glifo nunca ser cortado.

---

## 3️⃣ `03-favicons/` — Web (Next.js 15)

Cole os arquivos em `apps/web/public/`:

```
public/
├─ favicon.ico              ← legado (IE, alguns RSS readers)
├─ favicon.svg              ← moderno (vetorial, dark/light auto)
├─ favicon-16x16.png        ← fallback PNG pequeno
├─ favicon-32x32.png        ← fallback PNG médio
├─ apple-touch-icon.png     ← 180×180 — iOS Safari "Adicionar à tela inicial"
├─ icon-192.png             ← PWA (Android Chrome)
├─ icon-512.png             ← PWA (splash + Play Store via Trusted Web Activity)
└─ site.webmanifest         ← manifesto PWA
```

### Em `app/layout.tsx`

```tsx
export const metadata: Metadata = {
  title: 'Liriun — Sua próxima tarefa, na voz',
  description: 'Assistente pessoal de tarefas por voz.',
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  themeColor: '#0E1014',
};
```

> O Next.js 15 também aceita o **convention-based** (basta soltar `app/icon.png`, `app/apple-icon.png`, `app/favicon.ico` na raiz do `app/` e ele gera as `<link>` tags sozinho). Use o que for mais limpo no seu projeto.

---

## 4️⃣ `04-social/` — Redes sociais e compartilhamento

| Arquivo                              | Tamanho     | Plataforma                                                  |
|--------------------------------------|-------------|-------------------------------------------------------------|
| `og-image-1200x630.png`              | 1200×630    | Open Graph (Facebook · LinkedIn · iMessage · Slack preview) |
| `twitter-card-1200x600.png`          | 1200×600    | Twitter/X summary_large_image                               |
| `avatar-1024.png`                    | 1024×1024   | Foto de perfil — Twitter/X · LinkedIn · Instagram · YouTube |
| `instagram-post-1080.png`            | 1080×1080   | Post quadrado Instagram · LinkedIn                          |
| `instagram-story-1080x1920.png`      | 1080×1920   | Story Instagram · TikTok · Reels · Shorts                   |
| `twitter-header-1500x500.png`        | 1500×500    | Capa Twitter/X                                              |
| `linkedin-banner-1584x396.png`       | 1584×396    | Banner pessoal LinkedIn                                     |
| `linkedin-company-1128x191.png`      | 1128×191    | Banner página de empresa LinkedIn                           |
| `youtube-banner-2560x1440.png`       | 2560×1440   | Capa de canal YouTube                                       |

### Como referenciar na web

```tsx
// app/layout.tsx
export const metadata = {
  openGraph: {
    title: 'Liriun',
    description: 'Sua próxima tarefa, na voz.',
    url: 'https://liriun.app',
    siteName: 'Liriun',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Liriun',
    description: 'Sua próxima tarefa, na voz.',
    images: ['/twitter-card.png'],
  },
};
```

---

## 5️⃣ `05-tokens/` — Design tokens

Os tokens são compartilhados entre **app (Flutter)** e **web (Next.js)**. Não invente cor/fonte/raio fora daqui.

| Arquivo                       | Para quê                                                              |
|-------------------------------|-----------------------------------------------------------------------|
| `tokens.css`                  | CSS custom properties — copie pra `globals.css`                       |
| `tokens.json`                 | Versão estruturada — para Style Dictionary, Flutter, design tools     |
| `tailwind.config.snippet.js`  | Bloco `theme.extend` pronto para colar no `tailwind.config.ts`        |
| `shadcn-theme.css`            | Variáveis HSL no formato shadcn/ui — cole em `globals.css`            |

### Pipeline de cor recomendado (web)

1. Copie `tokens.css` em `apps/web/app/globals.css`.
2. Copie `shadcn-theme.css` no mesmo arquivo (variáveis HSL para o shadcn consumir).
3. Cole o snippet em `tailwind.config.ts` para que `bg-surface`, `text-violet-500`, `border-border-hi` etc. funcionem.
4. shadcn/ui já lê as variáveis HSL e aplica nossos tokens em todos os componentes (`Button`, `Input`, `Sheet`, `Dialog`, `Switch`, `Toast`, `Avatar`, `Badge`).

### Pipeline de cor (Flutter)

Use o `tokens.json` com [`flutter_gen`](https://pub.dev/packages/flutter_gen) ou copie os hex codes manualmente para um `lib/theme/liriun_colors.dart`.

### Tipografia

- **Geist** — corpo e UI (300, 400, 500, 600, 700, 800).
- **Geist Mono** — overlines, métricas, código (400, 500, 600).

Veja `06-fonts.md` para licenciamento e instalação.

---

## 6️⃣ Microinterações (Framer Motion)

A vibe do Liriun é **calma**. Toda animação tem easing suave e duração no intervalo 220–520 ms. Implemente com `motion.div` + `useReducedMotion`.

| Interação            | Duração | Easing                                  | Onde                              |
|----------------------|---------|-----------------------------------------|-----------------------------------|
| Hover lift           | 220 ms  | `[0.4, 0, 0.2, 1]`                      | Cards · botões                    |
| Sheet rise           | 360 ms  | `[0.25, 0.1, 0.25, 1]` (decel)          | Bottom sheet · modal              |
| Mic halo (loop)      | 1800 ms | `easeInOut` infinite                    | Botão de voz quando gravando      |
| Page transition      | 520 ms  | `[0.16, 1, 0.3, 1]` (expo-out)          | Entre rotas Next.js               |
| Focus ring           | 180 ms  | `[0.4, 0, 0.2, 1]`                      | Inputs · tab nav                  |

```tsx
import { motion, useReducedMotion } from 'framer-motion';

export function HoverCard({ children }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      whileHover={reduce ? {} : { y: -2, scale: 1.005 }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      className="rounded-2xl bg-surface border border-border-hi p-6"
    >
      {children}
    </motion.div>
  );
}
```

---

## ✅ Boas práticas

- **Sempre o squircle** em superfícies que renderizam ícone de app.
- **Sempre dark mode default** — o produto nasceu no escuro.
- **Nunca** distorça o ícone (não-uniforme), nem mude a paleta do gradiente.
- **Nunca** use o glifo sobre cor pura roxa/azul — sem contraste suficiente.
- **Espaço de proteção** mínimo `0.25 × altura do logo` em todos os lados.
- **Tamanho mínimo** do ícone na UI: 44×44 px (acessibilidade — toque mobile).
- **Tamanho mínimo** do wordmark: 80 px de largura. Abaixo disso usar só o ícone.

---

## 📞 Dúvidas

Tudo aqui é vetorial e/ou re-renderizável. Se precisar de um tamanho que não está incluído, abra o SVG correspondente em `01-logo/` e exporte como precisar.

— Last updated: maio 2026 · v 1.0
