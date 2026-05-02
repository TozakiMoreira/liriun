export const colors = {
  bg: "#08090a",
  bgElev: "#101113",
  bgInput: "#13141a",
  border: "#1f2023",
  borderStrong: "#2a2b2f",
  text: "#f7f8f8",
  textDim: "#8a8f98",
  textSubtle: "#62666d",
  accent: "#5e6ad2",
  accentHover: "#7179d8",
  violet: "#8b5cf6",
  danger: "#eb5757",
  success: "#4cb782",
} as const;

export type ColorToken = keyof typeof colors;
