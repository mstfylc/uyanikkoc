"use client";

import type { CoachRosterEntry, ExamResultRecord } from "@uyanik/database";
import { formatExamNet } from "@uyanik/shared";
import { useCallback, useEffect, useMemo, useState } from "react";

import { CoachExamImportModal } from "@/components/coach/CoachExamImportModal";
import { CoachExamManualModal } from "@/components/coach/CoachExamManualModal";
import { CoachExamStudentDetailModal } from "@/components/coach/CoachExamStudentDetailModal";
import { KiIcon } from "@/components/design/KiIcon";
import { UkAvatar } from "@/components/design/UkAvatar";
import { UkBadge } from "@/components/design/UkBadge";
import { UkBarChart } from "@/components/design/UkBarChart";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import { UkStatCard } from "@/components/design/UkStatCard";
import {
  averageCategoryNets,
  buildClassExamTrend,
  buildCoachExamSessions,
  type CoachExamSession,
  type CoachExamStudentRow,
} from "@/lib/design/coach-exam-sessions";
import { EXAM_CAT_COLOR, EXAM_CAT_MAX, EXAM_CAT_ORDER } from "@/lib/design/exam-categories";

function formatCategoryNet(value: number): string {
  return value.toFixed(1).replace(/\.0$/, "");
}

export function CoachExamsPanel() {
  const [exams, setExams] = useState<ExamResultRecord[]>([]);
  const [roster, setRoster] = useState<CoachRosterEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [detailStudent, setDetailStudent] = useState<CoachExamStudentRow | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const [studentsResponse, examsResponse] = await Promise.all([
      fetch("/api/coach/students", { credentials: "same-origin" }),
      fetch("/api/coach/exams", { credentials: "same-origin" }),
    ]);

    if (studentsResponse.ok) {
      const data = (await studentsResponse.json()) as { students: CoachRosterEntry[] };
      setRoster(data.students);
    }

    if (examsResponse.ok) {
      const data = (await examsResponse.json()) as { exams: ExamResultRecord[] };
      setExams(data.exams);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const sessions = useMemo(() => buildCoachExamSessions(exams, roster), [exams, roster]);

  const selectedSession: CoachExamSession | null = useMemo(() => {
    if (sessions.length === 0) {
      return null;
    }
    if (selectedSessionId) {
      return sessions.find((session) => session.id === selectedSessionId) ?? sessions[0];
    }
    return sessions[0];
  }, [sessions, selectedSessionId]);

  const categoryAverages = useMemo(
    () => (selectedSession ? averageCategoryNets(selectedSession.students) : null),
    [selectedSession],
  );

  const trendData = useMemo(() => buildClassExamTrend(sessions), [sessions]);
  const trendDelta =
    trendData.length > 1 ? trendData[trendData.length - 1].value - trendData[0].value : null;

  const filteredStudents = useMemo(() => {
    if (!selectedSession) {
      return [];
    }
    const query = searchQuery.trim().toLocaleLowerCase("tr-TR");
    if (!query) {
      return selectedSession.students;
    }
    return selectedSession.students.filter(
      (student) =>
        student.displayName.toLocaleLowerCase("tr-TR").includes(query) ||
        student.branch.toLocaleLowerCase("tr-TR").includes(query),
    );
  }, [selectedSession, searchQuery]);

  const classAverage =
    selectedSession && selectedSession.students.length > 0
      ? (
          selectedSession.students.reduce((sum, student) => sum + student.totalNet, 0) /
          selectedSession.students.length
        ).toFixed(1)
      : "—";

  const topStudent = selectedSession?.students[0] ?? null;
  const topScore = selectedSession?.students.reduce(
    (best, student) => (student.score != null && student.score > (best ?? -1) ? student.score : best),
    null as number | null,
  );

  return (
    <div className="stack rise">
      <UkPageHead
        title="Denemeler"
        sub="Deneme sonuclarini ice aktar ve analiz et"
        actions={
          <div className="row" style={{ gap: 8 }}>
            <button type="button" className="btn btn-light" onClick={() => setManualOpen(true)}>
              <KiIcon name="ki-notepad-edit" size={16} />
              Manuel Giris
            </button>
            <button type="button" className="btn btn-primary" onClick={() => setImportOpen(true)}>
              <KiIcon name="ki-plus" size={16} />
              Deneme Ice Aktar
            </button>
          </div>
        }
      />

      {isLoading ? (
        <div className="card">
          <div className="card-body muted" style={{ fontSize: 13 }}>
            Yukleniyor...
          </div>
        </div>
      ) : null}

      {!isLoading && sessions.length === 0 ? (
        <div className="card">
          <div
            className="card-pad"
            style={{ padding: "30px 24px", display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}
          >
            <span className="stat-icon tone-primary" style={{ width: 50, height: 50, borderRadius: 15 }}>
              <KiIcon name="ki-chart-simple" size={24} />
            </span>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Henuz ice aktarilmis deneme yok</div>
              <div className="muted" style={{ fontSize: 13, marginTop: 3 }}>
                Yayınevinden gelen sonuc Excel&apos;ini (.xlsx) yukleyerek veya CSV ile tum ogrencilerin
                sonuclarini tek tikla isleyin.
              </div>
            </div>
            <button type="button" className="btn btn-primary" onClick={() => setImportOpen(true)}>
              <KiIcon name="ki-plus" size={16} />
              Sonuc Yukle
            </button>
          </div>
        </div>
      ) : null}

      {!isLoading && selectedSession ? (
        <>
          {sessions.length > 1 ? (
            <div className="field" style={{ maxWidth: 320 }}>
              <select
                className="select"
                value={selectedSession.id}
                onChange={(event) => setSelectedSessionId(event.target.value)}
              >
                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.name} · {session.date}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="grid g-4">
            <UkStatCard
              icon="ki-people"
              tone="primary"
              value={selectedSession.students.length}
              label="Katilan ogrenci"
            />
            <UkStatCard icon="ki-flag" tone="info" value={classAverage} label="Sinif ortalamasi (net)" />
            <UkStatCard
              icon="ki-star"
              tone="success"
              value={topStudent ? formatExamNet(topStudent.totalNet) : "—"}
              label={topStudent ? `En yuksek · ${topStudent.displayName.split(" ")[0]}` : "En yuksek net"}
            />
            <UkStatCard
              icon="ki-chart-simple"
              tone="warning"
              value={topScore ?? "—"}
              label="En yuksek TYT puani"
            />
          </div>

          <UkSection title="Ders Ortalamalari" sub={`${selectedSession.name} · sinif geneli`}>
            <div className="card-body subj">
              {categoryAverages
                ? EXAM_CAT_ORDER.map((category) => (
                    <div className="subj-row" key={category}>
                      <div className="between" style={{ marginBottom: 7 }}>
                        <span className="sname">
                          <span className="swatch" style={{ background: EXAM_CAT_COLOR[category] }} />
                          {category}
                        </span>
                        <span className="tnum" style={{ fontWeight: 800, fontSize: 13 }}>
                          {formatCategoryNet(categoryAverages[category])}{" "}
                          <span className="muted" style={{ fontWeight: 600 }}>
                            / {EXAM_CAT_MAX[category]}
                          </span>
                        </span>
                      </div>
                      <div className="bar">
                        <span
                          style={{
                            width: `${(categoryAverages[category] / EXAM_CAT_MAX[category]) * 100}%`,
                            background: EXAM_CAT_COLOR[category],
                          }}
                        />
                      </div>
                    </div>
                  ))
                : null}
            </div>
          </UkSection>

          <UkSection
            title="Sirali Sonuc Listesi"
            sub={`${selectedSession.name} · ${selectedSession.students.length} ogrenci`}
            action={
              <div className="searchbox" style={{ minWidth: 200, margin: 0, display: "flex" }}>
                <KiIcon name="ki-magnifier" size={16} />
                <input
                  placeholder="Ogrenci / sube ara..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
            }
          >
            <div className="card-body" style={{ padding: 0, overflowX: "auto", maxHeight: 560, overflowY: "auto" }}>
              <table className="tbl" style={{ minWidth: 720 }}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Ogrenci</th>
                    <th>Sube</th>
                    {EXAM_CAT_ORDER.map((category) => (
                      <th key={category} style={{ textAlign: "center" }}>
                        {category}
                      </th>
                    ))}
                    <th style={{ textAlign: "right" }}>Net</th>
                    <th style={{ textAlign: "right" }}>Puan</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => {
                    const rank = selectedSession.students.findIndex((row) => row.studentId === student.studentId) + 1;
                    return (
                      <tr
                        key={student.studentId}
                        style={{ cursor: "pointer" }}
                        onClick={() => setDetailStudent(student)}
                      >
                        <td>
                          <span
                            className="tnum"
                            style={{
                              fontWeight: 800,
                              color: rank <= 3 ? "var(--primary)" : "var(--faint)",
                            }}
                          >
                            {rank}
                          </span>
                        </td>
                        <td>
                          <div className="name">
                            <UkAvatar name={student.displayName} size={30} />
                            <b style={{ fontSize: 12.5 }}>{student.displayName}</b>
                          </div>
                        </td>
                        <td>
                          <span className="muted" style={{ fontSize: 11.5, whiteSpace: "nowrap" }}>
                            {student.branch}
                          </span>
                        </td>
                        {EXAM_CAT_ORDER.map((category) => (
                          <td key={category} style={{ textAlign: "center" }}>
                            <span className="tnum" style={{ fontSize: 12 }}>
                              {formatCategoryNet(student.byCat[category].net)}
                            </span>
                          </td>
                        ))}
                        <td style={{ textAlign: "right" }}>
                          <b className="tnum">{formatExamNet(student.totalNet)}</b>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <span className="tnum muted">{student.score ?? "—"}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </UkSection>
        </>
      ) : null}

      <UkSection
        title="Sinif Net Ortalamasi (gecmis)"
        sub="Takip ettigin ogrencilerin deneme trendi"
        action={
          trendDelta != null && trendDelta >= 0 ? (
            <UkBadge tone="success">+{formatExamNet(trendDelta)} net</UkBadge>
          ) : null
        }
      >
        <div className="card-body">
          <UkBarChart data={trendData.map((point) => ({ label: point.label, value: point.value }))} />
        </div>
      </UkSection>

      <CoachExamImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={() => {
          setSelectedSessionId(null);
          void loadData();
        }}
      />
      <CoachExamManualModal
        open={manualOpen}
        onClose={() => setManualOpen(false)}
        onSaved={() => {
          setSelectedSessionId(null);
          void loadData();
        }}
      />
      <CoachExamStudentDetailModal
        student={detailStudent}
        examName={selectedSession?.name ?? "Deneme"}
        onClose={() => setDetailStudent(null)}
      />
    </div>
  );
}
