"use client";

import type { CoachRosterEntry, ResultExamType } from "@uyanik/database";
import { FormEvent, useEffect, useState } from "react";

import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import { ExamImportPanel } from "@/components/coach/ExamImportPanel";

type SubjectRow = {
  subjectName: string;
  correct: string;
  wrong: string;
};

const EXAM_TYPES: ResultExamType[] = ["TYT", "AYT", "LGS"];

const DEFAULT_SUBJECTS: SubjectRow[] = [
  { subjectName: "Turkce", correct: "", wrong: "" },
  { subjectName: "Matematik", correct: "", wrong: "" },
  { subjectName: "Fen", correct: "", wrong: "" },
  { subjectName: "Sosyal", correct: "", wrong: "" },
];

export function CoachExamEntryForm() {
  const [studentId, setStudentId] = useState("");
  const [examType, setExamType] = useState<ResultExamType>("TYT");
  const [label, setLabel] = useState("");
  const [takenAt, setTakenAt] = useState(new Date().toISOString().slice(0, 10));
  const [subjects, setSubjects] = useState<SubjectRow[]>(DEFAULT_SUBJECTS);
  const [students, setStudents] = useState<CoachRosterEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    }

    void loadStudents();
  }, []);

  function updateSubject(index: number, field: keyof SubjectRow, value: string) {
    setSubjects((current) =>
      current.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row)),
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const parsedSubjects = subjects
      .map((row) => ({
        subjectName: row.subjectName.trim(),
        correct: Number(row.correct),
        wrong: Number(row.wrong),
      }))
      .filter((row) => row.subjectName && !Number.isNaN(row.correct) && !Number.isNaN(row.wrong));

    if (parsedSubjects.length === 0) {
      setError("En az bir ders satiri gerekli.");
      return;
    }

    setIsSubmitting(true);
    const response = await fetch("/api/coach/exams", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId,
        examType,
        label: label.trim() || null,
        takenAt: new Date(takenAt).toISOString(),
        subjects: parsedSubjects,
      }),
    });
    setIsSubmitting(false);

    if (!response.ok) {
      setError("Deneme sonucu kaydedilemedi.");
      return;
    }

    setSuccess("Deneme sonucu kaydedildi.");
    setLabel("");
    setSubjects(DEFAULT_SUBJECTS.map((row) => ({ ...row, correct: "", wrong: "" })));
  }

  return (
    <div className="stack rise">
      <UkPageHead title="Deneme Girisi" sub="Ogrenci adina TYT/AYT/LGS sonucu kaydet" />

      <UkSection title="Manuel sonuc">
        <form
          onSubmit={handleSubmit}
          data-testid="coach-exam-entry-form"
          className="card-body"
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          <div className="grid g-2">
            <div className="field">
              <label className="label" htmlFor="studentId">
                Ogrenci
              </label>
              <select
                id="studentId"
                value={studentId}
                onChange={(event) => setStudentId(event.target.value)}
                className="select"
              >
                {students.map((student) => (
                  <option key={student.studentId} value={student.studentId}>
                    {student.displayName}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label className="label" htmlFor="examType">
                Sinav turu
              </label>
              <select
                id="examType"
                value={examType}
                onChange={(event) => setExamType(event.target.value as ResultExamType)}
                className="select"
              >
                {EXAM_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid g-2">
            <div className="field">
              <label className="label" htmlFor="label">
                Etiket
              </label>
              <input
                id="label"
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                placeholder="TYT Deneme 3"
                className="input"
              />
            </div>

            <div className="field">
              <label className="label" htmlFor="takenAt">
                Tarih
              </label>
              <input
                id="takenAt"
                type="date"
                value={takenAt}
                onChange={(event) => setTakenAt(event.target.value)}
                className="input"
              />
            </div>
          </div>

          <div>
            <p className="label" style={{ marginBottom: 10 }}>
              Ders satirlari
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {subjects.map((row, index) => (
                <div key={row.subjectName} className="grid g-3" style={{ gap: 8 }}>
                  <input
                    value={row.subjectName}
                    onChange={(event) => updateSubject(index, "subjectName", event.target.value)}
                    className="input"
                  />
                  <input
                    type="number"
                    min={0}
                    placeholder="Dogru"
                    value={row.correct}
                    onChange={(event) => updateSubject(index, "correct", event.target.value)}
                    className="input"
                  />
                  <input
                    type="number"
                    min={0}
                    placeholder="Yanlis"
                    value={row.wrong}
                    onChange={(event) => updateSubject(index, "wrong", event.target.value)}
                    className="input"
                  />
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="btn btn-primary w-fit">
            {isSubmitting ? "Kaydediliyor..." : "Sonucu kaydet"}
          </button>

          {error ? (
            <p role="alert" className="badge badge-danger" style={{ height: "auto", padding: "10px 12px" }}>
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="badge badge-success" style={{ height: "auto", padding: "10px 12px" }}>
              {success}
            </p>
          ) : null}
        </form>
      </UkSection>

      <ExamImportPanel />
    </div>
  );
}
