import { hashSync } from "bcryptjs";
import { beforeEach, describe, expect, it, vi } from "vitest";

const RESET_MESSAGE = "Bu e-posta kayıtlıysa şifre sıfırlama bağlantısı oluşturuldu.";
const WINDOW_MS = 15 * 60 * 1000;

type Attempt = {
  scope: "web_login" | "password_reset";
  email: string;
  ip: string;
  createdAt: number;
  expiresAt: number;
};

const attempts: Attempt[] = [];
const findUserByEmail = vi.fn();
const createPasswordResetToken = vi.fn();
const sendPasswordResetMail = vi.fn();

vi.mock("@uyanik/database", () => ({
  authRepository: {
    findUserByEmail,
    countRecentLoginAttempts: vi.fn(async (input: {
      scope: Attempt["scope"];
      email: string;
      ip: string;
      since: Date;
      now: Date;
    }) => {
      const now = input.now.getTime();
      for (let i = attempts.length - 1; i >= 0; i -= 1) {
        if (attempts[i].expiresAt <= now) attempts.splice(i, 1);
      }
      return attempts.filter((attempt) => (
        attempt.scope === input.scope &&
        attempt.email === input.email &&
        attempt.ip === input.ip &&
        attempt.createdAt >= input.since.getTime() &&
        attempt.expiresAt > now
      )).length;
    }),
    recordLoginAttempt: vi.fn(async (input: {
      scope: Attempt["scope"];
      email: string;
      ip: string;
      expiresAt: Date;
    }) => {
      attempts.push({
        scope: input.scope,
        email: input.email,
        ip: input.ip,
        createdAt: Date.now(),
        expiresAt: input.expiresAt.getTime(),
      });
    }),
    clearLoginAttempts: vi.fn(async (input: {
      scope: Attempt["scope"];
      email: string;
      ip: string;
    }) => {
      for (let i = attempts.length - 1; i >= 0; i -= 1) {
        const attempt = attempts[i];
        if (attempt.scope === input.scope && attempt.email === input.email && attempt.ip === input.ip) {
          attempts.splice(i, 1);
        }
      }
    }),
    createPasswordResetToken,
  },
}));

vi.mock("@/server/services/mail.service", () => ({
  sendPasswordResetMail,
}));

vi.mock("next-auth", () => ({
  default: () => ({
    handlers: {},
    auth: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  }),
}));

vi.mock("next-auth/providers/credentials", () => ({
  default: (config: unknown) => config,
}));

function headers(ip = "203.0.113.10"): Headers {
  return new Headers({ "x-forwarded-for": ip });
}

async function loadAuth() {
  vi.stubEnv("DATABASE_URL", "postgresql://rate-limit-test");
  vi.stubEnv("DEMO_AUTH_ALLOW_IN_MEMORY", "false");
  vi.stubEnv("AUTH_SECRET", "rate-limit-secret");
  vi.stubEnv("NEXTAUTH_SECRET", "rate-limit-secret");
  return import("@/auth");
}

describe("web auth rate limiting", () => {
  beforeEach(() => {
    attempts.length = 0;
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-11T12:00:00.000Z"));
    findUserByEmail.mockResolvedValue({
      id: "user_student_001",
      email: "student@uyanik.local",
      passwordHash: hashSync("uyanik123", 4),
      role: "STUDENT",
      organizationId: "org_demo_001",
      branchId: "branch_demo_001",
      studentId: "student_001",
      coachId: null,
      parentId: null,
    });
  });

  it("allows attempts below the threshold and clears failures after a valid login", async () => {
    const { authorizeCredentials } = await loadAuth();

    for (let i = 0; i < 4; i += 1) {
      await expect(authorizeCredentials(
        { email: "student@uyanik.local", password: "wrong" },
        { headers: headers() },
      )).resolves.toBeNull();
    }

    await expect(authorizeCredentials(
      { email: "student@uyanik.local", password: "uyanik123" },
      { headers: headers() },
    )).resolves.toMatchObject({ id: "user_student_001", role: "student" });
    expect(attempts).toHaveLength(0);
  });

  it("blocks attempts above the threshold and opens after cooldown", async () => {
    const { authorizeCredentials } = await loadAuth();

    for (let i = 0; i < 5; i += 1) {
      await authorizeCredentials({ email: "student@uyanik.local", password: "wrong" }, { headers: headers() });
    }

    await expect(authorizeCredentials(
      { email: "student@uyanik.local", password: "uyanik123" },
      { headers: headers() },
    )).rejects.toMatchObject({ name: "AuthRateLimitError" });

    vi.setSystemTime(new Date(Date.now() + WINDOW_MS + 1));
    await expect(authorizeCredentials(
      { email: "student@uyanik.local", password: "uyanik123" },
      { headers: headers() },
    )).resolves.toMatchObject({ id: "user_student_001" });
  });
});

describe("password reset rate limiting", () => {
  beforeEach(() => {
    attempts.length = 0;
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-11T12:00:00.000Z"));
    createPasswordResetToken.mockResolvedValue({ userId: "user_student_001", email: "student@uyanik.local" });
    sendPasswordResetMail.mockResolvedValue(undefined);
  });

  it("keeps the enumeration response stable while throttling reset creation", async () => {
    vi.stubEnv("DATABASE_URL", "postgresql://rate-limit-test");
    vi.stubEnv("DEMO_AUTH_ALLOW_IN_MEMORY", "false");
    const { POST } = await import("@/app/api/auth/password-reset/request/route");

    const request = () => new Request("https://uyanik.test/api/auth/password-reset/request", {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ email: "student@uyanik.local" }),
    });

    for (let i = 0; i < 5; i += 1) {
      const response = await POST(request());
      await expect(response.json()).resolves.toMatchObject({ ok: true, message: RESET_MESSAGE });
    }

    const throttled = await POST(request());
    await expect(throttled.json()).resolves.toMatchObject({ ok: true, message: RESET_MESSAGE });
    expect(createPasswordResetToken).toHaveBeenCalledTimes(5);

    vi.setSystemTime(new Date(Date.now() + WINDOW_MS + 1));
    const reopened = await POST(request());
    await expect(reopened.json()).resolves.toMatchObject({ ok: true, message: RESET_MESSAGE });
    expect(createPasswordResetToken).toHaveBeenCalledTimes(6);
  });
});
