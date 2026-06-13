"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { KiIcon } from "@/components/design/KiIcon";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import { UkSparkline } from "@/components/design/UkSparkline";
import { UkStatCard } from "@/components/design/UkStatCard";
import { NetGainMap } from "@/components/shared/NetGainMap";
import { StudentExamAnalysis } from "@/components/student/StudentExamAnalysis";
import { StudentManualExamModal } from "@/components/student/StudentManualExamModal";
import { DenemeKayitModal } from "@/components/student/DenemeKayitModal";
import { OptikFormModal, OptikResultBadge } from "@/components/student/OptikFormModal";
import { UkBadge } from "@/components/design/UkBadge";
import { cargoBadgeLabel, cargoBadgeTone } from "@/lib/design/motivation-ui";
import { displaySubjectName, subjectColor } from "@/lib/design/subject-colors";
import {
  formatExamNet,
  RESULT_EXAM_TYPE_LABELS,
} from "@uyanik/shared";
import type { ExamResultRecord, ExamTrendSummary, OnlineExamRecord } from "@uyanik/database";

type ExamTab = "results" | "online" | "analysis";

const SUBJECT_NET_MAX: Record<string, number> = {
  Türkçe: 40,
  Turkce: 40,
  Matematik: 40,
  Fen: 20,
  Sosyal: 20,
  Fizik: 14,
  Kimya: 13,
  Biyoloji: 13,
};

function subjectNetMax(name: string): number {
  return SUBJECT_NET_MAX[name] ?? 40;
}

export function StudentExamsPanel() {
  const [exams, setExams] = useState<ExamResultRecord[]>([]);
  const [summary, setSummary] = useState<ExamTrendSummary | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<ExamTab>("results");
  const [manualOpen, setManualOpen] = useState(false);
  const [kayitOpen, setKayitOpen] = useState(false);
  const [onlineExams, setOnlineExams] = useState<OnlineExamRecord[]>([]);
  const [optikExam, setOptikExam] = useState<OnlineExamRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [onlineLoading, setOnlineLoading] = useState(false);

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

  const loadOnline = useCallback(async () => {
    setOnlineLoading(true);
    const response = await fetch("/api/student/online-exams", { credentials: "same-origin" });
    if (response.ok) {
      const data = (await response.json()) as { exams: OnlineExamRecord[] };
      setOnlineExams(data.exams);
    }
    setOnlineLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (tab === "online") {
      void loadOnline();
    }
  }, [tab, loadOnline]);

  const selected = exams.find((e) => e.id === selectedId) ?? null;
  const trendNets = useMemo(
    () =>
      [...exams]
        .sort((a, b) => new Date(a.takenAt).getTime() - new Date(b.takenAt).getTime())
        .map((exam) => exam.totalNet),
    [exams],
  );

  return (
    <div className="stack rise" data-testid="student-exams-panel">
      <UkPageHead
        title="Denemeler"
        sub="Deneme sonuçların ve net analizin"
        actions={
          <div className="row" style={{ gap: 8 }}>
            <button type="button" className="btn btn-light btn-sm" onClick={() => setKayitOpen(true)}>
              <KiIcon name="ki-calendar-tick" />
              Denemeye kayıt ol
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setManualOpen(true)}>
              <KiIcon name="ki-plus" />
              Sonuç gir
            </button>
          </div>
        }
      />

      <div className="seg" style={{ width: "fit-content" }}>
        <button type="button" className={tab === "results" ? "on" : ""} onClick={() => setTab("results")}>
          <KiIcon name="ki-chart-simple" />
          Sonuçlar
        </button>
        <button type="button" className={tab === "analysis" ? "on" : ""} onClick={() => setTab("analysis")}>
          <KiIcon name="ki-target" />
          Analiz
        </button>
        <button type="button" className={tab === "online" ? "on" : ""} onClick={() => setTab("online")}>
          <KiIcon name="ki-notepad" />
          Online Deneme
        </button>
      </div>

      <NetGainMap mode="student" />

      {tab === "results" ? (
        <div className="grid g-4">
          <UkStatCard icon="ki-chart-simple" tone="primary" value={summary?.examCount ?? 0} label="Toplam deneme" />
          <UkStatCard
            icon="ki-target"
            tone="info"
            value={summary?.latestNet != null ? formatExamNet(summary.latestNet) : "—"}
            label="Ortalama net"
          />
          <UkStatCard
            icon="ki-award"
            tone="success"
            value={summary?.latestNet != null ? formatExamNet(summary.latestNet) : "—"}
            label="En yüksek net"
          />
          <UkStatCard icon="ki-chart-line-up" tone="warning" value="—" label="Sıralama tahmini" />
        </div>
      ) : null}

      {tab === "results" && trendNets.length > 1 ? (
        <UkSection title="Net Gelişimi" sub="Son denemelerdeki TYT netlerin">
          <div className="card-body">
            <UkSparkline data={trendNets} height={84} />
          </div>
        </UkSection>
      ) : null}

      {tab === "analysis" ? (
        <StudentExamAnalysis exams={exams} selected={selected} onSelect={setSelectedId} />
      ) : tab === "online" ? (
        <>
          <div
            className="notice"
            style={{
              background: "var(--primary-soft)",
              borderColor: "color-mix(in srgb, var(--primary) 25%, transparent)",
            }}
          >
            <KiIcon name="ki-notepad" size={18} style={{ color: "var(--primary-600)", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <b style={{ fontSize: 13.5 }}>Online deneme nasıl çalışır?</b>
              <div className="muted" style={{ fontSize: 12.5 }}>
                Deneme kitapçığın kargoyla gelir. Çözdükten sonra optik formu buradan online doldur, netin anında
                hesaplansın.
              </div>
            </div>
          </div>
          <UkSection title="Online Denemelerim" sub={`${onlineExams.length} deneme · optik formu online doldur`}>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {onlineLoading ? (
                <p className="muted" style={{ fontSize: 13 }}>
                  Yükleniyor...
                </p>
              ) : onlineExams.length === 0 ? (
                <p className="muted" style={{ fontSize: 13 }}>
                  Online deneme bulunamadı.
                </p>
              ) : (
                onlineExams.map((exam) => (
                  <div key={exam.id} className="lrow" style={{ cursor: "default" }}>
                    <span
                      className="lr-icon"
                      style={{
                        background: "var(--primary-soft)",
                        color: "var(--primary-600)",
                        flexShrink: 0,
                      }}
                    >
                      <KiIcon name="ki-notepad" size={19} />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="lr-title">{exam.title}</div>
                      <div className="lr-meta">
                        <UkBadge tone="muted">{exam.examType}</UkBadge>
                        <span className="d">{exam.publisher}</span>
                        <span className="d">{exam.questionCount} soru</span>
                        <UkBadge tone={cargoBadgeTone(exam.cargoStatus)}>{cargoBadgeLabel(exam.cargoStatus)}</UkBadge>
                      </div>
                    </div>
                    {exam.submission ? (
                      <div className="row" style={{ gap: 8 }}>
                        <OptikResultBadge submission={exam.submission} />
                        <button type="button" className="btn btn-light btn-sm" onClick={() => setOptikExam(exam)}>
                          Optiği Gör
                        </button>
                      </div>
                    ) : (
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => setOptikExam(exam)}>
                        <KiIcon name="ki-notepad" size={14} />
                        Optik Doldur
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </UkSection>
        </>
      ) : (
        <>
          <div className="grid col-main">
            <UkSection title="Deneme Geçmişi" sub={`${exams.length} sonuç`}>
              <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {isLoading ? (
                  <p className="muted" style={{ fontSize: 13 }}>
                    Yükleniyor...
                  </p>
                ) : exams.length === 0 ? (
                  <p className="muted" style={{ fontSize: 13 }}>
                    Henüz deneme sonucu yok.
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
                          <KiIcon name="ki-chart-simple" />
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

            <UkSection title="Net Dağılımı" sub={selected ? selected.label ?? "Seçili deneme" : "Deneme seçin"}>
              <div className="card-body">
                {!selected ? (
                  <p className="muted" style={{ fontSize: 13 }}>
                    Detay için bir deneme seçin.
                  </p>
                ) : (
                  <>
                    <div className="subj" style={{ marginBottom: 16 }}>
                      {selected.subjects.map((row) => {
                        const color = subjectColor(row.subjectName);
                        const max = subjectNetMax(row.subjectName);
                        const pct = max > 0 ? Math.round((row.net / max) * 100) : 0;
                        return (
                          <div className="subj-row" key={row.id}>
                            <div className="between">
                              <span className="sname">
                                <span className="swatch" style={{ background: color }} />
                                {displaySubjectName(row.subjectName)}
                              </span>
                              <span className="spct tnum">
                                {formatExamNet(row.net)} / {max}
                              </span>
                            </div>
                            <div className="bar">
                              <span style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <table className="tbl">
                      <thead>
                        <tr>
                          <th>Ders</th>
                          <th>Doğru</th>
                          <th>Yanlış</th>
                          <th>Net</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.subjects.map((row) => (
                          <tr key={row.id}>
                            <td>
                              <span className="chip" style={{ height: 22, fontSize: 11, padding: "0 8px" }}>
                                <span className="swatch" style={{ background: subjectColor(row.subjectName) }} />
                                {displaySubjectName(row.subjectName)}
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
                  </>
                )}
              </div>
            </UkSection>
          </div>
        </>
      )}

      <StudentManualExamModal
        open={manualOpen}
        onClose={() => setManualOpen(false)}
        onSaved={() => void load()}
      />

      <OptikFormModal
        open={Boolean(optikExam)}
        exam={optikExam}
        onClose={() => setOptikExam(null)}
        onSubmitted={() => void loadOnline()}
      />

      <DenemeKayitModal
        open={kayitOpen}
        onClose={() => setKayitOpen(false)}
        onGoOnline={() => setTab("online")}
      />
    </div>
  );
}
