import type {
  BillingPlanRecord,
  CreatePaymentMethodInput,
  CreateSubscriptionInput,
  InvoiceRecord,
  PaymentMethodRecord,
  SubscriptionRecord,
} from "@uyanik/database";

import { shouldUseDatabase } from "@/lib/data/env";
import * as memoryBilling from "@/mocks/billing";

async function repo() {
  const { billingRepository } = await import("@uyanik/database");
  return billingRepository;
}

export type SubscriptionView = {
  subscription: SubscriptionRecord | null;
  plan: BillingPlanRecord | null;
};

export async function listPlans(): Promise<BillingPlanRecord[]> {
  if (shouldUseDatabase()) {
    return (await repo()).listPlans();
  }
  return memoryBilling.listPlans();
}

export async function getSubscriptionView(payerUserId: string): Promise<SubscriptionView> {
  const source = shouldUseDatabase() ? await repo() : memoryBilling;
  const subscription = await source.getActiveSubscription(payerUserId);
  const plan = subscription ? await source.getPlan(subscription.planId) : null;
  return { subscription, plan };
}

export async function subscribe(
  input: CreateSubscriptionInput,
): Promise<{ subscription: SubscriptionRecord; invoice: InvoiceRecord }> {
  if (shouldUseDatabase()) {
    return (await repo()).subscribe(input);
  }
  return memoryBilling.subscribe(input);
}

export async function setAutoRenew(payerUserId: string, on: boolean): Promise<SubscriptionRecord | null> {
  if (shouldUseDatabase()) {
    return (await repo()).setAutoRenew(payerUserId, on);
  }
  return memoryBilling.setAutoRenew(payerUserId, on);
}

export async function cancelSubscription(payerUserId: string): Promise<SubscriptionRecord | null> {
  if (shouldUseDatabase()) {
    return (await repo()).cancelSubscription(payerUserId);
  }
  return memoryBilling.cancelSubscription(payerUserId);
}

export async function resumeSubscription(payerUserId: string): Promise<SubscriptionRecord | null> {
  if (shouldUseDatabase()) {
    return (await repo()).resumeSubscription(payerUserId);
  }
  return memoryBilling.resumeSubscription(payerUserId);
}

export async function listInvoices(payerUserId: string): Promise<InvoiceRecord[]> {
  if (shouldUseDatabase()) {
    return (await repo()).listInvoices(payerUserId);
  }
  return memoryBilling.listInvoices(payerUserId);
}

export async function listPaymentMethods(userId: string): Promise<PaymentMethodRecord[]> {
  if (shouldUseDatabase()) {
    return (await repo()).listPaymentMethods(userId);
  }
  return memoryBilling.listPaymentMethods(userId);
}

export async function addPaymentMethod(input: CreatePaymentMethodInput): Promise<PaymentMethodRecord> {
  if (shouldUseDatabase()) {
    return (await repo()).addPaymentMethod(input);
  }
  return memoryBilling.addPaymentMethod(input);
}

export async function setDefaultPaymentMethod(userId: string, methodId: string): Promise<boolean> {
  if (shouldUseDatabase()) {
    return (await repo()).setDefaultPaymentMethod(userId, methodId);
  }
  return memoryBilling.setDefaultPaymentMethod(userId, methodId);
}

export async function removePaymentMethod(userId: string, methodId: string): Promise<boolean> {
  if (shouldUseDatabase()) {
    return (await repo()).removePaymentMethod(userId, methodId);
  }
  return memoryBilling.removePaymentMethod(userId, methodId);
}
