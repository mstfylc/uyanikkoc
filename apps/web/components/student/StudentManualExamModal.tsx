"use client";

import type { ResultExamType } from "@uyanik/database";
import { FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { KiIcon } from "@/components/design/KiIcon";

type SubjectRow = {
  subjectName: string;
  correct: string;
  wrong: string;
};

const EXAM_TYPES: ResultExamType[] = ["TYT", "AYT", "LGS"];

const DEFAULT_SUBJECTS: SubjectRow[] = [
  { subjectName: "Türkçe", correct: "", wrong: "" },
  { subjectName: "Matematik", correct: "", wrong: "" },
  { subjectName: "Fen", correct: "", wrong: "" },
  { subjectName: "Sosyal", correct: "", wrong: "" },
];

type StudentManualExamModalProps = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
};

export function StudentManualExamModal({ open, onClose, onSaved }: StudentManualExamModalProps) {
  const [mounted, setMounted] = useState(false);
  const [examType, setExamType] = useState<ResultExamType>("TYT");
  const [label, setLabel] = useState("");
  const [takenAt, setTakenAt] = useState(new Date().toISOString().slice(0, 10));
  const [subjects, setSubjects] = useState<SubjectRow[]>(DEFAULT_SUBJECTS);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }
    setError(null);
  }, [open]);

  function updateSubject(index: number, field: keyof SubjectRow, value: string) {
    setSubjects((current) =>
      current.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row)),
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const parsedSubjects = subjects
      .map((row) => ({
        subjectName: row.subjectName.trim(),
        correct: Number(row.correct),
        wrong: Number(row.wrong),
      }))
      .filter((row) => row.subjectName && !Number.isNaN(row.correct) && !Number.isNaN(row.wrong));

    if (parsedSubjects.length === 0) {
      setError("En az bir ders satırı gerekli.");
      return;
    }

    setIsSubmitting(true);
    const response = await fetch("/api/student/exams", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
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

    setLabel("");
    setSubjects(DEFAULT_SUBJECTS.map((row) => ({ ...row, correct: "", wrong: "" })));
    onSaved();
    onClose();
  }

  if (!open || !mounted) {
    return null;
  }

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 640 }} onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800 }}>Manuel deneme girişi</h3>
            <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>
              TYT / AYT / LGS sonucunu kaydet
            </div>
          </div>
          <button type="button" className="icon-btn" style={{ width: 36, height: 36 }} onClick={onClose} aria-label="Kapat">
            <KiIcon name="ki-plus" size={18} style={{ transform: "rotate(45deg)" }} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body" style={{ gap: 16 }}>
          <div className="grid g-2">
            <div className="field">
              <label className="label" htmlFor="student-manual-examType">
                Sınav türü
              </label>
              <select
                id="student-manual-examType"
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
            <div className="field">
              <label className="label" htmlFor="student-manual-takenAt">
                Tarih
              </label>
              <input
                id="student-manual-takenAt"
                type="date"
                value={takenAt}
                onChange={(event) => setTakenAt(event.target.value)}
                className="input"
              />
            </div>
          </div>

          <div className="field">
            <label className="label" htmlFor="student-manual-label">
              Etiket
            </label>
            <input
              id="student-manual-label"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder="TYT Deneme 3"
              className="input"
            />
          </div>

          <div>
            <p className="label" style={{ marginBottom: 10 }}>
              Ders satırları
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {subjects.map((row, index) => (
                <div key={`${row.subjectName}-${index}`} className="grid g-3" style={{ gap: 8 }}>
                  <input
                    value={row.subjectName}
                    onChange={(event) => updateSubject(index, "subjectName", event.target.value)}
                    className="input"
                  />
                  <input
                    type="number"
                    min={0}
                    placeholder="Doğru"
                    value={row.correct}
                    onChange={(event) => updateSubject(index, "correct", event.target.value)}
                    className="input"
                  />
                  <input
                    type="number"
                    min={0}
                    placeholder="Yanlış"
                    value={row.wrong}
                    onChange={(event) => updateSubject(index, "wrong", event.target.value)}
                    className="input"
                  />
                </div>
              ))}
            </div>
          </div>

          {error ? (
            <p role="alert" className="badge badge-danger" style={{ height: "auto", padding: "10px 12px" }}>
              {error}
            </p>
          ) : null}

          <div className="row" style={{ gap: 10, justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-light" onClick={onClose}>
              İptal
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
