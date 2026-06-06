// Kurum — Lisans & Kapasite. apps/web/components/admin/branch/BranchLicense.tsx
// Prototip kaynağı: admin/kurum2.jsx (KurumLicense). Yeni: detaylı yenileme dialogu.
"use client";

import { useState } from "react";

import { ConfirmModal, Icon, LicenseHero, Meter, ModuleGrid, RankBars } from "@/components/admin/AdminKit";
import { useAdminStore } from "@/components/admin/AdminStore";
import { RenewDialog } from "@/components/admin/dialogs";
import { getActiveOrg } from "@/components/admin/selectors";
import { OrgSwitcher } from "./OrgSwitcher";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import { fmtShort, tl } from "@/lib/admin/format";
import { orgPlanById } from "@/lib/admin/pricing";

export function BranchLicense() {
  const { snapshot, activeOrgId, mutate, toast } = useAdminStore();
  const [renewOpen, setRenewOpen] = useState(false);
  const [confirm, setConfirm] = useState<string | null>(null);
  if (!snapshot) return <div className="card card-pad muted">Yükleniyor…</div>;

  const o = getActiveOrg(snapshot, activeOrgId);
  const p = orgPlanById(o.planId);

  return (
    <div className="stack rise">
      <UkPageHead title="Lisans & Kapasite" sub="Planınızı, koltuk kullanımınızı ve modüllerinizi görüntüleyin" actions={<OrgSwitcher />} />
      <LicenseHero org={o} />

      <div className="grid col-main">
        <div className="stack">
          <UkSection title="Kapasite kullanımı">
            <div className="card-body" style={{ gap: 18, display: "flex", flexDirection: "column" }}>
              <Meter icon="cap" label="Öğrenci koltuğu" used={o.seats.used} total={o.seats.total} />
              <Meter icon="users" label="Koç" used={o.coaches.used} total={o.coaches.total} />
              {o.type === "franchise" ? <Meter icon="building" label="Şube" used={o.branches.length} total={p.branches} /> : null}
              {o.seats.used / o.seats.total > 0.85 ? (
                <div className="alert-strip warn">
                  <span className="as-ic"><Icon name="alert" size={18} /></span>
                  <div style={{ flex: 1 }}>
                    <b style={{ fontSize: 13 }}>Koltuk kapasiteniz doluyor</b>
                    <div className="muted" style={{ fontSize: 12 }}>Kalan {o.seats.total - o.seats.used} koltuk. Ek paket alabilirsiniz.</div>
                  </div>
                  <button type="button" className="btn btn-sm btn-primary" onClick={async () => { await mutate({ kind: "addOrgSeats", orgId: o.id, count: 25 }); toast("25 öğrenci koltuğu eklendi", { icon: "ki-plus" }); }}>+25 koltuk</button>
                </div>
              ) : null}
            </div>
          </UkSection>
          <UkSection title="Açık modüller" sub="Lisansınıza dahil özellikler — açma talebi için süper admine başvurun">
            <div className="card-body">
              <ModuleGrid modules={o.modules} readOnly />
            </div>
          </UkSection>
        </div>

        <div className="stack">
          <UkSection title="Plan & yenileme">
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              <div className="between"><span className="muted" style={{ fontSize: 12.5 }}>Mevcut plan</span><span className="row" style={{ gap: 7 }}><span className="plan-dot" style={{ background: p.color }} /><b style={{ fontSize: 13.5 }}>{p.name}</b></span></div>
              <div className="between"><span className="muted" style={{ fontSize: 12.5 }}>Faturalama</span><b style={{ fontSize: 13.5 }}>{o.cycle === "annual" ? "Yıllık" : "Aylık"}</b></div>
              <div className="between"><span className="muted" style={{ fontSize: 12.5 }}>Aylık ücret</span><b className="tnum" style={{ fontSize: 13.5 }}>{tl(o.feeMonthly)}</b></div>
              <div className="between"><span className="muted" style={{ fontSize: 12.5 }}>Sonraki yenileme</span><b className="tnum" style={{ fontSize: 13.5 }}>{fmtShort(o.renewsAt)}</b></div>
              {o.giftedDemoUntil ? (
                <div className="between"><span className="muted" style={{ fontSize: 12.5 }}>Ücretsiz demo</span><span className="badge badge-info" style={{ height: 22 }}>{fmtShort(o.giftedDemoUntil)}</span></div>
              ) : null}
              <hr className="hr" style={{ margin: "4px 0" }} />
              <button type="button" className="btn btn-primary" onClick={() => setRenewOpen(true)}><Icon name="refresh" size={16} />Lisansı yenile / uzat</button>
              <button type="button" className="btn btn-light" onClick={() => setConfirm("upgrade")}><Icon name="arrowUp" size={16} />Planı yükselt</button>
            </div>
          </UkSection>
          <UkSection title="Üst plan: Franchise">
            <div className="card-body" style={{ gap: 10, display: "flex", flexDirection: "column" }}>
              <p className="muted" style={{ fontSize: 12.5 }}>Daha fazla şube, koç ve öğrenci koltuğu + AI Koç ve Envanter modülleri.</p>
              <RankBars items={[{ l: "Öğrenci koltuğu", v: 400 }, { l: "Koç", v: 40 }, { l: "Şube", v: 8 }]} max={400} color="var(--warning)" />
            </div>
          </UkSection>
        </div>
      </div>

      {renewOpen ? (
        <RenewDialog
          subjectKind="org"
          subjectId={o.id}
          currentPlanId={o.planId}
          currentRenewsAt={o.renewsAt}
          name={o.name}
          onClose={() => setRenewOpen(false)}
        />
      ) : null}
      <ConfirmModal
        open={confirm === "upgrade"}
        title="Franchise planına yükselt?"
        tone="primary"
        body={`${o.name} için kapasite Franchise seviyesine çıkacak (400 koltuk, 40 koç, 8 şube) ve tüm premium modüller açılacak. Yeni ücret ${tl(24900)}/ay.`}
        confirmLabel="Yükselt"
        onConfirm={async () => { await mutate({ kind: "changeOrgPlan", orgId: o.id, planId: "franchise" }); toast("Franchise planına yükseltildi", { icon: "ki-check-circle" }); }}
        onClose={() => setConfirm(null)}
      />
    </div>
  );
}
