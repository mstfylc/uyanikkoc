// Süper Admin — Gelir & Faturalama. apps/web/components/admin/super/SuperRevenue.tsx
// Prototip kaynağı: admin/superadmin2.jsx (SARevenue).
"use client";

import { Icon, Legend, RankBars, Ring, StatCard } from "@/components/admin/AdminKit";
import { useAdminStore } from "@/components/admin/AdminStore";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import { platformMetrics } from "@/lib/admin/derive";
import { downloadCSV, downloadText } from "@/lib/admin/csv";
import { fmtDate, fmtShort, tl } from "@/lib/admin/format";

export function SuperRevenue() {
  const { snapshot, toast } = useAdminStore();
  if (!snapshot) return <div className="card card-pad muted">Yükleniyor…</div>;

  const m = platformMetrics(snapshot.orgs, snapshot.coaches);
  const paid = snapshot.orgInvoices.filter((i) => i.status === "paid");
  const pending = snapshot.orgInvoices.filter((i) => i.status === "pending");
  const collected = paid.reduce((s, i) => s + i.amount, 0);
  const outstanding = pending.reduce((s, i) => s + i.amount, 0);
  const byPlan = [
    { l: "Franchise", v: snapshot.orgs.filter((o) => o.planId === "franchise").reduce((s, o) => s + o.feeMonthly, 0), color: "var(--warning)" },
    { l: "Kurum Pro", v: snapshot.orgs.filter((o) => o.planId === "pro").reduce((s, o) => s + o.feeMonthly, 0), color: "var(--primary)" },
    { l: "Kurum Başlangıç", v: snapshot.orgs.filter((o) => o.planId === "baslangic").reduce((s, o) => s + o.feeMonthly, 0), color: "var(--info)" },
    { l: "Bireysel koç", v: m.coachMrr, color: "var(--success)" },
  ];
  const ratePct = collected + outstanding > 0 ? Math.round((collected / (collected + outstanding)) * 100) : 100;

  return (
    <div className="stack rise">
      <UkPageHead
        title="Gelir & Faturalama"
        sub="Platform genelinde tüm tahsilat, MRR/ARR ve kurum faturaları"
        actions={
          <button
            type="button"
            className="btn btn-light"
            onClick={() => {
              downloadCSV("faturalar.csv", [
                ["Fatura", "Kurum", "Tarih", "Plan", "Tutar", "Durum"],
                ...snapshot.orgInvoices.map((i) => [i.id, i.orgName, fmtShort(i.date), i.plan, i.amount, i.status === "paid" ? "Ödendi" : "Bekliyor"]),
              ]);
              toast("Faturalar indirildi", { icon: "ki-cloud-download" });
            }}
          >
            <Icon name="download" size={16} />
            Faturaları indir
          </button>
        }
      />

      <div className="grid g-4">
        <StatCard icon="banknote" tone="success" value={tl(m.mrr)} label="Aylık gelir (MRR)" delta="+%8,4" />
        <StatCard icon="trend" tone="primary" value={tl(m.arr)} label="Yıllık gelir (ARR)" />
        <StatCard icon="receipt" tone="info" value={tl(collected)} label="Toplam tahsil edilen" />
        <StatCard icon="alert" tone="danger" value={tl(outstanding)} label="Bekleyen tahsilat" />
      </div>

      <div className="grid col-main">
        <UkSection title="Plana göre aylık gelir dağılımı">
          <div className="card-body">
            <RankBars items={byPlan} fmt={(v) => tl(v)} />
          </div>
        </UkSection>
        <UkSection title="Tahsilat oranı" sub="Bu ay">
          <div className="card-body" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <Ring value={ratePct} label={`%${ratePct}`} sub="tahsil edildi" big />
            <Legend
              items={[
                { l: "Tahsil edilen", color: "var(--primary)", v: tl(collected) },
                { l: "Bekleyen", color: "var(--surface-3)", v: tl(outstanding) },
              ]}
            />
          </div>
        </UkSection>
      </div>

      <UkSection title="Kurum faturaları" sub="Platform lisans ücretleri">
        <div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
          <table className="tbl" style={{ minWidth: 720 }}>
            <thead>
              <tr>
                <th>Fatura No</th>
                <th>Kurum</th>
                <th>Tarih</th>
                <th>Plan</th>
                <th style={{ textAlign: "right" }}>Tutar</th>
                <th style={{ textAlign: "center" }}>Durum</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {snapshot.orgInvoices.map((i) => (
                <tr key={i.id}>
                  <td><span className="tnum" style={{ fontWeight: 700, fontSize: 12.5 }}>{i.id}</span></td>
                  <td><span style={{ fontSize: 12.5, fontWeight: 600 }}>{i.orgName}</span></td>
                  <td><span className="muted tnum" style={{ fontSize: 12.5 }}>{fmtShort(i.date)}</span></td>
                  <td><span className="badge badge-muted" style={{ height: 22 }}>{i.plan}</span></td>
                  <td style={{ textAlign: "right" }}><span className="tnum" style={{ fontWeight: 700 }}>{tl(i.amount)}</span></td>
                  <td style={{ textAlign: "center" }}>
                    <span className={`badge badge-${i.status === "paid" ? "success" : "warning"}`} style={{ height: 22 }}>
                      {i.status === "paid" ? "Ödendi" : "Bekliyor"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      className="icon-btn"
                      style={{ width: 32, height: 32 }}
                      title="İndir"
                      onClick={() => {
                        downloadText(
                          "fatura-" + i.id + ".txt",
                          ["UYANIK KOÇ — PLATFORM FATURASI", "", "Fatura No: " + i.id, "Kurum: " + i.orgName, "Tarih: " + fmtDate(i.date), "Plan: " + i.plan, "Tutar: " + tl(i.amount), "Durum: " + (i.status === "paid" ? "Ödendi" : "Bekliyor")].join("\n"),
                        );
                        toast("Fatura indirildi", { icon: "ki-cloud-download" });
                      }}
                    >
                      <Icon name="download" size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </UkSection>
    </div>
  );
}
