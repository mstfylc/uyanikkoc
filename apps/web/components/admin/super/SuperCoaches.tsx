// Süper Admin — Bireysel Koç Lisansları. apps/web/components/admin/super/SuperCoaches.tsx
// Prototip kaynağı: admin/superadmin2.jsx (SACoaches). Yeni: koç profiline link.
"use client";

import Link from "next/link";
import { useState } from "react";

import { EmptyState, Icon, StatCard, StatusBadge } from "@/components/admin/AdminKit";
import { useAdminStore } from "@/components/admin/AdminStore";
import { canEdit } from "@/components/admin/selectors";
import { UkAvatar } from "@/components/design/UkAvatar";
import { UkPageHead } from "@/components/design/UkPageHead";
import { downloadCSV } from "@/lib/admin/csv";
import { daysLeft, fmtShort, tl } from "@/lib/admin/format";
import { coachPlanById, statusMeta } from "@/lib/admin/pricing";

const FILTERS = [
  { k: "all", l: "Tümü" },
  { k: "active", l: "Aktif" },
  { k: "trial", l: "Deneme" },
  { k: "suspended", l: "Pasif" },
];

export function SuperCoaches() {
  const { snapshot, mutate, toast } = useAdminStore();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  if (!snapshot) return <div className="card card-pad muted">Yükleniyor…</div>;

  const editable = canEdit(snapshot.viewerAccess);
  const coaches = snapshot.coaches;
  const list = coaches.filter((c) => {
    const okF = filter === "all" ? true : filter === "suspended" ? c.status === "suspended" || c.status === "canceled" : c.status === filter;
    return okF && c.name.toLowerCase().includes(q.toLowerCase());
  });
  const mrr = coaches.filter((c) => c.status === "active").reduce((s, c) => s + c.feeMonthly, 0);

  return (
    <div className="stack rise">
      <UkPageHead
        title="Bireysel Koç Lisansları"
        sub="Kuruma bağlı olmadan tek başına lisans alan koçlar"
        actions={
          <button
            type="button"
            className="btn btn-light"
            onClick={() => {
              downloadCSV("bireysel-koclar.csv", [
                ["Koç", "Şehir", "Plan", "Durum", "Öğrenci", "Yenileme", "Ücret/ay"],
                ...coaches.map((c) => [c.name, c.city, coachPlanById(c.planId).name, statusMeta(c.status).label, c.seats.used, fmtShort(c.renewsAt), c.feeMonthly]),
              ]);
              toast("Koç listesi indirildi", { icon: "ki-cloud-download" });
            }}
          >
            <Icon name="download" size={16} />
            CSV indir
          </button>
        }
      />

      <div className="grid g-4">
        <StatCard icon="users" tone="primary" value={coaches.filter((c) => c.status === "active").length} label="Aktif koç lisansı" />
        <StatCard icon="refresh" tone="info" value={coaches.filter((c) => c.status === "trial").length} label="Deneme sürümünde" />
        <StatCard icon="cap" tone="success" value={coaches.filter((c) => c.status !== "canceled").reduce((s, c) => s + c.seats.used, 0)} label="Toplam öğrenci" />
        <StatCard icon="banknote" tone="warning" value={tl(mrr)} label="Aylık koç geliri" />
      </div>

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
          <input placeholder="Koç ara..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
          <table className="tbl" style={{ minWidth: 820 }}>
            <thead>
              <tr>
                <th>Koç</th>
                <th>Plan</th>
                <th>Öğrenci</th>
                <th>Durum</th>
                <th>Yenileme</th>
                <th style={{ textAlign: "right" }}>Ücret</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => {
                const cp = coachPlanById(c.planId);
                const dl = daysLeft(c.renewsAt);
                const unl = c.seats.total >= 999;
                return (
                  <tr key={c.id}>
                    <td>
                      <Link href={`/admin/coaches/${c.id}`} className="name" style={{ textDecoration: "none", color: "inherit" }}>
                        <UkAvatar name={c.name} size={34} />
                        <div>
                          <b>{c.name}{c.giftedDemoUntil ? <span className="badge badge-info" style={{ height: 18, fontSize: 9.5, marginLeft: 7 }}>Demo</span> : null}</b>
                          <span>{c.city}{c.rating ? ` · ★ ${c.rating}` : ""}</span>
                        </div>
                      </Link>
                    </td>
                    <td>
                      <span className="row" style={{ gap: 7 }}>
                        <span className="plan-dot" style={{ background: cp.color }} />
                        <span style={{ fontSize: 12.5, fontWeight: 600 }}>{cp.name}</span>
                      </span>
                    </td>
                    <td><span className="tnum" style={{ fontWeight: 600 }}>{c.seats.used}<span className="muted">/{unl ? "∞" : c.seats.total}</span></span></td>
                    <td><StatusBadge status={c.status} sm /></td>
                    <td><span className="tnum" style={{ fontSize: 12.5, fontWeight: 700, color: dl < 0 ? "var(--danger)" : dl >= 0 && dl <= 14 ? "var(--warning)" : "var(--text-2)" }}>{dl < 0 ? `${-dl}g geçti` : `${dl} gün`}</span></td>
                    <td style={{ textAlign: "right" }}><span className="tnum" style={{ fontWeight: 700 }}>{tl(c.feeMonthly)}</span></td>
                    <td style={{ textAlign: "right" }}>
                      <div className="row" style={{ gap: 6, justifyContent: "flex-end" }}>
                        {editable ? (
                          c.status === "suspended" || c.status === "canceled" ? (
                            <button type="button" className="btn btn-light btn-sm" onClick={async () => { await mutate({ kind: "activateCoach", coachId: c.id }); toast(c.name + " yeniden aktif", { icon: "ki-check-circle" }); }}>Aktifleştir</button>
                          ) : (
                            <button type="button" className="btn btn-light btn-sm" onClick={async () => { await mutate({ kind: "suspendCoach", coachId: c.id }); toast(c.name + " donduruldu", { icon: "ki-information-2", tone: "danger" }); }}>Dondur</button>
                          )
                        ) : null}
                        <Link href={`/admin/coaches/${c.id}`} className="icon-btn" style={{ width: 32, height: 32 }} aria-label="Profil">
                          <Icon name="chevronRight" size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {list.length === 0 ? <EmptyState icon="users" title="Koç bulunamadı" sub="Arama veya filtreyi değiştir" /> : null}
    </div>
  );
}
