"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  ASSIGNMENT_PRIORITY_LABELS,
  ASSIGNMENT_STATUS_LABELS,
  ASSIGNMENT_TYPE_LABELS,
  buildSimpleWeeklyComment,
  countOverdueAssignments,
  formatAssignmentDueDate,
} from "@/lib/assignment-labels";
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
  tone?: "primary" | "success" | "warning" | "danger";
};

function StatCard({ label, value, icon, tone = "primary" }: StatCardProps) {
  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "warning"
        ? "text-warning"
        : tone === "danger"
          ? "text-danger"
          : "text-primary";

  return (
    <div className="kt-card">
      <div className="kt-card-body flex items-center gap-4 p-5">
        <span className={`flex size-12 items-center justify-center rounded-lg bg-muted ${toneClass}`}>
          <i className={`ki-filled ${icon} text-xl`} />
        </span>
        <div>
          <div className="text-2xl font-semibold text-mono">{value}</div>
          <div className="text-sm text-muted-foreground">{label}</div>
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
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const overdueCount = summary ? countOverdueAssignments(summary.assignments) : 0;
  const weeklyComment = buildSimpleWeeklyComment(completionRate, pending, overdueCount);

  return (
    <div className="flex flex-col gap-5" data-testid="parent-summary">
      <div>
        <h1 className="text-xl font-semibold text-mono">Veli Dashboard</h1>
        <p className="text-sm text-muted-foreground">Öğrencinizin ilerleme özeti</p>
      </div>

      {!isLoading && summary ? (
        <p className="sr-only">
          Tamamlanan: {completed}
        </p>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
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

      <div className="kt-card" data-testid="parent-weekly-comment">
        <div className="kt-card-body p-5 flex flex-col gap-2">
          <h3 className="text-base font-medium">Haftalik Yorum</h3>
          <p className="text-sm text-muted-foreground">{isLoading ? "Yukleniyor..." : weeklyComment}</p>
        </div>
      </div>

      <div className="kt-card">
        <div className="kt-card-body p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium">Genel İlerleme</h3>
            <span className="text-sm font-semibold text-primary">{completionRate}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          {summary && summary.assignments.length > 0 ? (
            <ul className="flex flex-col gap-2 pt-2 text-sm">
              {summary.assignments.slice(0, 5).map((assignment) => (
                <li key={assignment.id} className="flex flex-col gap-0.5 border-b border-border pb-2 last:border-0">
                  <span className="font-medium">{assignment.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {ASSIGNMENT_STATUS_LABELS[assignment.status]} ·{" "}
                    {ASSIGNMENT_PRIORITY_LABELS[assignment.priority]} ·{" "}
                    {ASSIGNMENT_TYPE_LABELS[assignment.type]}
                    {assignment.subject ? ` · ${assignment.subject}` : ""} ·{" "}
                    {formatAssignmentDueDate(assignment.dueDate)}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="flex gap-2 pt-2">
            <Link href="/parent/dashboard" className="kt-btn kt-btn-sm kt-btn-primary">
              Rapor
            </Link>
            <Link href="/parent/dashboard" className="kt-btn kt-btn-sm kt-btn-light">
              Mesaj
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
