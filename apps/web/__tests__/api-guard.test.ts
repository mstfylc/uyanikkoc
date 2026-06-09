import { NextRequest, NextResponse } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(async () => null),
}));

import { requireAuth, withApiAuth } from "@/lib/auth/api-guard";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("api auth guard", () => {
  it("returns 401 for anonymous admin snapshot-style requests", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DEMO_AUTH_ALLOW_IN_MEMORY", "false");
    vi.stubEnv("AUTH_SECRET", "test-secret");

    const req = new NextRequest("https://koc.uyanik.com.tr/api/admin/snapshot");
    const result = await requireAuth(req, ["admin", "branch", "coach"]);

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(401);
  });

  it("keeps protected API handlers behind the same 401 guard", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DEMO_AUTH_ALLOW_IN_MEMORY", "false");
    vi.stubEnv("AUTH_SECRET", "test-secret");

    const handler = withApiAuth(["admin"], async () => NextResponse.json({ ok: true }));
    const response = await handler(new NextRequest("https://koc.uyanik.com.tr/api/admin/snapshot"));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
  });
});
