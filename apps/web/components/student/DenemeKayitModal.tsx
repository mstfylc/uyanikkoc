"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { KiIcon } from "@/components/design/KiIcon";
import { UkBadge } from "@/components/design/UkBadge";
import { denemePlanById } from "@/lib/design/deneme-plans";
import { formatTRY } from "@uyanik/shared";
import type { DenemeEvent, DenemeRegistration } from "@/mocks/deneme-events";

type Props = {
  open: boolean;
  onClose: () => void;
  examTypeFilter?: "YKS" | "LGS";
  onGoOnline?: () => void;
};

export function DenemeKayitModal({ open, onClose, examTypeFilter = "YKS", onGoOnline }: Props) {
  const [mounted, setMounted] = useState(false);
  const [events, setEvents] = useState<DenemeEvent[]>([]);
  const [membership, setMembership] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<DenemeRegistration[]>([]);
  const [done, setDone] = useState<{ event: DenemeEvent; mode: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/student/deneme-events", { credentials: "same-origin" });
    if (res.ok) {
      const data = (await res.json()) as {
        events: DenemeEvent[];
        membership: string | null;
        registrations: DenemeRegistration[];
      };
      setEvents(data.events);
      setMembership(data.membership);
      setRegistrations(data.registrations);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      setDone(null);
      void load();
    }
  }, [open, load]);

  const registeredIds = useMemo(() => new Set(registrations.map((r) => r.eventId)), [registrations]);
  const plan = denemePlanById(membership);
  const list = useMemo(
    () =>
      events.filter((e) =>
        examTypeFilter === "LGS" ? e.examType === "LGS" : e.examType !== "LGS",
      ),
    [events, examTypeFilter],
  );

  async function register(event: DenemeEvent) {
    const res = await fetch("/api/student/deneme-events", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId: event.id, action: "register" }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as { registration: DenemeRegistration };
    setDone({ event, mode: data.registration.mode });
    void load();
  }

  if (!open || !mounted) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel"
        style={{ maxWidth: 540, height: "min(700px, calc(100vh - 40px))" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <div className="row" style={{ gap: 11 }}>
            <span className="stat-icon tone-primary" style={{ width: 38, height: 38 }}>
              <KiIcon name="ki-chart-simple" size={18} />
            </span>
            <div>
              <h3 style={{ fontSize: 15.5, fontWeight: 800 }}>Denemeye Kayıt Ol</h3>
              <div className="muted" style={{ fontSize: 12 }}>Yaklaşan denemelerden seç</div>
            </div>
          </div>
          <button type="button" className="icon-btn" style={{ width: 36, height: 36 }} onClick={onClose} aria-label="Kapat">
            <KiIcon name="ki-plus" size={18} style={{ transform: "rotate(45deg)" }} />
          </button>
        </div>

        {done ? (
          <div className="modal-body" style={{ padding: 26, textAlign: "center", gap: 12, alignItems: "center" }}>
            <span className="stat-icon tone-success" style={{ width: 56, height: 56 }}>
              <KiIcon name="ki-check-circle" size={28} />
            </span>
            <h3 style={{ fontSize: 18, fontWeight: 800 }}>Kaydın alındı!</h3>
            <p className="muted" style={{ fontSize: 13, lineHeight: 1.5 }}>
              <b style={{ color: "var(--text)" }}>{done.event.name}</b> · {done.event.date} {done.event.time}
            </p>
            {done.mode === "online" ? (
              <div className="notice" style={{ background: "var(--info-soft)", textAlign: "left" }}>
                <KiIcon name="ki-notepad-edit" size={18} style={{ color: "var(--info)", flexShrink: 0 }} />
                <div style={{ flex: 1, fontSize: 12.5 }}>
                  <b>Kargo üyeliği</b> — bu denemeyi <b>online optik formdan</b> doldurman gerekir.
                </div>
              </div>
            ) : (
              <div className="notice" style={{ background: "var(--primary-soft)", textAlign: "left" }}>
                <KiIcon name="ki-calendar" size={18} style={{ color: "var(--primary)", flexShrink: 0 }} />
                <div style={{ flex: 1, fontSize: 12.5 }}>
                  <b>Yüz yüze</b> — {done.event.place}. Sınav günü kimliğinle hazır ol.
                </div>
              </div>
            )}
            <div className="row" style={{ gap: 8, marginTop: 4 }}>
              {done.mode === "online" && onGoOnline ? (
                <button type="button" className="btn btn-primary" onClick={() => { onGoOnline(); onClose(); }}>
                  <KiIcon name="ki-notepad-edit" size={15} />
                  Online optik forma git
                </button>
              ) : null}
              <button type="button" className="btn btn-light" onClick={() => setDone(null)}>
                Başka denemeye kayıt
              </button>
            </div>
          </div>
        ) : (
          <div className="modal-body" style={{ padding: 18, gap: 12, overflowY: "auto" }}>
            {plan ? (
              <div className="notice" style={{ background: "var(--surface-2)" }}>
                <span
                  className="stat-icon"
                  style={{
                    width: 34,
                    height: 34,
                    background: `color-mix(in srgb, ${plan.color} 14%, transparent)`,
                    color: plan.color,
                  }}
                >
                  <KiIcon name={plan.mode === "kargo" ? "ki-notepad-edit" : "ki-check-circle"} size={17} />
                </span>
                <div style={{ flex: 1, fontSize: 12.5 }}>
                  <b>Aktif üyeliğin: {plan.name}</b>
                  <div className="muted">
                    {plan.mode === "kargo"
                      ? "Denemeler kargoyla gelir, online optik doldurursun."
                      : "Denemeler paketine dahil, kurumda yüz yüze."}
                  </div>
                </div>
              </div>
            ) : (
              <div className="notice" style={{ background: "var(--warning-soft)" }}>
                <KiIcon name="ki-information-2" size={18} style={{ color: "var(--warning)", flexShrink: 0 }} />
                <div style={{ flex: 1, fontSize: 12.5 }}>
                  Deneme üyeliğin yok — her deneme için ayrı ücret.{" "}
                  <Link href="/student/billing" className="link-btn" style={{ display: "inline" }} onClick={onClose}>
                    Üyelik al
                  </Link>
                </div>
              </div>
            )}

            {loading ? (
              <p className="muted" style={{ fontSize: 13 }}>Yükleniyor…</p>
            ) : list.length === 0 ? (
              <p className="muted" style={{ fontSize: 13, textAlign: "center", padding: 24 }}>
                Yaklaşan deneme yok. Koçun yeni deneme eklediğinde burada görünür.
              </p>
            ) : (
              list.map((ev) => {
                const reg = registeredIds.has(ev.id);
                const covered = !!membership;
                return (
                  <div key={ev.id} className="lrow" style={{ alignItems: "center", padding: "13px 14px" }}>
                    <span className="lr-icon tone-primary" style={{ flexShrink: 0 }}>
                      <KiIcon name="ki-chart-simple" size={18} />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="lr-title">{ev.name}</div>
                      <div className="lr-meta">
                        <UkBadge tone="muted">{ev.examType}</UkBadge>
                        <span className="d">{ev.date} · {ev.time}</span>
                        <span className="d">{ev.place}</span>
                        <span className="d">{ev.questionCount} soru</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div
                        style={{
                          fontSize: 12.5,
                          fontWeight: 800,
                          marginBottom: 6,
                          color: covered ? "var(--success)" : "var(--text)",
                        }}
                      >
                        {covered ? "Paketine dahil" : formatTRY(ev.price)}
                      </div>
                      {reg ? (
                        <UkBadge tone="success">Kayıtlı</UkBadge>
                      ) : (
                        <button type="button" className="btn btn-primary btn-sm" onClick={() => void register(ev)}>
                          <KiIcon name="ki-plus" size={14} />
                          {covered ? "Kayıt ol" : "Kayıt ol & öde"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
