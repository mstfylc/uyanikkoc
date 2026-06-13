"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { KiIcon } from "@/components/design/KiIcon";
import type { CoachNoteKind } from "@uyanik/database";

type CoachNoteModalProps = {
  open: boolean;
  studentId: string | null;
  studentName: string;
  context?: string;
  onClose: () => void;
  onSent?: () => void;
};

const KINDS: Array<{ key: CoachNoteKind; label: string }> = [
  { key: "meeting", label: "Görüşme notu" },
  { key: "warning", label: "Uyarı" },
  { key: "general", label: "Genel" },
];

export function CoachNoteModal({ open, studentId, studentName, context, onClose, onSent }: CoachNoteModalProps) {
  const [kind, setKind] = useState<CoachNoteKind>("general");
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (open) {
      setText("");
      setKind("general");
    }
  }, [open]);

  if (!open || !mounted || !studentId) {
    return null;
  }

  async function handleSend() {
    if (!text.trim() || !studentId) return;
    setIsSending(true);
    const response = await fetch("/api/coach/notes", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, text: text.trim(), kind }),
    });
    setIsSending(false);
    if (response.ok) {
      onSent?.();
      onClose();
    }
  }

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 460 }} onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h3 style={{ fontSize: 15.5, fontWeight: 800 }}>Not gönder</h3>
            <div className="muted" style={{ fontSize: 12 }}>{studentName}{context ? ` · ${context}` : ""}</div>
          </div>
          <button type="button" className="icon-btn" style={{ width: 36, height: 36 }} onClick={onClose} aria-label="Kapat">
            <KiIcon name="ki-cross" size={18} />
          </button>
        </div>
        <div className="modal-body" style={{ gap: 14, padding: 20 }}>
          <div className="field">
            <span className="label">Not türü</span>
            <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
              {KINDS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={`type-chip${kind === item.key ? " on" : ""}`}
                  onClick={() => setKind(item.key)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <span className="label">Notun</span>
            <textarea
              className="input"
              rows={4}
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Öğrenciye iletmek istediğin notu yaz..."
            />
          </div>
        </div>
        <div className="modal-foot" style={{ justifyContent: "flex-end" }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Vazgeç</button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={isSending || text.trim().length < 2}
            style={{ opacity: text.trim().length < 2 ? 0.5 : 1 }}
            onClick={() => void handleSend()}
          >
            <KiIcon name="ki-send" size={16} />
            {isSending ? "Gönderiliyor..." : "Gönder"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
