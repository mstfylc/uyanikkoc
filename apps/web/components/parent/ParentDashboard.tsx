"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ParentSummary = {
  totalAssignments: number;
  completedCount: number;
  pendingCount: number;
  assignments: Array<{
    id: string;
    title: string;
    completed: boolean;
  }>;
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
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-5" data-testid="parent-summary">
      <div>
        <h1 className="text-xl font-semibold text-mono">Veli Dashboard</h1>
        <p className="text-sm text-muted-foreground">Öğrencinizin ilerleme özeti</p>
      </div>

      {!isLoading && summary ? (
        <p className="sr-only">
          Tamamlanan: {completed}
        </p>
      ) : null}

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
        <div className="kt-card-body p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium">Genel İlerleme</h3>
            <span className="text-sm font-semibold text-primary">{completionRate}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Link href="/parent/dashboard" className="kt-btn kt-btn-sm kt-btn-primary">
              Rapor
            </Link>
            <Link href="/parent/dashboard" className="kt-btn kt-btn-sm kt-btn-light">
              Mesaj
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
