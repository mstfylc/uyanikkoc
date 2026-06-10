import { beforeEach, describe, expect, it } from "vitest";

import { DEMO_ORG_ID } from "@/lib/auth/demo-users";
import { assertMutationAllowed } from "@/lib/admin/mutation-scope";
import {
  getMockSnapshot,
  mockAddOrgPlan,
  mockAddStudentPackage,
  mockDeleteOrgPlan,
  mockDeleteStudentPackage,
  mockUpdateStudentPackage,
  orgPlanInUse,
  resetMockStore,
} from "@/mocks/admin";

beforeEach(() => {
  resetMockStore();
});

describe("admin plan & package store", () => {
  it("snapshot lisans türleri + paketlerle tohumlanır", () => {
    const s = getMockSnapshot();
    expect(s.orgPlans.length).toBeGreaterThan(0);
    expect(s.coachPlans.length).toBeGreaterThan(0);
    expect(s.studentPackages.length).toBeGreaterThan(0);
  });

  it("kurum planı eklenir ve kullanımda değilse silinir", () => {
    mockAddOrgPlan({
      name: "Test Plan",
      color: "var(--primary)",
      monthly: 1000,
      seats: 10,
      coaches: 1,
      branches: 1,
      tagline: "test",
      modules: ["raporlar"],
    });
    const added = getMockSnapshot().orgPlans.find((p) => p.name === "Test Plan");
    expect(added).toBeTruthy();
    expect(orgPlanInUse(added!.id)).toBe(false);
    expect(mockDeleteOrgPlan(added!.id)).toBe(true);
    expect(getMockSnapshot().orgPlans.find((p) => p.id === added!.id)).toBeUndefined();
  });

  it("kullanımdaki plan silinemez", () => {
    const inUse = getMockSnapshot().orgs[0].planId;
    expect(orgPlanInUse(inUse)).toBe(true);
    expect(mockDeleteOrgPlan(inUse)).toBe(false);
  });

  it("öğrenci paketi eklenir, güncellenir, silinir", () => {
    mockAddStudentPackage("org", DEMO_ORG_ID, {
      name: "Aylık Test",
      price: 1500,
      cycle: "monthly",
      color: "var(--primary)",
      popular: false,
      features: ["a", "", "  b  "],
    });
    const pkg = getMockSnapshot().studentPackages.find((p) => p.name === "Aylık Test" && p.ownerId === DEMO_ORG_ID);
    expect(pkg).toBeTruthy();
    expect(pkg!.features).toEqual(["a", "b"]); // boş/whitespace temizlenir

    mockUpdateStudentPackage(pkg!.id, { price: 1800 });
    expect(getMockSnapshot().studentPackages.find((p) => p.id === pkg!.id)!.price).toBe(1800);

    mockDeleteStudentPackage(pkg!.id);
    expect(getMockSnapshot().studentPackages.find((p) => p.id === pkg!.id)).toBeUndefined();
  });
});

describe("admin plan & package scope", () => {
  const orgData = {
    name: "X",
    color: "var(--primary)",
    monthly: 1,
    seats: 1,
    coaches: 1,
    branches: 1,
    tagline: "",
    modules: [] as never[],
  };

  it("süper admin lisans türü ekleyebilir", () => {
    expect(assertMutationAllowed({ kind: "addOrgPlan", data: orgData }, { role: "admin" }, "admin")).toBeNull();
  });

  it("kurum yöneticisi lisans türü kataloğunu değiştiremez", () => {
    expect(
      assertMutationAllowed(
        { kind: "addOrgPlan", data: orgData },
        { organizationId: DEMO_ORG_ID, role: "branch" },
        "branch",
      ),
    ).toBe("forbidden plan mutation for branch role");
  });

  it("kurum yöneticisi yalnız kendi kurumunun paketini ekleyebilir", () => {
    const pkgData = { name: "P", price: 1, cycle: "monthly" as const, color: "var(--primary)", popular: false, features: [] };
    expect(
      assertMutationAllowed(
        { kind: "addStudentPackage", ownerKind: "org", ownerId: DEMO_ORG_ID, data: pkgData },
        { organizationId: DEMO_ORG_ID, role: "branch" },
        "branch",
      ),
    ).toBeNull();
    expect(
      assertMutationAllowed(
        { kind: "addStudentPackage", ownerKind: "org", ownerId: "baska-kurum", data: pkgData },
        { organizationId: DEMO_ORG_ID, role: "branch" },
        "branch",
      ),
    ).toBe("forbidden package scope");
  });
});
