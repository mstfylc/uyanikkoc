/* Shared UI primitives */
const { useState, useEffect, useRef } = React;

/* ============================================================
   Avatar — baş harf / hazır ikon / yüklenen foto.
   Foto cihazda küçültülüp localStorage'a yazılır (DB'ye yük olmaz).
   ============================================================ */
const AVATAR_KEY = "uk_avatars_v1";
const AVATAR_ICONS = ["robot", "alien", "astronaut", "hero", "dragon", "ghost", "cat", "dog", "dino", "skull", "shades", "wizard", "starface", "pizza", "rocket", "gamepad", "headphones", "music", "ball", "crown", "gem", "trophy", "medal", "bulb", "smile", "palette", "atom", "pencil", "star", "flame", "target", "cap", "ai"];
const AVATAR_COLORS = ["#5b6cff", "#10b981", "#f59e0b", "#0ea5e9", "#8b5cf6", "#ef4444", "#ec4899", "#14b8a6"];
let _avatars = (() => { try { return JSON.parse(localStorage.getItem(AVATAR_KEY)) || {}; } catch (e) { return {}; } })();
const _avListeners = new Set();
function getAvatar(key) { return key ? _avatars[key] : null; }
function setAvatar(key, val) { if (!key) return; _avatars = { ..._avatars, [key]: val }; try { localStorage.setItem(AVATAR_KEY, JSON.stringify(_avatars)); } catch (e) {} _avListeners.forEach((l) => l()); }
function clearAvatar(key) { if (!key) return; const n = { ..._avatars }; delete n[key]; _avatars = n; try { localStorage.setItem(AVATAR_KEY, JSON.stringify(_avatars)); } catch (e) {} _avListeners.forEach((l) => l()); }
function useAvatar(key) {
  const [, force] = React.useState(0);
  React.useEffect(() => { const l = () => force((x) => x + 1); _avListeners.add(l); return () => _avListeners.delete(l); }, []);
  return getAvatar(key);
}
/* foto → küçük dataURL (kare kırpma + en çok `max` px) */
function avatarFromFile(file, cb, max = 160) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2, sy = (img.height - side) / 2;
      const out = Math.min(max, side);
      const cv = document.createElement("canvas"); cv.width = out; cv.height = out;
      const ctx = cv.getContext("2d");
      ctx.drawImage(img, sx, sy, side, side, 0, 0, out, out);
      cb(cv.toDataURL("image/jpeg", 0.82));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function Avatar({ name, size = 38, src, tone, avatarKey }) {
  const stored = useAvatar(avatarKey);
  const av = stored || (src ? { type: "photo", src } : null);
  const initials = (name || "?")
    .split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  if (av && av.type === "photo" && av.src) {
    return <div className="avatar" style={{ width: size, height: size, padding: 0, overflow: "hidden" }}>
      <img src={av.src} alt={name || ""} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    </div>;
  }
  if (av && av.type === "icon" && av.icon) {
    return <div className="avatar" style={{ width: size, height: size, background: av.color || "var(--primary)", color: "#fff" }}>
      <Icon name={av.icon} size={size * 0.5} />
    </div>;
  }
  const bg = tone ? { background: tone } : undefined;
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.38, ...bg }}>
      {initials}
    </div>
  );
}

/* Avatar seçici — hazır ikon ızgarası + foto yükleme + baş harfe dön */
function AvatarPicker({ name, avatarKey, size = 76 }) {
  const stored = useAvatar(avatarKey);
  const fileRef = useRef(null);
  const onFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) avatarFromFile(f, (dataUrl) => setAvatar(avatarKey, { type: "photo", src: dataUrl }));
    e.target.value = "";
  };
  return (
    <div className="avatar-picker">
      <div className="row" style={{ gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <Avatar name={name} size={size} avatarKey={avatarKey} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="row" style={{ gap: 8 }}>
            <button type="button" className="btn btn-light btn-sm" onClick={() => fileRef.current && fileRef.current.click()}><Icon name="download" size={15} style={{ transform: "rotate(180deg)" }} />Fotoğraf yükle</button>
            {stored ? <button type="button" className="btn btn-light btn-sm" onClick={() => clearAvatar(avatarKey)}>Kaldır</button> : null}
          </div>
          <div className="muted" style={{ fontSize: 11.5, maxWidth: 230 }}>Fotoğraf cihazında ≈160px'e küçültülür; sistemi yormaz.</div>
          <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: "none" }} />
        </div>
      </div>
      <div className="muted" style={{ fontSize: 11.5, fontWeight: 700, margin: "16px 0 9px", textTransform: "uppercase", letterSpacing: ".03em" }}>Hazır ikonlar</div>
      <div className="avatar-opt-grid">
        <button type="button" className={`avatar-opt initials${!stored ? " on" : ""}`} onClick={() => clearAvatar(avatarKey)} title="Baş harf">{(name || "?").trim().slice(0, 1).toUpperCase()}</button>
        {AVATAR_ICONS.map((ic, i) => {
          const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
          const on = stored && stored.type === "icon" && stored.icon === ic;
          return <button key={ic} type="button" className={`avatar-opt${on ? " on" : ""}`} style={{ background: color }} onClick={() => setAvatar(avatarKey, { type: "icon", icon: ic, color })} aria-label={ic}><Icon name={ic} size={20} /></button>;
        })}
      </div>
    </div>
  );
}

function Badge({ tone = "muted", dot, icon, children }) {
  return (
    <span className={`badge badge-${tone}${dot ? " badge-dot" : ""}`}>
      {icon ? <Icon name={icon} size={13} /> : null}
      {children}
    </span>
  );
}

function Delta({ dir, children }) {
  const name = dir === "up" ? "arrowUp" : dir === "down" ? "arrowDown" : "trend";
  return (
    <span className={`delta ${dir}`}>
      <Icon name={name} size={13} />
      {children}
    </span>
  );
}

function StatCard({ icon, tone = "primary", value, label, delta, deltaDir, sub, anim }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShown(true), 60);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="card stat">
      <div className="card-pad">
        <div className="stat-top">
          <span className={`stat-icon tone-${tone}`}><Icon name={icon} size={22} /></span>
          {delta != null ? <Delta dir={deltaDir}>{delta}</Delta> : null}
        </div>
        <div>
          <div className="stat-value tnum">{value}</div>
          <div className="stat-label">{label}</div>
        </div>
      </div>
    </div>
  );
}

/* SVG progress ring */
function Ring({ value, size = 116, stroke = 11, color = "var(--primary)", track = "var(--surface-3)", label, sub, big }) {
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
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(.22,1,.36,1)" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center", lineHeight: 1.1 }}>
        <div>
          <div className="tnum" style={{ fontSize: big ? 28 : 23, fontWeight: 800, letterSpacing: "-.02em" }}>{label}</div>
          {sub ? <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>{sub}</div> : null}
        </div>
      </div>
    </div>
  );
}

function Bar({ value, color = "var(--primary)", thin }) {
  const [v, setV] = useState(0);
  useEffect(() => { const t = setTimeout(() => setV(value), 150); return () => clearTimeout(t); }, [value]);
  return (
    <div className={`bar${thin ? " thin" : ""}`}>
      <span style={{ width: `${v}%`, background: color }} />
    </div>
  );
}

/* Area sparkline from array of numbers */
function Sparkline({ data, w = 320, h = 64, color = "var(--primary)", fill = true }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data) * 1.12;
  const min = Math.min(...data) * 0.88;
  const span = max - min || 1;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((d - min) / span) * h;
    return [x, y];
  });
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  const gid = "spk" + Math.random().toString(36).slice(2, 8);
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.26" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill ? <path d={area} fill={`url(#${gid})`} /> : null}
      <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      {pts.map((p, i) => i === pts.length - 1 ? (
        <circle key={i} cx={p[0]} cy={p[1]} r="3.5" fill={color} stroke="var(--surface)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
      ) : null)}
    </svg>
  );
}

/* Mini vertical bar chart */
function BarChart({ data, max, peakIdx }) {
  const top = max || Math.max(...data.map((d) => d.v));
  return (
    <div className="chart">
      {data.map((d, i) => (
        <div key={i} className={`col${i === peakIdx ? " peak" : ""}`}>
          <div className="track">
            <div className="fill" style={{ height: `${(d.v / top) * 100}%` }} title={`${d.v}`} />
          </div>
          <label>{d.l}</label>
        </div>
      ))}
    </div>
  );
}

function Section({ title, sub, action, children, className = "" }) {
  return (
    <div className={`card ${className}`}>
      {(title || action) && (
        <div className="card-head">
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3>{title}</h3>
            {sub ? <div className="sub">{sub}</div> : null}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

Object.assign(window, { Avatar, AvatarPicker, getAvatar, setAvatar, clearAvatar, useAvatar, avatarFromFile, Badge, Delta, StatCard, Ring, Bar, Sparkline, BarChart, Section });
