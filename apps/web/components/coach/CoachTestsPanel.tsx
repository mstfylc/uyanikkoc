"use client";

import { KiIcon } from "@/components/design/KiIcon";
import { useCallback, useEffect, useMemo, useState } from "react";

import { TestSendModal } from "@/components/coach/TestSendModal";
import { TestBuilderModal } from "@/components/coach/TestBuilderModal";
import { UkBadge } from "@/components/design/UkBadge";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import { UkStatCard } from "@/components/design/UkStatCard";
import type { CoachRosterEntry, PsychTestDefinition, TestAssignmentRecord } from "@uyanik/database";

export function CoachTestsPanel() {
  const [catalog, setCatalog] = useState<PsychTestDefinition[]>([]);
  const [assignments, setAssignments] = useState<TestAssignmentRecord[]>([]);
  const [students, setStudents] = useState<CoachRosterEntry[]>([]);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    }

    if (studentsResponse.ok) {
      const data = (await studentsResponse.json()) as { students: CoachRosterEntry[] };
      setStudents(data.students);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const completed = useMemo(() => assignments.filter((item) => item.status === "completed").length, [assignments]);
  const pending = useMemo(() => assignments.filter((item) => item.status !== "completed").length, [assignments]);

  async function saveCoachNote(assignmentId: string) {
    const coachNote = noteDrafts[assignmentId] ?? "";
    const response = await fetch("/api/coach/tests", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignmentId, coachNote }),
    });
    if (response.ok) {
      setEditingNoteId(null);
      await load();
    }
  }

  return (
    <div className="stack rise" data-testid="coach-tests-panel">
      <UkPageHead
        title="Envanter ve Testler"
        sub="Psikolojik testleri öğrencilere gönder"
        actions={
          <div className="row" style={{ gap: 8 }}>
            <button type="button" className="btn btn-light" onClick={() => setBuilderOpen(true)}>
              <KiIcon name="ki-notepad-edit" />
              Test oluştur
            </button>
            <button type="button" className="btn btn-primary" onClick={() => setSendModalOpen(true)}>
              <KiIcon name="ki-send" />
              Test gönder
            </button>
          </div>
        }
      />

      <div className="grid g-4">
        <UkStatCard icon="ki-star" tone="primary" value={catalog.length} label="Test katalogu" />
        <UkStatCard icon="ki-send" tone="info" value={assignments.length} label="Gönderilen test" />
        <UkStatCard icon="ki-check-circle" tone="success" value={completed} label="Tamamlanan" />
        <UkStatCard icon="ki-time" tone="warning" value={pending} label="Bekleyen" />
      </div>

      <UkSection title="Test katalogu" sub={`${catalog.length} test`}>
        <div className="card-body grid g-4">
          {isLoading ? (
            <p className="muted" style={{ fontSize: 13 }}>
              Yükleniyor...
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

      <UkSection title="Gönderilen testler" sub={`${assignments.length} atama`}>
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {assignments.length === 0 ? (
            <p className="muted" style={{ fontSize: 13 }}>
              Henüz test gönderilmedi.
            </p>
          ) : (
            assignments.map((assignment) => {
              const test = catalog.find((item) => item.id === assignment.testId);
              const isEditing = editingNoteId === assignment.id;
              const draft = noteDrafts[assignment.id] ?? assignment.coachNote;

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
                        {assignment.status === "completed" ? "Tamamlandı" : "Bekliyor"}
                      </UkBadge>
                      {assignment.band ? <span className="d">{assignment.band}</span> : null}
                    </div>
                    {isEditing ? (
                      <div className="row" style={{ gap: 8 }}>
                        <input
                          className="input"
                          style={{ flex: 1 }}
                          value={draft}
                          onChange={(event) =>
                            setNoteDrafts((current) => ({ ...current, [assignment.id]: event.target.value }))
                          }
                          placeholder="Koç notu"
                          autoFocus
                        />
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => void saveCoachNote(assignment.id)}
                        >
                          Kaydet
                        </button>
                        <button
                          type="button"
                          className="btn btn-light btn-sm"
                          onClick={() => setEditingNoteId(null)}
                        >
                          İptal
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-light btn-sm"
                        style={{ justifyContent: "flex-start", width: "100%", textAlign: "left" }}
                        onClick={() => {
                          setEditingNoteId(assignment.id);
                          setNoteDrafts((current) => ({
                            ...current,
                            [assignment.id]: assignment.coachNote || "",
                          }));
                        }}
                      >
                        <KiIcon name="ki-notepad-edit" size={14} />
                        {assignment.coachNote?.trim() ? assignment.coachNote : "Koç notu ekle..."}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </UkSection>

      <TestSendModal
        open={sendModalOpen}
        onClose={() => setSendModalOpen(false)}
        students={students}
        catalog={catalog}
        onSent={() => void load()}
      />

      <TestBuilderModal
        open={builderOpen}
        onClose={() => setBuilderOpen(false)}
        onCreated={() => void load()}
      />
    </div>
  );
}
