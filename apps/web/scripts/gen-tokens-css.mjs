/**
 * gen-tokens-css.mjs — Tek doğruluk kaynağı: apps/web/styles/uk-tokens.json
 *
 * uk-design.css içindeki :root + [data-theme="dark"] token bloğunu
 * uk-tokens.json'dan ÜRETİR. Tasarım her güncellendiğinde yalnız tokens
 * dosyası değiştirilir; bu script CSS'i yeniden üretir → drift olamaz.
 *
 *   node scripts/gen-tokens-css.mjs          # üret + yaz
 *   node scripts/gen-tokens-css.mjs --check  # senkron değilse hata (CI/prebuild)
 *
 * Blok, uk-design.css içinde @tokens:start / @tokens:end işaretleri arasına yazılır.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const TOKENS = path.join(here, "../styles/uk-tokens.json");
const CSS = path.join(here, "../styles/uk-design.css");
const START = "/* @tokens:start";
const END = "/* @tokens:end */";

// tokens.json anahtarı -> CSS değişken adı eşlemesi
const cssVar = (group, key) => {
  if (group === "radius") return `--r-${key}`;
  if (group === "shadow") return `--shadow-${key}`;
  if (group === "typography") return key === "font-sans" ? "--font" : `--${key}`;
  return `--${key}`; // color + layout doğrudan
};

const GROUPS = {
  Brand: ["primary", "primary-600", "primary-700", "primary-300", "primary-soft", "primary-glow"],
  Semantic: ["success", "success-soft", "warning", "warning-soft", "danger", "danger-soft", "info", "info-soft"],
  Neutrals: ["bg", "bg-grad-a", "bg-grad-b", "surface", "surface-2", "surface-3", "border", "border-strong", "text", "text-2", "muted", "faint"],
};

function build(tokens) {
  const c = tokens.color;
  const lines = [];
  lines.push(`${START} — uk-tokens.json'dan üretildi (scripts/gen-tokens-css.mjs). ELLE DÜZENLEME. */`);
  lines.push(`:root {`);
  for (const [label, keys] of Object.entries(GROUPS)) {
    lines.push(`  /* ${label} */`);
    for (const k of keys) lines.push(`  ${cssVar("color", k)}: ${c[k].light};`);
    lines.push("");
  }
  lines.push(`  --ring: ${c.ring.light};`);
  for (const s of ["sm", "md", "lg", "primary"]) lines.push(`  ${cssVar("shadow", s)}: ${tokens.shadow[s].light};`);
  lines.push("");
  for (const r of ["sm", "md", "lg", "xl"]) lines.push(`  ${cssVar("radius", r)}: ${tokens.radius[r]};`);
  lines.push("");
  lines.push(`  --sidebar-w: ${tokens.layout["sidebar-w"]};`);
  lines.push(`  --header-h: ${tokens.layout["header-h"]};`);
  lines.push("");
  lines.push(`  --font: ${tokens.typography["font-sans"]};`);
  lines.push(`}`);
  lines.push("");
  lines.push(`[data-theme="dark"] {`);
  for (const [label, keys] of Object.entries(GROUPS)) {
    lines.push(`  /* ${label} */`);
    for (const k of keys) lines.push(`  ${cssVar("color", k)}: ${c[k].dark};`);
    lines.push("");
  }
  lines.push(`  --ring: ${c.ring.dark};`);
  for (const s of ["sm", "md", "lg", "primary"]) lines.push(`  ${cssVar("shadow", s)}: ${tokens.shadow[s].dark};`);
  lines.push(`}`);
  lines.push(END);
  return lines.join("\n");
}

const tokens = JSON.parse(readFileSync(TOKENS, "utf8"));
const block = build(tokens);
const css = readFileSync(CSS, "utf8");

const s = css.indexOf(START);
const e = css.indexOf(END);
if (s === -1 || e === -1) {
  console.error("HATA: uk-design.css içinde @tokens:start/@tokens:end işaretleri yok. Bir kez ekleyin.");
  process.exit(2);
}
const current = css.slice(s, e + END.length);
const next = css.slice(0, s) + block + css.slice(e + END.length);

const check = process.argv.includes("--check");
if (check) {
  if (current.trim() !== block.trim()) {
    console.error("✗ uk-design.css token bloğu uk-tokens.json ile SENKRON DEĞİL.");
    console.error("  Düzeltmek için: node scripts/gen-tokens-css.mjs");
    process.exit(1);
  }
  console.log("✓ token bloğu uk-tokens.json ile senkron.");
} else {
  if (current === block) {
    console.log("• değişiklik yok (zaten senkron).");
  } else {
    writeFileSync(CSS, next);
    console.log("✓ uk-design.css token bloğu uk-tokens.json'dan yeniden üretildi.");
  }
}
