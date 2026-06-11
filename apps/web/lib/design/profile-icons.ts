export type ProfileAvatarIcon = {
  id: string;
  label: string;
  glyph: string;
};

export const PROFILE_AVATAR_ICONS: ProfileAvatarIcon[] = [
  { id: "rocket", label: "Roket", glyph: "🚀" },
  { id: "trophy", label: "Kupa", glyph: "🏆" },
  { id: "gamepad", label: "Oyun", glyph: "🎮" },
  { id: "music", label: "Muzik", glyph: "🎵" },
  { id: "headphones", label: "Kulaklık", glyph: "🎧" },
  { id: "basketball", label: "Basket", glyph: "🏀" },
  { id: "bulb", label: "Ampul", glyph: "💡" },
  { id: "star", label: "Yıldız", glyph: "⭐" },
  { id: "book", label: "Kitap", glyph: "📚" },
  { id: "fire", label: "Alev", glyph: "🔥" },
  { id: "target", label: "Hedef", glyph: "🎯" },
  { id: "sparkle", label: "Parıltı", glyph: "✨" },
];

export const PROFILE_AVATAR_KEY = "uk_profile_avatar_v1";

export function loadProfileAvatarIcon(): string {
  if (typeof window === "undefined") return "rocket";
  return localStorage.getItem(PROFILE_AVATAR_KEY) ?? "rocket";
}

export function saveProfileAvatarIcon(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROFILE_AVATAR_KEY, id);
}

export function profileAvatarGlyph(id: string): string {
  return PROFILE_AVATAR_ICONS.find((item) => item.id === id)?.glyph ?? "🚀";
}
