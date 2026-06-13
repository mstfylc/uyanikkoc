"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { KiIcon } from "@/components/design/KiIcon";
import { UkBadge } from "@/components/design/UkBadge";
import { CoachRatingCard } from "@/components/student/CoachRatingCard";

const targetRankKey = "uk_target_rank";

const achievements = [
  { id: "streak-7", name: "7 Gün Seri", desc: "7 gün üst üste çalışma", icon: "ki-flame", color: "#f59e0b" },
  { id: "streak-14", name: "14 Gün Seri", desc: "2 hafta kesintisiz çalışma", icon: "ki-flash", color: "#f97316" },
  { id: "topics-10", name: "10 Konu", desc: "10 konu tamamla", icon: "ki-book-open", color: "#5b51c9" },
  { id: "topics-25", name: "25 Konu", desc: "25 konu tamamla", icon: "ki-book-square", color: "#2f80ed" },
  { id: "exam-up", name: "Net Artışı", desc: "Denemede gelişim göster", icon: "ki-chart-line-up", color: "#10a37f" },
  { id: "deneme-3", name: "3 Deneme", desc: "3 deneme çöz", icon: "ki-notepad-edit", color: "#b7791f" },
  { id: "homework", name: "Ödev Ustası", desc: "Haftalık ödevleri bitir", icon: "ki-check-circle", color: "#14b8a6" },
  { id: "focus", name: "Odak", desc: "5 gün program takibi", icon: "ki-target", color: "#8b5cf6" },
  { id: "schedule", name: "Program", desc: "Düzenli çalışma bloğu", icon: "ki-calendar", color: "#0ea5e9" },
  { id: "star", name: "Yıldız", desc: "Koçundan olumlu geri bildirim", icon: "ki-star", color: "#eab308" },
  { id: "coach-note", name: "Koç Notu", desc: "Günlük motivasyon oku", icon: "ki-message-text", color: "#ec4899" },
  { id: "perfect-week", name: "Mükemmel Hafta", desc: "Haftalık hedefe ulaş", icon: "ki-medal-star", color: "#22c55e" },
];

type MotivationSummary = {
  enabled: boolean;
  streakDays: number;
  badges: string[];
};

function loadTargetRank() {
  if (typeof window === "undefined") return "50.000";
  return localStorage.getItem(targetRankKey) || "50.000";
}

function daysUntilYks() {
  const target = new Date("2026-06-20T10:15:00");
  const now = new Date();
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

function PageHead({ title, sub, actions }: { title: string; sub: string; actions?: React.ReactNode }) {
  return (
    <div className="between" style={{ alignItems: "flex-end", gap: 16 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.02em" }}>{title}</h1>
        <div className="muted" style={{ fontSize: 13, marginTop: 4, fontWeight: 500 }}>{sub}</div>
      </div>
      {actions}
    </div>
  );
}

function Section({
  title,
  sub,
  action,
  children,
}: {
  title: string;
  sub: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="card">
      <div className="card-head">
        <div>
          <h3>{title}</h3>
          <p className="sub">{sub}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Ring({
  value,
  size = 116,
  stroke = 11,
  color = "var(--primary)",
  track = "var(--surface-3)",
  label,
  sub,
  big,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  label?: string | number;
  sub?: string;
  big?: boolean;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.max(0, Math.min(100, value)) / 100) * circumference;

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
        <div>
          <div className="tnum" style={{ fontSize: big ? 34 : 24, fontWeight: 800, lineHeight: 1 }}>{label ?? value}</div>
          {sub ? <div className="muted" style={{ fontSize: big ? 12 : 11, marginTop: 3, fontWeight: 700 }}>{sub}</div> : null}
        </div>
      </div>
    </div>
  );
}

function TargetRankModal({
  open,
  current,
  onClose,
  onSave,
}: {
  open: boolean;
  current: string;
  onClose: () => void;
  onSave: (rank: string) => void;
}) {
  const [value, setValue] = useState(current);

  useEffect(() => {
    if (open) setValue(current);
  }, [current, open]);

  if (!open) return null;

  const clean = value.replace(/[^\d]/g, "");
  const formatted = clean ? Number(clean).toLocaleString("tr-TR") : "";

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 420 }} onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div className="row" style={{ gap: 11 }}>
            <span className="stat-icon tone-primary" style={{ width: 38, height: 38 }}>
              <KiIcon name="ki-target" size={18} />
            </span>
            <div>
              <h3 style={{ fontSize: 15.5, fontWeight: 800 }}>Hedef Sıralaman</h3>
              <div className="muted" style={{ fontSize: 12 }}>YKS 2026 için hedeflediğin sıralama</div>
            </div>
          </div>
          <button type="button" className="icon-btn" style={{ width: 36, height: 36 }} onClick={onClose} aria-label="Kapat">
            <KiIcon name="ki-cross" size={18} />
          </button>
        </div>
        <div className="modal-body" style={{ padding: 20, gap: 14 }}>
          <div className="field">
            <label className="label">Hedef sıralama (ilk ...)</label>
            <div className="input-icon">
              <input
                className="input tnum"
                inputMode="numeric"
                placeholder="50.000"
                value={formatted}
                onChange={(event) => setValue(event.target.value)}
                autoFocus
              />
              <span className="muted" style={{ fontSize: 12, fontWeight: 700 }}>. kişi</span>
            </div>
          </div>
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            {["10.000", "25.000", "50.000", "100.000"].map((preset) => (
              <button key={preset} type="button" className="chip" style={{ cursor: "pointer" }} onClick={() => setValue(preset)}>
                İlk {preset}
              </button>
            ))}
          </div>
        </div>
        <div className="modal-foot">
          <button type="button" className="btn btn-light" onClick={onClose}>Vazgeç</button>
          <button type="button" className="btn btn-primary" disabled={!clean} onClick={() => onSave(Number(clean).toLocaleString("tr-TR"))} style={{ marginLeft: "auto", opacity: clean ? 1 : 0.5 }}>
            <KiIcon name="ki-check" size={16} />
            Kaydet
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function MotivationPanel() {
  const [motivation, setMotivation] = useState<MotivationSummary | null>(null);
  const [dailyNote, setDailyNote] = useState<string | null>(null);
  const [noteFrom, setNoteFrom] = useState<string | null>(null);
  const [rank, setRank] = useState("50.000");
  const [editRank, setEditRank] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    const [motivationResponse, latestResponse] = await Promise.all([
      fetch("/api/student/motivation", { credentials: "same-origin" }),
      fetch("/api/student/motivation/latest", { credentials: "same-origin" }),
    ]);
    if (motivationResponse.ok) {
      const data = (await motivationResponse.json()) as { motivation: MotivationSummary };
      setMotivation(data.motivation);
    }
    if (latestResponse.ok) {
      const data = (await latestResponse.json()) as { message: { body: string; from?: string } | null };
      setDailyNote(data.message?.body ?? null);
      setNoteFrom(data.message?.from ?? null);
    }
    setRank(loadTargetRank());
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
    return <p className="muted" style={{ fontSize: 13 }}>Yükleniyor...</p>;
  }

  if (!motivation?.enabled) {
    return (
      <div className="stack rise" data-testid="motivation-disabled">
        <PageHead
          title="Motivasyon"
          sub="Motivasyon özellikleri kapalı."
          actions={
            <button type="button" disabled={isSaving} className="btn btn-primary btn-sm" onClick={() => void toggleEnabled(true)}>
              Motivasyonu aç
            </button>
          }
        />
      </div>
    );
  }

  const daysLeft = daysUntilYks();
  const earned = new Set(motivation.badges);
  const earnedCount = achievements.filter((item) => earned.has(item.id) || earned.has(item.name)).length;

  return (
    <div className="stack rise" data-testid="motivation-panel">
      <PageHead
        title="Motivasyon"
        sub="Serini koru, rozetlerini topla, hedefe odaklan"
        actions={
          <button type="button" disabled={isSaving} className="btn btn-light btn-sm" onClick={() => void toggleEnabled(false)}>
            Kapat
          </button>
        }
      />

      <div className="grid col-main">
        <div className="hero" style={{ display: "flex", flexDirection: "column", justifyContent: "center", minHeight: 200 }}>
          <div className="between" style={{ alignItems: "flex-start", gap: 16 }}>
            <div>
              <div className="row" style={{ gap: 8 }}>
                <KiIcon name="ki-flame" size={22} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,.85)" }}>Çalışma Serisi</span>
              </div>
              <div className="row" style={{ alignItems: "flex-end", gap: 12, marginTop: 14 }}>
                <div style={{ fontSize: 60, fontWeight: 800, letterSpacing: "-.03em", lineHeight: 1 }} className="tnum">{motivation.streakDays}</div>
                <div style={{ paddingBottom: 8 }}>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>gün üst üste</div>
                  <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.75)" }}>Rekorun: 21 gün</div>
                </div>
              </div>
            </div>
            <span className="badge" style={{ background: "rgba(255,255,255,.16)", color: "#fff", height: 26 }}>
              <KiIcon name="ki-flash" size={14} />
              Aktif
            </span>
          </div>
          <div className="glass" style={{ marginTop: 18, padding: "12px 14px", fontSize: 13, lineHeight: 1.5 }}>
            Bu hafta <b style={{ color: "#fff" }}>18 saat</b> çalıştın — geçen haftaya göre <b style={{ color: "#fff" }}>+3.2 saat</b>. Aynı tempoda devam!
          </div>
        </div>

        <Section title="Hedefe Kalan" sub="YKS 2026">
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center", textAlign: "center" }}>
            <Ring value={Math.round(((90 - daysLeft) / 90) * 100)} size={148} stroke={13} color="var(--primary)" label={daysLeft} sub="gün kaldı" big />
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700 }}>20 Haz 2026 · Cumartesi</div>
              <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>TYT oturumu 10:15'te başlıyor</div>
            </div>
            <button type="button" className="btn btn-light" style={{ width: "100%" }} onClick={() => setEditRank(true)}>
              <KiIcon name="ki-target" size={16} />
              Hedef sıralaman: {rank}
              <KiIcon name="ki-setting-2" size={14} style={{ marginLeft: "auto", color: "var(--faint)" }} />
            </button>
          </div>
        </Section>
      </div>

      <TargetRankModal
        open={editRank}
        current={rank}
        onClose={() => setEditRank(false)}
        onSave={(value) => {
          setRank(value);
          localStorage.setItem(targetRankKey, value);
          setEditRank(false);
        }}
      />

      <CoachRatingCard />

      <Section
        title="Rozetlerin"
        sub={`${earnedCount}/${achievements.length} kazanıldı`}
        action={<button type="button" className="link-btn">Tümü<KiIcon name="ki-arrow-right" size={14} /></button>}
      >
        <div className="card-body">
          <div className="medal-grid">
            {achievements.map((achievement) => {
              const hasAchievement = earned.has(achievement.id) || earned.has(achievement.name);
              return (
                <div key={achievement.id} className={`medal${hasAchievement ? " earned" : " locked"}`} title={achievement.desc}>
                  <span
                    className="m-ic"
                    style={
                      hasAchievement
                        ? {
                            background: `radial-gradient(circle at 34% 26%, color-mix(in srgb, ${achievement.color} 62%, #fff), ${achievement.color})`,
                            boxShadow: `0 9px 20px -7px ${achievement.color}`,
                          }
                        : undefined
                    }
                  >
                    <KiIcon name={achievement.icon} size={26} />
                    {hasAchievement ? (
                      <span className="m-check"><KiIcon name="ki-check" size={12} /></span>
                    ) : (
                      <span className="m-lock"><KiIcon name="ki-lock" size={11} /></span>
                    )}
                  </span>
                  <div className="m-name">{achievement.name}</div>
                  <div className="m-desc">{achievement.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      <div className="card" style={{ background: "linear-gradient(120deg, color-mix(in srgb, var(--primary) 7%, var(--surface)), var(--surface))" }}>
        <div className="card-pad" style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <span className="ai-orb" style={{ width: 52, height: 52 }}>
            <KiIcon name="ki-heart" size={24} />
          </span>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-.01em" }}>
              "{dailyNote ?? "Bugün attığın küçük adım, sınav günü en büyük farkın olacak."}"
            </div>
            <div className="muted" style={{ fontSize: 12.5, marginTop: 4 }}>{noteFrom ? `Koçun ${noteFrom}'dan motivasyon mesajı` : "Koçundan motivasyon mesajı"}</div>
          </div>
        </div>
      </div>

      <UkBadge tone="success">Motivasyon aktif</UkBadge>
    </div>
  );
}
