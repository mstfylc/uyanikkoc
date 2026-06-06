/* RANDEVULAR — koç ile görüşme listesi ve yeni randevu isteme. */
import { useState } from "react";
import { SubHeader } from "../ui/SubHeader";
import { MIcon } from "../ui/MIcon";
import { APPT_MODES, APPT_SLOTS, APPTS, DAYS_FULL } from "../mocks/student";
import type { IconName } from "../ui/icons";

function apptIcon(mode: string): IconName {
  if (mode === "Online") return "ai";
  if (mode === "Telefon") return "phone";
  return "users";
}

export function RandevularScreen({ onBack }: { onBack: () => void }) {
  const [mode, setMode] = useState<string>(APPT_MODES[0]);
  const [picked, setPicked] = useState<string | null>(null);
  const [booked, setBooked] = useState(false);

  return (
    <div className="uk-scroll">
      <div className="uk-safe-top" />
      <SubHeader title="Randevular" sub="Koçunla görüşme planla" onBack={onBack} />

      <div className="uk-sec">
        <div className="uk-sec-head">
          <h2>Yaklaşan</h2>
        </div>
        {APPTS.map((a) => (
          <div className="uk-odev" key={a.id} style={{ alignItems: "center" }}>
            <span className="ic" style={{ background: "var(--primary-soft)", color: "var(--primary-600)" }}>
              <MIcon name={apptIcon(a.mode)} size={19} />
            </span>
            <div className="body">
              <div className="ttl" style={{ fontSize: 14 }}>{a.topic}</div>
              <div className="uk-meta" style={{ marginTop: 6 }}>
                <span className="uk-badge muted">
                  <MIcon name="calendar" size={12} /> {a.date}
                </span>
                <span className="mi">
                  {a.time} · {a.mode}
                </span>
              </div>
            </div>
            <span className={`uk-badge ${a.status === "onaylı" ? "success" : "warning"}`}>{a.status}</span>
          </div>
        ))}
      </div>

      <div className="uk-sec" style={{ marginTop: 22 }}>
        <div className="uk-sec-head">
          <h2>Yeni randevu</h2>
        </div>
        <div className="uk-card uk-card-pad">
          <div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--text-2)", marginBottom: 8 }}>Görüşme türü</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
            {APPT_MODES.map((m) => (
              <button key={m} className={`uk-seg${mode === m ? " on" : ""}`} style={{ flex: 1, justifyContent: "center" }} onClick={() => setMode(m)}>
                <MIcon name={apptIcon(m)} size={15} /> {m}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--text-2)", marginBottom: 8 }}>Müsait slotlar</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {APPT_SLOTS.map((d) => (
              <div key={d.day}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", marginBottom: 7 }}>{DAYS_FULL[d.day]}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {d.times.map((t) => {
                    const id = d.day + t;
                    const on = picked === id;
                    return (
                      <button
                        key={t}
                        className={`uk-seg${on ? " on" : ""}`}
                        style={{ height: 38 }}
                        onClick={() => { setPicked(id); setBooked(false); }}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <button
            className="uk-btn uk-btn-primary uk-btn-block"
            style={{ marginTop: 18, background: booked ? "var(--success)" : undefined }}
            disabled={!picked}
            onClick={() => setBooked(true)}
          >
            <MIcon name={booked ? "check" : "calendar"} size={18} />
            {booked ? "Randevu talebi gönderildi" : "Randevu İste"}
          </button>
        </div>
      </div>
      <div style={{ height: 24 }} />
    </div>
  );
}
