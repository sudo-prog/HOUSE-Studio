export const brand = {
  primary: "#1a3a2a",
  primaryLight: "#2a5a42",
  primaryDark: "#0f231a",
  accent: "#e8a020",
  accentLight: "#f0b840",
  accentDark: "#c4841a",
  secondary: "#c4714a",
  secondaryLight: "#d4896a",
  secondaryDark: "#a05030",
  background: "#f5f0e8",
  backgroundDark: "#e8e0d0",
  surface: "#faf7f2",
  border: "rgba(26, 58, 42, 0.15)",
  text: {
    primary: "#1a2a1a",
    secondary: "#4a6a4a",
    muted: "#8a9a8a",
  },
} as const;

export type BrandColor = keyof typeof brand;
