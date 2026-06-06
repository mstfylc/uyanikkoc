/* PROFİL — kullanıcı kartı, istatistik, başarımlar, ayarlar, çıkış. */
import { useState } from "react";
import { MIcon } from "../ui/MIcon";
import type { IconName } from "../ui/icons";
import { useSession } from "../lib/session";
import { ACHIEVEMENTS, SOURCES, STUDENT } from "../mocks/student";
import type { SubId, ThemeMode } from "../types";

type Stat = [IconName, number, string, string];

export function ProfilScreen({ theme, setTheme, openSub }: { theme: ThemeMode; setTheme: (t: ThemeMode) => void; openSub: (k: SubId) => void }) {
  const { me, logout } = useSession();
  const [notif, setNotif] = useState(true);
  const dark = theme === "dark";

  // Bootstrap (/api/me) verisi; yoksa mock'a düş.
  const name = me?.user.name ?? STUDENT.name;
  const initials = me?.user.avatarInitials ?? "EY";
  const grade = me?.student?.grade ?? STUDENT.grade;
  const goal = me?.student?.goal ?? STUDENT.goal;
  const streak = me?.student?.streak ?? STUDENT.streak;
  const totalNet = me?.student?.totalNet ?? STUDENT.net;
  const weekHours = me?.student?.weekHours ?? STUDENT.weekHours;

  const stats: Stat[] = [
    ["flame", streak, "gün seri", "var(--warning)"],
    ["chart", totalNet, "net", "var(--primary-600)"],
    ["clock", weekHours, "saat/hf", "var(--info)"],
  ];

  return (
    <div className="uk-scroll">
      <div className="uk-safe-top" />
      <div className="uk-ptitle">
        <h1>Profil</h1>
      </div>

      {/* kullanıcı kartı */}
      <div className="uk-sec">
        <div className="uk-card uk-card-pad" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 4, paddingTop: 22, paddingBottom: 22 }}>
          <span className="uk-avatar" style={{ width: 76, height: 76, fontSize: 26 }}>
            {initials}
          </span>
          <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-.02em", marginTop: 12, width: "100%", lineHeight: 1.2 }}>{name}</div>
          <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600, width: "100%" }}>{grade}</div>
          <div className="uk-badge primary" style={{ marginTop: 10 }}>
            <MIcon name="target" size={13} /> Hedef: {goal}
          </div>
        </div>
      </div>

      {/* özet istatistik */}
      <div className="uk-sec" style={{ marginTop: 14 }}>
        <div className="uk-stats" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
          {stats.map(([ic, v, l, col]) => (
            <div className="uk-card" key={l} style={{ padding: "14px 8px", textAlign: "center" }}>
              <span style={{ color: col, display: "inline-grid", placeItems: "center" }}>
                <MIcon name={ic} size={18} fill={ic === "flame"} />
              </span>
              <div style={{ fontSize: 20, fontWeight: 800, marginTop: 6 }} className="tnum">
                {v}
              </div>
              <div style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 700, marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* başarımlar */}
      <div className="uk-sec" style={{ marginTop: 22 }}>
        <div className="uk-sec-head">
          <h2>Başarımlar</h2>
          <span className="uk-badge muted">4 / 6</span>
        </div>
        <div className="uk-ach">
          {ACHIEVEMENTS.map((a) => (
            <div key={a.name} className={`a${a.earned ? "" : " locked"}`}>
              <span className="ic">
                <MIcon name={a.icon} size={22} fill={a.earned && (a.icon === "flame" || a.icon === "star")} />
              </span>
              <div className="an">{a.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ayarlar */}
      <div className="uk-sec" style={{ marginTop: 22 }}>
        <div className="uk-sec-head">
          <h2>Ayarlar</h2>
        </div>
        <div className="uk-list">
          <div className="uk-li">
            <span className="lic" style={{ background: "var(--warning-soft)", color: "var(--warning)" }}>
              <MIcon name="bell" size={17} />
            </span>
            <span className="lt">Bildirimler</span>
            <button className={`uk-switch${notif ? " on" : ""}`} onClick={() => setNotif(!notif)}>
              <span />
            </button>
          </div>
          <div className="uk-li">
            <span className="lic" style={{ background: "var(--surface-3)", color: "var(--text-2)" }}>
              <MIcon name="moon" size={17} />
            </span>
            <span className="lt">Koyu tema</span>
            <button className={`uk-switch${dark ? " on" : ""}`} onClick={() => setTheme(dark ? "light" : "dark")}>
              <span />
            </button>
          </div>
          <div className="uk-li" onClick={() => openSub("kaynaklar")} style={{ cursor: "pointer" }}>
            <span className="lic" style={{ background: "var(--primary-soft)", color: "var(--primary-600)" }}>
              <MIcon name="book" size={17} />
            </span>
            <span className="lt">Kaynaklarım</span>
            <span className="lr">{SOURCES.length} kitap</span>
            <MIcon name="chevronRight" size={18} style={{ color: "var(--faint)" }} />
          </div>
          <div className="uk-li" onClick={() => openSub("randevu")} style={{ cursor: "pointer" }}>
            <span className="lic" style={{ background: "var(--success-soft)", color: "var(--success)" }}>
              <MIcon name="calendar" size={17} />
            </span>
            <span className="lt">Randevularım</span>
            <MIcon name="chevronRight" size={18} style={{ color: "var(--faint)" }} />
          </div>
          <div className="uk-li">
            <span className="lic" style={{ background: "var(--info-soft)", color: "var(--info)" }}>
              <MIcon name="help" size={17} />
            </span>
            <span className="lt">Yardım &amp; Destek</span>
            <MIcon name="chevronRight" size={18} style={{ color: "var(--faint)" }} />
          </div>
        </div>
      </div>

      <div className="uk-sec" style={{ marginTop: 16 }}>
        <button className="uk-btn uk-btn-light uk-btn-block" style={{ color: "var(--danger)", height: 50 }} onClick={() => void logout()}>
          <MIcon name="logout" size={18} /> Çıkış Yap
        </button>
      </div>

      <div style={{ textAlign: "center", fontSize: 11.5, color: "var(--faint)", fontWeight: 600, marginTop: 16 }}>Uyanık Koç · Sürüm 1.0.0</div>
      <div style={{ height: 24 }} />
    </div>
  );
}
