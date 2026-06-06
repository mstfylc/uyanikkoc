export type BillingCycle = "monthly" | "annual";

export type InstallmentOption = {
  count: number;
  label: string;
  rate: number;
};

export const INSTALLMENT_OPTIONS: InstallmentOption[] = [
  { count: 1, label: "Tek Cekim", rate: 0 },
  { count: 3, label: "3 Taksit", rate: 0 },
  { count: 6, label: "6 Taksit", rate: 0.04 },
  { count: 9, label: "9 Taksit", rate: 0.08 },
  { count: 12, label: "12 Taksit", rate: 0.13 },
];

export function installmentOption(count: number): InstallmentOption {
  return INSTALLMENT_OPTIONS.find((option) => option.count === count) ?? INSTALLMENT_OPTIONS[0];
}

export function computeInstallmentTotal(baseAmount: number, installmentCount: number): number {
  const option = installmentOption(installmentCount);
  return Math.round(baseAmount * (1 + option.rate));
}

export type PlanPricing = { monthly: number; annual: number };

export function annualSavingMonths(plan: PlanPricing): number {
  if (plan.monthly <= 0) {
    return 0;
  }
  return Math.round((plan.monthly * 12 - plan.annual) / plan.monthly);
}

export function planMonthlyEquivalent(plan: PlanPricing, cycle: BillingCycle): number {
  return cycle === "annual" ? Math.round(plan.annual / 12) : plan.monthly;
}

export function planPrice(plan: PlanPricing, cycle: BillingCycle): number {
  return cycle === "annual" ? plan.annual : plan.monthly;
}

export function annualSavingAmount(plan: PlanPricing): number {
  return Math.max(0, plan.monthly * 12 - plan.annual);
}

const TRY_FORMATTER = new Intl.NumberFormat("tr-TR");
export function formatTRY(amount: number): string {
  return `₺${TRY_FORMATTER.format(amount)}`;
}
