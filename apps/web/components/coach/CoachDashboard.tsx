"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { KiIcon } from "@/components/design/KiIcon";
import { UkPageHead } from "@/components/design/UkPageHead";
import {
  buildCoachSuggestion,
  buildRulesBasedRiskBand,
  calculateCompletionRate,
  countOverdueAssignments,
  RISK_BAND_LABELS,
} from "@uyanik/shared";
import type { AssignmentPriority, AssignmentStatus, AssignmentType } from "@uyanik/database";

type Assignment = {
  id: string;
  title: string;
  type: AssignmentType;
  priority: AssignmentPriority;
  status: AssignmentStatus;
  dueDate: string | null;
  completed: boolean;
  createdAt: string;
};

type StatCardProps = {
  label: string;
  value: number | string;
  icon: string;
  tone?: "primary" | "success" | "warning" | "danger" | "info";
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

const RISK_BADGE_TONE: Record<string, string> = {
  excellent: "success",
  normal: "primary",
  attention: "warning",
  critical: "danger",
};

export function CoachDashboard() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const response = await fetch("/api/coach/assignments", { credentials: "same-origin" });
      if (response.ok) {
        const data = (await response.json()) as { assignments: Assignment[] };
        setAssignments(data.assignments);
      }
      setIsLoading(false);
    }

    void load();
  }, []);

  const total = assignments.length;
  const completed = assignments.filter((item) => item.completed).length;
  const pending = total - completed;
  const completionRate = calculateCompletionRate(total, completed);
  const overdueCount = countOverdueAssignments(assignments);
  const riskBand = buildRulesBasedRiskBand(completionRate, overdueCount);
  const suggestion = buildCoachSuggestion(completionRate, overdueCount, pending);

  return (
    <div className="stack rise">
      <UkPageHead title="Koç Dashboard" sub="Ödev, öğrenci ve risk takibi" />

      <div className="card" data-testid="coach-risk-card">
        <div className="card-head">
          <div>
            <h3>Risk Özeti</h3>
            <p className="sub">Tamamlama, gecikme ve bekleyen ödevlerden hesaplanır</p>
          </div>
          <span className={`badge badge-${RISK_BADGE_TONE[riskBand] ?? "muted"}`} style={{ height: 26 }}>
              {RISK_BAND_LABELS[riskBand]}
            </span>
        </div>
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p className="muted" style={{ fontSize: 13 }}>
            {isLoading
              ? "Yukleniyor..."
              : `Tamamlama %${completionRate} · Gecikmis: ${overdueCount} · Bekleyen: ${pending}`}
          </p>
          <p style={{ fontSize: 13.5 }}>{isLoading ? "" : suggestion}</p>
        </div>
      </div>

      <div className="grid g-4">
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
        <StatCard label="Öğrenci" value={1} icon="ki-people" tone="primary" />
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <h3>Son Ödevler</h3>
            <p className="sub">Son oluşturulan ödevlerin kısa takibi</p>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <Link href="/coach/assignments/create" className="btn btn-primary btn-sm">
              Ödev Ata
            </Link>
            <Link href="/coach/students" className="btn btn-light btn-sm">
              Öğrenci Listesi
            </Link>
          </div>
        </div>
        <div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Başlık</th>
                <th>Durum</th>
                <th>Tarih</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={3}>
                    <span className="muted">
                    Yükleniyor...
                    </span>
                  </td>
                </tr>
              ) : assignments.length === 0 ? (
                <tr>
                  <td colSpan={3}>
                    <span className="muted">
                    Henüz ödev yok. İlk ödevi oluşturun.
                    </span>
                  </td>
                </tr>
              ) : (
                assignments.slice(0, 5).map((assignment) => (
                  <tr key={assignment.id}>
                    <td><b style={{ fontSize: 13 }}>{assignment.title}</b></td>
                    <td>
                      <span
                        className={`badge badge-${assignment.completed ? "success" : "warning"}`}
                        style={{ height: 22 }}
                      >
                        {assignment.completed ? "Tamamlandı" : "Bekliyor"}
                      </span>
                    </td>
                    <td>
                      <span className="muted tnum" style={{ fontSize: 12.5 }}>
                      {new Date(assignment.createdAt).toLocaleDateString("tr-TR")}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
