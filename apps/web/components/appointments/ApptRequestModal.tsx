"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { KiIcon } from "@/components/design/KiIcon";
import { APPOINTMENT_DAYS } from "@/mocks/appointments";
import type { AppointmentDay, AppointmentMode, AppointmentSettingsRecord } from "@uyanik/database";

function firstAllowedMode(settings: AppointmentSettingsRecord): AppointmentMode {
  if (settings.allowOnline) return "online";
  if (settings.allowInPerson) return "in_person";
  return "phone";
}

type ApptRequestModalProps = {
  open: boolean;
  onClose: () => void;
  settings: AppointmentSettingsRecord;
  onSubmit: (payload: { day: AppointmentDay; slot: string; mode: AppointmentMode; topic: string }) => Promise<void>;
};

export function ApptRequestModal({ open, onClose, settings, onSubmit }: ApptRequestModalProps) {
  const [mounted, setMounted] = useState(false);
  const [day, setDay] = useState<AppointmentDay | "">("");
  const [slot, setSlot] = useState("");
  const [mode, setMode] = useState<AppointmentMode>(firstAllowedMode(settings));
  const [topic, setTopic] = useState("");
  const [done, setDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      setDay("");
      setSlot("");
      setMode(firstAllowedMode(settings));
      setTopic("");
      setDone(false);
    }
  }, [open, settings]);

  const days = useMemo(
    () => APPOINTMENT_DAYS.filter((item) => (settings.availability[item] ?? []).length > 0),
    [settings.availability],
  );

  const slots = day
    ? (settings.availability[day] ?? []).filter((item) => (settings.slotModes[day]?.[item] ?? []).includes(mode))
    : [];
  const valid = Boolean(day && slot && mode);

  async function handleSubmit() {
    if (!valid || !day) {
      return;
    }

    setIsSubmitting(true);
    await onSubmit({ day, slot, mode, topic: topic.trim() || "Genel görüşme" });
    setIsSubmitting(false);
    setDone(true);
    setTimeout(() => {
      setDone(false);
      onClose();
    }, 1100);
  }

  if (!open || !mounted) {
    return null;
  }

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 460 }} onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div className="row" style={{ gap: 9 }}>
            <span className="stat-icon tone-primary" style={{ width: 36, height: 36 }}>
              <KiIcon name="ki-calendar" size={18} />
            </span>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800 }}>Randevu Iste</h3>
              <div className="muted" style={{ fontSize: 12.5 }}>
                Kocunun musait saatlerinden sec
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
        <div className="modal-body" style={{ gap: 14 }}>
          <div className="field">
            <label className="label">Görüşme türü</label>
            <div className="seg" style={{ width: "fit-content" }}>
              {settings.allowOnline ? (
                <button
                  type="button"
                  className={mode === "online" ? "on" : ""}
                  onClick={() => setMode("online")}
                >
                  <KiIcon name="ki-technology-2" size={15} />
                  Online
                </button>
              ) : null}
              {settings.allowInPerson ? (
                <button
                  type="button"
                  className={mode === "in_person" ? "on" : ""}
                  onClick={() => setMode("in_person")}
                >
                  <KiIcon name="ki-people" size={15} />
                  Yuz yuze
                </button>
              ) : null}
              {settings.allowPhone ? (
                <button
                  type="button"
                  className={mode === "phone" ? "on" : ""}
                  onClick={() => setMode("phone")}
                >
                  <KiIcon name="ki-phone" size={15} />
                  Telefon
                </button>
              ) : null}
            </div>
          </div>
          <div className="field">
            <label className="label">Gun</label>
            <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
              {days.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`type-chip${day === item ? " on" : ""}`}
                  onClick={() => {
                    setDay(item);
                    setSlot("");
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          {day ? (
            <div className="field">
              <label className="label">Saat</label>
              <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
                {slots.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`type-chip${slot === item ? " on" : ""}`}
                    onClick={() => setSlot(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          <div className="field">
            <label className="label">
              Konu <span className="muted" style={{ fontWeight: 500 }}>(ops.)</span>
            </label>
            <input
              className="input"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="or. Turev sorularinda takiliyorum"
            />
          </div>
        </div>
        <div className="modal-foot" style={{ justifyContent: "flex-end" }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Vazgec
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!valid || isSubmitting}
            onClick={() => void handleSubmit()}
            style={{ opacity: valid ? 1 : 0.5 }}
          >
            <KiIcon name={done ? "ki-check" : "ki-send"} />
            {done ? "Gonderildi" : isSubmitting ? "Gonderiliyor..." : "Talep Gonder"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
