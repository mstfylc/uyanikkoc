"use client";

import Link from "next/link";

import { Icon, StatCard } from "@/components/admin/AdminKit";
import { useAdminStore } from "@/components/admin/AdminStore";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import { downloadText } from "@/lib/admin/csv";
import { fmtShort, tl } from "@/lib/admin/format";
import { coachPlanById } from "@/lib/admin/pricing";
import { resolveSoloCoachId } from "@/lib/admin/snapshot-context";

export function CoachInvoicesPanel() {
  const { snapshot, toast } = useAdminStore();
  if (!snapshot) return <p className="muted">Yükleniyor…</p>;

  const soloId = resolveSoloCoachId(snapshot.myCoachId, snapshot.coaches);
  const c = soloId ? snapshot.coaches.find((x) => x.id === soloId) : undefined;
  if (!c) {
    return (
      <div className="stack rise">
        <UkPageHead title="Faturalar" sub="Bireysel koç ödeme geçmişi" />
        <p className="muted">Fatura geçmişi yalnızca bireysel koç hesapları için kullanılabilir.</p>
      </div>
    );
  }

  const invoices = c.invoices;
  const paid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);

  function exportCsv() {
    const rows = [["Fatura", "Tarih", "Plan", "Tutar", "Durum", "Yöntem"]];
    invoices.forEach((i) => {
      rows.push([i.id, fmtShort(i.date), coachPlanById(i.planId).name, String(i.amount), i.status, i.method]);
    });
    downloadText("koc-faturalar.csv", rows.map((r) => r.join(",")).join("\n"));
    toast("Fatura listesi indirildi", { icon: "ki-cloud-download" });
  }

  return (
    <div className="stack rise" data-testid="coach-invoices-panel">
      <UkPageHead
        title="Faturalar"
        sub="Ödeme geçmişi ve makbuzlar"
        actions={
          <div className="row" style={{ gap: 9 }}>
            <Link href="/coach/license" className="btn btn-light"><Icon name="chevronRight" size={15} style={{ transform: "rotate(180deg)" }} />Lisansım</Link>
            <button type="button" className="btn btn-light" onClick={exportCsv}><Icon name="download" size={16} />Dışa aktar</button>
          </div>
        }
      />

      <div className="grid g-3">
        <StatCard icon="receipt" tone="primary" value={invoices.length} label="Toplam fatura" />
        <StatCard icon="banknote" tone="success" value={tl(paid)} label="Ödenen toplam" />
        <StatCard icon="alert" tone="warning" value={invoices.filter((i) => i.status !== "paid").length} label="Bekleyen / başarısız" />
      </div>

      <UkSection title="Fatura geçmişi">
        <div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
          <table className="tbl" style={{ minWidth: 640 }}>
            <thead>
              <tr>
                <th>Fatura no</th>
                <th>Tarih</th>
                <th>Plan</th>
                <th style={{ textAlign: "right" }}>Tutar</th>
                <th style={{ textAlign: "center" }}>Durum</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((i) => {
                const p = coachPlanById(i.planId);
                const st = i.status === "paid" ? ["success", "Ödendi"] : i.status === "failed" ? ["danger", "Başarısız"] : ["warning", "Bekliyor"];
                return (
                  <tr key={i.id}>
                    <td><b className="tnum" style={{ fontSize: 12.5 }}>{i.id}</b></td>
                    <td><span className="muted tnum">{fmtShort(i.date)}</span></td>
                    <td><span className="row" style={{ gap: 7 }}><span className="plan-dot" style={{ background: p.color }} />{p.name}</span></td>
                    <td style={{ textAlign: "right" }}><b className="tnum">{tl(i.amount)}</b></td>
                    <td style={{ textAlign: "center" }}><span className={`badge badge-${st[0]}`} style={{ height: 22 }}>{st[1]}</span></td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        className="btn btn-light btn-sm"
                        onClick={() => {
                          downloadText(`makbuz-${i.id}.txt`, [
                            "UYANIK KOÇ — FATURA MAKBUZU",
                            "",
                            "Fatura: " + i.id,
                            "Plan: " + p.name,
                            "Tutar: " + tl(i.amount),
                            "Durum: " + st[1],
                            "Yöntem: " + i.method,
                          ].join("\n"));
                          toast("Makbuz indirildi", { icon: "ki-cloud-download" });
                        }}
                      >
                        <Icon name="receipt" size={14} />Makbuz
                      </button>
                    </td>
                  </tr>
                );
              })}
              {invoices.length === 0 ? (
                <tr><td colSpan={6} className="muted" style={{ padding: 20, textAlign: "center" }}>Henüz fatura yok.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </UkSection>
    </div>
  );
}
