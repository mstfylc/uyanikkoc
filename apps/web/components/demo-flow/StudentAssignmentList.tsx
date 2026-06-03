"use client";

import { useCallback, useEffect, useState } from "react";

type AssignmentItem = {
  id: string;
  title: string;
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
    <ul data-testid="assignment-list">
      {assignments.map((assignment) => (
        <li key={assignment.id}>
          <span>{assignment.title}</span>
          {assignment.completed ? (
            <span data-testid={`completed-${assignment.id}`}> (Tamamlandi)</span>
          ) : (
            <button type="button" onClick={() => void handleComplete(assignment.id)}>
              Tamamla
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
