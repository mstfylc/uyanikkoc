"use client";

import { KiIcon } from "@/components/design/KiIcon";
import { useCallback, useEffect, useState } from "react";

import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import {
  ASSIGNMENT_PRIORITY_LABELS,
  ASSIGNMENT_STATUS_LABELS,
  ASSIGNMENT_TYPE_LABELS,
  formatAssignmentDueDate,
  isAssignmentOpen,
} from "@/lib/assignment-labels";
import { subjectColor } from "@/lib/design/subject-colors";
import type { AssignmentPriority, AssignmentStatus, AssignmentType } from "@uyanik/database";

type AssignmentItem = {
  id: string;
  title: string;
  description: string | null;
  type: AssignmentType;
  priority: AssignmentPriority;
  status: AssignmentStatus;
  subject: string | null;
  dueDate: string | null;
  completed: boolean;
};

export function StudentAssignmentList() {
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [filter, setFilter] = useState<"pending" | "done" | "all">("pending");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadAssignments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const response = await fetch("/api/student/assignments", { credentials: "same-origin" });
    if (!response.ok) {
      setError("Odev listesi yuklenemedi.");
      setIsLoading(false);
      return;
    }

    const data = (await response.json()) as { assignments: AssignmentItem[] };
    setAssignments(data.assignments);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadAssignments();
  }, [loadAssignments]);

  async function handleComplete(assignmentId: string) {
    const response = await fetch("/api/student/assignments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ assignmentId, status: "completed" }),
    });

    if (!response.ok) {
      setError("Odev tamamlanamadi.");
      return;
    }

    await loadAssignments();
  }

  const shown = assignments.filter((item) => {
    if (filter === "all") return true;
    if (filter === "done") return item.completed;
    return !item.completed;
  });

  const pending = assignments.filter((item) => !item.completed).length;

  return (
    <div className="stack rise">
      <UkPageHead title="Odevlerim" sub={`${pending} bekleyen gorev`} />

      {error ? (
        <p role="alert" className="badge badge-danger" style={{ height: "auto", padding: "10px 12px" }}>
          {error}
        </p>
      ) : null}

      <UkSection
        title="Odev listesi"
        action={
          <div className="filters">
            <button type="button" className={filter === "pending" ? "on" : ""} onClick={() => setFilter("pending")}>
              Bekleyen
            </button>
            <button type="button" className={filter === "done" ? "on" : ""} onClick={() => setFilter("done")}>
              Bitti
            </button>
            <button type="button" className={filter === "all" ? "on" : ""} onClick={() => setFilter("all")}>
              Tumu
            </button>
          </div>
        }
      >
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {isLoading ? (
            <p className="muted" style={{ fontSize: 13 }}>
              Yukleniyor...
            </p>
          ) : shown.length === 0 ? (
            <p data-testid="empty-assignments" style={{ padding: "20px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
              Bu gorunumde odev yok.
            </p>
          ) : (
            <ul data-testid="assignment-list" style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
              {shown.map((assignment) => {
                const open = isAssignmentOpen(assignment);
                const color = subjectColor(assignment.subject ?? "Genel");

                return (
                  <li key={assignment.id}>
                    <div className={`lrow${assignment.completed ? " done" : ""}`}>
                      <span
                        className="lr-icon"
                        style={{
                          background: `color-mix(in srgb, ${color} 13%, transparent)`,
                          color,
                        }}
                      >
                        <KiIcon name="ki-notepad-edit" />
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="lr-title">{assignment.title}</div>
                        <div className="lr-meta">
                          <span className="d">{ASSIGNMENT_STATUS_LABELS[assignment.status]}</span>
                          <span className="d">{ASSIGNMENT_PRIORITY_LABELS[assignment.priority]}</span>
                          <span className="d">{ASSIGNMENT_TYPE_LABELS[assignment.type]}</span>
                          {assignment.subject ? <span className="d">{assignment.subject}</span> : null}
                          <span className="d">{formatAssignmentDueDate(assignment.dueDate)}</span>
                        </div>
                      </div>
                      {open ? (
                        <button type="button" className="btn btn-sm btn-primary" onClick={() => void handleComplete(assignment.id)}>
                          Tamamla
                        </button>
                      ) : (
                        <span data-testid={`completed-${assignment.id}`} className="muted" style={{ fontSize: 13 }}>
                          (Tamamlandi)
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </UkSection>
    </div>
  );
}
