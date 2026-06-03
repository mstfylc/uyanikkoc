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

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-mono">Koç Dashboard</h1>
        <p className="text-sm text-muted-foreground">Ödev ve öğrenci takibi</p>
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
        <StatCard label="Öğrenci" value={1} icon="ki-people" tone="primary" />
      </div>

      <div className="kt-card">
        <div className="kt-card-header flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="kt-card-title text-base font-medium">Son Ödevler</h3>
          <div className="flex gap-2">
            <Link href="/coach/assignments/create" className="kt-btn kt-btn-sm kt-btn-primary">
              Ödev Ata
            </Link>
            <Link href="/coach/dashboard" className="kt-btn kt-btn-sm kt-btn-light">
              Öğrenci Listesi
            </Link>
          </div>
        </div>
        <div className="kt-card-body p-0">
          <table className="kt-table kt-table-border w-full">
            <thead>
              <tr>
                <th className="text-start ps-5">Başlık</th>
                <th className="text-start">Durum</th>
                <th className="text-start pe-5">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="ps-5 py-4 text-muted-foreground">
                    Yükleniyor...
                  </td>
                </tr>
              ) : assignments.length === 0 ? (
                <tr>
                  <td colSpan={3} className="ps-5 py-4 text-muted-foreground">
                    Henüz ödev yok. İlk ödevi oluşturun.
                  </td>
                </tr>
              ) : (
                assignments.slice(0, 5).map((assignment) => (
                  <tr key={assignment.id}>
                    <td className="ps-5">{assignment.title}</td>
                    <td>
                      <span
                        className={`kt-badge kt-badge-sm ${assignment.completed ? "kt-badge-success" : "kt-badge-warning"}`}
                      >
                        {assignment.completed ? "Tamamlandı" : "Bekliyor"}
                      </span>
                    </td>
                    <td className="pe-5 text-muted-foreground text-sm">
                      {new Date(assignment.createdAt).toLocaleDateString("tr-TR")}
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
