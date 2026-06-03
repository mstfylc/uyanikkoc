import { describe, expect, it } from "vitest";

import { canAccessPath, getUnauthorizedRedirect } from "@/lib/rbac";

describe("RBAC path erişim kontrolü", () => {
  it("doğru rol için erişime izin verir", () => {
    expect(canAccessPath("student", "/student/dashboard")).toBe(true);
    expect(canAccessPath("coach", "/coach/dashboard")).toBe(true);
  });

  it("yanlış rol için erişimi reddeder", () => {
    expect(canAccessPath("student", "/coach/dashboard")).toBe(false);
    expect(canAccessPath("parent", "/admin/users")).toBe(false);
  });

  it("session yoksa login'e yönlendirir", () => {
    const result = getUnauthorizedRedirect("/student/dashboard", null);
    expect(result).toBe("/login?next=%2Fstudent%2Fdashboard");
  });

  it("yanlış rol kendi home'una yönlendirir", () => {
    const session = { userId: "1", role: "coach" as const, dbRole: "COACH" as const };
    const result = getUnauthorizedRedirect("/student/dashboard", session);
    expect(result).toBe("/coach/dashboard");
  });
});
