import { NextRequest, NextResponse } from "next/server";
import { describe, expect, it, vi, afterEach } from "vitest";
import { signAccess } from "@uyanik/shared/token";

vi.mock("@uyanik/database", () => ({
  authRepository: {
    findUserById: vi.fn(async () => null),
  },
}));

import { withMobileAuth } from "@/server/auth/withMobileAuth";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("mobile bearer guard", () => {
  it("rejects tokens that no longer map to a current database user", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DEMO_AUTH_ALLOW_IN_MEMORY", "false");
    vi.stubEnv("DATABASE_URL", "postgresql://example");
    vi.stubEnv("JWT_ACCESS_SECRET", "mobile-test-secret");

    const token = signAccess({ sub: "missing-user", role: "student" }, "mobile-test-secret");
    const handler = withMobileAuth(async () => NextResponse.json({ ok: true }), { role: "student" });
    const response = await handler(
      new NextRequest("https://koc.uyanik.com.tr/api/mobile/odev", {
        headers: { authorization: `Bearer ${token}` },
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({ code: "token_expired" });
  });
});
