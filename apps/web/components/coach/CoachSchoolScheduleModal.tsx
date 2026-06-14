"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { KiIcon } from "@/components/design/KiIcon";
import { subjectColor } from "@/lib/design/subject-colors";
import { SCHOOL_DAYS, SCHOOL_PERIODS } from "@/mocks/schedule";
import type { SchoolScheduleRecord } from "@uyanik/database";

type CoachSchoolScheduleModalProps = {
  open: boolean;
  onClose: () => void;
  studentName: string;
  schedule: SchoolScheduleRecord | null;
};

function cellColor(value: string): string | null {
  if (!value) {
    return null;
  }
  for (const subject of Object.keys({ Matematik: 1, Turkce: 1, Fizik: 1, Kimya: 1, Biyoloji: 1 })) {
    if (value.toLocaleLowerCase("tr-TR").includes(subject.toLocaleLowerCase("tr-TR"))) {
      return subjectColor(subject);
    }
  }
  return "var(--muted)";
}

export function CoachSchoolScheduleModal({
  open,
  onClose,
  studentName,
  schedule,
}: CoachSchoolScheduleModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!open || !mounted) {
    return null;
  }

  const body = !schedule?.attendsSchool ? (
    <div style={{ padding: 20, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
      Öğrenci okula gitmiyor / tam zamanlı hazırlanıyor.
    </div>
  ) : (
    <div style={{ overflowX: "auto" }}>
      <table className="sched-tbl">
        <thead>
          <tr>
            <th />
            {SCHOOL_DAYS.map((day) => (
              <th key={day}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: SCHOOL_PERIODS }).map((_, period) => (
            <tr key={period}>
              <td className="sched-period">{period + 1}.</td>
              {SCHOOL_DAYS.map((day) => {
                const value = schedule.grid[day]?.[period] || "";
                const color = cellColor(value);
                return (
                  <td
                    key={day}
                    className="sched-cell view"
                    style={color ? { borderLeft: `3px solid ${color}` } : undefined}
                  >
                    <span>{value || "—"}</span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 720 }} onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div className="row" style={{ gap: 9 }}>
            <span className="stat-icon tone-info" style={{ width: 36, height: 36 }}>
              <KiIcon name="ki-calendar" size={18} />
            </span>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800 }}>Okul Ders Programi</h3>
              <div className="muted" style={{ fontSize: 12.5 }}>
                {studentName}
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
        <div className="modal-body">{body}</div>
      </div>
    </div>,
    document.body,
  );
}
