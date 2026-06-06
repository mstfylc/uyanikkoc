"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { UkAvatar } from "@/components/design/UkAvatar";
import { UkSparkline } from "@/components/design/UkSparkline";
import { UkBadge } from "@/components/design/UkBadge";
import { UkSection } from "@/components/design/UkSection";
import type { CoachStudentRow } from "@/lib/design/coach-student-rows";
import { formatExamNet, RISK_BAND_LABELS } from "@uyanik/shared";

const RISK_TONE: Record<CoachStudentRow["risk"], "success" | "primary" | "warning" | "danger"> = {
  excellent: "success",
  normal: "primary",
  attention: "warning",
  critical: "danger",
};

type CoachStudentsTableProps = {
  rows: CoachStudentRow[];
  isLoading?: boolean;
};

export function CoachStudentsTable({ rows, isLoading }: CoachStudentsTableProps) {
  const [filter, setFilter] = useState<"all" | "risk">("all");

  const shown = useMemo(() => {
    if (filter === "risk") {
      return rows.filter((row) => row.risk === "attention" || row.risk === "critical");
    }
    return rows;
  }, [filter, rows]);

  return (
    <UkSection
      title="Ogrencilerim"
      sub={`${rows.length} aktif ogrenci`}
      action={
        <div className="filters">
          <button type="button" className={filter === "all" ? "on" : ""} onClick={() => setFilter("all")}>
            Tumu
          </button>
          <button type="button" className={filter === "risk" ? "on" : ""} onClick={() => setFilter("risk")}>
            Risk altinda
          </button>
        </div>
      }
    >
      <div className="card-body" style={{ padding: 0 }}>
        {isLoading ? (
          <p className="muted" style={{ padding: 20, fontSize: 13 }}>
            Yukleniyor...
          </p>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Ogrenci</th>
                <th>Tamamlama</th>
                <th>Net trendi</th>
                <th>Durum</th>
                <th style={{ textAlign: "right" }}>Son aktivite</th>
              </tr>
            </thead>
            <tbody>
              {shown.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 20, color: "var(--muted)" }}>
                    Ogrenci bulunamadi.
                  </td>
                </tr>
              ) : (
                shown.map((row) => {
                  const barColor =
                    row.completion >= 75
                      ? "var(--success)"
                      : row.completion >= 50
                        ? "var(--warning)"
                        : "var(--danger)";
                  return (
                    <tr key={row.studentId}>
                      <td>
                        <Link href={`/coach/students/${row.studentId}`} className="name" style={{ textDecoration: "none", color: "inherit" }}>
                          <UkAvatar name={row.displayName} size={36} />
                          <div>
                            <b>{row.displayName}</b>
                            <br />
                            <span>{row.email}</span>
                          </div>
                        </Link>
                      </td>
                      <td>
                        <div style={{ width: 132 }}>
                          <div className="between" style={{ marginBottom: 6 }}>
                            <span className="tnum" style={{ fontSize: 12.5, fontWeight: 700 }}>
                              {row.completion}%
                            </span>
                          </div>
                          <div className="bar thin">
                            <span style={{ width: `${row.completion}%`, background: barColor }} />
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ width: 92 }}>
                          {row.examTrend.length > 1 ? (
                            <UkSparkline data={row.examTrend} width={92} height={28} fill={false} />
                          ) : (
                            <span className="muted" style={{ fontSize: 11 }}>
                              —
                            </span>
                          )}
                          <div className="tnum" style={{ fontSize: 12.5, fontWeight: 700, marginTop: 4 }}>
                            {row.net != null ? formatExamNet(row.net) : "—"}
                          </div>
                        </div>
                      </td>
                      <td>
                        <UkBadge tone={RISK_TONE[row.risk]} dot>
                          {RISK_BAND_LABELS[row.risk]}
                        </UkBadge>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>
                          {row.lastActivity}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </UkSection>
  );
}
