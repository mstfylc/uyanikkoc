import { shouldUseDatabase } from "@/lib/data/env";

export type AuthRateLimitScope = "web_login" | "password_reset";

const RATE_LIMIT_MAX_FAILURES = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const FALLBACK_IP = "unknown";

type PrismaLikeError = {
  code?: unknown;
  message?: unknown;
  meta?: {
    modelName?: unknown;
  };
};

export class AuthRateLimitError extends Error {
  readonly retryAfterMs: number;

  constructor(retryAfterMs: number) {
    super("Too many authentication attempts");
    this.name = "AuthRateLimitError";
    this.retryAfterMs = retryAfterMs;
  }
}

export function normalizeRateLimitEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function clientIpFromHeaders(headers: Headers | null | undefined): string {
  const forwarded = headers?.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (
    forwarded ||
    headers?.get("x-real-ip")?.trim() ||
    headers?.get("cf-connecting-ip")?.trim() ||
    FALLBACK_IP
  );
}

function isMissingLoginAttemptStore(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const candidate = error as PrismaLikeError;
  const message = typeof candidate.message === "string" ? candidate.message : "";
  return (
    candidate.code === "P2021" ||
    candidate.meta?.modelName === "LoginAttempt" ||
    message.includes("login_attempts")
  );
}

async function countRecent(scope: AuthRateLimitScope, email: string, ip: string, now: Date): Promise<number> {
  if (!shouldUseDatabase()) {
    return 0;
  }

  const { authRepository } = await import("@uyanik/database");
  try {
    return await authRepository.countRecentLoginAttempts({
      scope,
      email,
      ip,
      now,
      since: new Date(now.getTime() - RATE_LIMIT_WINDOW_MS),
    });
  } catch (error) {
    if (isMissingLoginAttemptStore(error)) {
      return 0;
    }
    throw error;
  }
}

export async function assertAuthNotRateLimited(input: {
  scope: AuthRateLimitScope;
  email: string;
  ip: string;
  now?: Date;
}): Promise<void> {
  const now = input.now ?? new Date();
  const count = await countRecent(input.scope, input.email, input.ip, now);
  if (count >= RATE_LIMIT_MAX_FAILURES) {
    throw new AuthRateLimitError(RATE_LIMIT_WINDOW_MS);
  }
}

export async function recordAuthFailure(input: {
  scope: AuthRateLimitScope;
  email: string;
  ip: string;
  now?: Date;
}): Promise<void> {
  if (!shouldUseDatabase()) {
    return;
  }

  const now = input.now ?? new Date();
  const { authRepository } = await import("@uyanik/database");
  try {
    await authRepository.recordLoginAttempt({
      scope: input.scope,
      email: input.email,
      ip: input.ip,
      expiresAt: new Date(now.getTime() + RATE_LIMIT_WINDOW_MS),
    });
  } catch (error) {
    if (!isMissingLoginAttemptStore(error)) {
      throw error;
    }
  }
}

export async function clearAuthFailures(input: {
  scope: AuthRateLimitScope;
  email: string;
  ip: string;
}): Promise<void> {
  if (!shouldUseDatabase()) {
    return;
  }

  const { authRepository } = await import("@uyanik/database");
  try {
    await authRepository.clearLoginAttempts(input);
  } catch (error) {
    if (!isMissingLoginAttemptStore(error)) {
      throw error;
    }
  }
}
