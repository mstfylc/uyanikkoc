"use client";

import { FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { KiIcon } from "@/components/design/KiIcon";
import type { PsychTestQuestion } from "@uyanik/database";

type DraftQuestion = PsychTestQuestion & { id: string };

type TestBuilderModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

function newQuestion(): DraftQuestion {
  return { id: `q_${Date.now()}_${Math.random()}`, text: "", kind: "likert" };
}

export function TestBuilderModal({ open, onClose, onCreated }: TestBuilderModalProps) {
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [questions, setQuestions] = useState<DraftQuestion[]>([newQuestion()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      setName("");
      setDesc("");
      setQuestions([newQuestion()]);
      setError(null);
    }
  }, [open]);

  function updateQuestion(id: string, patch: Partial<DraftQuestion>) {
    setQuestions((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Test adi gerekli.");
      return;
    }
    if (questions.some((q) => !q.text.trim())) {
      setError("Tum sorulara metin girin.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    const response = await fetch("/api/coach/tests", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        desc: desc.trim(),
        questions: questions.map(({ text, kind, options }) => ({
          text: text.trim(),
          kind,
          options: kind === "choice" ? (options ?? ["Evet", "Hayir"]) : undefined,
        })),
      }),
    });
    setIsSubmitting(false);

    if (!response.ok) {
      setError("Test olusturulamadi.");
      return;
    }

    onCreated();
    onClose();
  }

  if (!open || !mounted) {
    return null;
  }

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel"
        style={{ maxWidth: 640, maxHeight: "90vh", display: "flex", flexDirection: "column" }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-head">
          <div className="row" style={{ gap: 9 }}>
            <span className="stat-icon tone-primary" style={{ width: 36, height: 36 }}>
              <KiIcon name="ki-notepad-edit" size={18} />
            </span>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800 }}>Ozel test olustur</h3>
              <div className="muted" style={{ fontSize: 12.5 }}>Likert, evet/hayir, olcek veya secenekli sorular</div>
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
          <div className="field">
            <label className="label">Test adi</label>
            <input className="input" value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div className="field">
            <label className="label">Aciklama</label>
            <input className="input" value={desc} onChange={(event) => setDesc(event.target.value)} />
          </div>

          {questions.map((question, index) => (
            <div key={question.id} className="card card-pad" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div className="between">
                <span className="label" style={{ marginBottom: 0 }}>Soru {index + 1}</span>
                {questions.length > 1 ? (
                  <button
                    type="button"
                    className="btn btn-light btn-sm"
                    onClick={() => setQuestions((current) => current.filter((item) => item.id !== question.id))}
                  >
                    Sil
                  </button>
                ) : null}
              </div>
              <input
                className="input"
                value={question.text}
                onChange={(event) => updateQuestion(question.id, { text: event.target.value })}
                placeholder="Soru metni"
              />
              <select
                className="input"
                value={question.kind}
                onChange={(event) =>
                  updateQuestion(question.id, {
                    kind: event.target.value as PsychTestQuestion["kind"],
                    options: event.target.value === "choice" ? ["A", "B", "C"] : undefined,
                  })
                }
              >
                <option value="likert">Likert (1-5)</option>
                <option value="yesno">Evet / Hayir</option>
                <option value="scale">Olcek (0-10)</option>
                <option value="choice">Coktan secmeli</option>
              </select>
              {question.kind === "choice" ? (
                <input
                  className="input"
                  value={(question.options ?? []).join(", ")}
                  onChange={(event) =>
                    updateQuestion(question.id, {
                      options: event.target.value.split(",").map((item) => item.trim()).filter(Boolean),
                    })
                  }
                  placeholder="Secenekler (virgul ile)"
                />
              ) : null}
            </div>
          ))}

          <button type="button" className="btn btn-light w-fit" onClick={() => setQuestions((current) => [...current, newQuestion()])}>
            <KiIcon name="ki-plus" />
            Soru ekle
          </button>

          {error ? <p className="badge badge-danger" style={{ height: "auto", padding: "8px 10px" }}>{error}</p> : null}

          <div className="modal-foot" style={{ justifyContent: "flex-end", gap: 10 }}>
            <button type="button" className="btn btn-light" onClick={onClose}>
              Iptal
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? "Kaydediliyor..." : "Testi olustur"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
