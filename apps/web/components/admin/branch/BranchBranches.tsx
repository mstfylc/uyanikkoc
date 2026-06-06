// Kurum — Şubeler. apps/web/components/admin/branch/BranchBranches.tsx
// Prototip kaynağı: admin/kurum2.jsx (KurumBranches).
"use client";

import { Icon, StatCard, StatusBadge } from "@/components/admin/AdminKit";
import { useAdminStore } from "@/components/admin/AdminStore";
import { getActiveOrg } from "@/components/admin/selectors";
import { OrgSwitcher } from "./OrgSwitcher";
import { UkPageHead } from "@/components/design/UkPageHead";
import { downloadCSV } from "@/lib/admin/csv";
import { tl } from "@/lib/admin/format";
import { orgPlanById } from "@/lib/admin/pricing";

export function BranchBranches() {
  const { snapshot, activeOrgId, toast } = useAdminStore();
  if (!snapshot) return <div className="card card-pad muted">Yükleniyor…</div>;
  const o = getActiveOrg(snapshot, activeOrgId);

  if (o.type !== "franchise") {
    const b = o.branches[0];
    return (
      <div className="stack rise">
        <UkPageHead
          title="Şube"
          sub="Tek kurum — tüm öğrenci ve koçlar bu konuma bağlı"
          actions={
            <div className="row" style={{ gap: 9 }}>
              <OrgSwitcher />
              <button type="button" className="btn btn-primary" onClick={() => toast("Franchise yükseltme akışı", { icon: "ki-office-bag" })}>
                <Icon name="building" size={16} />Franchise'a yükselt
              </button>
            </div>
          }
        />
        <div className="alert-strip">
          <span className="as-ic" style={{ background: o.tone, color: "#fff" }}><Icon name="building" size={18} /></span>
          <div style={{ flex: 1 }}>
            <b style={{ fontSize: 13.5 }}>{b.name}</b>
            <div className="muted" style={{ fontSize: 12.5 }}>{b.city} · {b.students} öğrenci · {b.coaches} koç</div>
          </div>
          <span className="badge badge-info">Çok şubeli yapı için Franchise planına geçin</span>
        </div>
        <div className="grid g-3">
          <StatCard icon="cap" tone="primary" value={b.students} label="Öğrenci" />
          <StatCard icon="users" tone="info" value={b.coaches} label="Koç" />
          <StatCard icon="banknote" tone="success" value={tl(b.collect)} label="Aylık tahsilat" />
        </div>
      </div>
    );
  }

  const totalCollect = o.branches.reduce((s, b) => s + b.collect, 0);
  return (
    <div className="stack rise">
      <UkPageHead
        title="Şubeler"
        sub={`${o.branches.length} şube · ${orgPlanById(o.planId).branches} şube kapasitesi`}
        actions={
          <div className="row" style={{ gap: 9 }}>
            <OrgSwitcher />
            <button type="button" className="btn btn-light" onClick={() => { downloadCSV("subeler.csv", [["Şube", "Şehir", "Öğrenci", "Koç", "Aylık tahsilat"], ...o.branches.map((b) => [b.name, b.city, b.students, b.coaches, b.collect])]); toast("Liste indirildi", { icon: "ki-cloud-download" }); }}>
              <Icon name="download" size={16} />Dışa aktar
            </button>
            <button type="button" className="btn btn-primary" disabled={o.branches.length >= orgPlanById(o.planId).branches} onClick={() => toast("Yeni şube ekleme akışı", { icon: "ki-office-bag" })}>
              <Icon name="plus" size={16} />Şube ekle
            </button>
          </div>
        }
      />

      <div className="grid g-4">
        <StatCard icon="building" tone="primary" value={o.branches.length} label="Aktif şube" />
        <StatCard icon="cap" tone="info" value={o.branches.reduce((s, b) => s + b.students, 0)} label="Toplam öğrenci" />
        <StatCard icon="users" tone="success" value={o.branches.reduce((s, b) => s + b.coaches, 0)} label="Toplam koç" />
        <StatCard icon="banknote" tone="warning" value={tl(totalCollect)} label="Aylık tahsilat" />
      </div>

      <div className="grid g-2">
        {o.branches.map((b) => {
          const share = Math.round((b.collect / totalCollect) * 100);
          return (
            <div key={b.id} className="card">
              <div className="card-pad" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="row" style={{ gap: 13 }}>
                  <span className="org-logo" style={{ background: o.tone, borderRadius: 12 }}><Icon name="building" size={20} /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <b style={{ fontSize: 15, fontWeight: 800 }}>{b.name}</b>
                    <div className="muted" style={{ fontSize: 12.5 }}>{b.city}</div>
                  </div>
                  <StatusBadge status={b.status} sm />
                </div>
                <div className="row" style={{ gap: 22, flexWrap: "wrap" }}>
                  <div><div className="muted" style={{ fontSize: 11 }}>Öğrenci</div><b className="tnum" style={{ fontSize: 17 }}>{b.students}</b></div>
                  <div><div className="muted" style={{ fontSize: 11 }}>Koç</div><b className="tnum" style={{ fontSize: 17 }}>{b.coaches}</b></div>
                  <div><div className="muted" style={{ fontSize: 11 }}>Aylık tahsilat</div><b className="tnum" style={{ fontSize: 17 }}>{tl(b.collect)}</b></div>
                  <div style={{ marginLeft: "auto", textAlign: "right" }}><div className="muted" style={{ fontSize: 11 }}>Gelir payı</div><b className="tnum" style={{ fontSize: 17, color: o.tone }}>%{share}</b></div>
                </div>
                <div className="meter-bar"><span style={{ width: share + "%", background: o.tone }} /></div>
                <button type="button" className="btn btn-light btn-sm" style={{ alignSelf: "flex-start" }} onClick={() => toast(b.name + " detayları", { icon: "ki-office-bag" })}>
                  Şubeyi yönet<Icon name="chevronRight" size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
