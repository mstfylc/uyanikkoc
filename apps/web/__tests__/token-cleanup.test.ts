import { beforeEach, describe, expect, it, vi } from "vitest";

const purgeExpiredAuthArtifacts = vi.fn();

vi.mock("@uyanik/database", () => ({
  authRepository: {
    purgeExpiredAuthArtifacts,
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

  it("runs the worker cleanup job through the auth repository", async () => {
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
  });
});
