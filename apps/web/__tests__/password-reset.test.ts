import { describe, expect, it } from "vitest";

import { confirmPasswordReset, requestPasswordReset } from "@/server/services/password-reset.service";

describe("password reset", () => {
  it("creates and consumes a demo reset token", async () => {
    const result = await requestPasswordReset("student@uyanik.local");
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
});
