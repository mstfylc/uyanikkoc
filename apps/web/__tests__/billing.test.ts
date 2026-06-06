import { describe, expect, it } from "vitest";

import * as billing from "@/mocks/billing";

describe("billing mock store", () => {
  it("lists coaching plans", async () => {
    const plans = await billing.listPlans();
    expect(plans.length).toBe(3);
    expect(plans.some((plan) => plan.id === "plus" && plan.popular)).toBe(true);
  });

  it("subscribes and creates invoice", async () => {
    const { subscription, invoice } = await billing.subscribe({
      payerUserId: "user_parent_001",
      studentId: "student_001",
      planId: "plus",
      cycle: "annual",
      installments: 1,
    });

    expect(subscription.planId).toBe("plus");
    expect(subscription.status).toBe("active");
    expect(invoice.amount).toBe(22990);

    const viewPlan = await billing.getPlan(subscription.planId);
    expect(viewPlan?.name).toContain("Plus");

    const invoices = await billing.listInvoices("user_parent_001");
    expect(invoices.some((item) => item.id === invoice.id)).toBe(true);
  });

  it("manages payment methods", async () => {
    const method = await billing.addPaymentMethod({
      userId: "user_student_001",
      brand: "visa",
      last4: "4242",
      holder: "Demo Ogrenci",
      expMonth: 12,
      expYear: 2028,
    });

    expect(method.isDefault).toBe(true);

    const methods = await billing.listPaymentMethods("user_student_001");
    expect(methods).toHaveLength(1);
  });
});
