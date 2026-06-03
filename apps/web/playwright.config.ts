import { defineConfig, devices } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const configDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: 0,
  timeout: 120_000,
  use: {
    baseURL: "http://localhost:3010",
    trace: "on-first-retry",
    navigationTimeout: 45_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm exec next dev -p 3010",
    cwd: configDir,
    url: "http://localhost:3010",
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
