/**
 * Mobil kimlik doğrulama servisi (handoff M1/M2/M5).
 *
 * Bu sürüm **bellek modunda** çalışır (DEMO_AUTH_ALLOW_IN_MEMORY varsayılan) ve
 * mevcut repo desenini izler: saf mantık @uyanik/shared'tan gelir, demo kullanıcılar
 * yeniden kullanılır. Gerçek veritabanı kalıcılığı (OtpChallenge / RefreshToken /
 * DeviceToken prisma modelleri + repository) bir sonraki backend adımıdır; o yüzden
 * shouldUseDatabase() iken 501 döner (process-memory token'ı prod'da kullanmamak için).
 */
import { compare } from "bcryptjs";
import { normalizePhoneTR } from "@uyanik/shared";
import { generateOtp, hashOtp, isChallengeUsable, OTP_MAX_ATTEMPTS, OTP_RESEND_MS, otpExpiry, verifyOtp } from "@uyanik/shared/otp";
import { generateRefreshToken, hashRefreshToken, refreshExpiry, signAccess } from "@uyanik/shared/token";
import { shouldUseDatabase } from "@/lib/data/env";
import { resolveUserByEmail } from "@/lib/auth/resolve-user";
import { accessSecret, otpPepper, toApiUser, findDemoUserById, demoStudentRecord, type ApiUser } from "@/server/auth/mobile-tokens";
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

// Process-memory stores (bellek modu). Çok-örnekli prod için DB kalıcılığı gerekir.
const otpStore = new Map<string, OtpEntry>(); // key: E.164 phone
const refreshStore = new Map<string, RefreshEntry>(); // key: sha256(refreshToken)
const deviceStore = new Map<string, Set<string>>(); // userId -> token set

function assertMemoryMode(): void {
  if (shouldUseDatabase()) {
    throw new MobileAuthError(
      501,
      "Mobil kimlik doğrulama için veritabanı kalıcılığı henüz eklenmedi (OtpChallenge/RefreshToken/DeviceToken).",
      "not_implemented",
    );
  }
}

async function sendSms(phoneE164: string, text: string): Promise<void> {
  // Bellek modu: gerçek SMS göndermeden dev log. Prod'da SmsSender (Netgsm/Twilio) takılır.
  console.info(`[mobile-auth] SMS → ${phoneE164}: ${text}`);
}

function issueTokens(record: AuthUserRecord, phone?: string): AuthResult {
  const apiUser = toApiUser(record, phone);
  const accessToken = signAccess({ sub: record.id, role: apiUser.role }, accessSecret());
  const refreshToken = generateRefreshToken();
  refreshStore.set(hashRefreshToken(refreshToken), { userId: record.id, expiresAt: refreshExpiry() });
  return { accessToken, refreshToken, user: apiUser };
}

/** M1 — OTP iste. */
export async function requestOtp(phoneRaw: string): Promise<{ resendInMs: number }> {
  assertMemoryMode();
  const phone = normalizePhoneTR(phoneRaw);
  if (!phone) throw new MobileAuthError(400, "Geçersiz telefon numarası", "invalid_phone");

  const last = otpStore.get(phone);
  if (last) {
    const since = Date.now() - last.createdAt.getTime();
    if (since < OTP_RESEND_MS) {
      throw new MobileAuthError(429, "Çok sık deneme, biraz bekle", "too_many_requests", { resendInMs: OTP_RESEND_MS - since });
    }
  }

  const code = generateOtp();
  otpStore.set(phone, { codeHash: hashOtp(code, otpPepper()), attempts: 0, consumedAt: null, expiresAt: otpExpiry(), createdAt: new Date() });
  await sendSms(phone, `Uyanık Koç giriş kodun: ${code}`);
  return { resendInMs: OTP_RESEND_MS };
}

/** M1/M2 — OTP doğrula → token oturumu. */
export async function verifyOtpCode(phoneRaw: string, codeInput: string): Promise<AuthResult> {
  assertMemoryMode();
  const phone = normalizePhoneTR(phoneRaw);
  if (!phone) throw new MobileAuthError(400, "Geçersiz telefon numarası", "invalid_phone");

  const entry = otpStore.get(phone);
  if (!entry || !isChallengeUsable(entry)) throw new MobileAuthError(410, "Kodun süresi doldu, tekrar iste", "otp_expired");
  if (entry.attempts >= OTP_MAX_ATTEMPTS) throw new MobileAuthError(423, "Çok fazla yanlış deneme, kilitlendi", "otp_locked");

  if (!verifyOtp(codeInput, entry.codeHash, otpPepper())) {
    entry.attempts += 1;
    throw new MobileAuthError(401, "Kod hatalı", "invalid_code");
  }

  entry.consumedAt = new Date();
  // Bellek modu: telefonla giren kullanıcı demo öğrenciye eşlenir.
  const record = demoStudentRecord();
  return issueTokens(record, phone);
}

/** M5 — E-posta + şifre ile token oturumu (cookie SET ETMEZ). */
export async function loginEmail(email: string, password: string): Promise<AuthResult> {
  assertMemoryMode();
  const record = await resolveUserByEmail(email);
  if (!record) throw new MobileAuthError(401, "E-posta veya şifre hatalı", "invalid_credentials");
  const ok = await compare(password, record.passwordHash);
  if (!ok) throw new MobileAuthError(401, "E-posta veya şifre hatalı", "invalid_credentials");
  return issueTokens(record);
}

/** M2 — refresh token rotasyonu. */
export async function refreshSession(refreshToken: string): Promise<TokenPair> {
  assertMemoryMode();
  if (!refreshToken) throw new MobileAuthError(401, "Oturum süresi doldu", "invalid_refresh");
  const hash = hashRefreshToken(refreshToken);
  const entry = refreshStore.get(hash);
  if (!entry || entry.expiresAt < new Date()) {
    refreshStore.delete(hash);
    throw new MobileAuthError(401, "Oturum süresi doldu", "invalid_refresh");
  }
  refreshStore.delete(hash); // rotate: eskiyi iptal et
  const record = findDemoUserById(entry.userId);
  if (!record) throw new MobileAuthError(401, "Oturum süresi doldu", "invalid_refresh");

  const accessToken = signAccess({ sub: record.id, role: toApiUser(record).role }, accessSecret());
  const newRefresh = generateRefreshToken();
  refreshStore.set(hashRefreshToken(newRefresh), { userId: record.id, expiresAt: refreshExpiry() });
  return { accessToken, refreshToken: newRefresh };
}

/** Çıkış — refresh token'ı iptal et. */
export async function revokeRefresh(refreshToken: string): Promise<void> {
  if (refreshToken) refreshStore.delete(hashRefreshToken(refreshToken));
}

/** M3 — cihaz push token'ı kaydı (bellek modu). */
export async function registerDevice(userId: string, token: string): Promise<void> {
  assertMemoryMode();
  const set = deviceStore.get(userId) ?? new Set<string>();
  set.add(token);
  deviceStore.set(userId, set);
}

export async function removeDevice(userId: string, token: string): Promise<void> {
  deviceStore.get(userId)?.delete(token);
}
