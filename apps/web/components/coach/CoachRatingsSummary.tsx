"use client";

import { useCallback, useEffect, useState } from "react";

import { KiIcon } from "@/components/design/KiIcon";
import { UkBadge } from "@/components/design/UkBadge";
import { UkSection } from "@/components/design/UkSection";
import type { CoachRatingSummary } from "@uyanik/database";

export function CoachRatingsSummary() {
  const [summary, setSummary] = useState<CoachRatingSummary | null>(null);

  const load = useCallback(async () => {
    const response = await fetch("/api/coach/ratings", { credentials: "same-origin" });
    if (response.ok) {
      setSummary((await response.json()) as CoachRatingSummary);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (!summary) return null;

  return (
    <UkSection title="Ogrenci Degerlendirmeleri" sub={`${summary.count} yorum · ortalama ${summary.average.toFixed(1)}`}>
      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {summary.count === 0 ? (
          <p className="muted" style={{ fontSize: 13 }}>Henuz degerlendirme yok.</p>
        ) : (
          summary.ratings.slice(0, 5).map((row) => (
            <div key={row.id} className="lrow">
              <span className="lr-icon tone-warning">
                <KiIcon name="ki-star" />
              </span>
              <div style={{ flex: 1 }}>
                <div className="lr-title">{row.stars}/5 yildiz</div>
                <div className="lr-meta">
                  <span className="d">{row.comment ?? "Yorum yok"}</span>
                </div>
              </div>
              <UkBadge tone="primary">{new Date(row.createdAt).toLocaleDateString("tr-TR")}</UkBadge>
            </div>
          ))
        )}
      </div>
    </UkSection>
  );
}
