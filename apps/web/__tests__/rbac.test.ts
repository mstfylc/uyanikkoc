import { describe, expect, it } from "vitest";

import { ROLE_HOME_PATH, canAccessPath, getUnauthorizedRedirect, isPublicPath } from "@/lib/rbac";

describe("RBAC path erişim kontrolü", () => {
  it("doğru rol için erişime izin verir", () => {
    expect(canAccessPath("student", "/student/dashboard")).toBe(true);
    expect(canAccessPath("coach", "/coach/dashboard")).toBe(true);
    expect(canAccessPath("parent", "/parent/dashboard")).toBe(true);
    expect(canAccessPath("branch", "/branch/dashboard")).toBe(true);
    expect(canAccessPath("admin", "/admin/dashboard")).toBe(true);
  });

  it("yanlış rol için erişimi reddeder", () => {
    expect(canAccessPath("student", "/coach/dashboard")).toBe(false);
    expect(canAccessPath("parent", "/admin/users")).toBe(false);
    expect(canAccessPath("coach", "/student/assignments")).toBe(false);
  });

  it("session yoksa login'e yönlendirir", () => {
    const result = getUnauthorizedRedirect("/student/dashboard", null);
    expect(result).toBe("/login?next=%2Fstudent%2Fdashboard");
  });

  it("post-login oturum kontrolünü sayfa yapar (middleware public)", () => {
    expect(isPublicPath("/post-login")).toBe(true);
    expect(getUnauthorizedRedirect("/post-login", null)).toBeNull();
  });

  it("yanlış rol kendi home'una yönlendirir", () => {
    const session = { userId: "1", role: "coach" as const, dbRole: "COACH" as const };
    const result = getUnauthorizedRedirect("/student/dashboard", session);
    expect(result).toBe("/coach/dashboard");
  });

  it("ROLE_HOME_PATH tüm roller için tanımlı", () => {
    expect(ROLE_HOME_PATH.student).toBe("/student/dashboard");
    expect(ROLE_HOME_PATH.coach).toBe("/coach/dashboard");
    expect(ROLE_HOME_PATH.parent).toBe("/parent/dashboard");
  });
});
