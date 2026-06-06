"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { KiIcon } from "@/components/design/KiIcon";
import { UkAvatar } from "@/components/design/UkAvatar";
import { UkBadge } from "@/components/design/UkBadge";
import { subjectToExamCategory } from "@/lib/design/exam-categories";
import type { CoachExamStudentRow } from "@/lib/design/coach-exam-sessions";
import { formatExamNet } from "@uyanik/shared";

type CoachExamStudentDetailModalProps = {
  student: CoachExamStudentRow | null;
  examName: string;
  onClose: () => void;
};

function successRate(correct: number, wrong: number): number {
  const total = correct + wrong;
  if (total === 0) {
    return 0;
  }
  return correct / total;
}

export function CoachExamStudentDetailModal({
  student,
  examName,
  onClose,
}: CoachExamStudentDetailModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!student || !mounted) {
    return null;
  }

  const sortedSubjects = [...student.subjects]
    .filter((row) => row.correct + row.wrong > 0)
    .sort((left, right) => successRate(left.correct, left.wrong) - successRate(right.correct, right.wrong));

  const strongest = sortedSubjects[sortedSubjects.length - 1];
  const weakest = sortedSubjects[0];

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 640 }} onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div className="row" style={{ gap: 12 }}>
            <UkAvatar name={student.displayName} size={44} />
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800 }}>{student.displayName}</h3>
              <div className="muted" style={{ fontSize: 12.5 }}>
                {student.branch}
                {student.studentNumber ? ` · No ${student.studentNumber}` : ""} · {examName}
              </div>
            </div>
          </div>
          <button type="button" className="icon-btn" style={{ width: 36, height: 36 }} onClick={onClose} aria-label="Kapat">
            <KiIcon name="ki-plus" size={18} style={{ transform: "rotate(45deg)" }} />
          </button>
        </div>

        <div className="modal-body" style={{ gap: 16 }}>
          <div className="grid g-3" style={{ gap: 12 }}>
            <div className="card" style={{ boxShadow: "none" }}>
              <div className="card-pad" style={{ padding: 14 }}>
                <div className="muted" style={{ fontSize: 11, fontWeight: 700 }}>
                  TOPLAM NET
                </div>
                <div className="tnum" style={{ fontSize: 24, fontWeight: 800 }}>
                  {formatExamNet(student.totalNet)}
                </div>
              </div>
            </div>
            <div className="card" style={{ boxShadow: "none" }}>
              <div className="card-pad" style={{ padding: 14 }}>
                <div className="muted" style={{ fontSize: 11, fontWeight: 700 }}>
                  TYT PUANI
                </div>
                <div className="tnum" style={{ fontSize: 24, fontWeight: 800, color: "var(--primary)" }}>
                  {student.score ?? "—"}
                </div>
              </div>
            </div>
            <div className="card" style={{ boxShadow: "none" }}>
              <div className="card-pad" style={{ padding: 14 }}>
                <div className="muted" style={{ fontSize: 11, fontWeight: 700 }}>
                  GENEL SIRA
                </div>
                <div className="tnum" style={{ fontSize: 24, fontWeight: 800 }}>
                  {student.rank ? student.rank.toLocaleString("tr-TR") : "—"}
                </div>
              </div>
            </div>
          </div>

          {strongest && weakest ? (
            <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
              <UkBadge tone="success">En guclu: {strongest.subjectName}</UkBadge>
              <UkBadge tone="danger">Gelistirilecek: {weakest.subjectName}</UkBadge>
            </div>
          ) : null}

          <div className="card" style={{ overflow: "hidden" }}>
            <div className="card-body" style={{ padding: 0 }}>
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Ders</th>
                    <th style={{ textAlign: "center" }}>Dogru</th>
                    <th style={{ textAlign: "center" }}>Yanlis</th>
                    <th style={{ textAlign: "center" }}>Bos</th>
                    <th style={{ textAlign: "right" }}>Net</th>
                  </tr>
                </thead>
                <tbody>
                  {student.subjects.map((row) => {
                    const category = subjectToExamCategory(row.subjectName);
                    return (
                      <tr key={row.id}>
                        <td>
                          <div className="row" style={{ gap: 8 }}>
                            <span
                              className="swatch"
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: 3,
                                background: category ? `var(--primary)` : "var(--muted)",
                              }}
                            />
                            <b style={{ fontSize: 12.5 }}>{row.subjectName}</b>
                          </div>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span className="tnum" style={{ color: "var(--success)", fontWeight: 700 }}>
                            {row.correct}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span className="tnum" style={{ color: "var(--danger)", fontWeight: 700 }}>
                            {row.wrong}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span className="tnum muted">—</span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <b className="tnum">{formatExamNet(row.net)}</b>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
