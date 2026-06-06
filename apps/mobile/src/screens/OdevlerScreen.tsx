/* ÖDEVLER — hafta segmenti, bekleyen/tamamlanan listeleri. */
import { useState } from "react";
import { OdevCard } from "./OdevCard";
import { ODEVLER, WEEKS } from "../mocks/student";
import type { Odev } from "../types";

export function OdevlerScreen({ openResult }: { openResult: (o: Odev) => void }) {
  const [week, setWeek] = useState("w0");
  const wk = ODEVLER.filter((o) => o.week === week);
  const pending = wk.filter((o) => o.status !== "done");
  const doneList = wk.filter((o) => o.status === "done");
  const weekHasData = (w: string) => ODEVLER.some((o) => o.week === w);
  const winfo = WEEKS.find((w) => w.id === week);

  return (
    <div className="uk-scroll">
      <div className="uk-safe-top" />
      <div className="uk-ptitle">
        <h1>Ödevler</h1>
        <p>
          {winfo?.range} · {pending.length} bekleyen ödev
        </p>
      </div>

      <div className="uk-segrow">
        {WEEKS.map((w) => (
          <button key={w.id} className={`uk-seg${week === w.id ? " on" : ""}`} disabled={!weekHasData(w.id)} onClick={() => setWeek(w.id)}>
            {w.label}
          </button>
        ))}
      </div>

      {pending.length > 0 && (
        <div className="uk-sec" style={{ marginTop: 16 }}>
          <div className="uk-sec-head">
            <h2>
              Bekleyen <span style={{ color: "var(--muted)", fontWeight: 700 }}>· {pending.length}</span>
            </h2>
          </div>
          {pending.map((o) => (
            <OdevCard key={o.id} o={o} onResult={openResult} />
          ))}
        </div>
      )}

      {doneList.length > 0 && (
        <div className="uk-sec" style={{ marginTop: 22 }}>
          <div className="uk-sec-head">
            <h2 style={{ color: "var(--muted)" }}>
              Tamamlanan <span style={{ fontWeight: 700 }}>· {doneList.length}</span>
            </h2>
          </div>
          {doneList.map((o) => (
            <OdevCard key={o.id} o={o} onResult={openResult} />
          ))}
        </div>
      )}

      {wk.length === 0 && <div style={{ padding: "60px 30px", textAlign: "center", color: "var(--muted)", fontSize: 14 }}>Bu hafta atanmış ödev yok.</div>}

      <div style={{ height: 24 }} />
    </div>
  );
}
