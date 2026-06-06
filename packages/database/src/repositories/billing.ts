import { computeInstallmentTotal } from "@uyanik/shared";

import { prisma } from "../client";
import type {
  BillingPlanRecord,
  CreatePaymentMethodInput,
  CreateSubscriptionInput,
  InvoiceRecord,
  PaymentMethodRecord,
  SubscriptionRecord,
} from "../types";

const ALLOWED_INSTALLMENTS = [1, 3, 6, 9, 12];

function mapPlan(p: {
  id: string;
  name: string;
  tagline: string;
  monthly: number;
  annual: number;
  popular: boolean;
  features: string[];
  sortOrder: number;
}): BillingPlanRecord {
  return {
    id: p.id,
    name: p.name,
    tagline: p.tagline,
    monthly: p.monthly,
    annual: p.annual,
    popular: p.popular,
    features: p.features,
    sortOrder: p.sortOrder,
  };
}

function mapMethod(m: {
  id: string;
  userId: string;
  brand: "visa" | "mastercard";
  last4: string;
  holder: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  createdAt: Date;
}): PaymentMethodRecord {
  return {
    id: m.id,
    userId: m.userId,
    brand: m.brand,
    last4: m.last4,
    holder: m.holder,
    expMonth: m.expMonth,
    expYear: m.expYear,
    isDefault: m.isDefault,
    createdAt: m.createdAt.toISOString(),
  };
}

function mapSubscription(s: {
  id: string;
  payerUserId: string;
  studentId: string | null;
  planId: string;
  cycle: "monthly" | "annual";
  status: "active" | "trialing" | "past_due" | "canceled";
  autoRenew: boolean;
  startedAt: Date;
  renewsAt: Date;
  canceledAt: Date | null;
  paymentMethodId: string | null;
}): SubscriptionRecord {
  return {
    id: s.id,
    payerUserId: s.payerUserId,
    studentId: s.studentId,
    planId: s.planId,
    cycle: s.cycle,
    status: s.status,
    autoRenew: s.autoRenew,
    startedAt: s.startedAt.toISOString(),
    renewsAt: s.renewsAt.toISOString(),
    canceledAt: s.canceledAt ? s.canceledAt.toISOString() : null,
    paymentMethodId: s.paymentMethodId,
  };
}

function mapInvoice(i: {
  id: string;
  subscriptionId: string;
  payerUserId: string;
  planId: string;
  cycle: "monthly" | "annual";
  amount: number;
  status: "paid" | "pending" | "failed";
  installments: number;
  methodLabel: string;
  paymentMethodId: string | null;
  issuedAt: Date;
}): InvoiceRecord {
  return {
    id: i.id,
    subscriptionId: i.subscriptionId,
    payerUserId: i.payerUserId,
    planId: i.planId,
    cycle: i.cycle,
    amount: i.amount,
    status: i.status,
    installments: i.installments,
    methodLabel: i.methodLabel,
    paymentMethodId: i.paymentMethodId,
    issuedAt: i.issuedAt.toISOString(),
  };
}

export async function listPlans(): Promise<BillingPlanRecord[]> {
  const plans = await prisma.billingPlan.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
  return plans.map(mapPlan);
}

export async function getPlan(planId: string): Promise<BillingPlanRecord | null> {
  const plan = await prisma.billingPlan.findUnique({ where: { id: planId } });
  return plan ? mapPlan(plan) : null;
}

export async function listPaymentMethods(userId: string): Promise<PaymentMethodRecord[]> {
  const methods = await prisma.paymentMethod.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  return methods.map(mapMethod);
}

export async function addPaymentMethod(input: CreatePaymentMethodInput): Promise<PaymentMethodRecord> {
  const existing = await prisma.paymentMethod.count({ where: { userId: input.userId } });
  const makeDefault = input.makeDefault ?? existing === 0;
  if (makeDefault) {
    await prisma.paymentMethod.updateMany({ where: { userId: input.userId }, data: { isDefault: false } });
  }
  const created = await prisma.paymentMethod.create({
    data: {
      userId: input.userId,
      brand: input.brand,
      last4: input.last4,
      holder: input.holder,
      expMonth: input.expMonth,
      expYear: input.expYear,
      isDefault: makeDefault,
    },
  });
  return mapMethod(created);
}

export async function setDefaultPaymentMethod(userId: string, methodId: string): Promise<boolean> {
  const method = await prisma.paymentMethod.findFirst({ where: { id: methodId, userId } });
  if (!method) {
    return false;
  }
  await prisma.$transaction([
    prisma.paymentMethod.updateMany({ where: { userId }, data: { isDefault: false } }),
    prisma.paymentMethod.update({ where: { id: methodId }, data: { isDefault: true } }),
  ]);
  return true;
}

export async function removePaymentMethod(userId: string, methodId: string): Promise<boolean> {
  const method = await prisma.paymentMethod.findFirst({ where: { id: methodId, userId } });
  if (!method) {
    return false;
  }
  await prisma.paymentMethod.delete({ where: { id: methodId } });
  if (method.isDefault) {
    const next = await prisma.paymentMethod.findFirst({ where: { userId }, orderBy: { createdAt: "desc" } });
    if (next) {
      await prisma.paymentMethod.update({ where: { id: next.id }, data: { isDefault: true } });
    }
  }
  return true;
}

export async function getActiveSubscription(payerUserId: string): Promise<SubscriptionRecord | null> {
  const sub = await prisma.subscription.findFirst({
    where: { payerUserId },
    orderBy: { createdAt: "desc" },
  });
  return sub ? mapSubscription(sub) : null;
}

function nextRenewal(cycle: "monthly" | "annual", from = new Date()): Date {
  const d = new Date(from);
  if (cycle === "annual") {
    d.setFullYear(d.getFullYear() + 1);
  } else {
    d.setMonth(d.getMonth() + 1);
  }
  return d;
}

function invoiceNumber(): string {
  return `UK-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 8999))}`;
}

export async function subscribe(
  input: CreateSubscriptionInput,
): Promise<{ subscription: SubscriptionRecord; invoice: InvoiceRecord }> {
  const plan = await prisma.billingPlan.findUnique({ where: { id: input.planId } });
  if (!plan) {
    throw new Error("PLAN_NOT_FOUND");
  }

  const installments = ALLOWED_INSTALLMENTS.includes(input.installments ?? 1) ? (input.installments ?? 1) : 1;
  const base = input.cycle === "annual" ? plan.annual : plan.monthly;
  const amount = computeInstallmentTotal(base, installments);
  const now = new Date();
  const renewsAt = nextRenewal(input.cycle, now);

  let methodLabel = "—";
  if (input.paymentMethodId) {
    const m = await prisma.paymentMethod.findFirst({
      where: { id: input.paymentMethodId, userId: input.payerUserId },
    });
    if (m) {
      methodLabel = `${m.brand === "visa" ? "Visa" : "MasterCard"} •${m.last4}`;
    }
  }

  return prisma.$transaction(async (tx) => {
    const existing = await tx.subscription.findFirst({ where: { payerUserId: input.payerUserId } });
    const subData = {
      planId: input.planId,
      cycle: input.cycle,
      status: "active" as const,
      autoRenew: true,
      startedAt: now,
      renewsAt,
      canceledAt: null,
      paymentMethodId: input.paymentMethodId ?? null,
      studentId: input.studentId ?? null,
    };
    const subscription = existing
      ? await tx.subscription.update({ where: { id: existing.id }, data: subData })
      : await tx.subscription.create({ data: { payerUserId: input.payerUserId, ...subData } });

    const invoice = await tx.invoice.create({
      data: {
        id: invoiceNumber(),
        subscriptionId: subscription.id,
        payerUserId: input.payerUserId,
        planId: input.planId,
        cycle: input.cycle,
        amount,
        status: "paid",
        installments,
        methodLabel,
        paymentMethodId: input.paymentMethodId ?? null,
      },
    });
    return { subscription: mapSubscription(subscription), invoice: mapInvoice(invoice) };
  });
}

export async function setAutoRenew(payerUserId: string, on: boolean): Promise<SubscriptionRecord | null> {
  const sub = await prisma.subscription.findFirst({ where: { payerUserId } });
  if (!sub) {
    return null;
  }
  const updated = await prisma.subscription.update({ where: { id: sub.id }, data: { autoRenew: on } });
  return mapSubscription(updated);
}

export async function cancelSubscription(payerUserId: string): Promise<SubscriptionRecord | null> {
  const sub = await prisma.subscription.findFirst({ where: { payerUserId } });
  if (!sub) {
    return null;
  }
  const updated = await prisma.subscription.update({
    where: { id: sub.id },
    data: { status: "canceled", autoRenew: false, canceledAt: new Date() },
  });
  return mapSubscription(updated);
}

export async function resumeSubscription(payerUserId: string): Promise<SubscriptionRecord | null> {
  const sub = await prisma.subscription.findFirst({ where: { payerUserId } });
  if (!sub) {
    return null;
  }
  const updated = await prisma.subscription.update({
    where: { id: sub.id },
    data: { status: "active", autoRenew: true, canceledAt: null },
  });
  return mapSubscription(updated);
}

export async function listInvoices(payerUserId: string): Promise<InvoiceRecord[]> {
  const invoices = await prisma.invoice.findMany({
    where: { payerUserId },
    orderBy: { issuedAt: "desc" },
  });
  return invoices.map(mapInvoice);
}
