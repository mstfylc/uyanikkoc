/* KONU TAKİBİ — ders bazlı konu ilerleme listesi. */
import { useState } from "react";
import { SubHeader } from "../ui/SubHeader";
import { MIcon } from "../ui/MIcon";
import { SUBJECT_COLORS, TOPICS, TOPIC_STATUS } from "../mocks/student";

export function KonuScreen({ onBack }: { onBack: () => void }) {
  const subjects = Object.keys(TOPICS);
  const [active, setActive] = useState(subjects[1]); // Matematik
  const list = TOPICS[active] ?? [];
  const c = SUBJECT_COLORS[active] || "var(--primary)";
  const done = list.filter((t) => t.s === "done").length;
  const prog = list.filter((t) => t.s === "progress").length;
  const pct = Math.round((done / list.length) * 100);

  return (
    <div className="uk-scroll">
      <div className="uk-safe-top" />
      <SubHeader title="Konu Takibi" sub={`${active} · %${pct} tamamlandı`} onBack={onBack} />

      <div className="uk-segrow">
        {subjects.map((s) => (
          <button
            key={s}
            className={`uk-seg${active === s ? " on" : ""}`}
            onClick={() => setActive(s)}
            style={active === s ? { background: SUBJECT_COLORS[s], borderColor: SUBJECT_COLORS[s] } : {}}
          >
            <span
              className="sw"
              style={{
                width: 8,
                height: 8,
                borderRadius: 3,
                background: active === s ? "#fff" : SUBJECT_COLORS[s],
                display: "inline-block",
              }}
            />
            {s}
          </button>
        ))}
      </div>

      <div className="uk-sec" style={{ marginTop: 16 }}>
        <div className="uk-card uk-card-pad">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)" }}>
              {done} bitti · {prog} devam · {list.length - done - prog} başlanmadı
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: c }} className="tnum">
              %{pct}
            </div>
          </div>
          <div className="uk-bar">
            <span style={{ width: pct + "%", background: c }} />
          </div>
        </div>
      </div>

      <div className="uk-sec" style={{ marginTop: 14, gap: 8 }}>
        {list.map((t) => {
          const st = TOPIC_STATUS[t.s];
          return (
            <div className="uk-odev" key={t.n} style={{ alignItems: "center", padding: "13px 14px" }}>
              <span
                className="ic"
                style={{
                  width: 36,
                  height: 36,
                  background: t.s === "done" ? "var(--success-soft)" : t.s === "progress" ? "var(--warning-soft)" : "var(--surface-3)",
                  color: t.s === "done" ? "var(--success)" : t.s === "progress" ? "var(--warning)" : "var(--faint)",
                }}
              >
                <MIcon name={t.s === "done" ? "checkCircle" : t.s === "progress" ? "clock" : "book"} size={18} />
              </span>
              <div className="body">
                <div className="ttl" style={{ fontSize: 14 }}>
                  {t.n}
                </div>
                {t.s === "progress" ? (
                  <div className="uk-bar" style={{ height: 6, marginTop: 8 }}>
                    <span style={{ width: (t.p ?? 0) + "%", background: c }} />
                  </div>
                ) : null}
              </div>
              <span className={`uk-badge ${st.tone}`}>{t.s === "progress" ? `%${t.p ?? 0}` : st.label}</span>
            </div>
          );
        })}
      </div>
      <div style={{ height: 24 }} />
    </div>
  );
}
