# Tipografia · Liriun

## Famílias

- **Geist** — corpo e UI. Pesos 300, 400, 500, 600, 700, 800.
- **Geist Mono** — overlines, métricas, código. Pesos 400, 500, 600.

Ambas são open source (Vercel, OFL 1.1) e seguras para uso comercial.

## Web (Next.js 15)

```tsx
// app/layout.tsx
import { Geist, Geist_Mono } from 'next/font/google';

const geist = Geist({
  subsets: ['latin'],
  variable: '--liriun-font-sans',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--liriun-font-mono',
  weight: ['400', '500', '600'],
});

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${geist.variable} ${geistMono.variable}`}>
      <body className="font-sans bg-bg text-fg">{children}</body>
    </html>
  );
}
```

`next/font` baixa as fontes em build time, gera os subsets, configura `font-display: swap` e elimina layout shift. Não precisa adicionar nenhum `<link>` no `<head>`.

## Flutter

1. Baixe os `.ttf` em https://github.com/vercel/geist-font/tree/main/fonts
2. Coloque em `assets/fonts/`.
3. No `pubspec.yaml`:

```yaml
fonts:
  - family: Geist
    fonts:
      - asset: assets/fonts/Geist-Regular.ttf
      - asset: assets/fonts/Geist-Medium.ttf
        weight: 500
      - asset: assets/fonts/Geist-SemiBold.ttf
        weight: 600
      - asset: assets/fonts/Geist-Bold.ttf
        weight: 700
  - family: GeistMono
    fonts:
      - asset: assets/fonts/GeistMono-Regular.ttf
      - asset: assets/fonts/GeistMono-Medium.ttf
        weight: 500
```

4. Use no `ThemeData`:

```dart
ThemeData(
  textTheme: GoogleFonts.geistTextTheme(),  // ou Theme.of(context).textTheme.apply(fontFamily: 'Geist')
)
```

## Fallback stack

Se Geist falhar ao carregar (offline, bloqueio CDN), o stack desce graciosamente:

```css
font-family: 'Geist', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
```

## Licença

Geist é licenciada sob [SIL Open Font License 1.1](https://github.com/vercel/geist-font/blob/main/LICENSE.TXT). Pode redistribuir, modificar, embutir em produtos comerciais. Mantenha o aviso de licença se redistribuir.
