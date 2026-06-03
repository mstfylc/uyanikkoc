import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const configDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    exclude: ["e2e/**", "node_modules/**"],
  },
  resolve: {
    alias: {
      "@": configDir,
    },
  },
});
