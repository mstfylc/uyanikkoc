"use client";

import { useCallback, useEffect, useState } from "react";

import { UkBadge } from "@/components/design/UkBadge";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import type { ParentReportRecord } from "@uyanik/database";
import type { ReportDetail } from "@uyanik/shared";

import { ParentReportDetailModal } from "./ParentReportDetailModal";

type ParentReportView = ParentReportRecord & { detail: ReportDetail };

export function ParentReportsPanel() {
  const [reports, setReports] = useState<ParentReportView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<ParentReportView | null>(null);

  const load = useCallback(async () => {
    const response = await fetch("/api/parent/reports", { credentials: "same-origin" });
    if (response.ok) {
      const data = (await response.json()) as { reports: ParentReportView[] };
      setReports(data.reports);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="stack rise" data-testid="parent-reports-panel">
      <UkPageHead title="Gelişim Raporları" sub="Koçunuzun onayladığı haftalık raporlar" />
      <UkSection title="Raporlar" sub={`${reports.length} kayıt`}>
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {isLoading ? (
            <p className="muted" style={{ fontSize: 13 }}>
              Yükleniyor...
            </p>
          ) : reports.length === 0 ? (
            <p className="muted" style={{ fontSize: 13 }}>
              Henüz onaylı rapor yok.
            </p>
          ) : (
            reports.map((report) => (
              <button
                key={report.id}
                type="button"
                className="lrow"
                style={{ width: "100%", textAlign: "left", cursor: "pointer" }}
                onClick={() => setSelected(report)}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="lr-title">
                    {report.studentName} · {report.week}
                  </div>
                  <div className="lr-meta">
                    <span className="d">Tamamlama: %{report.completion}</span>
                    <span className="d">Net: {report.netDelta}</span>
                    <span className="d">Çalışma: {report.detail.hours} saat</span>
                  </div>
                </div>
                <UkBadge tone="success">Onaylandı</UkBadge>
              </button>
            ))
          )}
        </div>
      </UkSection>

      <ParentReportDetailModal
        open={Boolean(selected)}
        report={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
