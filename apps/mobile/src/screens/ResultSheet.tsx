/* Sonuç giriş — bottom sheet (Doğru / Yanlış / Boş → net). */
import { useState } from "react";
import { MIcon } from "../ui/MIcon";
import { api } from "../lib/apiClient";
import { netOf } from "../lib/net";
import { ODEV_TYPES, SUBJECT_COLORS } from "../mocks/student";
import type { Odev } from "../types";

function toNum(x: string): number {
  const n = parseInt(x.replace(/\D/g, ""), 10);
  return isNaN(n) ? 0 : n;
}

export function ResultSheet({ odev, onClose, onSaved }: { odev: Odev; onClose: () => void; onSaved?: () => void }) {
  const [d, setD] = useState("");
  const [y, setY] = useState("");
  const [b, setB] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const typeList = odev.types.length ? odev.types : (["soru"] as const);
  const needs = typeList.some((k) => ODEV_TYPES[k]?.needsResult);
  const c = SUBJECT_COLORS[odev.subject] || "var(--primary)";
  const td = toNum(d);
  const ty = toNum(y);
  const net = netOf(td, ty);
  const valid = !needs || td + ty + toNum(b) > 0;

  const save = async () => {
    if (saving) return;
    setSaving(true);
    const result = needs ? { d: td, y: ty, b: toNum(b) } : null;
    try {
      await api<{ item: Odev }>("/api/mobile/odev/result", { method: "POST", body: { id: odev.id, result } });
      setSaved(true);
      onSaved?.();
      setTimeout(onClose, 950);
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="uk-sheet-overlay" onClick={onClose}>
      <div className="uk-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="uk-grip" />
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <span
            style={{
              width: 44,
              height: 44,
              borderRadius: 13,
              display: "grid",
              placeItems: "center",
              background: `color-mix(in srgb, ${c} 14%, transparent)`,
              color: c,
              flexShrink: 0,
            }}
          >
            <MIcon name={(ODEV_TYPES[typeList[0]] || ODEV_TYPES.soru).icon} size={21} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-.01em", lineHeight: 1.25 }}>{odev.topic}</div>
            <div style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>
              {odev.subject} · {odev.source}
            </div>
          </div>
        </div>

        {needs ? (
          <>
            <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600, marginBottom: 12 }}>
              Hedef <b style={{ color: "var(--text)" }}>{odev.count} soru</b> · sonucu gir:
            </div>
            <div className="uk-dyb">
              <div className="f">
                <label style={{ color: "var(--success)" }}>Doğru</label>
                <input inputMode="numeric" placeholder="0" value={d} onChange={(e) => setD(e.target.value.replace(/\D/g, ""))} />
              </div>
              <div className="f">
                <label style={{ color: "var(--danger)" }}>Yanlış</label>
                <input inputMode="numeric" placeholder="0" value={y} onChange={(e) => setY(e.target.value.replace(/\D/g, ""))} />
              </div>
              <div className="f">
                <label style={{ color: "var(--muted)" }}>Boş</label>
                <input inputMode="numeric" placeholder="0" value={b} onChange={(e) => setB(e.target.value.replace(/\D/g, ""))} />
              </div>
            </div>
            <div className="uk-netbox">
              <span className="l">Hesaplanan net</span>
              <span className="v tnum">{net}</span>
            </div>
          </>
        ) : (
          <div style={{ padding: "14px 0 6px", textAlign: "center", color: "var(--text-2)", fontSize: 14, lineHeight: 1.5 }}>
            Bu görevi tamamladıysan işaretle.{odev.note ? ` "${odev.note}"` : ""}
          </div>
        )}

        <button className="uk-btn uk-btn-primary uk-btn-block" style={{ marginTop: 20, background: saved ? "var(--success)" : undefined }} disabled={!valid || saving} onClick={save}>
          <MIcon name={saved ? "check" : "checkCircle"} size={18} /> {saved ? "Kaydedildi!" : needs ? "Sonucu Kaydet" : "Tamamlandı olarak işaretle"}
        </button>
        <button className="uk-btn uk-btn-light uk-btn-block" style={{ marginTop: 10, height: 46, boxShadow: "none" }} onClick={onClose}>
          Vazgeç
        </button>
      </div>
    </div>
  );
}
