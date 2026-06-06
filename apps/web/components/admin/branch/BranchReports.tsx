// Kurum — Raporlar (zip-16 v2 rapor oluşturucu). apps/web/components/admin/branch/BranchReports.tsx
"use client";

import { useState } from "react";

import { Donut, EmptyState, Icon, Meter, RankBars, StatCard } from "@/components/admin/AdminKit";
import { useAdminStore } from "@/components/admin/AdminStore";
import { getActiveOrg } from "@/components/admin/selectors";
import { OrgSwitcher } from "./OrgSwitcher";
import { UkAvatar } from "@/components/design/UkAvatar";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import { downloadCSV, downloadText } from "@/lib/admin/csv";
import { tl } from "@/lib/admin/format";
import {
  buildReportContext,
  buildReportCsvRows,
  buildReportLines,
  REPORT_PERIODS,
  REPORT_SECTIONS,
  type ReportPeriodKey,
  type ReportSectionKey,
  type ReportSelection,
} from "@/lib/admin/reports";

const DEFAULT_SEL: ReportSelection = {
  ozet: true,
  net: true,
  brans: true,
  devam: false,
  gelir: true,
  koc: false,
  risk: true,
};

export function BranchReports() {
  const { snapshot, activeOrgId, toast } = useAdminStore();
  const [scope, setScope] = useState("all");
  const [period, setPeriod] = useState<ReportPeriodKey>("donem");
  const [fmt, setFmt] = useState<"pdf" | "csv">("pdf");
  const [sel, setSel] = useState<ReportSelection>(DEFAULT_SEL);

  if (!snapshot) return <div className="card card-pad muted">Yükleniyor…</div>;

  const o = getActiveOrg(snapshot, activeOrgId);
  const ctx = buildReportContext(o, scope, period);
  const chosen = REPORT_SECTIONS.filter((s) => sel[s.key]);
  const toggle = (k: ReportSectionKey) => setSel((p) => ({ ...p, [k]: !p[k] }));

  function generate() {
    if (chosen.length === 0) {
      toast("En az bir bölüm seç", { icon: "ki-information-2", tone: "warning" });
      return;
    }
    const base = "rapor-" + (ctx.branchName ? ctx.branchName.replace(/\s+/g, "-").toLowerCase() : "kurum");
    if (fmt === "csv") {
      downloadCSV(base + ".csv", buildReportCsvRows(ctx, sel));
    } else {
      downloadText(base + ".txt", buildReportLines(ctx, sel).join("\n"));
    }
    toast("Rapor oluşturuldu ve indirildi", { icon: "ki-cloud-download" });
  }

  return (
    <div className="stack rise">
      <UkPageHead
        title="Raporlar"
        sub="İstediğin kapsamı ve bölümleri seç, kuruma özel rapor oluştur"
        actions={<OrgSwitcher />}
      />

      <div className="grid g-4">
        <StatCard icon="target" tone="success" value={ctx.avgNet} label="Ortalama net" delta="+4,1" />
        <StatCard icon="trend" tone="primary" value="+%12" label="3 aylık gelişim" />
        <StatCard icon="checkCircle" tone="info" value={`%${ctx.avgAttend}`} label="Devam oranı" />
        <StatCard icon="alert" tone="danger" value={ctx.risk.length} label="Risk altında" />
      </div>

      <div className="grid col-rail">
        <div className="card" style={{ alignSelf: "start" }}>
          <div className="card-head">
            <div>
              <h3>Rapor oluşturucu</h3>
              <div className="sub">Kapsam, bölümler ve biçimi seç</div>
            </div>
          </div>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span className="muted" style={{ fontSize: 11.5, fontWeight: 600 }}>Kapsam</span>
              <select className="input" value={scope} onChange={(e) => setScope(e.target.value)}>
                <option value="all">Tüm kurum</option>
                {o.branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span className="muted" style={{ fontSize: 11.5, fontWeight: 600 }}>Dönem</span>
              <div className="seg" style={{ flexWrap: "wrap", width: "fit-content" }}>
                {REPORT_PERIODS.map(([k, l]) => (
                  <button key={k} type="button" className={period === k ? "on" : ""} onClick={() => setPeriod(k)}>
                    {l}
                  </button>
                ))}
              </div>
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span className="muted" style={{ fontSize: 11.5, fontWeight: 600 }}>Bölümler</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {REPORT_SECTIONS.map((s) => {
                  const on = sel[s.key];
                  return (
                    <button
                      key={s.key}
                      type="button"
                      className="src-item"
                      style={{
                        background: on ? "var(--primary-soft)" : undefined,
                        borderColor: on ? "var(--primary)" : undefined,
                      }}
                      onClick={() => toggle(s.key)}
                    >
                      <span
                        className="lr-icon"
                        style={{
                          width: 32,
                          height: 32,
                          background: on ? "var(--primary)" : "var(--surface-3)",
                          color: on ? "#fff" : "var(--muted)",
                        }}
                      >
                        <Icon name={s.icon} size={15} />
                      </span>
                      <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: on ? "var(--primary-600)" : "var(--text)" }}>{s.label}</div>
                        <div className="muted" style={{ fontSize: 11 }}>{s.desc}</div>
                      </div>
                      <span className={`chk sm${on ? " done" : ""}`}><Icon name="check" size={11} /></span>
                    </button>
                  );
                })}
              </div>
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span className="muted" style={{ fontSize: 11.5, fontWeight: 600 }}>Biçim</span>
              <div className="seg" style={{ width: "fit-content" }}>
                <button type="button" className={fmt === "pdf" ? "on" : ""} onClick={() => setFmt("pdf")}>
                  <Icon name="receipt" size={15} />Metin / PDF
                </button>
                <button type="button" className={fmt === "csv" ? "on" : ""} onClick={() => setFmt("csv")}>
                  <Icon name="chart" size={15} />CSV / Excel
                </button>
              </div>
            </label>
            <button type="button" className="btn btn-primary" disabled={chosen.length === 0} onClick={generate}>
              <Icon name="download" size={16} />Raporu oluştur ({chosen.length} bölüm)
            </button>
          </div>
        </div>

        <div className="stack">
          <UkSection title="Önizleme" sub={`${ctx.branchName || "Tüm kurum"} · ${ctx.periodLabel}`}>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {chosen.length === 0 ? (
                <EmptyState icon="clipboard" title="Bölüm seçilmedi" sub="Soldan en az bir bölüm seç" />
              ) : null}
              {sel.ozet ? (
                <div className="grid g-2" style={{ gap: 10 }}>
                  {[
                    ["Öğrenci", ctx.students.length],
                    ["Koç", ctx.coaches.length],
                    ["Ortalama net", ctx.avgNet],
                    ["Devam", `%${ctx.avgAttend}`],
                  ].map(([k, v]) => (
                    <div key={k} className="kpi-row" style={{ padding: "11px 14px", border: "1px solid var(--border)", borderRadius: 11 }}>
                      <span className="muted" style={{ fontSize: 12 }}>{k}</span>
                      <b className="tnum">{v}</b>
                    </div>
                  ))}
                </div>
              ) : null}
              {sel.net ? (
                <div>
                  <div className="muted" style={{ fontSize: 11.5, fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: ".03em" }}>Net dağılımı</div>
                  <div className="row" style={{ gap: 20, alignItems: "center", flexWrap: "wrap" }}>
                    <Donut slices={ctx.dist} center={{ v: ctx.students.length, l: "öğrenci" }} />
                    <LegendInline items={ctx.dist} />
                  </div>
                </div>
              ) : null}
              {sel.brans ? (
                <div>
                  <div className="muted" style={{ fontSize: 11.5, fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: ".03em" }}>Branş bazında ortalama net</div>
                  <RankBars items={ctx.subjects} max={40} color={o.tone} />
                </div>
              ) : null}
              {sel.devam ? (
                <div>
                  <div className="muted" style={{ fontSize: 11.5, fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: ".03em" }}>Devam oranı</div>
                  <Meter icon="calendar" label="Ortalama katılım" used={ctx.avgAttend} total={100} unit="%" />
                </div>
              ) : null}
              {sel.gelir ? (
                <div>
                  <div className="muted" style={{ fontSize: 11.5, fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: ".03em" }}>Gelir özeti</div>
                  <div className="grid g-3" style={{ gap: 10 }}>
                    <div className="kpi-row" style={{ padding: "11px 14px", border: "1px solid var(--border)", borderRadius: 11 }}><span className="muted" style={{ fontSize: 12 }}>Tahsilat</span><b className="tnum">{tl(ctx.collect)}</b></div>
                    <div className="kpi-row" style={{ padding: "11px 14px", border: "1px solid var(--border)", borderRadius: 11 }}><span className="muted" style={{ fontSize: 12 }}>Platform</span><b className="tnum">{tl(ctx.fee)}</b></div>
                    <div className="kpi-row" style={{ padding: "11px 14px", border: "1px solid var(--border)", borderRadius: 11 }}><span className="muted" style={{ fontSize: 12 }}>Net</span><b className="tnum" style={{ color: "var(--success)" }}>{tl(ctx.collect - ctx.fee)}</b></div>
                  </div>
                </div>
              ) : null}
              {sel.koc ? (
                <div>
                  <div className="muted" style={{ fontSize: 11.5, fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: ".03em" }}>Koç performansı (ilk 5)</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {ctx.coaches.slice(0, 5).map((c) => (
                      <div key={c.id} className="between" style={{ fontSize: 12.5 }}>
                        <span className="row" style={{ gap: 8 }}>
                          <UkAvatar name={c.name} size={26} />
                          {c.name}
                        </span>
                        <span className="row" style={{ gap: 12 }}>
                          <span className="muted tnum">{c.students} öğr.</span>
                          <span className="row tnum" style={{ gap: 3, fontWeight: 700 }}>
                            <Icon name="star" size={12} fill style={{ color: "var(--warning)" }} />
                            {c.rating}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              {sel.risk ? (
                <div>
                  <div className="muted" style={{ fontSize: 11.5, fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: ".03em" }}>Risk listesi ({ctx.risk.length})</div>
                  {ctx.risk.length === 0 ? (
                    <p className="muted" style={{ fontSize: 12.5 }}>Risk altında öğrenci yok.</p>
                  ) : (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                      {ctx.risk.slice(0, 12).map((s) => (
                        <span key={s.id} className="badge badge-danger" style={{ height: 24 }}>{s.name}</span>
                      ))}
                      {ctx.risk.length > 12 ? <span className="badge" style={{ height: 24 }}>+{ctx.risk.length - 12}</span> : null}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </UkSection>
        </div>
      </div>
    </div>
  );
}

function LegendInline({ items }: { items: { l: string; v: number; color: string }[] }) {
  return (
    <div className="legend" style={{ flex: 1, minWidth: 160 }}>
      {items.map((d) => (
        <div key={d.l} className="legend-item">
          <span className="sw" style={{ background: d.color }} />
          <span>{d.l}</span>
          <span className="lv tnum">{d.v}</span>
        </div>
      ))}
    </div>
  );
}
