"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import type { MotivationSummary } from "@uyanik/database";

export function MotivationPanel() {
  const [motivation, setMotivation] = useState<MotivationSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch("/api/student/motivation", { credentials: "same-origin" });
    if (response.ok) {
      const data = (await response.json()) as { motivation: MotivationSummary };
      setMotivation(data.motivation);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggleEnabled(enabled: boolean) {
    setIsSaving(true);
    const response = await fetch("/api/student/motivation/settings", {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled }),
    });
    setIsSaving(false);

    if (response.ok) {
      await load();
    }
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Yukleniyor...</p>;
  }

  if (!motivation?.enabled) {
    return (
      <div className="flex flex-col gap-4" data-testid="motivation-disabled">
        <div>
          <h1 className="text-xl font-semibold text-mono">Motivasyon</h1>
          <p className="text-sm text-muted-foreground">Motivasyon ozellikleri kapali.</p>
        </div>
        <button
          type="button"
          disabled={isSaving}
          className="kt-btn kt-btn-primary w-fit"
          onClick={() => void toggleEnabled(true)}
        >
          Motivasyonu ac
        </button>
        <Link href="/student/dashboard" className="kt-btn kt-btn-sm kt-btn-light w-fit">
          Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5" data-testid="motivation-panel">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-mono">Motivasyon</h1>
          <p className="text-sm text-muted-foreground">Seri ve rozetler</p>
        </div>
        <button
          type="button"
          disabled={isSaving}
          className="kt-btn kt-btn-sm kt-btn-light"
          onClick={() => void toggleEnabled(false)}
        >
          Kapat
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="kt-card">
          <div className="kt-card-body p-5">
            <p className="text-sm text-muted-foreground">Seri</p>
            <p className="text-3xl font-semibold">{motivation.streakDays} gun</p>
          </div>
        </div>
        <div className="kt-card">
          <div className="kt-card-body p-5">
            <p className="text-sm text-muted-foreground">Rozetler</p>
            {motivation.badges.length > 0 ? (
              <ul className="flex flex-wrap gap-2 mt-2">
                {motivation.badges.map((badge) => (
                  <li key={badge} className="kt-badge kt-badge-sm kt-badge-primary">
                    {badge}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground mt-2">Henuz rozet yok.</p>
            )}
          </div>
        </div>
      </div>

      <Link href="/student/dashboard" className="kt-btn kt-btn-sm kt-btn-light w-fit">
        Dashboard
      </Link>
    </div>
  );
}
