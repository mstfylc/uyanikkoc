/* Ödev kartı (Ana Sayfa + Ödevler ekranlarında ortak). */
import { MIcon } from "../ui/MIcon";
import { netOf } from "../lib/net";
import { ODEV_TYPES, SUBJECT_COLORS } from "../mocks/student";
import type { Odev } from "../types";

const TODAY_DATE = new Date("2026-06-06");

export function OdevCard({ o, onResult }: { o: Odev; onResult: (o: Odev) => void }) {
  const c = SUBJECT_COLORS[o.subject] || "var(--primary)";
  const typeList = o.types.length ? o.types : (["soru"] as const);
  const t = ODEV_TYPES[typeList[0]] || ODEV_TYPES.soru;
  const needsResult = typeList.some((k) => ODEV_TYPES[k]?.needsResult);
  const overdue = o.status === "pending" && !!o.due && new Date(o.due) < TODAY_DATE;
  const dueLabel = o.due ? new Date(o.due).toLocaleDateString("tr-TR", { day: "numeric", month: "short" }) : "";

  return (
    <div className={`uk-odev${o.status === "done" ? " done" : ""}`}>
      <span className="ic" style={{ background: `color-mix(in srgb, ${c} 13%, transparent)`, color: c }}>
        <MIcon name={t.icon} size={20} />
      </span>
      <div className="body">
        <div className="ttl">{o.topic}</div>
        <div className="uk-meta">
          <span className="uk-chip">
            <span className="sw" style={{ background: c }} />
            {o.subject}
          </span>
          {typeList.map((k) => (
            <span key={k} className="mi d">
              {ODEV_TYPES[k]?.label}
            </span>
          ))}
          {needsResult && o.count ? <span className="mi d">{o.count} soru</span> : null}
        </div>
        <div className="uk-meta" style={{ marginTop: 6 }}>
          <span className="mi">
            <MIcon name="book" size={13} style={{ color: "var(--faint)" }} />
            {o.source}
          </span>
        </div>
        {o.note ? (
          <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 8, background: "var(--surface-3)", padding: "7px 11px", borderRadius: 9, fontWeight: 600 }}>
            📌 {o.note}
          </div>
        ) : null}

        {o.status === "done" && o.result ? (
          <div className="uk-result">
            <span style={{ color: "var(--success)" }}>✓ {o.result.d} doğru</span>
            <span style={{ color: "var(--danger)" }}>✕ {o.result.y} yanlış</span>
            <span style={{ color: "var(--muted)" }}>○ {o.result.b} boş</span>
            <span className="uk-badge primary">net {netOf(o.result.d, o.result.y)}</span>
          </div>
        ) : null}

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
          {o.status === "done" ? (
            <span className="uk-badge success">
              <MIcon name="check" size={13} /> Tamamlandı
            </span>
          ) : (
            <button className="uk-btn uk-btn-primary" onClick={() => onResult(o)} style={{ height: 36 }}>
              {needsResult ? "Sonuç Gir" : "Tamamla"}
            </button>
          )}
          {o.status !== "done" && o.due ? (
            <span style={{ fontSize: 12, fontWeight: 700, color: overdue ? "var(--danger)" : "var(--muted)" }}>
              {overdue ? "Gecikti · " : "Son: "}
              {dueLabel}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
