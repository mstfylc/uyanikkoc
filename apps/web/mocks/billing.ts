import { computeInstallmentTotal } from "@uyanik/shared";
import type {
  BillingPlanRecord,
  CreatePaymentMethodInput,
  CreateSubscriptionInput,
  InvoiceRecord,
  PaymentMethodRecord,
  SubscriptionRecord,
} from "@uyanik/database";

const PLANS: BillingPlanRecord[] = [
  {
    id: "standart",
    name: "Standart Kocluk",
    tagline: "Duzenli takip ve birebir kocluk",
    monthly: 1499,
    annual: 14990,
    popular: false,
    sortOrder: 0,
    features: [
      "Haftalik birebir kocluk gorusmesi",
      "Kisiye ozel haftalik calisma programi",
      "Odev atama ve takibi",
      "Deneme analizi ve net takibi",
      "Konu takibi paneli",
    ],
  },
  {
    id: "plus",
    name: "Plus Kocluk",
    tagline: "Aileyle birlikte tam destek",
    monthly: 2299,
    annual: 22990,
    popular: true,
    sortOrder: 1,
    features: [
      "Standart paketteki her sey",
      "Veliye haftalik gelisim raporu",
      "Sinirsiz mesajlasma (koc + ogrenci)",
      "Motivasyon ve hedef takibi",
      "Onceliklendirilmis randevu",
    ],
  },
  {
    id: "vip",
    name: "VIP Kocluk",
    tagline: "Yogun tempo, ust duzey mentorluk",
    monthly: 3499,
    annual: 34990,
    popular: false,
    sortOrder: 2,
    features: [
      "Plus paketteki her sey",
      "Haftada 2 birebir gorusme",
      "Kidemli mentor eslestirmesi",
      "Tercih ve kariyer danismanligi",
      "7/24 oncelikli destek hatti",
    ],
  },
];

const methods = new Map<string, PaymentMethodRecord[]>();
const subscriptions = new Map<string, SubscriptionRecord>();
const invoices = new Map<string, InvoiceRecord[]>();
let seq = 1;

function nextRenewal(cycle: "monthly" | "annual", from = new Date()): Date {
  const d = new Date(from);
  if (cycle === "annual") {
    d.setFullYear(d.getFullYear() + 1);
  } else {
    d.setMonth(d.getMonth() + 1);
  }
  return d;
}

export async function listPlans(): Promise<BillingPlanRecord[]> {
  return [...PLANS].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getPlan(planId: string): Promise<BillingPlanRecord | null> {
  return PLANS.find((plan) => plan.id === planId) ?? null;
}

export async function listPaymentMethods(userId: string): Promise<PaymentMethodRecord[]> {
  return [...(methods.get(userId) ?? [])].sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
}

export async function addPaymentMethod(input: CreatePaymentMethodInput): Promise<PaymentMethodRecord> {
  const list = methods.get(input.userId) ?? [];
  const makeDefault = input.makeDefault ?? list.length === 0;
  if (makeDefault) {
    list.forEach((method) => {
      method.isDefault = false;
    });
  }
  const rec: PaymentMethodRecord = {
    id: `pm_${seq++}`,
    userId: input.userId,
    brand: input.brand,
    last4: input.last4,
    holder: input.holder,
    expMonth: input.expMonth,
    expYear: input.expYear,
    isDefault: makeDefault,
    createdAt: new Date().toISOString(),
  };
  methods.set(input.userId, [...list, rec]);
  return rec;
}

export async function setDefaultPaymentMethod(userId: string, methodId: string): Promise<boolean> {
  const list = methods.get(userId);
  if (!list || !list.some((method) => method.id === methodId)) {
    return false;
  }
  list.forEach((method) => {
    method.isDefault = method.id === methodId;
  });
  return true;
}

export async function removePaymentMethod(userId: string, methodId: string): Promise<boolean> {
  const list = methods.get(userId);
  if (!list) {
    return false;
  }
  const target = list.find((method) => method.id === methodId);
  if (!target) {
    return false;
  }
  const rest = list.filter((method) => method.id !== methodId);
  if (target.isDefault && rest.length) {
    rest[0].isDefault = true;
  }
  methods.set(userId, rest);
  return true;
}

export async function getActiveSubscription(payerUserId: string): Promise<SubscriptionRecord | null> {
  return subscriptions.get(payerUserId) ?? null;
}

export async function subscribe(
  input: CreateSubscriptionInput,
): Promise<{ subscription: SubscriptionRecord; invoice: InvoiceRecord }> {
  const plan = PLANS.find((item) => item.id === input.planId);
  if (!plan) {
    throw new Error("PLAN_NOT_FOUND");
  }
  const installments = input.installments ?? 1;
  const base = input.cycle === "annual" ? plan.annual : plan.monthly;
  const amount = computeInstallmentTotal(base, installments);
  const now = new Date();
  const existing = subscriptions.get(input.payerUserId);
  const subscription: SubscriptionRecord = {
    id: existing?.id ?? `sub_${seq++}`,
    payerUserId: input.payerUserId,
    studentId: input.studentId ?? null,
    planId: input.planId,
    cycle: input.cycle,
    status: "active",
    autoRenew: true,
    startedAt: now.toISOString(),
    renewsAt: nextRenewal(input.cycle, now).toISOString(),
    canceledAt: null,
    paymentMethodId: input.paymentMethodId ?? null,
  };
  subscriptions.set(input.payerUserId, subscription);

  let methodLabel = "—";
  if (input.paymentMethodId) {
    const method = (methods.get(input.payerUserId) ?? []).find((item) => item.id === input.paymentMethodId);
    if (method) {
      methodLabel = `${method.brand === "visa" ? "Visa" : "MasterCard"} •${method.last4}`;
    }
  }
  const invoice: InvoiceRecord = {
    id: `UK-${now.getFullYear()}-${String(Math.floor(1000 + Math.random() * 8999))}`,
    subscriptionId: subscription.id,
    payerUserId: input.payerUserId,
    planId: input.planId,
    cycle: input.cycle,
    amount,
    status: "paid",
    installments,
    methodLabel,
    paymentMethodId: input.paymentMethodId ?? null,
    issuedAt: now.toISOString(),
  };
  invoices.set(input.payerUserId, [invoice, ...(invoices.get(input.payerUserId) ?? [])]);
  return { subscription, invoice };
}

export async function setAutoRenew(payerUserId: string, on: boolean): Promise<SubscriptionRecord | null> {
  const sub = subscriptions.get(payerUserId);
  if (!sub) {
    return null;
  }
  sub.autoRenew = on;
  return sub;
}

export async function cancelSubscription(payerUserId: string): Promise<SubscriptionRecord | null> {
  const sub = subscriptions.get(payerUserId);
  if (!sub) {
    return null;
  }
  sub.status = "canceled";
  sub.autoRenew = false;
  sub.canceledAt = new Date().toISOString();
  return sub;
}

export async function resumeSubscription(payerUserId: string): Promise<SubscriptionRecord | null> {
  const sub = subscriptions.get(payerUserId);
  if (!sub) {
    return null;
  }
  sub.status = "active";
  sub.autoRenew = true;
  sub.canceledAt = null;
  return sub;
}

export async function listInvoices(payerUserId: string): Promise<InvoiceRecord[]> {
  return invoices.get(payerUserId) ?? [];
}
