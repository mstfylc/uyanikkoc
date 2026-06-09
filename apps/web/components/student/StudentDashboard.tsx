"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { KiIcon } from "@/components/design/KiIcon";
import { UkPageHead } from "@/components/design/UkPageHead";
import {
  ASSIGNMENT_PRIORITY_LABELS,
  ASSIGNMENT_STATUS_LABELS,
  ASSIGNMENT_TYPE_LABELS,
  formatAssignmentDueDate,
} from "@/lib/assignment-labels";
import {
  buildStudentPriorityAssignment,
  calculateCompletionRate,
} from "@uyanik/shared";
import type { AssignmentPriority, AssignmentStatus, AssignmentType } from "@uyanik/database";

type Assignment = {
  id: string;
  title: string;
  description: string | null;
  type: AssignmentType;
  priority: AssignmentPriority;
  status: AssignmentStatus;
  subject: string | null;
  dueDate: string | null;
  completed: boolean;
  createdAt: string;
};

type StatCardProps = {
  label: string;
  value: number | string;
  icon: string;
  tone?: "primary" | "success" | "warning" | "danger" | "info";
};

function StatCard({ label, value, icon, tone = "primary" }: StatCardProps) {
  return (
    <div className="card stat">
      <div className="card-pad">
        <div className="stat-top">
          <span className={`stat-icon tone-${tone}`}>
            <KiIcon name={icon} size={22} />
          </span>
        </div>
        <div>
          <div className="stat-value tnum">{value}</div>
          <div className="stat-label">{label}</div>
        </div>
      </div>
    </div>
  );
}

export function StudentDashboard() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const response = await fetch("/api/student/assignments", { credentials: "same-origin" });
      if (response.ok) {
        const data = (await response.json()) as { assignments: Assignment[] };
        setAssignments(data.assignments);
      }
      setIsLoading(false);
    }

    void load();
  }, []);

  const total = assignments.length;
  const completed = assignments.filter((item) => item.completed).length;
  const pending = total - completed;
  const completionRate = calculateCompletionRate(total, completed);
  const priorityAssignment = buildStudentPriorityAssignment(assignments);

  return (
    <div className="stack rise">
      <UkPageHead title="Öğrenci Dashboard" sub="Ödevlerin, denemelerin ve haftalık ilerlemen" />

      <div
        className="alert-strip"
        data-testid="ai-coach-band"
      >
        <span className="as-ic">
          <KiIcon name="ki-flash" size={18} />
        </span>
        <div style={{ flex: 1 }}>
          <b style={{ fontSize: 13.5 }}>AI Koç · Yakında</b>
          <p className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>
            Kişisel AI koç modülü hazırlanıyor — canlı yanıt şu an kapalı.
          </p>
        </div>
        <Link href="/student/ai-coach" className="btn btn-light btn-sm">
          Detay
        </Link>
      </div>

      <div className="card" data-testid="student-priority-card">
        <div className="card-head">
          <div>
            <h3>Bugünkü Öncelik</h3>
            <p className="sub">Bugün ilk odaklanman gereken çalışma</p>
          </div>
        </div>
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {isLoading ? (
            <p className="muted" style={{ fontSize: 13 }}>Yükleniyor...</p>
          ) : priorityAssignment ? (
            <>
              <b style={{ fontSize: 15 }}>{priorityAssignment.title ?? "Ödev"}</b>
              <p className="muted" style={{ fontSize: 12.5 }}>
                {priorityAssignment.priority
                  ? `Oncelik: ${ASSIGNMENT_PRIORITY_LABELS[priorityAssignment.priority as AssignmentPriority] ?? priorityAssignment.priority}`
                  : null}
                {priorityAssignment.dueDate
                  ? ` · Son tarih: ${formatAssignmentDueDate(priorityAssignment.dueDate)}`
                  : ""}
              </p>
            </>
          ) : (
            <p className="muted" style={{ fontSize: 13 }}>Açık ödev yok — harika!</p>
          )}
        </div>
      </div>

      <div className="grid g-4">
        <StatCard label="Toplam Ödev" value={isLoading ? "—" : total} icon="ki-notepad-edit" />
        <StatCard
          label="Tamamlanan"
          value={isLoading ? "—" : completed}
          icon="ki-check-circle"
          tone="success"
        />
        <StatCard
          label="Bekleyen"
          value={isLoading ? "—" : pending}
          icon="ki-time"
          tone="warning"
        />
        <StatCard
          label="Tamamlama %"
          value={isLoading ? "—" : `${completionRate}%`}
          icon="ki-chart-pie-simple"
          tone="primary"
        />
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <h3>Ödevlerim</h3>
            <p className="sub">Koçun tarafından atanan son çalışmalar</p>
          </div>
          <Link href="/student/assignments" className="btn btn-light btn-sm">
            Tümünü Gör
          </Link>
        </div>
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {isLoading ? (
            <p className="muted" style={{ fontSize: 13 }}>Yükleniyor...</p>
          ) : assignments.length === 0 ? (
            <p className="muted" style={{ fontSize: 13 }}>Henüz atanmış ödev yok.</p>
          ) : (
            assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="lrow"
                style={{ alignItems: "center" }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <b style={{ fontSize: 13.5 }}>{assignment.title}</b>
                  <div className="muted" style={{ display: "flex", flexWrap: "wrap", gap: "4px 8px", fontSize: 12, marginTop: 4 }}>
                    <span>{ASSIGNMENT_STATUS_LABELS[assignment.status]}</span>
                    <span>{ASSIGNMENT_PRIORITY_LABELS[assignment.priority]}</span>
                    <span>{ASSIGNMENT_TYPE_LABELS[assignment.type]}</span>
                    {assignment.subject ? <span>{assignment.subject}</span> : null}
                    <span>{formatAssignmentDueDate(assignment.dueDate)}</span>
                  </div>
                </div>
                <span
                  className={`badge badge-${assignment.completed ? "success" : "warning"}`}
                  style={{ height: 24, flexShrink: 0 }}
                >
                  {assignment.completed ? <span className="dot-live" /> : null}
                  {assignment.completed ? "Tamamlandı" : "Bekliyor"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
