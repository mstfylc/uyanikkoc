import { describe, expect, it } from "vitest";

import { DEMO_COACH_ID, DEMO_ORG_ID } from "@/lib/auth/demo-users";
import { orgCoaches } from "@/lib/admin/derive";
import { modulesFromPlan, orgPlanById } from "@/lib/admin/pricing";
import { resolveActiveOrgId, resolveOrgCoachId } from "@/lib/admin/snapshot-context";
import type { Org } from "@/lib/admin/types";
import { ROLE_HOME_PATH, canAccessPath, getUnauthorizedRedirect, isPublicPath } from "@/lib/rbac";

const demoOrg: Org = {
  id: DEMO_ORG_ID,
  name: "Demo",
  type: "kurum",
  city: "Istanbul",
  planId: "baslangic",
  status: "active",
  cycle: "monthly",
  startedAt: 0,
  renewsAt: 0,
  feeMonthly: 4900,
  seats: { used: 2, total: 50 },
  coaches: { used: 1, total: 5 },
  modules: modulesFromPlan(orgPlanById("baslangic").modules),
  owner: { name: "Owner", email: "o@x.com", phone: "1" },
  tone: "#000",
  branches: [{ id: "branch_demo_001", name: "Sube", city: "Istanbul", students: 2, coaches: 1, collect: 1, status: "active" }],
  managers: [],
  billing: { taxId: "123", taxOffice: "VD", billingAddress: "Istanbul", paymentMethod: "Havale" },
  notifications: { licenseReminders: true, paymentAlerts: true, weeklyReport: false, productUpdates: true },
};

describe("RBAC path erişim kontrolü", () => {
  it("doğru rol için erişime izin verir", () => {
    expect(canAccessPath("student", "/student/dashboard")).toBe(true);
    expect(canAccessPath("coach", "/coach/dashboard")).toBe(true);
    expect(canAccessPath("parent", "/parent/dashboard")).toBe(true);
    expect(canAccessPath("branch", "/yonetim/dashboard")).toBe(true);
    expect(canAccessPath("admin", "/yonetim/dashboard")).toBe(true);
    expect(canAccessPath("branch", "/branch/dashboard")).toBe(true);
    expect(canAccessPath("admin", "/admin/dashboard")).toBe(true);
  });

  it("yonetim alt yollarini role gore kisitlar", () => {
    expect(canAccessPath("branch", "/yonetim/orgs")).toBe(false);
    expect(canAccessPath("admin", "/yonetim/students")).toBe(false);
    expect(canAccessPath("admin", "/yonetim/profile")).toBe(true);
    expect(canAccessPath("branch", "/yonetim/profile")).toBe(true);
  });

  it("yanlış rol için erişimi reddeder", () => {
    expect(canAccessPath("student", "/coach/dashboard")).toBe(false);
    expect(canAccessPath("parent", "/admin/users")).toBe(false);
    expect(canAccessPath("coach", "/student/assignments")).toBe(false);
    expect(canAccessPath("coach", "/yonetim/dashboard")).toBe(false);
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

  it("kurum rolu super admin sayfasina yonlenince uyarir", () => {
    const session = { user: { id: "1", role: "branch" as const } };
    const result = getUnauthorizedRedirect("/yonetim/orgs", session);
    expect(result).toBe("/yonetim/dashboard?need=superadmin");
  });

  it("ROLE_HOME_PATH tüm roller için tanımlı", () => {
    expect(ROLE_HOME_PATH.student).toBe("/student/dashboard");
    expect(ROLE_HOME_PATH.coach).toBe("/coach/dashboard");
    expect(ROLE_HOME_PATH.parent).toBe("/parent/dashboard");
    expect(ROLE_HOME_PATH.branch).toBe("/yonetim/dashboard");
    expect(ROLE_HOME_PATH.admin).toBe("/yonetim/dashboard");
  });
});

describe("admin snapshot context", () => {
  it("demo oturum kurumunu aktif org yapar", () => {
    expect(resolveActiveOrgId([demoOrg], { organizationId: DEMO_ORG_ID })).toBe(DEMO_ORG_ID);
  });

  it("demo coach id org koçuna map edilir", () => {
    const orgCoachId = orgCoaches(demoOrg)[0]?.id;
    expect(resolveOrgCoachId(demoOrg, DEMO_COACH_ID, [])).toBe(orgCoachId);
  });
});
