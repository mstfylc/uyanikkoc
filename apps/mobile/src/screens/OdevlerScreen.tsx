/* ÖDEVLER — hafta segmenti, bekleyen/tamamlanan listeleri. */
import { useState } from "react";
import { OdevCard } from "./OdevCard";
import { useApiData } from "../lib/useApiData";
import { Loading, ErrorState } from "../ui/AsyncState";
import type { OdevResponse } from "../lib/api-types";
import type { Odev } from "../types";

export function OdevlerScreen({ openResult, rev = 0 }: { openResult: (o: Odev) => void; rev?: number }) {
  const [week, setWeek] = useState("w0");
  const { data, loading, error, reload } = useApiData<OdevResponse>("/api/mobile/odev", rev);

  if (loading) return <Loading />;
  if (error || !data) return <ErrorState message={error ?? "Veri yüklenemedi"} reload={reload} />;

  const { items, weeks } = data;
  const wk = items.filter((o) => o.week === week);
  const pending = wk.filter((o) => o.status !== "done");
  const doneList = wk.filter((o) => o.status === "done");
  const weekHasData = (w: string) => items.some((o) => o.week === w);
  const winfo = weeks.find((w) => w.id === week);

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
        {weeks.map((w) => (
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
