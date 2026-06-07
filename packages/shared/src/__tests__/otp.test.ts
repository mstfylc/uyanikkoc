import { describe, expect, it } from "vitest";

import { generateOtp, hashOtp, isChallengeUsable, OTP_MAX_ATTEMPTS, otpExpiry, verifyOtp } from "../otp";

describe("generateOtp", () => {
  it("produces a 6-digit numeric code by default", () => {
    for (let i = 0; i < 50; i++) {
      const code = generateOtp();
      expect(code).toMatch(/^\d{6}$/);
    }
  });

  it("respects custom length and preserves leading zeros range", () => {
    expect(generateOtp(4)).toMatch(/^\d{4}$/);
  });
});

describe("hashOtp / verifyOtp", () => {
  it("verifies the correct code with the same pepper", () => {
    const hash = hashOtp("482913", "pepper-1");
    expect(verifyOtp("482913", hash, "pepper-1")).toBe(true);
  });

  it("rejects wrong code or wrong pepper", () => {
    const hash = hashOtp("482913", "pepper-1");
    expect(verifyOtp("000000", hash, "pepper-1")).toBe(false);
    expect(verifyOtp("482913", hash, "pepper-2")).toBe(false);
  });
});

describe("isChallengeUsable", () => {
  const now = new Date("2026-06-06T10:00:00Z");

  it("is usable when fresh, not consumed, under attempt limit", () => {
    expect(isChallengeUsable({ expiresAt: otpExpiry(now), consumedAt: null, attempts: 0 }, now)).toBe(true);
  });

  it("is not usable when expired, consumed, or attempts exhausted", () => {
    expect(isChallengeUsable({ expiresAt: new Date(now.getTime() - 1), consumedAt: null, attempts: 0 }, now)).toBe(false);
    expect(isChallengeUsable({ expiresAt: otpExpiry(now), consumedAt: now, attempts: 0 }, now)).toBe(false);
    expect(isChallengeUsable({ expiresAt: otpExpiry(now), consumedAt: null, attempts: OTP_MAX_ATTEMPTS }, now)).toBe(false);
  });
});
