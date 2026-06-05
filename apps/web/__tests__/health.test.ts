import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/health/route";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("GET /api/health", () => {
  it("returns status ok and database memory in demo mode", async () => {
    vi.stubEnv("DEMO_AUTH_ALLOW_IN_MEMORY", "true");
    vi.stubEnv("DATABASE_URL", "postgresql://localhost/uyanik");

    const response = await GET();
    const body = (await response.json()) as { status: string; database: string };

    expect(response.status).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.database).toBe("memory");
  });
});
