"use client";

import { useCallback, useEffect, useState } from "react";

import { StarRating } from "@/components/design/StarRating";
import { UkAvatar } from "@/components/design/UkAvatar";
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
    <UkSection
      title="Öğrenci Geri Bildirimleri"
      sub={`${summary.count} ogrenci degerlendirmesi`}
      action={
        <div className="row" style={{ gap: 8 }}>
          <StarRating value={summary.average} size={15} />
          <span className="tnum" style={{ fontWeight: 800, fontSize: 14 }}>
            {summary.average.toFixed(1)}
          </span>
        </div>
      }
    >
      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {summary.count === 0 ? (
          <div style={{ padding: "20px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
            Henuz degerlendirme yok.
          </div>
        ) : (
          summary.ratings.map((row) => (
            <div key={row.id} className="lrow" style={{ alignItems: "flex-start" }}>
              <UkAvatar name={row.studentName ?? "Öğrenci"} size={36} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="between">
                  <b style={{ fontSize: 13, fontWeight: 700 }}>{row.studentName ?? "Öğrenci"}</b>
                  <StarRating value={row.stars} size={13} />
                </div>
                {row.comment ? (
                  <div style={{ fontSize: 12.5, color: "var(--text-2)", marginTop: 4, lineHeight: 1.45 }}>
                    {row.comment}
                  </div>
                ) : null}
                <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>
                  {new Date(row.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </UkSection>
  );
}
