/**
 * Uyanik Koc Mobil — Tema (React Native / Expo)
 * TEK dogruluk kaynagi: tokens.json. Bu dosya ayni degerleri tipli ve
 * RN'de dogrudan kullanilabilir flat hex/rgba olarak verir.
 * Marka web ile ORTAK (#534AB7). Degerler mobile/uk-mobile.css'ten cozulmustur.
 */

export type ThemeMode = "light" | "dark";

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

export type Palette = typeof palette.light;

export const typography = {
  fontFamily: { default: "PlusJakartaSans", options: ["PlusJakartaSans", "Manrope", "Nunito"] },
  weight: { regular: "400", medium: "500", semibold: "600", bold: "700", extrabold: "800" },
  scale: {
    pageTitle:    { fontSize: 26, fontWeight: "800", lineHeight: 31, letterSpacing: -0.65 },
    greetingName: { fontSize: 19, fontWeight: "800", lineHeight: 22, letterSpacing: -0.38 },
    heroTitle:    { fontSize: 20, fontWeight: "800", lineHeight: 25, letterSpacing: -0.40 },
    statValue:    { fontSize: 26, fontWeight: "800", lineHeight: 26, letterSpacing: -0.52 },
    sectionTitle: { fontSize: 16, fontWeight: "800", lineHeight: 20, letterSpacing: -0.32 },
    cardTitle:    { fontSize: 14.5, fontWeight: "700", lineHeight: 19, letterSpacing: -0.15 },
    body:         { fontSize: 14, fontWeight: "500", lineHeight: 20 },
    label:        { fontSize: 13, fontWeight: "800", lineHeight: 16 },
    subtle:       { fontSize: 13, fontWeight: "600", lineHeight: 17 },
    meta:         { fontSize: 11.5, fontWeight: "600", lineHeight: 15 },
    tabLabel:     { fontSize: 10.5, fontWeight: "700", lineHeight: 13, letterSpacing: -0.1 },
  },
} as const;

export const spacing = {
  0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 18, 6: 20, 7: 22, 8: 26, 9: 32,
  screenX: 20, cardPad: 18, sectionGap: 12, sectionGapLg: 22,
} as const;

/** Nihai yaricap = base * scale. scale Tweaks/kullanici tercihinden gelir. */
export const radiusScale = { Keskin: 0.5, Standart: 1, Yuvarlak: 1.5 } as const;
export const radiusBase = {
  chip: 8, badge: 8, button: 12, buttonBlock: 15, seg: 11, iconBtn: 13,
  input: 15, odev: 16, list: 18, card: 20, hero: 24, sheet: 26, pill: 999,
} as const;
export const radius = (key: keyof typeof radiusBase, scale = 1) => radiusBase[key] * scale;

export const iconSize = { xs: 13, sm: 16, md: 19, lg: 22, tab: 24, xl: 26 } as const;

/** RN golge stilleri (iOS shadow* + Android elevation). */
export const elevation = {
  sm:      { shadowColor: "#181A28", shadowOpacity: 0.06, shadowRadius: 3,  shadowOffset: { width: 0, height: 1 },  elevation: 1 },
  md:      { shadowColor: "#181A28", shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },  elevation: 4 },
  lg:      { shadowColor: "#181A28", shadowOpacity: 0.14, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 10 },
  primary: { shadowColor: "#534AB7", shadowOpacity: 0.30, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 8 },
} as const;

/** Hedef cihaz profilleri (mantiksal dp). Uretimde safeArea = env(safe-area-inset-*). */
export const devices = {
  "iOS · SE":          { os: "ios", w: 375, h: 667, safeTop: 24, safeBottom: 14 },
  "iOS · Standart":    { os: "ios", w: 393, h: 852, safeTop: 56, safeBottom: 30 },
  "iOS · Pro":         { os: "ios", w: 402, h: 874, safeTop: 56, safeBottom: 30 },
  "iOS · Pro Max":     { os: "ios", w: 440, h: 956, safeTop: 60, safeBottom: 32 },
  "Android · Kompakt": { os: "android", w: 360, h: 800, safeTop: 8, safeBottom: 10 },
  "Android · Standart":{ os: "android", w: 412, h: 915, safeTop: 8, safeBottom: 10 },
  "Android · Buyuk":   { os: "android", w: 432, h: 960, safeTop: 10, safeBottom: 12 },
} as const;

export const theme = (mode: ThemeMode = "light") => ({
  mode,
  color: palette[mode],
  typography,
  spacing,
  radiusBase,
  radiusScale,
  iconSize,
  elevation,
  devices,
});

export default theme;
