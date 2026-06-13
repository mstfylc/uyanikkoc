"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { CoachAddStudentModal } from "@/components/coach/CoachAddStudentModal";
import { CoachStudentsTable } from "@/components/coach/CoachStudentsTable";
import { MotivationSendModal } from "@/components/coach/MotivationSendModal";
import { KiIcon } from "@/components/design/KiIcon";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkStatCard } from "@/components/design/UkStatCard";
import { buildCoachStudentRows } from "@/lib/design/coach-student-rows";
import type { CoachRosterEntry, ExamResultRecord } from "@uyanik/database";

type AssignmentRow = {
  studentId: string;
  completed: boolean;
  status: string;
  dueDate: string | null;
  updatedAt: string;
};

export function CoachStudentRoster() {
  const [students, setStudents] = useState<CoachRosterEntry[]>([]);
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [exams, setExams] = useState<ExamResultRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [motivationOpen, setMotivationOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  async function load() {
    setIsLoading(true);
    setError(null);

    const [studentsResponse, assignmentsResponse, examsResponse] = await Promise.all([
      fetch("/api/coach/students", { credentials: "same-origin" }),
      fetch("/api/coach/assignments", { credentials: "same-origin" }),
      fetch("/api/coach/exams", { credentials: "same-origin" }),
    ]);

    if (!studentsResponse.ok) {
      setError("Öğrenci listesi yüklenemedi.");
      setIsLoading(false);
      return;
    }

    const studentsData = (await studentsResponse.json()) as { students: CoachRosterEntry[] };
    setStudents(studentsData.students);

    if (assignmentsResponse.ok) {
      const assignmentsData = (await assignmentsResponse.json()) as { assignments: AssignmentRow[] };
      setAssignments(assignmentsData.assignments);
    }

    if (examsResponse.ok) {
      const examsData = (await examsResponse.json()) as { exams: ExamResultRecord[] };
      setExams(examsData.exams);
    }

    setIsLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  const rows = useMemo(
    () => buildCoachStudentRows(students, assignments, exams),
    [students, assignments, exams],
  );

  const atRisk = rows.filter((row) => row.risk === "attention" || row.risk === "critical").length;
  const avg =
    rows.length > 0 ? Math.round(rows.reduce((sum, row) => sum + row.completion, 0) / rows.length) : 0;
  const excellent = rows.filter((row) => row.risk === "excellent").length;

  function handleAdded(displayName: string) {
    setToast(`${displayName} kadroya eklendi`);
    setTimeout(() => setToast(null), 3200);
    void load();
  }

  if (error) {
    return (
      <p role="alert" className="badge badge-danger" style={{ height: "auto", padding: "10px 12px" }}>
        {error}
      </p>
    );
  }

  return (
    <div className="stack rise" data-testid="coach-student-roster">
      <UkPageHead
        title="Öğrencilerim"
        sub="Takip ettiğin tüm öğrenciler"
        actions={
          <div className="row" style={{ gap: 8 }}>
            <button type="button" className="btn btn-light" onClick={() => setMotivationOpen(true)}>
              <KiIcon name="ki-heart" />
              Motivasyon Gönder
            </button>
            <button type="button" className="btn btn-primary" onClick={() => setAddModalOpen(true)}>
              <KiIcon name="ki-plus" />
              Öğrenci ekle
            </button>
          </div>
        }
      />
      <div className="grid g-4">
        <UkStatCard icon="ki-people" tone="primary" value={rows.length} label="Aktif öğrenci" />
        <UkStatCard icon="ki-chart-pie-simple" tone="success" value={`${avg}%`} label="Ortalama tamamlama" />
        <UkStatCard icon="ki-information-2" tone="danger" value={atRisk} label="Risk altında" />
        <UkStatCard icon="ki-star" tone="warning" value={excellent} label="Mükemmel" />
      </div>
      <CoachStudentsTable rows={rows} isLoading={isLoading} />
      <CoachAddStudentModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdded={handleAdded}
      />
      <MotivationSendModal
        open={motivationOpen}
        onClose={() => setMotivationOpen(false)}
        onSent={(count) => {
          setToast(`${count} öğrenciye motivasyon gönderildi`);
          setTimeout(() => setToast(null), 3200);
        }}
      />
      {toast
        ? createPortal(
            <div className="toast">
              <span
                className="lr-icon"
                style={{ width: 34, height: 34, background: "var(--success-soft)", color: "var(--success)" }}
              >
                <KiIcon name="ki-check-circle" size={18} />
              </span>
              <div>
                <b style={{ fontSize: 13.5, fontWeight: 700 }}>İşlem tamamlandı</b>
                <div className="muted" style={{ fontSize: 12 }}>
                  {toast}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
