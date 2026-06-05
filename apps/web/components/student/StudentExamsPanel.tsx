"use client";

import { useCallback, useEffect, useState } from "react";

import { UkBadge } from "@/components/design/UkBadge";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import { UkStatCard } from "@/components/design/UkStatCard";
import { subjectColor } from "@/lib/design/subject-colors";
import {
  describeExamTrend,
  formatExamNet,
  RESULT_EXAM_TYPE_LABELS,
} from "@uyanik/shared";
import type { ExamResultRecord, ExamTrendSummary } from "@uyanik/database";

export function StudentExamsPanel() {
  const [exams, setExams] = useState<ExamResultRecord[]>([]);
  const [summary, setSummary] = useState<ExamTrendSummary | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    const response = await fetch("/api/student/exams", { credentials: "same-origin" });
    if (response.ok) {
      const data = (await response.json()) as {
        exams: ExamResultRecord[];
        summary: ExamTrendSummary;
      };
      setExams(data.exams);
      setSummary(data.summary);
      setSelectedId((current) => current ?? data.exams[0]?.id ?? null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const selected = exams.find((e) => e.id === selectedId) ?? null;

  return (
    <div className="stack rise" data-testid="student-exams-panel">
      <UkPageHead title="Denemeler" sub="Deneme sonuclarin ve performans trendi" />

      <div className="grid g-4">
        <UkStatCard
          icon="ki-chart-simple"
          tone="primary"
          value={summary?.latestNet != null ? formatExamNet(summary.latestNet) : "—"}
          label="Son deneme neti"
        />
        <UkStatCard icon="ki-chart-line-up" tone="info" value={summary?.examCount ?? 0} label="Toplam deneme" />
        <UkStatCard
          icon="ki-flag"
          tone="success"
          value={summary?.examType ? RESULT_EXAM_TYPE_LABELS[summary.examType] : "—"}
          label="Son sinav turu"
        />
        <UkStatCard
          icon="ki-arrow-up"
          tone={summary?.trend === "up" ? "success" : summary?.trend === "down" ? "danger" : "warning"}
          value={summary ? describeExamTrend(summary.trend) : "—"}
          label="Trend"
          delta={
            summary?.previousNet != null ? formatExamNet(summary.previousNet) : undefined
          }
          deltaDir={summary?.trend === "down" ? "down" : "up"}
        />
      </div>

      <div className="grid col-main">
        <UkSection title="Deneme listesi" sub={`${exams.length} kayit`}>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {isLoading ? (
              <p className="muted" style={{ fontSize: 13 }}>
                Yukleniyor...
              </p>
            ) : exams.length === 0 ? (
              <p className="muted" style={{ fontSize: 13 }}>
                Henuz deneme sonucu yok.
              </p>
            ) : (
              exams.map((exam) => {
                const active = exam.id === selectedId;
                return (
                  <button
                    key={exam.id}
                    type="button"
                    onClick={() => setSelectedId(exam.id)}
                    className={`lrow${active ? " done" : ""}`}
                    style={{ cursor: "pointer", border: "none", width: "100%", textAlign: "left" }}
                  >
                    <span className="lr-icon" style={{ background: "var(--surface-3)" }}>
                      <i className="ki-filled ki-chart-simple" />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="lr-title">{exam.label ?? RESULT_EXAM_TYPE_LABELS[exam.examType]}</div>
                      <div className="lr-meta">
                        <span className="d">{new Date(exam.takenAt).toLocaleDateString("tr-TR")}</span>
                        <UkBadge tone="primary">{RESULT_EXAM_TYPE_LABELS[exam.examType]}</UkBadge>
                      </div>
                    </div>
                    <span className="tnum" style={{ fontWeight: 800, fontSize: 16 }}>
                      {formatExamNet(exam.totalNet)}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </UkSection>

        <UkSection title="Ders detayi" sub={selected ? selected.label ?? "Secili deneme" : "Deneme secin"}>
          <div className="card-body">
            {!selected ? (
              <p className="muted" style={{ fontSize: 13 }}>
                Detay icin bir deneme secin.
              </p>
            ) : (
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Ders</th>
                    <th>Dogru</th>
                    <th>Yanlis</th>
                    <th>Net</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.subjects.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <span className="chip" style={{ height: 22, fontSize: 11, padding: "0 8px" }}>
                          <span className="swatch" style={{ background: subjectColor(row.subjectName) }} />
                          {row.subjectName}
                        </span>
                      </td>
                      <td className="tnum">{row.correct}</td>
                      <td className="tnum">{row.wrong}</td>
                      <td className="tnum" style={{ fontWeight: 700 }}>
                        {formatExamNet(row.net)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </UkSection>
      </div>
    </div>
  );
}
