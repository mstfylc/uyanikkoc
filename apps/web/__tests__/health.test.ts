import { describe, expect, it } from "vitest";

import { GET } from "@/app/api/health/route";

describe("GET /api/health", () => {
  it("returns status ok without auth secret diagnostics", async () => {
    const response = await GET();
    const body = (await response.json()) as {
      status: string;
      database: string;
      authSecret?: string;
    };

    expect(response.status).toBe(200);
    // No DATABASE_URL in the unit env, so the DB check is skipped, not failed.
    expect(body).toEqual({ status: "ok", database: "skipped" });
    expect(body.authSecret).toBeUndefined();
  });
});
