/* ============================================================
   Yönetim Paneli — paylaşılan bileşenler
   ============================================================ */

/* sayfa başlığı + aksiyon */
function PageHead({ title, sub, actions }) {
  return (
    <div className="between admin-head" style={{ alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
      <div>
        <h1 style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-.02em" }}>{title}</h1>
        {sub ? <p className="muted" style={{ fontSize: 13.5, marginTop: 4 }}>{sub}</p> : null}
      </div>
      {actions ? <div className="row" style={{ gap: 9, flexWrap: "wrap" }}>{actions}</div> : null}
    </div>
  );
}

/* sekme şeridi */
function Tabs({ tabs, active, onChange }) {
  return (
    <div className="seg-tabs">
      {tabs.map((t) => (
        <button key={t.k} className={`seg-tab${active === t.k ? " on" : ""}`} onClick={() => onChange(t.k)}>
          {t.icon ? <Icon name={t.icon} size={16} /> : null}{t.label}
          {t.count != null ? <span className="tnum" style={{ marginLeft: 4, opacity: .6 }}>{t.count}</span> : null}
        </button>
      ))}
    </div>
  );
}

/* durum rozeti */
function StatusBadge({ status, sm }) {
  const m = statusMeta(status);
  return <span className={`badge badge-${m.tone}`} style={sm ? { height: 21, fontSize: 11 } : undefined}>
    {status === "active" ? <span className="dot-live" /> : null}{m.label}
  </span>;
}

/* kapasite ölçer */
function Meter({ icon, label, used, total, unit, unlimited }) {
  const pct = unlimited ? 8 : Math.min(100, Math.round((used / total) * 100));
  const cls = pct >= 92 ? "danger" : pct >= 75 ? "warn" : "";
  const color = pct >= 92 ? "var(--danger)" : pct >= 75 ? "var(--warning)" : "var(--primary)";
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), 120); return () => clearTimeout(t); }, [pct]);
  return (
    <div className="meter">
      <div className="meter-top">
        <span className="mk">{icon ? <Icon name={icon} size={15} /> : null}{label}</span>
        <span className="mv tnum">{unlimited ? <>{used} <span className="muted">/ sınırsız</span></> : <>{used}<span className="muted"> / {total}{unit ? " " + unit : ""}</span></>}</span>
      </div>
      <div className={`meter-bar ${cls}`}><span style={{ width: w + "%", background: color }} /></div>
    </div>
  );
}

/* kurum/koç logo avatarı */
function OrgLogo({ name, tone, size = 40 }) {
  const initials = (name || "?").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return <div className="org-logo" style={{ width: size, height: size, background: tone || "var(--primary)", fontSize: size * 0.36, borderRadius: size * 0.28 }}>{initials}</div>;
}

/* modül erişim grid'i (düzenlenebilir) */
function ModuleGrid({ modules, onToggle, readOnly }) {
  return (
    <div className="mod-grid">
      {MODULES.map((m) => {
        const on = !!modules[m.key];
        return (
          <div key={m.key} className={`mod-card${on ? " on" : ""}`}>
            <span className="mod-ic"><Icon name={m.icon} size={20} /></span>
            <div className="mod-body">
              <b>{m.name}{m.premium ? <span className="mod-prem">Premium</span> : null}</b>
              <p>{m.desc}</p>
            </div>
            {readOnly
              ? <Icon name={on ? "checkCircle" : "alert"} size={18} style={{ color: on ? "var(--success)" : "var(--faint)", flexShrink: 0 }} />
              : <button className={`switch${on ? " on" : ""}`} onClick={() => onToggle(m.key)} aria-label={m.name}><span /></button>}
          </div>
        );
      })}
    </div>
  );
}

/* basit donut (yüzde dilimleri) */
function Donut({ slices, size = 132, stroke = 16, center }) {
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
          const el = <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.color} strokeWidth={stroke}
            strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-acc} style={{ transition: "stroke-dasharray .9s cubic-bezier(.22,1,.36,1)" }} />;
          acc += len; return el;
        })}
      </svg>
      {center ? <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center", lineHeight: 1.1 }}>
        <div><div className="tnum" style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.02em" }}>{center.v}</div><div className="muted" style={{ fontSize: 11, fontWeight: 600 }}>{center.l}</div></div>
      </div> : null}
    </div>
  );
}

/* kurum lisans özet hero */
function LicenseHero({ org }) {
  const p = orgPlanById(org.planId);
  const dleft = daysLeft(org.renewsAt);
  const tone = org.status === "overdue" ? "danger" : org.status === "expiring" ? "warn" : org.status === "trial" ? "info" : "";
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
          <p className="lh-sub">{org.city} · {org.cycle === "annual" ? "Yıllık" : "Aylık"} lisans · {TRY(org.feeMonthly)}/ay</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="tnum" style={{ fontSize: 30, fontWeight: 800, lineHeight: 1 }}>{dleft < 0 ? 0 : dleft}</div>
          <div style={{ fontSize: 11.5, opacity: .85, fontWeight: 600 }}>{org.status === "overdue" ? "gün gecikti" : "gün kaldı"}</div>
        </div>
      </div>
      <div className="lh-stats">
        <div className="lh-stat"><div className="v tnum">{org.seats.used}<span style={{ opacity: .6, fontSize: 16 }}>/{org.seats.total}</span></div><div className="l">Öğrenci koltuğu · %{seatPct}</div></div>
        <div className="lh-stat"><div className="v tnum">{org.coaches.used}<span style={{ opacity: .6, fontSize: 16 }}>/{org.coaches.total}</span></div><div className="l">Koç</div></div>
        {org.type === "franchise" ? <div className="lh-stat"><div className="v tnum">{org.branches.length}<span style={{ opacity: .6, fontSize: 16 }}>/{p.branches}</span></div><div className="l">Şube</div></div> : null}
        <div className="lh-stat"><div className="v">{fmtShort(org.renewsAt)}</div><div className="l">Yenileme tarihi</div></div>
      </div>
    </div>
  );
}

/* basit yatay bar listesi (karşılaştırma) */
function RankBars({ items, max, fmt, color = "var(--primary)" }) {
  const top = max || Math.max(...items.map((i) => i.v), 1);
  return (
    <div className="stack" style={{ gap: 12 }}>
      {items.map((it, i) => (
        <div key={i}>
          <div className="between" style={{ marginBottom: 6 }}>
            <span className="row" style={{ gap: 9, fontSize: 13, fontWeight: 600 }}>{it.icon}{it.l}</span>
            <span className="tnum" style={{ fontSize: 13, fontWeight: 700 }}>{fmt ? fmt(it.v) : it.v}</span>
          </div>
          <div className="meter-bar"><span style={{ width: (it.v / top) * 100 + "%", background: it.color || color }} /></div>
        </div>
      ))}
    </div>
  );
}

/* boş durum */
function EmptyState({ icon, title, sub }) {
  return (
    <div className="dropzone" style={{ cursor: "default", borderStyle: "solid" }}>
      <Icon name={icon || "search"} size={26} style={{ color: "var(--faint)" }} />
      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-2)" }}>{title}</div>
      {sub ? <div className="muted" style={{ fontSize: 12.5 }}>{sub}</div> : null}
    </div>
  );
}

/* onay modalı */
function ConfirmModal({ open, title, body, confirmLabel, tone = "primary", onConfirm, onClose }) {
  if (!open) return null;
  return ReactDOM.createPortal((
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 430 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-body" style={{ padding: 24, textAlign: "center", gap: 12 }}>
          <span className={`stat-icon tone-${tone === "danger" ? "danger" : "primary"}`} style={{ width: 48, height: 48, margin: "0 auto" }}>
            <Icon name={tone === "danger" ? "alert" : "checkCircle"} size={24} />
          </span>
          <h3 style={{ fontSize: 17, fontWeight: 800 }}>{title}</h3>
          <p className="muted" style={{ fontSize: 13, lineHeight: 1.5 }}>{body}</p>
        </div>
        <div className="modal-foot">
          <button className="btn btn-light" onClick={onClose}>Vazgeç</button>
          <button className={`btn ${tone === "danger" ? "btn-danger" : "btn-primary"}`} style={{ marginLeft: "auto" }} onClick={() => { onConfirm(); onClose(); }}>{confirmLabel || "Onayla"}</button>
        </div>
      </div>
    </div>
  ), document.body);
}

Object.assign(window, { PageHead, Tabs, StatusBadge, Meter, OrgLogo, ModuleGrid, Donut, LicenseHero, RankBars, EmptyState, ConfirmModal });
