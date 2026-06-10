// Tek doğruluk kaynağı: uyanikkoc-mobil-source-v3 (tokens.json + theme.ts).
// Marka web ile ortak (#534AB7); primary tonları + dark nötrler mobil-kanonik
// (OLED) — kasıtlı platform sapması, kaynakta $platformNotes ile belgeli.
export const palette = {
  light: {
    primary: "#534AB7",
    primary600: "#47409D",
    primary700: "#38327C",
    primary300: "#9F9AD7",
    primarySoft: "#ECEBF7",
    primaryGlow: "rgba(83, 74, 183, 0.30)",
    success: "#0F6E56",
    successSoft: "#E4F1EC",
    warning: "#B26A12",
    warningSoft: "#FAEFDE",
    danger: "#A32D2D",
    dangerSoft: "#F8E8E8",
    info: "#2F6BD6",
    infoSoft: "#E6EEFA",
    bg: "#F4F5FA",
    surface: "#FFFFFF",
    surface2: "#FAFAFD",
    surface3: "#F3F4F9",
    border: "#E8E9F2",
    borderStrong: "#DCDEEA",
    text: "#181A24",
    text2: "#45485A",
    muted: "#6B6F85",
    faint: "#A2A6B8",
    ring: "rgba(83, 74, 183, 0.16)",
    onPrimary: "#FFFFFF",
  },
  dark: {
    primary: "#8079E6",
    primary600: "#8A84E8",
    primary700: "#6963BD",
    primary300: "#B0ACF0",
    primarySoft: "#313256",
    primaryGlow: "rgba(128, 121, 230, 0.32)",
    success: "#34D399",
    successSoft: "#14271F",
    warning: "#F0B45E",
    warningSoft: "#2A2113",
    danger: "#F87171",
    dangerSoft: "#2C1818",
    info: "#6BA0F0",
    infoSoft: "#141E2E",
    bg: "#0B0E18",
    surface: "#141723",
    surface2: "#181C2A",
    surface3: "#1E2233",
    border: "#262B3D",
    borderStrong: "#313752",
    text: "#F3F4FB",
    text2: "#C3C7DA",
    muted: "#8A8FA8",
    faint: "#62677E",
    ring: "rgba(128, 121, 230, 0.22)",
    onPrimary: "#FFFFFF",
  },
} as const;

export type ThemeMode = "light" | "dark";

// Geriye dönük uyumlu düz renk seti (varsayılan light). Değerler palette.light'tan türetilir.
export const ukColors = {
  primary: palette.light.primary,
  primary600: palette.light.primary600,
  primarySoft: palette.light.primarySoft,
  success: palette.light.success,
  successSoft: palette.light.successSoft,
  warning: palette.light.warning,
  warningSoft: palette.light.warningSoft,
  danger: palette.light.danger,
  dangerSoft: palette.light.dangerSoft,
  info: palette.light.info,
  infoSoft: palette.light.infoSoft,
  bg: palette.light.bg,
  surface: palette.light.surface,
  surface2: palette.light.surface2,
  surface3: palette.light.surface3,
  border: palette.light.border,
  borderStrong: palette.light.borderStrong,
  text: palette.light.text,
  text2: palette.light.text2,
  muted: palette.light.muted,
  faint: palette.light.faint,
  primary300: palette.light.primary300,
  primary700: palette.light.primary700,
  ring: palette.light.ring,
  onPrimary: palette.light.onPrimary,
} as const;

export const ukSubjectColors: Record<string, string> = {
  Matematik: "#534AB7",
  Fizik: "#2F6BD6",
  Kimya: "#0F6E56",
  Biyoloji: "#3A9D6A",
  Turkce: "#B26A12",
  "Türkçe": "#B26A12",
  Geometri: "#7A4AD6",
};

export const ukRadius = {
  sm: 9,
  md: 13,
  lg: 18,
  xl: 24,
} as const;

export const ukSpace = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
} as const;

export function subjectColor(name: string): string {
  return ukSubjectColors[name] ?? ukColors.primary;
}
