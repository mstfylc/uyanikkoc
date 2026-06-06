/* PROGRAM — gün segmenti, çalışma blokları. */
import { useState } from "react";
import { MIcon } from "../ui/MIcon";
import { useApiData } from "../lib/useApiData";
import { Loading, ErrorState } from "../ui/AsyncState";
import { SUBJECT_COLORS } from "../mocks/student";
import type { ScheduleResponse } from "../lib/api-types";

export function ProgramScreen() {
  const { data, loading, error, reload } = useApiData<ScheduleResponse>("/api/mobile/schedule");

  if (loading) return <Loading />;
  if (error || !data) return <ErrorState message={error ?? "Veri yüklenemedi"} reload={reload} />;

  return <ProgramView data={data} />;
}

function ProgramView({ data }: { data: ScheduleResponse }) {
  const { days, daysFull, today, schedule } = data;
  const [day, setDay] = useState(today);
  const blocks = schedule[day] || [];
  const todayIdx = days.indexOf(today);

  return (
    <div className="uk-scroll">
      <div className="uk-safe-top" />
      <div className="uk-ptitle">
        <h1>Program</h1>
        <p>
          {daysFull[day]} · {blocks.length} çalışma bloğu
        </p>
      </div>

      <div className="uk-segrow">
        {days.map((d, i) => (
          <button key={d} className={`uk-seg${day === d ? " on" : ""}`} onClick={() => setDay(d)} style={{ flexDirection: "column", height: 52, padding: "0 14px", gap: 2 }}>
            <span style={{ fontSize: 12, opacity: 0.85 }}>{d}</span>
            {i === todayIdx ? <span style={{ fontSize: 9.5, fontWeight: 800 }}>BUGÜN</span> : null}
          </button>
        ))}
      </div>

      <div className="uk-sec" style={{ marginTop: 18, gap: 14 }}>
        {blocks.length === 0 ? (
          <div style={{ padding: "50px 30px", textAlign: "center", color: "var(--muted)", fontSize: 14 }}>Bu gün için planlanmış blok yok.</div>
        ) : (
          blocks.map((b, i) => {
            const c = SUBJECT_COLORS[b.subj] || "var(--primary)";
            return (
              <div className="uk-block" key={i}>
                <div className="time">
                  {b.t}
                  <span>{b.e}</span>
                </div>
                <div className="b" style={{ borderLeftColor: c, opacity: b.done ? 0.7 : 1 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <div className="bs" style={{ color: c }}>
                      {b.subj.toUpperCase()}
                    </div>
                    <span className="uk-badge muted" style={{ height: 21 }}>
                      {b.type}
                    </span>
                  </div>
                  <div className="bt" style={{ textDecoration: b.done ? "line-through" : "none", color: b.done ? "var(--muted)" : "var(--text)" }}>
                    {b.topic}
                  </div>
                  {b.done ? (
                    <div className="uk-badge success" style={{ marginTop: 9, height: 21 }}>
                      <MIcon name="check" size={12} /> Yapıldı
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div style={{ height: 24 }} />
    </div>
  );
}
