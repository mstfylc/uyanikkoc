import { readFileSync, writeFileSync } from "node:fs";
import { globSync } from "node:fs";
import { join } from "node:path";

const root = join(process.cwd());
const files = globSync("**/*.{tsx,ts}", {
  cwd: root,
  exclude: (path) => path.includes("node_modules") || path.includes("KiIcon.tsx") || path.includes("UkIcon.tsx"),
});

const importLine = 'import { KiIcon } from "@/components/design/KiIcon";\n';

for (const rel of files) {
  const file = join(root, rel);
  let src = readFileSync(file, "utf8");
  if (!src.includes("ki-filled")) {
    continue;
  }

  let next = src
    .replace(/<i className=\{`ki-filled \$\{([^}]+)\}`\} \/>/g, "<KiIcon name={$1} />")
    .replace(/<i className="ki-filled ([^"]+)"([^/]*)\/>/g, (_, icon, rest) => {
      const sizeMatch = rest.match(/text-xl/);
      const size = sizeMatch ? " size={22}" : rest.includes("text-xs") ? " size={12}" : rest.includes("text-lg") ? " size={18}" : "";
      const styleMatch = rest.match(/style=\{([^}]+)\}/);
      const style = styleMatch ? ` style={${styleMatch[1]}}` : "";
      const classMatch = rest.match(/className="([^"]+)"/);
      const cls = classMatch ? ` className="${classMatch[1]}"` : "";
      return `<KiIcon name="${icon.trim()}"${size}${cls}${style} />`;
    });

  if (next === src) {
    continue;
  }

  if (!next.includes('from "@/components/design/KiIcon"')) {
    const useClient = next.startsWith('"use client"');
    if (useClient) {
      next = next.replace('"use client";\n\n', `"use client";\n\n${importLine}`);
    } else {
      next = `${importLine}\n${next}`;
    }
  }

  writeFileSync(file, next);
  console.log("updated", rel);
}
