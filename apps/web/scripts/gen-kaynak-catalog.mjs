import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const srcPath = path.join(root, ".import/uyanikkoc-zip-10/src/kaynak-catalog.jsx");
const outPath = path.join(root, "apps/web/lib/design/kaynak-catalog-data.ts");

const src = fs.readFileSync(srcPath, "utf8");
const match = src.match(/const KAYNAK_KATALOG = \[([\s\S]*?)\];/);
if (!match) {
  throw new Error("KAYNAK_KATALOG not found");
}

const KAYNAK_KATALOG = Function(`"use strict"; return [${match[1]}];`)();
for (const [index, entry] of KAYNAK_KATALOG.entries()) {
  entry.id = `kk${index}`;
  entry.exam = entry.e.includes("LGS") ? "LGS" : "YKS";
}

const payload = KAYNAK_KATALOG.map(({ id, exam, ...rest }) => rest);

const out = `/* Auto-synced from zip-10 kaynak-catalog.jsx — do not edit by hand. */
export type KaynakTypeKey = "soru" | "konu" | "deneme" | "foy" | "video";
export type KaynakExamGroup = "YKS" | "LGS";
export type KaynakCatalogSeed = {
  n: string;
  p: string;
  s: string;
  t: KaynakTypeKey;
  e: string[];
};

export const KAYNAK_CATALOG_SEED: KaynakCatalogSeed[] = ${JSON.stringify(payload, null, 2)};
`;

fs.writeFileSync(outPath, out);
console.log(`Wrote ${KAYNAK_KATALOG.length} entries to ${outPath}`);
