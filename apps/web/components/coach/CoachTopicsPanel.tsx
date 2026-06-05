"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

import { UkBadge } from "@/components/design/UkBadge";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import { UkStatCard } from "@/components/design/UkStatCard";
import { subjectColor } from "@/lib/design/subject-colors";
import { NOTE_KIND_LABELS } from "@/mocks/coach-notes";
import { SCHOOL_DAYS, SCHOOL_PERIODS } from "@/mocks/schedule";
import { TOPIC_EXAM_TYPE_LABELS } from "@uyanik/shared";
import type {
  CoachNoteKind,
  CoachRosterEntry,
  CoachStudentNoteRecord,
  SchoolScheduleRecord,
  SubjectRecord,
  TopicTrackingSummary,
} from "@uyanik/database";

export function CoachTopicsPanel() {
  const [students, setStudents] = useState<CoachRosterEntry[]>([]);
  const [studentId, setStudentId] = useState("");
  const [subjects, setSubjects] = useState<SubjectRecord[]>([]);
  const [summary, setSummary] = useState<TopicTrackingSummary | null>(null);
  const [schedule, setSchedule] = useState<SchoolScheduleRecord | null>(null);
  const [notes, setNotes] = useState<CoachStudentNoteRecord[]>([]);
  const [noteText, setNoteText] = useState("");
  const [noteKind, setNoteKind] = useState<CoachNoteKind>("general");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingNote, setIsSavingNote] = useState(false);

  useEffect(() => {
    async function loadStudents() {
      const response = await fetch("/api/coach/students", { credentials: "same-origin" });
      if (response.ok) {
        const data = (await response.json()) as { students: CoachRosterEntry[] };
        setStudents(data.students);
        if (data.students[0]) {
          setStudentId(data.students[0].studentId);
        }
      }
      setIsLoading(false);
    }
    void loadStudents();
  }, []);

  const loadStudentData = useCallback(async () => {
    if (!studentId) {
      return;
    }

    const [topicsResponse, notesResponse] = await Promise.all([
      fetch(`/api/coach/students/topics?studentId=${encodeURIComponent(studentId)}`, {
        credentials: "same-origin",
      }),
      fetch(`/api/coach/notes?studentId=${encodeURIComponent(studentId)}`, {
        credentials: "same-origin",
      }),
    ]);

    if (topicsResponse.ok) {
      const data = (await topicsResponse.json()) as {
        topics: { subjects: SubjectRecord[]; summary: TopicTrackingSummary };
        schedule: SchoolScheduleRecord;
      };
      setSubjects(data.topics.subjects);
      setSummary(data.topics.summary);
      setSchedule(data.schedule);
    }

    if (notesResponse.ok) {
      const data = (await notesResponse.json()) as { notes: CoachStudentNoteRecord[] };
      setNotes(data.notes);
    }
  }, [studentId]);

  useEffect(() => {
    void loadStudentData();
  }, [loadStudentData]);

  async function handleAddNote(event: FormEvent) {
    event.preventDefault();
    if (!studentId || !noteText.trim()) {
      return;
    }

    setIsSavingNote(true);
    const response = await fetch("/api/coach/notes", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, text: noteText.trim(), kind: noteKind }),
    });
    setIsSavingNote(false);

    if (response.ok) {
      setNoteText("");
      await loadStudentData();
    }
  }

  const selectedStudent = students.find((s) => s.studentId === studentId);

  return (
    <div className="stack rise" data-testid="coach-topics-panel">
      <UkPageHead title="Konu Takibi" sub="Ogrenci konu ilerlemesi ve notlar" />

      <div className="field" style={{ maxWidth: 360 }}>
        <label className="label" htmlFor="coach-student-select">
          Ogrenci
        </label>
        <select
          id="coach-student-select"
          className="select"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        >
          {students.map((s) => (
            <option key={s.studentId} value={s.studentId}>
              {s.displayName}
            </option>
          ))}
        </select>
      </div>

      {summary ? (
        <div className="grid g-4">
          <UkStatCard
            icon="ki-book-open"
            tone="primary"
            value={`${summary.completedTopics}/${summary.totalTopics}`}
            label="Konu tamamlama"
          />
          <UkStatCard icon="ki-chart-pie-simple" tone="success" value={`${summary.completionRate}%`} label="Oran" />
          <UkStatCard icon="ki-people" tone="info" value={subjects.length} label="Ders sayisi" />
          <UkStatCard
            icon="ki-calendar"
            tone="warning"
            value={schedule?.attendsSchool ? "Okul" : "Ev"}
            label="Program tipi"
          />
        </div>
      ) : null}

      <div className="grid col-main">
        <UkSection title="Konu listesi" sub={selectedStudent?.displayName ?? "Ogrenci secin"}>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {isLoading ? (
              <p className="muted" style={{ fontSize: 13 }}>
                Yukleniyor...
              </p>
            ) : subjects.length === 0 ? (
              <p className="muted" style={{ fontSize: 13 }}>
                Konu kaydi yok.
              </p>
            ) : (
              subjects.map((subject) => {
                const total = subject.topics.length;
                const done = subject.topics.filter((t) => t.progress.completed).length;
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                return (
                  <div key={subject.id}>
                    <div className="between" style={{ marginBottom: 8 }}>
                      <span className="sname">
                        <span className="swatch" style={{ background: subjectColor(subject.name) }} />
                        {subject.name}
                      </span>
                      <span className="spct tnum">{pct}%</span>
                    </div>
                    <div className="bar" style={{ marginBottom: 8 }}>
                      <span style={{ width: `${pct}%`, background: subjectColor(subject.name) }} />
                    </div>
                    <div className="row" style={{ flexWrap: "wrap", gap: 6 }}>
                      <UkBadge tone="muted">{TOPIC_EXAM_TYPE_LABELS[subject.examType]}</UkBadge>
                      {subject.topics.map((topic) => (
                        <UkBadge key={topic.id} tone={topic.progress.completed ? "success" : "muted"}>
                          {topic.name}
                        </UkBadge>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </UkSection>

        <UkSection title="Okul programi" sub={schedule?.attendsSchool ? "Haftalik grid" : "Okula gitmiyor"}>
          <div className="card-body" style={{ overflowX: "auto" }}>
            {!schedule?.attendsSchool ? (
              <p className="muted" style={{ fontSize: 13 }}>
                Ogrenci okula gitmiyor olarak isaretli.
              </p>
            ) : (
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Saat</th>
                    {SCHOOL_DAYS.map((day) => (
                      <th key={day}>{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: SCHOOL_PERIODS }, (_, period) => (
                    <tr key={period}>
                      <td className="tnum">{period + 1}</td>
                      {SCHOOL_DAYS.map((day) => (
                        <td key={day}>{schedule.grid[day]?.[period] || "—"}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </UkSection>
      </div>

      <UkSection title="Ogrenci notlari" sub={`${notes.length} not`}>
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <form onSubmit={handleAddNote} className="stack" style={{ gap: 10 }}>
            <div className="grid g-2">
              <div className="field">
                <label className="label" htmlFor="note-kind">
                  Not turu
                </label>
                <select
                  id="note-kind"
                  className="select"
                  value={noteKind}
                  onChange={(e) => setNoteKind(e.target.value as CoachNoteKind)}
                >
                  {(Object.keys(NOTE_KIND_LABELS) as CoachNoteKind[]).map((kind) => (
                    <option key={kind} value={kind}>
                      {NOTE_KIND_LABELS[kind].label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="field">
              <label className="label" htmlFor="note-text">
                Not
              </label>
              <textarea
                id="note-text"
                className="input"
                rows={3}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Ogrenci hakkinda not ekle"
              />
            </div>
            <button type="submit" disabled={isSavingNote} className="btn btn-primary w-fit">
              {isSavingNote ? "Kaydediliyor..." : "Not ekle"}
            </button>
          </form>

          {notes.length === 0 ? (
            <p className="muted" style={{ fontSize: 13 }}>
              Henuz not yok.
            </p>
          ) : (
            notes.map((note) => {
              const meta = NOTE_KIND_LABELS[note.kind];
              return (
                <div key={note.id} className="lrow">
                  <span className={`stat-icon tone-${meta.tone}`} style={{ width: 38, height: 38 }}>
                    <i className={`ki-filled ${meta.icon}`} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="lr-title">{meta.label}</div>
                    <div className="lr-meta">
                      <span className="d">{note.text}</span>
                    </div>
                  </div>
                  {note.pinned ? <UkBadge tone="warning">Sabit</UkBadge> : null}
                </div>
              );
            })
          )}
        </div>
      </UkSection>
    </div>
  );
}
