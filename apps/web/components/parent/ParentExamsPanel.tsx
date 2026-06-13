"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import { UkStatCard } from "@/components/design/UkStatCard";
import {
  averageCategoryNets,
  buildCoachExamSessions,
} from "@/lib/design/coach-exam-sessions";
import {
  EXAM_CAT_COLOR,
  EXAM_CAT_MAX,
  EXAM_CAT_ORDER,
} from "@/lib/design/exam-categories";
import { formatExamNet } from "@uyanik/shared";
import type { ExamResultRecord, ExamTrendSummary } from "@uyanik/database";

function formatCategoryNet(value: number): string {
  return value.toFixed(1).replace(/\.0$/, "");
}

export function ParentExamsPanel() {
  const [exams, setExams] = useState<ExamResultRecord[]>([]);
  const [childName, setChildName] = useState("Öğrenci");
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    const response = await fetch("/api/parent/exams", { credentials: "same-origin" });
    if (response.ok) {
      const data = (await response.json()) as {
        exams: ExamResultRecord[];
        summary: ExamTrendSummary | null;
        childName?: string;
      };
      setExams(data.exams);
      if (data.childName) {
        setChildName(data.childName);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const latestExam = exams[0] ?? null;
  const sessions = useMemo(
    () =>
      buildCoachExamSessions(exams, [
        { studentId: latestExam?.studentId ?? "child", displayName: childName, email: "" },
      ]),
    [childName, exams, latestExam?.studentId],
  );
  const latestSession = sessions[0] ?? null;
  const studentRow = latestSession?.students[0] ?? null;
  const categoryAverages = studentRow ? averageCategoryNets([studentRow]) : null;

  if (!isLoading && exams.length === 0) {
    return (
      <div className="stack rise" data-testid="parent-exams-panel">
        <UkPageHead title="Deneme Sonuçları" sub={childName} />
        <div className="card">
          <div className="card-pad" style={{ padding: 40, textAlign: "center", color: "var(--muted)", fontSize: 13.5 }}>
            Henüz açıklanmış deneme sonucu yok.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stack rise" data-testid="parent-exams-panel">
      <UkPageHead
        title="Deneme Sonuçları"
        sub={`${childName} · ${latestSession?.name ?? "Deneme"}`}
      />

      <div className="grid g-4">
        <UkStatCard
          icon="ki-chart-simple"
          tone="primary"
          value={studentRow ? formatExamNet(studentRow.totalNet) : "—"}
          label="Toplam net"
        />
        <UkStatCard
          icon="ki-star"
          tone="success"
          value={studentRow?.score ?? "—"}
          label="Puan"
        />
        <UkStatCard
          icon="ki-chart-line-up"
          tone="info"
          value={studentRow?.rank ? studentRow.rank.toLocaleString("tr-TR") : "—"}
          label="Sıralama"
        />
        <UkStatCard
          icon="ki-people"
          tone="warning"
          value={latestSession?.students.length ?? 1}
          label="Katılan"
        />
      </div>

      <UkSection title="Ders Bazında Net" sub="Çocuğunuzun bu denemedeki dağılımı">
        <div className="card-body subj">
          {isLoading ? (
            <p className="muted" style={{ fontSize: 13 }}>
              Yükleniyor...
            </p>
          ) : categoryAverages && studentRow ? (
            EXAM_CAT_ORDER.map((category) => {
              const net = studentRow.byCat[category].net;
              return (
                <div className="subj-row" key={category}>
                  <div className="between" style={{ marginBottom: 7 }}>
                    <span className="sname">
                      <span className="swatch" style={{ background: EXAM_CAT_COLOR[category] }} />
                      {category}
                    </span>
                    <span className="tnum" style={{ fontWeight: 800, fontSize: 13 }}>
                      {formatCategoryNet(net)} / {EXAM_CAT_MAX[category]}
                    </span>
                  </div>
                  <div className="bar">
                    <span
                      style={{
                        width: `${(net / EXAM_CAT_MAX[category]) * 100}%`,
                        background: EXAM_CAT_COLOR[category],
                      }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <p className="muted" style={{ fontSize: 13 }}>
              Ders dağılımı hesaplanamadı.
            </p>
          )}
        </div>
      </UkSection>

      {exams.length > 1 ? (
        <UkSection title="Tüm Denemeler" sub="Çocuğunuzun içe aktarılan denemelerdeki ilerlemesi">
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {exams.slice(1, 5).map((exam) => (
              <div key={exam.id} className="between">
                <span style={{ fontSize: 13, fontWeight: 600 }}>{exam.label ?? new Date(exam.takenAt).toLocaleDateString("tr-TR")}</span>
                <span className="tnum" style={{ fontWeight: 800 }}>
                  {formatExamNet(exam.totalNet)} net
                </span>
              </div>
            ))}
          </div>
        </UkSection>
      ) : null}
    </div>
  );
}
