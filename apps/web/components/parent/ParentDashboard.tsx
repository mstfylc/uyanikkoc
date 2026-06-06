"use client";

import { KiIcon } from "@/components/design/KiIcon";
import Link from "next/link";
import { useEffect, useState } from "react";

import { UkBadge } from "@/components/design/UkBadge";
import { UkSection } from "@/components/design/UkSection";
import { UkStatCard } from "@/components/design/UkStatCard";
import { subjectColor } from "@/lib/design/subject-colors";
import {
  calculateCompletionRate,
  formatExamNet,
} from "@uyanik/shared";
import type {
  AppointmentRecord,
  AssignmentPriority,
  AssignmentStatus,
  AssignmentType,
  CoachStudentNoteRecord,
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
  pinnedNotes?: CoachStudentNoteRecord[];
  nextAppointment?: AppointmentRecord | null;
  childDisplayName?: string;
  studyStreakDays?: number;
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
              Merhaba 👋
            </div>
            <h2 style={{ marginBottom: 7 }}>
              Cocugunuz {summary?.childDisplayName?.split(" ")[0] ?? "ogrenci"}&apos;in gelisimi
            </h2>
            <p>Koc takibi · 11. Sinif Sayisal · Hedef YKS 2026</p>
          </div>
          <span className="badge" style={{ background: "rgba(255,255,255,.16)", color: "#fff", height: 26 }}>
            <KiIcon name="ki-book" size={14} style={{ marginRight: 6 }} />
            Veli Paneli
          </span>
        </div>
      </div>

      <Link
        href="/parent/billing"
        className="card card-pad"
        style={{ display: "flex", alignItems: "center", gap: 14, textDecoration: "none", color: "inherit" }}
      >
        <span className="stat-icon tone-primary" style={{ width: 44, height: 44 }}>
          <KiIcon name="ki-chart-line-up" />
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Odeme & Planlar</div>
          <div className="muted" style={{ fontSize: 12.5 }}>Kocluk paketini sec, faturalari goruntule</div>
        </div>
        <KiIcon name="ki-right" size={16} style={{ color: "var(--faint)" }} />
      </Link>

      <div className="grid g-4">
        <UkStatCard icon="ki-chart-pie-simple" tone="success" value={`${completionRate}%`} label="Bu hafta odev tamamlama" />
        <UkStatCard icon="ki-notepad-edit" tone="warning" value={pending} label="Bekleyen odev" />
        <UkStatCard
          icon="ki-chart-simple"
          tone="primary"
          value={summary?.latestExamNet != null ? formatExamNet(summary.latestExamNet) : "—"}
          label="Son deneme neti"
        />
        <UkStatCard
          icon="ki-flame"
          tone="danger"
          value={summary?.studyStreakDays ?? 12}
          label="Calisma serisi (gun)"
        />
      </div>

      <div className="grid col-main">
        <UkSection
          title="Haftalik odevler"
          sub={`${summary?.childDisplayName ?? "Ogrenci"} · bu hafta`}
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
                Bu hafta odev yok.
              </div>
            ) : (
              summary.assignments.map((assignment) => {
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
          <UkSection title="Koçtan notlar" sub="Onemli uyarilar">
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {isLoading ? (
                <p className="muted" style={{ fontSize: 13 }}>
                  Yukleniyor...
                </p>
              ) : !summary?.pinnedNotes?.length ? (
                <p className="muted" style={{ fontSize: 13 }}>
                  Henuz not yok.
                </p>
              ) : (
                summary.pinnedNotes.map((note) => (
                  <div key={note.id} className="lrow done">
                    <span className="lr-icon" style={{ background: "var(--warning-soft)", color: "var(--warning)" }}>
                      <KiIcon name="ki-message-text" size={18} />
                    </span>
                    <div style={{ flex: 1 }}>
                      <div className="lr-title">{note.text}</div>
                      <div className="lr-meta">
                        <span className="d">{new Date(note.createdAt).toLocaleDateString("tr-TR")}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </UkSection>

          <UkSection title="Yaklasan randevu">
            <div className="card-body">
              {isLoading ? (
                <p className="muted" style={{ fontSize: 13 }}>
                  Yukleniyor...
                </p>
              ) : !summary?.nextAppointment ? (
                <p className="muted" style={{ fontSize: 13 }}>
                  Onayli randevu yok.
                </p>
              ) : (
                <div className="lrow">
                  <span className="lr-icon" style={{ background: "var(--primary-soft)", color: "var(--primary-600)" }}>
                    <KiIcon name="ki-calendar-tick" size={18} />
                  </span>
                  <div style={{ flex: 1 }}>
                    <div className="lr-title">Koc gorusmesi</div>
                    <div className="lr-meta">
                      <span className="d">
                        {summary.nextAppointment.day} {summary.nextAppointment.slot} ·{" "}
                        {summary.nextAppointment.mode === "online" ? "Online" : "Yuz yuze"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </UkSection>
        </div>
      </div>
    </div>
  );
}
