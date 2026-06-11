import { beforeEach, describe, expect, it, vi } from "vitest";

type Challenge = {
  phone: string;
  codeHash: string;
  attempts: number;
  consumedAt: Date | null;
  expiresAt: Date;
  createdAt: Date;
};

type Refresh = {
  tokenHash: string;
  userId: string;
  expiresAt: Date;
};

const challenges = new Map<string, Challenge>();
const refreshTokens = new Map<string, Refresh>();

const authRepository = {
  getOtpChallenge: vi.fn((phone: string) => Promise.resolve(challenges.get(phone) ?? null)),
  upsertOtpChallenge: vi.fn((input: { phone: string; codeHash: string; expiresAt: Date; createdAt: Date }) => {
    const challenge = {
      phone: input.phone,
      codeHash: input.codeHash,
      attempts: 0,
      consumedAt: null,
      expiresAt: input.expiresAt,
      createdAt: input.createdAt,
    };
    challenges.set(input.phone, challenge);
    return Promise.resolve(challenge);
  }),
  incrementOtpAttempts: vi.fn((phone: string) => {
    const challenge = challenges.get(phone);
    if (challenge) challenge.attempts += 1;
    return Promise.resolve();
  }),
  consumeOtpChallenge: vi.fn((phone: string, consumedAt: Date) => {
    const challenge = challenges.get(phone);
    if (challenge) challenge.consumedAt = consumedAt;
    return Promise.resolve();
  }),
  deleteOtpChallenge: vi.fn((phone: string) => {
    challenges.delete(phone);
    return Promise.resolve();
  }),
  createRefreshToken: vi.fn((input: Refresh) => {
    refreshTokens.set(input.tokenHash, input);
    return Promise.resolve();
  }),
  findRefreshToken: vi.fn((tokenHash: string) => Promise.resolve(refreshTokens.get(tokenHash) ?? null)),
  deleteRefreshToken: vi.fn((tokenHash: string) => {
    refreshTokens.delete(tokenHash);
    return Promise.resolve();
  }),
  findUserByEmail: vi.fn(() =>
    Promise.resolve({
      id: "user_student_db",
      email: "student@db.test",
      passwordHash: "hash",
      role: "STUDENT" as const,
      organizationId: "org",
      branchId: "branch",
      studentId: "student_db",
      coachId: null,
      parentId: null,
    }),
  ),
  findUserById: vi.fn(),
  upsertDeviceToken: vi.fn(),
  deleteDeviceToken: vi.fn(),
};

vi.mock("@uyanik/database", () => ({ authRepository }));

function lastSmsCode(spy: ReturnType<typeof vi.spyOn>): string {
  const msg = String(spy.mock.calls.at(-1)?.[0] ?? "");
  const match = /kodun:\s*(\d{6})/.exec(msg);
  return match ? match[1] : "";
}

beforeEach(() => {
  challenges.clear();
  refreshTokens.clear();
  vi.clearAllMocks();
  vi.resetModules();
  vi.stubEnv("DATABASE_URL", "postgresql://mobile-auth-db-test");
  vi.stubEnv("DEMO_AUTH_ALLOW_IN_MEMORY", "false");
  vi.stubEnv("AUTH_SECRET", "mobile-auth-db-secret-mobile-auth-db-secret");
  vi.stubEnv("MOBILE_OTP_USER_EMAIL", "student@db.test");
});

describe("mobile-auth DB OTP store", () => {
  it("enforces resend cooldown with 429", async () => {
    const { requestOtp } = await import("@/server/services/mobile-auth.service");
    vi.spyOn(console, "info").mockImplementation(() => {});
    await requestOtp("0555 111 22 33");
    await expect(requestOtp("0555 111 22 33")).rejects.toMatchObject({ status: 429, code: "too_many_requests" });
  });

  it("locks after max wrong attempts with 423", async () => {
    const { requestOtp, verifyOtpCode } = await import("@/server/services/mobile-auth.service");
    vi.spyOn(console, "info").mockImplementation(() => {});
    await requestOtp("0555 222 33 44");
    for (let index = 0; index < 5; index += 1) {
      await expect(verifyOtpCode("0555 222 33 44", "000000")).rejects.toMatchObject({ status: 401 });
    }
    await expect(verifyOtpCode("0555 222 33 44", "000000")).rejects.toMatchObject({ status: 423, code: "otp_locked" });
  });

  it("verifies a valid code and issues persistent refresh token", async () => {
    const { requestOtp, verifyOtpCode } = await import("@/server/services/mobile-auth.service");
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    await requestOtp("0555 333 44 55");
    const result = await verifyOtpCode("0555 333 44 55", lastSmsCode(spy));

    expect(result.user.role).toBe("student");
    expect(result.user.studentId).toBe("student_db");
    expect(result.accessToken).toBeTruthy();
    expect(result.refreshToken).toBeTruthy();
    expect(refreshTokens.size).toBe(1);
    expect(challenges.get("+905553334455")?.consumedAt).toBeInstanceOf(Date);
  });

  it("rejects expired challenges with 410", async () => {
    const { requestOtp, verifyOtpCode } = await import("@/server/services/mobile-auth.service");
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    await requestOtp("0555 444 55 66");
    const challenge = challenges.get("+905554445566");
    if (challenge) challenge.expiresAt = new Date(Date.now() - 1000);

    await expect(verifyOtpCode("0555 444 55 66", lastSmsCode(spy))).rejects.toMatchObject({ status: 410, code: "otp_expired" });
  });
});
