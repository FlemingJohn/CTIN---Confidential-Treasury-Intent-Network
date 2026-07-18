import { loadFont as loadDisplayFont } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadMonoFont } from "@remotion/google-fonts/JetBrainsMono";

export const { fontFamily: displayFont } = loadDisplayFont("normal", {
  weights: ["500", "700"],
  subsets: ["latin"],
});

export const { fontFamily: monoFont } = loadMonoFont("normal", {
  weights: ["400", "700"],
  subsets: ["latin"],
});

export const colors = {
  obsidianBase: "#050505",
  obsidianRaised: "#0b0b0d",
  obsidianPanel: "#111114",
  obsidianBorder: "#1f1f24",
  ember: "#ff6b1a",
  core: "#f97316",
  flame: "#e11d2a",
  deep: "#b91c1c",
  glow: "#ffd7a8",
  textPrimary: "#f5f5f4",
  textMuted: "#8a8a92",
  settled: "#22c55e",
  confidential: "#f59e0b",
  pending: "#eab308",
  reverted: "#ef4444",
};

export const emberGradient = `linear-gradient(135deg, ${colors.glow} 0%, ${colors.ember} 55%, ${colors.flame} 100%)`;

export const fissureGradient =
  "radial-gradient(circle at 50% 120%, rgba(255,107,26,0.20), transparent 58%)";
