"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { BillingAddCardModal } from "@/components/shared/billing/BillingAddCardModal";
import { BillingCheckoutModal } from "@/components/shared/billing/BillingCheckoutModal";
import { CardBrandBadge } from "@/components/shared/billing/CardBrandBadge";
import { DenemeUyelikSection } from "@/components/shared/DenemeUyelikSection";
import { KiIcon } from "@/components/design/KiIcon";
import { UkBadge } from "@/components/design/UkBadge";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import { UkStatCard } from "@/components/design/UkStatCard";
import {
  billingDaysLeft,
  downloadTextFile,
  formatBillingDate,
  formatCardExp,
  invoiceReceiptText,
  isCurrentPlan,
  planColor,
} from "@/lib/design/billing-ui";
import {
  annualSavingAmount,
  formatTRY,
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

type BillingTab = "sub" | "plans" | "invoices" | "methods";

type BillingPanelProps = {
  role: "student" | "parent";
  embedded?: boolean;
};

type CheckoutState = { planId: string; cycle: BillingCycle } | null;

const TABS: Array<{ key: BillingTab; label: string; icon: string }> = [
  { key: "sub", label: "Aboneliğim", icon: "ki-star" },
  { key: "plans", label: "Paketler", icon: "ki-flash" },
  { key: "invoices", label: "Faturalar", icon: "ki-receipt-square" },
  { key: "methods", label: "Odeme Yontemleri", icon: "ki-wallet" },
];

export function BillingPanel({ role, embedded = false }: BillingPanelProps) {
  const [tab, setTab] = useState<BillingTab>("sub");
  const [checkout, setCheckout] = useState<CheckoutState>(null);
  const [plans, setPlans] = useState<BillingPlanRecord[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionRecord | null>(null);
  const [plan, setPlan] = useState<BillingPlanRecord | null>(null);
  const [methods, setMethods] = useState<PaymentMethodRecord[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [pricingCycle, setPricingCycle] = useState<BillingCycle>("annual");
  const [isLoading, setIsLoading] = useState(true);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [addCardOpen, setAddCardOpen] = useState(false);

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
    }
    if (subRes.ok) {
      const data = (await subRes.json()) as {
        subscription: SubscriptionRecord | null;
        plan: BillingPlanRecord | null;
      };
      setSubscription(data.subscription);
      setPlan(data.plan);
      if (data.subscription?.cycle) {
        setPricingCycle(data.subscription.cycle);
      }
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

  const activePlan = plan ?? plans.find((item) => item.id === subscription?.planId) ?? null;
  const card = methods.find((item) => item.id === subscription?.paymentMethodId) ?? methods.find((m) => m.isDefault);
  const canceled = subscription?.status === "canceled";
  const paidTotal = useMemo(
    () => invoices.filter((item) => item.status === "paid").reduce((sum, item) => sum + item.amount, 0),
    [invoices],
  );

  function openCheckout(planId: string, cycle: BillingCycle) {
    setCheckout({ planId, cycle });
  }

  async function patchSubscription(action: "autoRenew" | "cancel" | "resume", value?: boolean) {
    await fetch("/api/billing/subscription", {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, value }),
    });
    await load();
  }

  async function setDefaultCard(methodId: string) {
    await fetch("/api/billing/payment-methods", {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: methodId }),
    });
    await load();
  }

  async function removeCard(methodId: string) {
    await fetch("/api/billing/payment-methods", {
      method: "DELETE",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: methodId }),
    });
    await load();
  }

  return (
    <div className="stack rise" data-testid="billing-panel">
      {!embedded ? (
        <UkPageHead
          title="Abonelik & Ödeme"
          sub="Koçluk paketini, faturalarını ve ödeme yöntemlerini yönet"
        />
      ) : null}

      <div className="seg-tabs">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`seg-tab${tab === item.key ? " on" : ""}`}
            onClick={() => setTab(item.key)}
          >
            <KiIcon name={item.icon} size={16} />
            {item.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="muted" style={{ fontSize: 13 }}>Yükleniyor...</p>
      ) : (
        <>
          {tab === "plans" ? (
            <div className="stack" style={{ gap: 18 }}>
              <div className="pricing-toggle-wrap">
                <div className="seg pricing-toggle">
                  <button type="button" className={pricingCycle === "monthly" ? "on" : ""} onClick={() => setPricingCycle("monthly")}>
                    Aylık
                  </button>
                  <button type="button" className={pricingCycle === "annual" ? "on" : ""} onClick={() => setPricingCycle("annual")}>
                    Yıllık <span className="save-pill">2 ay bedava</span>
                  </button>
                </div>
              </div>
              <div className="pricing-grid">
                {plans.map((item) => {
                  const current = isCurrentPlan(item, pricingCycle, subscription);
                  return (
                    <div key={item.id} className={`plan-card${item.popular ? " popular" : ""}`}>
                      {item.popular ? <span className="plan-flag">En çok tercih edilen</span> : null}
                      <div className="plan-top">
                        <span className="plan-dot" style={{ background: planColor(item.id) }} />
                        <h3>{item.name}</h3>
                        <p className="muted">{item.tagline}</p>
                      </div>
                      <div className="plan-price">
                        <span className="tnum amount">{formatTRY(planMonthlyEquivalent(item, pricingCycle))}</span>
                        <span className="per muted">
                          /ay
                          {pricingCycle === "annual" ? (
                            <span className="tnum"> · yillik {formatTRY(item.annual)}</span>
                          ) : null}
                        </span>
                      </div>
                      {pricingCycle === "annual" ? (
                        <div className="plan-saved">
                          <KiIcon name="ki-check" size={13} />
                          Ayliga gore {formatTRY(annualSavingAmount(item))} tasarruf
                        </div>
                      ) : (
                        <div className="plan-saved muted" style={{ background: "transparent" }}>
                          Istedigin zaman yilliga gec
                        </div>
                      )}
                      <ul className="plan-feat">
                        {item.features.map((feature) => (
                          <li key={feature}>
                            <KiIcon name="ki-check" size={15} style={{ color: planColor(item.id) }} />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      {current ? (
                        <button type="button" className="btn btn-light" disabled style={{ width: "100%", opacity: 0.7 }}>
                          <KiIcon name="ki-check" size={16} />
                          Mevcut planin
                        </button>
                      ) : (
                        <button
                          type="button"
                          className={`btn ${item.popular ? "btn-primary" : "btn-outline"}`}
                          style={{ width: "100%" }}
                          onClick={() => openCheckout(item.id, pricingCycle)}
                        >
                          {item.name} Sec
                          <KiIcon name="ki-right" size={16} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="pricing-note">
                <KiIcon name="ki-shield-tick" size={16} />
                Tüm paketler KVKK uyumlu, 3D Secure korumalı. İlk 7 gün içinde iptal edersen ücret iadesi yapılır.
              </div>
            </div>
          ) : null}

          {tab === "sub" ? (
            <div className="stack" style={{ gap: 16 }}>
              {!subscription || !activePlan ? (
                <UkSection title="Abonelik yok" sub="Koçluk paketi seçmek için Paketler sekmesine geç">
                  <div className="card-body">
                    <button type="button" className="btn btn-primary" onClick={() => setTab("plans")}>
                      Paketleri Gor
                    </button>
                  </div>
                </UkSection>
              ) : (
                <>
                  <div className={`sub-hero${canceled ? " canceled" : ""}`}>
                  <div className="sub-hero-main">
                    <div className="row" style={{ gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                      <span className="plan-dot" style={{ background: planColor(activePlan.id), width: 12, height: 12 }} />
                      <h2 style={{ fontSize: 22, fontWeight: 800 }}>{activePlan.name}</h2>
                      {canceled ? (
                        <UkBadge tone="danger">Iptal edildi</UkBadge>
                      ) : (
                        <UkBadge tone="success">
                          <span className="dot-live" />
                          Aktif
                        </UkBadge>
                      )}
                      <UkBadge tone="muted">{subscription.cycle === "annual" ? "Yıllık" : "Aylık"}</UkBadge>
                    </div>
                    <p className="muted" style={{ fontSize: 13.5, maxWidth: 440 }}>{activePlan.tagline}</p>
                    <div className="sub-meta">
                      <div>
                        <span className="muted">Baslangic</span>
                        <b>{formatBillingDate(subscription.startedAt)}</b>
                      </div>
                      <div>
                        <span className="muted">{canceled ? "Erişim sonu" : "Sonraki yenileme"}</span>
                        <b>{formatBillingDate(subscription.renewsAt)}</b>
                      </div>
                      <div>
                        <span className="muted">Ödeme yöntemi</span>
                        <b className="row" style={{ gap: 6 }}>
                          {card ? (
                            <>
                              <CardBrandBadge brand={card.brand} size="sm" /> •{card.last4}
                            </>
                          ) : (
                            "—"
                          )}
                        </b>
                      </div>
                    </div>
                  </div>
                  <div className="sub-hero-side">
                    <div className="sub-countdown">
                      <span className="tnum">{billingDaysLeft(subscription.renewsAt)}</span>
                      <span className="muted">gün {canceled ? "erişim" : "kaldı"}</span>
                    </div>
                    <div className="tnum" style={{ fontSize: 15, fontWeight: 800 }}>
                      {formatTRY(planPrice(activePlan, subscription.cycle))}
                      <span className="muted" style={{ fontSize: 11, fontWeight: 500 }}>
                        /{subscription.cycle === "annual" ? "yil" : "ay"}
                      </span>
                    </div>
                  </div>
                </div>

                {canceled ? (
                  <div className="notice warn">
                    <KiIcon name="ki-information-2" size={18} />
                    <div style={{ flex: 1 }}>
                      <b>Aboneliğin iptal edildi.</b>
                      <div className="muted" style={{ fontSize: 12.5 }}>
                        {formatBillingDate(subscription.renewsAt)} tarihine kadar erişimin devam eder.
                      </div>
                    </div>
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => void patchSubscription("resume")}>
                      <KiIcon name="ki-arrows-circle" size={15} />
                      Aboneliği Sürdür
                    </button>
                  </div>
                ) : (
                  <UkSection title="Plan & Yenileme" sub="Planini yukselt veya yenilemeyi yonet">
                    <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      <label className="renew-toggle">
                        <div>
                          <b style={{ fontSize: 13.5 }}>Otomatik yenileme</b>
                          <div className="muted" style={{ fontSize: 12 }}>
                            {subscription.cycle === "annual" ? "Yıl" : "Ay"} sonunda{" "}
                            {formatTRY(planPrice(activePlan, subscription.cycle))} otomatik tahsil edilir
                          </div>
                        </div>
                        <button
                          type="button"
                          className={`switch${subscription.autoRenew ? " on" : ""}`}
                          aria-label="Otomatik yenileme"
                          onClick={() => void patchSubscription("autoRenew", !subscription.autoRenew)}
                        >
                          <span />
                        </button>
                      </label>
                      <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
                        <button type="button" className="btn btn-outline" onClick={() => setTab("plans")}>
                          <KiIcon name="ki-arrow-up" size={16} />
                          Planı Değiştir / Yükselt
                        </button>
                        {subscription.cycle === "monthly" ? (
                          <button
                            type="button"
                            className="btn btn-light"
                            onClick={() => openCheckout(subscription.planId, "annual")}
                          >
                            <KiIcon name="ki-star" size={15} />
                            Yılliga gec · 2 ay bedava
                          </button>
                        ) : null}
                        <button
                          type="button"
                          className="btn btn-ghost-danger"
                          style={{ marginLeft: "auto" }}
                          onClick={() => setConfirmCancel(true)}
                        >
                          Aboneliği iptal et
                        </button>
                      </div>
                    </div>
                  </UkSection>
                )}
                </>
              )}
              <DenemeUyelikSection
                billingBasePath={role === "parent" ? "/parent/billing" : "/student/billing"}
              />
            </div>
          ) : null}

          {tab === "invoices" ? (
            <div className="stack" style={{ gap: 14 }}>
              <div className="grid g-3">
                <UkStatCard icon="ki-receipt-square" tone="primary" value={invoices.length} label="Toplam fatura" />
                <UkStatCard icon="ki-dollar" tone="success" value={formatTRY(paidTotal)} label="Ödenen tutar" />
                <UkStatCard
                  icon="ki-calendar"
                  tone="info"
                  value={
                    invoices[0]
                      ? formatBillingDate(invoices[0].issuedAt).split(" ").slice(1).join(" ")
                      : "—"
                  }
                  label="Son ödeme"
                />
              </div>
              <UkSection title="Fatura & Ödeme Geçmişi" sub="Geçmiş ödemelerini görüntüle ve makbuzları indir">
                <div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
                  <table className="tbl" style={{ minWidth: 640 }}>
                    <thead>
                      <tr>
                        <th>Fatura No</th>
                        <th>Tarih</th>
                        <th>Plan</th>
                        <th>Yontem</th>
                        <th style={{ textAlign: "right" }}>Tutar</th>
                        <th style={{ textAlign: "center" }}>Durum</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="muted" style={{ padding: 20, textAlign: "center" }}>
                            Henuz fatura yok.
                          </td>
                        </tr>
                      ) : (
                        invoices.map((invoice) => {
                          const invoicePlan = plans.find((item) => item.id === invoice.planId);
                          const tone =
                            invoice.status === "paid" ? "success" : invoice.status === "pending" ? "warning" : "danger";
                          const label =
                            invoice.status === "paid" ? "Ödendi" : invoice.status === "pending" ? "Bekliyor" : "Başarısız";
                          return (
                            <tr key={invoice.id}>
                              <td>
                                <span className="tnum" style={{ fontWeight: 700, fontSize: 12.5 }}>
                                  {invoice.id}
                                </span>
                              </td>
                              <td>
                                <span className="muted" style={{ fontSize: 12.5 }}>
                                  {formatBillingDate(invoice.issuedAt)}
                                </span>
                              </td>
                              <td>
                                <div className="row" style={{ gap: 7 }}>
                                  <span className="plan-dot" style={{ background: planColor(invoice.planId) }} />
                                  <span style={{ fontSize: 12.5, fontWeight: 600 }}>
                                    {invoicePlan?.name ?? invoice.planId}
                                  </span>
                                  <span className="muted" style={{ fontSize: 11 }}>
                                    {invoice.cycle === "annual" ? "Yıllık" : "Aylık"}
                                    {invoice.installments > 1 ? ` · ${invoice.installments}x` : ""}
                                  </span>
                                </div>
                              </td>
                              <td>
                                <span className="muted tnum" style={{ fontSize: 12 }}>
                                  {invoice.methodLabel}
                                </span>
                              </td>
                              <td style={{ textAlign: "right" }}>
                                <span className="tnum" style={{ fontWeight: 700 }}>
                                  {formatTRY(invoice.amount)}
                                </span>
                              </td>
                              <td style={{ textAlign: "center" }}>
                                <UkBadge tone={tone}>{label}</UkBadge>
                              </td>
                              <td style={{ textAlign: "right" }}>
                                <button
                                  type="button"
                                  className="icon-btn"
                                  style={{ width: 32, height: 32 }}
                                  title="Makbuzu indir"
                                  aria-label="Indir"
                                  onClick={() =>
                                    downloadTextFile(
                                      `makbuz-${invoice.id}.txt`,
                                      invoiceReceiptText(
                                        invoice,
                                        invoicePlan?.name ?? invoice.planId,
                                        formatTRY,
                                      ),
                                    )
                                  }
                                >
                                  <KiIcon name="ki-cloud-download" size={16} />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </UkSection>
            </div>
          ) : null}

          {tab === "methods" ? (
            <div className="stack" style={{ gap: 14 }}>
              <UkSection
                title="Kayitli Kartlar"
                sub="Yenilemeler ve yeni ödemeler için kullanılır"
                action={
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => setAddCardOpen(true)}>
                    <KiIcon name="ki-plus" size={15} />
                    Kart Ekle
                  </button>
                }
              >
                <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {methods.length === 0 ? (
                    <button type="button" onClick={() => setAddCardOpen(true)} className="dropzone" style={{ padding: "28px 24px" }}>
                      <KiIcon name="ki-wallet" size={26} style={{ color: "var(--faint)" }} />
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-2)" }}>Kayitli kart yok</div>
                      <div className="muted" style={{ fontSize: 12 }}>
                        Hızlı ödeme için bir <b style={{ color: "var(--primary-600)" }}>kart ekle</b>
                      </div>
                    </button>
                  ) : (
                    methods.map((method) => (
                      <div key={method.id} className="pm-row">
                        <CardBrandBadge brand={method.brand} />
                        <div style={{ minWidth: 0 }}>
                          <div className="row" style={{ gap: 8 }}>
                            <b className="tnum" style={{ fontSize: 14 }}>
                              •••• •••• •••• {method.last4}
                            </b>
                            {method.isDefault ? <UkBadge tone="primary">Varsayılan</UkBadge> : null}
                          </div>
                          <div className="muted" style={{ fontSize: 12 }}>
                            {method.holder} · son kul. {formatCardExp(method)}
                          </div>
                        </div>
                        <div className="row" style={{ gap: 6, marginLeft: "auto" }}>
                          {!method.isDefault ? (
                            <button type="button" className="btn btn-light btn-sm" onClick={() => void setDefaultCard(method.id)}>
                              Varsayılan yap
                            </button>
                          ) : null}
                          <button
                            type="button"
                            className="icon-btn"
                            style={{ width: 34, height: 34, color: "var(--danger)" }}
                            onClick={() => void removeCard(method.id)}
                            title="Kartı sil"
                            aria-label="Sil"
                          >
                            <KiIcon name="ki-plus" size={16} style={{ transform: "rotate(45deg)" }} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                  <div className="pm-secure">
                    <KiIcon name="ki-lock" size={14} />
                    Kart bilgilerin uygulamada saklanmaz; iyzico güvenli kasasında tutulur.
                  </div>
                </div>
              </UkSection>
            </div>
          ) : null}
        </>
      )}

      <BillingCheckoutModal
        open={Boolean(checkout)}
        planId={checkout?.planId ?? null}
        cycle={checkout?.cycle ?? null}
        plans={plans}
        methods={methods}
        onClose={() => setCheckout(null)}
        onDone={async () => {
          setCheckout(null);
          setTab("sub");
          await load();
        }}
      />

      <BillingAddCardModal open={addCardOpen} onClose={() => setAddCardOpen(false)} onSaved={load} />

      {confirmCancel && subscription && typeof document !== "undefined"
        ? createPortal(
            <div className="modal-overlay" onClick={() => setConfirmCancel(false)}>
              <div className="modal-panel" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
                <div className="modal-body" style={{ padding: 24, textAlign: "center", gap: 12 }}>
                  <span className="stat-icon tone-danger" style={{ width: 48, height: 48, margin: "0 auto" }}>
                    <KiIcon name="ki-information-2" size={24} />
                  </span>
                  <h3 style={{ fontSize: 17, fontWeight: 800 }}>Aboneliği iptal et?</h3>
                  <p className="muted" style={{ fontSize: 13 }}>
                    {formatBillingDate(subscription.renewsAt)} tarihine kadar tüm koçluk özelliklerine erişimin sürer.
                  </p>
                </div>
                <div className="modal-foot">
                  <button type="button" className="btn btn-light" onClick={() => setConfirmCancel(false)}>
                    Vazgeç
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    style={{ marginLeft: "auto" }}
                    onClick={() => {
                      void patchSubscription("cancel");
                      setConfirmCancel(false);
                    }}
                  >
                    Iptali Onayla
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
