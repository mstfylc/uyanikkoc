"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  ASSIGNMENT_PRIORITY_LABELS,
  ASSIGNMENT_STATUS_LABELS,
  ASSIGNMENT_TYPE_LABELS,
  formatAssignmentDueDate,
} from "@/lib/assignment-labels";
import {
  buildStudentPriorityAssignment,
  calculateCompletionRate,
  calculateTopicCompletionRate,
  describeExamTrend,
  formatExamNet,
  RESULT_EXAM_TYPE_LABELS,
} from "@uyanik/shared";
import type {
  AssignmentPriority,
  AssignmentStatus,
  AssignmentType,
  ExamTrendSummary,
  TopicTrackingSummary,
} from "@uyanik/database";

type Assignment = {
  id: string;
  title: string;
  description: string | null;
  type: AssignmentType;
  priority: AssignmentPriority;
  status: AssignmentStatus;
  subject: string | null;
  dueDate: string | null;
  completed: boolean;
  createdAt: string;
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

export function StudentDashboard() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [topicSummary, setTopicSummary] = useState<TopicTrackingSummary | null>(null);
  const [examSummary, setExamSummary] = useState<ExamTrendSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTopicsLoading, setIsTopicsLoading] = useState(true);
  const [isExamsLoading, setIsExamsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [assignmentsResponse, topicsResponse, examsResponse] = await Promise.all([
        fetch("/api/student/assignments", { credentials: "same-origin" }),
        fetch("/api/student/topics", { credentials: "same-origin" }),
        fetch("/api/student/exams", { credentials: "same-origin" }),
      ]);

      if (assignmentsResponse.ok) {
        const data = (await assignmentsResponse.json()) as { assignments: Assignment[] };
        setAssignments(data.assignments);
      }

      if (topicsResponse.ok) {
        const data = (await topicsResponse.json()) as { summary: TopicTrackingSummary };
        setTopicSummary(data.summary);
      }

      if (examsResponse.ok) {
        const data = (await examsResponse.json()) as { summary: ExamTrendSummary };
        setExamSummary(data.summary);
      }

      setIsLoading(false);
      setIsTopicsLoading(false);
      setIsExamsLoading(false);
    }

    void load();
  }, []);

  const total = assignments.length;
  const completed = assignments.filter((item) => item.completed).length;
  const pending = total - completed;
  const completionRate = calculateCompletionRate(total, completed);
  const topicCompletionRate = topicSummary
    ? calculateTopicCompletionRate(topicSummary.totalTopics, topicSummary.completedTopics)
    : 0;
  const priorityAssignment = buildStudentPriorityAssignment(assignments);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-mono">Öğrenci Dashboard</h1>
        <p className="text-sm text-muted-foreground">Ödevlerin ve ilerlemen</p>
      </div>

      <div
        className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
        data-testid="ai-coach-band"
      >
        <div>
          <p className="text-sm font-medium">AI Koç · Yakında</p>
          <p className="text-xs text-muted-foreground">
            Kişisel AI koç modülü hazırlanıyor — canlı yanıt şu an kapalı.
          </p>
        </div>
        <Link href="/student/ai-coach" className="kt-btn kt-btn-sm kt-btn-light self-start sm:self-auto">
          Detay
        </Link>
      </div>

      <div className="kt-card" data-testid="student-priority-card">
        <div className="kt-card-body p-5 flex flex-col gap-2">
          <h3 className="text-base font-medium">Bugunku Oncelik</h3>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Yukleniyor...</p>
          ) : priorityAssignment ? (
            <>
              <p className="text-sm font-medium">{priorityAssignment.title ?? "Odev"}</p>
              <p className="text-xs text-muted-foreground">
                {priorityAssignment.priority
                  ? `Oncelik: ${ASSIGNMENT_PRIORITY_LABELS[priorityAssignment.priority as AssignmentPriority] ?? priorityAssignment.priority}`
                  : null}
                {priorityAssignment.dueDate
                  ? ` · Son tarih: ${formatAssignmentDueDate(priorityAssignment.dueDate)}`
                  : ""}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Acik odev yok — harika!</p>
          )}
        </div>
      </div>

      <div className="kt-card" data-testid="student-topic-summary-card">
        <div className="kt-card-body p-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-medium">Konu Tamamlama Ozeti</h3>
            {isTopicsLoading ? (
              <p className="text-sm text-muted-foreground">Yukleniyor...</p>
            ) : topicSummary && topicSummary.totalTopics > 0 ? (
              <p className="text-sm text-muted-foreground">
                {topicSummary.completedTopics}/{topicSummary.totalTopics} konu tamamlandi (
                {topicCompletionRate}%)
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Henuz konu yok — kendi konu listeni olusturabilirsin.
              </p>
            )}
          </div>
          <Link href="/student/topics" className="kt-btn kt-btn-sm kt-btn-light self-start sm:self-auto">
            Konu Takibi
          </Link>
        </div>
      </div>

      <div className="kt-card" data-testid="student-exam-summary-card">
        <div className="kt-card-body p-5 flex flex-col gap-2">
          <h3 className="text-base font-medium">Deneme Net Ozeti</h3>
          {isExamsLoading ? (
            <p className="text-sm text-muted-foreground">Yukleniyor...</p>
          ) : examSummary && examSummary.latestNet !== null ? (
            <>
              <p className="text-sm">
                Son net:{" "}
                <span className="font-semibold">{formatExamNet(examSummary.latestNet)}</span>
                {examSummary.examType ? ` (${RESULT_EXAM_TYPE_LABELS[examSummary.examType]})` : null}
              </p>
              <p className="text-xs text-muted-foreground">
                {describeExamTrend(examSummary.trend)}
                {examSummary.previousNet !== null
                  ? ` · Onceki: ${formatExamNet(examSummary.previousNet)}`
                  : ""}
                {examSummary.examCount > 0 ? ` · ${examSummary.examCount} deneme` : ""}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Henuz deneme sonucu yok.</p>
          )}
        </div>
      </div>

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

      <div className="kt-card">
        <div className="kt-card-header flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="kt-card-title text-base font-medium">Ödevlerim</h3>
          <Link href="/student/assignments" className="kt-btn kt-btn-sm kt-btn-light">
            Tümünü Gör
          </Link>
        </div>
        <div className="kt-card-body flex flex-col gap-3 p-5">
          {isLoading ? (
            <p className="text-muted-foreground text-sm">Yükleniyor...</p>
          ) : assignments.length === 0 ? (
            <p className="text-muted-foreground text-sm">Henüz atanmış ödev yok.</p>
          ) : (
            assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="flex flex-col gap-1 rounded-lg border border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="font-medium text-sm">{assignment.title}</div>
                  <div className="text-xs text-muted-foreground flex flex-wrap gap-x-2 gap-y-1 mt-1">
                    <span>{ASSIGNMENT_STATUS_LABELS[assignment.status]}</span>
                    <span>· {ASSIGNMENT_PRIORITY_LABELS[assignment.priority]}</span>
                    <span>· {ASSIGNMENT_TYPE_LABELS[assignment.type]}</span>
                    {assignment.subject ? <span>· {assignment.subject}</span> : null}
                    <span>· {formatAssignmentDueDate(assignment.dueDate)}</span>
                  </div>
                </div>
                <span
                  className={`kt-badge kt-badge-sm self-start sm:self-auto ${assignment.completed ? "kt-badge-success" : "kt-badge-warning"}`}
                >
                  {assignment.completed ? "Tamamlandı" : "Bekliyor"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
