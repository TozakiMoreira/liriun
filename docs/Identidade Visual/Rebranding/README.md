# Liriun · Rebranding

Identidade visual canônica do Liriun. Organizada em 3 frentes:

```
Rebranding/
├── brand-kit/      ← assets canônicos (logos, ícones, favicons, social, tokens, fontes)
├── docs/           ← guias de implementação por plataforma
└── prototypes/     ← mockups HTML+JSX (referência visual)
```

## brand-kit/
Tokens, logos e assets oficiais. Source-of-truth pra qualquer decisão visual.

| Pasta | Conteúdo |
|---|---|
| `01-logo/` | SVGs do logo, glyph, wordmark, lockup |
| `02-app-icons/` | PNGs iOS + Android (todos os tamanhos) |
| `03-favicons/` | favicon.svg + PNGs + apple-touch-icon + webmanifest |
| `04-social/` | OG image + Twitter card + templates IG/LinkedIn |
| `05-tokens/` | `tokens.css`, `shadcn-theme.css`, `tokens.json`, `tailwind.config.snippet.js` |
| `06-fonts.md` | Como instalar Geist em Next.js e Flutter |
| `07-social-icons/` | Ícones lineares (color + mono) pra UI |
| `README.md` | Estrutura completa do brand kit |

## docs/
Guias por plataforma. Cada Claude Code agent lê o guia do seu escopo.

| Arquivo | Escopo |
|---|---|
| `CLAUDE_CODE.md` | Master — overview app + site |
| `app/CLAUDE_CODE_APP.md` | App mobile Flutter |
| `site/CLAUDE_CODE_SITE.md` | Site marketing Next.js (landing) |
| `webapp/CLAUDE_CODE_WEBAPP.md` | Web app autenticado Next.js (Falar, Hoje, Tarefas, Atividade, Configurações) |

## prototypes/
Mockups visuais HTML+JSX. Abre direto no navegador (Babel standalone).

| Arquivo | Conteúdo |
|---|---|
| `liriun-site.html` | Mockup do site marketing completo |
| `liriun-site-app.html` | Mockup do site + área autenticada |
| `liriun-styleguide.html` | Style guide visual (tokens, primitives, components) |
| `liriun-styleguide-print.html` | Versão print do styleguide |
| `liriun-icon.html` | Showcase do ícone Liriun em vários tamanhos |
| `liriun-motion.html` | Biblioteca de motion (loading, states, voice loop) |
| `liriun-app-v2.html` | **15 telas do app mobile v2** (Today, Voice, Tasks, Calendar, Insights, Extras) + análise atual vs proposto |
| `app-v2/` | JSX que `liriun-app-v2.html` carrega |
| `motion/` | JSX que `liriun-motion.html` carrega |
| `*.jsx` (raiz) | JSX que `liriun-styleguide.html` carrega |
