#!/usr/bin/env node
/**
 * KALICI TÜRKÇE MUHAFIZI — bağımsız tarayıcı (pre-commit + manuel + CI)
 * Yer: scripts/check-turkce.mjs   ·   Çalıştır: node scripts/check-turkce.mjs
 *
 * Vitest testiyle AYNI mantık; pre-commit hook'unda ve istediğin an elle koşturmak için.
 * Eşleşme varsa exit code 1 (commit/CI durur).
 */
import { readdirSync, statSync, readFileSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ROOTS = ["apps/web/app", "apps/web/components", "packages/database/prisma/seed.ts"].map((root) =>
  resolve(REPO_ROOT, root),
);

const FORBIDDEN = [
  /\bOgrenci/, /\bOgrenciler/, /\bOdev\b/, /\bGorev/, /\bAciklama/, /\bBaslik/,
  /\bCalisma/, /\bMufredat/, /\bKocluk/, /\bBugunku/, /\bOnceliklendiril/,
  /\bYuz yuze/, /\bLisansim/, /\bSonuc girilen/, /\bGecikmis/, /\bSonuclu/,
  /\bGecen hafta/, /\bHos geldin/, /\bCozum/, /\bSinav\b/, /\bGunluk/,
  /\bDuzenle/, /\bOlustur/, /\bGonder\b/, /\bGecmis/, /\bBasari/,
  /oncelikli destek/, /danismanlig/, /\bKadikoy/, /\bsablon/, /her sey/,
  /\bSuresi/, /\bDetaylar/, /\bTamamlanmis/, /\bAtanmis/, /\bUyari\b/,
];

function sanitize(line) {
  if (/^\s*(import|export\s+\*|export\s+\{)/.test(line)) return "";
  return line
    .replace(/className=\{?["'`][^"'`]*["'`]\}?/g, "")
    .replace(/href=\{?["'`][^"'`]*["'`]\}?/g, "")
    .replace(/["'`]\/api\/[^"'`]*["'`]/g, "")
    .replace(/data-testid=["'][^"']*["']/g, "")
    .replace(/from\s+["'][^"']*["']/g, "");
}

function walk(dir, out) {
  let entries;
  try { entries = readdirSync(dir); } catch { return; }
  for (const name of entries) {
    if (name === "node_modules" || name === ".next" || name === "__tests__") continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if ([".ts", ".tsx"].includes(extname(name))) out.push(full);
  }
}

const files = [];
for (const root of ROOTS) {
  try { const st = statSync(root); st.isDirectory() ? walk(root, files) : files.push(root); } catch {}
}

if (files.length === 0) {
  console.error("Türkçe muhafızı hiç dosya taramadı; ROOTS yollarını kontrol et.");
  process.exit(1);
}

const violations = [];
for (const file of files) {
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((raw, i) => {
    const line = sanitize(raw);
    for (const rx of FORBIDDEN) {
      const m = rx.exec(line);
      if (m) violations.push(`${relative(REPO_ROOT, file)}:${i + 1}  ->  "${m[0]}"  | ${raw.trim().slice(0, 90)}`);
    }
  });
}

if (violations.length) {
  console.error(`\n❌ ASCII-Türkçe bulundu (${violations.length}). Düzelt → Türkçesini kaynaktan bayt-bayt al:\n`);
  console.error(violations.join("\n") + "\n");
  process.exit(1);
}
console.log("✅ Türkçe muhafızı temiz — görünen metinde ASCII-Türkçe yok.");
