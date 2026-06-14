import { compare } from "bcryptjs";
import { normalizePhoneTR } from "@uyanik/shared";
import {
  generateOtp,
  hashOtp,
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_MS,
  otpExpiry,
  verifyOtp,
} from "@uyanik/shared/otp";
import { generateRefreshToken, hashRefreshToken, refreshExpiry, signAccess } from "@uyanik/shared/token";
import { shouldUseDatabase } from "@/lib/data/env";
import { resolveUserByEmail } from "@/lib/auth/resolve-user";
import {
  assertAuthNotRateLimited,
  AuthRateLimitError,
  clearAuthFailures,
  normalizeRateLimitEmail,
  recordAuthFailure,
} from "@/server/services/auth-rate-limit.service";
import {
  accessSecret,
  demoStudentRecord,
  findDemoUserById,
  otpPepper,
  toApiUser,
  type ApiUser,
} from "@/server/auth/mobile-tokens";
import { sendSms, SmsError } from "@/server/services/sms.service";
import type { AuthUserRecord } from "@uyanik/database";

export class MobileAuthError extends Error {
  readonly status: number;
  readonly code: string;
  readonly extra?: Record<string, unknown>;

  constructor(status: number, message: string, code: string, extra?: Record<string, unknown>) {
    super(message);
    this.name = "MobileAuthError";
    this.status = status;
    this.code = code;
    this.extra = extra;
  }
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult extends TokenPair {
  user: ApiUser;
}

interface OtpEntry {
  codeHash: string;
  attempts: number;
  consumedAt: Date | null;
  expiresAt: Date;
  createdAt: Date;
}

interface RefreshEntry {
  userId: string;
  expiresAt: Date;
}

interface MobileStores {
  otp: Map<string, OtpEntry>;
  refresh: Map<string, RefreshEntry>;
  device: Map<string, Set<string>>;
}

const globalRef = globalThis as typeof globalThis & { __ukMobileStores?: MobileStores };
const stores: MobileStores = (globalRef.__ukMobileStores ??= {
  otp: new Map(),
  refresh: new Map(),
  device: new Map(),
});
const otpStore = stores.otp;
const refreshStore = stores.refresh;
const deviceStore = stores.device;

async function authRepo() {
  const { authRepository } = await import("@uyanik/database");
  return authRepository;
}

async function issueTokens(record: AuthUserRecord, phone?: string): Promise<AuthResult> {
  const apiUser = toApiUser(record, phone);
  const accessToken = signAccess({ sub: record.id, role: apiUser.role }, accessSecret());
  const refreshToken = generateRefreshToken();
  const tokenHash = hashRefreshToken(refreshToken);
  const expiresAt = refreshExpiry();

  if (shouldUseDatabase()) {
    await (await authRepo()).createRefreshToken({ tokenHash, userId: record.id, expiresAt });
  } else {
    refreshStore.set(tokenHash, { userId: record.id, expiresAt });
  }

  return { accessToken, refreshToken, user: apiUser };
}

export async function requestOtp(phoneRaw: string): Promise<{ resendInMs: number }> {
  const phone = normalizePhoneTR(phoneRaw);
  if (!phone) throw new MobileAuthError(400, "Gecersiz telefon numarasi", "invalid_phone");

  const repo = shouldUseDatabase() ? await authRepo() : null;
  const last = repo ? await repo.getOtpChallenge(phone) : otpStore.get(phone);
  if (last) {
    const since = Date.now() - last.createdAt.getTime();
    if (since < OTP_RESEND_MS) {
      throw new MobileAuthError(429, "Cok sik deneme, biraz bekle", "too_many_requests", {
        resendInMs: OTP_RESEND_MS - since,
      });
    }
  }

  const code = generateOtp();
  const challenge = {
    codeHash: hashOtp(code, otpPepper()),
    attempts: 0,
    consumedAt: null,
    expiresAt: otpExpiry(),
    createdAt: new Date(),
  };

  if (repo) {
    await repo.upsertOtpChallenge({
      phone,
      codeHash: challenge.codeHash,
      expiresAt: challenge.expiresAt,
      createdAt: challenge.createdAt,
    });
  } else {
    otpStore.set(phone, challenge);
  }

  try {
    await sendSms(phone, `Uyanik Koc giris kodun: ${code}`);
  } catch (error) {
    if (repo) {
      await repo.deleteOtpChallenge(phone);
    } else {
      otpStore.delete(phone);
    }
    if (error instanceof SmsError) {
      throw new MobileAuthError(502, "SMS gonderilemedi", "sms_failed", { reason: error.code });
    }
    throw error;
  }

  return { resendInMs: OTP_RESEND_MS };
}

export async function verifyOtpCode(phoneRaw: string, codeInput: string): Promise<AuthResult> {
  const phone = normalizePhoneTR(phoneRaw);
  if (!phone) throw new MobileAuthError(400, "Gecersiz telefon numarasi", "invalid_phone");

  const repo = shouldUseDatabase() ? await authRepo() : null;
  const entry = repo ? await repo.getOtpChallenge(phone) : otpStore.get(phone);
  if (!entry || entry.consumedAt || entry.expiresAt <= new Date()) {
    throw new MobileAuthError(410, "Kodun suresi doldu, tekrar iste", "otp_expired");
  }
  if (entry.attempts >= OTP_MAX_ATTEMPTS) {
    throw new MobileAuthError(423, "Cok fazla yanlis deneme, kilitlendi", "otp_locked");
  }

  if (!verifyOtp(codeInput, entry.codeHash, otpPepper())) {
    if (repo) {
      await repo.incrementOtpAttempts(phone);
    } else {
      entry.attempts += 1;
    }
    throw new MobileAuthError(401, "Kod hatali", "invalid_code");
  }

  if (repo) {
    await repo.consumeOtpChallenge(phone, new Date());
  } else {
    entry.consumedAt = new Date();
  }

  const otpEmail = process.env.MOBILE_OTP_USER_EMAIL?.trim();
  if (repo && !otpEmail) {
    throw new MobileAuthError(401, "Telefon kullaniciya bagli degil", "invalid_credentials");
  }
  const record = repo ? await repo.findUserByEmail(otpEmail!) : demoStudentRecord();
  if (!record) {
    throw new MobileAuthError(401, "Telefon kullaniciya bagli degil", "invalid_credentials");
  }

  return issueTokens(record, phone);
}

export async function loginEmail(email: string, password: string, ip = "unknown"): Promise<AuthResult> {
  const normalizedEmail = normalizeRateLimitEmail(email);
  try {
    await assertAuthNotRateLimited({ scope: "web_login", email: normalizedEmail, ip });
  } catch (error) {
    if (error instanceof AuthRateLimitError) {
      throw new MobileAuthError(429, "Çok sık deneme, biraz bekle", "too_many_requests", {
        retryAfterMs: error.retryAfterMs,
      });
    }
    throw error;
  }

  const record = await resolveUserByEmail(normalizedEmail);
  if (!record) {
    await recordAuthFailure({ scope: "web_login", email: normalizedEmail, ip });
    throw new MobileAuthError(401, "E-posta veya sifre hatali", "invalid_credentials");
  }
  const ok = await compare(password, record.passwordHash);
  if (!ok) {
    await recordAuthFailure({ scope: "web_login", email: normalizedEmail, ip });
    throw new MobileAuthError(401, "E-posta veya sifre hatali", "invalid_credentials");
  }
  await clearAuthFailures({ scope: "web_login", email: normalizedEmail, ip });
  return issueTokens(record);
}

export async function refreshSession(refreshToken: string): Promise<TokenPair> {
  if (!refreshToken) throw new MobileAuthError(401, "Oturum suresi doldu", "invalid_refresh");

  const hash = hashRefreshToken(refreshToken);
  const repo = shouldUseDatabase() ? await authRepo() : null;
  const entry = repo ? await repo.findRefreshToken(hash) : refreshStore.get(hash);
  if (!entry || entry.expiresAt < new Date()) {
    if (repo) {
      await repo.deleteRefreshToken(hash);
    } else {
      refreshStore.delete(hash);
    }
    throw new MobileAuthError(401, "Oturum suresi doldu", "invalid_refresh");
  }

  if (repo) {
    await repo.deleteRefreshToken(hash);
  } else {
    refreshStore.delete(hash);
  }

  const record = repo ? await repo.findUserById(entry.userId) : findDemoUserById(entry.userId);
  if (!record) throw new MobileAuthError(401, "Oturum suresi doldu", "invalid_refresh");

  const accessToken = signAccess({ sub: record.id, role: toApiUser(record).role }, accessSecret());
  const newRefresh = generateRefreshToken();
  const newHash = hashRefreshToken(newRefresh);
  const expiresAt = refreshExpiry();
  if (repo) {
    await repo.createRefreshToken({ tokenHash: newHash, userId: record.id, expiresAt });
  } else {
    refreshStore.set(newHash, { userId: record.id, expiresAt });
  }

  return { accessToken, refreshToken: newRefresh };
}

export async function revokeRefresh(refreshToken: string): Promise<void> {
  if (!refreshToken) return;
  const hash = hashRefreshToken(refreshToken);
  if (shouldUseDatabase()) {
    await (await authRepo()).deleteRefreshToken(hash);
    return;
  }
  refreshStore.delete(hash);
}

export async function registerDevice(userId: string, token: string, platform = "unknown"): Promise<void> {
  if (shouldUseDatabase()) {
    await (await authRepo()).upsertDeviceToken({ userId, token, platform });
    return;
  }

  const set = deviceStore.get(userId) ?? new Set<string>();
  set.add(token);
  deviceStore.set(userId, set);
}

export async function removeDevice(userId: string, token: string): Promise<void> {
  if (shouldUseDatabase()) {
    await (await authRepo()).deleteDeviceToken({ userId, token });
    return;
  }
  deviceStore.get(userId)?.delete(token);
}
