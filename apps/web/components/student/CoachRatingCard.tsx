"use client";

import { useCallback, useEffect, useState } from "react";

import { StarRating } from "@/components/design/StarRating";
import { KiIcon } from "@/components/design/KiIcon";
import { UkBadge } from "@/components/design/UkBadge";
import { UkSection } from "@/components/design/UkSection";
import type { CoachRatingRecord } from "@uyanik/database";

export function CoachRatingCard() {
  const [rating, setRating] = useState<CoachRatingRecord | null>(null);
  const [coachId, setCoachId] = useState<string | null>(null);
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [editing, setEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch("/api/student/coach-rating", { credentials: "same-origin" });
    if (response.ok) {
      const data = (await response.json()) as { rating: CoachRatingRecord | null; coachId?: string | null };
      setRating(data.rating);
      setCoachId(data.coachId ?? data.rating?.coachId ?? null);
      setStars(data.rating?.stars ?? 0);
      setComment(data.rating?.comment ?? "");
      setEditing(!data.rating);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSave() {
    if (!coachId || !stars) return;
    setIsSaving(true);
    const response = await fetch("/api/student/coach-rating", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stars, comment: comment.trim() || null, coachId }),
    });
    setIsSaving(false);
    if (response.ok) {
      setEditing(false);
      await load();
    }
  }

  return (
    <UkSection
      title="Koçunu Değerlendir"
      sub="Görüşlerin koçunun gelişimine yardımcı olur"
      action={
        rating && !editing ? <UkBadge tone="success">Gonderildi</UkBadge> : null
      }
    >
      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        {!coachId ? (
          <p className="muted" style={{ fontSize: 13 }}>
            Atanmış koç bulunamadı.
          </p>
        ) : rating && !editing ? (
          <>
            <div className="row" style={{ gap: 12 }}>
              <StarRating value={rating.stars} size={20} />
              <span className="tnum" style={{ fontWeight: 800, fontSize: 15 }}>
                {rating.stars}.0
              </span>
            </div>
            {rating.comment ? (
              <div
                style={{
                  fontSize: 13.5,
                  color: "var(--text-2)",
                  lineHeight: 1.5,
                  background: "var(--surface-3)",
                  padding: "11px 14px",
                  borderRadius: 11,
                }}
              >
                {rating.comment}
              </div>
            ) : null}
            <button
              type="button"
              className="btn btn-light btn-sm"
              style={{ alignSelf: "flex-start" }}
              onClick={() => setEditing(true)}
            >
              <KiIcon name="ki-setting-2" size={14} />
              Degerlendirmeni duzenle
            </button>
          </>
        ) : (
          <>
            <div>
              <div className="muted" style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
                PUANIN
              </div>
              <StarRating value={stars} size={22} onPick={setStars} />
            </div>
            <div className="field">
              <label className="label">
                Geri bildirimin <span className="muted" style={{ fontWeight: 500 }}>(opsiyonel)</span>
              </label>
              <textarea
                className="textarea"
                rows={3}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Koçunla ilgili görüş ve önerilerini yaz..."
              />
            </div>
            <div className="row" style={{ gap: 8 }}>
              <button
                type="button"
                className="btn btn-primary"
                disabled={!stars || isSaving}
                onClick={() => void handleSave()}
                style={{ opacity: stars ? 1 : 0.5 }}
              >
                <KiIcon name="ki-send" size={16} />
                {isSaving ? "Kaydediliyor..." : "Gonder"}
              </button>
              {rating ? (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setEditing(false);
                    setStars(rating.stars);
                    setComment(rating.comment ?? "");
                  }}
                >
                  Vazgec
                </button>
              ) : null}
            </div>
          </>
        )}
      </div>
    </UkSection>
  );
}
