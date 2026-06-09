"use client";

import { useCallback, useEffect, useState } from "react";

import {
  ASSIGNMENT_PRIORITY_LABELS,
  ASSIGNMENT_STATUS_LABELS,
  ASSIGNMENT_TYPE_LABELS,
  formatAssignmentDueDate,
  isAssignmentOpen,
} from "@/lib/assignment-labels";
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

  if (isLoading) {
    return <p>Yukleniyor...</p>;
  }

  if (error) {
    return <p role="alert">{error}</p>;
  }

  if (assignments.length === 0) {
    return <p data-testid="empty-assignments">Henuz odev yok.</p>;
  }

  return (
    <ul data-testid="assignment-list" className="flex flex-col gap-3">
      {assignments.map((assignment) => {
        const open = isAssignmentOpen(assignment);

        return (
          <li
            key={assignment.id}
            className="rounded-lg border border-border px-4 py-3 flex flex-col gap-2"
          >
            <div className="font-medium">{assignment.title}</div>
            <div className="text-sm text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
              <span>Durum: {ASSIGNMENT_STATUS_LABELS[assignment.status]}</span>
              <span>Oncelik: {ASSIGNMENT_PRIORITY_LABELS[assignment.priority]}</span>
              <span>Tur: {ASSIGNMENT_TYPE_LABELS[assignment.type]}</span>
              {assignment.subject ? <span>Ders: {assignment.subject}</span> : null}
              <span>Son tarih: {formatAssignmentDueDate(assignment.dueDate)}</span>
            </div>
            {open ? (
              <button type="button" onClick={() => void handleComplete(assignment.id)}>
                Tamamla
              </button>
            ) : (
              <span data-testid={`completed-${assignment.id}`} className="text-success text-sm">
                (Tamamlandi)
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
