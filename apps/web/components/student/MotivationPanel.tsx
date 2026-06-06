"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { KiIcon } from "@/components/design/KiIcon";
import { UkBadge } from "@/components/design/UkBadge";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";

const BADGE_CATALOG = [
  { id: "streak-7", name: "7 Gun Seri", desc: "7 gun ust uste calisma", icon: "ki-flame" },
  { id: "topics-10", name: "10 Konu", desc: "10 konu tamamla", icon: "ki-book-open" },
  { id: "exam-up", name: "Net Artisi", desc: "Denemede gelisim goster", icon: "ki-chart-line-up" },
  { id: "homework", name: "Odev Ustasi", desc: "Haftalik odevleri bitir", icon: "ki-notepad-edit" },
  { id: "focus", name: "Odak", desc: "5 gun program takibi", icon: "ki-target" },
  { id: "star", name: "Yildiz", desc: "Koçtan olumlu geri bildirim", icon: "ki-star" },
];

type MotivationSummary = {
  enabled: boolean;
  streakDays: number;
  badges: string[];
};

function daysUntilYks(): number {
  const target = new Date("2026-06-14T09:00:00");
  const now = new Date();
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

export function MotivationPanel() {
  const [motivation, setMotivation] = useState<MotivationSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch("/api/student/motivation", { credentials: "same-origin" });
    if (response.ok) {
      const data = (await response.json()) as { motivation: MotivationSummary };
      setMotivation(data.motivation);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggleEnabled(enabled: boolean) {
    setIsSaving(true);
    const response = await fetch("/api/student/motivation/settings", {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled }),
    });
    setIsSaving(false);
    if (response.ok) {
      await load();
    }
  }

  if (isLoading) {
    return <p className="muted" style={{ fontSize: 13 }}>Yukleniyor...</p>;
  }

  if (!motivation?.enabled) {
    return (
      <div className="stack rise" data-testid="motivation-disabled">
        <UkPageHead
          title="Motivasyon"
          sub="Motivasyon ozellikleri kapali."
          actions={
            <button type="button" disabled={isSaving} className="btn btn-primary btn-sm" onClick={() => void toggleEnabled(true)}>
              Motivasyonu ac
            </button>
          }
        />
      </div>
    );
  }

  const daysLeft = daysUntilYks();
  const earned = new Set(motivation.badges);

  return (
    <div className="stack rise" data-testid="motivation-panel">
      <UkPageHead
        title="Motivasyon"
        sub="Seri, hedef ve rozetler"
        actions={
          <button type="button" disabled={isSaving} className="btn btn-light btn-sm" onClick={() => void toggleEnabled(false)}>
            Kapat
          </button>
        }
      />

      <div className="hero" style={{ padding: "24px 26px" }}>
        <div className="between" style={{ alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.78)", fontWeight: 600 }}>Calisma serisi</div>
            <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1, marginTop: 4 }} className="tnum">
              {motivation.streakDays}
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.85)", marginTop: 6 }}>
              Rekorun: 21 gun · Aktif seri devam ediyor
            </div>
          </div>
          <UkBadge tone="success">Aktif</UkBadge>
        </div>
      </div>

      <div className="grid col-main">
        <UkSection title="Hedefe Kalan" sub="YKS 2026">
          <div className="card-body" style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: 999,
                background: `conic-gradient(var(--primary) ${Math.max(8, 100 - daysLeft / 3.65)}%, var(--surface-3) 0)`,
                display: "grid",
                placeItems: "center",
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 999,
                  background: "var(--surface)",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 800,
                  fontSize: 22,
                }}
                className="tnum"
              >
                {daysLeft}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{daysLeft} gun kaldi</div>
              <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                Hedef siralaman: 50.000
              </div>
            </div>
          </div>
        </UkSection>

        <UkSection title="Koc notu" sub="Gunluk motivasyon">
          <div className="card-body hero" style={{ padding: "18px 20px" }}>
            <p style={{ fontSize: 13.5, lineHeight: 1.55, color: "rgba(255,255,255,.92)" }}>
              Duzenli calisma serin guzel gidiyor. Bu hafta zayif derslerine odaklan.
            </p>
          </div>
        </UkSection>
      </div>

      <UkSection title="Rozetler" sub="Kazanilan basarilar">
        <div className="card-body grid g-3" style={{ gap: 12 }}>
          {BADGE_CATALOG.map((badge) => {
            const hasBadge = earned.has(badge.name) || earned.has(badge.id);
            return (
              <div
                key={badge.id}
                className="card"
                style={{ opacity: hasBadge ? 1 : 0.55, boxShadow: "none" }}
              >
                <div className="card-pad" style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span className={`stat-icon tone-${hasBadge ? "primary" : "muted"}`} style={{ width: 40, height: 40, borderRadius: 12 }}>
                    <KiIcon name={badge.icon} size={18} />
                  </span>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700 }}>{badge.name}</div>
                    <div className="muted" style={{ fontSize: 12, marginTop: 3 }}>{badge.desc}</div>
                    {hasBadge ? <UkBadge tone="success">Kazanildi</UkBadge> : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </UkSection>

      <Link href="/student/dashboard" className="btn btn-light btn-sm w-fit">
        Dashboard
      </Link>
    </div>
  );
}
