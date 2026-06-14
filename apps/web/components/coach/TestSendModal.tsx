"use client";

import { FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { KiIcon } from "@/components/design/KiIcon";
import type { CoachRosterEntry, PsychTestDefinition } from "@uyanik/database";

type TestSendModalProps = {
  open: boolean;
  onClose: () => void;
  students: CoachRosterEntry[];
  catalog: PsychTestDefinition[];
  onSent: () => void;
};

export function TestSendModal({ open, onClose, students, catalog, onSent }: TestSendModalProps) {
  const [mounted, setMounted] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [testId, setTestId] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      setStudentId(students[0]?.studentId ?? "");
      setTestId(catalog[0]?.id ?? "");
      setDone(false);
      setError(null);
    }
  }, [open, students, catalog]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!studentId || !testId) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    const response = await fetch("/api/coach/tests", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, testId }),
    });
    setIsSubmitting(false);

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "Test gönderilemedi.");
      return;
    }

    setDone(true);
    onSent();
    setTimeout(() => {
      setDone(false);
      onClose();
    }, 1200);
  }

  if (!open || !mounted) {
    return null;
  }

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 480 }} onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div className="row" style={{ gap: 9 }}>
            <span className="stat-icon tone-primary" style={{ width: 36, height: 36 }}>
              <KiIcon name="ki-star" size={18} />
            </span>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800 }}>Test Gönder</h3>
              <div className="muted" style={{ fontSize: 12.5 }}>
                Öğrenci ve test seç
              </div>
            </div>
          </div>
          <button
            type="button"
            className="icon-btn"
            style={{ width: 36, height: 36 }}
            onClick={onClose}
            aria-label="Kapat"
          >
            <KiIcon name="ki-plus" size={18} style={{ transform: "rotate(45deg)" }} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body" style={{ gap: 14 }}>
          <div className="field">
            <label className="label" htmlFor="send-modal-student">
              Öğrenci
            </label>
            <select
              id="send-modal-student"
              className="select"
              value={studentId}
              onChange={(event) => setStudentId(event.target.value)}
            >
              {students.map((student) => (
                <option key={student.studentId} value={student.studentId}>
                  {student.displayName}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="label" htmlFor="send-modal-test">
              Test
            </label>
            <select
              id="send-modal-test"
              className="select"
              value={testId}
              onChange={(event) => setTestId(event.target.value)}
            >
              {catalog.map((test) => (
                <option key={test.id} value={test.id}>
                  {test.name}
                </option>
              ))}
            </select>
          </div>
          {error ? (
            <p className="badge badge-danger" style={{ height: "auto", padding: "10px 12px" }}>
              {error}
            </p>
          ) : null}
          <div className="modal-foot" style={{ justifyContent: "flex-end", padding: 0 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Vazgeç
            </button>
            <button type="submit" disabled={isSubmitting || !studentId || !testId} className="btn btn-primary">
              <KiIcon name={done ? "ki-check" : "ki-send"} />
              {done ? "Gönderildi" : isSubmitting ? "Gönderiliyor..." : "Test gönder"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
