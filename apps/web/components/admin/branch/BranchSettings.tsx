// Kurum — Ayarlar. apps/web/components/admin/branch/BranchSettings.tsx
// Prototip kaynağı: admin/kurum2.jsx (KurumSettings).
"use client";

import { useState } from "react";

import { Icon, OrgLogo } from "@/components/admin/AdminKit";
import { useAdminStore } from "@/components/admin/AdminStore";
import { getActiveOrg } from "@/components/admin/selectors";
import { OrgSwitcher } from "./OrgSwitcher";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import { orgPlanById } from "@/lib/admin/pricing";

const TONES = ["#5b6cff", "#10b981", "#f59e0b", "#0ea5e9", "#8b5cf6", "#ef4444", "#ec4899", "#14b8a6"];

export function BranchSettings() {
  const { snapshot, activeOrgId, mutate, toast } = useAdminStore();
  const o = snapshot ? getActiveOrg(snapshot, activeOrgId) : null;
  const [name, setName] = useState(o?.name ?? "");
  const [email, setEmail] = useState(o?.owner.email ?? "");
  const [phone, setPhone] = useState(o?.owner.phone ?? "");
  const [tone, setTone] = useState(o?.tone ?? TONES[0]);

  if (!snapshot || !o) return <div className="card card-pad muted">Yükleniyor…</div>;

  return (
    <div className="stack rise">
      <UkPageHead title="Ayarlar" sub="Kurum profili, marka ve faturalama bilgileri" actions={<OrgSwitcher />} />
      <div className="grid col-main">
        <div className="stack">
          <UkSection title="Kurum profili">
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="row" style={{ gap: 14 }}>
                <OrgLogo name={name} tone={tone} size={56} />
                <div style={{ flex: 1 }}>
                  <label className="muted" style={{ fontSize: 11.5, fontWeight: 600 }}>Kurum adı</label>
                  <input className="input" value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%" }} />
                </div>
              </div>
              <div className="grid g-2" style={{ gap: 12 }}>
                <div>
                  <label className="muted" style={{ fontSize: 11.5, fontWeight: 600 }}>Yetkili e-posta</label>
                  <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%" }} />
                </div>
                <div>
                  <label className="muted" style={{ fontSize: 11.5, fontWeight: 600 }}>Telefon</label>
                  <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: "100%" }} />
                </div>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                style={{ alignSelf: "flex-start" }}
                onClick={async () => { await mutate({ kind: "updateOrgProfile", orgId: o.id, name, tone, email, phone }); toast("Profil güncellendi", { icon: "ki-check-circle" }); }}
              >
                <Icon name="check" size={16} />Kaydet
              </button>
            </div>
          </UkSection>
          <UkSection title="Marka rengi" sub="Panel ve raporlarda kullanılır">
            <div className="card-body">
              <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
                {TONES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    style={{ width: 40, height: 40, borderRadius: 11, background: t, border: tone === t ? "3px solid var(--text)" : "3px solid transparent", cursor: "pointer" }}
                    aria-label={t}
                  >
                    {tone === t ? <Icon name="check" size={18} style={{ color: "#fff" }} /> : null}
                  </button>
                ))}
              </div>
            </div>
          </UkSection>
        </div>
        <div className="stack">
          <UkSection title="Faturalama bilgileri">
            <div className="card-body" style={{ padding: 0 }}>
              {[
                ["Plan", orgPlanById(o.planId).name],
                ["Vergi no", "123 456 7890"],
                ["Fatura adresi", o.city],
                ["Ödeme yöntemi", "Havale / EFT"],
              ].map(([k, v]) => (
                <div key={k} className="kpi-row" style={{ padding: "13px 18px" }}>
                  <span className="muted" style={{ fontSize: 12.5 }}>{k}</span>
                  <b style={{ fontSize: 13 }}>{v}</b>
                </div>
              ))}
            </div>
          </UkSection>
          <UkSection title="Tehlikeli bölge">
            <div className="card-body" style={{ gap: 10, display: "flex", flexDirection: "column" }}>
              <button type="button" className="btn btn-ghost-danger" style={{ justifyContent: "flex-start" }} onClick={() => toast("Veri dışa aktarma başlatıldı", { icon: "ki-cloud-download" })}>
                <Icon name="download" size={16} />Tüm kurum verisini dışa aktar
              </button>
              <button type="button" className="btn btn-ghost-danger" style={{ justifyContent: "flex-start" }} onClick={() => toast("Bu işlem için süper admin onayı gerekir", { icon: "ki-information-2", tone: "danger" })}>
                <Icon name="alert" size={16} />Lisansı iptal et
              </button>
            </div>
          </UkSection>
        </div>
      </div>
    </div>
  );
}
