import { afterEach, describe, expect, it, vi } from "vitest";

import { confirmPasswordReset, requestPasswordReset } from "@/server/services/password-reset.service";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("password reset", () => {
  it("creates and consumes a demo reset token", async () => {
    const result = await requestPasswordReset("student2@uyanik.local");
    expect(result.accepted).toBe(true);
    expect(result.resetUrl).toContain("/reset-password?token=");

    const token = new URL(result.resetUrl!).searchParams.get("token");
    expect(token).toBeTruthy();
    await expect(confirmPasswordReset(token!, "yeni123")).resolves.toBe(true);
    await expect(confirmPasswordReset(token!, "yeni123")).resolves.toBe(false);
  });

  it("does not reveal unknown emails", async () => {
    const result = await requestPasswordReset("unknown@example.com");
    expect(result).toEqual({ accepted: true });
  });

  it("sends reset email when Resend is configured", async () => {
    vi.stubEnv("RESEND_API_KEY", "test_resend_key");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
      }),
    );

    const result = await requestPasswordReset("student2@uyanik.local");
    expect(result.accepted).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test_resend_key",
        }),
      }),
    );
  });
});
