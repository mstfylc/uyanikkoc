/* Uyanık Koç mobil — Profil fotoğrafı sistemi (web ui.jsx Avatar/AvatarPicker muadili).
   Baş harf / hazır ikon / yüklenen foto. Foto cihazda ~160px'e küçültülüp localStorage'a
   yazılır (DB'ye yük olmaz). Her rolde ana sayfa + profil avatarına anında yansır. */

const M_AVATAR_KEY = "uk_m_avatars_v1";
const M_AVATAR_ICONS = ["cap", "star", "flame", "target", "book", "heart", "award", "bolt", "ai", "trend", "users", "chart"];
const M_AVATAR_COLORS = ["#534AB7", "#2F6BD6", "#0F6E56", "#B26A12", "#9A3D7A", "#C2410C", "#3A9D6A", "#2A6FDB"];
let _mAvatars = (() => { try { return JSON.parse(localStorage.getItem(M_AVATAR_KEY)) || {}; } catch (e) { return {}; } })();
const _mAvListeners = new Set();
function getMAvatar(key) { return key ? _mAvatars[key] : null; }
function setMAvatar(key, val) { if (!key) return; _mAvatars = { ..._mAvatars, [key]: val }; try { localStorage.setItem(M_AVATAR_KEY, JSON.stringify(_mAvatars)); } catch (e) {} _mAvListeners.forEach((l) => l()); }
function clearMAvatar(key) { if (!key) return; const n = { ..._mAvatars }; delete n[key]; _mAvatars = n; try { localStorage.setItem(M_AVATAR_KEY, JSON.stringify(_mAvatars)); } catch (e) {} _mAvListeners.forEach((l) => l()); }
function useMAvatar(key) {
  const [, force] = React.useState(0);
  React.useEffect(() => { const l = () => force((x) => x + 1); _mAvListeners.add(l); return () => _mAvListeners.delete(l); }, []);
  return getMAvatar(key);
}
/* foto → kare kırpılmış küçük dataURL (en çok `max` px) */
function mAvatarFromFile(file, cb, max = 160) {
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

/* Drop-in avatar: <MAvatar name initials size avatarKey style gradient /> */
function MAvatar({ name, initials, size = 46, avatarKey, style, gradient }) {
  const stored = useMAvatar(avatarKey);
  const ini = (initials || (name || "?").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("") || "?").toUpperCase();
  const base = { width: size, height: size, fontSize: Math.round(size * 0.36), ...(style || {}) };
  if (stored && stored.type === "photo" && stored.src) {
    return (
      <span className="uk-avatar" style={{ ...base, padding: 0, overflow: "hidden", background: "var(--surface-3)" }}>
        <img src={stored.src} alt={name || ""} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      </span>
    );
  }
  if (stored && stored.type === "icon" && stored.icon) {
    return (
      <span className="uk-avatar" style={{ ...base, background: stored.color || "var(--primary)" }}>
        <MIcon name={stored.icon} size={Math.round(size * 0.5)} fill={stored.icon === "flame" || stored.icon === "star" || stored.icon === "heart"} />
      </span>
    );
  }
  return <span className="uk-avatar" style={{ ...(gradient ? { background: gradient } : {}), ...base }}>{ini}</span>;
}

/* Tappable avatar with camera badge → opens picker sheet */
function MAvatarEditable({ name, initials, size = 76, avatarKey, gradient, onOpen }) {
  return (
    <button type="button" onClick={onOpen} className="uk-avatar-edit" style={{ width: size, height: size }} aria-label="Profil fotoğrafını değiştir">
      <MAvatar name={name} initials={initials} size={size} avatarKey={avatarKey} gradient={gradient} />
      <span className="uk-avatar-cam"><MIcon name="edit" size={13} /></span>
    </button>
  );
}

/* Avatar seçici — bottom sheet: foto yükle + hazır ikonlar + baş harfe dön */
function MAvatarPickerSheet({ name, avatarKey, onClose }) {
  const stored = useMAvatar(avatarKey);
  const fileRef = useRef(null);
  const onFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) mAvatarFromFile(f, (dataUrl) => { setMAvatar(avatarKey, { type: "photo", src: dataUrl }); ukToast("Profil fotoğrafı güncellendi ✓"); });
    e.target.value = "";
  };
  const initial = (name || "?").trim().slice(0, 1).toUpperCase();
  return (
    <div className="uk-sheet-overlay" onClick={onClose}>
      <div className="uk-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="uk-grip" />
        <div style={{ fontSize: 16.5, fontWeight: 800 }}>Profil fotoğrafı</div>
        <div style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600, marginTop: 3, marginBottom: 18 }}>Hazır bir ikon seç ya da kendi fotoğrafını yükle.</div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <MAvatar name={name} size={72} avatarKey={avatarKey} />
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 9 }}>
            <div style={{ display: "flex", gap: 9 }}>
              <button className="uk-btn uk-btn-primary" style={{ height: 42, flex: 1 }} onClick={() => fileRef.current && fileRef.current.click()}>
                <MIcon name="plus" size={16} /> Fotoğraf yükle
              </button>
              {stored ? <button className="uk-btn uk-btn-light" style={{ height: 42 }} onClick={() => { clearMAvatar(avatarKey); ukToast("Baş harfe dönüldü"); }}>Kaldır</button> : null}
            </div>
            <div style={{ fontSize: 11, color: "var(--faint)", fontWeight: 600, lineHeight: 1.45 }}>Fotoğraf cihazında ≈160px'e küçültülür; sistemi yormaz.</div>
            <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: "none" }} />
          </div>
        </div>

        <div style={{ fontSize: 11, color: "var(--faint)", fontWeight: 800, letterSpacing: ".04em", textTransform: "uppercase", margin: "20px 0 11px" }}>Hazır ikonlar</div>
        <div className="uk-avatar-grid">
          <button className={`uk-avatar-opt ini${!stored ? " on" : ""}`} onClick={() => clearMAvatar(avatarKey)} title="Baş harf">{initial}</button>
          {M_AVATAR_ICONS.map((ic, i) => {
            const color = M_AVATAR_COLORS[i % M_AVATAR_COLORS.length];
            const on = stored && stored.type === "icon" && stored.icon === ic;
            return (
              <button key={ic} className={`uk-avatar-opt${on ? " on" : ""}`} style={{ background: color }} onClick={() => { setMAvatar(avatarKey, { type: "icon", icon: ic, color }); }} aria-label={ic}>
                <MIcon name={ic} size={21} fill={ic === "flame" || ic === "star" || ic === "heart"} />
              </button>
            );
          })}
        </div>

        <button className="uk-btn uk-btn-light uk-btn-block" style={{ marginTop: 18, height: 48, boxShadow: "none" }} onClick={onClose}>Bitti</button>
        <div style={{ height: 6 }} />
      </div>
    </div>
  );
}

Object.assign(window, {
  M_AVATAR_KEY, M_AVATAR_ICONS, M_AVATAR_COLORS,
  getMAvatar, setMAvatar, clearMAvatar, useMAvatar, mAvatarFromFile,
  MAvatar, MAvatarEditable, MAvatarPickerSheet,
});
