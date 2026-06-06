"use client";

import { useCallback, useEffect, useState } from "react";

import { KiIcon } from "@/components/design/KiIcon";
import { UkBadge } from "@/components/design/UkBadge";
import { UkSection } from "@/components/design/UkSection";
import type { CoachRatingRecord } from "@uyanik/database";

export function CoachRatingCard() {
  const [rating, setRating] = useState<CoachRatingRecord | null>(null);
  const [coachId, setCoachId] = useState<string | null>(null);
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch("/api/student/coach-rating", { credentials: "same-origin" });
    if (response.ok) {
      const data = (await response.json()) as { rating: CoachRatingRecord | null; coachId?: string | null };
      setRating(data.rating);
      setCoachId(data.coachId ?? data.rating?.coachId ?? null);
      if (data.rating) {
        setStars(data.rating.stars);
        setComment(data.rating.comment ?? "");
      }
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSubmit() {
    if (!coachId) return;
    setIsSaving(true);
    const response = await fetch("/api/student/coach-rating", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stars, comment: comment.trim() || null, coachId }),
    });
    setIsSaving(false);
    if (response.ok) {
      setSaved(true);
      await load();
      setTimeout(() => setSaved(false), 2000);
    }
  }

  return (
    <UkSection title="Kocunu Degerlendir" sub="Yildiz ve geri bildirim">
      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {!coachId ? (
          <p className="muted" style={{ fontSize: 13 }}>Atanmis koc bulunamadi.</p>
        ) : (
          <>
            <div className="row" style={{ gap: 6 }}>
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`icon-btn${stars >= value ? " tone-warning" : ""}`}
                  style={{ width: 36, height: 36 }}
                  onClick={() => setStars(value)}
                  aria-label={`${value} yildiz`}
                >
                  <KiIcon name="ki-star" size={18} />
                </button>
              ))}
            </div>
            <textarea
              className="input"
              rows={2}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Kocun hakkinda kisa bir yorum..."
            />
            <button
              type="button"
              className="btn btn-primary w-fit"
              disabled={isSaving}
              onClick={() => void handleSubmit()}
            >
              {isSaving ? "Kaydediliyor..." : rating ? "Guncelle" : "Gonder"}
            </button>
            {saved ? <UkBadge tone="success">Degerlendirme kaydedildi</UkBadge> : null}
          </>
        )}
      </div>
    </UkSection>
  );
}
