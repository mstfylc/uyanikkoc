import { randomBytes, createHash } from "crypto";
import { hash } from "bcryptjs";

import { shouldUseDatabase } from "@/lib/data/env";
import { demoUsers } from "@/lib/auth/demo-users";
import { isPasswordAllowed } from "@/lib/auth/password-policy";
import { sendPasswordResetMail } from "./mail.service";
import {
  assertAuthNotRateLimited,
  AuthRateLimitError,
  normalizeRateLimitEmail,
  recordAuthFailure,
} from "./auth-rate-limit.service";

const RESET_TTL_MS = 1000 * 60 * 30;
const RESET_TTL_MINUTES = RESET_TTL_MS / 60_000;

const globalStore = globalThis as typeof globalThis & {
  __uyanikPasswordResetTokens?: Map<string, { email: string; expiresAt: number; used: boolean }>;
};

const memoryTokens =
  globalStore.__uyanikPasswordResetTokens ?? (globalStore.__uyanikPasswordResetTokens = new Map());

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function publicBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    "http://localhost:3000"
  );
}

function resetUrl(token: string): string {
  return `${publicBaseUrl().replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(token)}`;
}

export async function requestPasswordReset(emailInput: string): Promise<{
  accepted: true;
  resetUrl?: string;
}>;
export async function requestPasswordReset(
  emailInput: string,
  opts: { ip?: string },
): Promise<{
  accepted: true;
  resetUrl?: string;
}>;
export async function requestPasswordReset(
  emailInput: string,
  opts?: { ip?: string },
): Promise<{
  accepted: true;
  resetUrl?: string;
}> {
  const email = normalizeRateLimitEmail(emailInput);
  const ip = opts?.ip ?? "unknown";

  try {
    await assertAuthNotRateLimited({ scope: "password_reset", email, ip });
  } catch (error) {
    if (error instanceof AuthRateLimitError) {
      return { accepted: true };
    }
    throw error;
  }

  await recordAuthFailure({ scope: "password_reset", email, ip });

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + RESET_TTL_MS);

  if (shouldUseDatabase()) {
    const { authRepository } = await import("@uyanik/database");
    const created = await authRepository.createPasswordResetToken({
      email,
      tokenHash: hashToken(token),
      expiresAt,
    });

    if (created) {
      await sendPasswordResetMail({
        to: created.email,
        resetUrl: resetUrl(token),
        expiresInMinutes: RESET_TTL_MINUTES,
      });
    }

    return {
      accepted: true,
      resetUrl: created && process.env.NODE_ENV !== "production" ? resetUrl(token) : undefined,
    };
  }

  if (demoUsers.some((user) => user.email === email)) {
    memoryTokens.set(hashToken(token), { email, expiresAt: expiresAt.getTime(), used: false });
    await sendPasswordResetMail({
      to: email,
      resetUrl: resetUrl(token),
      expiresInMinutes: RESET_TTL_MINUTES,
    });
    return { accepted: true, resetUrl: resetUrl(token) };
  }

  return { accepted: true };
}

export async function confirmPasswordReset(token: string, password: string): Promise<boolean> {
  if (!isPasswordAllowed(password)) {
    return false;
  }

  const tokenHash = hashToken(token);

  if (shouldUseDatabase()) {
    const { authRepository } = await import("@uyanik/database");
    return authRepository.resetPasswordWithToken({
      tokenHash,
      passwordHash: await hash(password, 10),
    });
  }

  const record = memoryTokens.get(tokenHash);
  if (!record || record.used || record.expiresAt <= Date.now()) {
    return false;
  }
  record.used = true;
  memoryTokens.set(tokenHash, record);
  return true;
}
