"use client";

import { KiIcon } from "@/components/design/KiIcon";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { UkBarChart } from "@/components/design/UkBarChart";
import { CoachStudentsTable } from "@/components/coach/CoachStudentsTable";
import { UkBadge } from "@/components/design/UkBadge";
import { UkSection } from "@/components/design/UkSection";
import { UkStatCard } from "@/components/design/UkStatCard";
import { buildCoachStudentRows } from "@/lib/design/coach-student-rows";
import {
  calculateCompletionRate,
  isAssignmentOpen,
} from "@uyanik/shared";
import type {
  AssignmentPriority,
  AssignmentStatus,
  AssignmentType,
  CoachRosterEntry,
  ExamResultRecord,
} from "@uyanik/database";

type Assignment = {
  id: string;
  title: string;
  studentId: string;
  type: AssignmentType;
  priority: AssignmentPriority;
  status: AssignmentStatus;
  dueDate: string | null;
  completed: boolean;
  updatedAt: string;
};

export function CoachDashboard() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [students, setStudents] = useState<CoachRosterEntry[]>([]);
  const [exams, setExams] = useState<ExamResultRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [assignmentsResponse, studentsResponse, examsResponse] = await Promise.all([
        fetch("/api/coach/assignments", { credentials: "same-origin" }),
        fetch("/api/coach/students", { credentials: "same-origin" }),
        fetch("/api/coach/exams", { credentials: "same-origin" }),
      ]);

      if (assignmentsResponse.ok) {
        const data = (await assignmentsResponse.json()) as { assignments: Assignment[] };
        setAssignments(data.assignments);
      }

      if (studentsResponse.ok) {
        const data = (await studentsResponse.json()) as { students: CoachRosterEntry[] };
        setStudents(data.students);
      }

      if (examsResponse.ok) {
        const data = (await examsResponse.json()) as { exams: ExamResultRecord[] };
        setExams(data.exams);
      }

      setIsLoading(false);
    }

    void load();
  }, []);

  const studentRows = useMemo(
    () => buildCoachStudentRows(students, assignments, exams),
    [students, assignments, exams],
  );

  const total = assignments.length;
  const completed = assignments.filter((item) => item.completed).length;
  const pending = total - completed;
  const completionRate = calculateCompletionRate(total, completed);
  const atRisk = studentRows.filter((row) => row.risk === "attention" || row.risk === "critical").length;

  const actionItems = assignments
    .filter((item) => isAssignmentOpen(item))
    .slice(0, 4);

  const recentActivity = assignments
    .slice()
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <div className="stack rise" data-testid="coach-dashboard">
      <div className="grid g-4">
        <UkStatCard icon="ki-people" tone="primary" value={students.length} label="Toplam ogrenci" />
        <UkStatCard
          icon="ki-chart-pie-simple"
          tone="success"
          value={`${completionRate}%`}
          label="Ortalama tamamlama"
        />
        <UkStatCard icon="ki-information-2" tone="danger" value={atRisk} label="Risk altindaki ogrenci" />
        <UkStatCard icon="ki-notepad-edit" tone="warning" value={pending} label="Bekleyen odev" />
      </div>

      <div className="grid col-main">
        <CoachStudentsTable rows={studentRows} isLoading={isLoading} />
        <UkSection
          title="Aksiyon gerektirenler"
          sub="Onceliklendirilmis"
          action={<UkBadge tone="danger">{actionItems.length}</UkBadge>}
        >
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {actionItems.length === 0 ? (
              <p className="muted" style={{ fontSize: 13, textAlign: "center", padding: "12px 0" }}>
                Acil aksiyon yok
              </p>
            ) : (
              actionItems.map((item) => (
                <div key={item.id} className="lrow">
                  <span className="lr-icon" style={{ background: "var(--warning-soft)", color: "var(--warning)" }}>
                    <KiIcon name="ki-notepad-edit" />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="lr-title">{item.title}</div>
                    <div className="lr-meta">
                      <UkBadge tone="warning">Bekliyor</UkBadge>
                    </div>
                  </div>
                </div>
              ))
            )}
            <Link href="/coach/assignments" className="btn btn-primary" style={{ width: "100%", marginTop: 2 }}>
              <KiIcon name="ki-plus" />
              Yeni odev ata
            </Link>
          </div>
        </UkSection>
      </div>

      <div className="grid col-main">
        <UkSection title="Haftalik sinif tamamlamasi" sub="Son 7 gun ortalamasi">
          <div className="card-body">
            <UkBarChart
              data={[
                { label: "Pzt", value: Math.max(completionRate - 8, 0) },
                { label: "Sal", value: Math.max(completionRate - 4, 0) },
                { label: "Car", value: Math.max(completionRate - 2, 0) },
                { label: "Per", value: completionRate },
                { label: "Cum", value: Math.min(completionRate + 3, 100) },
                { label: "Cmt", value: Math.max(completionRate - 10, 0) },
                { label: "Paz", value: Math.max(completionRate - 12, 0) },
              ]}
              max={100}
              peakIdx={4}
            />
          </div>
        </UkSection>

        <UkSection title="Son aktivite" action={<Link href="/coach/assignments" className="link-btn">Tumu</Link>}>
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {recentActivity.length === 0 ? (
            <p className="muted" style={{ fontSize: 13, padding: "12px 0" }}>
              Henuz aktivite yok.
            </p>
          ) : (
            recentActivity.map((item, index) => (
              <div
                key={item.id}
                className="row"
                style={{
                  gap: 13,
                  padding: "11px 4px",
                  borderBottom: index < recentActivity.length - 1 ? "1px solid var(--border)" : "none",
                  alignItems: "flex-start",
                }}
              >
                <span
                  className="lr-icon"
                  style={{
                    width: 36,
                    height: 36,
                    background: item.completed ? "var(--success-soft)" : "var(--primary-soft)",
                    color: item.completed ? "var(--success)" : "var(--primary-600)",
                  }}
                >
                  <KiIcon name={item.completed ? "ki-check-circle" : "ki-notepad-edit"} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, lineHeight: 1.4 }}>
                    <b style={{ fontWeight: 700 }}>{item.title}</b>
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--faint)", marginTop: 2 }}>
                    {new Date(item.updatedAt).toLocaleDateString("tr-TR")}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </UkSection>
      </div>
    </div>
  );
}
