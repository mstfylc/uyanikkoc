import { afterEach, describe, expect, it, vi } from "vitest";

import { DEMO_COACH_ID, DEMO_ORG_ID } from "@/lib/auth/demo-users";
import { orgCoaches } from "@/lib/admin/derive";
import { modulesFromPlan, orgPlanById } from "@/lib/admin/pricing";
import { assertMutationAllowed } from "@/lib/admin/mutation-scope";
import type { Org } from "@/lib/admin/types";
import { applyAdminMutation } from "@/server/services/admin.service";
import { getMockSnapshot, findTask, loadMockSnapshot, resetMockStore } from "@/mocks/admin";

const getAdminState = vi.fn(async () => null);
const saveAdminState = vi.fn(async (snapshot: unknown) => snapshot);
const updateOrganizationName = vi.fn(async () => undefined);
const updateUserEmailById = vi.fn(async () => "updated" as const);

vi.mock("@uyanik/database", () => ({
  adminStateRepository: {
    getAdminState,
    saveAdminState,
    updateOrganizationName,
  },
  authRepository: {
    updateUserEmailById,
  },
}));

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

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

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

  it("branch yalnizca kendi kurumundaki ogrenciyi cikarabilir", () => {
    expect(
      assertMutationAllowed(
        { kind: "removeOrgStudent", orgId: DEMO_ORG_ID, studentId: `${DEMO_ORG_ID}-s0` },
        { organizationId: DEMO_ORG_ID, role: "branch" },
        "branch",
      ),
    ).toBeNull();

    expect(
      assertMutationAllowed(
        { kind: "removeOrgStudent", orgId: "akademi-yildiz", studentId: "akademi-yildiz-s0" },
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

  it("branch yeni koc davetini kurum sayacina yansitir", async () => {
    resetMockStore();
    const before = getMockSnapshot({ organizationId: DEMO_ORG_ID, role: "branch" });
    const beforeOrg = before.orgs.find((org) => org.id === DEMO_ORG_ID)!;
    const beforeCoaches = beforeOrg.coaches.used;
    const beforeBranchCoaches = beforeOrg.branches[0]!.coaches;

    const after = await applyAdminMutation(
      {
        kind: "inviteOrgCoach",
        orgId: DEMO_ORG_ID,
        name: "Yeni Koc",
        email: "yeni.koc@example.com",
        branchId: beforeOrg.branches[0]!.id,
      },
      { organizationId: DEMO_ORG_ID, role: "branch" },
      "branch",
    );
    const afterOrg = after.orgs.find((org) => org.id === DEMO_ORG_ID)!;

    expect(afterOrg.coaches.used).toBe(beforeCoaches + 1);
    expect(afterOrg.branches[0]!.coaches).toBe(beforeBranchCoaches + 1);
    expect(after.orgInvites[0]).toMatchObject({ kind: "coach", email: "yeni.koc@example.com" });
  });

  it("branch profil guncellemesi DB kullanirken owner email ve kurum adini normalize tablolara yazar", async () => {
    vi.stubEnv("DATABASE_URL", "postgresql://admin-profile-test");
    vi.stubEnv("DEMO_AUTH_ALLOW_IN_MEMORY", "false");
    resetMockStore();

    const after = await applyAdminMutation(
      {
        kind: "updateOrgProfile",
        orgId: DEMO_ORG_ID,
        name: "Yeni Kurum Adi",
        tone: "#123456",
        email: "Yeni.Owner@Example.com",
        phone: "0532 000 00 00",
        ownerName: "Yeni Owner",
      },
      { userId: "user_kampus_koc_owner", organizationId: DEMO_ORG_ID, role: "branch" },
      "branch",
    );

    expect(updateUserEmailById).toHaveBeenCalledWith({
      userId: "user_kampus_koc_owner",
      email: "yeni.owner@example.com",
    });
    expect(updateOrganizationName).toHaveBeenCalledWith({
      organizationId: DEMO_ORG_ID,
      name: "Yeni Kurum Adi",
    });
    expect(after.orgs.find((org) => org.id === DEMO_ORG_ID)?.owner).toMatchObject({
      name: "Yeni Owner",
      email: "Yeni.Owner@Example.com",
      phone: "0532 000 00 00",
    });
  });
});
