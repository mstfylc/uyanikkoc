"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { KiIcon } from "@/components/design/KiIcon";
import { UkBadge } from "@/components/design/UkBadge";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import {
  annualSavingAmount,
  formatTRY,
  INSTALLMENT_OPTIONS,
  planMonthlyEquivalent,
  planPrice,
} from "@uyanik/shared";
import type {
  BillingCycle,
  BillingPlanRecord,
  InvoiceRecord,
  PaymentMethodRecord,
  SubscriptionRecord,
} from "@uyanik/database";

type BillingPanelProps = {
  role: "student" | "parent";
};

export function BillingPanel({ role }: BillingPanelProps) {
  const [plans, setPlans] = useState<BillingPlanRecord[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionRecord | null>(null);
  const [plan, setPlan] = useState<BillingPlanRecord | null>(null);
  const [methods, setMethods] = useState<PaymentMethodRecord[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [installments, setInstallments] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [plansRes, subRes, methodsRes, invoicesRes] = await Promise.all([
      fetch("/api/billing/plans", { credentials: "same-origin" }),
      fetch("/api/billing/subscription", { credentials: "same-origin" }),
      fetch("/api/billing/payment-methods", { credentials: "same-origin" }),
      fetch("/api/billing/invoices", { credentials: "same-origin" }),
    ]);

    if (plansRes.ok) {
      const data = (await plansRes.json()) as { plans: BillingPlanRecord[] };
      setPlans(data.plans);
      setSelectedPlanId((current) => current ?? data.plans.find((p) => p.popular)?.id ?? data.plans[0]?.id ?? null);
    }
    if (subRes.ok) {
      const data = (await subRes.json()) as { subscription: SubscriptionRecord | null; plan: BillingPlanRecord | null };
      setSubscription(data.subscription);
      setPlan(data.plan);
    }
    if (methodsRes.ok) {
      const data = (await methodsRes.json()) as { methods: PaymentMethodRecord[] };
      setMethods(data.methods);
    }
    if (invoicesRes.ok) {
      const data = (await invoicesRes.json()) as { invoices: InvoiceRecord[] };
      setInvoices(data.invoices);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const selectedPlan = useMemo(
    () => plans.find((item) => item.id === selectedPlanId) ?? null,
    [plans, selectedPlanId],
  );

  async function subscribeNow() {
    if (!selectedPlanId) return;
    setIsSubmitting(true);
    setMessage(null);
    const defaultMethod = methods.find((m) => m.isDefault) ?? methods[0];
    const response = await fetch("/api/billing/subscription", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        planId: selectedPlanId,
        cycle,
        installments,
        paymentMethodId: defaultMethod?.id ?? null,
      }),
    });
    setIsSubmitting(false);
    if (response.ok) {
      setMessage("Abonelik basariyla olusturuldu.");
      await load();
    } else {
      setMessage("Abonelik olusturulamadi.");
    }
  }

  async function toggleAutoRenew() {
    if (!subscription) return;
    await fetch("/api/billing/subscription", {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "autoRenew", value: !subscription.autoRenew }),
    });
    await load();
  }

  async function addDemoCard() {
    const response = await fetch("/api/billing/payment-methods", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brand: "visa",
        last4: "4242",
        holder: role === "parent" ? "Demo Veli" : "Demo Ogrenci",
        expMonth: 12,
        expYear: 2028,
        makeDefault: true,
      }),
    });
    if (response.ok) await load();
  }

  return (
    <div className="stack rise" data-testid="billing-panel">
      <UkPageHead
        title="Odeme & Abonelik"
        sub={role === "parent" ? "Kocluk paketi ve faturalar" : "Kocluk aboneligin"}
      />

      {isLoading ? (
        <p className="muted" style={{ fontSize: 13 }}>Yukleniyor...</p>
      ) : (
        <>
          {subscription && plan ? (
            <UkSection title="Aktif abonelik" sub={plan.name}>
              <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div className="between">
                  <div>
                    <div style={{ fontWeight: 700 }}>{plan.name}</div>
                    <div className="muted" style={{ fontSize: 12.5 }}>
                      {subscription.cycle === "annual" ? "Yillik" : "Aylik"} ·{" "}
                      {formatTRY(planPrice(plan, subscription.cycle))}
                    </div>
                  </div>
                  <UkBadge tone={subscription.status === "active" ? "success" : "warning"}>
                    {subscription.status}
                  </UkBadge>
                </div>
                <div className="row" style={{ gap: 8 }}>
                  <button type="button" className="btn btn-light btn-sm" onClick={() => void toggleAutoRenew()}>
                    Otomatik yenileme: {subscription.autoRenew ? "Acik" : "Kapali"}
                  </button>
                </div>
              </div>
            </UkSection>
          ) : (
            <>
              <div className="seg" style={{ width: "fit-content" }}>
                <button type="button" className={cycle === "monthly" ? "on" : ""} onClick={() => setCycle("monthly")}>
                  Aylik
                </button>
                <button type="button" className={cycle === "annual" ? "on" : ""} onClick={() => setCycle("annual")}>
                  Yillik
                </button>
              </div>

              <div className="grid g-3">
                {plans.map((item) => {
                  const active = item.id === selectedPlanId;
                  const price = planPrice(item, cycle);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`card card-pad${active ? " ring-primary" : ""}`}
                      style={{ textAlign: "left", border: active ? "2px solid var(--primary-500)" : undefined }}
                      onClick={() => setSelectedPlanId(item.id)}
                    >
                      <div className="between" style={{ marginBottom: 8 }}>
                        <span style={{ fontWeight: 800 }}>{item.name}</span>
                        {item.popular ? <UkBadge tone="primary">Populer</UkBadge> : null}
                      </div>
                      <div className="muted" style={{ fontSize: 12.5, marginBottom: 10 }}>{item.tagline}</div>
                      <div className="tnum" style={{ fontSize: 24, fontWeight: 800 }}>
                        {formatTRY(price)}
                        <span className="muted" style={{ fontSize: 12, fontWeight: 500 }}>
                          /{cycle === "annual" ? "yil" : "ay"}
                        </span>
                      </div>
                      {cycle === "annual" ? (
                        <div className="muted" style={{ fontSize: 11.5, marginTop: 4 }}>
                          {formatTRY(planMonthlyEquivalent(item, cycle))}/ay ·{" "}
                          {formatTRY(annualSavingAmount(item))} tasarruf
                        </div>
                      ) : null}
                      <ul style={{ marginTop: 12, paddingLeft: 18, fontSize: 12.5, lineHeight: 1.5 }}>
                        {item.features.slice(0, 4).map((feature) => (
                          <li key={feature}>{feature}</li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </div>

              {selectedPlan ? (
                <UkSection title="Odeme" sub="Taksit secenegi">
                  <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
                      {INSTALLMENT_OPTIONS.map((option) => (
                        <button
                          key={option.count}
                          type="button"
                          className={`type-chip${installments === option.count ? " on" : ""}`}
                          onClick={() => setInstallments(option.count)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    {methods.length === 0 ? (
                      <button type="button" className="btn btn-light w-fit" onClick={() => void addDemoCard()}>
                        Demo kart ekle
                      </button>
                    ) : (
                      <p className="muted" style={{ fontSize: 12.5 }}>
                        Odeme: {methods.find((m) => m.isDefault)?.brand ?? methods[0]?.brand} ****{" "}
                        {methods.find((m) => m.isDefault)?.last4 ?? methods[0]?.last4}
                      </p>
                    )}
                    <button
                      type="button"
                      className="btn btn-primary w-fit"
                      disabled={isSubmitting || methods.length === 0}
                      onClick={() => void subscribeNow()}
                    >
                      {isSubmitting ? "Isleniyor..." : "Abone ol"}
                    </button>
                    {message ? <UkBadge tone="success">{message}</UkBadge> : null}
                  </div>
                </UkSection>
              ) : null}
            </>
          )}

          <UkSection title="Faturalar" sub={`${invoices.length} kayit`}>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {invoices.length === 0 ? (
                <p className="muted" style={{ fontSize: 13 }}>Henuz fatura yok.</p>
              ) : (
                invoices.map((invoice) => (
                  <div key={invoice.id} className="lrow">
                    <span className="lr-icon" style={{ background: "var(--surface-3)" }}>
                      <KiIcon name="ki-notepad-edit" />
                    </span>
                    <div style={{ flex: 1 }}>
                      <div className="lr-title">{invoice.id}</div>
                      <div className="lr-meta">
                        <span className="d">{new Date(invoice.issuedAt).toLocaleDateString("tr-TR")}</span>
                        <span className="d">{invoice.methodLabel}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="tnum" style={{ fontWeight: 700 }}>{formatTRY(invoice.amount)}</div>
                      <UkBadge tone={invoice.status === "paid" ? "success" : "warning"}>{invoice.status}</UkBadge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </UkSection>
        </>
      )}
    </div>
  );
}
