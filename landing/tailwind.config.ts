import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--liriun-bg)",
        surface: "var(--liriun-surface)",
        "surface-hi": "var(--liriun-surface-hi)",
        text: "var(--liriun-text)",
        muted: "var(--liriun-text-muted)",
        faint: "var(--liriun-text-faint)",
        dim: "var(--liriun-text-dim)",
        border: "var(--liriun-border)",
        "border-hi": "var(--liriun-border-hi)",
        violet: {
          300: "#B79CFF",
          400: "#A88BFF",
          500: "#9C7BFF",
          600: "#7C7DF6",
          700: "#5B8DEF",
          800: "#4A5FD0",
          900: "#2E3A8F",
        },
        success: "#7BD7B0",
        warning: "#F0B36E",
        danger: "#EE7A8E",
        info: "#7AA9FF",
      },
      backgroundImage: {
        "grad-brand": "var(--liriun-grad-brand)",
        "grad-shine": "var(--liriun-grad-shine)",
      },
      fontFamily: {
        sans: "var(--liriun-font-sans)",
        mono: "var(--liriun-font-mono)",
      },
      fontSize: {
        xs: "var(--liriun-text-xs)",
        sm: "var(--liriun-text-sm)",
        base: "var(--liriun-text-base)",
        md: "var(--liriun-text-md)",
        lg: "var(--liriun-text-lg)",
        xl: "var(--liriun-text-xl)",
        "2xl": "var(--liriun-text-2xl)",
        "3xl": "var(--liriun-text-3xl)",
        "4xl": "var(--liriun-text-4xl)",
        "5xl": "var(--liriun-text-5xl)",
      },
      borderRadius: {
        xs: "var(--liriun-radius-xs)",
        sm: "var(--liriun-radius-sm)",
        DEFAULT: "var(--liriun-radius-md)",
        md: "var(--liriun-radius-md)",
        lg: "var(--liriun-radius-lg)",
        xl: "var(--liriun-radius-xl)",
        "2xl": "var(--liriun-radius-2xl)",
        pill: "var(--liriun-radius-pill)",
      },
      boxShadow: {
        sm: "var(--liriun-shadow-sm)",
        DEFAULT: "var(--liriun-shadow-md)",
        md: "var(--liriun-shadow-md)",
        lg: "var(--liriun-shadow-lg)",
        xl: "var(--liriun-shadow-xl)",
        glow: "var(--liriun-shadow-glow)",
      },
      transitionTimingFunction: {
        standard: "var(--liriun-ease-standard)",
        decel: "var(--liriun-ease-decel)",
        expo: "var(--liriun-ease-expo)",
      },
      transitionDuration: {
        fast: "var(--liriun-duration-fast)",
        base: "var(--liriun-duration-base)",
        slow: "var(--liriun-duration-slow)",
        xslow: "var(--liriun-duration-xslow)",
      },
    },
  },
  plugins: [],
};

export default config;
