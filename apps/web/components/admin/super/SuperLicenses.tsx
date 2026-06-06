// Süper Admin — Lisans Takibi. apps/web/components/admin/super/SuperLicenses.tsx
// Prototip kaynağı: admin/superadmin.jsx (SALicenses). Yeni: abone profiline link.
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminTabs, EmptyState, Icon, OrgLogo, StatCard, StatusBadge, type TabDef } from "@/components/admin/AdminKit";
import { useAdminStore } from "@/components/admin/AdminStore";
import { isExpiringSoon, licenseRows, statusMeta } from "@/components/admin/selectors";
import { UkAvatar } from "@/components/design/UkAvatar";
import { UkPageHead } from "@/components/design/UkPageHead";
import { downloadCSV } from "@/lib/admin/csv";
import { daysLeft, fmtShort, tl } from "@/lib/admin/format";

export function SuperLicenses() {
  const { snapshot, toast } = useAdminStore();
  const router = useRouter();
  const [tab, setTab] = useState("all");
  if (!snapshot) return <div className="card card-pad muted">Yükleniyor…</div>;

  const rows = licenseRows(snapshot);
  const counts = {
    all: rows.length,
    expiring: rows.filter(isExpiringSoon).length,
    overdue: rows.filter((r) => r.status === "overdue").length,
    suspended: rows.filter((r) => r.status === "suspended" || r.status === "canceled").length,
  };
  const filtered = rows
    .filter((r) => {
      if (tab === "all") return true;
      if (tab === "expiring") return isExpiringSoon(r);
      if (tab === "overdue") return r.status === "overdue";
      if (tab === "suspended") return r.status === "suspended" || r.status === "canceled";
      return true;
    })
    .sort((a, b) => a.renewsAt - b.renewsAt);

  const TABS: TabDef[] = [
    { k: "all", label: "Tüm lisanslar", count: counts.all },
    { k: "expiring", label: "Süresi doluyor", count: counts.expiring, icon: "clock" },
    { k: "overdue", label: "Ödeme gecikti", count: counts.overdue, icon: "alert" },
    { k: "suspended", label: "Pasif", count: counts.suspended },
  ];

  const open = (kind: "org" | "coach", id: string) =>
    router.push(kind === "org" ? `/yonetim/orgs/${id}` : `/yonetim/coaches/${id}`);

  return (
    <div className="stack rise">
      <UkPageHead
        title="Lisans Takibi"
        sub="Tüm kurum, franchise ve bireysel koç lisanslarının durumu ve yenilemeleri"
        actions={
          <button
            type="button"
            className="btn btn-light"
            onClick={() => {
              downloadCSV("lisans-takip.csv", [
                ["Abone", "Tür", "Plan", "Durum", "Yenileme", "Ücret/ay"],
                ...rows.map((r) => [r.name, r.sub, r.plan, statusMeta(r.status).label, fmtShort(r.renewsAt), r.fee]),
              ]);
              toast("Lisans listesi indirildi", { icon: "ki-cloud-download" });
            }}
          >
            <Icon name="download" size={16} />
            CSV indir
          </button>
        }
      />

      <div className="grid g-4">
        <StatCard icon="shield" tone="success" value={rows.filter((r) => r.status === "active").length} label="Aktif lisans" />
        <StatCard icon="clock" tone="warning" value={counts.expiring} label="14 gün içinde doluyor" />
        <StatCard icon="alert" tone="danger" value={counts.overdue} label="Ödeme gecikti" />
        <StatCard icon="refresh" tone="info" value={rows.filter((r) => r.status === "trial").length} label="Deneme sürümünde" />
      </div>

      <AdminTabs tabs={TABS} active={tab} onChange={setTab} />

      <div className="card">
        <div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
          <table className="tbl" style={{ minWidth: 800 }}>
            <thead>
              <tr>
                <th>Abone</th>
                <th>Plan</th>
                <th>Kapasite</th>
                <th>Durum</th>
                <th>Yenileme</th>
                <th style={{ textAlign: "right" }}>Ücret</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const dl = daysLeft(r.renewsAt);
                const unl = r.seats.total >= 999;
                return (
                  <tr key={r.kind + r.id} style={{ cursor: "pointer" }} onClick={() => open(r.kind, r.id)}>
                    <td>
                      <div className="name">
                        {r.kind === "org" ? <OrgLogo name={r.name} tone={r.tone} size={34} /> : <UkAvatar name={r.name} size={34} />}
                        <div>
                          <b>
                            {r.name}
                            {r.gifted ? <span className="badge badge-info" style={{ height: 18, fontSize: 9.5, marginLeft: 7 }}>Demo</span> : null}
                          </b>
                          <span>{r.sub}</span>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-muted" style={{ height: 22 }}>{r.plan}</span></td>
                    <td>
                      <span className="tnum" style={{ fontSize: 12.5, fontWeight: 600 }}>
                        {r.seats.used}
                        <span className="muted">/{unl ? "∞" : r.seats.total}</span>
                      </span>
                    </td>
                    <td><StatusBadge status={r.status} sm /></td>
                    <td>
                      <span
                        className="tnum"
                        style={{ fontSize: 12.5, fontWeight: 700, color: dl < 0 ? "var(--danger)" : dl >= 0 && dl <= 14 ? "var(--warning)" : "var(--text-2)" }}
                      >
                        {dl < 0 ? `${-dl}g geçti` : `${dl} gün`}
                      </span>
                      <div className="muted tnum" style={{ fontSize: 11 }}>{fmtShort(r.renewsAt)}</div>
                    </td>
                    <td style={{ textAlign: "right" }}><span className="tnum" style={{ fontWeight: 700, fontSize: 13 }}>{tl(r.fee)}</span></td>
                    <td style={{ textAlign: "right" }}>
                      <span className="link-btn">
                        Profil
                        <Icon name="chevronRight" size={15} />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {filtered.length === 0 ? <EmptyState icon="shield" title="Bu kategoride lisans yok" sub="Bekleyen bir şey görünmüyor" /> : null}
    </div>
  );
}
