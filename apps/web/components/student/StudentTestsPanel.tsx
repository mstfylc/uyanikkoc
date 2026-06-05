"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

import { UkBadge } from "@/components/design/UkBadge";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import { LIKERT_OPTIONS } from "@/mocks/tests";
import type { PsychTestDefinition, TestAssignmentRecord } from "@uyanik/database";

export function StudentTestsPanel() {
  const [catalog, setCatalog] = useState<PsychTestDefinition[]>([]);
  const [assignments, setAssignments] = useState<TestAssignmentRecord[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
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
    void load();
  }, [load]);

  const activeAssignment = assignments.find((a) => a.id === activeId) ?? null;
  const activeTest = activeAssignment ? catalog.find((t) => t.id === activeAssignment.testId) : null;

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

  const pending = assignments.filter((a) => a.status === "sent");
  const completed = assignments.filter((a) => a.status === "completed");

  return (
    <div className="stack rise" data-testid="student-tests-panel">
      <UkPageHead title="Testlerim" sub="Kocun tarafindan gonderilen envanter testleri" />

      {activeTest && activeAssignment ? (
        <UkSection title={activeTest.name} sub={activeTest.description}>
          <form onSubmit={handleSubmit} className="card-body" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {activeTest.questions.map((question, index) => (
              <div key={question} className="field">
                <p className="label" style={{ marginBottom: 8 }}>
                  {index + 1}. {question}
                </p>
                <div className="filters">
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
            <div className="row" style={{ gap: 8 }}>
              <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                {isSubmitting ? "Gonderiliyor..." : "Testi tamamla"}
              </button>
              <button type="button" className="btn btn-light" onClick={() => setActiveId(null)}>
                Iptal
              </button>
            </div>
          </form>
        </UkSection>
      ) : (
        <>
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
                        <i className={`ki-filled ${test?.icon ?? "ki-star"}`} />
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
                        <i className={`ki-filled ${test?.icon ?? "ki-star"}`} />
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
        </>
      )}
    </div>
  );
}
