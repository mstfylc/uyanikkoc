import { compareSync } from "bcryptjs";
import { describe, expect, it } from "vitest";

import { DEMO_PASSWORD, DEMO_PASSWORD_HASH, demoUsers } from "@/lib/auth/demo-users";

describe("demo auth users", () => {
  it("demo password hash uyanik123 ile eşleşir", () => {
    expect(compareSync(DEMO_PASSWORD, DEMO_PASSWORD_HASH)).toBe(true);
  });

  it("student@uyanik.local demo listesinde vardır", () => {
    const student = demoUsers.find((user) => user.email === "student@uyanik.local");
    expect(student).toBeDefined();
    expect(compareSync(DEMO_PASSWORD, student!.passwordHash)).toBe(true);
  });
});
