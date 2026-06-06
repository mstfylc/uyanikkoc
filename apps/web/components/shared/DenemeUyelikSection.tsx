"use client";

import { useCallback, useEffect, useState } from "react";

import { KiIcon } from "@/components/design/KiIcon";
import { UkBadge } from "@/components/design/UkBadge";
import { UkSection } from "@/components/design/UkSection";
import { DENEME_PLANS, denemePlanById, type DenemeMembershipId } from "@/lib/design/deneme-plans";
import { formatTRY } from "@uyanik/shared";

type Props = {
  billingBasePath: string;
  onToast?: (message: string) => void;
};

export function DenemeUyelikSection({ billingBasePath, onToast }: Props) {
  const [membership, setMembership] = useState<DenemeMembershipId | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/student/deneme-membership", { credentials: "same-origin" });
    if (res.ok) {
      const data = (await res.json()) as { membership: DenemeMembershipId | null };
      setMembership(data.membership);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function choose(planId: DenemeMembershipId) {
    setSaving(true);
    const res = await fetch("/api/student/deneme-membership", {
      method: "PUT",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    });
    setSaving(false);
    if (res.ok) {
      const data = (await res.json()) as { membership: DenemeMembershipId | null };
      setMembership(data.membership);
      onToast?.(denemePlanById(planId)?.name + " aktif edildi");
    }
  }

  async function cancelMembership() {
    setSaving(true);
    await fetch("/api/student/deneme-membership", {
      method: "PUT",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId: null }),
    });
    setSaving(false);
    setMembership(null);
    onToast?.("Deneme üyeliğin iptal edildi");
  }

  const curPlan = denemePlanById(membership);

  return (
    <UkSection
      title="Deneme Üyeliği"
      sub="Deneme sınavlarına erişim için paket seç"
      action={curPlan ? <UkBadge tone="success">{curPlan.name}</UkBadge> : <UkBadge tone="muted">Üyelik yok</UkBadge>}
    >
      <div className="card-body">
        {loading ? (
          <p className="muted" style={{ fontSize: 13 }}>Yükleniyor…</p>
        ) : (
          <>
            <div className="grid g-2" style={{ gap: 14 }}>
              {DENEME_PLANS.map((p) => {
                const isCur = membership === p.id;
                return (
                  <div key={p.id} className={`plan-card${p.popular ? " popular" : ""}`} style={{ padding: 18 }}>
                    {p.popular ? <span className="plan-flag">En çok tercih edilen</span> : null}
                    <div className="plan-top">
                      <span className="plan-dot" style={{ background: p.color }} />
                      <h3>{p.name}</h3>
                      <p className="muted">{p.tagline}</p>
                    </div>
                    <div className="plan-price">
                      <span className="tnum amount">{formatTRY(p.price)}</span>
                      <span className="per muted">/ay</span>
                    </div>
                    <ul className="plan-feat">
                      {p.perks.map((f) => (
                        <li key={f}>
                          <KiIcon name="ki-check" size={15} style={{ color: p.color }} />
                          {f}
                        </li>
                      ))}
                    </ul>
                    {p.note ? (
                      <div className="notice" style={{ background: "var(--info-soft)", padding: "9px 11px" }}>
                        <KiIcon name="ki-notepad-edit" size={15} style={{ color: "var(--info)", flexShrink: 0 }} />
                        <span style={{ fontSize: 11.5 }}>{p.note}</span>
                      </div>
                    ) : null}
                    {isCur ? (
                      <button type="button" className="btn btn-light" disabled style={{ width: "100%", opacity: 0.75 }}>
                        <KiIcon name="ki-check" size={16} />
                        Mevcut üyeliğin
                      </button>
                    ) : (
                      <button
                        type="button"
                        className={`btn ${p.popular ? "btn-primary" : "btn-outline"}`}
                        style={{ width: "100%" }}
                        disabled={saving}
                        onClick={() => void choose(p.id)}
                      >
                        {p.name} Seç
                        <KiIcon name="ki-right" size={16} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            {membership ? (
              <button
                type="button"
                className="btn btn-ghost-danger btn-sm"
                style={{ marginTop: 12 }}
                disabled={saving}
                onClick={() => void cancelMembership()}
              >
                Üyeliği iptal et
              </button>
            ) : null}
            <p className="muted" style={{ fontSize: 12, marginTop: 12 }}>
              Deneme kayıtları için{" "}
              <a href={billingBasePath.replace("/billing", "/exams")} className="link-btn">
                Denemeler
              </a>{" "}
              sayfasını kullanın.
            </p>
          </>
        )}
      </div>
    </UkSection>
  );
}
