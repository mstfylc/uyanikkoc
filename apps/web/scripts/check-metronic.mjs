import { existsSync } from "node:fs";
import { join } from "node:path";

const cssPath = join(process.cwd(), "public/assets/metronic/css/core.bundle.css");

if (!existsSync(cssPath)) {
  console.warn(
    "[uyanik] Metronic assets missing at public/assets/metronic/. UI will be unstyled until assets are copied.",
  );
}
