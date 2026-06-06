export const ukColors = {
  primary: "#534AB7",
  primary600: "#463DA6",
  primarySoft: "#EEEDF9",
  success: "#0F6E56",
  successSoft: "#E6F4EF",
  warning: "#B26A12",
  warningSoft: "#FDF3E7",
  danger: "#A32D2D",
  dangerSoft: "#FCECEC",
  info: "#2F6BD6",
  infoSoft: "#EAF1FC",
  bg: "#F4F5FA",
  surface: "#FFFFFF",
  border: "#E8E9F2",
  text: "#181A24",
  muted: "#767A90",
  faint: "#A2A6B8",
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
