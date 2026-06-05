"use client";

import { useEffect, useMemo, useState } from "react";

import { CoachStudentsTable } from "@/components/coach/CoachStudentsTable";
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

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setError(null);

      const [studentsResponse, assignmentsResponse, examsResponse] = await Promise.all([
        fetch("/api/coach/students", { credentials: "same-origin" }),
        fetch("/api/coach/assignments", { credentials: "same-origin" }),
        fetch("/api/coach/exams", { credentials: "same-origin" }),
      ]);

      if (!studentsResponse.ok) {
        setError("Ogrenci listesi yuklenemedi.");
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

  if (error) {
    return (
      <p role="alert" className="badge badge-danger" style={{ height: "auto", padding: "10px 12px" }}>
        {error}
      </p>
    );
  }

  return (
    <div className="stack rise" data-testid="coach-student-roster">
      <UkPageHead title="Ogrencilerim" sub="Takip ettigin tum ogrenciler" />
      <div className="grid g-4">
        <UkStatCard icon="ki-people" tone="primary" value={rows.length} label="Aktif ogrenci" />
        <UkStatCard icon="ki-chart-pie-simple" tone="success" value={`${avg}%`} label="Ortalama tamamlama" />
        <UkStatCard icon="ki-information-2" tone="danger" value={atRisk} label="Risk altinda" />
        <UkStatCard icon="ki-star" tone="warning" value={excellent} label="Mukemmel" />
      </div>
      <CoachStudentsTable rows={rows} isLoading={isLoading} />
    </div>
  );
}
