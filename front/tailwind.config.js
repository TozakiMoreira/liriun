/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#08090a",
          elev: "#101113",
          input: "#13141a",
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
        danger: "#eb5757",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
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
    },
  },
  plugins: [],
};
