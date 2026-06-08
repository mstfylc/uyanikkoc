"use client";

import { KiIcon } from "@/components/design/KiIcon";
import { useCallback, useEffect, useMemo, useState } from "react";

import { UkBadge } from "@/components/design/UkBadge";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import { UkStatCard } from "@/components/design/UkStatCard";
import {
  ASSIGNMENT_PRIORITY_LABELS,
  ASSIGNMENT_STATUS_LABELS,
  ASSIGNMENT_TYPE_LABELS,
  formatAssignmentDueDate,
  isAssignmentOpen,
} from "@/lib/assignment-labels";
import {
  ASSIGNMENT_WEEKS,
  defaultQuestionTarget,
  weekIdForAssignment,
} from "@/lib/design/assignment-weeks";
import { subjectColor } from "@/lib/design/subject-colors";
import { StudentResourcesCard } from "@/components/student/StudentResourcesCard";
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
  createdAt?: string;
  result?: { correct: number; wrong: number; blank: number; net: number } | null;
};

type ResultDraft = {
  correct: string;
  wrong: string;
  blank: string;
};

export function StudentAssignmentList() {
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [week, setWeek] = useState("w0");
  const [filter, setFilter] = useState<"pending" | "done" | "all">("pending");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resultTarget, setResultTarget] = useState<AssignmentItem | null>(null);
  const [resultDraft, setResultDraft] = useState<ResultDraft>({ correct: "", wrong: "", blank: "" });
  const [isSavingResult, setIsSavingResult] = useState(false);

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

  const weekAssignments = useMemo(
    () => assignments.filter((item) => weekIdForAssignment(item) === week),
    [assignments, week],
  );

  const weekPending = weekAssignments.filter((item) => !item.completed).length;
  const weekDone = weekAssignments.filter((item) => item.completed).length;
  const weekQuestionTotal = weekAssignments.reduce((sum, item) => {
    if (item.result) {
      return sum + item.result.correct + item.result.wrong + item.result.blank;
    }
    return sum + defaultQuestionTarget(item.type);
  }, 0);
  const weekCompletionPct =
    weekAssignments.length === 0 ? 0 : Math.round((weekDone / weekAssignments.length) * 100);

  const shown = weekAssignments.filter((item) => {
    if (filter === "all") return true;
    if (filter === "done") return item.completed;
    return !item.completed;
  });

  const weekHasData = (weekId: string) => assignments.some((item) => weekIdForAssignment(item) === weekId);

  function openResultModal(assignment: AssignmentItem) {
    setResultTarget(assignment);
    setResultDraft({ correct: "", wrong: "", blank: "" });
  }

  async function completeAssignment(assignmentId: string) {
    setError(null);
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

    setFilter("all");
    await loadAssignments();
  }

  async function submitResult(event: React.FormEvent) {
    event.preventDefault();
    if (!resultTarget) {
      return;
    }

    setIsSavingResult(true);
    setError(null);
    const response = await fetch("/api/student/assignments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        assignmentId: resultTarget.id,
        result: {
          correct: Number(resultDraft.correct) || 0,
          wrong: Number(resultDraft.wrong) || 0,
          blank: Number(resultDraft.blank) || 0,
        },
      }),
    });
    setIsSavingResult(false);

    if (!response.ok) {
      setError("Sonuc kaydedilemedi.");
      return;
    }

    setResultTarget(null);
    await loadAssignments();
  }

  const previewNet = (Number(resultDraft.correct) || 0) - (Number(resultDraft.wrong) || 0) / 4;

  return (
    <div className="stack rise">
      <UkPageHead title="Odevlerim" sub={`${weekPending} bekleyen gorev · ${ASSIGNMENT_WEEKS.find((w) => w.id === week)?.label}`} />

      {error ? (
        <p role="alert" className="badge badge-danger" style={{ height: "auto", padding: "10px 12px" }}>
          {error}
        </p>
      ) : null}

      <div className="seg" style={{ width: "fit-content", flexWrap: "wrap" }}>
        {ASSIGNMENT_WEEKS.map((w) => (
          <button
            key={w.id}
            type="button"
            className={week === w.id ? "on" : ""}
            onClick={() => setWeek(w.id)}
            disabled={!weekHasData(w.id)}
            style={{ opacity: weekHasData(w.id) ? 1 : 0.45 }}
          >
            {w.label}
          </button>
        ))}
      </div>

      <div className="grid g-4">
        <UkStatCard icon="ki-time" tone="warning" value={weekPending} label="Bekleyen odev" />
        <UkStatCard icon="ki-check-circle" tone="success" value={weekDone} label="Tamamlanan" />
        <UkStatCard icon="ki-notepad-edit" tone="info" value={weekQuestionTotal} label="Hafta toplam soru" />
        <UkStatCard icon="ki-chart-pie-simple" tone="primary" value={`%${weekCompletionPct}`} label="Tamamlama" />
      </div>

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
                        {assignment.description ? (
                          <div className="muted" style={{ fontSize: 12, marginTop: 5 }}>
                            {assignment.description}
                          </div>
                        ) : null}
                      </div>
                      {open ? (
                        <div className="row" style={{ gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                          <button type="button" className="btn btn-sm btn-primary" onClick={() => openResultModal(assignment)}>
                            Sonuc Gir
                          </button>
                          <button type="button" className="btn btn-sm btn-light" onClick={() => void completeAssignment(assignment.id)}>
                            Tamamla
                          </button>
                        </div>
                      ) : (
                        <UkBadge tone="success">(Tamamlandi)</UkBadge>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </UkSection>

      <StudentResourcesCard />

      {resultTarget ? (
        <div className="modal-overlay" onClick={() => setResultTarget(null)}>
          <div className="modal-panel" style={{ maxWidth: 420 }} onClick={(event) => event.stopPropagation()}>
            <div className="card-head">
              <h3>Sonuc gir</h3>
              <p className="muted" style={{ fontSize: 12.5, marginTop: 4 }}>
                {resultTarget.title}
              </p>
            </div>
            <form onSubmit={submitResult} className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="grid g-3">
                <div className="field">
                  <label className="label" htmlFor="result-correct">
                    Dogru
                  </label>
                  <input
                    id="result-correct"
                    className="input tnum"
                    type="number"
                    min={0}
                    value={resultDraft.correct}
                    onChange={(event) => setResultDraft((current) => ({ ...current, correct: event.target.value }))}
                  />
                </div>
                <div className="field">
                  <label className="label" htmlFor="result-wrong">
                    Yanlis
                  </label>
                  <input
                    id="result-wrong"
                    className="input tnum"
                    type="number"
                    min={0}
                    value={resultDraft.wrong}
                    onChange={(event) => setResultDraft((current) => ({ ...current, wrong: event.target.value }))}
                  />
                </div>
                <div className="field">
                  <label className="label" htmlFor="result-blank">
                    Bos
                  </label>
                  <input
                    id="result-blank"
                    className="input tnum"
                    type="number"
                    min={0}
                    value={resultDraft.blank}
                    onChange={(event) => setResultDraft((current) => ({ ...current, blank: event.target.value }))}
                  />
                </div>
              </div>
              <div className="badge badge-primary" style={{ height: "auto", padding: "10px 12px" }}>
                Net: <span className="tnum">{previewNet.toFixed(2)}</span>
              </div>
              <div className="row" style={{ gap: 10, justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-light" onClick={() => setResultTarget(null)}>
                  Iptal
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSavingResult}>
                  {isSavingResult ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
