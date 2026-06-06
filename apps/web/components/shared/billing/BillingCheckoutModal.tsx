"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { CardBrandBadge } from "@/components/shared/billing/CardBrandBadge";
import { KiIcon } from "@/components/design/KiIcon";
import {
  brandFromNumber,
  fmtCardExpInput,
  fmtCardNum,
  parseCardExp,
} from "@/lib/design/billing-ui";
import {
  annualSavingMonths,
  computeInstallmentTotal,
  formatTRY,
  INSTALLMENT_OPTIONS,
  planMonthlyEquivalent,
  planPrice,
} from "@uyanik/shared";
import type { BillingCycle, BillingPlanRecord, PaymentMethodRecord } from "@uyanik/database";

type BillingCheckoutModalProps = {
  open: boolean;
  planId: string | null;
  cycle: BillingCycle | null;
  plans: BillingPlanRecord[];
  methods: PaymentMethodRecord[];
  onClose: () => void;
  onDone: () => void | Promise<void>;
};

function CardVisual({
  number,
  holder,
  exp,
  brand,
}: {
  number: string;
  holder: string;
  exp: string;
  brand: "visa" | "mastercard";
}) {
  return (
    <div className="cc-visual">
      <div className="cc-chip" />
      <CardBrandBadge brand={brand} />
      <div className="cc-number tnum">{number || "•••• •••• •••• ••••"}</div>
      <div className="cc-row">
        <div>
          <span className="cc-cap">Kart Sahibi</span>
          <div className="cc-val">{holder || "AD SOYAD"}</div>
        </div>
        <div>
          <span className="cc-cap">Son Kul.</span>
          <div className="cc-val tnum">{exp || "AA/YY"}</div>
        </div>
      </div>
    </div>
  );
}

export function BillingCheckoutModal({
  open,
  planId,
  cycle,
  plans,
  methods,
  onClose,
  onDone,
}: BillingCheckoutModalProps) {
  const [useNew, setUseNew] = useState(false);
  const [cardId, setCardId] = useState("");
  const [num, setNum] = useState("");
  const [holder, setHolder] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [installments, setInstallments] = useState(1);
  const [saveCard, setSaveCard] = useState(true);
  const [stage, setStage] = useState<"form" | "secure" | "done">("form");

  useEffect(() => {
    if (!open) return;
    const def = methods.find((m) => m.isDefault) ?? methods[0];
    setUseNew(methods.length === 0);
    setCardId(def?.id ?? "");
    setNum("");
    setHolder("");
    setExp("");
    setCvc("");
    setInstallments(1);
    setSaveCard(true);
    setStage("form");
  }, [open, methods]);

  if (!open || !planId || !cycle || typeof document === "undefined") return null;

  const plan = plans.find((item) => item.id === planId);
  if (!plan) return null;

  const base = planPrice(plan, cycle);
  const total = computeInstallmentTotal(base, installments);
  const perInst = Math.round(total / installments);
  const installmentOption = INSTALLMENT_OPTIONS.find((item) => item.count === installments) ?? INSTALLMENT_OPTIONS[0];
  const brand = useNew ? brandFromNumber(num) : methods.find((m) => m.id === cardId)?.brand ?? "visa";

  const canPay = useNew
    ? num.replace(/\s/g, "").length >= 15 && holder.trim().length > 2 && exp.length === 5 && cvc.length >= 3
    : Boolean(cardId);

  async function pay() {
    setStage("secure");
    await new Promise((resolve) => setTimeout(resolve, 1700));

    let paymentMethodId = cardId;
    if (useNew) {
      const parsed = parseCardExp(exp);
      if (!parsed) {
        setStage("form");
        return;
      }
      const cardRes = await fetch("/api/billing/payment-methods", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand,
          last4: num.replace(/\s/g, "").slice(-4),
          holder: holder.trim(),
          expMonth: parsed.expMonth,
          expYear: parsed.expYear,
          makeDefault: saveCard || methods.length === 0,
        }),
      });
      if (!cardRes.ok) {
        setStage("form");
        return;
      }
      const cardData = (await cardRes.json()) as { method: PaymentMethodRecord };
      paymentMethodId = cardData.method.id;
    }

    const subRes = await fetch("/api/billing/subscription", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        planId,
        cycle,
        installments,
        paymentMethodId,
      }),
    });

    if (!subRes.ok) {
      setStage("form");
      return;
    }

    setStage("done");
    setTimeout(() => {
      void onDone();
    }, 1200);
  }

  return createPortal(
    <div className="modal-overlay" onClick={stage === "form" ? onClose : undefined}>
      <div className="modal-panel checkout" style={{ maxWidth: 880 }} onClick={(e) => e.stopPropagation()}>
        {stage === "secure" ? (
          <div className="co-secure">
            <div className="co-spin">
              <KiIcon name="ki-lock" size={26} />
            </div>
            <h3>3D Secure dogrulamasi</h3>
            <p className="muted">
              Bankana yonlendiriliyorsun. Telefonuna gelen tek kullanimlik sifreyle odemeyi onayla.
            </p>
            <div className="co-bankbar">
              <span className="co-bankdot" /> Guvenli baglanti kuruldu…
            </div>
          </div>
        ) : stage === "done" ? (
          <div className="co-secure">
            <div className="co-ok">
              <KiIcon name="ki-check" size={34} />
            </div>
            <h3>Odeme basarili</h3>
            <p className="muted">
              {plan.name} ({cycle === "annual" ? "Yillik" : "Aylik"}) aboneligin aktif. Makbuzun fatura gecmisine
              eklendi.
            </p>
          </div>
        ) : (
          <>
            <div className="modal-head">
              <div className="row" style={{ gap: 11 }}>
                <span className="stat-icon tone-primary" style={{ width: 38, height: 38 }}>
                  <KiIcon name="ki-lock" size={18} />
                </span>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800 }}>Guvenli Odeme</h3>
                  <div className="muted" style={{ fontSize: 12 }}>256-bit SSL · iyzico altyapisi</div>
                </div>
              </div>
              <button type="button" className="icon-btn" style={{ width: 36, height: 36 }} onClick={onClose} aria-label="Kapat">
                <KiIcon name="ki-plus" size={18} style={{ transform: "rotate(45deg)" }} />
              </button>
            </div>

            <div className="co-body">
              <div className="co-form">
                {methods.length > 0 ? (
                  <div className="co-tabs">
                    <button type="button" className={!useNew ? "on" : ""} onClick={() => setUseNew(false)}>
                      Kayitli kart
                    </button>
                    <button type="button" className={useNew ? "on" : ""} onClick={() => setUseNew(true)}>
                      Yeni kart
                    </button>
                  </div>
                ) : null}

                {!useNew && methods.length > 0 ? (
                  <div className="co-cards">
                    {methods.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        className={`co-card${cardId === method.id ? " on" : ""}`}
                        onClick={() => setCardId(method.id)}
                      >
                        <CardBrandBadge brand={method.brand} size="sm" />
                        <span className="tnum" style={{ fontWeight: 700, fontSize: 13 }}>
                          •••• {method.last4}
                        </span>
                        <span className="muted tnum" style={{ fontSize: 11.5, marginLeft: "auto" }}>
                          {String(method.expMonth).padStart(2, "0")}/{String(method.expYear).slice(-2)}
                        </span>
                        <span className={`co-radio${cardId === method.id ? " on" : ""}`} />
                      </button>
                    ))}
                  </div>
                ) : (
                  <>
                    <CardVisual number={fmtCardNum(num)} holder={holder} exp={exp} brand={brand} />
                    <div className="field">
                      <label className="label">Kart Numarasi</label>
                      <div className="input-icon">
                        <input
                          className="input tnum"
                          inputMode="numeric"
                          placeholder="0000 0000 0000 0000"
                          value={fmtCardNum(num)}
                          onChange={(e) => setNum(fmtCardNum(e.target.value))}
                        />
                        <CardBrandBadge brand={brand} size="sm" />
                      </div>
                    </div>
                    <div className="field">
                      <label className="label">Kart Uzerindeki Isim</label>
                      <input
                        className="input"
                        placeholder="Ad Soyad"
                        value={holder}
                        onChange={(e) => setHolder(e.target.value.toLocaleUpperCase("tr-TR"))}
                      />
                    </div>
                    <div className="row" style={{ gap: 10 }}>
                      <div className="field" style={{ flex: 1 }}>
                        <label className="label">Son Kullanim</label>
                        <input
                          className="input tnum"
                          inputMode="numeric"
                          placeholder="AA/YY"
                          value={exp}
                          onChange={(e) => setExp(fmtCardExpInput(e.target.value))}
                        />
                      </div>
                      <div className="field" style={{ flex: 1 }}>
                        <label className="label">CVC</label>
                        <input
                          className="input tnum"
                          inputMode="numeric"
                          placeholder="123"
                          value={cvc}
                          onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        />
                      </div>
                    </div>
                    <label className="co-check">
                      <input type="checkbox" checked={saveCard} onChange={(e) => setSaveCard(e.target.checked)} />
                      <span>Sonraki odemeler icin karti guvenle kaydet</span>
                    </label>
                  </>
                )}

                <div style={{ marginTop: 4 }}>
                  <div className="label" style={{ marginBottom: 8 }}>
                    Taksit Secenekleri
                  </div>
                  <div className="co-taksit">
                    {INSTALLMENT_OPTIONS.map((option) => {
                      const optionTotal = computeInstallmentTotal(base, option.count);
                      return (
                        <button
                          key={option.count}
                          type="button"
                          className={`co-tk${installments === option.count ? " on" : ""}`}
                          onClick={() => setInstallments(option.count)}
                        >
                          <span className="co-tk-n">{option.label}</span>
                          <span className="co-tk-pm tnum">
                            {option.count === 1
                              ? formatTRY(optionTotal)
                              : `${formatTRY(Math.round(optionTotal / option.count))} x${option.count}`}
                          </span>
                          {option.rate > 0 ? (
                            <span className="co-tk-fark">+%{Math.round(option.rate * 100)} vade farki</span>
                          ) : (
                            <span className="co-tk-fark ok">vade farksiz</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="co-summary">
                <div className="co-sum-head">
                  <span className="badge badge-primary" style={{ height: 22 }}>
                    {cycle === "annual" ? "Yillik" : "Aylik"} abonelik
                  </span>
                  <h4>{plan.name}</h4>
                  <p className="muted" style={{ fontSize: 12 }}>
                    {plan.tagline}
                  </p>
                </div>
                <div className="co-sum-rows">
                  <div className="co-sum-row">
                    <span>
                      {plan.name} ({cycle === "annual" ? "12 ay" : "1 ay"})
                    </span>
                    <span className="tnum">{formatTRY(base)}</span>
                  </div>
                  {cycle === "annual" ? (
                    <div className="co-sum-row ok">
                      <span>Yillik indirim</span>
                      <span className="tnum">{annualSavingMonths(plan)} ay bedava</span>
                    </div>
                  ) : null}
                  {installmentOption.rate > 0 ? (
                    <div className="co-sum-row">
                      <span>Vade farki (%{Math.round(installmentOption.rate * 100)})</span>
                      <span className="tnum">{formatTRY(total - base)}</span>
                    </div>
                  ) : null}
                  <div className="co-sum-row">
                    <span>{installmentOption.label}</span>
                    <span className="tnum">{installments === 1 ? "—" : `${formatTRY(perInst)} / ay`}</span>
                  </div>
                </div>
                <div className="co-sum-total">
                  <span>Toplam</span>
                  <div style={{ textAlign: "right" }}>
                    <div className="tnum" style={{ fontSize: 22, fontWeight: 800 }}>
                      {formatTRY(total)}
                    </div>
                    {cycle === "annual" ? (
                      <div className="muted tnum" style={{ fontSize: 11 }}>
                        ≈ {formatTRY(planMonthlyEquivalent(plan, cycle))}/ay
                      </div>
                    ) : null}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-primary co-pay"
                  disabled={!canPay}
                  onClick={() => void pay()}
                  style={{ opacity: canPay ? 1 : 0.5 }}
                >
                  <KiIcon name="ki-lock" size={16} />
                  {formatTRY(total)} Ode
                </button>
                <div className="co-trust">
                  <span>
                    <KiIcon name="ki-shield-tick" size={13} />
                    KVKK uyumlu
                  </span>
                  <span>
                    <KiIcon name="ki-lock" size={13} />
                    3D Secure
                  </span>
                  <span>
                    <KiIcon name="ki-arrows-circle" size={13} />
                    Istediginde iptal
                  </span>
                </div>
                <p className="co-fine muted">
                  Devam ederek <b>Mesafeli Satis Sozlesmesi</b> ve <b>On Bilgilendirme Formu</b>&apos;nu kabul etmis
                  olursun.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
