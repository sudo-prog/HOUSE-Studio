import { Feather } from "@expo/vector-icons";
import { useColorScheme } from "react-native";

export interface AppColors {
  background: string;
  foreground: string;
  card: string;
  border: string;
  muted: string;
  mutedForeground: string;
  primary: string;
  secondary: string;
  destructive: string;
}

const light: AppColors = {
  background: "#f5f0e8",
  foreground: "#1a3a2a",
  card: "#ffffff",
  border: "#e0d8c8",
  muted: "#e8e2d6",
  mutedForeground: "#6b7a6e",
  primary: "#1a3a2a",
  secondary: "#e8e2d6",
  destructive: "#b91c1c",
};

const dark: AppColors = {
  background: "#0f1a14",
  foreground: "#f5f0e8",
  card: "#16241b",
  border: "#243a2c",
  muted: "#243a2c",
  mutedForeground: "#9fb3a3",
  primary: "#5ad19a",
  secondary: "#243a2c",
  destructive: "#f87171",
};

export const COLORS: AppColors = dark;

export function useColors(): AppColors {
  const scheme = useColorScheme();
  return scheme === "light" ? light : dark;
}
