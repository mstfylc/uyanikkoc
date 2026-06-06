// Saf formatlayıcılar — UI + API + service paylaşır. apps/web/lib/admin/format.ts
// Prototip kaynağı: admin/admin-data.jsx (TRY, fmtDate, fmtShort, daysLeft).

export const DAY = 86_400_000;

export function tl(n: number): string {
  return "₺" + Number(n).toLocaleString("tr-TR");
}

export function fmtDate(ts: number): string {
  return new Date(ts).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function fmtShort(ts: number): string {
  return new Date(ts).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function daysLeft(ts: number): number {
  return Math.ceil((ts - Date.now()) / DAY);
}
