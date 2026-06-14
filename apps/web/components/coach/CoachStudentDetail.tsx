"use client";

import { KiIcon } from "@/components/design/KiIcon";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { UkBadge } from "@/components/design/UkBadge";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import { UkStatCard } from "@/components/design/UkStatCard";
import { MistakeInsightsCard } from "@/components/shared/MistakeInsightsCard";
import { ASSIGNMENT_STATUS_LABELS } from "@/lib/assignment-labels";
import {
  describeExamTrend,
  formatExamNet,
  RESULT_EXAM_TYPE_LABELS,
} from "@uyanik/shared";
import type {
  AssignmentRecord,
  ExamTrendSummary,
  MotivationSummary,
  TopicTrackingSummary,
} from "@uyanik/database";

type CoachStudentSummary = {
  studentId: string;
  assignments: AssignmentRecord[];
  topicSummary: TopicTrackingSummary;
  examSummary: ExamTrendSummary;
  motivationEnabled: boolean;
  motivation: MotivationSummary;
};

type CoachStudentDetailProps = {
  studentId: string;
};

export function CoachStudentDetail({ studentId }: CoachStudentDetailProps) {
  const [summary, setSummary] = useState<CoachStudentSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [motivationSaving, setMotivationSaving] = useState(false);
  const [motivationMessage, setMotivationMessage] = useState("");
  const [motivationSending, setMotivationSending] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch(`/api/coach/students/${studentId}/summary`, {
      credentials: "same-origin",
    });
    if (response.ok) {
      const data = (await response.json()) as { summary: CoachStudentSummary };
      setSummary(data.summary);
    }
    setIsLoading(false);
  }, [studentId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggleMotivation(enabled: boolean) {
    setMotivationSaving(true);
    const response = await fetch(`/api/coach/students/${studentId}/motivation`, {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled }),
    });
    setMotivationSaving(false);

    if (response.ok) {
      await load();
    }
  }

  async function sendMotivation() {
    if (motivationMessage.trim().length < 3) {
      return;
    }
    setMotivationSending(true);
    const response = await fetch("/api/coach/motivation", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentIds: [studentId], message: motivationMessage.trim() }),
    });
    setMotivationSending(false);
    if (response.ok) {
      setMotivationMessage("");
    }
  }

  if (isLoading) {
    return <p className="muted" style={{ fontSize: 13 }}>Yükleniyor...</p>;
  }

  if (!summary) {
    return <p className="badge badge-danger" style={{ height: "auto", padding: "10px 12px" }}>Öğrenci bulunamadı.</p>;
  }

  return (
    <div className="stack rise" data-testid="coach-student-detail">
      <UkPageHead
        title="Öğrenci Detay"
        sub={studentId}
        actions={
          <Link href="/coach/dashboard" className="btn btn-light btn-sm">
            Dashboard
          </Link>
        }
      />

      <div className="grid g-4">
        <UkStatCard icon="ki-notepad-edit" tone="primary" value={summary.assignments.length} label="Toplam ödev" />
        <UkStatCard
          icon="ki-book-open"
          tone="info"
          value={`%${summary.topicSummary.completionRate}`}
          label="Konu tamamlama"
        />
        <UkStatCard
          icon="ki-chart-simple"
          tone="success"
          value={summary.examSummary.latestNet != null ? formatExamNet(summary.examSummary.latestNet) : "—"}
          label="Son deneme neti"
        />
        <UkStatCard
          icon="ki-star"
          tone="warning"
          value={summary.motivationEnabled ? "Acik" : "Kapali"}
          label="Motivasyon"
        />
      </div>

      <div className="grid col-main">
        <MistakeInsightsCard mode="coach" studentId={studentId} />

        <UkSection title="Deneme trendi">
          <div className="card-body">
            {summary.examSummary.latestNet != null ? (
              <p className="muted" style={{ fontSize: 13 }}>
                {describeExamTrend(summary.examSummary.trend)}
                {summary.examSummary.examType
                  ? ` · ${RESULT_EXAM_TYPE_LABELS[summary.examSummary.examType]}`
                  : ""}
              </p>
            ) : (
              <p className="muted" style={{ fontSize: 13 }}>
                Deneme kaydi yok.
              </p>
            )}
          </div>
        </UkSection>

        <UkSection
          title="Motivasyon ayari"
          action={
            <button
              type="button"
              disabled={motivationSaving}
              className="btn btn-light btn-sm"
              onClick={() => void toggleMotivation(!summary.motivationEnabled)}
            >
              {summary.motivationEnabled ? "Kapat" : "Ac"}
            </button>
          }
        >
          <div className="card-body">
            {summary.motivation.enabled ? (
              <p className="muted" style={{ fontSize: 13 }}>
                Seri: {summary.motivation.streakDays} gun · Rozetler:{" "}
                {summary.motivation.badges.length > 0 ? (
                  <span className="row" style={{ display: "inline-flex", gap: 6, flexWrap: "wrap" }}>
                    {summary.motivation.badges.map((badge) => (
                      <UkBadge key={badge} tone="primary">
                        {badge}
                      </UkBadge>
                    ))}
                  </span>
                ) : (
                  "Yok"
                )}
              </p>
            ) : (
              <p className="muted" style={{ fontSize: 13 }}>
                Motivasyon kapali.
              </p>
            )}
          </div>
        </UkSection>

        <UkSection title="Motivasyon gönder" sub="Öğrenciye günlük not">
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <textarea
              className="input"
              rows={3}
              value={motivationMessage}
              onChange={(event) => setMotivationMessage(event.target.value)}
              placeholder="Kısa bir motivasyon mesajı yaz..."
            />
            <button
              type="button"
              className="btn btn-primary w-fit"
              disabled={motivationSending || motivationMessage.trim().length < 3}
              onClick={() => void sendMotivation()}
            >
              {motivationSending ? "Gönderiliyor..." : "Gönder"}
            </button>
          </div>
        </UkSection>
      </div>

      <UkSection title="Son ödevler">
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {summary.assignments.slice(0, 5).map((assignment) => (
            <div key={assignment.id} className="lrow">
              <span className="lr-icon tone-primary">
                <KiIcon name="ki-notepad-edit" />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="lr-title">{assignment.title}</div>
                <div className="lr-meta">
                  <span className="d">{ASSIGNMENT_STATUS_LABELS[assignment.status]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </UkSection>
    </div>
  );
}
