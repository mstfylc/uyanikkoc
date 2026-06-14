import { beforeEach, describe, expect, it, vi } from "vitest";

const userFindUnique = vi.fn();
const userUpdateMany = vi.fn();
const passwordResetCreate = vi.fn();

vi.mock("../../../packages/database/src/client", () => ({
  prisma: {
    user: {
      findUnique: userFindUnique,
      updateMany: userUpdateMany,
    },
    passwordResetToken: {
      create: passwordResetCreate,
    },
  },
}));

describe("auth repository soft delete guards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("hides deleted users from login lookups", async () => {
    userFindUnique.mockResolvedValue({
      id: "user_deleted",
      email: "deleted@example.com",
      name: "Deleted User",
      phone: null,
      passwordHash: "hash",
      role: "STUDENT",
      status: "deleted",
      deletedAt: new Date("2026-06-14T12:00:00.000Z"),
      organizationId: "org_demo",
      branchId: "branch_demo",
      studentProfile: { id: "student_deleted" },
      coachProfile: null,
      parentProfile: null,
    });

    const { findUserByEmail } = await import("../../../packages/database/src/repositories/auth");

    await expect(findUserByEmail(" DELETED@example.com ")).resolves.toBeNull();
    expect(userFindUnique).toHaveBeenCalledWith({
      where: { email: "deleted@example.com" },
      include: {
        studentProfile: true,
        coachProfile: true,
        parentProfile: true,
      },
    });
  });

  it("does not issue password reset tokens for deleted users", async () => {
    userFindUnique.mockResolvedValue({
      id: "user_deleted",
      email: "deleted@example.com",
      status: "deleted",
      deletedAt: new Date("2026-06-14T12:00:00.000Z"),
    });

    const { createPasswordResetToken } = await import("../../../packages/database/src/repositories/auth");

    const result = await createPasswordResetToken({
      email: "deleted@example.com",
      tokenHash: "token_hash",
      expiresAt: new Date("2026-06-14T13:00:00.000Z"),
    });

    expect(result).toBeNull();
    expect(passwordResetCreate).not.toHaveBeenCalled();
  });

  it("marks users deleted with a restore window and can restore them", async () => {
    userUpdateMany.mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 1 });
    const now = new Date("2026-06-14T12:00:00.000Z");
    const { softDeleteUserById, restoreUserById } = await import(
      "../../../packages/database/src/repositories/auth"
    );

    await expect(
      softDeleteUserById({
        userId: "user_1",
        deletedById: "admin_1",
        reason: "test",
        now,
        retentionDays: 30,
      }),
    ).resolves.toBe(true);
    await expect(restoreUserById("user_1")).resolves.toBe(true);

    expect(userUpdateMany).toHaveBeenNthCalledWith(1, {
      where: { id: "user_1", status: { not: "deleted" } },
      data: {
        status: "deleted",
        deletedAt: now,
        deletedById: "admin_1",
        deleteReason: "test",
        restoreUntil: new Date("2026-07-14T12:00:00.000Z"),
      },
    });
    expect(userUpdateMany).toHaveBeenNthCalledWith(2, {
      where: { id: "user_1", status: "deleted" },
      data: {
        status: "active",
        deletedAt: null,
        deletedById: null,
        deleteReason: null,
        restoreUntil: null,
      },
    });
  });
});
