"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { KiIcon } from "@/components/design/KiIcon";
import { UkAvatar } from "@/components/design/UkAvatar";
import { UkBarChart } from "@/components/design/UkBarChart";
import { UkSparkline } from "@/components/design/UkSparkline";
import {
  buildRulesBasedRiskBand,
  calculateCompletionRate,
  countOverdueAssignments,
  RISK_BAND_LABELS,
} from "@uyanik/shared";
import type { AssignmentPriority, AssignmentStatus, AssignmentType, CoachRosterEntry } from "@uyanik/database";

type Assignment = {
  id: string;
  title: string;
  type: AssignmentType;
  priority: AssignmentPriority;
  status: AssignmentStatus;
  subject?: string | null;
  dueDate: string | null;
  completed: boolean;
  createdAt: string;
  studentId?: string | null;
};

type Tone = "primary" | "success" | "warning" | "danger" | "info" | "muted";

const riskTone: Record<string, Tone> = {
  excellent: "success",
  normal: "primary",
  attention: "warning",
  critical: "danger",
};

const weekCompletion = [
  { label: "Pzt", value: 64 },
  { label: "Sal", value: 72 },
  { label: "Çar", value: 69 },
  { label: "Per", value: 78 },
  { label: "Cum", value: 82 },
  { label: "Cmt", value: 74 },
  { label: "Paz", value: 86 },
];

function Badge({
  tone = "muted",
  dot = false,
  icon,
  children,
}: {
  tone?: Tone;
  dot?: boolean;
  icon?: string;
  children: React.ReactNode;
}) {
  return (
    <span className={`badge badge-${tone}`}>
      {dot ? <span className="dot-live" /> : null}
      {icon ? <KiIcon name={icon} size={13} /> : null}
      {children}
    </span>
  );
}

function Delta({ value, dir = "up" }: { value: string; dir?: "up" | "down" | "flat" }) {
  return (
    <span className={`delta ${dir}`}>
      <KiIcon name={dir === "down" ? "ki-arrow-down" : dir === "flat" ? "ki-minus" : "ki-arrow-up"} size={13} />
      {value}
    </span>
  );
}

function StatCard({
  label,
  value,
  icon,
  tone = "primary",
  delta,
  deltaDir = "up",
}: {
  label: string;
  value: number | string;
  icon: string;
  tone?: Exclude<Tone, "muted">;
  delta?: string;
  deltaDir?: "up" | "down" | "flat";
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

function Section({
  title,
  sub,
  action,
  children,
}: {
  title: string;
  sub?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="card">
      <div className="card-head">
        <div>
          <h3>{title}</h3>
          {sub ? <p className="sub">{sub}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function studentTrend(seed: number) {
  return [58 + seed, 63 + seed, 61 + seed, 68 + seed, 72 + seed, 76 + seed];
}

function StudentsTable({
  students,
  assignments,
}: {
  students: CoachRosterEntry[];
  assignments: Assignment[];
}) {
  const [filter, setFilter] = useState<"all" | "risk">("all");

  const rows = students.map((student, index) => {
    const ownAssignments = assignments.filter((assignment) => !assignment.studentId || assignment.studentId === student.studentId);
    const completed = ownAssignments.filter((assignment) => assignment.completed).length;
    const rate = calculateCompletionRate(ownAssignments.length, completed);
    const overdue = countOverdueAssignments(ownAssignments);
    const risk = buildRulesBasedRiskBand(rate || 72 - index * 8, overdue);
    const trend = studentTrend(index * 4);
    return {
      student,
      completion: rate || 72 - index * 8,
      risk,
      trend,
      net: trend[trend.length - 1] ?? 0,
      last: index === 0 ? "bugün" : "2 gün önce",
    };
  });

  const shown = rows.filter((row) => (filter === "risk" ? row.risk === "attention" || row.risk === "critical" : true));

  return (
    <Section
      title="Öğrencilerim"
      sub={`${students.length} aktif öğrenci`}
      action={
        <div className="filters">
          <button type="button" className={filter === "all" ? "on" : ""} onClick={() => setFilter("all")}>Tümü</button>
          <button type="button" className={filter === "risk" ? "on" : ""} onClick={() => setFilter("risk")}>Risk altında</button>
        </div>
      }
    >
      <div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Öğrenci</th>
              <th>Tamamlama</th>
              <th>Net Trendi</th>
              <th>Durum</th>
              <th style={{ textAlign: "right" }}>Son Aktivite</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((row) => {
              const color = row.completion >= 75 ? "var(--success)" : row.completion >= 50 ? "var(--warning)" : "var(--danger)";
              return (
                <tr key={row.student.studentId}>
                  <td>
                    <div className="name">
                      <UkAvatar name={row.student.displayName} size={36} />
                      <div>
                        <b>{row.student.displayName}</b>
                        <br />
                        <span>{row.student.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ width: 132 }}>
                      <div className="between" style={{ marginBottom: 6 }}>
                        <span className="tnum" style={{ fontSize: 12.5, fontWeight: 700 }}>{row.completion}%</span>
                      </div>
                      <div className="bar thin"><span style={{ width: `${row.completion}%`, background: color }} /></div>
                    </div>
                  </td>
                  <td>
                    <div className="row" style={{ gap: 10 }}>
                      <div style={{ width: 72, height: 30 }}>
                        <UkSparkline data={row.trend} width={72} height={30} color="var(--success)" fill={false} />
                      </div>
                      <span className="tnum" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-2)" }}>{row.net}</span>
                    </div>
                  </td>
                  <td><Badge tone={riskTone[row.risk] ?? "muted"} dot>{RISK_BAND_LABELS[row.risk]}</Badge></td>
                  <td style={{ textAlign: "right" }}>
                    <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>{row.last}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

function CoachTasks({ assignments }: { assignments: Assignment[] }) {
  const overdue = assignments.filter((assignment) => !assignment.completed && assignment.dueDate && new Date(assignment.dueDate) < new Date());
  const pending = assignments.filter((assignment) => !assignment.completed);
  const tasks = [
    { title: `${overdue.length} gecikmiş ödev`, tag: "Acil", tone: "danger" as Tone, icon: "ki-information-2" },
    { title: `${pending.length} bekleyen inceleme`, tag: "Bugün", tone: "warning" as Tone, icon: "ki-notepad-edit" },
    { title: "Veli raporları kontrol", tag: "Rapor", tone: "info" as Tone, icon: "ki-chart-line-up" },
  ];

  return (
    <Section title="Aksiyon Gerektirenler" sub="Önceliklendirilmiş" action={<Badge tone="danger">{tasks.length}</Badge>}>
      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {tasks.map((task) => (
          <Link key={task.title} href="/coach/students" className="lrow" style={{ textDecoration: "none" }}>
            <span className={`lr-icon tone-${task.tone}`}>
              <KiIcon name={task.icon} size={18} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="lr-title" style={{ fontSize: 13, whiteSpace: "normal" }}>{task.title}</div>
              <div style={{ marginTop: 5 }}><Badge tone={task.tone}>{task.tag}</Badge></div>
            </div>
            <KiIcon name="ki-arrow-right" size={17} />
          </Link>
        ))}
        <Link className="btn btn-primary" style={{ width: "100%", marginTop: 2 }} href="/coach/assignments/create">
          <KiIcon name="ki-plus" size={16} />
          Yeni ödev ata
        </Link>
      </div>
    </Section>
  );
}

function WeeklyCompletion() {
  const avg = Math.round(weekCompletion.reduce((sum, day) => sum + day.value, 0) / weekCompletion.length);
  const peak = weekCompletion.reduce((max, day, index, all) => (day.value > all[max].value ? index : max), 0);

  return (
    <Section
      title="Haftalık Sınıf Tamamlaması"
      sub="Tüm öğrencilerin günlük ortalaması"
      action={<div className="row" style={{ gap: 8 }}><span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>Ortalama</span><Badge tone="primary">{avg}%</Badge></div>}
    >
      <div className="card-body">
        <UkBarChart data={weekCompletion} max={100} peakIdx={peak} gradient />
        <hr className="hr" style={{ margin: "18px 0 16px" }} />
        <div className="grid g-4" style={{ gap: 12 }}>
          {[
            ["success", "Mükemmel", 1],
            ["primary", "Normal", 1],
            ["warning", "Dikkat", 1],
            ["danger", "Kritik", 0],
          ].map(([tone, label, count]) => (
            <div key={label} style={{ background: "var(--surface-3)", borderRadius: 12, padding: "12px 14px" }}>
              <div className="row" style={{ gap: 7 }}>
                <span style={{ width: 9, height: 9, borderRadius: 3, background: `var(--${tone})` }} />
                <span style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600 }}>{label}</span>
              </div>
              <div className="tnum" style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{count}</div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

function ActivityFeed({ assignments }: { assignments: Assignment[] }) {
  const latest = assignments.slice(0, 4);

  return (
    <Section title="Son Aktivite" action={<Link className="link-btn" href="/coach/students">Tümü<KiIcon name="ki-arrow-right" size={14} /></Link>}>
      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {latest.length === 0 ? (
          <div style={{ padding: "20px 12px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Aktivite yok.</div>
        ) : latest.map((assignment, index) => (
          <div key={assignment.id} className="row" style={{ gap: 13, padding: "11px 4px", borderBottom: index < latest.length - 1 ? "1px solid var(--border)" : "none", alignItems: "flex-start" }}>
            <span className={`lr-icon tone-${assignment.completed ? "success" : "warning"}`} style={{ width: 36, height: 36, flexShrink: 0 }}>
              <KiIcon name={assignment.completed ? "ki-check-circle" : "ki-time"} size={17} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, lineHeight: 1.4 }}>
                <b style={{ fontWeight: 700 }}>{assignment.title}</b>{" "}
                <span style={{ color: "var(--text-2)" }}>{assignment.completed ? "tamamlandı" : "bekliyor"}</span>
              </div>
              <div style={{ fontSize: 11.5, color: "var(--faint)", marginTop: 2 }}>{new Date(assignment.createdAt).toLocaleDateString("tr-TR")}</div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function CoachDashboard() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [students, setStudents] = useState<CoachRosterEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [assignmentResponse, studentResponse] = await Promise.all([
        fetch("/api/coach/assignments", { credentials: "same-origin" }),
        fetch("/api/coach/students", { credentials: "same-origin" }),
      ]);
      if (assignmentResponse.ok) {
        const data = (await assignmentResponse.json()) as { assignments: Assignment[] };
        setAssignments(data.assignments);
      }
      if (studentResponse.ok) {
        const data = (await studentResponse.json()) as { students: CoachRosterEntry[] };
        setStudents(data.students);
      }
      setIsLoading(false);
    }

    void load();
  }, []);

  const stats = useMemo(() => {
    const completed = assignments.filter((assignment) => assignment.completed).length;
    const pending = assignments.length - completed;
    const completion = calculateCompletionRate(assignments.length, completed);
    const atRisk = students.length ? students.filter((_, index) => index % 3 === 2).length : 0;
    return { completed, pending, completion, atRisk };
  }, [assignments, students]);

  return (
    <div className="stack rise">
      <div className="between" style={{ alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.02em" }}>Bugünkü Koçluk Özeti</h1>
          <p className="muted" style={{ fontSize: 13.5, marginTop: 4 }}>
            Öğrenci tamamlama, risk ve aksiyon takibi
          </p>
        </div>
        {isLoading ? <Badge tone="muted">Yükleniyor...</Badge> : <Badge tone="success">Canlı</Badge>}
      </div>

      <div className="grid g-4">
        <StatCard icon="ki-people" tone="primary" value={isLoading ? "-" : students.length} label="Toplam öğrenci" delta="+2 bu ay" />
        <StatCard icon="ki-target" tone="success" value={isLoading ? "-" : `${stats.completion}%`} label="Ortalama tamamlama" delta="+5%" />
        <StatCard icon="ki-information-2" tone="danger" value={isLoading ? "-" : stats.atRisk} label="Risk altındaki öğrenci" delta="+1" deltaDir="down" />
        <StatCard icon="ki-notepad-edit" tone="warning" value={isLoading ? "-" : stats.pending} label="Bekleyen inceleme" delta="3 bugün" deltaDir="flat" />
      </div>

      <div className="grid col-main">
        <StudentsTable students={students} assignments={assignments} />
        <CoachTasks assignments={assignments} />
      </div>

      <div className="grid col-main">
        <WeeklyCompletion />
        <ActivityFeed assignments={assignments} />
      </div>
    </div>
  );
}
