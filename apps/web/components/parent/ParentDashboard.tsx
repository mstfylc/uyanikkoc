"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { KiIcon } from "@/components/design/KiIcon";
import { UkPageHead } from "@/components/design/UkPageHead";
import {
  ASSIGNMENT_PRIORITY_LABELS,
  ASSIGNMENT_STATUS_LABELS,
  ASSIGNMENT_TYPE_LABELS,
  formatAssignmentDueDate,
} from "@/lib/assignment-labels";
import {
  buildParentWeeklyComment,
  calculateCompletionRate,
  countOverdueAssignments,
} from "@uyanik/shared";
import type { AssignmentPriority, AssignmentStatus, AssignmentType } from "@uyanik/database";

type ParentSummary = {
  totalAssignments: number;
  completedCount: number;
  pendingCount: number;
  assignments: Array<{
    id: string;
    title: string;
    type: AssignmentType;
    priority: AssignmentPriority;
    status: AssignmentStatus;
    subject: string | null;
    dueDate: string | null;
    completed: boolean;
  }>;
};

type StatCardProps = {
  label: string;
  value: number | string;
  icon: string;
  tone?: "primary" | "success" | "warning" | "danger" | "info";
};

function StatCard({ label, value, icon, tone = "primary" }: StatCardProps) {
  return (
    <div className="card stat">
      <div className="card-pad">
        <div className="stat-top">
          <span className={`stat-icon tone-${tone}`}>
            <KiIcon name={icon} size={22} />
          </span>
        </div>
        <div>
          <div className="stat-value tnum">{value}</div>
          <div className="stat-label">{label}</div>
        </div>
      </div>
    </div>
  );
}

export function ParentDashboard() {
  const [summary, setSummary] = useState<ParentSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const response = await fetch("/api/parent/summary", { credentials: "same-origin" });
      if (response.ok) {
        const data = (await response.json()) as { summary: ParentSummary };
        setSummary(data.summary);
      }
      setIsLoading(false);
    }

    void load();
  }, []);

  const total = summary?.totalAssignments ?? 0;
  const completed = summary?.completedCount ?? 0;
  const pending = summary?.pendingCount ?? 0;
  const completionRate = calculateCompletionRate(total, completed);
  const overdueCount = summary ? countOverdueAssignments(summary.assignments) : 0;
  const weeklyComment = buildParentWeeklyComment(completionRate, overdueCount, pending);

  return (
    <div className="stack rise" data-testid="parent-summary">
      <UkPageHead title="Veli Dashboard" sub="Öğrencinizin ödev, deneme ve ilerleme özeti" />

      {!isLoading && summary ? (
        <p className="sr-only">
          Tamamlanan: {completed}
        </p>
      ) : null}

      <div className="grid g-4">
        <StatCard label="Toplam Ödev" value={isLoading ? "—" : total} icon="ki-notepad-edit" />
        <StatCard
          label="Tamamlanan"
          value={isLoading ? "—" : completed}
          icon="ki-check-circle"
          tone="success"
        />
        <StatCard
          label="Bekleyen"
          value={isLoading ? "—" : pending}
          icon="ki-time"
          tone="warning"
        />
        <StatCard
          label="Tamamlama %"
          value={isLoading ? "—" : `${completionRate}%`}
          icon="ki-chart-pie-simple"
          tone="primary"
        />
      </div>

      <div className="card" data-testid="parent-weekly-comment">
        <div className="card-head">
          <div>
            <h3>Haftalık Yorum</h3>
            <p className="sub">Bu haftanın kısa gelişim yorumu</p>
          </div>
        </div>
        <div className="card-body">
          <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.55 }}>{isLoading ? "Yükleniyor..." : weeklyComment}</p>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <h3>Genel İlerleme</h3>
            <p className="sub">Son ödevlerden hesaplanan tamamlanma oranı</p>
          </div>
          <span className="badge badge-primary" style={{ height: 26 }}>%{completionRate}</span>
        </div>
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="meter-bar">
            <span style={{ width: `${completionRate}%` }} />
          </div>
          {summary && summary.assignments.length > 0 ? (
            <div className="stack" style={{ gap: 8 }}>
              {summary.assignments.slice(0, 5).map((assignment) => (
                <div key={assignment.id} className="lrow">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <b style={{ fontSize: 13.5 }}>{assignment.title}</b>
                    <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                    {ASSIGNMENT_STATUS_LABELS[assignment.status]} · {ASSIGNMENT_PRIORITY_LABELS[assignment.priority]} ·{" "}
                    {ASSIGNMENT_TYPE_LABELS[assignment.type]}
                    {assignment.subject ? ` · ${assignment.subject}` : ""} ·{" "}
                    {formatAssignmentDueDate(assignment.dueDate)}
                    </div>
                  </div>
                  <span className={`badge badge-${assignment.completed ? "success" : "warning"}`} style={{ height: 24, flexShrink: 0 }}>
                    {assignment.completed ? "Tamamlandı" : "Bekliyor"}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
          <div className="row" style={{ gap: 8 }}>
            <Link href="/parent/reports" className="btn btn-primary btn-sm">
              Rapor
            </Link>
            <Link href="/parent/messages" className="btn btn-light btn-sm">
              Mesaj
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
