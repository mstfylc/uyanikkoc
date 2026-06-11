import { compareSync } from "bcryptjs";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DEMO_PASSWORD, DEMO_PASSWORD_HASH, demoUsers } from "@/lib/auth/demo-users";
import { resolveUserByEmail } from "@/lib/auth/resolve-user";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("demo auth users", () => {
  it("demo password hash uyanik123 ile eşleşir", () => {
    expect(compareSync(DEMO_PASSWORD, DEMO_PASSWORD_HASH)).toBe(true);
  });

  it("kaldirilan local demo hesaplari listede yoktur", () => {
    for (const email of ["admin@uyanik.local", "coach@uyanik.local", "student@uyanik.local", "parent@uyanik.local"]) {
      expect(demoUsers.some((entry) => entry.email === email)).toBe(false);
    }
  });

  it("super admin demo hesabi vardir", () => {
    const user = demoUsers.find((entry) => entry.email === "superadmin@uyanik.local");
    expect(user?.role).toBe("ORG_ADMIN");
    expect(compareSync(DEMO_PASSWORD, user!.passwordHash)).toBe(true);
  });

  it("kampus koc kurum yoneticisi demo hesabi vardir", async () => {
    const user = demoUsers.find((entry) => entry.email === "incisel@kampuskoc.com");
    expect(user?.role).toBe("BRANCH_MANAGER");
    expect(user?.organizationId).toBe("akademi-yildiz");
    expect(compareSync(DEMO_PASSWORD, user!.passwordHash)).toBe(true);

    await expect(resolveUserByEmail(" INCiSEL@KAMPUSKOC.COM ")).resolves.toMatchObject({
      email: "incisel@kampuskoc.com",
      role: "BRANCH_MANAGER",
      organizationId: "akademi-yildiz",
    });
  });

  it("production ortaminda demo fallback kapaliyken demo hesabi reddeder", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DEMO_AUTH_ALLOW_IN_MEMORY", "false");
    vi.stubEnv("DATABASE_URL", "");

    await expect(resolveUserByEmail("admin@uyanik.local")).resolves.toBeNull();
  });
});
