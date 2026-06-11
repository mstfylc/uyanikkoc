import { describe, expect, it, vi } from "vitest";

import { loginEmail, MobileAuthError, refreshSession, requestOtp, verifyOtpCode } from "@/server/services/mobile-auth.service";

function lastSmsCode(spy: ReturnType<typeof vi.spyOn>): string {
  const msg = String(spy.mock.calls.at(-1)?.[0] ?? "");
  const m = /kodun:\s*(\d{6})/.exec(msg);
  return m ? m[1] : "";
}

describe("mobile-auth: OTP (memory mode)", () => {
  it("request → verify issues a token session for the demo student", async () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    const phone = "0555 987 65 43";

    const { resendInMs } = await requestOtp(phone);
    expect(resendInMs).toBeGreaterThan(0);

    const code = lastSmsCode(spy);
    expect(code).toMatch(/^\d{6}$/);

    const res = await verifyOtpCode(phone, code);
    expect(res.accessToken).toBeTruthy();
    expect(res.refreshToken).toBeTruthy();
    expect(res.user.role).toBe("student");
    expect(res.user.avatarInitials).toBe("KD");
    spy.mockRestore();
  });

  it("rejects a wrong code", async () => {
    vi.spyOn(console, "info").mockImplementation(() => {});
    const phone = "0555 111 22 33";
    await requestOtp(phone);
    await expect(verifyOtpCode(phone, "000000")).rejects.toBeInstanceOf(MobileAuthError);
  });

  it("rejects an invalid phone number", async () => {
    await expect(requestOtp("123")).rejects.toMatchObject({ code: "invalid_phone" });
  });
});

describe("mobile-auth: email login + refresh rotation", () => {
  it("logs in a demo user and rotates the refresh token", async () => {
    const res = await loginEmail("student2@uyanik.local", "uyanik123");
    expect(res.user.role).toBe("student");
    expect(res.accessToken).toBeTruthy();

    const rotated = await refreshSession(res.refreshToken);
    expect(rotated.accessToken).toBeTruthy();
    expect(rotated.refreshToken).not.toEqual(res.refreshToken);

    // eski refresh token rotasyon sonrası iptal olmalı
    await expect(refreshSession(res.refreshToken)).rejects.toMatchObject({ code: "invalid_refresh" });
  });

  it("rejects wrong credentials", async () => {
    await expect(loginEmail("student2@uyanik.local", "wrong")).rejects.toMatchObject({ code: "invalid_credentials" });
  });
});
