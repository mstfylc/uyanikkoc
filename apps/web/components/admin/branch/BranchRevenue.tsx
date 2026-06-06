// Kurum — Gelir & Tahsilat. apps/web/components/admin/branch/BranchRevenue.tsx
// Prototip kaynağı: billing-branch.jsx + admin/kurum2.jsx (zip-16 v2).
"use client";

import { useState } from "react";

import { Donut, Icon, Legend, StatCard } from "@/components/admin/AdminKit";
import { useAdminStore } from "@/components/admin/AdminStore";
import { getActiveOrg } from "@/components/admin/selectors";
import { OrgSwitcher } from "./OrgSwitcher";
import { CardBrandBadge } from "@/components/shared/billing/CardBrandBadge";
import { UkAvatar } from "@/components/design/UkAvatar";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import { UkSparkline } from "@/components/design/UkSparkline";
import { downloadCSV } from "@/lib/admin/csv";
import { tl } from "@/lib/admin/format";
import { studentPlanById, subscriptionMrr } from "@/lib/admin/pricing";
import type { StudentSubscription } from "@/lib/admin/types";

const REV_TREND = [
  { ay: "Oca", v: 0.82 },
  { ay: "Şub", v: 0.85 },
  { ay: "Mar", v: 0.88 },
  { ay: "Nis", v: 0.91 },
  { ay: "May", v: 0.95 },
  { ay: "Haz", v: 1 },
];

const MONTHS = ["Oca", "Şub", "Mar", "Nis", "May", "Haz"];

type Filter = "all" | "paid" | "due";
type BranchSort = "collect" | "per" | "growth";

export function BranchRevenue() {
  const { snapshot, activeOrgId, mutate, toast } = useAdminStore();
  const [filter, setFilter] = useState<Filter>("all");
  const [branchSort, setBranchSort] = useState<BranchSort>("collect");
  const [reminded, setReminded] = useState<Set<string>>(() => new Set());

  if (!snapshot) return <div className="card card-pad muted">Yükleniyor…</div>;

  const o = getActiveOrg(snapshot, activeOrgId);
  const aboneler = snapshot.studentSubscriptions.filter((s) => s.orgId === o.id);
  const platformFee = o.feeMonthly;
  const totalCollect = o.branches.reduce((s, b) => s + b.collect, 0) || 1;
  const net = totalCollect - platformFee;
  const series = REV_TREND.map((r) => Math.round(totalCollect * r.v));
  const isFr = o.type === "franchise";
  const branchRows = o.branches.map((b, i) => {
    const share = Math.round((b.collect / totalCollect) * 100);
    const per = Math.round(b.collect / Math.max(1, b.students));
    const growth = ((i * 7) % 13) - 4;
    const feeShare = Math.round(platformFee * (b.collect / totalCollect));
    const profit = b.collect - feeShare;
    return { ...b, share, per, growth, feeShare, profit };
  });
  const sortedBranches = [...branchRows].sort((x, y) =>
    branchSort === "per" ? y.per - x.per : branchSort === "growth" ? y.growth - x.growth : y.collect - x.collect,
  );
  const maxCollect = Math.max(...branchRows.map((r) => r.collect), 1);
  const best = [...branchRows].sort((x, y) => y.collect - x.collect)[0];
  const topPer = [...branchRows].sort((x, y) => y.per - x.per)[0];

  const mrr = aboneler.filter((a) => a.status !== "failed").reduce((s, a) => s + subscriptionMrr(a), 0);
  const aktif = aboneler.filter((a) => a.status === "paid").length;
  const geciken = aboneler.filter((a) => a.status === "failed" || a.status === "pending");
  const gecikenTutar = geciken.reduce((s, a) => s + subscriptionMrr(a), 0);
  const trendBase = mrr > 0 ? mrr : o.branches.reduce((s, b) => s + b.collect, 0);
  const maxV = trendBase;

  const list =
    filter === "paid" ? aboneler.filter((a) => a.status === "paid") : filter === "due" ? geciken : aboneler;

  function exportCsv() {
    if (isFr) {
      downloadCSV("gelir-sube.csv", [
        ["Şube", "Öğrenci", "Aylık tahsilat", "Öğrenci başına", "Platform payı", "Net kâr", "Pay %", "Aylık değişim %"],
        ...branchRows.map((r) => [r.name, r.students, r.collect, r.per, r.feeShare, r.profit, r.share, r.growth]),
      ]);
      toast("Şube gelir raporu indirildi", { icon: "ki-cloud-download" });
      return;
    }
    const rows = [["Öğrenci", "Veli", "Plan", "Dönem", "Aylık", "Durum", "Sonraki"]];
    aboneler.forEach((a) => {
      rows.push([
        a.studentName,
        a.parentName,
        studentPlanById(a.planId).name,
        a.cycle === "annual" ? "Yıllık" : "Aylık",
        String(subscriptionMrr(a)),
        a.status === "paid" ? "Ödendi" : a.status === "pending" ? "Bekliyor" : "Başarısız",
        a.nextDueDays < 0 ? `${-a.nextDueDays} gün gecikti` : `${a.nextDueDays} gün`,
      ]);
    });
    downloadCSV("sube-tahsilat.csv", rows);
    toast("Tahsilat listesi indirildi", { icon: "ki-cloud-download" });
  }

  async function remind(sub: StudentSubscription) {
    await mutate({ kind: "sendPaymentReminder", subscriptionId: sub.id });
    setReminded((prev) => new Set(prev).add(sub.id));
    toast(sub.studentName + " için ödeme hatırlatması gönderildi", { icon: "ki-send" });
  }

  return (
    <div className="stack rise">
      <UkPageHead
        title="Gelir & Tahsilat"
        sub={isFr ? "Hangi şubeden ne kazandığını şube şube takip et" : "Şubenin abonelik geliri, tahsilat durumu ve platform ücreti"}
        actions={
          <div className="row" style={{ gap: 9 }}>
            <OrgSwitcher />
            <button type="button" className="btn btn-light" onClick={exportCsv}>
              <Icon name="download" size={16} />Dışa aktar
            </button>
          </div>
        }
      />

      <div className="grid g-4">
        <StatCard icon="banknote" tone="success" value={tl(totalCollect)} label="Aylık brüt tahsilat" delta="+%6,2" />
        <StatCard icon="card" tone="danger" value={tl(platformFee)} label="Platform ücreti" />
        <StatCard icon="card" tone="primary" value={tl(net)} label="Net gelir" />
        <StatCard icon="cap" tone="info" value={tl(Math.round(totalCollect / Math.max(1, o.seats.used)))} label="Öğrenci başına" />
      </div>

      {isFr ? (
        <UkSection
          title="Şube bazında gelir"
          sub={`En çok kazandıran: ${best?.name ?? "—"} · öğrenci başına lider: ${topPer?.name ?? "—"}`}
          action={
            <div className="seg" style={{ width: "fit-content" }}>
              <button type="button" className={branchSort === "collect" ? "on" : ""} onClick={() => setBranchSort("collect")}>Tahsilat</button>
              <button type="button" className={branchSort === "per" ? "on" : ""} onClick={() => setBranchSort("per")}>Öğrenci başına</button>
              <button type="button" className={branchSort === "growth" ? "on" : ""} onClick={() => setBranchSort("growth")}>Büyüme</button>
            </div>
          }
        >
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            {sortedBranches.map((r) => (
              <div key={r.id} className="lrow" style={{ alignItems: "stretch", padding: "13px 15px", flexDirection: "column", gap: 9 }}>
                <div className="between" style={{ alignItems: "center" }}>
                  <div className="row" style={{ gap: 11, minWidth: 0 }}>
                    <span className="org-logo" style={{ width: 34, height: 34, background: o.tone, borderRadius: 10 }}><Icon name="building" size={16} /></span>
                    <div style={{ minWidth: 0 }}>
                      <b style={{ fontSize: 13.5 }}>{r.name}</b>
                      <div className="muted" style={{ fontSize: 11.5 }}>{r.city} · {r.students} öğrenci</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <b className="tnum" style={{ fontSize: 15 }}>{tl(r.collect)}</b>
                    <div className="row" style={{ gap: 4, justifyContent: "flex-end", fontSize: 11.5, fontWeight: 700, color: r.growth >= 0 ? "var(--success)" : "var(--danger)" }}>
                      <Icon name={r.growth >= 0 ? "arrowUp" : "arrowDown"} size={12} />%{Math.abs(r.growth)}
                    </div>
                  </div>
                </div>
                <div className="meter-bar"><span style={{ width: `${Math.round((r.collect / maxCollect) * 100)}%`, background: o.tone }} /></div>
                <div className="row" style={{ gap: 18, flexWrap: "wrap", fontSize: 11.5 }}>
                  <span className="muted">Pay: <b className="tnum" style={{ color: "var(--text)" }}>%{r.share}</b></span>
                  <span className="muted">Öğrenci başına: <b className="tnum" style={{ color: "var(--text)" }}>{tl(r.per)}</b></span>
                  <span className="muted">Platform payı: <b className="tnum" style={{ color: "var(--text)" }}>{tl(r.feeShare)}</b></span>
                  <span className="muted">Net kâr: <b className="tnum" style={{ color: "var(--success)" }}>{tl(r.profit)}</b></span>
                </div>
              </div>
            ))}
          </div>
        </UkSection>
      ) : null}

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
              center={{ v: `%${Math.round((net / totalCollect) * 100)}`, l: "net kâr" }}
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

      {aboneler.length > 0 ? (
        <>
          <div className="grid g-4">
            <StatCard icon="banknote" tone="primary" value={tl(mrr || trendBase)} label="Abonelik MRR" delta="+%7,1" />
            <StatCard icon="users" tone="success" value={`${aktif}/${aboneler.length}`} label="Aktif abonelik" />
            <StatCard icon="alert" tone="warning" value={tl(gecikenTutar)} label={`Bekleyen · ${geciken.length} öğrenci`} />
            <StatCard icon="building" tone="info" value={tl(platformFee)} label="Platform ücreti" />
          </div>
          <div className="rev-split">
        <UkSection title="Aylık Gelir Trendi" sub="Son 6 ay · şube toplam tahsilatı" className="rev-chart-card">
          <div className="card-body">
            <div className="rev-bars">
              {REV_TREND.map((r, i) => {
                const v = Math.round(trendBase * r.v);
                return (
                  <div key={r.ay} className="rev-bar-col">
                    <div className="rev-bar-wrap">
                      <span className="rev-bar-val tnum">{Math.round(v / 1000)}B</span>
                      <div
                        className="rev-bar"
                        style={{
                          height: `${(v / maxV) * 100}%`,
                          background: i === REV_TREND.length - 1 ? "var(--primary)" : "var(--primary-soft)",
                        }}
                      />
                    </div>
                    <span className="rev-bar-ay muted">{r.ay}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </UkSection>

        <UkSection title="Platform Aboneliği" sub="Kurumun Uyanık Koç kullanım planı" className="rev-platform-card">
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            <div className="plat-plan">
              <span className="badge badge-info" style={{ height: 22 }}>Kurumsal</span>
              <div className="row" style={{ gap: 6, marginTop: 8 }}>
                <b style={{ fontSize: 19, fontWeight: 800 }} className="tnum">{tl(platformFee)}</b>
                <span className="muted" style={{ fontSize: 12 }}>/ay · {o.seats.total} öğrenciye kadar</span>
              </div>
            </div>
            <div className="plat-rows">
              <div className="plat-row"><span className="muted">Kullanım</span><b>{o.seats.used} / {o.seats.total} öğrenci</b></div>
              <div className="plat-meter"><span style={{ width: `${Math.min(100, (o.seats.used / o.seats.total) * 100)}%` }} /></div>
              <div className="plat-row"><span className="muted">Sonraki ödeme</span><b>{new Date(o.renewsAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</b></div>
              <div className="plat-row"><span className="muted">Ödeme yöntemi</span><b className="row" style={{ gap: 6 }}><CardBrandBadge brand="mastercard" size="sm" /> •5571</b></div>
            </div>
            <button type="button" className="btn btn-outline" style={{ width: "100%" }} onClick={() => toast("Kapasite yükseltme talebin alındı", { icon: "ki-office-bag" })}>
              <Icon name="arrowUp" size={15} />Kapasiteyi yükselt
            </button>
          </div>
        </UkSection>
      </div>

        <UkSection
          title="Öğrenci Tahsilatları"
          sub="Abonelik bazında tahsilat durumu"
          action={
            <div className="seg" style={{ width: "fit-content" }}>
              <button type="button" className={filter === "all" ? "on" : ""} onClick={() => setFilter("all")}>Tümü</button>
              <button type="button" className={filter === "paid" ? "on" : ""} onClick={() => setFilter("paid")}>Ödendi</button>
              <button type="button" className={filter === "due" ? "on" : ""} onClick={() => setFilter("due")}>Bekleyen</button>
            </div>
          }
        >
          <div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
            <table className="tbl" style={{ minWidth: 680 }}>
              <thead>
                <tr>
                  <th>Öğrenci</th>
                  <th>Veli</th>
                  <th>Plan</th>
                  <th style={{ textAlign: "right" }}>Aylık</th>
                  <th style={{ textAlign: "center" }}>Sonraki</th>
                  <th style={{ textAlign: "center" }}>Durum</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {list.map((a) => {
                  const p = studentPlanById(a.planId);
                  const st =
                    a.status === "paid"
                      ? (["success", "Ödendi"] as const)
                      : a.status === "pending"
                        ? (["warning", "Yaklaşıyor"] as const)
                        : (["danger", "Başarısız"] as const);
                  const overdue = a.nextDueDays < 0;
                  const wasReminded = reminded.has(a.id) || a.remindedAt != null;
                  return (
                    <tr key={a.id}>
                      <td>
                        <div className="row" style={{ gap: 9 }}>
                          <UkAvatar name={a.studentName} size={30} />
                          <b style={{ fontSize: 13, fontWeight: 700 }}>{a.studentName}</b>
                        </div>
                      </td>
                      <td><span className="muted" style={{ fontSize: 12.5 }}>{a.parentName}</span></td>
                      <td>
                        <div className="row" style={{ gap: 7 }}>
                          <span className="plan-dot" style={{ background: p.color }} />
                          <span style={{ fontSize: 12.5, fontWeight: 600 }}>{p.name}</span>
                          <span className="muted" style={{ fontSize: 11 }}>{a.cycle === "annual" ? "Yıllık" : "Aylık"}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: "right" }}><span className="tnum" style={{ fontWeight: 700 }}>{tl(subscriptionMrr(a))}</span></td>
                      <td style={{ textAlign: "center" }}>
                        <span className="tnum" style={{ fontSize: 12.5, color: overdue ? "var(--danger)" : "var(--muted)", fontWeight: overdue ? 700 : 500 }}>
                          {overdue ? `${-a.nextDueDays} gün gecikti` : `${a.nextDueDays} gün`}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}><span className={`badge badge-${st[0]}`} style={{ height: 22 }}>{st[1]}</span></td>
                      <td style={{ textAlign: "right" }}>
                        {a.status !== "paid" ? (
                          <button
                            type="button"
                            className="btn btn-light btn-sm"
                            disabled={wasReminded}
                            style={wasReminded ? { opacity: 0.6 } : undefined}
                            onClick={() => void remind(a)}
                          >
                            <Icon name={wasReminded ? "check" : "send"} size={14} />
                            {wasReminded ? "Hatırlatıldı" : "Hatırlat"}
                          </button>
                        ) : (
                          <button type="button" className="icon-btn" style={{ width: 32, height: 32 }} title="Makbuz" aria-label="Makbuz" onClick={() => toast("Makbuz indirildi", { icon: "ki-cloud-download" })}>
                            <Icon name="receipt" size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </UkSection>
        </>
      ) : (
        <UkSection title="Şube bazında tahsilat">
          <div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
            <table className="tbl" style={{ minWidth: 560 }}>
              <thead>
                <tr>
                  <th>Şube</th>
                  <th>Öğrenci</th>
                  <th style={{ textAlign: "right" }}>Tahsilat</th>
                  <th style={{ textAlign: "right" }}>Öğrenci başına</th>
                </tr>
              </thead>
              <tbody>
                {o.branches.map((b) => (
                  <tr key={b.id}>
                    <td><b style={{ fontSize: 13 }}>{b.name}</b></td>
                    <td><span className="tnum">{b.students}</span></td>
                    <td style={{ textAlign: "right" }}><span className="tnum" style={{ fontWeight: 700 }}>{tl(b.collect)}</span></td>
                    <td style={{ textAlign: "right" }}><span className="tnum muted">{tl(Math.round(b.collect / Math.max(1, b.students)))}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </UkSection>
      )}
    </div>
  );
}
