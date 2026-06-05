"use client";

import { KiIcon } from "@/components/design/KiIcon";
import Link from "next/link";
import { useEffect, useState } from "react";

import { UkBadge } from "@/components/design/UkBadge";
import { UkSection } from "@/components/design/UkSection";
import { UkStatCard } from "@/components/design/UkStatCard";
import {
  ASSIGNMENT_PRIORITY_LABELS,
  ASSIGNMENT_STATUS_LABELS,
  ASSIGNMENT_TYPE_LABELS,
  formatAssignmentDueDate,
} from "@/lib/assignment-labels";
import { subjectColor } from "@/lib/design/subject-colors";
import {
  buildParentWeeklyComment,
  calculateCompletionRate,
  countOverdueAssignments,
  formatExamNet,
} from "@uyanik/shared";
import type {
  AssignmentPriority,
  AssignmentStatus,
  AssignmentType,
  ResultExamType,
} from "@uyanik/database";

type ParentSummary = {
  totalAssignments: number;
  completedCount: number;
  pendingCount: number;
  topicCompletionRate: number;
  latestExamNet: number | null;
  latestExamType: ResultExamType | null;
  examTrend: "up" | "down" | "flat";
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
  const weeklyComment = buildParentWeeklyComment(completionRate, overdueCount, pending, {
    topicCompletionRate: summary?.topicCompletionRate,
    latestExamNet: summary?.latestExamNet,
    examTrend: summary?.examTrend,
  });

  return (
    <div className="stack rise" data-testid="parent-summary">
      <h1 className="sr-only">Veli Dashboard</h1>
      {!isLoading && summary ? (
        <p className="sr-only">Tamamlanan: {completed}</p>
      ) : null}

      <div className="hero">
        <div className="between" style={{ alignItems: "flex-start", flexWrap: "wrap", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.78)", fontWeight: 600, marginBottom: 6 }}>
              Merhaba
            </div>
            <h2 style={{ marginBottom: 7 }}>Cocugunuzun gelisimi</h2>
            <p>Haftalik odev ve deneme ozeti</p>
          </div>
          <span className="badge" style={{ background: "rgba(255,255,255,.16)", color: "#fff", height: 26 }}>
            <KiIcon name="ki-heart" size={14} style={{ marginRight: 6 }} />
            Veli Paneli
          </span>
        </div>
      </div>

      <div className="grid g-4">
        <UkStatCard icon="ki-chart-pie-simple" tone="success" value={`${completionRate}%`} label="Odev tamamlama" />
        <UkStatCard icon="ki-notepad-edit" tone="warning" value={pending} label="Bekleyen odev" />
        <UkStatCard
          icon="ki-chart-simple"
          tone="primary"
          value={summary?.latestExamNet != null ? formatExamNet(summary.latestExamNet) : "—"}
          label="Son deneme neti"
        />
        <UkStatCard
          icon="ki-book-open"
          tone="info"
          value={`%${summary?.topicCompletionRate ?? 0}`}
          label="Konu tamamlama"
        />
      </div>

      <div className="grid col-main">
        <UkSection
          title="Haftalik odevler"
          sub="Cocugunuzun guncel odevleri"
          action={
            <UkBadge tone={completionRate >= 70 ? "success" : "warning"}>
              {completed}/{total} tamam
            </UkBadge>
          }
        >
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {isLoading ? (
              <p className="muted" style={{ fontSize: 13 }}>
                Yukleniyor...
              </p>
            ) : !summary || summary.assignments.length === 0 ? (
              <div style={{ padding: "16px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
                Henuz odev yok.
              </div>
            ) : (
              summary.assignments.slice(0, 6).map((assignment) => {
                const color = subjectColor(assignment.subject ?? "Genel");
                return (
                  <div key={assignment.id} className="lrow">
                    <span
                      className="lr-icon"
                      style={{
                        background: `color-mix(in srgb, ${color} 13%, transparent)`,
                        color,
                      }}
                    >
                      <KiIcon name="ki-notepad-edit" />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="lr-title">{assignment.title}</div>
                      <div className="lr-meta">
                        {assignment.subject ? (
                          <span className="chip" style={{ height: 20, fontSize: 10.5 }}>
                            <span className="swatch" style={{ background: color }} />
                            {assignment.subject}
                          </span>
                        ) : null}
                        <span className="d">{formatAssignmentDueDate(assignment.dueDate)}</span>
                      </div>
                    </div>
                    {assignment.completed ? (
                      <UkBadge tone="success">Bitti</UkBadge>
                    ) : (
                      <UkBadge tone="warning" dot>
                        Bekliyor
                      </UkBadge>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </UkSection>

        <div className="stack">
          <div className="stack" data-testid="parent-weekly-comment">
            <UkSection title="Haftalik yorum">
              <div className="card-body">
                <p style={{ fontSize: 13, lineHeight: 1.6 }}>
                  {isLoading ? "Yukleniyor..." : weeklyComment}
                </p>
                <div className="row" style={{ gap: 8, marginTop: 16 }}>
                  <Link href="/parent/messages" className="btn btn-sm btn-primary">
                    Mesaj
                  </Link>
                  <Link href="/parent/notifications" className="btn btn-sm btn-light">
                    Bildirimler
                  </Link>
                </div>
              </div>
            </UkSection>
          </div>

          <UkSection title="Odev detay ozeti">
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {summary?.assignments.slice(0, 3).map((assignment) => (
                <p key={assignment.id} className="muted" style={{ fontSize: 12.5 }}>
                  {assignment.title} · {ASSIGNMENT_STATUS_LABELS[assignment.status]} ·{" "}
                  {ASSIGNMENT_PRIORITY_LABELS[assignment.priority]} ·{" "}
                  {ASSIGNMENT_TYPE_LABELS[assignment.type]}
                </p>
              )) ?? (
                <p className="muted" style={{ fontSize: 13 }}>
                  Ozet yok.
                </p>
              )}
            </div>
          </UkSection>
        </div>
      </div>
    </div>
  );
}
