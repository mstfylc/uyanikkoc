import { describe, expect, it } from "vitest";

import { DEMO_COACH_ID, DEMO_ORG_ID } from "@/lib/auth/demo-users";
import { orgCoaches } from "@/lib/admin/derive";
import { modulesFromPlan, orgPlanById } from "@/lib/admin/pricing";
import { assertMutationAllowed } from "@/lib/admin/mutation-scope";
import type { Org } from "@/lib/admin/types";
import { getMockSnapshot, findTask, loadMockSnapshot, resetMockStore } from "@/mocks/admin";

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
  branches: [
    { id: "branch_demo_001", name: "Sube", city: "Istanbul", students: 2, coaches: 1, collect: 1, status: "active" },
  ],
  managers: [],
  billing: { taxId: "123", taxOffice: "VD", billingAddress: "Istanbul", paymentMethod: "Havale" },
  notifications: { licenseReminders: true, paymentAlerts: true, weeklyReport: false, productUpdates: true },
};

describe("admin mutation scope", () => {
  it("branch baska kuruma yazamaz", () => {
    expect(
      assertMutationAllowed(
        { kind: "renewOrg", orgId: "akademi-yildiz" },
        { organizationId: DEMO_ORG_ID, role: "branch" },
        "branch",
      ),
    ).toBe("forbidden org scope");
  });

  it("coach yalnizca kendi gorevini tamamlayabilir", () => {
    getMockSnapshot({ organizationId: DEMO_ORG_ID, coachId: DEMO_COACH_ID, role: "coach" });
    const coachId = orgCoaches(demoOrg)[0]?.id ?? "";
    const taskId = `tsk-${DEMO_ORG_ID}-1`;
    const task = findTask(taskId);
    expect(task?.coachId).toBe(coachId);

    expect(
      assertMutationAllowed(
        { kind: "completeTask", taskId },
        { organizationId: DEMO_ORG_ID, coachId: DEMO_COACH_ID, role: "coach" },
        "coach",
      ),
    ).toBeNull();

    expect(
      assertMutationAllowed({ kind: "renewOrg", orgId: DEMO_ORG_ID }, { coachId: DEMO_COACH_ID, role: "coach" }, "coach"),
    ).toBe("forbidden mutation for coach role");
  });

  it("snapshot store'a geri yuklenebilir", () => {
    const snapshot = getMockSnapshot({});
    const renamed = {
      ...snapshot,
      orgs: snapshot.orgs.map((org, index) => index === 0 ? { ...org, name: "Kalici Demo Kurum" } : org),
    };

    loadMockSnapshot(renamed);
    expect(getMockSnapshot({}).orgs[0]?.name).toBe("Kalici Demo Kurum");
    resetMockStore();
  });
});
