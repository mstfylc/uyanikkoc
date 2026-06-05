"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { UkBadge } from "@/components/design/UkBadge";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import { UkStatCard } from "@/components/design/UkStatCard";
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
    return <p className="muted" style={{ fontSize: 13 }}>Yukleniyor...</p>;
  }

  if (!motivation?.enabled) {
    return (
      <div className="stack rise" data-testid="motivation-disabled">
        <UkPageHead
          title="Motivasyon"
          sub="Motivasyon ozellikleri kapali."
          actions={
            <button
              type="button"
              disabled={isSaving}
              className="btn btn-primary btn-sm"
              onClick={() => void toggleEnabled(true)}
            >
              Motivasyonu ac
            </button>
          }
        />
        <div className="card">
          <div className="card-pad muted" style={{ fontSize: 13 }}>
            Seri ve rozetler kapali durumda.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stack rise" data-testid="motivation-panel">
      <UkPageHead
        title="Motivasyon"
        sub="Seri ve rozetler"
        actions={
          <button
            type="button"
            disabled={isSaving}
            className="btn btn-light btn-sm"
            onClick={() => void toggleEnabled(false)}
          >
            Kapat
          </button>
        }
      />

      <div className="grid g-4">
        <UkStatCard icon="ki-flame" tone="warning" value={motivation.streakDays} label="Gun seri" />
        <UkStatCard icon="ki-star" tone="primary" value={motivation.badges.length} label="Rozet sayisi" />
      </div>

      <UkSection title="Rozetler">
        <div className="card-body">
          {motivation.badges.length > 0 ? (
            <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
              {motivation.badges.map((badge) => (
                <UkBadge key={badge} tone="primary">
                  {badge}
                </UkBadge>
              ))}
            </div>
          ) : (
            <p className="muted" style={{ fontSize: 13 }}>
              Henuz rozet yok. Konu tamamla ve deneme gir!
            </p>
          )}
        </div>
      </UkSection>

      <Link href="/student/dashboard" className="btn btn-light btn-sm w-fit">
        Dashboard
      </Link>
    </div>
  );
}
