/**
 * SMS OTP yardımcıları — saf (node:crypto). Sunucu-tarafı (alt-yol: @uyanik/shared/otp).
 * Kod düz tutulmaz; sha256(code + pepper) ile hash'lenir.
 */
import { createHash, randomInt, timingSafeEqual } from "node:crypto";

export const OTP_LEN = 6;
export const OTP_TTL_MS = 5 * 60_000; // 5 dk
export const OTP_MAX_ATTEMPTS = 5; // yanlış deneme kilidi
export const OTP_RESEND_MS = 60_000; // tekrar gönderim bekleme

/** Kriptografik rastgele numeric OTP. Baştaki sıfırlar korunur ("042913"). */
export function generateOtp(len: number = OTP_LEN): string {
  let s = "";
  for (let i = 0; i < len; i++) s += randomInt(0, 10).toString();
  return s;
}

/** Kod düz tutulmaz — sha256(code + pepper). */
export function hashOtp(code: string, pepper: string): string {
  return createHash("sha256").update(`${code}:${pepper}`).digest("hex");
}

/** Sabit-zaman karşılaştırma ile doğrula. */
export function verifyOtp(code: string, expectedHash: string, pepper: string): boolean {
  const got = Buffer.from(hashOtp(code, pepper), "hex");
  const exp = Buffer.from(expectedHash, "hex");
  if (got.length !== exp.length) return false;
  return timingSafeEqual(got, exp);
}

export function otpExpiry(now: Date = new Date()): Date {
  return new Date(now.getTime() + OTP_TTL_MS);
}

export interface ChallengeState {
  expiresAt: Date;
  consumedAt: Date | null;
  attempts: number;
}

/** challenge kullanılabilir mi? (expired | consumed | attempt limiti değil) */
export function isChallengeUsable(c: ChallengeState, now: Date = new Date()): boolean {
  return c.consumedAt == null && c.attempts < OTP_MAX_ATTEMPTS && c.expiresAt > now;
}
