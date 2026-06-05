"use client";

import { KiIcon } from "@/components/design/KiIcon";
import { FormEvent, useCallback, useEffect, useState } from "react";

import { UkBadge } from "@/components/design/UkBadge";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import type { CoachRosterEntry, PsychTestDefinition, TestAssignmentRecord } from "@uyanik/database";

export function CoachTestsPanel() {
  const [catalog, setCatalog] = useState<PsychTestDefinition[]>([]);
  const [assignments, setAssignments] = useState<TestAssignmentRecord[]>([]);
  const [students, setStudents] = useState<CoachRosterEntry[]>([]);
  const [sendStudentId, setSendStudentId] = useState("");
  const [sendTestId, setSendTestId] = useState("");
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const load = useCallback(async () => {
    const [testsResponse, studentsResponse] = await Promise.all([
      fetch("/api/coach/tests", { credentials: "same-origin" }),
      fetch("/api/coach/students", { credentials: "same-origin" }),
    ]);

    if (testsResponse.ok) {
      const data = (await testsResponse.json()) as {
        catalog: PsychTestDefinition[];
        assignments: TestAssignmentRecord[];
      };
      setCatalog(data.catalog);
      setAssignments(data.assignments);
      if (data.catalog[0]) {
        setSendTestId(data.catalog[0].id);
      }
    }

    if (studentsResponse.ok) {
      const data = (await studentsResponse.json()) as { students: CoachRosterEntry[] };
      setStudents(data.students);
      if (data.students[0]) {
        setSendStudentId(data.students[0].studentId);
      }
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSend(event: FormEvent) {
    event.preventDefault();
    if (!sendStudentId || !sendTestId) {
      return;
    }

    setIsSending(true);
    const response = await fetch("/api/coach/tests", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: sendStudentId, testId: sendTestId }),
    });
    setIsSending(false);

    if (response.ok) {
      await load();
    }
  }

  async function saveCoachNote(assignmentId: string) {
    const coachNote = noteDrafts[assignmentId] ?? "";
    const response = await fetch("/api/coach/tests", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignmentId, coachNote }),
    });
    if (response.ok) {
      await load();
    }
  }

  return (
    <div className="stack rise" data-testid="coach-tests-panel">
      <UkPageHead title="Envanter ve Testler" sub="Psikolojik testleri ogrencilere gonder" />

      <UkSection title="Test katalogu" sub={`${catalog.length} test`}>
        <div className="card-body grid g-4">
          {isLoading ? (
            <p className="muted" style={{ fontSize: 13 }}>
              Yukleniyor...
            </p>
          ) : (
            catalog.map((test) => (
              <div key={test.id} className="card">
                <div className="card-pad">
                  <div className="row" style={{ gap: 10, marginBottom: 8 }}>
                    <span className={`stat-icon tone-${test.tone}`} style={{ width: 40, height: 40 }}>
                      <KiIcon name={test.icon} />
                    </span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{test.name}</div>
                      <div className="muted" style={{ fontSize: 12.5 }}>{test.description}</div>
                    </div>
                  </div>
                  <UkBadge tone="muted">{test.questions.length} soru</UkBadge>
                </div>
              </div>
            ))
          )}
        </div>
      </UkSection>

      <UkSection title="Test gonder" sub="Ogrenci sec ve test ata">
        <form onSubmit={handleSend} className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="grid g-2">
            <div className="field">
              <label className="label" htmlFor="send-student">
                Ogrenci
              </label>
              <select
                id="send-student"
                className="select"
                value={sendStudentId}
                onChange={(e) => setSendStudentId(e.target.value)}
              >
                {students.map((s) => (
                  <option key={s.studentId} value={s.studentId}>
                    {s.displayName}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="label" htmlFor="send-test">
                Test
              </label>
              <select
                id="send-test"
                className="select"
                value={sendTestId}
                onChange={(e) => setSendTestId(e.target.value)}
              >
                {catalog.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" disabled={isSending} className="btn btn-primary w-fit">
            {isSending ? "Gonderiliyor..." : "Test gonder"}
          </button>
        </form>
      </UkSection>

      <UkSection title="Gonderilen testler" sub={`${assignments.length} atama`}>
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {assignments.length === 0 ? (
            <p className="muted" style={{ fontSize: 13 }}>
              Henuz test gonderilmedi.
            </p>
          ) : (
            assignments.map((assignment) => {
              const test = catalog.find((t) => t.id === assignment.testId);
              return (
                <div key={assignment.id} className="lrow" style={{ alignItems: "flex-start" }}>
                  <span className={`stat-icon tone-${test?.tone ?? "primary"}`} style={{ width: 38, height: 38 }}>
                    <KiIcon name={test?.icon ?? "ki-star"} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="lr-title">
                      {assignment.studentName} · {test?.name ?? assignment.testId}
                    </div>
                    <div className="lr-meta" style={{ marginBottom: 8 }}>
                      <UkBadge tone={assignment.status === "completed" ? "success" : "warning"}>
                        {assignment.status === "completed" ? "Tamamlandi" : "Bekliyor"}
                      </UkBadge>
                      {assignment.band ? <span className="d">{assignment.band}</span> : null}
                    </div>
                    <div className="row" style={{ gap: 8 }}>
                      <input
                        className="input"
                        style={{ flex: 1 }}
                        value={noteDrafts[assignment.id] ?? assignment.coachNote}
                        onChange={(e) =>
                          setNoteDrafts((current) => ({ ...current, [assignment.id]: e.target.value }))
                        }
                        placeholder="Koc notu"
                      />
                      <button
                        type="button"
                        className="btn btn-light btn-sm"
                        onClick={() => void saveCoachNote(assignment.id)}
                      >
                        Kaydet
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </UkSection>
    </div>
  );
}
