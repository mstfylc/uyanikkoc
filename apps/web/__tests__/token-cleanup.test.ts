import { beforeEach, describe, expect, it, vi } from "vitest";

const purgeExpiredAuthArtifacts = vi.fn();

type ExpiringRow = {
  id: string;
  expiresAt: Date;
};

let refreshTokens: ExpiringRow[] = [];
let passwordResetTokens: ExpiringRow[] = [];
let otpChallenges: ExpiringRow[] = [];

function deleteExpired(rows: ExpiringRow[], now: Date): { count: number; remaining: ExpiringRow[] } {
  const expired = rows.filter((row) => row.expiresAt <= now);
  return {
    count: expired.length,
    remaining: rows.filter((row) => row.expiresAt > now),
  };
}

vi.mock("../../../packages/database/src/client", () => ({
  prisma: {
    refreshToken: {
      deleteMany: vi.fn(({ where }: { where: { expiresAt: { lte: Date } } }) => {
        const result = deleteExpired(refreshTokens, where.expiresAt.lte);
        refreshTokens = result.remaining;
        return { count: result.count };
      }),
    },
    passwordResetToken: {
      deleteMany: vi.fn(({ where }: { where: { expiresAt: { lte: Date } } }) => {
        const result = deleteExpired(passwordResetTokens, where.expiresAt.lte);
        passwordResetTokens = result.remaining;
        return { count: result.count };
      }),
    },
    otpChallenge: {
      deleteMany: vi.fn(({ where }: { where: { expiresAt: { lte: Date } } }) => {
        const result = deleteExpired(otpChallenges, where.expiresAt.lte);
        otpChallenges = result.remaining;
        return { count: result.count };
      }),
    },
    $transaction: vi.fn(async (operations: Array<{ count: number }>) => operations),
  },
}));

describe("token cleanup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    purgeExpiredAuthArtifacts.mockResolvedValue({
      refreshTokens: 2,
      passwordResetTokens: 3,
      otpChallenges: 5,
      total: 10,
    });
  });

  it("purges expired auth artifacts while keeping valid rows", async () => {
    const now = new Date("2026-06-13T12:00:00.000Z");
    refreshTokens = [
      { id: "refresh-expired-1", expiresAt: new Date("2026-06-13T11:59:59.000Z") },
      { id: "refresh-expired-2", expiresAt: now },
      { id: "refresh-valid", expiresAt: new Date("2026-06-13T12:00:01.000Z") },
    ];
    passwordResetTokens = [
      { id: "reset-expired", expiresAt: new Date("2026-06-12T12:00:00.000Z") },
      { id: "reset-valid", expiresAt: new Date("2026-06-14T12:00:00.000Z") },
    ];
    otpChallenges = [
      { id: "otp-expired-1", expiresAt: new Date("2026-06-13T10:00:00.000Z") },
      { id: "otp-expired-2", expiresAt: new Date("2026-06-13T11:00:00.000Z") },
      { id: "otp-expired-3", expiresAt: now },
      { id: "otp-valid", expiresAt: new Date("2026-06-13T12:01:00.000Z") },
    ];

    const { purgeExpiredAuthArtifacts: purgeRepositoryArtifacts } = await import(
      "../../../packages/database/src/repositories/auth"
    );

    const result = await purgeRepositoryArtifacts(now);

    expect(result).toEqual({
      refreshTokens: 2,
      passwordResetTokens: 1,
      otpChallenges: 3,
      total: 6,
    });
    expect(refreshTokens.map((row) => row.id)).toEqual(["refresh-valid"]);
    expect(passwordResetTokens.map((row) => row.id)).toEqual(["reset-valid"]);
    expect(otpChallenges.map((row) => row.id)).toEqual(["otp-valid"]);
  });

  it("runs the worker cleanup job through the auth repository", async () => {
    vi.resetModules();
    vi.doMock("@uyanik/database", () => ({
      authRepository: {
        purgeExpiredAuthArtifacts,
      },
    }));

    const { runTokenCleanupJob } = await import("../../../apps/worker/src/jobs/token-cleanup");
    const now = new Date("2026-06-13T12:00:00.000Z");

    const result = await runTokenCleanupJob(now);

    expect(purgeExpiredAuthArtifacts).toHaveBeenCalledWith(now);
    expect(result).toEqual({
      refreshTokens: 2,
      passwordResetTokens: 3,
      otpChallenges: 5,
      total: 10,
    });

    vi.doUnmock("@uyanik/database");
  });
});
