"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";

import { UkSection } from "@/components/design/UkSection";
import { UkStatCard } from "@/components/design/UkStatCard";
import {
  ASSIGNMENT_PRIORITY_LABELS,
  ASSIGNMENT_TYPE_LABELS,
  formatAssignmentDueDate,
} from "@/lib/assignment-labels";
import {
  buildStudentPriorityAssignment,
  calculateCompletionRate,
  describeExamTrend,
  formatExamNet,
  RESULT_EXAM_TYPE_LABELS,
} from "@uyanik/shared";
import type {
  AssignmentPriority,
  AssignmentStatus,
  AssignmentType,
  ExamTrendSummary,
  MotivationSummary,
  SubjectRecord,
  TopicTrackingSummary,
} from "@uyanik/database";

type Assignment = {
  id: string;
  title: string;
  type: AssignmentType;
  priority: AssignmentPriority;
  status: AssignmentStatus;
  subject: string | null;
  dueDate: string | null;
  completed: boolean;
};

const SUBJECT_COLORS: Record<string, string> = {
  Matematik: "#534AB7",
  Fizik: "#2F6BD6",
  Kimya: "#0F6E56",
  Biyoloji: "#3A9D6A",
  Turkce: "#B26A12",
  Tarih: "#A3582D",
};

function subjectColor(name: string): string {
  return SUBJECT_COLORS[name] ?? "var(--primary)";
}

function subjectProgress(subjects: SubjectRecord[]) {
  return subjects.map((subject) => {
    const total = subject.topics.length;
    const completed = subject.topics.filter((topic) => topic.progress.completed).length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { name: subject.name, pct, completed, total };
  });
}

export function StudentDashboard() {
  const { data: session } = useSession();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [subjects, setSubjects] = useState<SubjectRecord[]>([]);
  const [topicSummary, setTopicSummary] = useState<TopicTrackingSummary | null>(null);
  const [examSummary, setExamSummary] = useState<ExamTrendSummary | null>(null);
  const [motivation, setMotivation] = useState<MotivationSummary | null>(null);
  const [filter, setFilter] = useState<"pending" | "done" | "all">("pending");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [assignmentsResponse, topicsResponse, examsResponse, motivationResponse] = await Promise.all([
        fetch("/api/student/assignments", { credentials: "same-origin" }),
        fetch("/api/student/topics", { credentials: "same-origin" }),
        fetch("/api/student/exams", { credentials: "same-origin" }),
        fetch("/api/student/motivation", { credentials: "same-origin" }),
      ]);

      if (assignmentsResponse.ok) {
        const data = (await assignmentsResponse.json()) as { assignments: Assignment[] };
        setAssignments(data.assignments);
      }

      if (topicsResponse.ok) {
        const data = (await topicsResponse.json()) as {
          subjects: SubjectRecord[];
          summary: TopicTrackingSummary;
        };
        setSubjects(data.subjects);
        setTopicSummary(data.summary);
      }

      if (examsResponse.ok) {
        const data = (await examsResponse.json()) as { summary: ExamTrendSummary };
        setExamSummary(data.summary);
      }

      if (motivationResponse.ok) {
        const data = (await motivationResponse.json()) as { motivation: MotivationSummary };
        setMotivation(data.motivation);
      }

      setIsLoading(false);
    }

    void load();
  }, []);

  const displayName = session?.user?.name ?? session?.user?.email?.split("@")[0] ?? "Ogrenci";
  const firstName = displayName.split(" ")[0] ?? displayName;
  const total = assignments.length;
  const completed = assignments.filter((item) => item.completed).length;
  const pending = total - completed;
  const completionRate = calculateCompletionRate(total, completed);
  const priorityAssignment = buildStudentPriorityAssignment(assignments);
  const subjectRows = useMemo(() => subjectProgress(subjects), [subjects]);

  const shownAssignments = assignments.filter((item) => {
    if (filter === "all") return true;
    if (filter === "done") return item.completed;
    return !item.completed;
  });

  return (
    <div className="stack rise" data-testid="student-dashboard">
      <div className="ai-band">
        <span className="ai-orb">
          <i className="ki-filled ki-technology-2 text-white text-xl" />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="row" style={{ gap: 8 }}>
            <b style={{ fontSize: 14 }}>AI Koc</b>
            <span className="badge badge-primary badge-dot">Yakinda</span>
          </div>
          <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>
            Kisisel yapay zeka kocun; zayif konularini analiz edip sana ozel program cikaracak.
          </div>
        </div>
        <Link href="/student/ai-coach" className="btn btn-sm btn-light">
          Detay
        </Link>
      </div>

      <div className="grid col-main">
        <div className="hero">
          <div className="between" style={{ alignItems: "flex-start", marginBottom: 20, gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  fontSize: 12.5,
                  color: "rgba(255,255,255,.78)",
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                Gunaydin
              </div>
              <h2 style={{ marginBottom: 7 }}>
                {firstName}, bugun {pending} gorevin var
              </h2>
              <p>
                Tamamlama <b style={{ color: "#fff" }}>%{completionRate}</b>
              </p>
            </div>
          </div>

          <div className="glass" style={{ padding: 16, display: "flex", alignItems: "center", gap: 14 }}>
            <span
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "rgba(255,255,255,.16)",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <i className="ki-filled ki-flag text-white text-xl" />
            </span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: ".05em",
                  color: "rgba(255,255,255,.7)",
                }}
              >
                Bugunun onceligi
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  marginTop: 2,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {priorityAssignment?.title ?? "Acik odev yok"}
              </div>
              {priorityAssignment?.dueDate ? (
                <div style={{ fontSize: 11.5, color: "rgba(255,255,255,.72)", marginTop: 2 }}>
                  Son tarih {formatAssignmentDueDate(priorityAssignment.dueDate)}
                </div>
              ) : null}
            </div>
            <Link href="/student/assignments" className="btn btn-sm btn-white">
              Basla
              <i className="ki-filled ki-arrow-right" />
            </Link>
          </div>
        </div>

        {motivation?.enabled ? (
          <div className="card" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div className="card-pad" style={{ display: "flex", flexDirection: "column", gap: 18, flex: 1 }}>
              <div className="between">
                <div className="row" style={{ gap: 8 }}>
                  <span className="stat-icon tone-warning" style={{ width: 38, height: 38 }}>
                    <i className="ki-filled ki-flame text-xl" />
                  </span>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>Calisma Serisi</div>
                </div>
                <span className="badge badge-warning">
                  <i className="ki-filled ki-flash" />
                  Aktif
                </span>
              </div>
              <div className="row" style={{ alignItems: "flex-end", gap: 12 }}>
                <div className="streak-num tnum" style={{ color: "var(--warning)" }}>
                  {motivation.streakDays}
                </div>
                <div style={{ paddingBottom: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>gun ust uste</div>
                </div>
              </div>
              {motivation.badges.length > 0 ? (
                <div className="row" style={{ flexWrap: "wrap", gap: 6 }}>
                  {motivation.badges.map((badge) => (
                    <span key={badge} className="badge badge-muted">
                      {badge}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="card-pad muted" style={{ fontSize: 13 }}>
              Motivasyon kapali.
            </div>
          </div>
        )}
      </div>

      <div className="grid g-4">
        <UkStatCard icon="ki-check-circle" tone="success" value={completed} label="Tamamlanan odev" />
        <UkStatCard icon="ki-notepad-edit" tone="warning" value={pending} label="Bekleyen gorev" />
        <UkStatCard icon="ki-chart-pie-simple" tone="info" value={`${completionRate}%`} label="Tamamlama orani" />
        <UkStatCard
          icon="ki-book-open"
          tone="primary"
          value={topicSummary ? `${topicSummary.completedTopics}/${topicSummary.totalTopics}` : "—"}
          label="Konu tamamlama"
        />
      </div>

      <div className="grid col-main">
        <UkSection
          title="Odevlerim"
          sub={`${pending} bekleyen gorev`}
          action={
            <div className="filters">
              <button type="button" className={filter === "pending" ? "on" : ""} onClick={() => setFilter("pending")}>
                Bekleyen
              </button>
              <button type="button" className={filter === "done" ? "on" : ""} onClick={() => setFilter("done")}>
                Bitti
              </button>
              <button type="button" className={filter === "all" ? "on" : ""} onClick={() => setFilter("all")}>
                Tumu
              </button>
            </div>
          }
        >
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {isLoading ? (
              <p className="muted" style={{ fontSize: 13 }}>
                Yukleniyor...
              </p>
            ) : shownAssignments.length === 0 ? (
              <div style={{ padding: "26px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
                Bu gorunumde gorev yok
              </div>
            ) : (
              shownAssignments.slice(0, 5).map((assignment) => (
                <div key={assignment.id} className={`lrow${assignment.completed ? " done" : ""}`}>
                  <span className="lr-icon" style={{ background: "var(--surface-3)" }}>
                    <i className="ki-filled ki-notepad-edit" />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="lr-title">{assignment.title}</div>
                    <div className="lr-meta">
                      {assignment.subject ? (
                        <span className="chip" style={{ height: 22, fontSize: 11, padding: "0 8px" }}>
                          <span className="swatch" style={{ background: subjectColor(assignment.subject) }} />
                          {assignment.subject}
                        </span>
                      ) : null}
                      <span className="d">{ASSIGNMENT_TYPE_LABELS[assignment.type]}</span>
                      <span className="d row" style={{ gap: 4 }}>
                        <i className="ki-filled ki-time" style={{ color: "var(--faint)" }} />
                        {formatAssignmentDueDate(assignment.dueDate)}
                      </span>
                    </div>
                  </div>
                  <span className={`badge badge-${assignment.completed ? "success" : "warning"}`}>
                    {assignment.completed ? "Bitti" : ASSIGNMENT_PRIORITY_LABELS[assignment.priority]}
                  </span>
                </div>
              ))
            )}
          </div>
        </UkSection>

        <UkSection
          title="Ders Ilerlemesi"
          sub="Konu tamamlama oranlarin"
          action={
            <Link href="/student/topics" className="link-btn">
              Detay
              <i className="ki-filled ki-arrow-right" />
            </Link>
          }
        >
          <div className="card-body subj">
            {isLoading ? (
              <p className="muted" style={{ fontSize: 13 }}>
                Yukleniyor...
              </p>
            ) : subjectRows.length === 0 ? (
              <p className="muted" style={{ fontSize: 13 }}>
                Henuz konu yok.
              </p>
            ) : (
              subjectRows.map((row) => (
                <div className="subj-row" key={row.name}>
                  <div className="between">
                    <span className="sname">
                      <span className="swatch" style={{ background: subjectColor(row.name) }} />
                      {row.name}
                    </span>
                    <span className="spct tnum">{row.pct}%</span>
                  </div>
                  <div className="bar">
                    <span style={{ width: `${row.pct}%`, background: subjectColor(row.name) }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </UkSection>
      </div>

      <UkSection title="Deneme Performansi" sub="Son deneme ozeti">
        <div className="card-body">
          {isLoading ? (
            <p className="muted" style={{ fontSize: 13 }}>
              Yukleniyor...
            </p>
          ) : examSummary && examSummary.latestNet !== null ? (
            <>
              <div className="between" style={{ marginBottom: 6 }}>
                <div>
                  <div className="row" style={{ gap: 8, alignItems: "baseline" }}>
                    <span className="tnum" style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-.02em" }}>
                      {formatExamNet(examSummary.latestNet)}
                    </span>
                    <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>net</span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>
                    {examSummary.examType ? RESULT_EXAM_TYPE_LABELS[examSummary.examType] : "Deneme"}
                    {examSummary.examCount > 0 ? ` · ${examSummary.examCount} deneme` : ""}
                  </div>
                </div>
              </div>
              <p className="muted" style={{ fontSize: 12.5 }}>
                {describeExamTrend(examSummary.trend)}
                {examSummary.previousNet !== null
                  ? ` · Onceki: ${formatExamNet(examSummary.previousNet)}`
                  : ""}
              </p>
            </>
          ) : (
            <p className="muted" style={{ fontSize: 13 }}>
              Henuz deneme sonucu yok.
            </p>
          )}
        </div>
      </UkSection>
    </div>
  );
}
