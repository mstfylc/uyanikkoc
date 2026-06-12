import { describe, expect, it } from "vitest";

import { GET } from "@/app/api/health/route";

describe("GET /api/health", () => {
  it("returns status ok and auth secret diagnostics", async () => {
    const response = await GET();
    const body = (await response.json()) as { status: string; authSecret: string };

    expect(response.status).toBe(200);
    expect(body).toEqual({ status: "ok", authSecret: "missing" });
  });
});
