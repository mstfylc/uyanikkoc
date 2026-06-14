/**
 * KALICI TÜRKÇE MUHAFIZI — regresyon önleyici test (vitest)
 * Yer: apps/web/__tests__/turkish-encoding.test.ts
 *
 * Amaç: Kullanıcıya görünen metinlerde ASCII-Türkçe (diakritiği düşmüş kelime) regresyonunu
 * KALICI olarak engellemek. Her `pnpm test:unit` + CI'da çalışır; eşleşme bulursa build kırılır.
 *
 * Mantık: .ts/.tsx dosyalarını tarar, className/href/route/import gibi teknik string'leri
 * AYIKLAR, kalan görünen metinde yasak (flattened) Türkçe kelime listesini arar.
 * Yeni bir hatalı kelime yakalandığında FORBIDDEN listesine eklenir → o kelime bir daha asla geçemez.
 */
import { describe, it, expect } from "vitest";
import { readdirSync, statSync, readFileSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const WEB_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const REPO_ROOT = resolve(WEB_ROOT, "../..");

const ROOTS = [
  resolve(WEB_ROOT, "app"),
  resolve(WEB_ROOT, "components"),
  resolve(REPO_ROOT, "packages/database/prisma/seed.ts"),
];

const FORBIDDEN: RegExp[] = [
  /\bOgrenci/, /\bOgrenciler/, /\bOdev\b/, /\bGorev/, /\bAciklama/, /\bBaslik/,
  /\bCalisma/, /\bMufredat/, /\bKocluk/, /\bBugunku/, /\bOnceliklendiril/,
  /\bYuz yuze/, /\bLisansim/, /\bSonuc girilen/, /\bGecikmis/, /\bSonuclu/,
  /\bGecen hafta/, /\bHos geldin/, /\bCozum/, /\bSinav\b/, /\bGunluk/,
  /\bDuzenle/, /\bOlustur/, /\bGonder\b/, /\bGecmis/, /\bBasari/,
  /oncelikli destek/, /danismanlig/, /\bKadikoy/, /\bsablon/, /her sey/,
  /\bSuresi/, /\bDetaylar/, /\bTamamlanmis/, /\bAtanmis/, /\bUyari\b/,
];

function sanitize(line: string): string {
  if (/^\s*(import|export\s+\*|export\s+\{)/.test(line)) return "";
  return line
    .replace(/className=\{?["'`][^"'`]*["'`]\}?/g, "")
    .replace(/href=\{?["'`][^"'`]*["'`]\}?/g, "")
    .replace(/["'`]\/api\/[^"'`]*["'`]/g, "")
    .replace(/data-testid=["'][^"']*["']/g, "")
    .replace(/from\s+["'][^"']*["']/g, "");
}

function walk(dir: string, out: string[]): void {
  let entries: string[];
  try { entries = readdirSync(dir); } catch { return; }
  for (const name of entries) {
    if (name === "node_modules" || name === ".next" || name === "__tests__") continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if ([".ts", ".tsx"].includes(extname(name))) out.push(full);
  }
}

function collectFiles(): string[] {
  const files: string[] = [];
  for (const root of ROOTS) {
    try {
      const st = statSync(root);
      if (st.isDirectory()) walk(root, files);
      else files.push(root);
    } catch {
      /* yol yoksa atla */
    }
  }
  return files;
}

describe("Türkçe karakter muhafızı", () => {
  it("görünen metinlerde ASCII-Türkçe (diakritiksiz) kelime YOK", () => {
    const violations: string[] = [];
    const files = collectFiles();
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const lines = readFileSync(file, "utf8").split("\n");
      lines.forEach((raw, i) => {
        const line = sanitize(raw);
        for (const rx of FORBIDDEN) {
          const m = rx.exec(line);
          if (m) violations.push(`${relative(REPO_ROOT, file)}:${i + 1}  →  "${m[0]}"  (satır: ${raw.trim().slice(0, 90)})`);
        }
      });
    }
    if (violations.length) {
      throw new Error(
        `ASCII-Türkçe bulundu (${violations.length}). Görünen metni ilgili kaynaktan bayt-bayt Türkçe al:\n` +
        violations.join("\n"),
      );
    }
    expect(violations).toEqual([]);
  });
});
