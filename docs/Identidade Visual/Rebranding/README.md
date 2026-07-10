# Liriun · Rebranding

Identidade visual do Liriun. **Provisória** — o rebranding ainda não foi finalizado e vai mudar. Organizada em 2 frentes:

```
Rebranding/
├── brand-kit/      ← assets canônicos (logos, ícones, favicons, social, tokens, fontes)
└── prototypes/     ← mockups HTML+JSX (referência visual)
```

> Os guias de implementação por plataforma (`CLAUDE_CODE*.md`) foram movidos pra fora do repo
> (`~/Desktop/arquivo liriun/guias-design/`). Contradiziam decisões atuais (ex: estrutura de abas)
> e o nome se confundia com config do Claude Code. Fonte autoritativa de arquitetura: `docs/CONTEXTO_APP.md`.

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
