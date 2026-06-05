"use client";

import { useCallback, useEffect, useState } from "react";

import { UkBadge } from "@/components/design/UkBadge";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import { UkStatCard } from "@/components/design/UkStatCard";
import { formatExamNet, RESULT_EXAM_TYPE_LABELS } from "@uyanik/shared";
import type { ExamResultRecord, ExamTrendSummary } from "@uyanik/database";

export function ParentExamsPanel() {
  const [exams, setExams] = useState<ExamResultRecord[]>([]);
  const [summary, setSummary] = useState<ExamTrendSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    const response = await fetch("/api/parent/exams", { credentials: "same-origin" });
    if (response.ok) {
      const data = (await response.json()) as {
        exams: ExamResultRecord[];
        summary: ExamTrendSummary | null;
      };
      setExams(data.exams);
      setSummary(data.summary);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="stack rise" data-testid="parent-exams-panel">
      <UkPageHead title="Deneme Sonuclari" sub="Ogrencinin deneme performansi" />

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
          label="Sinav turu"
        />
        <UkStatCard icon="ki-arrow-up" tone="warning" value={exams.length} label="Kayit sayisi" />
      </div>

      <UkSection title="Deneme listesi" sub={`${exams.length} kayit`}>
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {isLoading ? (
            <p className="muted" style={{ fontSize: 13 }}>
              Yukleniyor...
            </p>
          ) : exams.length === 0 ? (
            <p className="muted" style={{ fontSize: 13 }}>
              Henuz deneme sonucu yok.
            </p>
          ) : (
            exams.map((exam) => (
              <div key={exam.id} className="lrow">
                <span className="lr-icon" style={{ background: "var(--surface-3)" }}>
                  <i className="ki-filled ki-chart-simple" />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="lr-title">{exam.label ?? RESULT_EXAM_TYPE_LABELS[exam.examType]}</div>
                  <div className="lr-meta">
                    <span className="d">{new Date(exam.takenAt).toLocaleDateString("tr-TR")}</span>
                    <UkBadge tone="primary">{RESULT_EXAM_TYPE_LABELS[exam.examType]}</UkBadge>
                    <span className="d">{exam.subjects.length} ders</span>
                  </div>
                </div>
                <span className="tnum" style={{ fontWeight: 800, fontSize: 16 }}>
                  {formatExamNet(exam.totalNet)} net
                </span>
              </div>
            ))
          )}
        </div>
      </UkSection>
    </div>
  );
}
