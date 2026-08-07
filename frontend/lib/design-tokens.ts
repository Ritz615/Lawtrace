/**
 * LexAI Design Tokens
 * Import this in tailwind.config.ts
 */

export const colors = {
  // Primary brand — deep indigo
  primary: {
    50: "#eef2ff",
    100: "#e0e7ff",
    200: "#c7d2fe",
    300: "#a5b4fc",
    400: "#818cf8",
    500: "#6366f1",  // primary
    600: "#4f46e5",
    700: "#4338ca",
    800: "#3730a3",
    900: "#312e81",
    950: "#1e1b4b",
  },
  // Accent — electric violet
  accent: {
    400: "#a78bfa",
    500: "#8b5cf6",
    600: "#7c3aed",
  },
  // Status colors
  success: { 500: "#10b981", 400: "#34d399" },
  warning: { 500: "#f59e0b", 400: "#fbbf24" },
  danger:  { 500: "#ef4444", 400: "#f87171" },
  critical:{ 500: "#dc2626", 400: "#f87171" },
  // Risk levels
  risk: {
    low:      "#10b981",  // green
    medium:   "#f59e0b",  // amber
    high:     "#ef4444",  // red
    critical: "#dc2626",  // deep red
  },
  // Dark mode backgrounds
  dark: {
    50:  "#f8fafc",
    100: "#1e2030",
    200: "#181a2a",
    300: "#13151f",
    400: "#0e0f17",
    950: "#080a10",
  },
};

export const typography = {
  fontFamily: {
    sans: ["Inter", "system-ui", "sans-serif"],
    mono: ["JetBrains Mono", "monospace"],
  },
};

export const animation = {
  // Framer Motion presets
  fadeIn: { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3 } },
  slideUp: { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } },
  slideRight: { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.3 } },
  scaleIn: { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.2 } },
};
