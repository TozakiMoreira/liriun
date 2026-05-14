// Liriun · Tailwind 3 / 4 config snippet
// Cole o bloco `theme.extend` no seu apps/web/tailwind.config.ts.
// Pré-requisito: tokens.css carregado em globals.css (CSS custom properties).

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand
        violet: {
          50:  'var(--liriun-violet-50)',
          100: 'var(--liriun-violet-100)',
          200: 'var(--liriun-violet-200)',
          300: 'var(--liriun-violet-300)',
          400: 'var(--liriun-violet-400)',
          500: 'var(--liriun-violet-500)',
          600: 'var(--liriun-violet-600)',
          700: 'var(--liriun-violet-700)',
          800: 'var(--liriun-violet-800)',
          900: 'var(--liriun-violet-900)',
        },
        // Surfaces
        bg:          'var(--liriun-bg)',
        surface:     'var(--liriun-surface)',
        'surface-hi':'var(--liriun-surface-hi)',
        overlay:     'var(--liriun-overlay)',
        // Text
        fg:          'var(--liriun-text)',
        'fg-muted':  'var(--liriun-text-muted)',
        'fg-faint':  'var(--liriun-text-faint)',
        'fg-dim':    'var(--liriun-text-dim)',
        // Borders
        border:      'var(--liriun-border)',
        'border-hi': 'var(--liriun-border-hi)',
        // Semantic
        success: 'var(--liriun-success)',
        warning: 'var(--liriun-warning)',
        danger:  'var(--liriun-danger)',
        info:    'var(--liriun-info)',
      },
      fontFamily: {
        sans: ['var(--liriun-font-sans)'],
        mono: ['var(--liriun-font-mono)'],
      },
      fontSize: {
        xs:   ['var(--liriun-text-xs)',   { lineHeight: 'var(--liriun-leading-base)' }],
        sm:   ['var(--liriun-text-sm)',   { lineHeight: 'var(--liriun-leading-base)' }],
        base: ['var(--liriun-text-base)', { lineHeight: 'var(--liriun-leading-base)' }],
        md:   ['var(--liriun-text-md)',   { lineHeight: 'var(--liriun-leading-snug)' }],
        lg:   ['var(--liriun-text-lg)',   { lineHeight: 'var(--liriun-leading-snug)' }],
        xl:   ['var(--liriun-text-xl)',   { lineHeight: 'var(--liriun-leading-snug)' }],
        '2xl':['var(--liriun-text-2xl)',  { lineHeight: 'var(--liriun-leading-tight)' }],
        '3xl':['var(--liriun-text-3xl)',  { lineHeight: 'var(--liriun-leading-tight)' }],
        '4xl':['var(--liriun-text-4xl)',  { lineHeight: 'var(--liriun-leading-tight)' }],
        '5xl':['var(--liriun-text-5xl)',  { lineHeight: 'var(--liriun-leading-tight)' }],
      },
      borderRadius: {
        xs:  'var(--liriun-radius-xs)',
        sm:  'var(--liriun-radius-sm)',
        md:  'var(--liriun-radius-md)',
        lg:  'var(--liriun-radius-lg)',
        xl:  'var(--liriun-radius-xl)',
        '2xl':'var(--liriun-radius-2xl)',
        pill:'var(--liriun-radius-pill)',
      },
      boxShadow: {
        sm:    'var(--liriun-shadow-sm)',
        md:    'var(--liriun-shadow-md)',
        lg:    'var(--liriun-shadow-lg)',
        xl:    'var(--liriun-shadow-xl)',
        glow:  'var(--liriun-shadow-glow)',
        inset: 'var(--liriun-shadow-inset)',
      },
      backgroundImage: {
        'brand-grad': 'var(--liriun-grad-brand)',
        'brand-shine':'var(--liriun-grad-shine)',
      },
      transitionTimingFunction: {
        standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
        decel:    'cubic-bezier(0.25, 0.1, 0.25, 1)',
        expo:     'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        fast:  '180ms',
        base:  '220ms',
        slow:  '360ms',
        xslow: '520ms',
      },
    },
  },
};
