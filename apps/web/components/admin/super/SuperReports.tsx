// Süper Admin — Raporlar (platform geneli gelir / büyüme / lisans sağlığı).
// apps/web/components/admin/super/SuperReports.tsx
// Tasarım kaynağı: admin/sa-reports.jsx (SAReports). Veriler AdminSnapshot'tan hesaplanır.
"use client";

import { useState } from "react";

import { AdminTabs, Donut, Legend, RankBars, StatCard } from "@/components/admin/AdminKit";
import { useAdminStore } from "@/components/admin/AdminStore";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import { tl } from "@/lib/admin/format";
import type { LicenseStatus } from "@/lib/admin/types";

type RptTab = "gelir" | "buyume" | "lisans";

const STATUS_META: Record<LicenseStatus, { label: string; color: string }> = {
  active: { label: "Aktif", color: "var(--success)" },
  trial: { label: "Deneme", color: "var(--info)" },
  expiring: { label: "Doluyor", color: "var(--warning)" },
  overdue: { label: "Gecikmiş", color: "var(--danger)" },
  suspended: { label: "Askıda", color: "var(--muted)" },
  canceled: { label: "İptal", color: "var(--faint)" },
};

export function SuperReports() {
  const { snapshot } = useAdminStore();
  const [tab, setTab] = useState<RptTab>("gelir");
  if (!snapshot) return <div className="card card-pad muted">Yükleniyor…</div>;

  const { orgs, coaches, orgInvoices, signups, studentSubscriptions } = snapshot;
  const orgMrr = orgs.reduce((s, o) => s + o.feeMonthly, 0);
  const coachMrr = coaches.reduce((s, c) => s + c.feeMonthly, 0);
  const mrr = orgMrr + coachMrr;
  const collected = orgInvoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const outstanding = orgInvoices.filter((i) => i.status === "pending").reduce((s, i) => s + i.amount, 0);

  const byPlan = [
    { l: "Franchise", v: orgs.filter((o) => o.planId === "franchise").reduce((s, o) => s + o.feeMonthly, 0), color: "var(--warning)" },
    { l: "Kurum Pro", v: orgs.filter((o) => o.planId === "pro").reduce((s, o) => s + o.feeMonthly, 0), color: "var(--primary)" },
    { l: "Kurum Başlangıç", v: orgs.filter((o) => o.planId === "baslangic").reduce((s, o) => s + o.feeMonthly, 0), color: "var(--info)" },
    { l: "Bireysel koç", v: coachMrr, color: "var(--success)" },
  ].sort((a, b) => b.v - a.v);

  const totalStudents = orgs.reduce((s, o) => s + o.seats.used, 0) + coaches.reduce((s, c) => s + c.seats.used, 0);
  const subscriberSlices = [
    { l: "Kurum", v: orgs.length, color: "var(--primary)" },
    { l: "Bireysel koç", v: coaches.length, color: "var(--success)" },
  ];

  const allStatuses = [...orgs.map((o) => o.status), ...coaches.map((c) => c.status)];
  const statusSlices = (Object.keys(STATUS_META) as LicenseStatus[])
    .map((k) => ({ l: STATUS_META[k].label, v: allStatuses.filter((s) => s === k).length, color: STATUS_META[k].color }))
    .filter((s) => s.v > 0);

  return (
    <div className="stack rise">
      <UkPageHead title="Raporlar" sub="Platform genelinde gelir, büyüme ve lisans sağlığı raporları" />
      <AdminTabs
        tabs={[
          { k: "gelir", label: "Gelir" },
          { k: "buyume", label: "Büyüme" },
          { k: "lisans", label: "Lisans Sağlığı" },
        ]}
        active={tab}
        onChange={(k) => setTab(k as RptTab)}
      />

      {tab === "gelir" ? (
        <div className="stack">
          <div className="grid g-4">
            <StatCard icon="banknote" tone="success" value={tl(mrr)} label="Aylık gelir (MRR)" delta="+%8,4" />
            <StatCard icon="trend" tone="primary" value={tl(mrr * 12)} label="Yıllık gelir (ARR)" />
            <StatCard icon="receipt" tone="info" value={tl(collected)} label="Toplam tahsil edilen" />
            <StatCard icon="alert" tone="danger" value={tl(outstanding)} label="Bekleyen tahsilat" />
          </div>
          <UkSection title="Plana göre aylık gelir dağılımı">
            <div className="card-body"><RankBars items={byPlan} fmt={(v) => tl(v)} /></div>
          </UkSection>
        </div>
      ) : null}

      {tab === "buyume" ? (
        <div className="stack">
          <div className="grid g-4">
            <StatCard icon="building" tone="primary" value={orgs.length} label="Kurum / franchise" />
            <StatCard icon="users" tone="info" value={coaches.length} label="Bireysel koç" />
            <StatCard icon="users" tone="success" value={totalStudents} label="Toplam öğrenci" />
            <StatCard icon="clipboard" tone="warning" value={signups.length} label="Bu dönem kayıt" delta={`${signups.length}`} />
          </div>
          <UkSection title="Abone dağılımı" sub="Kurum vs bireysel koç">
            <div className="card-body row" style={{ gap: 24, alignItems: "center", flexWrap: "wrap" }}>
              <Donut slices={subscriberSlices} center={{ v: orgs.length + coaches.length, l: "abone" }} />
              <Legend items={subscriberSlices.map((s) => ({ l: s.l, color: s.color, v: s.v }))} />
            </div>
          </UkSection>
        </div>
      ) : null}

      {tab === "lisans" ? (
        <div className="stack">
          <div className="grid g-4">
            <StatCard icon="shield" tone="success" value={allStatuses.filter((s) => s === "active").length} label="Aktif lisans" />
            <StatCard icon="alert" tone="warning" value={allStatuses.filter((s) => s === "expiring").length} label="Yakında doluyor" />
            <StatCard icon="alert" tone="danger" value={allStatuses.filter((s) => s === "overdue").length} label="Gecikmiş" />
            <StatCard icon="card" tone="info" value={studentSubscriptions.length} label="Öğrenci aboneliği" />
          </div>
          <UkSection title="Lisans durumu dağılımı">
            <div className="card-body row" style={{ gap: 24, alignItems: "center", flexWrap: "wrap" }}>
              <Donut slices={statusSlices} center={{ v: allStatuses.length, l: "lisans" }} />
              <Legend items={statusSlices.map((s) => ({ l: s.l, color: s.color, v: s.v }))} />
            </div>
          </UkSection>
        </div>
      ) : null}
    </div>
  );
}
