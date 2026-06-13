"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { KiIcon } from "@/components/design/KiIcon";
import { formatExamNet } from "@uyanik/shared";
import type { OnlineExamRecord, OptikSubmissionRecord } from "@uyanik/database";

const ALL_CHOICES = ["A", "B", "C", "D", "E"] as const;

type OptikFormModalProps = {
  open: boolean;
  exam: OnlineExamRecord | null;
  onClose: () => void;
  onSubmitted: (submission: OptikSubmissionRecord) => void;
};

function examChoices(exam: OnlineExamRecord): string[] {
  return exam.examType === "LGS" ? ALL_CHOICES.slice(0, 4) : [...ALL_CHOICES];
}

export function OptikFormModal({ open, exam, onClose, onSubmitted }: OptikFormModalProps) {
  const [mounted, setMounted] = useState(false);
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [result, setResult] = useState<OptikSubmissionRecord | null>(null);
  const [answerKey, setAnswerKey] = useState<string[] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || !exam) return;
    const currentExam = exam;

    async function load() {
      setError(null);
      if (currentExam.submission) {
        const response = await fetch(`/api/student/online-exams/${currentExam.id}/review`, {
          credentials: "same-origin",
        });
        if (response.ok) {
          const data = (await response.json()) as {
            submission: OptikSubmissionRecord;
            answerKey: string[];
          };
          setResult(data.submission);
          setAnswerKey(data.answerKey);
          setAnswers(data.submission.answers.map((item) => item || null));
          return;
        }
      }

      setResult(null);
      setAnswerKey(null);
      setAnswers(Array(currentExam.questionCount).fill(null));
    }

    void load();
  }, [open, exam]);

  const choices = useMemo(() => (exam ? examChoices(exam) : []), [exam]);
  const answered = answers.filter((item) => item != null).length;

  async function handleSubmit() {
    if (!exam || result) return;

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

    const reviewResponse = await fetch(`/api/student/online-exams/${exam.id}/review`, {
      credentials: "same-origin",
    });
    if (reviewResponse.ok) {
      const data = (await reviewResponse.json()) as {
        submission: OptikSubmissionRecord;
        answerKey: string[];
      };
      setResult(data.submission);
      setAnswerKey(data.answerKey);
      setAnswers(data.submission.answers.map((item) => item || null));
      onSubmitted(data.submission);
      return;
    }

    setError("Sonuç yüklenemedi.");
  }

  function setAnswer(index: number, option: string) {
    if (result) return;
    setAnswers((current) =>
      current.map((item, i) => (i === index ? (item === option ? null : option) : item)),
    );
  }

  if (!open || !exam || !mounted) {
    return null;
  }

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel"
        style={{ maxWidth: 480, height: "min(820px, calc(100vh - 32px))" }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-head" style={{ flexDirection: "column", alignItems: "stretch", gap: 10 }}>
          <div className="between">
            <div className="row" style={{ gap: 10 }}>
              <span className="stat-icon tone-primary" style={{ width: 38, height: 38 }}>
                <KiIcon name="ki-notepad" size={18} />
              </span>
              <div>
                <h3 style={{ fontSize: 15.5, fontWeight: 800 }}>Optik Form</h3>
                <div className="muted" style={{ fontSize: 12 }}>
                  {exam.title} · {exam.questionCount} soru
                </div>
              </div>
            </div>
            <button type="button" className="icon-btn" style={{ width: 36, height: 36 }} onClick={onClose} aria-label="Kapat">
              <KiIcon name="ki-plus" size={18} style={{ transform: "rotate(45deg)" }} />
            </button>
          </div>
          {!result ? (
            <div className="run-prog">
              <div
                className="run-prog-bar"
                style={{ width: `${exam.questionCount ? (answered / exam.questionCount) * 100 : 0}%` }}
              />
            </div>
          ) : null}
        </div>

        {result && answerKey ? (
          <div className="modal-body" style={{ gap: 14 }}>
            <div className="opt-result">
              <div className="opt-net">
                <span className="tnum">{formatExamNet(result.net)}</span>
                <span className="muted">net</span>
              </div>
              <div className="opt-dyb">
                <div>
                  <b className="tnum" style={{ color: "var(--success)" }}>
                    {result.correct}
                  </b>
                  <span>Dogru</span>
                </div>
                <div>
                  <b className="tnum" style={{ color: "var(--danger)" }}>
                    {result.wrong}
                  </b>
                  <span>Yanlış</span>
                </div>
                <div>
                  <b className="tnum" style={{ color: "var(--muted)" }}>
                    {result.blank}
                  </b>
                  <span>Bos</span>
                </div>
              </div>
            </div>
            <div className="opt-review">
              {answers.map((answer, index) => {
                const ok = answer === answerKey[index];
                const blank = answer == null || answer === "";
                return (
                  <div key={index} className={`opt-rev${blank ? " blank" : ok ? " ok" : " no"}`}>
                    <span className="tnum">{index + 1}</span>
                    <b>{blank ? "—" : answer}</b>
                    {!ok && !blank ? <span className="opt-rev-key tnum">{answerKey[index]}</span> : null}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="modal-body" style={{ gap: 4, padding: "12px 16px" }}>
            {answers.map((answer, index) => (
              <div key={index} className="opt-row">
                <span className="opt-no tnum">{index + 1}</span>
                <div className="opt-bubbles">
                  {choices.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`opt-bub${answer === option ? " on" : ""}`}
                      onClick={() => setAnswer(index, option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {error ? (
              <p className="badge badge-danger" style={{ height: "auto", padding: "8px 10px", marginTop: 8 }}>
                {error}
              </p>
            ) : null}
          </div>
        )}

        <div className="modal-foot" style={{ justifyContent: "space-between" }}>
          {result ? (
            <>
              <span className="muted" style={{ fontSize: 12, fontWeight: 600 }}>
                Optik gonderildi
              </span>
              <button type="button" className="btn btn-primary" onClick={onClose}>
                <KiIcon name="ki-check" size={16} />
                Kapat
              </button>
            </>
          ) : (
            <>
              <span className="muted" style={{ fontSize: 12, fontWeight: 600 }}>
                {answered}/{exam.questionCount} isaretlendi
              </span>
              <button
                type="button"
                className="btn btn-primary"
                disabled={answered === 0 || isSubmitting}
                onClick={() => void handleSubmit()}
                style={{ opacity: answered ? 1 : 0.5 }}
              >
                <KiIcon name="ki-send" size={16} />
                {isSubmitting ? "Gonderiliyor..." : "Gonder"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function OptikResultBadge({ submission }: { submission: OptikSubmissionRecord }) {
  return (
    <span className="badge badge-success" style={{ height: 24 }}>
      Net {formatExamNet(submission.net)}
    </span>
  );
}
