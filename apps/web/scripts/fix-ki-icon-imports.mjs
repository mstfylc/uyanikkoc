import { readFileSync, writeFileSync } from "node:fs";
import { globSync } from "node:fs";
import { join } from "node:path";

const root = join(process.cwd());
const importLine = 'import { KiIcon } from "@/components/design/KiIcon";\n';

for (const rel of globSync("**/*.{tsx,ts}", { cwd: root })) {
  if (rel.includes("node_modules") || rel.includes("KiIcon.tsx")) {
    continue;
  }
  const file = join(root, rel);
  const src = readFileSync(file, "utf8");
  if (!src.includes("<KiIcon") || src.includes('from "@/components/design/KiIcon"')) {
    continue;
  }

  let next = src;
  if (next.startsWith('"use client";\n\n')) {
    next = next.replace('"use client";\n\n', `"use client";\n\n${importLine}`);
  } else if (next.startsWith('"use client";\r\n\r\n')) {
    next = next.replace('"use client";\r\n\r\n', `"use client";\r\n\r\n${importLine}`);
  } else {
    next = `${importLine}${next}`;
  }

  writeFileSync(file, next);
  console.log("import added", rel);
}
