"use client";

import { FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { KiIcon } from "@/components/design/KiIcon";

type CoachAddStudentModalProps = {
  open: boolean;
  onClose: () => void;
  onAdded: (displayName: string) => void;
};

export function CoachAddStudentModal({ open, onClose, onAdded }: CoachAddStudentModalProps) {
  const [mounted, setMounted] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      setDisplayName("");
      setEmail("");
      setError(null);
    }
  }, [open]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const name = displayName.trim();
    const mail = email.trim();
    if (!name || !mail) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    const response = await fetch("/api/coach/students", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName: name, email: mail }),
    });
    setIsSubmitting(false);

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "Öğrenci eklenemedi.");
      return;
    }

    onAdded(name);
    onClose();
  }

  if (!open || !mounted) {
    return null;
  }

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 460 }} onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div className="row" style={{ gap: 9 }}>
            <span className="stat-icon tone-success" style={{ width: 36, height: 36 }}>
              <KiIcon name="ki-people" size={18} />
            </span>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800 }}>Öğrenci Ekle</h3>
              <div className="muted" style={{ fontSize: 12.5 }}>
                Yeni öğrenciyi kadrona ekle
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
            <label className="label" htmlFor="add-student-name">
              Ad soyad
            </label>
            <input
              id="add-student-name"
              className="input"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Öğrenci adı"
            />
          </div>
          <div className="field">
            <label className="label" htmlFor="add-student-email">
              E-posta
            </label>
            <input
              id="add-student-email"
              className="input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="ogrenci@ornek.com"
            />
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
            <button
              type="submit"
              disabled={isSubmitting || !displayName.trim() || !email.trim()}
              className="btn btn-primary"
            >
              {isSubmitting ? "Ekleniyor..." : "Öğrenci ekle"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
