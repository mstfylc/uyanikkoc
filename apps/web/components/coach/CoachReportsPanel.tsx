"use client";

import { KiIcon } from "@/components/design/KiIcon";
import { useCallback, useEffect, useMemo, useState } from "react";

import { UkAvatar } from "@/components/design/UkAvatar";
import { UkBadge } from "@/components/design/UkBadge";
import { UkBarChart } from "@/components/design/UkBarChart";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import { UkSparkline } from "@/components/design/UkSparkline";
import { CoachRatingsSummary } from "@/components/coach/CoachRatingsSummary";
import { ReportDetailModal } from "@/components/coach/ReportDetailModal";
import { UkStatCard } from "@/components/design/UkStatCard";
import type { CoachReportSummary, ParentReportRecord } from "@uyanik/database";

export function CoachReportsPanel() {
  const [report, setReport] = useState<CoachReportSummary | null>(null);
  const [detailReport, setDetailReport] = useState<ParentReportRecord | null>(null);
  const [reportFilter, setReportFilter] = useState<"all" | "pending" | "sent">("all");
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    const response = await fetch("/api/coach/reports", { credentials: "same-origin" });
    if (response.ok) {
      const data = (await response.json()) as { report: CoachReportSummary };
      setReport(data.report);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function approveReport(id: string, note = "") {
    const response = await fetch(`/api/coach/reports/${id}/approve`, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    });
    if (response.ok) {
      await load();
    }
  }

  async function approveAll() {
    const response = await fetch("/api/coach/reports", {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approveAll: true }),
    });
    if (response.ok) {
      await load();
    }
  }

  const [isGenerating, setIsGenerating] = useState(false);

  async function generateReports() {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/coach/reports", {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generate: true }),
      });
      if (response.ok) {
        await load();
      }
    } finally {
      setIsGenerating(false);
    }
  }

  const pending = report?.pendingReports ?? 0;
  const weekAvg =
    report && report.weekCompletion.length > 0
      ? Math.round(report.weekCompletion.reduce((sum, item) => sum + item.value, 0) / report.weekCompletion.length)
      : 0;

  const filteredReports = useMemo(() => {
    const rows = report?.parentReports ?? [];
    if (reportFilter === "pending") return rows.filter((row) => row.status === "pending");
    if (reportFilter === "sent") return rows.filter((row) => row.status === "approved");
    return rows;
  }, [report?.parentReports, reportFilter]);

  const topGainer = useMemo(() => {
    if (!report?.students.length) return null;
    return [...report.students].sort((a, b) => (b.examTrend.at(-1) ?? 0) - (a.examTrend.at(-1) ?? 0))[0];
  }, [report?.students]);

  const needsAttention = useMemo(() => {
    if (!report?.students.length) return null;
    return report.students.find((student) => student.risk === "critical" || student.risk === "attention") ?? null;
  }, [report?.students]);

  return (
    <div className="stack rise" data-testid="coach-reports-panel">
      <UkPageHead
        title="Raporlar"
        sub="Sınıf performansı ve veli raporları"
        actions={
          <div className="hstack" style={{ gap: 8 }}>
            <button
              type="button"
              className="btn btn-light btn-sm"
              onClick={() => void generateReports()}
              disabled={isGenerating}
            >
              <KiIcon name="ki-notepad-edit" size={16} />
              {isGenerating ? "Oluşturuluyor…" : "Rapor Oluştur"}
            </button>
            {pending > 0 ? (
              <button type="button" className="btn btn-primary btn-sm" onClick={() => void approveAll()}>
                <KiIcon name="ki-check" size={16} />
                Tümünü onayla ({pending})
              </button>
            ) : (
              <UkBadge tone="success">Tümü onaylandı</UkBadge>
            )}
          </div>
        }
      />

      <div className="grid g-4">
        <UkStatCard icon="ki-notepad-edit" tone="warning" value={pending} label="Onay bekleyen rapor" />
        <UkStatCard
          icon="ki-flag"
          tone="success"
          value={report ? `${report.assignmentCompletionRate}%` : "—"}
          label="Sınıf tamamlama"
        />
        <UkStatCard
          icon="ki-chart-line-up"
          tone="primary"
          value={report ? `+${report.classNetGain}` : "—"}
          label="Sınıf net artışı"
        />
        <UkStatCard icon="ki-information-2" tone="danger" value={report?.atRiskCount ?? "—"} label="Risk altında" />
      </div>

      <div className="grid g-2">
        <UkSection title="En çok gelişen" sub="Son net trendine göre">
          <div className="card-body">
            {topGainer ? (
              <div className="row" style={{ gap: 10 }}>
                <UkAvatar name={topGainer.displayName} size={40} />
                <div>
                  <b>{topGainer.displayName}</b>
                  <div className="muted" style={{ fontSize: 12 }}>
                    Net {topGainer.latestNet ?? "—"} · %{topGainer.assignmentRate} tamamlama
                  </div>
                </div>
              </div>
            ) : (
              <p className="muted" style={{ fontSize: 13 }}>Veri yok</p>
            )}
          </div>
        </UkSection>
        <UkSection title="İlgi gerektiren" sub="Risk bandına göre">
          <div className="card-body">
            {needsAttention ? (
              <div className="row" style={{ gap: 10 }}>
                <UkAvatar name={needsAttention.displayName} size={40} />
                <div>
                  <b>{needsAttention.displayName}</b>
                  <div className="muted" style={{ fontSize: 12 }}>
                    %{needsAttention.assignmentRate} tamamlama · {needsAttention.risk}
                  </div>
                </div>
              </div>
            ) : (
              <p className="muted" style={{ fontSize: 13 }}>Risk altında öğrenci yok</p>
            )}
          </div>
        </UkSection>
      </div>

      <UkSection
        title="Sınıf Net Gelişimi"
        sub="Tüm öğrencilerin ortalama neti"
        action={
          report?.classNetTrend.length ? (
            <UkBadge tone="primary">
              {report.classNetTrend[report.classNetTrend.length - 1]} net
            </UkBadge>
          ) : null
        }
      >
        <div className="card-body">
          {isLoading ? (
            <p className="muted" style={{ fontSize: 13 }}>
              Yükleniyor...
            </p>
          ) : report?.classNetTrend.length ? (
            <UkSparkline data={report.classNetTrend} height={80} />
          ) : (
            <p className="muted" style={{ fontSize: 13 }}>
              Trend için yeterli deneme yok.
            </p>
          )}
        </div>
      </UkSection>

      <div className="grid col-main">
        <UkSection title="Veli Raporları" sub={`${pending} onay bekliyor`} action={
          <div className="filters">
            <button type="button" className={reportFilter === "all" ? "on" : ""} onClick={() => setReportFilter("all")}>Tümü</button>
            <button type="button" className={reportFilter === "pending" ? "on" : ""} onClick={() => setReportFilter("pending")}>Bekleyen</button>
            <button type="button" className={reportFilter === "sent" ? "on" : ""} onClick={() => setReportFilter("sent")}>Gönderilen</button>
          </div>
        }>
          <div className="card-body" style={{ padding: 0 }}>
            {isLoading ? (
              <p className="muted" style={{ padding: 20, fontSize: 13 }}>
                Yükleniyor...
              </p>
            ) : (
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Öğrenci / Veli</th>
                    <th>Hafta</th>
                    <th>Tamamlama</th>
                    <th>Net</th>
                    <th style={{ textAlign: "right" }}>Islem</th>
                  </tr>
                </thead>
                <tbody>
                  {(filteredReports).map((row) => {
                    const up = row.netDelta.startsWith("+");
                    return (
                      <tr key={row.id}>
                        <td>
                          <div className="name">
                            <UkAvatar name={row.studentName} size={34} />
                            <div>
                              <b>{row.studentName}</b>
                              <br />
                              <span>{row.parentName}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, whiteSpace: "nowrap" }}>
                            {row.week}
                          </span>
                        </td>
                        <td>
                          <span
                            className="tnum"
                            style={{
                              fontWeight: 700,
                              color:
                                row.completion >= 75
                                  ? "var(--success)"
                                  : row.completion >= 50
                                    ? "var(--warning)"
                                    : "var(--danger)",
                            }}
                          >
                            {row.completion}%
                          </span>
                        </td>
                        <td>
                          <span className={`delta ${up ? "up" : "down"}`}>
                            <KiIcon name={up ? "ki-arrow-up" : "ki-arrow-down"} size={12} />
                            {row.netDelta}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          {row.status === "approved" ? (
                            <UkBadge tone="success">Onaylandı</UkBadge>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-light btn-sm"
                              onClick={() => setDetailReport(row)}
                            >
                              Onayla & Gönder
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </UkSection>

        <div className="stack">
          <UkSection
            title="Haftalık Tamamlama"
            sub="Sınıf günlük ortalaması"
            action={<UkBadge tone="primary">{weekAvg}%</UkBadge>}
          >
            <div className="card-body">
              <UkBarChart data={report?.weekCompletion ?? []} max={100} peakIdx={4} />
            </div>
          </UkSection>

          <UkSection title="Risk Dağılımı">
            <div className="card-body subj">
              {(report?.riskDistribution ?? []).map((row) => {
                const pct = report?.rosterCount ? Math.round((row.count / report.rosterCount) * 100) : 0;
                return (
                  <div className="subj-row" key={row.band}>
                    <div className="between" style={{ marginBottom: 8 }}>
                      <span className="sname">
                        <span className="swatch" style={{ background: `var(--${row.tone})` }} />
                        {row.label}
                      </span>
                      <span className="spct tnum">{row.count} öğrenci</span>
                    </div>
                    <div className="bar thin">
                      <span style={{ width: `${pct}%`, background: `var(--${row.tone})` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </UkSection>
        </div>
      </div>

      <CoachRatingsSummary />

      <ReportDetailModal
        open={Boolean(detailReport)}
        report={detailReport}
        onClose={() => setDetailReport(null)}
        onApprove={async (note) => {
          if (detailReport) {
            await approveReport(detailReport.id, note);
          }
        }}
      />
    </div>
  );
}
