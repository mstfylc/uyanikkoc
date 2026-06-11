"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { KiIcon } from "@/components/design/KiIcon";
import {
  ASSIGNMENT_PRIORITY_LABELS,
  ASSIGNMENT_TYPE_LABELS,
  formatAssignmentDueDate,
  isAssignmentOpen,
} from "@/lib/assignment-labels";
import { buildStudentPriorityAssignment, calculateCompletionRate } from "@uyanik/shared";
import type { AssignmentPriority, AssignmentStatus, AssignmentType } from "@uyanik/database";

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

type Tone = "primary" | "success" | "warning" | "danger" | "info" | "muted";
type FilterKey = "open" | "done" | "all";

const subjectProgress = [
  { name: "Turkce", pct: 74, color: "#5b51c9", meta: "Paragraf + dil bilgisi" },
  { name: "Matematik", pct: 68, color: "#2f80ed", meta: "Problem ve temel kavramlar" },
  { name: "Fen Bilimleri", pct: 63, color: "#10a37f", meta: "Haftalik tekrar onerildi" },
  { name: "Sosyal Bilgiler", pct: 82, color: "#b7791f", meta: "Guclu alan" },
];

const examTrend = [72, 81, 86, 94, 103, 110];
const upcomingExams = [
  { name: "TYT Genel Deneme #7", date: "12 Haziran", mode: "Online", tone: "primary" as Tone },
  { name: "AYT Matematik Tarama", date: "15 Haziran", mode: "Kurum", tone: "warning" as Tone },
  { name: "LGS Prova Denemesi", date: "18 Haziran", mode: "Sinif", tone: "success" as Tone },
];

function Badge({
  tone = "muted",
  icon,
  children,
}: {
  tone?: Tone;
  icon?: string;
  children: React.ReactNode;
}) {
  return (
    <span className={`badge badge-${tone}`}>
      {icon ? <KiIcon name={icon} size={14} /> : null}
      {children}
    </span>
  );
}

function Bar({ value, color }: { value: number; color?: string }) {
  return (
    <div className="bar">
      <span style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }} />
    </div>
  );
}

function Delta({ value, dir = "up" }: { value: string; dir?: "up" | "down" }) {
  return (
    <span className={`delta ${dir === "down" ? "down" : ""}`}>
      <KiIcon name={dir === "down" ? "ki-arrow-down" : "ki-arrow-up"} size={13} />
      {value}
    </span>
  );
}

function Section({
  title,
  sub,
  action,
  children,
}: {
  title: string;
  sub: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="card">
      <div className="card-head">
        <div>
          <h3>{title}</h3>
          <p className="sub">{sub}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function StatCard({
  label,
  value,
  icon,
  tone = "primary",
  delta,
  deltaDir,
}: {
  label: string;
  value: number | string;
  icon: string;
  tone?: Exclude<Tone, "muted">;
  delta?: string;
  deltaDir?: "up" | "down";
}) {
  return (
    <div className="card stat">
      <div className="card-pad">
        <div className="stat-top">
          <span className={`stat-icon tone-${tone}`}>
            <KiIcon name={icon} size={22} />
          </span>
          {delta ? <Delta value={delta} dir={deltaDir} /> : null}
        </div>
        <div>
          <div className="stat-value tnum">{value}</div>
          <div className="stat-label">{label}</div>
        </div>
      </div>
    </div>
  );
}

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(1, max - min);
  const points = values
    .map((value, index) => {
      const x = (index / Math.max(1, values.length - 1)) * 100;
      const y = 58 - ((value - min) / range) * 48;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg className="spark" viewBox="0 0 100 64" role="img" aria-label="Deneme net trendi">
      <polyline fill="none" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" points={points} />
      {values.map((value, index) => {
        const x = (index / Math.max(1, values.length - 1)) * 100;
        const y = 58 - ((value - min) / range) * 48;
        return <circle key={`${value}-${index}`} cx={x} cy={y} r="3" fill="var(--surface)" stroke="var(--primary)" strokeWidth="2" />;
      })}
    </svg>
  );
}

function BarChart({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  const peak = Math.max(...values);

  return (
    <div className="chart" aria-label="Deneme basari grafigi">
      {values.map((value, index) => (
        <div key={`${value}-${index}`} className={`col ${value === peak ? "peak" : ""}`}>
          <div className="track">
            <span className="fill gradient" style={{ height: `${Math.max(8, (value / max) * 100)}%` }} />
          </div>
          <label>{index + 1}</label>
        </div>
      ))}
    </div>
  );
}

function PriorityGlass({
  assignment,
  isLoading,
}: {
  assignment: Assignment | null | undefined;
  isLoading: boolean;
}) {
  return (
    <div className="glass" style={{ padding: 16, marginTop: 20 }}>
      <div className="between" style={{ gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <span className="stat-icon" style={{ background: "rgba(255,255,255,.18)", color: "#fff" }}>
            <KiIcon name="ki-notepad-edit" size={20} />
          </span>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,.76)" }}>Bugunun onceligi</p>
            <b style={{ display: "block", fontSize: 15.5, marginTop: 2 }}>
              {isLoading ? "Yükleniyor..." : assignment?.title ?? "Acil ödev yok"}
            </b>
            <p style={{ marginTop: 4, fontSize: 12.5, color: "rgba(255,255,255,.76)" }}>
              {assignment
                ? `${assignment.subject ?? ASSIGNMENT_TYPE_LABELS[assignment.type]} · Son tarih ${formatAssignmentDueDate(assignment.dueDate)}`
                : "Bugun icin acik oncelik bulunmuyor."}
            </p>
          </div>
        </div>
        <Link href="/student/assignments" className="btn btn-sm btn-white">
          Basla <KiIcon name="ki-arrow-right" size={15} />
        </Link>
      </div>
    </div>
  );
}

function StreakCard() {
  const days = ["P", "S", "C", "P", "C", "C", "P"];

  return (
    <div className="card" style={{ height: "100%" }}>
      <div className="card-pad" style={{ height: "100%", display: "flex", flexDirection: "column", gap: 18 }}>
        <div className="between">
          <span className="stat-icon tone-warning">
            <KiIcon name="ki-flash" size={22} />
          </span>
          <Badge tone="warning" icon="ki-flash">
            Aktif
          </Badge>
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: 16 }}>Calisma Serisi</h3>
          <p className="muted" style={{ fontSize: 12.5, marginTop: 3 }}>Duzenli calisma ritmin</p>
        </div>
        <div className="streak-num tnum">12</div>
        <div className="dots">
          {days.map((day, index) => (
            <i key={`${day}-${index}`} className={index < 5 ? (index === 4 ? "today" : "on") : ""}>
              {day}
            </i>
          ))}
        </div>
        <div className="lrow" style={{ padding: 12, marginTop: "auto" }}>
          <div>
            <b className="lr-title">Harika gidiyorsun!</b>
            <p className="muted" style={{ fontSize: 12, marginTop: 3 }}>Bugunku gorevi bitir, seriyi koru.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AssignmentRow({
  assignment,
  onComplete,
}: {
  assignment: Assignment;
  onComplete: (assignmentId: string) => void;
}) {
  const open = isAssignmentOpen(assignment);

  return (
    <div className={`lrow ${open ? "" : "done"}`}>
      <button
        type="button"
        className={`chk ${open ? "" : "done"}`}
        aria-label={open ? `${assignment.title} tamamla` : `${assignment.title} tamamlandi`}
        onClick={() => open && onComplete(assignment.id)}
        disabled={!open}
      >
        <KiIcon name="ki-check" size={14} />
      </button>
      <span className="lr-icon tone-primary">
        <KiIcon name={assignment.type === "exam_prep" ? "ki-chart-simple" : "ki-book-open"} size={19} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="lr-title">{assignment.title}</div>
        <div className="lr-meta">
          {assignment.subject ? <span>{assignment.subject}</span> : null}
          <span>{ASSIGNMENT_TYPE_LABELS[assignment.type]}</span>
          <span className="d">{formatAssignmentDueDate(assignment.dueDate)}</span>
        </div>
      </div>
      <Badge tone={open ? (assignment.priority === "high" ? "danger" : "warning") : "success"}>
        {open ? ASSIGNMENT_PRIORITY_LABELS[assignment.priority] : "Bitti"}
      </Badge>
    </div>
  );
}

function Assignments({
  assignments,
  isLoading,
  onComplete,
}: {
  assignments: Assignment[];
  isLoading: boolean;
  onComplete: (assignmentId: string) => void;
}) {
  const [filter, setFilter] = useState<FilterKey>("open");
  const pending = assignments.filter((item) => isAssignmentOpen(item)).length;
  const filtered = assignments.filter((item) => {
    if (filter === "all") return true;
    return filter === "done" ? !isAssignmentOpen(item) : isAssignmentOpen(item);
  });

  return (
    <Section
      title="Ödevlerim"
      sub={`${pending} bekleyen gorev`}
      action={
        <div className="filters">
          <button type="button" className={filter === "open" ? "on" : ""} onClick={() => setFilter("open")}>Bekleyen</button>
          <button type="button" className={filter === "done" ? "on" : ""} onClick={() => setFilter("done")}>Bitti</button>
          <button type="button" className={filter === "all" ? "on" : ""} onClick={() => setFilter("all")}>Tümü</button>
        </div>
      }
    >
      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {isLoading ? (
          <p className="muted" style={{ fontSize: 13 }}>Yükleniyor...</p>
        ) : filtered.length === 0 ? (
          <p className="muted" style={{ fontSize: 13 }}>Bu filtrede ödev yok.</p>
        ) : (
          filtered.slice(0, 5).map((assignment) => (
            <AssignmentRow key={assignment.id} assignment={assignment} onComplete={onComplete} />
          ))
        )}
        <Link href="/student/assignments" className="link-btn" style={{ alignSelf: "flex-start", marginTop: 2 }}>
          Tümünu Gor <KiIcon name="ki-arrow-right" size={14} />
        </Link>
      </div>
    </Section>
  );
}

function SubjectProgress() {
  return (
    <Section title="Ders Ilerlemesi" sub="Konu tamamlama oranlarin">
      <div className="card-body subj">
        {subjectProgress.map((subject) => (
          <div key={subject.name} className="subj-row">
            <div className="between">
              <div>
                <div className="sname">
                  <span className="swatch" style={{ background: subject.color }} />
                  {subject.name}
                </div>
                <p className="muted" style={{ fontSize: 12, marginTop: 3 }}>{subject.meta}</p>
              </div>
              <span className="spct tnum">{subject.pct}%</span>
            </div>
            <Bar value={subject.pct} color={subject.color} />
          </div>
        ))}
      </div>
    </Section>
  );
}

function ExamPerformance() {
  const last = examTrend[examTrend.length - 1] ?? 0;
  const first = examTrend[0] ?? 0;

  return (
    <Section
      title="Deneme Performansi"
      sub="Son 6 TYT denemesi"
      action={<Badge tone="success" icon="ki-arrow-up">Net +{last - first}</Badge>}
    >
      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div className="between">
          <div>
            <div className="stat-value tnum" style={{ fontSize: 34 }}>{last}</div>
            <p className="muted" style={{ fontSize: 12.5 }}>Son deneme neti</p>
          </div>
          <Delta value="+8 net" />
        </div>
        <Sparkline values={examTrend} />
        <hr className="hr" />
        <div>
          <div className="between" style={{ marginBottom: 8 }}>
            <b style={{ fontSize: 13 }}>Deneme basari yuzdesi</b>
            <span className="muted tnum" style={{ fontSize: 12 }}>73%</span>
          </div>
          <BarChart values={examTrend.map((value) => Math.round((value / 120) * 100))} />
        </div>
      </div>
    </Section>
  );
}

function UpcomingExams() {
  return (
    <Section
      title="Yaklasan Denemeler"
      sub="Planlanan sinav ve taramalar"
      action={<Link href="/student/exams" className="btn btn-light btn-sm">Takvim</Link>}
    >
      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {upcomingExams.map((exam) => (
          <div key={exam.name} className="lrow">
            <span className={`lr-icon tone-${exam.tone}`}>
              <KiIcon name="ki-chart-simple" size={19} />
            </span>
            <div style={{ flex: 1 }}>
              <div className="lr-title">{exam.name}</div>
              <div className="lr-meta">
                <span>{exam.date}</span>
                <span className="d">{exam.mode}</span>
              </div>
            </div>
            <Badge tone={exam.tone}>{exam.mode}</Badge>
          </div>
        ))}
        <Link href="/student/exams" className="btn btn-primary btn-sm" style={{ alignSelf: "flex-start", marginTop: 4 }}>
          Denemeye kayıt ol
        </Link>
      </div>
    </Section>
  );
}

function AiBand() {
  return (
    <div className="ai-band rise" data-testid="ai-coach-band">
      <span className="ai-orb">
        <KiIcon name="ki-technology-2" size={24} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <h3 style={{ fontSize: 16, margin: 0 }}>AI Koç</h3>
          <Badge tone="warning">Yakında</Badge>
        </div>
        <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>
          Kisisel yapay zeka kocun; zayif konularini analiz edip sana ozel program cikaracak.
        </p>
      </div>
      <Link href="/student/ai-coach" className="btn btn-sm btn-light">
        Detay
      </Link>
    </div>
  );
}

export function StudentDashboard() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadAssignments() {
    setIsLoading(true);
    setError(null);
    const response = await fetch("/api/student/assignments", { credentials: "same-origin" });
    if (!response.ok) {
      setError("Ödev listesi yüklenemedi.");
      setIsLoading(false);
      return;
    }
    const data = (await response.json()) as { assignments: Assignment[] };
    setAssignments(data.assignments);
    setIsLoading(false);
  }

  useEffect(() => {
    void loadAssignments();
  }, []);

  async function handleComplete(assignmentId: string) {
    const response = await fetch("/api/student/assignments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ assignmentId, status: "completed" }),
    });

    if (!response.ok) {
      setError("Ödev tamamlanamadı.");
      return;
    }

    await loadAssignments();
  }

  const totals = useMemo(() => {
    const total = assignments.length;
    const completed = assignments.filter((item) => !isAssignmentOpen(item)).length;
    const pending = total - completed;
    return { total, completed, pending, completionRate: calculateCompletionRate(total, completed) };
  }, [assignments]);
  const priorityAssignment = buildStudentPriorityAssignment(assignments) as Assignment | null;

  return (
    <div className="stack rise">
      <div className="grid col-main">
        <div className="hero">
          <div className="between" style={{ alignItems: "flex-start", gap: 16 }}>
            <div>
              <h2>Gunaydin</h2>
              <p style={{ marginTop: 6 }}>Bugun {totals.pending} gorevin var. Hedefin net, ritmin guclu.</p>
              <p style={{ marginTop: 10 }}>YKS hazirlik · Koçun Dilek Emen</p>
            </div>
            <Badge tone="muted" icon="ki-award">12. sinif</Badge>
          </div>
          <PriorityGlass assignment={priorityAssignment} isLoading={isLoading} />
        </div>
        <StreakCard />
      </div>

      {error ? (
        <p role="alert" className="badge badge-danger" style={{ width: "fit-content" }}>
          {error}
        </p>
      ) : null}

      <div className="grid g-4">
        <StatCard label="Bu hafta calisma" value="18s" icon="ki-time" tone="info" delta="+3s" />
        <StatCard label="Tamamlanan ödev" value={isLoading ? "-" : totals.completed} icon="ki-check-circle" tone="success" delta="+2" />
        <StatCard label="Bekleyen gorev" value={isLoading ? "-" : totals.pending} icon="ki-notepad-edit" tone="warning" delta="1 gecikmis" deltaDir="down" />
        <StatCard label="Haftalik tamamlama" value={isLoading ? "-" : `${totals.completionRate}%`} icon="ki-chart-pie-simple" tone="primary" delta="+8%" />
      </div>

      <div className="grid col-main">
        <Assignments assignments={assignments} isLoading={isLoading} onComplete={handleComplete} />
        <SubjectProgress />
      </div>

      <div className="grid col-main">
        <ExamPerformance />
        <UpcomingExams />
      </div>

      <AiBand />
    </div>
  );
}
