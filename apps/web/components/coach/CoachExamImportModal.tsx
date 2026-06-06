"use client";

import { FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { KiIcon } from "@/components/design/KiIcon";
import { parseCsvExamImport } from "@/lib/coach/exam-import";

type CoachExamImportModalProps = {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
};

export function CoachExamImportModal({ open, onClose, onImported }: CoachExamImportModalProps) {
  const [mounted, setMounted] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleImport(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const exams = parseCsvExamImport(csvText);
    if (exams.length === 0) {
      setError("Gecerli satir bulunamadi. Format: studentId,examType,label,takenAt,subject,correct,wrong");
      return;
    }

    setIsSubmitting(true);
    const response = await fetch("/api/coach/exams/import", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exams }),
    });
    setIsSubmitting(false);

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "Import basarisiz.");
      return;
    }

    setCsvText("");
    onImported();
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
            <h3 style={{ fontSize: 16, fontWeight: 800 }}>Deneme ice aktar</h3>
            <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>
              CSV ile toplu sonuc yukle (Excel ciktisi icin CSV kaydedin)
            </div>
          </div>
          <button type="button" className="icon-btn" style={{ width: 36, height: 36 }} onClick={onClose} aria-label="Kapat">
            <KiIcon name="ki-plus" size={18} style={{ transform: "rotate(45deg)" }} />
          </button>
        </div>
        <form onSubmit={handleImport} className="modal-body" style={{ gap: 14 }}>
          <p className="muted" style={{ fontSize: 12.5 }}>
            Her satir: studentId,examType,label,takenAt,subject,correct,wrong
          </p>
          <div className="field">
            <label className="label" htmlFor="import-csv-text">
              CSV icerigi
            </label>
            <textarea
              id="import-csv-text"
              className="input"
              rows={10}
              value={csvText}
              onChange={(event) => setCsvText(event.target.value)}
              placeholder={"student_001,TYT,TYT Deneme 1,2025-01-15,Matematik,30,5\nstudent_001,TYT,TYT Deneme 1,2025-01-15,Turkce,25,8"}
            />
          </div>
          {error ? (
            <p role="alert" className="badge badge-danger" style={{ height: "auto", padding: "10px 12px" }}>
              {error}
            </p>
          ) : null}
          <div className="row" style={{ gap: 10, justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-light" onClick={onClose}>
              Iptal
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? "Aktariliyor..." : "Ice aktar"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
