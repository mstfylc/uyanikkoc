// Kurum — Gelir & Tahsilat. apps/web/components/admin/branch/BranchRevenue.tsx
// Prototip kaynağı: admin/kurum2.jsx (KurumRevenue).
"use client";

import { Donut, Icon, Legend, StatCard } from "@/components/admin/AdminKit";
import { useAdminStore } from "@/components/admin/AdminStore";
import { getActiveOrg } from "@/components/admin/selectors";
import { OrgSwitcher } from "./OrgSwitcher";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import { UkSparkline } from "@/components/design/UkSparkline";
import { downloadCSV } from "@/lib/admin/csv";
import { tl } from "@/lib/admin/format";

const MONTHS = ["Oca", "Şub", "Mar", "Nis", "May", "Haz"];

export function BranchRevenue() {
  const { snapshot, activeOrgId, toast } = useAdminStore();
  if (!snapshot) return <div className="card card-pad muted">Yükleniyor…</div>;

  const o = getActiveOrg(snapshot, activeOrgId);
  const totalCollect = o.branches.reduce((s, b) => s + b.collect, 0);
  const platformFee = o.feeMonthly;
  const net = totalCollect - platformFee;
  const series = [0.82, 0.85, 0.88, 0.91, 0.95, 1].map((f) => Math.round(totalCollect * f));

  return (
    <div className="stack rise">
      <UkPageHead
        title="Gelir & Tahsilat"
        sub="Öğrenci aboneliklerinden gelen tahsilat ve platform ücreti"
        actions={
          <div className="row" style={{ gap: 9 }}>
            <OrgSwitcher />
            <button type="button" className="btn btn-light" onClick={() => { downloadCSV("gelir.csv", [["Ay", "Tahsilat"], ...MONTHS.map((mo, i) => [mo, series[i]])]); toast("Gelir raporu indirildi", { icon: "ki-cloud-download" }); }}>
              <Icon name="download" size={16} />Dışa aktar
            </button>
          </div>
        }
      />

      <div className="grid g-4">
        <StatCard icon="banknote" tone="success" value={tl(totalCollect)} label="Aylık brüt tahsilat" delta="+%6,2" />
        <StatCard icon="card" tone="danger" value={tl(platformFee)} label="Platform ücreti" />
        <StatCard icon="card" tone="primary" value={tl(net)} label="Net gelir" />
        <StatCard icon="cap" tone="info" value={tl(Math.round(totalCollect / o.seats.used))} label="Öğrenci başına" />
      </div>

      <div className="grid col-main">
        <UkSection title="Aylık tahsilat gelişimi" sub="Son 6 ay">
          <div className="card-body">
            <UkSparkline data={series} width={640} height={130} color="var(--success)" />
            <div className="chart" style={{ marginTop: 14 }}>
              {MONTHS.map((mo) => (
                <div key={mo} className="col"><label>{mo}</label></div>
              ))}
            </div>
          </div>
        </UkSection>
        <UkSection title="Tahsilat dağılımı">
          <div className="card-body" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <Donut
              slices={[{ v: net, color: "var(--success)" }, { v: platformFee, color: "var(--surface-3)" }]}
              center={{ v: "%" + Math.round((net / totalCollect) * 100), l: "net kâr" }}
            />
            <Legend
              items={[
                { l: "Net gelir", color: "var(--success)", v: tl(net) },
                { l: "Platform ücreti", color: "var(--surface-3)", v: tl(platformFee) },
              ]}
            />
          </div>
        </UkSection>
      </div>

      {o.type === "franchise" ? (
        <UkSection title="Şube bazında tahsilat">
          <div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
            <table className="tbl" style={{ minWidth: 560 }}>
              <thead>
                <tr>
                  <th>Şube</th>
                  <th>Öğrenci</th>
                  <th style={{ textAlign: "right" }}>Tahsilat</th>
                  <th style={{ textAlign: "right" }}>Öğrenci başına</th>
                  <th style={{ textAlign: "right" }}>Pay</th>
                </tr>
              </thead>
              <tbody>
                {o.branches.map((b) => (
                  <tr key={b.id}>
                    <td><b style={{ fontSize: 13 }}>{b.name}</b></td>
                    <td><span className="tnum">{b.students}</span></td>
                    <td style={{ textAlign: "right" }}><span className="tnum" style={{ fontWeight: 700 }}>{tl(b.collect)}</span></td>
                    <td style={{ textAlign: "right" }}><span className="tnum muted">{tl(Math.round(b.collect / b.students))}</span></td>
                    <td style={{ textAlign: "right" }}><span className="tnum" style={{ fontWeight: 700, color: o.tone }}>%{Math.round((b.collect / totalCollect) * 100)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </UkSection>
      ) : null}
    </div>
  );
}
