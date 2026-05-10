/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "rgb(var(--c-bg) / <alpha-value>)",
          elev: "rgb(var(--c-bg-elev) / <alpha-value>)",
          input: "rgb(var(--c-bg-input) / <alpha-value>)",
          surface: "rgb(var(--c-surface) / <alpha-value>)",
          sidebar: "rgb(var(--c-sidebar) / <alpha-value>)",
        },
        border: {
          DEFAULT: "rgb(var(--c-border) / <alpha-value>)",
          strong: "rgb(var(--c-border-strong) / <alpha-value>)",
        },
        text: {
          DEFAULT: "rgb(var(--c-text) / <alpha-value>)",
          dim: "rgb(var(--c-text-dim) / <alpha-value>)",
          subtle: "rgb(var(--c-text-subtle) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--c-accent) / <alpha-value>)",
          hover: "rgb(var(--c-accent-hover) / <alpha-value>)",
          violet: "rgb(var(--c-accent-violet) / <alpha-value>)",
        },
        danger: "rgb(var(--c-danger) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["Sora", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      fontSize: {
        base: ["14px", "1.5"],
      },
      borderRadius: {
        DEFAULT: "6px",
        lg: "10px",
      },
      boxShadow: {
        accent: "0 4px 16px rgba(94, 106, 210, 0.3)",
      },
      backgroundImage: {
        "accent-glow":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(94, 106, 210, 0.15), transparent)",
        "logo-grad": "linear-gradient(135deg, #5e6ad2, #8b5cf6)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-down": {
          from: { opacity: "0", transform: "translateY(-8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.94)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(16px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
      animation: {
        "fade-in": "fade-in 240ms ease-out both",
        "fade-up": "fade-up 320ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-down": "fade-down 280ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "scale-in": "scale-in 220ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "slide-in-right": "slide-in-right 280ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "shimmer": "shimmer 1.6s ease-in-out infinite",
        "pulse-soft": "pulse-soft 1.6s ease-in-out infinite",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        out: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};
