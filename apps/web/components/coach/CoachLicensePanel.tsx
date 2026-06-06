// Bireysel koç lisans yönetimi. apps/web/components/coach/CoachLicensePanel.tsx
// Prototip kaynağı: admin/coach-license.jsx (zip-16 v2).
"use client";

import Link from "next/link";
import { useState } from "react";

import {
  ConfirmModal,
  Icon,
  Meter,
  ModuleGrid,
  StatusBadge,
} from "@/components/admin/AdminKit";
import { useAdminStore } from "@/components/admin/AdminStore";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import { daysLeft, fmtShort, tl } from "@/lib/admin/format";
import { COACH_PLANS, coachPlanById } from "@/lib/admin/pricing";
import { resolveSoloCoachId } from "@/lib/admin/snapshot-context";
import type { BillingCycle, CoachPlanId, SoloCoach } from "@/lib/admin/types";

function CoachCheckoutDialog({
  coach,
  planId,
  cycle,
  onClose,
  onDone,
}: {
  coach: SoloCoach;
  planId: CoachPlanId;
  cycle: BillingCycle;
  onClose: () => void;
  onDone: () => void;
}) {
  const { mutate, toast } = useAdminStore();
  const [step, setStep] = useState<"review" | "processing" | "done">("review");
  const [num, setNum] = useState("4242 4242 4242 4242");
  const [holder, setHolder] = useState(coach.name.toUpperCase());
  const [exp, setExp] = useState("08/27");
  const [cvc, setCvc] = useState("123");
  const p = coachPlanById(planId);
  const amount = cycle === "annual" ? p.annual : p.monthly;

  async function pay() {
    setStep("processing");
    await mutate({ kind: "buyCoachPlan", coachId: coach.id, planId, cycle });
    setStep("done");
    toast(p.name + " planı aktif edildi", { icon: "ki-check-circle" });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800 }}>
              {step === "done" ? "Ödeme tamamlandı" : `${p.name} — ${cycle === "annual" ? "Yıllık" : "Aylık"}`}
            </h3>
            <div className="muted" style={{ fontSize: 12.5 }}>{step === "done" ? "Lisansın aktif" : "Güvenli ödeme · 3D Secure"}</div>
          </div>
          <button type="button" className="icon-btn" style={{ width: 34, height: 34 }} onClick={onClose} aria-label="Kapat">
            <Icon name="plus" size={18} style={{ transform: "rotate(45deg)" }} />
          </button>
        </div>

        {step !== "done" ? (
          <div className="modal-body" style={{ padding: 20, gap: 14 }}>
            <div className="card" style={{ background: "var(--surface-2)" }}>
              <div className="card-pad" style={{ padding: 16 }}>
                <div className="between">
                  <span className="row" style={{ gap: 8 }}>
                    <span className="plan-dot" style={{ background: p.color }} />
                    <b>{p.name}</b>
                  </span>
                  <b className="tnum">{tl(amount)}</b>
                </div>
                <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                  {p.seats >= 999 ? "Sınırsız öğrenci" : `${p.seats} öğrenciye kadar`} · {cycle === "annual" ? "yıllık fatura" : "aylık fatura"}
                </div>
              </div>
            </div>
            <div className="field">
              <label className="label">Kart numarası</label>
              <input className="input tnum" value={num} onChange={(e) => setNum(e.target.value)} inputMode="numeric" />
            </div>
            <div className="field">
              <label className="label">Kart üzerindeki isim</label>
              <input className="input" value={holder} onChange={(e) => setHolder(e.target.value)} />
            </div>
            <div className="row" style={{ gap: 10 }}>
              <div className="field" style={{ flex: 1 }}>
                <label className="label">Son kullanım</label>
                <input className="input tnum" value={exp} onChange={(e) => setExp(e.target.value)} />
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label className="label">CVC</label>
                <input className="input tnum" value={cvc} onChange={(e) => setCvc(e.target.value)} />
              </div>
            </div>
            <div className="pm-secure" style={{ fontSize: 11.5 }}>
              <Icon name="lock" size={14} />
              Kart bilgilerin saklanmaz; iyzico güvenli kasasında işlenir.
            </div>
          </div>
        ) : (
          <div className="modal-body" style={{ padding: 28, textAlign: "center", gap: 12, alignItems: "center" }}>
            <span className="stat-icon tone-success" style={{ width: 56, height: 56 }}><Icon name="checkCircle" size={28} /></span>
            <h3 style={{ fontSize: 18, fontWeight: 800 }}>Harika! {p.name} aktif</h3>
            <p className="muted" style={{ fontSize: 13 }}>
              {p.seats >= 999 ? "Sınırsız" : p.seats} öğrenci kapasitesi ve tüm dahil modüller hesabına tanımlandı.
            </p>
          </div>
        )}

        <div className="modal-foot">
          {step === "done" ? (
            <button type="button" className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={onDone}>Lisansıma git</button>
          ) : (
            <>
              <div><div className="muted" style={{ fontSize: 11 }}>Toplam</div><b className="tnum" style={{ fontSize: 16 }}>{tl(amount)}</b></div>
              <button type="button" className="btn btn-primary" style={{ marginLeft: "auto" }} disabled={step === "processing"} onClick={() => void pay()}>
                {step === "processing" ? "İşleniyor…" : <>{tl(amount)} Öde<Icon name="lock" size={15} /></>}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function CoachLicensePanel() {
  const { snapshot, mutate, toast } = useAdminStore();
  const [checkout, setCheckout] = useState<{ planId: CoachPlanId; cycle: BillingCycle } | null>(null);
  const [tab, setTab] = useState<"license" | "plans">("license");
  const [planCycle, setPlanCycle] = useState<BillingCycle>("monthly");
  const [confirmCancel, setConfirmCancel] = useState(false);

  if (!snapshot) return <p className="muted">Yükleniyor…</p>;

  const soloId = resolveSoloCoachId(snapshot.myCoachId, snapshot.coaches);
  const c = soloId ? snapshot.coaches.find((x) => x.id === soloId) : undefined;

  if (!c) {
    return (
      <div className="stack rise">
        <UkPageHead title="Lisansım" sub="Bireysel koç aboneliğini yönet" />
        <div className="alert-strip">
          <span className="as-ic"><Icon name="building" size={18} /></span>
          <div style={{ flex: 1 }}>
            <b style={{ fontSize: 13.5 }}>Kurum koçu hesabı</b>
            <div className="muted" style={{ fontSize: 12.5 }}>Lisansın kurum yöneticin tarafından yönetiliyor. Bireysel plan için solo koç hesabı kullanın.</div>
          </div>
        </div>
      </div>
    );
  }

  const p = coachPlanById(c.planId);
  const dl = daysLeft(c.renewsAt);
  const unl = c.seats.total >= 999;
  const tone = c.status === "overdue" || c.status === "suspended" ? "danger" : c.status === "trial" || dl <= 14 ? "warn" : "";

  return (
    <div className="stack rise" data-testid="coach-license-panel">
      <UkPageHead
        title="Lisansım"
        sub="Bireysel koç aboneliğini yönet"
        actions={
          <Link href="/coach/invoices" className="btn btn-light">
            <Icon name="receipt" size={16} />
            Faturalar
          </Link>
        }
      />

      {(c.status === "trial" || dl <= 14 || c.status === "overdue") ? (
        <div className={`alert-strip ${c.status === "overdue" ? "danger" : "warn"}`}>
          <span className="as-ic"><Icon name={c.status === "overdue" ? "alert" : "clock"} size={18} /></span>
          <div style={{ flex: 1 }}>
            <b style={{ fontSize: 13.5 }}>
              {c.status === "trial" ? "Deneme sürümündesin" : c.status === "overdue" ? "Ödemen gecikti" : "Lisansın yakında yenilenecek"}
            </b>
            <div className="muted" style={{ fontSize: 12.5 }}>
              {dl < 0 ? `${-dl} gün önce doldu.` : `${dl} gün kaldı.`} {c.autoRenew ? "Otomatik yenileme açık." : "Otomatik yenileme kapalı."}
            </div>
          </div>
          <button type="button" className="btn btn-sm btn-primary" onClick={() => setTab("plans")}>
            {c.status === "trial" ? "Planı etkinleştir" : "Şimdi yenile"}
          </button>
        </div>
      ) : null}

      <div className="modal-sub" style={{ gap: 8, marginBottom: 4 }}>
        <button type="button" className={`seg-tab${tab === "license" ? " on" : ""}`} onClick={() => setTab("license")}>Lisansım</button>
        <button type="button" className={`seg-tab${tab === "plans" ? " on" : ""}`} onClick={() => { setTab("plans"); setPlanCycle(c.cycle); }}>Planlar & Yükselt</button>
      </div>

      {tab === "license" ? (
        <>
          <div className={`lic-hero ${tone}`}>
            <div className="lh-glow" />
            <div className="lh-top">
              <div>
                <div className="row" style={{ gap: 10, marginBottom: 4 }}>
                  <span className="lh-badge">Bireysel koç</span>
                  <span className="lh-badge">{p.name}</span>
                  <span className="lh-badge">{c.cycle === "annual" ? "Yıllık" : "Aylık"}</span>
                </div>
                <h2>{c.name}</h2>
                <p className="lh-sub">{c.city} · {tl(c.feeMonthly)}/ay {c.cycle === "annual" ? "(yıllık ödenmiş)" : ""}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="tnum" style={{ fontSize: 30, fontWeight: 800, lineHeight: 1 }}>{dl < 0 ? 0 : dl}</div>
                <div style={{ fontSize: 11.5, opacity: 0.85, fontWeight: 600 }}>gün kaldı</div>
              </div>
            </div>
            <div className="lh-stats">
              <div className="lh-stat">
                <div className="v tnum">{c.seats.used}<span style={{ opacity: 0.6, fontSize: 16 }}>/{unl ? "∞" : c.seats.total}</span></div>
                <div className="l">Öğrenci</div>
              </div>
              <div className="lh-stat"><div className="v">{fmtShort(c.renewsAt)}</div><div className="l">Yenileme</div></div>
              <div className="lh-stat"><div className="v tnum">★ {c.rating || "—"}</div><div className="l">Puan</div></div>
            </div>
          </div>

          <div className="grid col-main">
            <div className="stack">
              <UkSection title="Plan & yenileme">
                <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <label className="renew-toggle" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <div>
                      <b style={{ fontSize: 13.5 }}>Otomatik yenileme</b>
                      <div className="muted" style={{ fontSize: 12 }}>
                        {c.cycle === "annual" ? "Yıl" : "Ay"} sonunda {tl(c.feeMonthly * (c.cycle === "annual" ? 12 : 1))} tahsil edilir
                      </div>
                    </div>
                    <button
                      type="button"
                      className={`switch${c.autoRenew ? " on" : ""}`}
                      onClick={() => void mutate({ kind: "setCoachAutoRenew", coachId: c.id, enabled: !c.autoRenew }).then(() => toast(`Otomatik yenileme ${c.autoRenew ? "kapatıldı" : "açıldı"}`))}
                    >
                      <span />
                    </button>
                  </label>
                  <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
                    <button type="button" className="btn btn-primary" onClick={() => setTab("plans")}><Icon name="arrowUp" size={16} />Planı yükselt</button>
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={() => void mutate({ kind: "buyCoachPlan", coachId: c.id, planId: c.planId, cycle: c.cycle }).then(() => toast("Lisans yenilendi", { icon: "ki-arrows-circle" }))}
                    >
                      <Icon name="refresh" size={16} />Şimdi yenile
                    </button>
                    <button type="button" className="btn btn-ghost-danger" style={{ marginLeft: "auto" }} onClick={() => setConfirmCancel(true)}>İptal et</button>
                  </div>
                </div>
              </UkSection>
              <UkSection title="Kapasite kullanımı">
                <div className="card-body"><Meter icon="cap" label="Öğrenci kapasitesi" used={c.seats.used} total={c.seats.total} unlimited={unl} /></div>
              </UkSection>
              <UkSection title="Dahil modüller">
                <div className="card-body"><ModuleGrid modules={c.modules} readOnly /></div>
              </UkSection>
            </div>
            <div className="stack">
              <UkSection title="Hızlı bakış">
                <div className="card-body" style={{ padding: 0 }}>
                  <div className="kpi-row" style={{ padding: "13px 18px" }}>
                    <span className="muted" style={{ fontSize: 12.5 }}>Plan</span>
                    <span className="row" style={{ gap: 7 }}>
                      <span className="plan-dot" style={{ background: p.color }} />
                      <b style={{ fontSize: 13 }}>{p.name}</b>
                    </span>
                  </div>
                  <div className="kpi-row" style={{ padding: "13px 18px" }}>
                    <span className="muted" style={{ fontSize: 12.5 }}>Durum</span>
                    <StatusBadge status={c.status} sm />
                  </div>
                  <div className="kpi-row" style={{ padding: "13px 18px" }}>
                    <span className="muted" style={{ fontSize: 12.5 }}>Aylık ücret</span>
                    <b className="tnum" style={{ fontSize: 13 }}>{tl(c.feeMonthly)}</b>
                  </div>
                  <div className="kpi-row" style={{ padding: "13px 18px" }}>
                    <span className="muted" style={{ fontSize: 12.5 }}>Başlangıç</span>
                    <b className="tnum" style={{ fontSize: 13 }}>{fmtShort(c.startedAt)}</b>
                  </div>
                </div>
              </UkSection>
              <UkSection
                title="Faturalar"
                action={
                  <Link href="/coach/invoices" className="link-btn">Tümü</Link>
                }
              >
                <div className="card-body" style={{ padding: 0 }}>
                  {c.invoices.slice(0, 3).map((inv) => {
                    const st = inv.status === "paid" ? "success" : inv.status === "failed" ? "danger" : "warning";
                    const stLabel = inv.status === "paid" ? "Ödendi" : inv.status === "failed" ? "Başarısız" : "Bekliyor";
                    return (
                      <div key={inv.id} className="kpi-row" style={{ padding: "12px 18px" }}>
                        <div>
                          <b className="tnum" style={{ fontSize: 12.5 }}>{inv.id}</b>
                          <div className="muted tnum" style={{ fontSize: 11 }}>{fmtShort(inv.date)}</div>
                        </div>
                        <div className="row" style={{ gap: 8 }}>
                          <span className="tnum" style={{ fontWeight: 700, fontSize: 13 }}>{tl(inv.amount)}</span>
                          <span className={`badge badge-${st}`} style={{ height: 20, fontSize: 10 }}>{stLabel}</span>
                        </div>
                      </div>
                    );
                  })}
                  {c.invoices.length === 0 ? <p className="muted card-pad" style={{ fontSize: 12.5 }}>Henüz fatura yok.</p> : null}
                </div>
              </UkSection>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="pricing-toggle-wrap" style={{ display: "flex", justifyContent: "center" }}>
            <div className="seg pricing-toggle">
              <button type="button" className={planCycle === "monthly" ? "on" : ""} onClick={() => setPlanCycle("monthly")}>Aylık</button>
              <button type="button" className={planCycle === "annual" ? "on" : ""} onClick={() => setPlanCycle("annual")}>
                Yıllık <span className="save-pill">2 ay bedava</span>
              </button>
            </div>
          </div>
          <UkSection title="Plan seç" sub="Yükseltme anında kapasite ve modüller güncellenir">
            <div className="card-body">
              <div className="grid g-3">
                {COACH_PLANS.map((pl) => {
                  const isCurrent = pl.id === c.planId && c.status !== "canceled";
                  const price = planCycle === "annual" ? Math.round(pl.annual / 12) : pl.monthly;
                  return (
                    <div key={pl.id} className={`plan-card${pl.popular ? " popular" : ""}${isCurrent ? " sel" : ""}`}>
                      {pl.popular ? <span className="plan-flag">En çok tercih edilen</span> : null}
                      <div className="plan-top">
                        <span className="plan-dot" style={{ background: pl.color }} />
                        <h3>{pl.name}</h3>
                        <p className="muted">{pl.tagline}</p>
                      </div>
                      <div className="plan-price">
                        <span className="tnum amount">{tl(price)}</span>
                        <span className="per muted">
                          /ay
                          {planCycle === "annual" ? <span className="tnum"> · yıllık {tl(pl.annual)}</span> : null}
                        </span>
                      </div>
                      {planCycle === "annual" ? (
                        <div className="plan-saved"><Icon name="check" size={13} />Aylığa göre {tl(pl.monthly * 12 - pl.annual)} tasarruf</div>
                      ) : (
                        <div className="plan-saved muted" style={{ background: "transparent" }}>İstediğin zaman yıllığa geç</div>
                      )}
                      <ul className="plan-feat">
                        {pl.features.map((f) => (
                          <li key={f}><Icon name="check" size={15} style={{ color: pl.color }} />{f}</li>
                        ))}
                      </ul>
                      {isCurrent ? (
                        <button type="button" className="btn btn-light" disabled style={{ width: "100%", opacity: 0.7 }}>
                          <Icon name="check" size={16} />Mevcut planın
                        </button>
                      ) : (
                        <button
                          type="button"
                          className={`btn ${pl.popular ? "btn-primary" : "btn-outline"}`}
                          style={{ width: "100%" }}
                          onClick={() => setCheckout({ planId: pl.id, cycle: planCycle })}
                        >
                          {pl.name} Seç<Icon name="chevronRight" size={16} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </UkSection>
          <div className="pricing-note">
            <Icon name="shield" size={16} />
            Tüm planlar KVKK uyumlu, 3D Secure korumalı. İlk 7 gün içinde iptal edersen ücret iadesi yapılır.
          </div>
        </>
      )}

      {checkout ? (
        <CoachCheckoutDialog
          coach={c}
          planId={checkout.planId}
          cycle={checkout.cycle}
          onClose={() => setCheckout(null)}
          onDone={() => { setCheckout(null); setTab("license"); }}
        />
      ) : null}

      <ConfirmModal
        open={confirmCancel}
        title="Aboneliği iptal et?"
        tone="danger"
        body={`${fmtShort(c.renewsAt)} tarihine kadar erişimin sürer. Sonrasında hesabın ücretsiz moda döner ve öğrenci kapasiten kısıtlanır.`}
        confirmLabel="İptali onayla"
        onConfirm={() => {
          void mutate({ kind: "cancelCoach", coachId: c.id }).then(() => {
            toast("Abonelik iptal edildi", { icon: "ki-information-2", tone: "danger" });
            setConfirmCancel(false);
          });
        }}
        onClose={() => setConfirmCancel(false)}
      />
    </div>
  );
}
