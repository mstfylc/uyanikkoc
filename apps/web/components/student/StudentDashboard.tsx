"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Assignment = {
  id: string;
  title: string;
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const response = await fetch("/api/student/assignments", { credentials: "same-origin" });
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
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-mono">Öğrenci Dashboard</h1>
        <p className="text-sm text-muted-foreground">Ödevlerin ve ilerlemen</p>
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
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
              >
                <div>
                  <div className="font-medium text-sm">{assignment.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(assignment.createdAt).toLocaleDateString("tr-TR")}
                  </div>
                </div>
                <span
                  className={`kt-badge kt-badge-sm ${assignment.completed ? "kt-badge-success" : "kt-badge-warning"}`}
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
