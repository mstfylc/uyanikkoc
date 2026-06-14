import { afterEach, describe, expect, it, vi } from "vitest";

import nextConfig from "../next.config.mjs";
import { GET as health } from "@/app/api/health/route";
import { minimumPasswordLength } from "@/lib/auth/password-policy";
import { applyAdminMutation } from "@/server/services/admin.service";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("security hardening", () => {
  it("does not expose auth secret diagnostics through health", async () => {
    const response = await health();
    const body = (await response.json()) as Record<string, unknown>;

    expect(response.status).toBe(200);
    expect(body.status).toBe("ok");
    expect(body).not.toHaveProperty("authSecret");
  });

  it("enforces a longer password minimum in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(minimumPasswordLength()).toBe(8);
  });

  it("blocks resetDemo mutations in production", async () => {
    vi.stubEnv("NODE_ENV", "production");

    await expect(applyAdminMutation({ kind: "resetDemo" })).rejects.toThrow(/disabled in production/);
  });

  it("sets browser isolation security headers", async () => {
    const headers = await nextConfig.headers?.();
    const headerMap = new Map(headers?.[0]?.headers.map((header) => [header.key, header.value]));

    expect(headerMap.get("Cross-Origin-Opener-Policy")).toBe("same-origin");
    expect(headerMap.get("Cross-Origin-Resource-Policy")).toBe("same-origin");
    expect(headerMap.get("X-DNS-Prefetch-Control")).toBe("off");
  });
});
