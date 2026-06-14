"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { KiIcon } from "@/components/design/KiIcon";
import { UkBadge } from "@/components/design/UkBadge";
import { buildReportDetail } from "@uyanik/shared";
import type { ReportDetail } from "@uyanik/shared";
import type { ParentReportRecord } from "@uyanik/database";

type ParentReportDetailModalProps = {
  open: boolean;
  report: (ParentReportRecord & { detail: ReportDetail }) | null;
  onClose: () => void;
};

export function ParentReportDetailModal({ open, report, onClose }: ParentReportDetailModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!open || !report || !mounted) {
    return null;
  }

  const detail = buildReportDetail({
    completion: report.completion,
    net: report.netDelta,
    studentName: report.studentName,
  });

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 560 }} onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800 }}>
              {report.studentName} · {report.week}
            </h3>
            <div className="muted" style={{ fontSize: 12.5 }}>
              Haftalık gelişim raporu
            </div>
          </div>
          <button type="button" className="icon-btn" style={{ width: 36, height: 36 }} onClick={onClose} aria-label="Kapat">
            <KiIcon name="ki-plus" size={18} style={{ transform: "rotate(45deg)" }} />
          </button>
        </div>

        <div className="modal-body" style={{ gap: 14 }}>
          <div className="grid g-3">
            <div className="card card-pad">
              <div className="muted" style={{ fontSize: 11.5 }}>Tamamlama</div>
              <div className="tnum" style={{ fontSize: 22, fontWeight: 800 }}>
                {report.completion}%
              </div>
            </div>
            <div className="card card-pad">
              <div className="muted" style={{ fontSize: 11.5 }}>Net değişimi</div>
              <div className="tnum" style={{ fontSize: 22, fontWeight: 800 }}>
                {report.netDelta}
              </div>
            </div>
            <div className="card card-pad">
              <div className="muted" style={{ fontSize: 11.5 }}>Çalışma saati</div>
              <div className="tnum" style={{ fontSize: 22, fontWeight: 800 }}>
                {detail.hours}s
              </div>
            </div>
          </div>

          <div>
            <div className="label" style={{ marginBottom: 8 }}>Ödev durumu</div>
            <UkBadge tone="primary">
              {detail.assignDone}/{detail.assignTotal} ödev tamamlandı
            </UkBadge>
          </div>

          <div className="subj">
            {detail.subjects.map((subject) => (
              <div className="subj-row" key={subject.name}>
                <div className="between">
                  <span className="sname">{subject.name}</span>
                  <span className="spct tnum">{subject.pct}%</span>
                </div>
                <div className="bar">
                  <span style={{ width: `${subject.pct}%`, background: "var(--primary)" }} />
                </div>
              </div>
            ))}
          </div>

          <div className="modal-foot" style={{ justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-light" onClick={onClose}>
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
