"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { KiIcon } from "@/components/design/KiIcon";

type MistakeBatchModalProps = {
  open: boolean;
  subject: string;
  count: number;
  source: string;
  onClose: () => void;
  onAdded?: (added: number) => void;
};

type ErrorType = "bilgi" | "islem" | "sure" | "dikkat" | "yorum" | "unutma";

const ERROR_LABELS: Record<ErrorType, string> = {
  bilgi: "Bilgi eksiği",
  islem: "İşlem hatası",
  sure: "Süre",
  dikkat: "Dikkat",
  yorum: "Yorum",
  unutma: "Unutma",
};

type Slot = { include: boolean; topic: string; errorType: ErrorType };

export function MistakeBatchModal({ open, subject, count, source, onClose, onAdded }: MistakeBatchModalProps) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (open) {
      setSlots(Array.from({ length: Math.max(0, count) }, () => ({ include: true, topic: "", errorType: "islem" })));
    }
  }, [open, count]);

  if (!open || !mounted || count <= 0) {
    return null;
  }

  function patch(index: number, value: Partial<Slot>) {
    setSlots((current) => current.map((slot, i) => (i === index ? { ...slot, ...value } : slot)));
  }

  const selected = slots.filter((slot) => slot.include && slot.topic.trim());

  async function handleAdd() {
    if (selected.length === 0) return;
    setIsSaving(true);
    let added = 0;
    for (const slot of slots) {
      if (!slot.include || !slot.topic.trim()) continue;
      const response = await fetch("/api/student/mistakes", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          topic: slot.topic.trim(),
          subtopic: "",
          errorType: slot.errorType,
          source,
          qType: "klasik",
          note: "",
          photoUrl: null,
        }),
      });
      if (response.ok) added += 1;
    }
    setIsSaving(false);
    onAdded?.(added);
    onClose();
  }

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 520 }} onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h3 style={{ fontSize: 15.5, fontWeight: 800 }}>Yanlışları deftere ekle</h3>
            <div className="muted" style={{ fontSize: 12 }}>{subject} · {count} yanlış · {source}</div>
          </div>
          <button type="button" className="icon-btn" style={{ width: 36, height: 36 }} onClick={onClose} aria-label="Kapat">
            <KiIcon name="ki-cross" size={18} />
          </button>
        </div>
        <div className="modal-body" style={{ gap: 10, padding: 20, maxHeight: "60vh", overflowY: "auto" }}>
          <p className="muted" style={{ fontSize: 12.5 }}>
            Her yanlış için konuyu ve hata tipini gir; seçilenler Sıfır Hata Döngüsü&apos;ne (1→3→7→21 gün) eklenir.
          </p>
          {slots.map((slot, index) => (
            <div key={index} className="lrow" style={{ alignItems: "center", gap: 10 }}>
              <button
                type="button"
                className={`chk ${slot.include ? "" : "off"}`}
                aria-label={slot.include ? "Çıkar" : "Ekle"}
                onClick={() => patch(index, { include: !slot.include })}
                style={{ opacity: slot.include ? 1 : 0.4 }}
              >
                <KiIcon name="ki-check" size={14} />
              </button>
              <input
                className="input"
                style={{ flex: 1, minWidth: 0 }}
                placeholder={`Yanlış ${index + 1} · konu`}
                value={slot.topic}
                onChange={(event) => patch(index, { topic: event.target.value })}
              />
              <select
                className="select"
                style={{ width: 150 }}
                value={slot.errorType}
                onChange={(event) => patch(index, { errorType: event.target.value as ErrorType })}
              >
                {(Object.entries(ERROR_LABELS) as Array<[ErrorType, string]>).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <div className="modal-foot" style={{ justifyContent: "space-between" }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Şimdi değil</button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={isSaving || selected.length === 0}
            style={{ opacity: selected.length === 0 ? 0.5 : 1 }}
            onClick={() => void handleAdd()}
          >
            <KiIcon name="ki-plus" size={16} />
            {isSaving ? "Ekleniyor..." : `${selected.length} yanlışı ekle`}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
