import { afterEach, describe, expect, it, vi } from "vitest";

import {
  assertProductionMemoryPolicy,
  shouldUseDatabase,
  useMemoryStore,
} from "@/lib/data/env";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("useMemoryStore", () => {
  it("varsayılan olarak bellek modunu açar", () => {
    vi.stubEnv("DEMO_AUTH_ALLOW_IN_MEMORY", "");
    expect(useMemoryStore()).toBe(true);
  });

  it("false veya 0 ile bellek modunu kapatır", () => {
    vi.stubEnv("DEMO_AUTH_ALLOW_IN_MEMORY", "false");
    expect(useMemoryStore()).toBe(false);
    vi.stubEnv("DEMO_AUTH_ALLOW_IN_MEMORY", "0");
    expect(useMemoryStore()).toBe(false);
  });
});

describe("shouldUseDatabase", () => {
  it("DATABASE_URL varken ve memory kapalıyken true döner", () => {
    vi.stubEnv("DATABASE_URL", "postgresql://localhost/uyanik");
    vi.stubEnv("DEMO_AUTH_ALLOW_IN_MEMORY", "false");
    expect(shouldUseDatabase()).toBe(true);
  });

  it("memory açıkken false döner", () => {
    vi.stubEnv("DATABASE_URL", "postgresql://localhost/uyanik");
    vi.stubEnv("DEMO_AUTH_ALLOW_IN_MEMORY", "true");
    expect(shouldUseDatabase()).toBe(false);
  });
});

describe("assertProductionMemoryPolicy", () => {
  it("development ortamında hata fırlatmaz", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("DEMO_AUTH_ALLOW_IN_MEMORY", "true");
    expect(() => assertProductionMemoryPolicy()).not.toThrow();
  });

  it("production + memory açıkken hata fırlatır", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DEMO_AUTH_ALLOW_IN_MEMORY", "true");
    expect(() => assertProductionMemoryPolicy()).toThrow(/DEMO_AUTH_ALLOW_IN_MEMORY must be false/);
  });

  it("production + memory kapalıyken hata fırlatmaz", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DEMO_AUTH_ALLOW_IN_MEMORY", "false");
    expect(() => assertProductionMemoryPolicy()).not.toThrow();
  });

  it("Vercel demo deploy'da production + memory açıkken hata fırlatmaz", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DEMO_AUTH_ALLOW_IN_MEMORY", "true");
    vi.stubEnv("VERCEL", "1");
    expect(() => assertProductionMemoryPolicy()).not.toThrow();
  });
});
