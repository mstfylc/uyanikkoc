"use client";

import { KiIcon } from "@/components/design/KiIcon";
import { useCallback, useEffect, useState } from "react";

import { UkAvatar } from "@/components/design/UkAvatar";
import { UkBadge } from "@/components/design/UkBadge";
import { UkBarChart } from "@/components/design/UkBarChart";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import { UkSparkline } from "@/components/design/UkSparkline";
import { UkStatCard } from "@/components/design/UkStatCard";
import type { CoachReportSummary } from "@uyanik/database";

export function CoachReportsPanel() {
  const [report, setReport] = useState<CoachReportSummary | null>(null);
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

  async function approveReport(id: string) {
    const response = await fetch("/api/coach/reports", {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId: id }),
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

  const pending = report?.pendingReports ?? 0;
  const weekAvg =
    report && report.weekCompletion.length > 0
      ? Math.round(report.weekCompletion.reduce((sum, item) => sum + item.value, 0) / report.weekCompletion.length)
      : 0;

  return (
    <div className="stack rise" data-testid="coach-reports-panel">
      <UkPageHead
        title="Raporlar"
        sub="Sinif performansi ve veli raporlari"
        actions={
          pending > 0 ? (
            <button type="button" className="btn btn-primary btn-sm" onClick={() => void approveAll()}>
              <KiIcon name="ki-check" size={16} />
              Tumunu onayla ({pending})
            </button>
          ) : (
            <UkBadge tone="success">Tumu onaylandi</UkBadge>
          )
        }
      />

      <div className="grid g-4">
        <UkStatCard icon="ki-notepad-edit" tone="warning" value={pending} label="Onay bekleyen rapor" />
        <UkStatCard
          icon="ki-flag"
          tone="success"
          value={report ? `${report.assignmentCompletionRate}%` : "—"}
          label="Sinif tamamlama"
        />
        <UkStatCard
          icon="ki-chart-line-up"
          tone="primary"
          value={report ? `+${report.classNetGain}` : "—"}
          label="Sinif net artisi"
        />
        <UkStatCard icon="ki-information-2" tone="danger" value={report?.atRiskCount ?? "—"} label="Risk altinda" />
      </div>

      <UkSection
        title="Sinif Net Gelisimi"
        sub="Tum ogrencilerin ortalama neti"
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
              Yukleniyor...
            </p>
          ) : report?.classNetTrend.length ? (
            <UkSparkline data={report.classNetTrend} height={80} />
          ) : (
            <p className="muted" style={{ fontSize: 13 }}>
              Trend icin yeterli deneme yok.
            </p>
          )}
        </div>
      </UkSection>

      <div className="grid col-main">
        <UkSection title="Veli Raporlari" sub={`${pending} onay bekliyor`}>
          <div className="card-body" style={{ padding: 0 }}>
            {isLoading ? (
              <p className="muted" style={{ padding: 20, fontSize: 13 }}>
                Yukleniyor...
              </p>
            ) : (
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Ogrenci / Veli</th>
                    <th>Hafta</th>
                    <th>Tamamlama</th>
                    <th>Net</th>
                    <th style={{ textAlign: "right" }}>Islem</th>
                  </tr>
                </thead>
                <tbody>
                  {(report?.parentReports ?? []).map((row) => {
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
                            <UkBadge tone="success">Onaylandi</UkBadge>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-light btn-sm"
                              onClick={() => void approveReport(row.id)}
                            >
                              Onayla & Gonder
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
            title="Haftalik Tamamlama"
            sub="Sinif gunluk ortalamasi"
            action={<UkBadge tone="primary">{weekAvg}%</UkBadge>}
          >
            <div className="card-body">
              <UkBarChart data={report?.weekCompletion ?? []} max={100} peakIdx={4} />
            </div>
          </UkSection>

          <UkSection title="Risk Dagilimi">
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
                      <span className="spct tnum">{row.count} ogrenci</span>
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
    </div>
  );
}
