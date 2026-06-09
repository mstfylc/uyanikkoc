import { afterEach, describe, expect, it, vi } from "vitest";

const findFirst = vi.hoisted(() => vi.fn());

vi.mock("@uyanik/database", () => ({
  prisma: {
    license: {
      findFirst,
    },
  },
}));

import { resolveActiveLicenseForUser } from "@/lib/auth/resolve-license";

function license(overrides: Partial<Awaited<ReturnType<typeof findFirst>>> = {}) {
  return {
    id: "license_1",
    ownerType: "coach",
    ownerId: "coach_1",
    planId: "plus",
    status: "active",
    startedAt: new Date("2026-01-01T00:00:00.000Z"),
    expiresAt: new Date("2026-12-31T00:00:00.000Z"),
    canceledAt: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

afterEach(() => {
  findFirst.mockReset();
  vi.unstubAllEnvs();
});

describe("resolveActiveLicenseForUser", () => {
  it("allows an active coach license", async () => {
    vi.stubEnv("DATABASE_URL", "postgresql://localhost/uyanik");
    vi.stubEnv("DEMO_AUTH_ALLOW_IN_MEMORY", "false");
    findFirst.mockResolvedValueOnce(license({ ownerType: "coach", ownerId: "coach_001" }));

    const result = await resolveActiveLicenseForUser(
      { id: "user_1", role: "coach", coachId: "coach_001" },
      new Date("2026-06-09T00:00:00.000Z"),
    );

    expect(result.hasActiveLicense).toBe(true);
    expect(result.reason).toBe("active");
    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ ownerType: "coach", ownerId: "coach_001" }),
      }),
    );
  });

  it("allows an active organization license for branch users", async () => {
    vi.stubEnv("DATABASE_URL", "postgresql://localhost/uyanik");
    vi.stubEnv("DEMO_AUTH_ALLOW_IN_MEMORY", "false");
    findFirst.mockResolvedValueOnce(license({ ownerType: "organization", ownerId: "org_demo_001" }));

    const result = await resolveActiveLicenseForUser(
      { id: "user_2", role: "branch", organizationId: "org_demo_001" },
      new Date("2026-06-09T00:00:00.000Z"),
    );

    expect(result.hasActiveLicense).toBe(true);
    expect(result.reason).toBe("active");
    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ ownerType: "organization", ownerId: "org_demo_001" }),
      }),
    );
  });

  it("denies canceled coach licenses", async () => {
    vi.stubEnv("DATABASE_URL", "postgresql://localhost/uyanik");
    vi.stubEnv("DEMO_AUTH_ALLOW_IN_MEMORY", "false");
    findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(license({ status: "canceled" }));

    const result = await resolveActiveLicenseForUser(
      { id: "user_3", role: "coach", coachId: "coach_canceled_fixture" },
      new Date("2026-06-09T00:00:00.000Z"),
    );

    expect(result.hasActiveLicense).toBe(false);
    expect(result.reason).toBe("inactive_status");
  });

  it("denies expired organization licenses", async () => {
    vi.stubEnv("DATABASE_URL", "postgresql://localhost/uyanik");
    vi.stubEnv("DEMO_AUTH_ALLOW_IN_MEMORY", "false");
    findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(license({ expiresAt: new Date("2026-01-01T00:00:00.000Z") }));

    const result = await resolveActiveLicenseForUser(
      { id: "user_4", role: "branch", organizationId: "org_expired_fixture" },
      new Date("2026-06-09T00:00:00.000Z"),
    );

    expect(result.hasActiveLicense).toBe(false);
    expect(result.reason).toBe("expired");
  });

  it("denies users without a matching license", async () => {
    vi.stubEnv("DATABASE_URL", "postgresql://localhost/uyanik");
    vi.stubEnv("DEMO_AUTH_ALLOW_IN_MEMORY", "false");
    findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(null);

    const result = await resolveActiveLicenseForUser(
      { id: "user_5", role: "coach", coachId: "coach_missing" },
      new Date("2026-06-09T00:00:00.000Z"),
    );

    expect(result.hasActiveLicense).toBe(false);
    expect(result.reason).toBe("not_found");
  });

  it("exempts platform super admins from tenant license checks", async () => {
    vi.stubEnv("DATABASE_URL", "postgresql://localhost/uyanik");
    vi.stubEnv("DEMO_AUTH_ALLOW_IN_MEMORY", "false");

    const result = await resolveActiveLicenseForUser(
      { id: "admin_1", role: "admin", organizationId: "org_demo_001" },
      new Date("2026-06-09T00:00:00.000Z"),
    );

    expect(result.hasActiveLicense).toBe(true);
    expect(result.reason).toBe("platform_admin_exempt");
    expect(findFirst).not.toHaveBeenCalled();
  });
});
