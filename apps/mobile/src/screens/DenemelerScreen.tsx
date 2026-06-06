/* DENEMELER — net trendi, geçmiş liste, detay/analiz. */
import { useState } from "react";
import { MIcon } from "../ui/MIcon";
import { useApiData } from "../lib/useApiData";
import { Loading, ErrorState } from "../ui/AsyncState";
import type { ExamsResponse } from "../lib/api-types";
import type { Exam } from "../types";

export function DenemelerScreen() {
  const [sel, setSel] = useState<Exam | null>(null);
  const { data, loading, error, reload } = useApiData<ExamsResponse>("/api/mobile/exams");

  if (loading) return <Loading />;
  if (error || !data) return <ErrorState message={error ?? "Veri yüklenemedi"} reload={reload} />;

  const { exams, trend } = data;
  const latest = exams[0];
  const maxTrend = Math.max(...trend.map((d) => d.v));

  if (sel) return <ExamDetail exam={sel} onBack={() => setSel(null)} />;

  return (
    <div className="uk-scroll">
      <div className="uk-safe-top" />
      <div className="uk-ptitle">
        <h1>Denemeler</h1>
        <p>{exams.length} deneme · ortalama yükseliyor</p>
      </div>

      {/* Net trendi */}
      <div className="uk-sec">
        <div className="uk-card uk-card-pad">
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)" }}>Net Gelişimi (TYT)</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
                <span style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-.02em" }} className="tnum">
                  {latest.net}
                </span>
                <span className="uk-badge success">
                  <MIcon name="arrowUp" size={12} /> {latest.delta} net
                </span>
              </div>
            </div>
            <span className="uk-badge muted">Son 6</span>
          </div>
          <div className="uk-chart">
            {trend.map((d, i) => (
              <div key={i} className={`col${i === trend.length - 1 ? " peak" : ""}`}>
                <span className="vv tnum">{d.v}</span>
                <div className="track">
                  <div className="fill" style={{ height: (d.v / maxTrend) * 100 + "%" }} />
                </div>
                <label>{d.l}</label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Geçmiş denemeler */}
      <div className="uk-sec" style={{ marginTop: 22 }}>
        <div className="uk-sec-head">
          <h2>Geçmiş denemeler</h2>
        </div>
        {exams.map((e) => {
          const up = !e.delta.startsWith("-");
          return (
            <button key={e.id} className="uk-exam" onClick={() => setSel(e)} style={{ width: "100%", textAlign: "left" }}>
              <span className="ec">
                <MIcon name="chart" size={22} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="en">{e.name}</div>
                <div className="em">
                  {e.pub} · {e.date}
                </div>
                <div className="uk-meta" style={{ marginTop: 7 }}>
                  <span className="uk-badge muted">{e.type}</span>
                  <span className="mi">Sıralama {e.rank}</span>
                </div>
              </div>
              <div className="right">
                <div className="net tnum">{e.net}</div>
                <div className="delta" style={{ color: up ? "var(--success)" : "var(--danger)" }}>
                  {up ? "▲" : "▼"} {e.delta}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ height: 24 }} />
    </div>
  );
}

function ExamDetail({ exam, onBack }: { exam: Exam; onBack: () => void }) {
  const up = !exam.delta.startsWith("-");
  return (
    <div className="uk-scroll">
      <div className="uk-safe-top" />
      <div style={{ padding: "4px 16px 8px" }}>
        <button className="uk-iconbtn" onClick={onBack} style={{ width: 40, height: 40 }}>
          <MIcon name="chevronLeft" size={20} />
        </button>
      </div>
      <div className="uk-ptitle" style={{ paddingTop: 6 }}>
        <h1 style={{ fontSize: 23 }}>{exam.name}</h1>
        <p>
          {exam.pub} · {exam.date}
        </p>
      </div>

      {/* özet kart */}
      <div className="uk-sec">
        <div className="uk-hero" style={{ borderRadius: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,.8)" }}>Toplam Net</div>
              <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-.03em", lineHeight: 1.1 }} className="tnum">
                {exam.net}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="uk-badge" style={{ background: "rgba(255,255,255,.2)", color: "#fff" }}>
                {up ? "▲" : "▼"} {exam.delta} net
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "rgba(255,255,255,.85)", marginTop: 10 }}>Türkiye sıralaması</div>
              <div style={{ fontSize: 17, fontWeight: 800 }} className="tnum">
                {exam.rank}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* bölüm bazlı analiz */}
      <div className="uk-sec" style={{ marginTop: 22 }}>
        <div className="uk-sec-head">
          <h2>Bölüm bazlı netler</h2>
        </div>
        <div className="uk-card uk-card-pad">
          <div className="uk-subj">
            {exam.parts.map((p) => {
              const pct = (p.net / p.max) * 100;
              const tone = pct >= 80 ? "var(--success)" : pct >= 55 ? "var(--warning)" : "var(--danger)";
              return (
                <div key={p.n}>
                  <div className="row1">
                    <span className="sname">
                      <span className="sw" style={{ background: tone }} />
                      {p.n}
                    </span>
                    <span className="spct tnum">
                      {p.net} <span style={{ color: "var(--muted)", fontWeight: 600 }}>/ {p.max}</span>
                    </span>
                  </div>
                  <div className="uk-bar">
                    <span style={{ width: pct + "%", background: tone }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Koç önerisi bandı (statik — AI Koç kapalı) */}
      <div className="uk-sec" style={{ marginTop: 16 }}>
        <div
          className="uk-card uk-card-pad"
          style={{
            display: "flex",
            gap: 13,
            alignItems: "flex-start",
            borderStyle: "dashed",
            borderColor: "color-mix(in srgb, var(--primary) 34%, transparent)",
            background: "linear-gradient(120deg, color-mix(in srgb, var(--primary) 7%, var(--surface)), var(--surface))",
          }}
        >
          <span style={{ width: 42, height: 42, borderRadius: 12, display: "grid", placeItems: "center", background: "linear-gradient(140deg,var(--primary-300),var(--primary-700))", color: "#fff", flexShrink: 0, boxShadow: "var(--shadow-primary)" }}>
            <MIcon name="ai" size={21} />
          </span>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 800 }}>Koç önerisi</div>
            <div style={{ fontSize: 12.5, color: "var(--text-2)", fontWeight: 500, marginTop: 4, lineHeight: 1.5 }}>
              Fen Bilimleri netini yükseltmek için bu hafta Kimya "Mol Kavramı" ve Fizik "Newton Yasaları" tekrarına odaklan.
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: 24 }} />
    </div>
  );
}
