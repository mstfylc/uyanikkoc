"use client";

import { FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { KiIcon } from "@/components/design/KiIcon";
import type { CoachRosterEntry } from "@uyanik/database";

const USER_ID_BY_EMAIL: Record<string, string> = {
  "student@uyanik.local": "user_student_001",
  "student2@uyanik.local": "user_student_002",
  "parent@uyanik.local": "user_parent_001",
};

type GroupCreateModalProps = {
  open: boolean;
  students: CoachRosterEntry[];
  onClose: () => void;
  onCreated: () => void;
};

export function GroupCreateModal({ open, students, onClose, onCreated }: GroupCreateModalProps) {
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      setName("");
      setSelectedEmails(students.slice(0, 2).map((s) => s.email));
      setError(null);
    }
  }, [open, students]);

  function toggleEmail(email: string) {
    setSelectedEmails((current) =>
      current.includes(email) ? current.filter((item) => item !== email) : [...current, email],
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const memberUserIds = selectedEmails
      .map((email) => USER_ID_BY_EMAIL[email])
      .filter(Boolean);
    if (!name.trim() || memberUserIds.length === 0) {
      setError("Grup adi ve en az bir uye gerekli.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    const response = await fetch("/api/coach/groups", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), memberUserIds }),
    });
    setIsSubmitting(false);

    if (!response.ok) {
      setError("Grup oluşturulamadı.");
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
      <div className="modal-panel" style={{ maxWidth: 480 }} onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div className="row" style={{ gap: 9 }}>
            <span className="stat-icon tone-primary" style={{ width: 36, height: 36 }}>
              <KiIcon name="ki-people" size={18} />
            </span>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800 }}>Grup oluştur</h3>
              <div className="muted" style={{ fontSize: 12.5 }}>Öğrenci ve velileri gruba ekle</div>
            </div>
          </div>
          <button type="button" className="icon-btn" style={{ width: 36, height: 36 }} onClick={onClose} aria-label="Kapat">
            <KiIcon name="ki-plus" size={18} style={{ transform: "rotate(45deg)" }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body" style={{ gap: 14 }}>
          <div className="field">
            <label className="label">Grup adi</label>
            <input className="input" value={name} onChange={(event) => setName(event.target.value)} placeholder="Orn. TYT Hazirlik" />
          </div>

          <div className="field">
            <label className="label">Uyeler</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {students.map((student) => (
                <label key={student.studentId} className="row" style={{ gap: 10, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={selectedEmails.includes(student.email)}
                    onChange={() => toggleEmail(student.email)}
                  />
                  <span style={{ fontSize: 13.5 }}>{student.displayName}</span>
                  <span className="muted" style={{ fontSize: 12 }}>{student.email}</span>
                </label>
              ))}
            </div>
          </div>

          {error ? <p className="badge badge-danger" style={{ height: "auto", padding: "8px 10px" }}>{error}</p> : null}

          <div className="modal-foot" style={{ justifyContent: "flex-end", gap: 10 }}>
            <button type="button" className="btn btn-light" onClick={onClose}>
              Iptal
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? "Oluşturuluyor..." : "Grup oluştur"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
