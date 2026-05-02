/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
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
        success: "#4cb782",
      },
      borderRadius: {
        DEFAULT: "6px",
        lg: "10px",
      },
    },
  },
  plugins: [],
};
