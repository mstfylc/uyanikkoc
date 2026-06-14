"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { KiIcon } from "@/components/design/KiIcon";
import { UkAvatar } from "@/components/design/UkAvatar";
import { UkBadge } from "@/components/design/UkBadge";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import { UkStatCard } from "@/components/design/UkStatCard";
import { CoachOdevAtaModal } from "@/components/coach/CoachOdevAtaModal";
import { SmartOdevModal } from "@/components/coach/SmartOdevModal";
import { StudentResourcesCard } from "@/components/student/StudentResourcesCard";
import {
  ASSIGNMENT_PRIORITY_LABELS,
  ASSIGNMENT_STATUS_LABELS,
  ASSIGNMENT_TYPE_LABELS,
  formatAssignmentDueDate,
  isAssignmentOpen,
} from "@/lib/assignment-labels";
import { subjectColor } from "@/lib/design/subject-colors";
import type { AssignmentPriority, AssignmentStatus, AssignmentType, CoachRosterEntry, CurriculumRecord } from "@uyanik/database";

type AssignmentItem = {
  id: string;
  title: string;
  description: string | null;
  studentId: string;
  type: AssignmentType;
  priority: AssignmentPriority;
  status: AssignmentStatus;
  subject: string | null;
  dueDate: string | null;
  completed: boolean;
  createdAt: string;
};

const WEEK_OPTIONS = [
  { id: "w0", label: "Bu hafta" },
  { id: "w1", label: "Geçen hafta" },
];

function weekIdForDate(iso: string): string {
  const created = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays <= 7 ? "w0" : "w1";
}

export function CoachAssignmentsPanel() {
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [students, setStudents] = useState<CoachRosterEntry[]>([]);
  const [curriculum, setCurriculum] = useState<CurriculumRecord | null>(null);
  const [week, setWeek] = useState("w0");
  const [filter, setFilter] = useState<"all" | "pending" | "done" | "result">("all");
  const [studentFilter, setStudentFilter] = useState("all");
  const [smartOpen, setSmartOpen] = useState(false);
  const [odevOpen, setOdevOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    const [assignmentsResponse, studentsResponse, curriculumResponse] = await Promise.all([
      fetch("/api/coach/assignments", { credentials: "same-origin" }),
      fetch("/api/coach/students", { credentials: "same-origin" }),
      fetch("/api/coach/curriculum", { credentials: "same-origin" }),
    ]);

    if (assignmentsResponse.ok) {
      const data = (await assignmentsResponse.json()) as { assignments: AssignmentItem[] };
      setAssignments(data.assignments);
    }
    if (studentsResponse.ok) {
      const data = (await studentsResponse.json()) as { students: CoachRosterEntry[] };
      setStudents(data.students);
    }
    if (curriculumResponse.ok) {
      const data = (await curriculumResponse.json()) as { curriculum: CurriculumRecord };
      setCurriculum(data.curriculum);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const studentNameById = useMemo(
    () => new Map(students.map((student) => [student.studentId, student.displayName])),
    [students],
  );

  const inWeek = useMemo(
    () => assignments.filter((item) => weekIdForDate(item.createdAt) === week),
    [assignments, week],
  );

  const shown = useMemo(() => {
    return inWeek.filter((item) => {
      if (studentFilter !== "all" && item.studentId !== studentFilter) {
        return false;
      }
      if (filter === "done") {
        return item.completed;
      }
      if (filter === "pending") {
        return isAssignmentOpen(item);
      }
      if (filter === "result") {
        return item.completed;
      }
      return true;
    });
  }, [filter, inWeek, studentFilter]);

  const total = inWeek.length;
  const completed = inWeek.filter((item) => item.completed).length;
  const rate = total ? Math.round((completed / total) * 100) : 0;
  const overdue = inWeek.filter((item) => isAssignmentOpen(item) && item.dueDate && new Date(item.dueDate) < new Date()).length;
  const smartStudent = students.find((student) => student.studentId === studentFilter) ?? students[0] ?? null;
  const selectedStudent = students.find((student) => student.studentId === studentFilter) ?? null;

  return (
    <div className="stack rise" data-testid="coach-assignments-panel">
      <UkPageHead
        title="Ödev & Görev"
        sub="Atadığın ödevler, kaynaklar ve öğrenci sonuçları"
        actions={
          <div className="row" style={{ gap: 8 }}>
            <select
              className="select"
              style={{ height: 36, maxWidth: 200 }}
              value={studentFilter}
              onChange={(event) => setStudentFilter(event.target.value)}
            >
              <option value="all">Tüm öğrenciler</option>
              {students.map((student) => (
                <option key={student.studentId} value={student.studentId}>
                  {student.displayName}
                </option>
              ))}
            </select>
            <button type="button" className="btn btn-light btn-sm" disabled={!smartStudent} onClick={() => setSmartOpen(true)}>
              <KiIcon name="ki-abstract-26" size={16} />
              Akıllı Ödev
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={students.length === 0 || !curriculum}
              onClick={() => setOdevOpen(true)}
            >
              <KiIcon name="ki-plus" size={16} />
              Yeni ödev
            </button>
          </div>
        }
      />

      <div className="seg" style={{ width: "fit-content", flexWrap: "wrap" }}>
        {WEEK_OPTIONS.map((option) => {
          const hasData = assignments.some((item) => weekIdForDate(item.createdAt) === option.id);
          return (
            <button
              key={option.id}
              type="button"
              className={week === option.id ? "on" : ""}
              disabled={!hasData}
              style={{ opacity: hasData ? 1 : 0.4 }}
              onClick={() => setWeek(option.id)}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="grid g-4">
        <UkStatCard icon="ki-notepad-edit" tone="primary" value={total} label="Atanan ödev" />
        <UkStatCard icon="ki-flag" tone="success" value={`${rate}%`} label="Tamamlanma" />
        <UkStatCard icon="ki-chart-simple" tone="info" value={completed} label="Sonuç girilen" />
        <UkStatCard icon="ki-information-2" tone="danger" value={overdue} label="Gecikmiş" />
      </div>

      <UkSection
        title="Atanan Ödevler"
        sub={`${shown.length} görev`}
        action={
          <div className="filters">
            {[
              ["all", "Tümü"],
              ["pending", "Bekleyen"],
              ["done", "Tamamlanan"],
              ["result", "Sonuçlu"],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={filter === key ? "on" : ""}
                onClick={() => setFilter(key as typeof filter)}
              >
                {label}
              </button>
            ))}
          </div>
        }
      >
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {isLoading ? (
            <p className="muted" style={{ fontSize: 13 }}>
              Yükleniyor...
            </p>
          ) : shown.length === 0 ? (
            <div style={{ padding: "26px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
              Bu görünümde ödev yok.{" "}
              <Link href="/coach/topics" style={{ color: "var(--primary-600)", fontWeight: 700 }}>
                Konu Takibi
              </Link>{" "}
              sayfasından ödev atayabilirsiniz.
            </div>
          ) : (
            shown.map((assignment) => {
              const color = subjectColor(assignment.subject ?? "Genel");
              const studentName = studentNameById.get(assignment.studentId) ?? assignment.studentId;
              const overdueItem =
                isAssignmentOpen(assignment) && assignment.dueDate && new Date(assignment.dueDate) < new Date();
              return (
                <div key={assignment.id} className="lrow" style={{ alignItems: "flex-start" }}>
                  <UkAvatar name={studentName} size={38} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="lr-title">
                      {assignment.title}{" "}
                      <span className="muted" style={{ fontWeight: 500 }}>
                        · {studentName}
                      </span>
                    </div>
                    <div className="lr-meta">
                      {assignment.subject ? (
                        <span className="chip" style={{ height: 21, fontSize: 10.5, padding: "0 7px" }}>
                          <span className="swatch" style={{ background: color }} />
                          {assignment.subject}
                        </span>
                      ) : null}
                      <span className="d">{ASSIGNMENT_TYPE_LABELS[assignment.type]}</span>
                      <span className="d">{ASSIGNMENT_PRIORITY_LABELS[assignment.priority]}</span>
                      {assignment.dueDate ? (
                        <span
                          className="d"
                          style={{
                            color: overdueItem ? "var(--danger)" : "var(--muted)",
                            fontWeight: overdueItem ? 700 : 500,
                          }}
                        >
                          {formatAssignmentDueDate(assignment.dueDate)}
                        </span>
                      ) : null}
                    </div>
                    {assignment.description ? (
                      <div className="muted" style={{ fontSize: 12, marginTop: 5 }}>
                        {assignment.description}
                      </div>
                    ) : null}
                  </div>
                  {assignment.completed ? (
                    <UkBadge tone="success">{ASSIGNMENT_STATUS_LABELS[assignment.status]}</UkBadge>
                  ) : (
                    <UkBadge tone={overdueItem ? "danger" : "warning"} dot>
                      {overdueItem ? "Gecikti" : "Bekliyor"}
                    </UkBadge>
                  )}
                </div>
              );
            })
          )}
        </div>
      </UkSection>

      {studentFilter === "all" ? (
        <div className="card card-pad" style={{ textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
          Kaynak takibi ve ödev harici çalışmaları görmek için yukarıdan bir öğrenci seç.
        </div>
      ) : (
        <StudentResourcesCard
          apiPath={`/api/coach/students/${studentFilter}/sources`}
          title="Kaynak Takibi"
          sub="Öğrencinin kitap durumu, ilerlemesi ve ödev harici çalışmaları"
          editable
        />
      )}

      {smartStudent ? (
        <SmartOdevModal
          open={smartOpen}
          studentId={smartStudent.studentId}
          studentName={smartStudent.displayName}
          onClose={() => setSmartOpen(false)}
          onAssigned={() => void load()}
        />
      ) : null}

      {curriculum ? (
        <CoachOdevAtaModal
          open={odevOpen}
          onClose={() => setOdevOpen(false)}
          curriculum={curriculum}
          studentId={selectedStudent?.studentId ?? students[0]?.studentId ?? ""}
          studentName={selectedStudent?.displayName ?? students[0]?.displayName ?? "Öğrenci"}
          roster={
            studentFilter === "all"
              ? students.map((student) => ({ studentId: student.studentId, name: student.displayName }))
              : undefined
          }
          defaultAll={studentFilter === "all"}
          onAssigned={() => void load()}
        />
      ) : null}
    </div>
  );
}
