"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { KiIcon } from "@/components/design/KiIcon";
import { UkBadge } from "@/components/design/UkBadge";

type SmartAssignmentPreview = {
  title: string;
  subject: string;
  topic: string;
  questionCount: number;
  source: string;
  dueDate: string;
  priority: string;
  quality: "low" | "medium" | "high";
  overdueAlert: boolean;
  signals: string[];
};

type SmartOdevModalProps = {
  open: boolean;
  studentId: string;
  studentName: string;
  onClose: () => void;
  onAssigned: () => void;
};

export function SmartOdevModal({ open, studentId, studentName, onClose, onAssigned }: SmartOdevModalProps) {
  const [mounted, setMounted] = useState(false);
  const [preview, setPreview] = useState<SmartAssignmentPreview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || !studentId) return;
    let active = true;
    async function load() {
      setIsLoading(true);
      const response = await fetch("/api/coach/smart-assignments", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "preview", studentId }),
      });
      if (active && response.ok) {
        const data = (await response.json()) as { preview: SmartAssignmentPreview };
        setPreview(data.preview);
      }
      if (active) setIsLoading(false);
    }
    void load();
    return () => {
      active = false;
    };
  }, [open, studentId]);

  async function assign() {
    if (!studentId) return;
    setIsAssigning(true);
    const response = await fetch("/api/coach/smart-assignments", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "assign", studentId }),
    });
    setIsAssigning(false);
    if (response.ok) {
      onAssigned();
      onClose();
    }
  }

  if (!open || !mounted) {
    return null;
  }

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 620 }} onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div className="row" style={{ gap: 9 }}>
            <span className="stat-icon tone-primary" style={{ width: 36, height: 36 }}>
              <KiIcon name="ki-abstract-26" size={18} />
            </span>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800 }}>SmartOdev</h3>
              <div className="muted" style={{ fontSize: 12.5 }}>{studentName}</div>
            </div>
          </div>
          <button type="button" className="icon-btn" style={{ width: 36, height: 36 }} onClick={onClose} aria-label="Kapat">
            <KiIcon name="ki-plus" size={18} style={{ transform: "rotate(45deg)" }} />
          </button>
        </div>

        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {isLoading ? (
            <p className="muted" style={{ fontSize: 13 }}>Analiz ediliyor...</p>
          ) : preview ? (
            <>
              <div className="lrow" style={{ cursor: "default" }}>
                <span className="lr-icon tone-primary"><KiIcon name="ki-notepad-edit" /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="lr-title">{preview.title}</div>
                  <div className="lr-meta">
                    <UkBadge tone="primary">{preview.subject}</UkBadge>
                    <span className="d">{preview.questionCount} soru</span>
                    <span className="d">{preview.dueDate}</span>
                  </div>
                </div>
                <UkBadge tone={preview.quality === "high" ? "success" : "warning"}>{preview.quality}</UkBadge>
              </div>
              <div className="notice" style={{ background: "var(--surface-2)" }}>
                <KiIcon name="ki-information-2" size={18} style={{ color: "var(--primary-600)", flexShrink: 0 }} />
                <div style={{ fontSize: 13 }}>
                  Kaynak: {preview.source} - Konu: {preview.topic}
                  {preview.overdueAlert ? " · tekrar öncelikli" : ""}
                </div>
              </div>
              <div className="grid g-4">
                {preview.signals.map((signal) => (
                  <div key={signal} className="card-pad" style={{ background: "var(--surface-2)", borderRadius: 8 }}>
                    <div className="muted" style={{ fontSize: 12 }}>{signal}</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="muted" style={{ fontSize: 13 }}>Oneri uretilemedi.</p>
          )}
        </div>

        <div className="modal-foot">
          <button type="button" className="btn btn-light" onClick={onClose}>Vazgec</button>
          <button type="button" className="btn btn-primary" disabled={!preview || isAssigning} onClick={() => void assign()}>
            <KiIcon name="ki-send" />
            {isAssigning ? "Ataniyor..." : "Odevi Ata"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
