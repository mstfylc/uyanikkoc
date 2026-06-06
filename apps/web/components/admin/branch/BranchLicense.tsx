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
import { downloadText } from "@/lib/admin/csv";
import { fmtShort, tl } from "@/lib/admin/format";
import { ORG_PLANS, orgPlanById } from "@/lib/admin/pricing";

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
              <button type="button" className="btn btn-light" onClick={async () => { await mutate({ kind: "renewOrg", orgId: o.id }); toast("Lisans yenilendi", { icon: "ki-arrows-circle" }); }}><Icon name="refresh" size={16} />Şimdi yenile</button>
              <button type="button" className="btn btn-light" onClick={() => setConfirm("upgrade")}><Icon name="arrowUp" size={16} />Planı yükselt</button>
              <button type="button" className="btn btn-light" onClick={() => { downloadText(`lisans-${o.id}.txt`, [o.name + " — LİSAN ÖZETİ", "", "Plan: " + p.name, "Öğrenci: " + o.seats.used + "/" + o.seats.total, "Koç: " + o.coaches.used + "/" + o.coaches.total, "Yenileme: " + fmtShort(o.renewsAt), "Ücret: " + tl(o.feeMonthly) + "/ay"].join("\n")); toast("Özet indirildi", { icon: "ki-cloud-download" }); }}><Icon name="download" size={16} />Özet indir</button>
            </div>
          </UkSection>
          <UkSection title="Plan karşılaştırma" sub="Yükseltme anında kapasite güncellenir">
            <div className="card-body">
              <div className="grid g-3">
                {ORG_PLANS.map((pl) => {
                  const sel = pl.id === o.planId;
                  return (
                    <div key={pl.id} className={`lic-plan${sel ? " sel" : ""}`} onClick={() => { if (!sel) setConfirm("upgrade-" + pl.id); }} style={{ cursor: sel ? "default" : "pointer" }}>
                      <h4><span className="plan-dot" style={{ background: pl.color }} />{pl.name}</h4>
                      <div className="lp-price tnum">{tl(pl.monthly)}<span className="per"> /ay</span></div>
                      <ul><li>{pl.seats} öğrenci</li><li>{pl.coaches} koç</li><li>{pl.branches} şube</li></ul>
                      {sel ? <span className="badge badge-primary" style={{ alignSelf: "flex-start" }}>Mevcut</span> : null}
                    </div>
                  );
                })}
              </div>
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
        open={confirm === "upgrade" || (typeof confirm === "string" && confirm.startsWith("upgrade-"))}
        title="Plan değiştir?"
        tone="primary"
        body={`${o.name} için seçilen plana geçilecek. Kapasite ve modüller güncellenir.`}
        confirmLabel="Onayla"
        onConfirm={async () => {
          const target = confirm === "upgrade" ? "franchise" : (confirm?.replace("upgrade-", "") as typeof o.planId);
          await mutate({ kind: "changeOrgPlan", orgId: o.id, planId: target });
          toast(orgPlanById(target).name + " planına geçildi", { icon: "ki-check-circle" });
          setConfirm(null);
        }}
        onClose={() => setConfirm(null)}
      />
    </div>
  );
}
