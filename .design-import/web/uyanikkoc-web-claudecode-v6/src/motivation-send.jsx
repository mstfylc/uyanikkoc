/* Koç → öğrenci motivasyon gönderme. Öğrenciye bildirim düşer + Motivasyon
   sayfasındaki "günün notu" güncellenir. localStorage'da kalıcı. */

const MOTIV_TEMPLATES = [
  "Bugün attığın küçük adım, sınav günü en büyük farkın olacak. Devam! 💪",
  "Netlerin yükseliyor, tempoyu koru. Sana güveniyorum! 🚀",
  "Zorlandığın an, en çok geliştiğin andır. Pes etme! 🔥",
  "Bu hafta harika çalıştın — kendinle gurur duy. 🌟",
  "Hedefe her gün bir adım daha yaklaşıyorsun. Odaklan! 🎯",
];

const MOTIV_KEY = "uk_motiv_v1";
let _motiv = (() => { try { const s = localStorage.getItem(MOTIV_KEY); if (s) return JSON.parse(s); } catch (e) {} return {}; })();
const _moListeners = new Set();
function persistMotiv() { try { localStorage.setItem(MOTIV_KEY, JSON.stringify(_motiv)); } catch (e) {} _moListeners.forEach((l) => l()); }
function useMotiv(student) {
  const [, force] = React.useState(0);
  React.useEffect(() => { const l = () => force((x) => x + 1); _moListeners.add(l); return () => _moListeners.delete(l); }, []);
  return _motiv[student] || null;
}
function sendMotivation(students, text, from) {
  const at = Date.now();
  students.forEach((s) => { _motiv[s] = { text, from: from || "Dilek Emen", at }; });
  persistMotiv();
  // demo: öğrenci feed'ine tek bildirim düşür
  if (typeof pushNotif === "function") pushNotif("student", { icon: "heart", tone: "danger", title: "Koçundan motivasyon 💪", desc: text, page: "motivation" });
}

function MotivationSendModal({ open, onClose }) {
  const _mvRoster = (typeof useRoster === "function") ? useRoster() : [];
  const students = _mvRoster.length ? _mvRoster.map((s) => s.name) : ((typeof MSG_STUDENTS !== "undefined") ? MSG_STUDENTS : ["Elif Yıldız"]);
  const groups = (typeof useMsg === "function") ? (useMsg().groups || []) : [];
  const [mode, setMode] = useState("all"); // all | group | pick
  const [groupId, setGroupId] = useState(groups[0]?.id || "");
  const [picked, setPicked] = useState([]);
  const [text, setText] = useState("");
  useEffect(() => { if (open) { setMode("all"); setGroupId(groups[0]?.id || ""); setPicked([]); setText(""); } }, [open]); // eslint-disable-line
  if (!open) return null;
  const targets = mode === "all" ? students
    : mode === "group" ? (groups.find((g) => g.id === groupId)?.members || []).filter((m) => students.includes(m))
    : picked;
  const valid = text.trim().length > 3 && targets.length > 0;
  const send = () => {
    sendMotivation(targets, text.trim());
    toast(`${targets.length} öğrenciye motivasyon gönderildi 💪`, { icon: "heart" });
    onClose();
  };
  return ReactDOM.createPortal((
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 500, height: "min(680px, calc(100vh - 40px))" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="row" style={{ gap: 11 }}><span className="stat-icon tone-danger" style={{ width: 38, height: 38 }}><Icon name="heart" size={18} fill /></span><div><h3 style={{ fontSize: 15.5, fontWeight: 800 }}>Motivasyon Gönder</h3><div className="muted" style={{ fontSize: 12 }}>Öğrencilerine moral ve hatırlatma yolla</div></div></div>
          <button className="icon-btn" style={{ width: 36, height: 36 }} onClick={onClose} aria-label="Kapat"><Icon name="plus" size={18} style={{ transform: "rotate(45deg)" }} /></button>
        </div>
        <div className="modal-body" style={{ padding: "16px 20px", gap: 14 }}>
          <div className="field">
            <label className="label">Kime</label>
            <div className="seg" style={{ width: "fit-content", flexWrap: "wrap" }}>
              <button type="button" className={mode === "all" ? "on" : ""} onClick={() => setMode("all")}>Tüm öğrenciler</button>
              <button type="button" className={mode === "group" ? "on" : ""} onClick={() => setMode("group")}>Grup</button>
              <button type="button" className={mode === "pick" ? "on" : ""} onClick={() => setMode("pick")}>Öğrenci seç</button>
            </div>
          </div>
          {mode === "group" ? (
            <div className="field"><label className="label">Grup</label>
              <select className="select" value={groupId} onChange={(e) => setGroupId(e.target.value)}>{groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</select>
            </div>
          ) : null}
          {mode === "pick" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 180, overflowY: "auto" }}>
              {students.map((n) => { const on = picked.includes(n); return (
                <button key={n} className="src-item" style={{ background: on ? "var(--primary-soft)" : undefined }} onClick={() => setPicked((p) => p.includes(n) ? p.filter((x) => x !== n) : [...p, n])}>
                  <Avatar name={n} size={26} /><span style={{ flex: 1, textAlign: "left", fontWeight: 600, color: on ? "var(--primary-600)" : "var(--text)" }}>{n}</span><span className={`chk sm${on ? " done" : ""}`}><Icon name="check" size={11} stroke={3} /></span>
                </button>
              ); })}
            </div>
          ) : null}
          <div className="field">
            <label className="label">Mesaj</label>
            <textarea className="textarea" rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="Motive edici bir mesaj yaz..." />
          </div>
          <div>
            <div className="muted" style={{ fontSize: 11.5, fontWeight: 700, marginBottom: 7 }}>HAZIR MESAJLAR</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {MOTIV_TEMPLATES.map((t, i) => <button key={i} type="button" className="motiv-tpl" onClick={() => setText(t)}>{t}</button>)}
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <span className="muted" style={{ fontSize: 12, fontWeight: 600 }}>{targets.length} alıcı</span>
          <button className="btn btn-primary" disabled={!valid} style={{ marginLeft: "auto", opacity: valid ? 1 : 0.5 }} onClick={send}><Icon name="send" size={16} />Gönder</button>
        </div>
      </div>
    </div>
  ), document.body);
}

Object.assign(window, { MOTIV_TEMPLATES, useMotiv, sendMotivation, MotivationSendModal });
