export const MOTIVATION_TEMPLATES = [
  "Bugun attigin kucuk adim, sinav gunu en buyuk farkin olacak. Devam!",
  "Netlerin yukseliyor, tempoyu koru. Sana guveniyorum!",
  "Zorlandigin an, en cok gelistigin andir. Pes etme!",
  "Bu hafta harika calistin — kendinle gurur duy.",
  "Hedefe her gun bir adim daha yaklasiyorsun. Odaklan!",
];

export function cargoBadgeTone(status: string): "warning" | "success" {
  return status.toLocaleLowerCase("tr-TR").includes("kargo") ? "warning" : "success";
}

export function cargoBadgeLabel(status: string): string {
  const normalized = status.toLocaleLowerCase("tr-TR");
  if (normalized.includes("kargo")) return "Kargoda";
  if (normalized.includes("teslim")) return "Teslim edildi";
  return status;
}
