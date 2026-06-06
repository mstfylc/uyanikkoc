// Admin tasarım kiti — Uk tasarım sistemine ek, panele özel bileşenler.
// apps/web/components/admin/AdminKit.tsx
// Prototip kaynağı: admin/admin-ui.jsx + src/ui.jsx (Ring/Donut/RankBars).
"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { UkIcon } from "@/components/design/UkIcon";
import type { UkIconName } from "@/lib/design/icon-paths";
import { daysLeft, fmtShort, tl } from "@/lib/admin/format";
import { MODULES, orgPlanById, statusMeta } from "@/lib/admin/pricing";
import type { LicenseStatus, ModuleFlags, ModuleKey, Org } from "@/lib/admin/types";

/* ---- Icon: prototipteki <Icon name="cap"/> ile birebir (UkIcon sarmalayıcı) ---- */
export function Icon({
  name,
  size = 20,
  fill,
  style,
  className,
}: {
  name: string;
  size?: number;
  fill?: boolean;
  style?: CSSProperties;
  className?: string;
}) {
  return <UkIcon name={name as UkIconName} size={size} fill={fill} style={style} className={className} />;
}

/* ---- istatistik kartı (prototip StatCard ile birebir; doğrudan UkIcon adı) ---- */
export function StatCard({
  icon,
  tone = "primary",
  value,
  label,
  delta,
  deltaDir = "up",
}: {
  icon: string;
  tone?: "primary" | "success" | "warning" | "danger" | "info";
  value: ReactNode;
  label: string;
  delta?: string;
  deltaDir?: "up" | "down" | "flat";
}) {
  return (
    <div className="card stat">
      <div className="card-pad">
        <div className="stat-top">
          <span className={`stat-icon tone-${tone}`}>
            <Icon name={icon} size={22} />
          </span>
          {delta != null ? (
            <span className={`delta ${deltaDir}`}>
              <Icon name={deltaDir === "down" ? "arrowDown" : deltaDir === "flat" ? "trend" : "arrowUp"} size={13} />
              {delta}
            </span>
          ) : null}
        </div>
        <div>
          <div className="stat-value tnum">{value}</div>
          <div className="stat-label">{label}</div>
        </div>
      </div>
    </div>
  );
}

/* ---- sayfa içi sekme şeridi ---- */
export type TabDef = { k: string; label: string; icon?: string; count?: number };
export function AdminTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: TabDef[];
  active: string;
  onChange: (k: string) => void;
}) {
  return (
    <div className="seg-tabs">
      {tabs.map((t) => (
        <button
          key={t.k}
          type="button"
          className={`seg-tab${active === t.k ? " on" : ""}`}
          onClick={() => onChange(t.k)}
        >
          {t.icon ? <Icon name={t.icon} size={16} /> : null}
          {t.label}
          {t.count != null ? (
            <span className="tnum" style={{ marginLeft: 4, opacity: 0.6 }}>
              {t.count}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

/* ---- durum rozeti ---- */
export function StatusBadge({ status, sm }: { status: LicenseStatus; sm?: boolean }) {
  const m = statusMeta(status);
  return (
    <span className={`badge badge-${m.tone}`} style={sm ? { height: 21, fontSize: 11 } : undefined}>
      {status === "active" ? <span className="dot-live" /> : null}
      {m.label}
    </span>
  );
}

/* ---- öncelik rozeti (görev) ---- */
export function PriorityBadge({ priority }: { priority: "low" | "med" | "high" }) {
  const map = {
    high: { tone: "danger", label: "Yüksek" },
    med: { tone: "warning", label: "Orta" },
    low: { tone: "info", label: "Düşük" },
  } as const;
  const m = map[priority];
  return (
    <span className={`badge badge-${m.tone}`} style={{ height: 21, fontSize: 11 }}>
      {m.label}
    </span>
  );
}

/* ---- kapasite ölçer ---- */
export function Meter({
  icon,
  label,
  used,
  total,
  unit,
  unlimited,
}: {
  icon?: string;
  label: string;
  used: number;
  total: number;
  unit?: string;
  unlimited?: boolean;
}) {
  const pct = unlimited ? 8 : Math.min(100, Math.round((used / total) * 100));
  const cls = pct >= 92 ? "danger" : pct >= 75 ? "warn" : "";
  const color = pct >= 92 ? "var(--danger)" : pct >= 75 ? "var(--warning)" : "var(--primary)";
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(pct), 120);
    return () => clearTimeout(t);
  }, [pct]);
  return (
    <div className="meter">
      <div className="meter-top">
        <span className="mk">
          {icon ? <Icon name={icon} size={15} /> : null}
          {label}
        </span>
        <span className="mv tnum">
          {unlimited ? (
            <>
              {used} <span className="muted">/ sınırsız</span>
            </>
          ) : (
            <>
              {used}
              <span className="muted">
                {" "}
                / {total}
                {unit ? " " + unit : ""}
              </span>
            </>
          )}
        </span>
      </div>
      <div className={`meter-bar ${cls}`}>
        <span style={{ width: w + "%", background: color }} />
      </div>
    </div>
  );
}

/* ---- kurum / koç logo avatarı ---- */
export function OrgLogo({ name, tone, size = 40 }: { name: string; tone?: string; size?: number }) {
  const initials = (name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <div
      className="org-logo"
      style={{
        width: size,
        height: size,
        background: tone || "var(--primary)",
        fontSize: size * 0.36,
        borderRadius: size * 0.28,
      }}
    >
      {initials}
    </div>
  );
}

/* ---- modül erişim grid'i (düzenlenebilir / salt-okunur) ---- */
export function ModuleGrid({
  modules,
  onToggle,
  readOnly,
}: {
  modules: ModuleFlags;
  onToggle?: (key: ModuleKey) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="mod-grid">
      {MODULES.map((m) => {
        const on = !!modules[m.key];
        return (
          <div key={m.key} className={`mod-card${on ? " on" : ""}`}>
            <span className="mod-ic">
              <Icon name={m.icon} size={20} />
            </span>
            <div className="mod-body">
              <b>
                {m.name}
                {m.premium ? <span className="mod-prem">Premium</span> : null}
              </b>
              <p>{m.desc}</p>
            </div>
            {readOnly ? (
              <Icon
                name={on ? "checkCircle" : "alert"}
                size={18}
                style={{ color: on ? "var(--success)" : "var(--faint)", flexShrink: 0 }}
              />
            ) : (
              <button
                type="button"
                className={`switch${on ? " on" : ""}`}
                onClick={() => onToggle?.(m.key)}
                aria-label={m.name}
              >
                <span />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---- donut (yüzde dilimleri) ---- */
export type DonutSlice = { v: number; color: string; l?: string };
export function Donut({
  slices,
  size = 132,
  stroke = 16,
  center,
}: {
  slices: DonutSlice[];
  size?: number;
  stroke?: number;
  center?: { v: ReactNode; l: string };
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const total = slices.reduce((a, s) => a + s.v, 0) || 1;
  let acc = 0;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} />
        {slices.map((s, i) => {
          const len = (s.v / total) * c;
          const el = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-acc}
              style={{ transition: "stroke-dasharray .9s cubic-bezier(.22,1,.36,1)" }}
            />
          );
          acc += len;
          return el;
        })}
      </svg>
      {center ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            textAlign: "center",
            lineHeight: 1.1,
          }}
        >
          <div>
            <div className="tnum" style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.02em" }}>
              {center.v}
            </div>
            <div className="muted" style={{ fontSize: 11, fontWeight: 600 }}>
              {center.l}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ---- progress ring ---- */
export function Ring({
  value,
  size = 116,
  stroke = 11,
  color = "var(--primary)",
  label,
  sub,
  big,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  label: string;
  sub?: string;
  big?: boolean;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const [v, setV] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setV(value), 120);
    return () => clearTimeout(t);
  }, [value]);
  const off = c - (v / 100) * c;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(.22,1,.36,1)" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center", lineHeight: 1.1 }}>
        <div>
          <div className="tnum" style={{ fontSize: big ? 28 : 23, fontWeight: 800, letterSpacing: "-.02em" }}>
            {label}
          </div>
          {sub ? <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>{sub}</div> : null}
        </div>
      </div>
    </div>
  );
}

/* ---- yatay sıralama barları ---- */
export type RankItem = { l: string; v: number; color?: string; icon?: ReactNode };
export function RankBars({
  items,
  max,
  fmt,
  color = "var(--primary)",
}: {
  items: RankItem[];
  max?: number;
  fmt?: (v: number) => ReactNode;
  color?: string;
}) {
  const top = max || Math.max(...items.map((i) => i.v), 1);
  return (
    <div className="stack" style={{ gap: 12 }}>
      {items.map((it, i) => (
        <div key={i}>
          <div className="between" style={{ marginBottom: 6 }}>
            <span className="row" style={{ gap: 9, fontSize: 13, fontWeight: 600 }}>
              {it.icon}
              {it.l}
            </span>
            <span className="tnum" style={{ fontSize: 13, fontWeight: 700 }}>
              {fmt ? fmt(it.v) : it.v}
            </span>
          </div>
          <div className="meter-bar">
            <span style={{ width: (it.v / top) * 100 + "%", background: it.color || color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---- legend (donut yanı) ---- */
export function Legend({ items }: { items: { l: string; color: string; v: ReactNode }[] }) {
  return (
    <div className="legend" style={{ width: "100%" }}>
      {items.map((s, i) => (
        <div key={i} className="legend-item">
          <span className="sw" style={{ background: s.color }} />
          <span>{s.l}</span>
          <span className="lv tnum">{s.v}</span>
        </div>
      ))}
    </div>
  );
}

/* ---- uyarı şeridi ---- */
export function AlertStrip({
  tone = "warn",
  icon = "alert",
  title,
  body,
  action,
}: {
  tone?: "warn" | "danger" | "info";
  icon?: string;
  title: ReactNode;
  body?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className={`alert-strip ${tone === "info" ? "" : tone}`}>
      <span className="as-ic">
        <Icon name={icon} size={18} />
      </span>
      <div style={{ flex: 1 }}>
        <b style={{ fontSize: 13.5 }}>{title}</b>
        {body ? <div className="muted" style={{ fontSize: 12.5 }}>{body}</div> : null}
      </div>
      {action}
    </div>
  );
}

/* ---- yıldız satırı (geri bildirim puanı) ---- */
export function StarRow({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="row" style={{ gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Icon
          key={n}
          name="star"
          size={size}
          fill={n <= Math.round(value)}
          style={{ color: n <= Math.round(value) ? "var(--warning)" : "var(--surface-3)" }}
        />
      ))}
    </span>
  );
}

/* ---- büyük lisans özet hero ---- */
export function LicenseHero({ org }: { org: Org }) {
  const p = orgPlanById(org.planId);
  const dleft = daysLeft(org.renewsAt);
  const tone =
    org.status === "overdue" ? "danger" : org.status === "expiring" ? "warn" : org.status === "trial" ? "info" : "";
  const seatPct = Math.round((org.seats.used / org.seats.total) * 100);
  return (
    <div className={`lic-hero ${tone}`}>
      <div className="lh-glow" />
      <div className="lh-top">
        <div>
          <div className="row" style={{ gap: 10, marginBottom: 4 }}>
            <span className="lh-badge">{org.type === "franchise" ? "Franchise" : "Tek Kurum"}</span>
            <span className="lh-badge">{p.name}</span>
          </div>
          <h2>{org.name}</h2>
          <p className="lh-sub">
            {org.city} · {org.cycle === "annual" ? "Yıllık" : "Aylık"} lisans · {tl(org.feeMonthly)}/ay
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="tnum" style={{ fontSize: 30, fontWeight: 800, lineHeight: 1 }}>
            {dleft < 0 ? 0 : dleft}
          </div>
          <div style={{ fontSize: 11.5, opacity: 0.85, fontWeight: 600 }}>
            {org.status === "overdue" ? "gün gecikti" : "gün kaldı"}
          </div>
        </div>
      </div>
      <div className="lh-stats">
        <div className="lh-stat">
          <div className="v tnum">
            {org.seats.used}
            <span style={{ opacity: 0.6, fontSize: 16 }}>/{org.seats.total}</span>
          </div>
          <div className="l">Öğrenci koltuğu · %{seatPct}</div>
        </div>
        <div className="lh-stat">
          <div className="v tnum">
            {org.coaches.used}
            <span style={{ opacity: 0.6, fontSize: 16 }}>/{org.coaches.total}</span>
          </div>
          <div className="l">Koç</div>
        </div>
        {org.type === "franchise" ? (
          <div className="lh-stat">
            <div className="v tnum">
              {org.branches.length}
              <span style={{ opacity: 0.6, fontSize: 16 }}>/{p.branches}</span>
            </div>
            <div className="l">Şube</div>
          </div>
        ) : null}
        <div className="lh-stat">
          <div className="v">{fmtShort(org.renewsAt)}</div>
          <div className="l">Yenileme tarihi</div>
        </div>
      </div>
    </div>
  );
}

/* ---- boş durum ---- */
export function EmptyState({ icon, title, sub }: { icon?: string; title: string; sub?: string }) {
  return (
    <div className="empty-state">
      <Icon name={icon || "search"} size={26} style={{ color: "var(--faint)" }} />
      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-2)" }}>{title}</div>
      {sub ? <div className="muted" style={{ fontSize: 12.5 }}>{sub}</div> : null}
    </div>
  );
}

/* ---- onay modalı ---- */
export function ConfirmModal({
  open,
  title,
  body,
  confirmLabel,
  tone = "primary",
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  body: ReactNode;
  confirmLabel?: string;
  tone?: "primary" | "danger";
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 430 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-body" style={{ padding: 24, textAlign: "center", gap: 12, display: "flex", flexDirection: "column" }}>
          <span
            className={`stat-icon tone-${tone === "danger" ? "danger" : "primary"}`}
            style={{ width: 48, height: 48, margin: "0 auto" }}
          >
            <Icon name={tone === "danger" ? "alert" : "checkCircle"} size={24} />
          </span>
          <h3 style={{ fontSize: 17, fontWeight: 800 }}>{title}</h3>
          <p className="muted" style={{ fontSize: 13, lineHeight: 1.5 }}>
            {body}
          </p>
        </div>
        <div className="modal-foot">
          <button type="button" className="btn btn-light" onClick={onClose}>
            Vazgeç
          </button>
          <button
            type="button"
            className={`btn ${tone === "danger" ? "btn-danger" : "btn-primary"}`}
            style={{ marginLeft: "auto" }}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel || "Onayla"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
