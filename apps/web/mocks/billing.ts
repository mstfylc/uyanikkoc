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
    name: "Standart Koçluk",
    tagline: "Düzenli takip ve birebir koçluk",
    monthly: 1499,
    annual: 14990,
    popular: false,
    sortOrder: 0,
    features: [
      "Haftalık birebir koçluk görüşmesi",
      "Kişiye özel haftalık çalışma programı",
      "Ödev atama ve takibi",
      "Deneme analizi ve net takibi",
      "Konu takibi paneli",
    ],
  },
  {
    id: "plus",
    name: "Plus Koçluk",
    tagline: "Aileyle birlikte tam destek",
    monthly: 2299,
    annual: 22990,
    popular: true,
    sortOrder: 1,
    features: [
      "Standart paketteki her şey",
      "Veliye haftalık gelişim raporu",
      "Sınırsız mesajlaşma (koç + öğrenci)",
      "Motivasyon ve hedef takibi",
      "Önceliklendirilmiş randevu",
    ],
  },
  {
    id: "vip",
    name: "VIP Koçluk",
    tagline: "Yoğun tempo, üst düzey mentorluk",
    monthly: 3499,
    annual: 34990,
    popular: false,
    sortOrder: 2,
    features: [
      "Plus paketteki her şey",
      "Haftada 2 birebir görüşme",
      "Kıdemli mentor eşleştirmesi",
      "Tercih ve kariyer danismanligi",
      "7/24 oncelikli destek hatti",
    ],
  },
];

const methods = new Map<string, PaymentMethodRecord[]>();
const subscriptions = new Map<string, SubscriptionRecord>();
const invoices = new Map<string, InvoiceRecord[]>();
let seq = 1;

const DEMO_BILLING_USERS = [
  {
    userId: "user_student_001",
    studentId: "student_001",
    planId: "plus",
    cycle: "annual" as const,
    brand: "visa" as const,
    last4: "4242",
    holder: "Demo Ogrenci",
    amount: 22990,
  },
  {
    userId: "user_student_002",
    studentId: "student_002",
    planId: "standart",
    cycle: "monthly" as const,
    brand: "mastercard" as const,
    last4: "8821",
    holder: "Mert Demir",
    amount: 1499,
  },
  {
    userId: "user_parent_001",
    studentId: "student_001",
    planId: "vip",
    cycle: "annual" as const,
    brand: "visa" as const,
    last4: "3409",
    holder: "Demo Veli",
    amount: 34990,
  },
] satisfies Array<{
  userId: string;
  studentId: string;
  planId: string;
  cycle: "monthly" | "annual";
  brand: "visa" | "mastercard";
  last4: string;
  holder: string;
  amount: number;
}>;

function nextRenewal(cycle: "monthly" | "annual", from = new Date()): Date {
  const d = new Date(from);
  if (cycle === "annual") {
    d.setFullYear(d.getFullYear() + 1);
  } else {
    d.setMonth(d.getMonth() + 1);
  }
  return d;
}

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

function seedDemoBillingForUser(userId: string): void {
  const demo = DEMO_BILLING_USERS.find((item) => item.userId === userId);
  if (!demo) {
    return;
  }

  if (!methods.has(userId)) {
    methods.set(userId, [
      {
        id: `pm_demo_${userId}`,
        userId,
        brand: demo.brand,
        last4: demo.last4,
        holder: demo.holder,
        expMonth: 12,
        expYear: 2029,
        isDefault: true,
        createdAt: isoDaysAgo(42),
      },
    ]);
  }

  if (!subscriptions.has(userId)) {
    const startedAt = isoDaysAgo(demo.cycle === "annual" ? 86 : 18);
    subscriptions.set(userId, {
      id: `sub_demo_${userId}`,
      payerUserId: userId,
      studentId: demo.studentId,
      planId: demo.planId,
      cycle: demo.cycle,
      status: "active",
      autoRenew: true,
      startedAt,
      renewsAt: nextRenewal(demo.cycle, new Date(startedAt)).toISOString(),
      canceledAt: null,
      paymentMethodId: `pm_demo_${userId}`,
    });
  }

  if (!invoices.has(userId)) {
    invoices.set(userId, [
      {
        id: `UK-2026-${demo.userId.endsWith("001") ? "2407" : "2411"}`,
        subscriptionId: `sub_demo_${userId}`,
        payerUserId: userId,
        planId: demo.planId,
        cycle: demo.cycle,
        amount: demo.amount,
        status: "paid",
        installments: demo.cycle === "annual" ? 3 : 1,
        methodLabel: `${demo.brand === "visa" ? "Visa" : "MasterCard"} •${demo.last4}`,
        paymentMethodId: `pm_demo_${userId}`,
        issuedAt: isoDaysAgo(18),
      },
      {
        id: `UK-2026-${demo.userId.endsWith("001") ? "2319" : "2304"}`,
        subscriptionId: `sub_demo_${userId}`,
        payerUserId: userId,
        planId: demo.planId,
        cycle: demo.cycle,
        amount: demo.cycle === "annual" ? Math.round(demo.amount / 3) : demo.amount,
        status: "paid",
        installments: 1,
        methodLabel: `${demo.brand === "visa" ? "Visa" : "MasterCard"} •${demo.last4}`,
        paymentMethodId: `pm_demo_${userId}`,
        issuedAt: isoDaysAgo(48),
      },
    ]);
  }
}

export async function listPlans(): Promise<BillingPlanRecord[]> {
  return [...PLANS].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getPlan(planId: string): Promise<BillingPlanRecord | null> {
  return PLANS.find((plan) => plan.id === planId) ?? null;
}

export async function listPaymentMethods(userId: string): Promise<PaymentMethodRecord[]> {
  seedDemoBillingForUser(userId);
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
  seedDemoBillingForUser(payerUserId);
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
  seedDemoBillingForUser(payerUserId);
  return invoices.get(payerUserId) ?? [];
}
