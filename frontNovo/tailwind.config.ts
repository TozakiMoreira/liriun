import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        // Tokens base — paleta Linear-clone (mesmas cores do front Angular).
        bg: {
          DEFAULT: "#08090a",
          elev: "#101113",
          input: "#13141a",
          surface: "#0b0c0e",
        },
        border: {
          DEFAULT: "#1f2023",
          strong: "#2a2b2f",
        },
        text: {
          DEFAULT: "#f7f8f8",
          dim: "#8a8f98",
          subtle: "#62666d",
        },
        accent: {
          DEFAULT: "#5e6ad2",
          hover: "#7179d8",
          violet: "#8b5cf6",
        },
        danger: {
          DEFAULT: "#eb5757",
          soft: "rgba(235, 87, 87, 0.08)",
        },
        success: "#4cb782",

        // Tokens shadcn — apontam pros tokens base via CSS vars.
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        DEFAULT: "6px",
        lg: "10px",
        md: "8px",
        sm: "4px",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "sans-serif",
        ],
      },
      backgroundImage: {
        "accent-glow":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(94,106,210,0.15), transparent)",
        "logo-grad": "linear-gradient(135deg, #5e6ad2, #8b5cf6)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
