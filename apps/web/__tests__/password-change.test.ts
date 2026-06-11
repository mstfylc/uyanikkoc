import { hash } from "bcryptjs";
import { afterEach, describe, expect, it, vi } from "vitest";

import { changeOwnPassword } from "@/server/services/password-change.service";

const findUserById = vi.fn();
const updateUserPasswordById = vi.fn();

vi.mock("@uyanik/database", () => ({
  authRepository: {
    findUserById,
    updateUserPasswordById,
  },
}));

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("password change", () => {
  it("changes password when current password is valid", async () => {
    vi.stubEnv("DATABASE_URL", "postgres://example");
    vi.stubEnv("DEMO_AUTH_ALLOW_IN_MEMORY", "false");
    findUserById.mockResolvedValue({
      id: "user_1",
      passwordHash: await hash("eski123", 10),
    });
    updateUserPasswordById.mockResolvedValue(true);

    await expect(
      changeOwnPassword({
        userId: "user_1",
        currentPassword: "eski123",
        newPassword: "yeni123",
      }),
    ).resolves.toBe("changed");

    expect(updateUserPasswordById).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user_1" }),
    );
  });

  it("rejects wrong current password", async () => {
    vi.stubEnv("DATABASE_URL", "postgres://example");
    vi.stubEnv("DEMO_AUTH_ALLOW_IN_MEMORY", "false");
    findUserById.mockResolvedValue({
      id: "user_1",
      passwordHash: await hash("eski123", 10),
    });

    await expect(
      changeOwnPassword({
        userId: "user_1",
        currentPassword: "yanlis",
        newPassword: "yeni123",
      }),
    ).resolves.toBe("invalid_current");

    expect(updateUserPasswordById).not.toHaveBeenCalled();
  });
});
