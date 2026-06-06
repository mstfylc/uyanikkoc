// Süper Admin — Bireysel koç profili (drill-in). apps/web/components/admin/super/SuperCoachProfile.tsx
// Yeni ekran: lisanslı abone profili + not + ücretsiz demo + detaylı yenileme + faturalar.
"use client";

import Link from "next/link";

import { Icon, Meter, StatCard, StatusBadge } from "@/components/admin/AdminKit";
import { useAdminStore } from "@/components/admin/AdminStore";
import { canEdit } from "@/components/admin/selectors";
import { SubscriberNotes } from "./SubscriberNotes";
import { UkAvatar } from "@/components/design/UkAvatar";
import { UkSection } from "@/components/design/UkSection";
import { fmtShort, tl } from "@/lib/admin/format";
import { coachPlanById, moduleName } from "@/lib/admin/pricing";
import type { ModuleKey } from "@/lib/admin/types";

export function SuperCoachProfile({ coachId }: { coachId: string }) {
  const { snapshot, mutate, toast } = useAdminStore();
  if (!snapshot) return <div className="card card-pad muted">Yükleniyor…</div>;
  const c = snapshot.coaches.find((x) => x.id === coachId);
  if (!c) {
    return (
      <div className="stack rise">
        <Link href="/yonetim/coaches" className="link-btn">
          <Icon name="chevronRight" size={15} style={{ transform: "rotate(180deg)" }} />
          Koçlara dön
        </Link>
        <div className="empty-state">
          <Icon name="users" size={26} style={{ color: "var(--faint)" }} />
          <div style={{ fontWeight: 700 }}>Koç bulunamadı</div>
        </div>
      </div>
    );
  }
  const editable = canEdit(snapshot.viewerAccess);
  const cp = coachPlanById(c.planId);
  const unl = c.seats.total >= 999;
  const activeModules = (Object.keys(c.modules) as ModuleKey[]).filter((k) => c.modules[k]);

  return (
    <div className="stack rise">
      <Link href="/yonetim/coaches" className="link-btn" style={{ alignSelf: "flex-start" }}>
        <Icon name="chevronRight" size={15} style={{ transform: "rotate(180deg)" }} />
        Koçlara dön
      </Link>

      <div className="row" style={{ gap: 15, flexWrap: "wrap" }}>
        <UkAvatar name={c.name} size={56} />
        <div style={{ flex: 1, minWidth: 200 }}>
          <div className="row" style={{ gap: 9 }}>
            <h1 style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-.02em" }}>{c.name}</h1>
            <StatusBadge status={c.status} />
            {c.rating ? <span className="badge badge-warning" style={{ height: 22 }}><Icon name="star" size={12} fill />{c.rating}</span> : null}
          </div>
          <p className="muted" style={{ fontSize: 13 }}>
            Bireysel koç · {c.city} · {cp.name} planı · {c.email}
          </p>
        </div>
        {editable ? (
          <div className="row" style={{ gap: 9 }}>
            {c.status === "suspended" || c.status === "canceled" ? (
              <button type="button" className="btn btn-primary" onClick={async () => { await mutate({ kind: "activateCoach", coachId: c.id }); toast(c.name + " aktifleştirildi", { icon: "ki-check-circle" }); }}>
                <Icon name="refresh" size={16} />Aktifleştir
              </button>
            ) : (
              <button type="button" className="btn btn-light" onClick={async () => { await mutate({ kind: "suspendCoach", coachId: c.id }); toast(c.name + " donduruldu", { icon: "ki-information-2", tone: "danger" }); }}>
                <Icon name="alert" size={16} />Dondur
              </button>
            )}
          </div>
        ) : null}
      </div>

      <div className="grid g-4">
        <StatCard icon="cap" tone="primary" value={`${c.seats.used}${unl ? "" : "/" + c.seats.total}`} label="Öğrenci" />
        <StatCard icon="banknote" tone="success" value={tl(c.feeMonthly)} label="Aylık ücret" />
        <StatCard icon="star" tone="warning" value={c.rating || "—"} label="Ortalama puan" />
        <StatCard icon="refresh" tone="info" value={c.autoRenew ? "Açık" : "Kapalı"} label="Otomatik yenileme" />
      </div>

      <div className="grid col-main">
        <div className="stack">
          <UkSection title="Kapasite & plan">
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Meter icon="cap" label="Öğrenci koltuğu" used={c.seats.used} total={c.seats.total} unlimited={unl} />
              <div className="between"><span className="muted" style={{ fontSize: 12.5 }}>Plan</span><span className="row" style={{ gap: 7 }}><span className="plan-dot" style={{ background: cp.color }} /><b style={{ fontSize: 13.5 }}>{cp.name}</b></span></div>
              <div className="between"><span className="muted" style={{ fontSize: 12.5 }}>Faturalama</span><b style={{ fontSize: 13.5 }}>{c.cycle === "annual" ? "Yıllık" : "Aylık"}</b></div>
              <div className="between"><span className="muted" style={{ fontSize: 12.5 }}>Sonraki yenileme</span><b className="tnum" style={{ fontSize: 13.5 }}>{fmtShort(c.renewsAt)}</b></div>
            </div>
          </UkSection>

          <UkSection title="Faturalar" sub={`${c.invoices.length} kayıt`}>
            <div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
              {c.invoices.length === 0 ? (
                <p className="muted" style={{ fontSize: 12.5, padding: "16px 18px" }}>Henüz fatura yok (deneme sürümü).</p>
              ) : (
                <table className="tbl" style={{ minWidth: 480 }}>
                  <thead>
                    <tr><th>Fatura</th><th>Tarih</th><th style={{ textAlign: "right" }}>Tutar</th><th style={{ textAlign: "center" }}>Durum</th></tr>
                  </thead>
                  <tbody>
                    {c.invoices.map((inv) => (
                      <tr key={inv.id}>
                        <td><span className="tnum" style={{ fontWeight: 700, fontSize: 12.5 }}>{inv.id}</span></td>
                        <td><span className="muted tnum" style={{ fontSize: 12.5 }}>{fmtShort(inv.date)}</span></td>
                        <td style={{ textAlign: "right" }}><span className="tnum" style={{ fontWeight: 700 }}>{tl(inv.amount)}</span></td>
                        <td style={{ textAlign: "center" }}>
                          <span className={`badge badge-${inv.status === "paid" ? "success" : inv.status === "failed" ? "danger" : "warning"}`} style={{ height: 22 }}>
                            {inv.status === "paid" ? "Ödendi" : inv.status === "failed" ? "Başarısız" : "Bekliyor"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </UkSection>

          <SubscriberNotes
            subjectKind="coach"
            subjectId={c.id}
            name={c.name}
            currentPlanId={c.planId}
            currentRenewsAt={c.renewsAt}
            giftedDemoUntil={c.giftedDemoUntil}
          />
        </div>

        <div className="stack">
          <UkSection title="İletişim">
            <div className="card-body" style={{ padding: 0 }}>
              {[
                ["E-posta", c.email],
                ["Telefon", c.phone],
                ["Şehir", c.city],
                ["Üyelik başlangıcı", fmtShort(c.startedAt)],
              ].map(([k, v]) => (
                <div key={k} className="kpi-row" style={{ padding: "13px 18px" }}>
                  <span className="muted" style={{ fontSize: 12.5 }}>{k}</span>
                  <b style={{ fontSize: 13 }}>{v}</b>
                </div>
              ))}
            </div>
          </UkSection>
          <UkSection title="Açık modüller">
            <div className="card-body">
              <div className="row" style={{ gap: 7, flexWrap: "wrap" }}>
                {activeModules.map((k) => (
                  <span key={k} className="badge badge-muted" style={{ height: 26 }}>
                    <Icon name="check" size={12} style={{ color: "var(--success)" }} />
                    {moduleName(k)}
                  </span>
                ))}
              </div>
            </div>
          </UkSection>
        </div>
      </div>
    </div>
  );
}
