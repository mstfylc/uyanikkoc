/**
 * TR telefon numarası normalizasyonu — saf, bağımlılıksız (tarayıcı-güvenli).
 * Kabul: "05xx...", "5xx...", "+905xx...", "905xx...", aralarında boşluk/(-) olabilir.
 * Çıktı: E.164 ("+905xxxxxxxxx") ya da geçersizse null.
 */
export function normalizePhoneTR(input: string | null | undefined): string | null {
  if (!input) return null;
  let d = String(input).replace(/[^\d+]/g, "");
  if (d.startsWith("+90")) d = d.slice(3);
  else if (d.startsWith("90") && d.length === 12) d = d.slice(2);
  else if (d.startsWith("0")) d = d.slice(1);
  // d artık "5xxxxxxxxx" (10 hane, 5 ile başlar) olmalı
  if (!/^5\d{9}$/.test(d)) return null;
  return "+90" + d;
}

/** UI'de göstermek için maskeli biçim: "+90 5•• ••• 45 67" */
export function maskPhone(e164: string): string {
  const m = /^\+90(5\d)(\d)(\d)(\d{2})(\d{2})(\d{2})$/.exec(e164);
  if (!m) return e164;
  return `+90 ${m[1]}• ••• ${m[5]} ${m[6]}`;
}

/** Tam biçimli görünüm: "+90 5xx xxx xx xx" */
export function formatPhoneTR(e164: string): string {
  const m = /^\+90(\d{3})(\d{3})(\d{2})(\d{2})$/.exec(e164);
  if (!m) return e164;
  return `+90 ${m[1]} ${m[2]} ${m[3]} ${m[4]}`;
}
