"use client";

import { useCallback, useEffect, useState } from "react";

import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import { UkStatCard } from "@/components/design/UkStatCard";
import { formatExamNet } from "@uyanik/shared";
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

  return (
    <div className="stack rise" data-testid="coach-reports-panel">
      <UkPageHead title="Raporlar" sub="Ogrenci performans ozeti" />

      <div className="grid g-4">
        <UkStatCard icon="ki-people" tone="primary" value={report?.rosterCount ?? "—"} label="Ogrenci sayisi" />
        <UkStatCard
          icon="ki-chart-simple"
          tone="info"
          value={report?.avgExamNet != null ? formatExamNet(report.avgExamNet) : "—"}
          label="Ortalama net"
        />
        <UkStatCard
          icon="ki-check-circle"
          tone="success"
          value={report ? `${report.assignmentCompletionRate}%` : "—"}
          label="Odev tamamlama"
        />
        <UkStatCard icon="ki-calendar-tick" tone="warning" value={report?.pendingAppointments ?? "—"} label="Bekleyen randevu" />
      </div>

      <UkSection title="Ogrenci tablosu" sub={`${report?.students.length ?? 0} ogrenci`}>
        <div className="card-body" style={{ overflowX: "auto" }}>
          {isLoading ? (
            <p className="muted" style={{ fontSize: 13 }}>
              Yukleniyor...
            </p>
          ) : !report || report.students.length === 0 ? (
            <p className="muted" style={{ fontSize: 13 }}>
              Ogrenci verisi yok.
            </p>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Ogrenci</th>
                  <th>Son net</th>
                  <th>Odev orani</th>
                  <th>Konu orani</th>
                </tr>
              </thead>
              <tbody>
                {report.students.map((row) => (
                  <tr key={row.studentId}>
                    <td>{row.displayName}</td>
                    <td className="tnum">{row.latestNet != null ? formatExamNet(row.latestNet) : "—"}</td>
                    <td className="tnum">{row.assignmentRate}%</td>
                    <td className="tnum">{row.topicRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </UkSection>
    </div>
  );
}
