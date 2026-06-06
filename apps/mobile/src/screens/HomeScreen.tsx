/* ANA SAYFA — selam, hero ilerleme, statlar, bugünün ödevleri, yaklaşan deneme, koç. */
import { MIcon } from "../ui/MIcon";
import { OdevCard } from "./OdevCard";
import { ODEVLER, STUDENT, TODAY, UPCOMING } from "../mocks/student";
import type { Odev, TabId } from "../types";

export function HomeScreen({ go, openResult }: { go: (t: TabId) => void; openResult: (o: Odev) => void }) {
  const todays = ODEVLER.filter((o) => o.week === "w0");
  const pending = todays.filter((o) => o.status !== "done");
  const doneCount = todays.length - pending.length;
  const pct = Math.round((doneCount / todays.length) * 100);

  return (
    <div className="uk-scroll">
      <div className="uk-safe-top" />
      <div className="uk-head">
        <span className="uk-avatar" style={{ width: 46, height: 46, fontSize: 16 }}>
          EY
        </span>
        <div>
          <div className="hi">İyi çalışmalar,</div>
          <div className="nm">{STUDENT.first} 👋</div>
        </div>
        <div className="uk-head-actions">
          <button className="uk-iconbtn">
            <MIcon name="bell" size={20} />
            <span className="dot" />
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="uk-sec uk-rise">
        <div className="uk-hero">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div className="uk-badge" style={{ background: "rgba(255,255,255,.18)", color: "#fff" }}>
              <MIcon name="flame" size={13} fill /> {STUDENT.streak} gün seri
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.85)" }}>{TODAY === "Cmt" ? "Cumartesi" : ""} · 6 Haz</div>
          </div>
          <h2 style={{ marginTop: 14 }}>{pending.length > 0 ? `Bugün ${pending.length} ödevin var` : "Bugünün ödevleri tamam! 🎉"}</h2>
          <p>
            {doneCount} tamamlandı · {pending.length} bekliyor
          </p>
          <div className="uk-hero-bar">
            <span style={{ width: pct + "%" }} />
          </div>
          <button className="uk-hero-cta" onClick={() => go("odevler")}>
            Ödevlere git <MIcon name="chevronRight" size={16} />
          </button>
        </div>
      </div>

      {/* Stat pills */}
      <div className="uk-sec" style={{ marginTop: 16 }}>
        <div className="uk-stats">
          <div className="uk-card uk-stat">
            <div className="lab">
              <span className="ic" style={{ background: "var(--primary-soft)", color: "var(--primary-600)" }}>
                <MIcon name="chart" size={15} />
              </span>{" "}
              Toplam Net
            </div>
            <div className="val tnum">{STUDENT.net}</div>
            <div className="sub" style={{ color: "var(--success)" }}>
              ▲ son denemede +15
            </div>
          </div>
          <div className="uk-card uk-stat">
            <div className="lab">
              <span className="ic" style={{ background: "var(--info-soft)", color: "var(--info)" }}>
                <MIcon name="clock" size={15} />
              </span>{" "}
              Bu hafta
            </div>
            <div className="val tnum">
              {STUDENT.weekHours}
              <span style={{ fontSize: 15, fontWeight: 700, color: "var(--muted)" }}> sa</span>
            </div>
            <div className="sub" style={{ color: "var(--success)" }}>
              ▲ +3.2 saat
            </div>
          </div>
        </div>
      </div>

      {/* Bugünün ödevleri */}
      <div className="uk-sec" style={{ marginTop: 22 }}>
        <div className="uk-sec-head">
          <h2>Bugünün ödevleri</h2>
          <button className="more" onClick={() => go("odevler")}>
            Tümü <MIcon name="chevronRight" size={14} />
          </button>
        </div>
        {pending.slice(0, 3).map((o) => (
          <OdevCard key={o.id} o={o} onResult={openResult} />
        ))}
      </div>

      {/* Yaklaşan deneme */}
      <div className="uk-sec" style={{ marginTop: 22 }}>
        <div className="uk-sec-head">
          <h2>Yaklaşan deneme</h2>
        </div>
        <button className="uk-card uk-card-pad" style={{ display: "flex", alignItems: "center", gap: 14, textAlign: "left", width: "100%" }} onClick={() => go("denemeler")}>
          <span style={{ width: 52, height: 52, borderRadius: 14, display: "grid", placeItems: "center", background: "var(--primary-soft)", color: "var(--primary-600)", flexShrink: 0 }}>
            <MIcon name="target" size={24} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-.01em" }}>{UPCOMING.name}</div>
            <div style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600, marginTop: 3 }}>{UPCOMING.org}</div>
            <div className="uk-meta" style={{ marginTop: 8 }}>
              <span className="uk-badge primary">
                <MIcon name="calendar" size={12} /> {UPCOMING.date}
              </span>
              <span className="uk-badge muted">
                <MIcon name="clock" size={12} /> {UPCOMING.time}
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Koç bandı */}
      <div className="uk-sec" style={{ marginTop: 22 }}>
        <div className="uk-card uk-coach" style={{ display: "flex" }}>
          <span className="uk-avatar" style={{ width: 48, height: 48, fontSize: 16, background: "linear-gradient(140deg,#8E87D6,#463DA6)" }}>
            DE
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="cn">{STUDENT.coach}</div>
            <div className="cr">Koçun · YKS &amp; LGS</div>
          </div>
          <button className="uk-iconbtn" style={{ background: "var(--primary)", color: "#fff", border: "none" }}>
            <MIcon name="message" size={19} />
          </button>
        </div>
      </div>

      <div style={{ height: 24 }} />
    </div>
  );
}
