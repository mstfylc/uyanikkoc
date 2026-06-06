/* MOTİVASYON + KOÇ DEĞERLENDİRME. */
import { useState } from "react";
import { SubHeader } from "../ui/SubHeader";
import { MIcon } from "../ui/MIcon";
import { MOTIVATION } from "../mocks/student";

export function MotivasyonScreen({ onBack }: { onBack: () => void }) {
  const [stars, setStars] = useState(5);
  const [sent, setSent] = useState(false);

  return (
    <div className="uk-scroll">
      <div className="uk-safe-top" />
      <SubHeader title="Motivasyon" sub="Koçundan günün notu" onBack={onBack} />

      <div className="uk-sec">
        <div className="uk-hero" style={{ borderRadius: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <span style={{ width: 38, height: 38, borderRadius: 11, display: "grid", placeItems: "center", background: "rgba(255,255,255,.18)" }}>
              <MIcon name="heart" size={19} fill />
            </span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800 }}>{MOTIVATION.coach}</div>
              <div style={{ fontSize: 11.5, color: "rgba(255,255,255,.8)", fontWeight: 600 }}>{MOTIVATION.date}</div>
            </div>
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.5 }}>{MOTIVATION.body}</div>
        </div>
      </div>

      <div className="uk-sec" style={{ marginTop: 22 }}>
        <div className="uk-sec-head">
          <h2>Koçunu değerlendir</h2>
        </div>
        <div className="uk-card uk-card-pad" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 13.5, color: "var(--text-2)", fontWeight: 600, marginBottom: 14 }}>
            Koçluk desteğinden ne kadar memnunsun?
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 16 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => { setStars(n); setSent(false); }}
                style={{ color: n <= stars ? "var(--warning)" : "var(--border-strong)" }}
              >
                <MIcon name="star" size={34} fill={n <= stars} />
              </button>
            ))}
          </div>
          <button
            className="uk-btn uk-btn-primary uk-btn-block"
            style={{ background: sent ? "var(--success)" : undefined }}
            onClick={() => setSent(true)}
          >
            <MIcon name={sent ? "check" : "send"} size={17} />
            {sent ? "Değerlendirmen gönderildi" : "Gönder"}
          </button>
        </div>
      </div>
      <div style={{ height: 24 }} />
    </div>
  );
}
