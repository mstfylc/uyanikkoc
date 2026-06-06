// Kurum — Ayarlar (zip-16 v2). apps/web/components/admin/branch/BranchSettings.tsx
"use client";

import { useEffect, useState } from "react";

import { ConfirmModal, Icon, OrgLogo } from "@/components/admin/AdminKit";
import { useAdminStore } from "@/components/admin/AdminStore";
import { getActiveOrg } from "@/components/admin/selectors";
import { OrgSwitcher } from "./OrgSwitcher";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import { orgPlanById } from "@/lib/admin/pricing";
import type { OrgNotificationPrefs } from "@/lib/admin/types";

const TONES = ["#5b6cff", "#10b981", "#f59e0b", "#0ea5e9", "#8b5cf6", "#ef4444", "#ec4899", "#14b8a6"];

const NOTIF_ROWS: { key: keyof OrgNotificationPrefs; label: string; desc: string }[] = [
  { key: "licenseReminders", label: "Lisans hatırlatmaları", desc: "Yenileme ve deneme süresi uyarıları" },
  { key: "paymentAlerts", label: "Ödeme bildirimleri", desc: "Başarısız tahsilat ve fatura uyarıları" },
  { key: "weeklyReport", label: "Haftalık özet rapor", desc: "E-posta ile haftalık performans özeti" },
  { key: "productUpdates", label: "Ürün güncellemeleri", desc: "Yeni modül ve özellik duyuruları" },
];

export function BranchSettings() {
  const { snapshot, activeOrgId, mutate, toast } = useAdminStore();
  const o = snapshot ? getActiveOrg(snapshot, activeOrgId) : null;
  const [name, setName] = useState(o?.name ?? "");
  const [email, setEmail] = useState(o?.owner.email ?? "");
  const [phone, setPhone] = useState(o?.owner.phone ?? "");
  const [tone, setTone] = useState(o?.tone ?? TONES[0]);
  const [taxId, setTaxId] = useState(o?.billing.taxId ?? "");
  const [taxOffice, setTaxOffice] = useState(o?.billing.taxOffice ?? "");
  const [billingAddress, setBillingAddress] = useState(o?.billing.billingAddress ?? "");
  const [paymentMethod, setPaymentMethod] = useState(o?.billing.paymentMethod ?? "");
  const [prefs, setPrefs] = useState<OrgNotificationPrefs>(o?.notifications ?? {
    licenseReminders: true,
    paymentAlerts: true,
    weeklyReport: false,
    productUpdates: true,
  });
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [exportNote, setExportNote] = useState("");

  useEffect(() => {
    if (!o) return;
    setName(o.name);
    setEmail(o.owner.email);
    setPhone(o.owner.phone);
    setTone(o.tone);
    setTaxId(o.billing.taxId);
    setTaxOffice(o.billing.taxOffice);
    setBillingAddress(o.billing.billingAddress);
    setPaymentMethod(o.billing.paymentMethod);
    setPrefs(o.notifications);
    setExportNote("");
  }, [o?.id, activeOrgId]);

  if (!snapshot || !o) return <div className="card card-pad muted">Yükleniyor…</div>;

  const org = o;

  async function saveProfile() {
    await mutate({ kind: "updateOrgProfile", orgId: org.id, name, tone, email, phone });
    toast("Profil güncellendi", { icon: "ki-check-circle" });
  }

  async function saveBilling() {
    await mutate({
      kind: "updateOrgBilling",
      orgId: org.id,
      taxId,
      taxOffice,
      billingAddress,
      paymentMethod,
    });
    toast("Faturalama bilgileri kaydedildi", { icon: "ki-check-circle" });
  }

  async function saveNotifications() {
    await mutate({ kind: "updateOrgNotifications", orgId: org.id, prefs });
    toast("Bildirim tercihleri güncellendi", { icon: "ki-check-circle" });
  }

  return (
    <div className="stack rise">
      <UkPageHead
        title="Ayarlar"
        sub="Kurum profili, marka ve faturalama bilgileri"
        actions={
          <div className="row" style={{ gap: 9 }}>
            <OrgSwitcher />
            <button type="button" className="btn btn-primary" onClick={() => void saveProfile()}>
              <Icon name="check" size={16} />Kaydet
            </button>
          </div>
        }
      />
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
          <UkSection title="Faturalama bilgileri" action={<button type="button" className="link-btn" onClick={() => void saveBilling()}>Kaydet</button>}>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="kpi-row" style={{ padding: "10px 0" }}><span className="muted">Plan</span><b>{orgPlanById(o.planId).name}</b></div>
              <div>
                <label className="muted" style={{ fontSize: 11.5, fontWeight: 600 }}>Vergi no</label>
                <input className="input tnum" value={taxId} onChange={(e) => setTaxId(e.target.value)} style={{ width: "100%" }} />
              </div>
              <div>
                <label className="muted" style={{ fontSize: 11.5, fontWeight: 600 }}>Vergi dairesi</label>
                <input className="input" value={taxOffice} onChange={(e) => setTaxOffice(e.target.value)} style={{ width: "100%" }} />
              </div>
              <div>
                <label className="muted" style={{ fontSize: 11.5, fontWeight: 600 }}>Fatura adresi</label>
                <input className="input" value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)} style={{ width: "100%" }} />
              </div>
              <div>
                <label className="muted" style={{ fontSize: 11.5, fontWeight: 600 }}>Ödeme yöntemi</label>
                <input className="input" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={{ width: "100%" }} />
              </div>
            </div>
          </UkSection>
        </div>
        <div className="stack">
          <UkSection title="Bildirim tercihleri" action={<button type="button" className="link-btn" onClick={() => void saveNotifications()}>Kaydet</button>}>
            <div className="card-body" style={{ padding: 0 }}>
              {NOTIF_ROWS.map((row) => (
                <div key={row.key} className="kpi-row" style={{ padding: "13px 18px", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <b style={{ fontSize: 13 }}>{row.label}</b>
                    <div className="muted" style={{ fontSize: 12 }}>{row.desc}</div>
                  </div>
                  <button
                    type="button"
                    className={`switch${prefs[row.key] ? " on" : ""}`}
                    onClick={() => setPrefs((p) => ({ ...p, [row.key]: !p[row.key] }))}
                    aria-label={row.label}
                  >
                    <span />
                  </button>
                </div>
              ))}
            </div>
          </UkSection>
          <UkSection title="Tehlikeli bölge">
            <div className="card-body" style={{ gap: 10, display: "flex", flexDirection: "column" }}>
              <div className="alert-strip" style={{ background: "var(--surface-2)" }}>
                <span className="as-ic" style={{ background: "var(--surface-3)", color: "var(--muted)" }}><Icon name="lock" size={16} /></span>
                <div style={{ flex: 1 }}>
                  <b style={{ fontSize: 13 }}>Tüm kurum verisini dışa aktar</b>
                  <div className="muted" style={{ fontSize: 12 }}>Bu işlem yalnızca süper admin tarafından yapılabilir. Talep için destek ekibine yazın.</div>
                </div>
                <button type="button" className="btn btn-sm btn-light" disabled style={{ opacity: 0.6, cursor: "not-allowed" }}>
                  <Icon name="lock" size={14} />Kapalı
                </button>
              </div>
              <textarea
                className="input"
                rows={2}
                placeholder="Talep notu (isteğe bağlı)"
                value={exportNote}
                onChange={(e) => setExportNote(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-light"
                style={{ justifyContent: "flex-start" }}
                onClick={async () => {
                  await mutate({ kind: "requestDataExport", orgId: o.id, note: exportNote.trim() || undefined });
                  toast("Veri dışa aktarma talebi süper admine iletildi", { icon: "ki-send" });
                  setExportNote("");
                }}
              >
                <Icon name="send" size={16} />Süper adminden veri talep et
              </button>
              <button type="button" className="btn btn-ghost-danger" style={{ justifyContent: "flex-start" }} onClick={() => setConfirmCancel(true)}>
                <Icon name="alert" size={16} />Lisansı iptal et
              </button>
            </div>
          </UkSection>
        </div>
      </div>

      <ConfirmModal
        open={confirmCancel}
        title="Lisansı iptal et?"
        tone="danger"
        body="Bu işlem süper admin onayı gerektirir. Onaylandığında kurum erişimi dönem sonunda kapanır."
        confirmLabel="İptal talebi gönder"
        onConfirm={async () => {
          await mutate({ kind: "cancelOrgSubscription", orgId: o.id });
          toast("İptal talebi alındı", { icon: "ki-information-2", tone: "warning" });
          setConfirmCancel(false);
        }}
        onClose={() => setConfirmCancel(false)}
      />
    </div>
  );
}
