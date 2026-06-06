/**
 * Token oturumu yardımcıları — bağımlılıksız HS256 JWT (node:crypto).
 * Sunucu-tarafı (alt-yol: @uyanik/shared/token).
 *  - Access: kısa ömürlü imzalı JWT (sub + role + exp)
 *  - Refresh: opak rastgele string (DB'de yalnız sha256 hash'i saklanır, rotasyonlu)
 */
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const ACCESS_TTL_MS = 15 * 60_000; // 15 dk
export const REFRESH_TTL_MS = 30 * 24 * 60 * 60_000; // 30 gün

export type AuthRole = "student" | "parent" | "coach" | "branch" | "admin";

export interface AccessPayload {
  sub: string; // userId
  role: AuthRole;
}

function b64urlJson(obj: unknown): string {
  return Buffer.from(JSON.stringify(obj)).toString("base64url");
}

/** Kısa ömürlü HS256 access token. */
export function signAccess(payload: AccessPayload, secret: string, nowMs: number = Date.now()): string {
  const header = b64urlJson({ alg: "HS256", typ: "JWT" });
  const body = b64urlJson({
    sub: payload.sub,
    role: payload.role,
    iat: Math.floor(nowMs / 1000),
    exp: Math.floor((nowMs + ACCESS_TTL_MS) / 1000),
  });
  const data = `${header}.${body}`;
  const sig = createHmac("sha256", secret).update(data).digest("base64url");
  return `${data}.${sig}`;
}

/** Access token doğrula → payload | null (imza/exp/biçim geçersizse null). */
export function verifyAccess(token: string, secret: string, nowMs: number = Date.now()): AccessPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, body, sig] = parts;

  const expected = createHmac("sha256", secret).update(`${header}.${body}`).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  const p = parsed as Record<string, unknown>;

  if (typeof p.exp === "number" && p.exp * 1000 < nowMs) return null;
  if (typeof p.sub !== "string" || typeof p.role !== "string") return null;
  return { sub: p.sub, role: p.role as AuthRole };
}

/** Opak refresh token (DB'de yalnız hash'i saklanır). */
export function generateRefreshToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashRefreshToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function refreshExpiry(now: Date = new Date()): Date {
  return new Date(now.getTime() + REFRESH_TTL_MS);
}
