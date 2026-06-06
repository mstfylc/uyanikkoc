import type { BillingCycle, BillingPlanRecord, PaymentMethodRecord } from "@uyanik/database";

export const PLAN_COLORS: Record<string, string> = {
  standart: "var(--info)",
  plus: "var(--primary)",
  vip: "var(--warning)",
};

export function planColor(planId: string): string {
  return PLAN_COLORS[planId] ?? "var(--primary)";
}

export function formatBillingDate(iso: string): string {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function billingDaysLeft(iso: string): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000));
}

export function formatCardExp(method: PaymentMethodRecord): string {
  const month = String(method.expMonth).padStart(2, "0");
  const year = String(method.expYear).slice(-2);
  return `${month}/${year}`;
}

export function brandFromNumber(num: string): "visa" | "mastercard" {
  const n = num.replace(/\s/g, "");
  if (n.startsWith("4")) return "visa";
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return "mastercard";
  return "visa";
}

export function fmtCardNum(value: string): string {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

export function fmtCardExpInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length >= 3 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

export function parseCardExp(exp: string): { expMonth: number; expYear: number } | null {
  const match = /^(\d{2})\/(\d{2})$/.exec(exp.trim());
  if (!match) return null;
  const expMonth = Number(match[1]);
  const expYear = 2000 + Number(match[2]);
  if (expMonth < 1 || expMonth > 12) return null;
  return { expMonth, expYear };
}

export function isCurrentPlan(
  plan: BillingPlanRecord,
  cycle: BillingCycle,
  subscription: { planId: string; cycle: BillingCycle; status: string } | null,
): boolean {
  return (
    subscription?.status !== "canceled" &&
    subscription?.planId === plan.id &&
    subscription?.cycle === cycle
  );
}

export function downloadTextFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function invoiceReceiptText(
  invoice: {
    id: string;
    issuedAt: string;
    planId: string;
    cycle: BillingCycle;
    methodLabel: string;
    installments: number;
    amount: number;
  },
  planName: string,
  formatTRY: (amount: number) => string,
): string {
  return [
    "UYANIK KOC — ODEME MAKBUZU",
    "",
    `Fatura No: ${invoice.id}`,
    `Tarih: ${formatBillingDate(invoice.issuedAt)}`,
    `Plan: ${planName} (${invoice.cycle === "annual" ? "Yillik" : "Aylik"})`,
    `Odeme yontemi: ${invoice.methodLabel}`,
    invoice.installments > 1 ? `Taksit: ${invoice.installments} ay` : "Tek cekim",
    `Tutar: ${formatTRY(invoice.amount)}`,
    "Durum: Odendi",
    "",
    "Bu belge bilgilendirme amaclidir.",
  ].join("\n");
}
