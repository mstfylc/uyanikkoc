"use client";

import { KiIcon } from "@/components/design/KiIcon";

type StarRatingProps = {
  value: number;
  size?: number;
  onPick?: (stars: number) => void;
};

export function StarRating({ value, size = 18, onPick }: StarRatingProps) {
  return (
    <div className="row" style={{ gap: 3 }}>
      {[1, 2, 3, 4, 5].map((star) =>
        onPick ? (
          <button
            key={star}
            type="button"
            onClick={() => onPick(star)}
            style={{
              border: "none",
              background: "none",
              padding: 0,
              cursor: "pointer",
              lineHeight: 0,
              color: star <= value ? "var(--warning)" : "var(--faint)",
            }}
            aria-label={`${star} yildiz`}
          >
            <KiIcon name="ki-star" size={size + 8} />
          </button>
        ) : (
          <KiIcon
            key={star}
            name="ki-star"
            size={size}
            style={{ color: star <= Math.round(value) ? "var(--warning)" : "var(--faint)" }}
          />
        ),
      )}
    </div>
  );
}
