import { afterEach, describe, expect, it, vi } from "vitest";

import {
  assertProductionAuthEnv,
  assertProductionMemoryPolicy,
  shouldUseDatabase,
  useMemoryStore,
} from "@/lib/data/env";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("useMemoryStore", () => {
  it("defaults to memory mode in development", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("DEMO_AUTH_ALLOW_IN_MEMORY", "");
    expect(useMemoryStore()).toBe(true);
  });

  it("turns memory mode off with false or 0", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("DEMO_AUTH_ALLOW_IN_MEMORY", "false");
    expect(useMemoryStore()).toBe(false);
    vi.stubEnv("DEMO_AUTH_ALLOW_IN_MEMORY", "0");
    expect(useMemoryStore()).toBe(false);
  });

  it("forces memory mode off in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DEMO_AUTH_ALLOW_IN_MEMORY", "true");
    expect(useMemoryStore()).toBe(false);
  });
});

describe("shouldUseDatabase", () => {
  it("returns true when DATABASE_URL exists and memory is off", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("DATABASE_URL", "postgresql://localhost/uyanik");
    vi.stubEnv("DEMO_AUTH_ALLOW_IN_MEMORY", "false");
    expect(shouldUseDatabase()).toBe(true);
  });

  it("returns false in development when memory is on", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("DATABASE_URL", "postgresql://localhost/uyanik");
    vi.stubEnv("DEMO_AUTH_ALLOW_IN_MEMORY", "true");
    expect(shouldUseDatabase()).toBe(false);
  });

  it("uses database in production even if the demo flag is mistakenly true", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DATABASE_URL", "postgresql://localhost/uyanik");
    vi.stubEnv("DEMO_AUTH_ALLOW_IN_MEMORY", "true");
    expect(shouldUseDatabase()).toBe(true);
  });
});

describe("assertProductionMemoryPolicy", () => {
  it("does not throw in development", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("DEMO_AUTH_ALLOW_IN_MEMORY", "true");
    expect(() => assertProductionMemoryPolicy()).not.toThrow();
  });

  it("throws in production when memory is enabled", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DEMO_AUTH_ALLOW_IN_MEMORY", "true");
    expect(() => assertProductionMemoryPolicy()).toThrow(/DEMO_AUTH_ALLOW_IN_MEMORY must be false/);
  });

  it("does not throw in production when memory is disabled", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DEMO_AUTH_ALLOW_IN_MEMORY", "false");
    expect(() => assertProductionMemoryPolicy()).not.toThrow();
  });

  it("throws in Vercel production when memory is enabled", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DEMO_AUTH_ALLOW_IN_MEMORY", "true");
    vi.stubEnv("VERCEL", "1");
    expect(() => assertProductionMemoryPolicy()).toThrow(/DEMO_AUTH_ALLOW_IN_MEMORY must be false/);
  });
});

describe("assertProductionAuthEnv", () => {
  const strongAuthSecret = "auth-secret-32-characters-minimum-value";
  const strongJwtSecret = "jwt-access-secret-32-characters-minimum-value";
  const strongOtpPepper = "otp-pepper-32-characters-minimum-value";

  it("does not require a secret in development", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("AUTH_SECRET", "");
    vi.stubEnv("NEXTAUTH_SECRET", "");
    expect(() => assertProductionAuthEnv()).not.toThrow();
  });

  it("requires AUTH_SECRET or NEXTAUTH_SECRET in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("AUTH_SECRET", "");
    vi.stubEnv("NEXTAUTH_SECRET", "");
    expect(() => assertProductionAuthEnv()).toThrow(/AUTH_SECRET or NEXTAUTH_SECRET is required/);
  });

  it("rejects weak production auth secrets", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("AUTH_SECRET", "test-secret");
    vi.stubEnv("NEXTAUTH_SECRET", "");
    vi.stubEnv("JWT_ACCESS_SECRET", strongJwtSecret);
    vi.stubEnv("OTP_PEPPER", strongOtpPepper);
    expect(() => assertProductionAuthEnv()).toThrow(/AUTH_SECRET or NEXTAUTH_SECRET must be at least 32/);
  });

  it("requires distinct mobile and OTP production secrets", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("AUTH_SECRET", strongAuthSecret);
    vi.stubEnv("NEXTAUTH_SECRET", "");
    vi.stubEnv("JWT_ACCESS_SECRET", strongAuthSecret);
    vi.stubEnv("OTP_PEPPER", strongOtpPepper);
    expect(() => assertProductionAuthEnv()).toThrow(/JWT_ACCESS_SECRET must be different/);
  });

  it("does not throw in production when all required secrets are strong and distinct", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("AUTH_SECRET", strongAuthSecret);
    vi.stubEnv("NEXTAUTH_SECRET", "");
    vi.stubEnv("JWT_ACCESS_SECRET", strongJwtSecret);
    vi.stubEnv("OTP_PEPPER", strongOtpPepper);
    expect(() => assertProductionAuthEnv()).not.toThrow();
  });
});
