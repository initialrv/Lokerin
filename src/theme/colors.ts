/**
 * Compact productivity palettes. Light is the default Lokerin look; dark keeps
 * the same lime/accent identity for low-light use.
 */
export const lightColors = {
  bg: "#f7faf3",
  bgElevated: "#ffffff",
  surface: "#eef5e6",
  surfaceStrong: "#dff0c8",
  border: "#d5dfc9",
  borderStrong: "#a8c77a",
  text: "#162012",
  textMuted: "#68745e",
  primary: "#8fd14f",
  primaryPressed: "#6ead35",
  primarySoft: "#e8f8d8",
  accent: "#18b7a4",
  accentSoft: "#dff8f4",
  danger: "#e85d75",
  dangerSoft: "#ffe8ee",
  success: "#39b56a",
  warning: "#f0a93b",
  warningSoft: "#fff1d6",
  shadow: "#abc190",
};

export const darkColors = {
  bg: "#10170d",
  bgElevated: "#172013",
  surface: "#22301b",
  surfaceStrong: "#304820",
  border: "#3f5534",
  borderStrong: "#8fd14f",
  text: "#f5faef",
  textMuted: "#aebaa5",
  primary: "#9be15a",
  primaryPressed: "#c1ff72",
  primarySoft: "#213818",
  accent: "#34d6c0",
  accentSoft: "#173833",
  danger: "#ff6f8a",
  dangerSoft: "#3a1822",
  success: "#5ee08a",
  warning: "#ffc857",
  warningSoft: "#3a2c12",
  shadow: "#000000",
};

export type AppColors = typeof lightColors;

export const colors = lightColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const radius = {
  sm: 8,
  md: 10,
  lg: 14,
};
