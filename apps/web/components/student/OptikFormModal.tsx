"use client";

import { FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { KiIcon } from "@/components/design/KiIcon";
import { UkBadge } from "@/components/design/UkBadge";
import { formatExamNet } from "@uyanik/shared";
import type { OnlineExamRecord, OptikSubmissionRecord } from "@uyanik/database";

const CHOICES = ["A", "B", "C", "D", "E"] as const;

type OptikFormModalProps = {
  open: boolean;
  exam: OnlineExamRecord | null;
  onClose: () => void;
  onSubmitted: (submission: OptikSubmissionRecord) => void;
};

export function OptikFormModal({ open, exam, onClose, onSubmitted }: OptikFormModalProps) {
  const [mounted, setMounted] = useState(false);
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open && exam) {
      setAnswers(Array(exam.questionCount).fill(null));
      setError(null);
    }
  }, [open, exam]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!exam) return;

    setIsSubmitting(true);
    setError(null);
    const response = await fetch(`/api/student/online-exams/${exam.id}/submit`, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });
    setIsSubmitting(false);

    if (!response.ok) {
      setError("Optik gonderilemedi.");
      return;
    }

    const data = (await response.json()) as { submission: OptikSubmissionRecord };
    onSubmitted(data.submission);
    onClose();
  }

  if (!open || !exam || !mounted) {
    return null;
  }

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel"
        style={{ maxWidth: 720, maxHeight: "90vh", display: "flex", flexDirection: "column" }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800 }}>{exam.title}</h3>
            <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>
              {exam.publisher} · {exam.questionCount} soru · {exam.examType}
            </div>
          </div>
          <button type="button" className="icon-btn" style={{ width: 36, height: 36 }} onClick={onClose} aria-label="Kapat">
            <KiIcon name="ki-plus" size={18} style={{ transform: "rotate(45deg)" }} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="modal-body"
          style={{ gap: 14, overflowY: "auto", flex: 1, display: "flex", flexDirection: "column" }}
        >
          {answers.map((value, index) => (
            <div key={index} className="field" style={{ marginBottom: 0 }}>
              <div className="between" style={{ marginBottom: 6 }}>
                <span className="label" style={{ marginBottom: 0 }}>
                  {index + 1}. soru
                </span>
                {value ? <UkBadge tone="primary">{value}</UkBadge> : <UkBadge tone="muted">Bos</UkBadge>}
              </div>
              <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
                {CHOICES.map((choice) => (
                  <button
                    key={choice}
                    type="button"
                    className={`type-chip${value === choice ? " on" : ""}`}
                    style={{ width: 40, height: 40, borderRadius: 999, fontWeight: 800 }}
                    onClick={() =>
                      setAnswers((current) =>
                        current.map((item, i) => (i === index ? (item === choice ? null : choice) : item)),
                      )
                    }
                  >
                    {choice}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {error ? <p className="badge badge-danger" style={{ height: "auto", padding: "8px 10px" }}>{error}</p> : null}

          <div className="modal-foot" style={{ justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
            <button type="button" className="btn btn-light" onClick={onClose}>
              Iptal
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? "Gonderiliyor..." : "Optigi gonder"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

export function OptikResultBadge({ submission }: { submission: OptikSubmissionRecord }) {
  return (
    <span className="row" style={{ gap: 8, fontSize: 12.5 }}>
      <UkBadge tone="success">Net: {formatExamNet(submission.net)}</UkBadge>
      <span className="muted tnum">
        D:{submission.correct} Y:{submission.wrong} B:{submission.blank}
      </span>
    </span>
  );
}
