"use client";

import { KiIcon } from "@/components/design/KiIcon";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { UkBadge } from "@/components/design/UkBadge";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import { UkStatCard } from "@/components/design/UkStatCard";
import { LIKERT_OPTIONS } from "@/mocks/tests";
import type { PsychTestDefinition, TestAssignmentRecord } from "@uyanik/database";

export function StudentTestsPanel() {
  const [catalog, setCatalog] = useState<PsychTestDefinition[]>([]);
  const [assignments, setAssignments] = useState<TestAssignmentRecord[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch("/api/student/tests", { credentials: "same-origin" });
    if (response.ok) {
      const data = (await response.json()) as {
        catalog: PsychTestDefinition[];
        assignments: TestAssignmentRecord[];
      };
      setCatalog(data.catalog);
      setAssignments(data.assignments);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    setMounted(true);
    void load();
  }, [load]);

  const activeAssignment = assignments.find((a) => a.id === activeId) ?? null;
  const activeTest = activeAssignment ? catalog.find((t) => t.id === activeAssignment.testId) : null;

  const pending = assignments.filter((a) => a.status === "sent");
  const completed = assignments.filter((a) => a.status === "completed");

  function openTest(assignment: TestAssignmentRecord) {
    const test = catalog.find((t) => t.id === assignment.testId);
    if (!test) {
      return;
    }
    setActiveId(assignment.id);
    setAnswers(Array(test.questions.length).fill(3));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!activeId) {
      return;
    }

    setIsSubmitting(true);
    const response = await fetch("/api/student/tests", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignmentId: activeId, answers }),
    });
    setIsSubmitting(false);

    if (response.ok) {
      setActiveId(null);
      setAnswers([]);
      await load();
    }
  }

  return (
    <div className="stack rise" data-testid="student-tests-panel">
      <UkPageHead title="Testlerim" sub="Kocun tarafindan gonderilen envanter testleri" />

      <div className="grid g-4">
        <UkStatCard icon="ki-time" tone="warning" value={pending.length} label="Bekleyen test" />
        <UkStatCard icon="ki-check-circle" tone="success" value={completed.length} label="Tamamlanan" />
        <UkStatCard icon="ki-notepad-edit" tone="primary" value={assignments.length} label="Toplam test" />
      </div>

      <UkSection title="Bekleyen testler" sub={`${pending.length} test`}>
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {isLoading ? (
            <p className="muted" style={{ fontSize: 13 }}>
              Yukleniyor...
            </p>
          ) : pending.length === 0 ? (
            <p className="muted" style={{ fontSize: 13 }}>
              Bekleyen test yok.
            </p>
          ) : (
            pending.map((assignment) => {
              const test = catalog.find((t) => t.id === assignment.testId);
              return (
                <div key={assignment.id} className="lrow">
                  <span className={`stat-icon tone-${test?.tone ?? "primary"}`} style={{ width: 38, height: 38 }}>
                    <KiIcon name={test?.icon ?? "ki-star"} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="lr-title">{test?.name ?? assignment.testId}</div>
                    <div className="lr-meta">
                      <span className="d">{test?.description}</span>
                    </div>
                  </div>
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => openTest(assignment)}>
                    Basla
                  </button>
                </div>
              );
            })
          )}
        </div>
      </UkSection>

      <UkSection title="Tamamlanan testler" sub={`${completed.length} test`}>
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {completed.length === 0 ? (
            <p className="muted" style={{ fontSize: 13 }}>
              Henuz tamamlanan test yok.
            </p>
          ) : (
            completed.map((assignment) => {
              const test = catalog.find((t) => t.id === assignment.testId);
              return (
                <div key={assignment.id} className="lrow done">
                  <span className={`stat-icon tone-${test?.tone ?? "primary"}`} style={{ width: 38, height: 38 }}>
                    <KiIcon name={test?.icon ?? "ki-star"} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="lr-title">{test?.name ?? assignment.testId}</div>
                    <div className="lr-meta">
                      {assignment.band ? (
                        <UkBadge tone={(assignment.bandTone as "success" | "warning" | "danger") ?? "muted"}>
                          {assignment.band}
                        </UkBadge>
                      ) : null}
                      {assignment.score != null ? (
                        <span className="d tnum">Skor: {assignment.score.toFixed(1)}</span>
                      ) : null}
                    </div>
                  </div>
                  <UkBadge tone="success">Tamamlandi</UkBadge>
                </div>
              );
            })
          )}
        </div>
      </UkSection>

      {activeTest && activeAssignment && mounted
        ? createPortal(
            <div className="modal-overlay" onClick={() => setActiveId(null)}>
              <div
                className="modal-panel"
                style={{ maxWidth: 640, maxHeight: "90vh", display: "flex", flexDirection: "column" }}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="modal-head">
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800 }}>{activeTest.name}</h3>
                    <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>
                      {activeTest.description}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="icon-btn"
                    style={{ width: 36, height: 36 }}
                    onClick={() => setActiveId(null)}
                    aria-label="Kapat"
                  >
                    <KiIcon name="ki-plus" size={18} style={{ transform: "rotate(45deg)" }} />
                  </button>
                </div>
                <form
                  onSubmit={handleSubmit}
                  className="modal-body"
                  style={{ gap: 18, overflowY: "auto", flex: 1, display: "flex", flexDirection: "column" }}
                >
                  {activeTest.questions.map((question, index) => (
                    <div key={`${question.text}-${index}`} className="field">
                      <p className="label" style={{ marginBottom: 8 }}>
                        {index + 1}. {question.text}
                      </p>
                      <div className="filters" style={{ flexWrap: "wrap" }}>
                        {LIKERT_OPTIONS.map((label, scoreIndex) => {
                          const score = scoreIndex + 1;
                          return (
                            <button
                              key={label}
                              type="button"
                              className={answers[index] === score ? "on" : ""}
                              onClick={() =>
                                setAnswers((current) => current.map((v, i) => (i === index ? score : v)))
                              }
                            >
                              {score} · {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  <div className="modal-foot" style={{ justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
                    <button type="button" className="btn btn-light" onClick={() => setActiveId(null)}>
                      Iptal
                    </button>
                    <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                      {isSubmitting ? "Gonderiliyor..." : "Testi tamamla"}
                    </button>
                  </div>
                </form>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
