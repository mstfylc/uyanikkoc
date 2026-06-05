"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

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

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Yukleniyor...</p>;
  }

  if (!summary) {
    return <p className="text-sm text-danger">Ogrenci bulunamadi.</p>;
  }

  return (
    <div className="flex flex-col gap-5" data-testid="coach-student-detail">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-mono">Ogrenci Detay</h1>
          <p className="text-sm text-muted-foreground">{studentId}</p>
        </div>
        <Link href="/coach/dashboard" className="kt-btn kt-btn-sm kt-btn-light">
          Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="kt-card">
          <div className="kt-card-body p-4">
            <p className="text-sm text-muted-foreground">Toplam odev</p>
            <p className="text-2xl font-semibold">{summary.assignments.length}</p>
          </div>
        </div>
        <div className="kt-card">
          <div className="kt-card-body p-4">
            <p className="text-sm text-muted-foreground">Konu tamamlama</p>
            <p className="text-2xl font-semibold">%{summary.topicSummary.completionRate}</p>
          </div>
        </div>
        <div className="kt-card">
          <div className="kt-card-body p-4">
            <p className="text-sm text-muted-foreground">Son deneme net</p>
            <p className="text-2xl font-semibold">
              {summary.examSummary.latestNet != null
                ? formatExamNet(summary.examSummary.latestNet)
                : "—"}
            </p>
          </div>
        </div>
        <div className="kt-card">
          <div className="kt-card-body p-4">
            <p className="text-sm text-muted-foreground">Motivasyon</p>
            <p className="text-2xl font-semibold">
              {summary.motivationEnabled ? "Acik" : "Kapali"}
            </p>
          </div>
        </div>
      </div>

      <div className="kt-card">
        <div className="kt-card-body p-4 flex flex-col gap-3">
          <h2 className="text-base font-medium">Deneme trendi</h2>
          {summary.examSummary.latestNet != null ? (
            <p className="text-sm text-muted-foreground">
              {describeExamTrend(summary.examSummary.trend)}
              {summary.examSummary.examType
                ? ` · ${RESULT_EXAM_TYPE_LABELS[summary.examSummary.examType]}`
                : ""}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Deneme kaydi yok.</p>
          )}
        </div>
      </div>

      <div className="kt-card">
        <div className="kt-card-body p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium">Motivasyon ayari</h2>
            <button
              type="button"
              disabled={motivationSaving}
              className="kt-btn kt-btn-sm kt-btn-light"
              onClick={() => void toggleMotivation(!summary.motivationEnabled)}
            >
              {summary.motivationEnabled ? "Kapat" : "Ac"}
            </button>
          </div>
          {summary.motivation.enabled ? (
            <p className="text-sm text-muted-foreground">
              Seri: {summary.motivation.streakDays} gun · Rozetler:{" "}
              {summary.motivation.badges.join(", ") || "Yok"}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Motivasyon kapali.</p>
          )}
        </div>
      </div>

      <div className="kt-card">
        <div className="kt-card-header px-4 py-3 border-b border-border">
          <h2 className="text-base font-medium">Son odevler</h2>
        </div>
        <div className="kt-card-body p-0">
          <ul className="divide-y divide-border">
            {summary.assignments.slice(0, 5).map((assignment) => (
              <li key={assignment.id} className="px-4 py-3 text-sm">
                <span className="font-medium">{assignment.title}</span>
                <span className="text-muted-foreground"> · {assignment.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
