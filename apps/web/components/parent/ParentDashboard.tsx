"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { KiIcon } from "@/components/design/KiIcon";
import { UkBadge } from "@/components/design/UkBadge";
import { UkSection } from "@/components/design/UkSection";
import { MistakeInsightsCard } from "@/components/shared/MistakeInsightsCard";
import { NetGainMap } from "@/components/shared/NetGainMap";
import {
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

type ParentReport = {
  id: string;
  studentName: string;
  week: string;
  completion: number;
  netDelta: number;
  detail?: {
    summary?: string;
    coachNote?: string;
    hours?: number;
  };
};

type AppointmentRecord = {
  id: string;
  day: string;
  slot: string;
  mode: string;
  status: string;
  topic?: string | null;
};

type StatCardProps = {
  label: string;
  value: number | string;
  icon: string;
  tone?: "primary" | "success" | "warning" | "danger" | "info";
};

const STATUS_TONE: Record<AssignmentStatus, "success" | "warning" | "primary" | "danger"> = {
  pending: "warning",
  in_progress: "primary",
  completed: "success",
  cancelled: "danger",
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

function assignmentTone(status: AssignmentStatus): "success" | "warning" | "primary" | "danger" {
  return STATUS_TONE[status] ?? "warning";
}

export function ParentDashboard() {
  const [summary, setSummary] = useState<ParentSummary | null>(null);
  const [reports, setReports] = useState<ParentReport[]>([]);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [summaryResponse, reportsResponse, appointmentsResponse] = await Promise.all([
        fetch("/api/parent/summary", { credentials: "same-origin" }),
        fetch("/api/parent/reports", { credentials: "same-origin" }),
        fetch("/api/parent/appointments", { credentials: "same-origin" }),
      ]);

      if (summaryResponse.ok) {
        const data = (await summaryResponse.json()) as { summary: ParentSummary };
        setSummary(data.summary);
      }

      if (reportsResponse.ok) {
        const data = (await reportsResponse.json()) as { reports: ParentReport[] };
        setReports(data.reports);
      }

      if (appointmentsResponse.ok) {
        const data = (await appointmentsResponse.json()) as { appointments: AppointmentRecord[] };
        setAppointments(data.appointments);
      }

      setIsLoading(false);
    }

    void load();
  }, []);

  const assignments = summary?.assignments ?? [];
  const total = summary?.totalAssignments ?? 0;
  const completed = summary?.completedCount ?? 0;
  const pending = summary?.pendingCount ?? 0;
  const completionRate = calculateCompletionRate(total, completed);
  const overdueCount = summary ? countOverdueAssignments(assignments) : 0;
  const weeklyComment = buildParentWeeklyComment(completionRate, overdueCount, pending);
  const latestReport = reports[0] ?? null;
  const upcomingAppointment = useMemo(
    () => appointments.find((item) => item.status === "approved" || item.status === "pending") ?? null,
    [appointments],
  );

  return (
    <div className="stack rise" data-testid="parent-summary">
      <div className="hero">
        <div className="between" style={{ alignItems: "flex-start", flexWrap: "wrap", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.78)", fontWeight: 600, marginBottom: 6 }}>
              Merhaba
            </div>
            <h1 style={{ marginBottom: 7, fontSize: 28, fontWeight: 800, letterSpacing: "-.02em" }}>Çocuğunuzun gelişimi</h1>
            <p>
              Koç notları, ödev takibi, deneme sonuçları ve randevu özetleri tek ekranda.
            </p>
          </div>
          <span className="badge" style={{ background: "rgba(255,255,255,.16)", color: "#fff", height: 26 }}>
            <KiIcon name="ki-teacher" size={14} />
            Veli Paneli
          </span>
        </div>
      </div>

      {!isLoading && summary ? <p className="sr-only">Tamamlanan: {completed}</p> : null}

      <div className="grid g-4">
        <StatCard icon="ki-target" tone="success" value={isLoading ? "-" : `${completionRate}%`} label="Bu hafta ödev tamamlama" />
        <StatCard icon="ki-notepad-edit" tone="warning" value={isLoading ? "-" : pending} label="Bekleyen ödev" />
        <StatCard
          icon="ki-chart-line-up"
          tone="primary"
          value={latestReport ? `${latestReport.netDelta > 0 ? "+" : ""}${latestReport.netDelta}` : "-"}
          label="Son rapor net değişimi"
        />
        <StatCard icon="ki-calendar" tone="info" value={upcomingAppointment ? "1" : "0"} label="Yaklaşan randevu" />
      </div>

      <div className="grid col-main">
        <UkSection
          title="Haftalık Ödevler"
          sub="Bu haftanın ödev özeti"
          action={<UkBadge tone={completionRate >= 70 ? "success" : "warning"}>{completed}/{total} tamam</UkBadge>}
        >
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {isLoading ? (
              <div style={{ padding: "16px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Yükleniyor...</div>
            ) : assignments.length === 0 ? (
              <div style={{ padding: "16px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Bu hafta ödev yok.</div>
            ) : (
              assignments.slice(0, 6).map((assignment) => (
                <div className="lrow" key={assignment.id} style={{ cursor: "default" }}>
                  <span className="lr-icon" style={{ background: "var(--primary-soft)", color: "var(--primary-600)", flexShrink: 0 }}>
                    <KiIcon name={assignment.completed ? "ki-check-circle" : "ki-book"} size={18} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="lr-title">{assignment.title}</div>
                    <div className="lr-meta">
                      {assignment.subject ? <span className="chip" style={{ height: 20, fontSize: 10.5 }}>{assignment.subject}</span> : null}
                      <span className="d">{ASSIGNMENT_TYPE_LABELS[assignment.type]}</span>
                      <span className="d">{formatAssignmentDueDate(assignment.dueDate)}</span>
                    </div>
                  </div>
                  <UkBadge tone={assignmentTone(assignment.status)}>{ASSIGNMENT_STATUS_LABELS[assignment.status]}</UkBadge>
                </div>
              ))
            )}
          </div>
        </UkSection>

        <div className="stack">
          <NetGainMap mode="parent" />

          <MistakeInsightsCard mode="parent" />

          <UkSection title="Koçtan Notlar" sub="Onaylı rapor özeti">
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {latestReport ? (
                <div className="lrow" style={{ cursor: "default", alignItems: "flex-start" }}>
                  <span className="lr-icon" style={{ background: "var(--success-soft)", color: "var(--success)", flexShrink: 0 }}>
                    <KiIcon name="ki-message-text" size={17} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, lineHeight: 1.4 }}>
                      {latestReport.detail?.coachNote ?? latestReport.detail?.summary ?? weeklyComment}
                    </div>
                    <div className="lr-meta">
                      <UkBadge tone="success">{latestReport.week}</UkBadge>
                      <span className="d">%{latestReport.completion}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: "10px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
                  Henüz onaylı rapor yok.
                </div>
              )}
              <Link href="/parent/reports" className="btn btn-light btn-sm" style={{ alignSelf: "flex-start" }}>
                <KiIcon name="ki-arrow-right" />
                Raporlara git
              </Link>
            </div>
          </UkSection>

          <UkSection title="Yaklaşan Randevu">
            <div className="card-body">
              {upcomingAppointment ? (
                <div className="lrow" style={{ cursor: "default" }}>
                  <span className="lr-icon" style={{ background: "var(--primary-soft)", color: "var(--primary-600)" }}>
                    <KiIcon name="ki-calendar" size={18} />
                  </span>
                  <div style={{ flex: 1 }}>
                    <div className="lr-title">{upcomingAppointment.topic ?? "Koç görüşmesi"}</div>
                    <div className="lr-meta">
                      {upcomingAppointment.day} {upcomingAppointment.slot} · {upcomingAppointment.mode}
                    </div>
                  </div>
                  <UkBadge tone={upcomingAppointment.status === "approved" ? "success" : "warning"}>
                    {upcomingAppointment.status === "approved" ? "Onaylı" : "Bekliyor"}
                  </UkBadge>
                </div>
              ) : (
                <div style={{ padding: "10px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Onaylı randevu yok.</div>
              )}
            </div>
          </UkSection>
        </div>
      </div>

      <div className="card" data-testid="parent-weekly-comment">
        <div className="card-head">
          <div>
            <h3>Haftalık Yorum</h3>
            <p className="sub">Bu haftanın kısa gelişim yorumu</p>
          </div>
          <Link href="/parent/messages" className="btn btn-primary btn-sm">
            <KiIcon name="ki-message-text" />
            Mesaj
          </Link>
        </div>
        <div className="card-body">
          <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.55 }}>{isLoading ? "Yükleniyor..." : weeklyComment}</p>
        </div>
      </div>
    </div>
  );
}
