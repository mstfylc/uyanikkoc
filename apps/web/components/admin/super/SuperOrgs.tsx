// Süper Admin — Kurumlar & Franchise listesi. apps/web/components/admin/super/SuperOrgs.tsx
// Prototip kaynağı: admin/superadmin.jsx (SAOrgs).
"use client";

import Link from "next/link";
import { useState } from "react";

import { CreateOrgDialog } from "@/components/admin/dialogs";
import { EmptyState, Icon, Meter, OrgLogo, StatusBadge } from "@/components/admin/AdminKit";
import { useAdminStore } from "@/components/admin/AdminStore";
import { UkPageHead } from "@/components/design/UkPageHead";
import { downloadCSV } from "@/lib/admin/csv";
import { daysLeft, tl } from "@/lib/admin/format";
import { orgPlanById, statusMeta } from "@/lib/admin/pricing";

const FILTERS = [
  { k: "all", l: "Tümü" },
  { k: "franchise", l: "Franchise" },
  { k: "kurum", l: "Tek kurum" },
];

export function SuperOrgs() {
  const { snapshot, toast } = useAdminStore();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  if (!snapshot) return <div className="card card-pad muted">Yükleniyor…</div>;

  const orgs = snapshot.orgs;
  const list = orgs.filter(
    (o) => (filter === "all" || o.type === filter) && o.name.toLowerCase().includes(q.toLowerCase()),
  );

  const exportCsv = () => {
    downloadCSV("kurumlar.csv", [
      ["Kurum", "Tür", "Şehir", "Plan", "Şube", "Öğrenci/Koltuk", "Koç", "Ücret/ay", "Durum"],
      ...orgs.map((o) => [
        o.name,
        o.type === "franchise" ? "Franchise" : "Tek kurum",
        o.city,
        orgPlanById(o.planId).name,
        `${o.branches.length}`,
        `${o.seats.used}/${o.seats.total}`,
        `${o.coaches.used}/${o.coaches.total}`,
        o.feeMonthly,
        statusMeta(o.status).label,
      ]),
    ]);
    toast("Kurum listesi indirildi", { icon: "ki-cloud-download" });
  };

  return (
    <div className="stack rise">
      <UkPageHead
        title="Kurumlar & Franchise'lar"
        sub={`${orgs.length} kurum · ${orgs.filter((o) => o.type === "franchise").length} franchise ağı`}
        actions={
          <div className="row" style={{ gap: 9 }}>
            <button type="button" className="btn btn-light" onClick={exportCsv}>
              <Icon name="download" size={16} />
              Dışa aktar
            </button>
            <button type="button" className="btn btn-primary" onClick={() => setCreateOpen(true)}>
              <Icon name="plus" size={16} />
              Yeni kurum ekle
            </button>
          </div>
        }
      />

      <div className="between" style={{ flexWrap: "wrap", gap: 10 }}>
        <div className="seg">
          {FILTERS.map((f) => (
            <button key={f.k} type="button" className={filter === f.k ? "on" : ""} onClick={() => setFilter(f.k)}>
              {f.l}
            </button>
          ))}
        </div>
        <div className="searchbox" style={{ maxWidth: 280 }}>
          <Icon name="search" size={17} />
          <input placeholder="Kurum ara..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      <div className="grid g-2">
        {list.map((o) => {
          const p = orgPlanById(o.planId);
          const dl = daysLeft(o.renewsAt);
          return (
            <Link key={o.id} href={`/yonetim/orgs/${o.id}`} className="card" style={{ cursor: "pointer", textDecoration: "none", color: "inherit" }}>
              <div className="card-pad" style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                <div className="row" style={{ gap: 13 }}>
                  <OrgLogo name={o.name} tone={o.tone} size={46} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="row" style={{ gap: 8 }}>
                      <b style={{ fontSize: 15, fontWeight: 800 }}>{o.name}</b>
                      <StatusBadge status={o.status} sm />
                    </div>
                    <span className="muted" style={{ fontSize: 12.5 }}>
                      {o.type === "franchise" ? `Franchise · ${o.branches.length} şube` : "Tek kurum"} · {o.city}
                    </span>
                  </div>
                  <span className="badge badge-muted" style={{ height: 24 }}>{p.name}</span>
                </div>
                <Meter icon="cap" label="Öğrenci koltuğu" used={o.seats.used} total={o.seats.total} />
                <div className="row" style={{ gap: 18, flexWrap: "wrap" }}>
                  <div>
                    <div className="muted" style={{ fontSize: 11 }}>Koç</div>
                    <b className="tnum" style={{ fontSize: 14 }}>{o.coaches.used}/{o.coaches.total}</b>
                  </div>
                  <div>
                    <div className="muted" style={{ fontSize: 11 }}>Platform ücreti</div>
                    <b className="tnum" style={{ fontSize: 14 }}>
                      {tl(o.feeMonthly)}
                      <span className="muted" style={{ fontSize: 11, fontWeight: 500 }}>/ay</span>
                    </b>
                  </div>
                  <div>
                    <div className="muted" style={{ fontSize: 11 }}>Yenileme</div>
                    <b className="tnum" style={{ fontSize: 14, color: dl < 0 ? "var(--danger)" : dl < 14 ? "var(--warning)" : "var(--text)" }}>
                      {dl < 0 ? `${-dl}g geçti` : `${dl} gün`}
                    </b>
                  </div>
                  <span className="btn btn-light btn-sm" style={{ marginLeft: "auto" }}>
                    Yönet
                    <Icon name="chevronRight" size={15} />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      {list.length === 0 ? <EmptyState icon="building" title="Kurum bulunamadı" sub="Arama veya filtreyi değiştir" /> : null}
      {createOpen ? <CreateOrgDialog onClose={() => setCreateOpen(false)} /> : null}
    </div>
  );
}
