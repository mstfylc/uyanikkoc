import { describe, expect, it } from "vitest";

import { ACCESS_TTL_MS, generateRefreshToken, hashRefreshToken, signAccess, verifyAccess } from "../token";

const SECRET = "test-secret-please-change";

describe("signAccess / verifyAccess", () => {
  it("round-trips a valid payload", () => {
    const now = Date.now();
    const token = signAccess({ sub: "user_1", role: "student" }, SECRET, now);
    const payload = verifyAccess(token, SECRET, now + 1000);
    expect(payload).toEqual({ sub: "user_1", role: "student" });
  });

  it("rejects a wrong secret", () => {
    const token = signAccess({ sub: "user_1", role: "student" }, SECRET);
    expect(verifyAccess(token, "other-secret")).toBeNull();
  });

  it("rejects an expired token", () => {
    const now = Date.now();
    const token = signAccess({ sub: "user_1", role: "student" }, SECRET, now);
    expect(verifyAccess(token, SECRET, now + ACCESS_TTL_MS + 1000)).toBeNull();
  });

  it("rejects a tampered token", () => {
    const token = signAccess({ sub: "user_1", role: "student" }, SECRET);
    const tampered = token.slice(0, -2) + (token.endsWith("aa") ? "bb" : "aa");
    expect(verifyAccess(tampered, SECRET)).toBeNull();
  });

  it("rejects malformed tokens", () => {
    expect(verifyAccess("not-a-token", SECRET)).toBeNull();
    expect(verifyAccess("a.b", SECRET)).toBeNull();
  });
});

describe("refresh tokens", () => {
  it("generates opaque tokens and stable hashes", () => {
    const a = generateRefreshToken();
    const b = generateRefreshToken();
    expect(a).not.toEqual(b);
    expect(a).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(hashRefreshToken(a)).toEqual(hashRefreshToken(a));
    expect(hashRefreshToken(a)).not.toEqual(hashRefreshToken(b));
  });
});
