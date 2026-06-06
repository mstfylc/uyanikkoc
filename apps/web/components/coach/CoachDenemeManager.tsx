"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { KiIcon } from "@/components/design/KiIcon";
import { UkAvatar } from "@/components/design/UkAvatar";
import { UkBadge } from "@/components/design/UkBadge";
import { UkSection } from "@/components/design/UkSection";
import type { DenemeEvent, DenemeRegistration } from "@/mocks/deneme-events";
import type { CoachRosterEntry } from "@uyanik/database";

type EnrichedEvent = DenemeEvent & {
  registrationCount: number;
  registrations: DenemeRegistration[];
};

export function CoachDenemeManager() {
  const [events, setEvents] = useState<EnrichedEvent[]>([]);
  const [students, setStudents] = useState<CoachRosterEntry[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const studentNames = useMemo(() => {
    const map = new Map<string, string>();
    students.forEach((s) => map.set(s.studentId, s.displayName));
    return map;
  }, [students]);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/coach/deneme-events", { credentials: "same-origin" });
    if (res.ok) {
      const data = (await res.json()) as { events: EnrichedEvent[]; students: CoachRosterEntry[] };
      setEvents(data.events);
      setStudents(data.students);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function removeEvent(eventId: string, name: string) {
    if (!window.confirm(`${name} silinsin mi?`)) return;
    await fetch("/api/coach/deneme-events", {
      method: "DELETE",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId }),
    });
    void load();
  }

  const totalReg = events.reduce((a, e) => a + e.registrationCount, 0);

  return (
    <UkSection
      title="Deneme Takvimi & Kayıtlar"
      sub={`${events.length} deneme · ${totalReg} kayıt`}
      action={
        <button type="button" className="btn btn-primary btn-sm" onClick={() => setCreateOpen(true)}>
          <KiIcon name="ki-plus" size={16} />
          Deneme Oluştur
        </button>
      }
    >
      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {loading ? (
          <p className="muted" style={{ fontSize: 13 }}>Yükleniyor…</p>
        ) : events.length === 0 ? (
          <p className="muted" style={{ fontSize: 13 }}>Henüz deneme yok. “Deneme Oluştur” ile başla.</p>
        ) : (
          events.map((ev) => {
            const open = expanded === ev.id;
            const paid = ev.registrations.filter((r) => r.payment === "odendi").length;
            const pkg = ev.registrations.filter((r) => r.payment === "paket").length;
            return (
              <div
                key={ev.id}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: 14,
                  overflow: "hidden",
                  background: open ? "var(--surface-2)" : "transparent",
                }}
              >
                <div
                  className="lrow"
                  style={{ padding: "13px 14px", cursor: "pointer" }}
                  onClick={() => setExpanded(open ? null : ev.id)}
                >
                  <span className="lr-icon tone-primary" style={{ flexShrink: 0 }}>
                    <KiIcon name="ki-chart-simple" size={18} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="lr-title">{ev.name}</div>
                    <div className="lr-meta">
                      <UkBadge tone="muted">{ev.examType}</UkBadge>
                      <span className="d">{ev.date} · {ev.time}</span>
                      <span className="d">{ev.place}</span>
                    </div>
                  </div>
                  <div className="row" style={{ gap: 10, flexShrink: 0 }}>
                    <span className="row" style={{ gap: 6 }}>
                      <KiIcon name="ki-people" size={15} style={{ color: "var(--muted)" }} />
                      <b className="tnum" style={{ fontSize: 14 }}>{ev.registrationCount}</b>
                    </span>
                    <button
                      type="button"
                      className="icon-btn"
                      style={{ width: 30, height: 30 }}
                      title="Sil"
                      aria-label="Sil"
                      onClick={(e) => {
                        e.stopPropagation();
                        void removeEvent(ev.id, ev.name);
                      }}
                    >
                      <KiIcon name="ki-plus" size={15} style={{ transform: "rotate(45deg)", color: "var(--danger)" }} />
                    </button>
                    <KiIcon
                      name="ki-down"
                      size={16}
                      style={{
                        color: "var(--faint)",
                        transform: open ? "rotate(180deg)" : "none",
                        transition: "transform .18s",
                      }}
                    />
                  </div>
                </div>
                {open ? (
                  <div style={{ padding: "0 14px 14px" }}>
                    <div className="row" style={{ gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                      <UkBadge tone="primary">{ev.registrationCount} kayıtlı</UkBadge>
                      <UkBadge tone="success">{pkg} paket kapsamı</UkBadge>
                      <UkBadge tone="info">{paid} ödemeli</UkBadge>
                    </div>
                    {ev.registrations.length === 0 ? (
                      <div className="muted" style={{ fontSize: 12.5, padding: "8px 0" }}>Henüz kayıt yok.</div>
                    ) : (
                      <div style={{ overflowX: "auto", border: "1px solid var(--border)", borderRadius: 11 }}>
                        <table className="tbl" style={{ minWidth: 460 }}>
                          <thead>
                            <tr>
                              <th>Öğrenci</th>
                              <th style={{ textAlign: "center" }}>Ödeme</th>
                              <th style={{ textAlign: "right" }}>Katılım</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ev.registrations.map((r) => (
                              <tr key={r.studentId}>
                                <td>
                                  <div className="row" style={{ gap: 8 }}>
                                    <UkAvatar name={studentNames.get(r.studentId) ?? r.studentId} size={28} />
                                    <b style={{ fontSize: 12.5 }}>{studentNames.get(r.studentId) ?? r.studentId}</b>
                                  </div>
                                </td>
                                <td style={{ textAlign: "center" }}>
                                  {r.payment === "paket" ? (
                                    <UkBadge tone="success">Paket dahil</UkBadge>
                                  ) : (
                                    <UkBadge tone="info">Ödendi</UkBadge>
                                  )}
                                </td>
                                <td style={{ textAlign: "right" }}>
                                  {r.mode === "online" ? (
                                    <UkBadge tone="muted">Online optik</UkBadge>
                                  ) : (
                                    <UkBadge tone="muted">Yüz yüze</UkBadge>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
      <CoachDenemeOlusturModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={() => void load()} />
    </UkSection>
  );
}

function CoachDenemeOlusturModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [examType, setExamType] = useState<"TYT" | "AYT" | "LGS">("TYT");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [place, setPlace] = useState("Kampüs Koç · Kadıköy");
  const [soru, setSoru] = useState("120");
  const [price, setPrice] = useState("150");
  const [saving, setSaving] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (open) {
      setName("");
      setExamType("TYT");
      setDate("");
      setTime("10:00");
      setPlace("Kampüs Koç · Kadıköy");
      setSoru("120");
      setPrice("150");
    }
  }, [open]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/coach/deneme-events", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        examType,
        date,
        time,
        place,
        questionCount: parseInt(soru, 10) || 0,
        price: parseInt(price, 10) || 0,
      }),
    });
    setSaving(false);
    if (res.ok) {
      onCreated();
      onClose();
    }
  }

  if (!open || !mounted) return null;
  const ok = name.trim().length > 2 && date.trim();

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="row" style={{ gap: 9 }}>
            <span className="stat-icon tone-primary" style={{ width: 36, height: 36 }}>
              <KiIcon name="ki-plus" size={18} />
            </span>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800 }}>Deneme Oluştur</h3>
              <div className="muted" style={{ fontSize: 12.5 }}>Öğrencilerin kayıt olabileceği yeni deneme</div>
            </div>
          </div>
          <button type="button" className="icon-btn" style={{ width: 36, height: 36 }} onClick={onClose} aria-label="Kapat">
            <KiIcon name="ki-plus" size={18} style={{ transform: "rotate(45deg)" }} />
          </button>
        </div>
        <form onSubmit={submit} className="modal-body" style={{ gap: 13 }}>
          <div className="field">
            <label className="label">Deneme adı</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="ör. TYT Genel Deneme #9" autoFocus />
          </div>
          <div className="grid g-2" style={{ gap: 12 }}>
            <div className="field">
              <label className="label">Tür</label>
              <select className="select" value={examType} onChange={(e) => setExamType(e.target.value as typeof examType)}>
                {(["TYT", "AYT", "LGS"] as const).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="label">Soru sayısı</label>
              <input className="input tnum" inputMode="numeric" value={soru} onChange={(e) => setSoru(e.target.value.replace(/\D/g, ""))} />
            </div>
          </div>
          <div className="grid g-2" style={{ gap: 12 }}>
            <div className="field">
              <label className="label">Tarih</label>
              <input type="date" className="input tnum" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="field">
              <label className="label">Saat</label>
              <input type="time" className="input tnum" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label className="label">Yer / yöntem</label>
            <input className="input" value={place} onChange={(e) => setPlace(e.target.value)} />
          </div>
          <div className="field">
            <label className="label">Ücret (₺)</label>
            <input className="input tnum" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))} />
          </div>
          <div className="modal-foot" style={{ justifyContent: "flex-end", padding: 0 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Vazgeç</button>
            <button type="submit" className="btn btn-primary" disabled={!ok || saving}>
              {saving ? "Kaydediliyor…" : "Oluştur"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
