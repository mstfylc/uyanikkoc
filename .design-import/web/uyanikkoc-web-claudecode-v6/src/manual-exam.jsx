/* Manuel deneme girişi — ders bazında D/Y/B → net hesaplar, deneme store'una işler. */

const MANUAL_CONFIG = {
  YKS: {
    divisor: 4,
    cats: ["Türkçe", "Sosyal", "Matematik", "Fen"],
    subjects: [
      { name: "Türkçe", cat: "Türkçe", ss: 40 },
      { name: "Tarih", cat: "Sosyal", ss: 5 },
      { name: "Coğrafya", cat: "Sosyal", ss: 5 },
      { name: "Felsefe", cat: "Sosyal", ss: 5 },
      { name: "Din Kültürü", cat: "Sosyal", ss: 5 },
      { name: "Matematik", cat: "Matematik", ss: 40 },
      { name: "Fizik", cat: "Fen", ss: 7 },
      { name: "Kimya", cat: "Fen", ss: 7 },
      { name: "Biyoloji", cat: "Fen", ss: 6 },
    ],
  },
  LGS: {
    divisor: 3,
    cats: ["Türkçe", "Matematik", "Fen Bilimleri", "T.C. İnkılap Tarihi", "Din Kültürü", "İngilizce"],
    subjects: [
      { name: "Türkçe", cat: "Türkçe", ss: 20 },
      { name: "Matematik", cat: "Matematik", ss: 20 },
      { name: "Fen Bilimleri", cat: "Fen Bilimleri", ss: 20 },
      { name: "T.C. İnkılap Tarihi", cat: "T.C. İnkılap Tarihi", ss: 10 },
      { name: "Din Kültürü", cat: "Din Kültürü", ss: 10 },
      { name: "İngilizce", cat: "İngilizce", ss: 10 },
    ],
  },
};

function calcNetDiv(d, y, div) { return Math.max(0, d - y / div); }

function ManualExamModal({ open, onClose, role, defaultName, defaultType, onSaved }) {
  const roster = useRoster();
  const [examType, setExamType] = useState(defaultType || "YKS");
  const [examName, setExamName] = useState("");
  const [who, setWho] = useState("");
  const [vals, setVals] = useState({}); // name -> {d,y}
  const [done, setDone] = useState(false);

  const cfg = MANUAL_CONFIG[examType];
  const MANUAL_SUBJECTS = cfg.subjects;
  const MANUAL_CATS = cfg.cats;
  const calcNet = (d, y) => calcNetDiv(d, y, cfg.divisor);

  useEffect(() => {
    if (open) {
      setExamName(defaultName || "");
      setExamType(defaultType || "YKS");
      setWho(role === "student" ? (loadAuth()?.name || "Elif Yıldız") : (roster[0]?.name || ""));
      setVals({}); setDone(false);
    }
  }, [open]);
  // sınav türü değişince girişleri sıfırla
  useEffect(() => { if (open) setVals({}); }, [examType]);
  if (!open) return null;

  const setV = (name, k, raw) => {
    const max = MANUAL_SUBJECTS.find((s) => s.name === name).ss;
    let n = parseInt(String(raw).replace(/[^\d]/g, ""), 10);
    if (isNaN(n)) n = "";
    else n = Math.max(0, Math.min(max, n));
    setVals((p) => ({ ...p, [name]: { ...p[name], [k]: n } }));
  };

  const detail = MANUAL_SUBJECTS.map((s) => {
    const d = +vals[s.name]?.d || 0, y = +vals[s.name]?.y || 0;
    return { ders: s.name, cat: s.cat, d, y, n: calcNet(d, y) };
  });
  const byCat = {}; MANUAL_CATS.forEach((c) => byCat[c] = { d: 0, y: 0, n: 0 });
  detail.forEach((dd) => { byCat[dd.cat].d += dd.d; byCat[dd.cat].y += dd.y; byCat[dd.cat].n += dd.n; });
  const toplamNet = detail.reduce((a, d) => a + d.n, 0);
  const anyEntered = detail.some((d) => d.d > 0 || d.y > 0);
  const valid = examName.trim().length >= 2 && who && anyEntered;

  const save = () => {
    if (!valid) return;
    const rosterStu = roster.find((s) => s.name === who);
    const student = {
      no: "", sube: rosterStu?.sube || rosterStu?.grade || "", numara: rosterStu?.numara || "",
      ad: who, alan: examType === "LGS" ? "LGS" : "SAY", byCat, detail,
      toplamNet: +toplamNet.toFixed(2),
      puan: +(toplamNet * (examType === "LGS" ? 5.5 : 4.3) + 100).toFixed(2), rank: null,
    };
    upsertResult(examName.trim(), student, MANUAL_SUBJECTS.map((s) => s.name), { examType, catOrder: MANUAL_CATS });
    setDone(true);
    setTimeout(() => { setDone(false); onSaved && onSaved(); onClose(); }, 1200);
  };

  return ReactDOM.createPortal((
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="row" style={{ gap: 9 }}>
            <span className="stat-icon tone-primary" style={{ width: 36, height: 36 }}><Icon name="notebook" size={18} /></span>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800 }}>Manuel Deneme Girişi</h3>
              <div className="muted" style={{ fontSize: 12.5 }}>Ders bazında doğru / yanlış gir, net otomatik hesaplanır</div>
            </div>
          </div>
          <button className="icon-btn" style={{ width: 36, height: 36 }} onClick={onClose} aria-label="Kapat"><Icon name="plus" size={18} style={{ transform: "rotate(45deg)" }} /></button>
        </div>

        <div className="modal-body" style={{ gap: 14 }}>
          <div className="seg" style={{ width: "fit-content" }}>
            {["YKS", "LGS"].map((t) => (
              <button key={t} type="button" className={examType === t ? "on" : ""} onClick={() => setExamType(t)}>{t}{t === "YKS" ? " (TYT)" : ""}</button>
            ))}
          </div>
          <div className="grid g-2" style={{ gap: 12 }}>
            <div className="field"><label className="label">Deneme adı</label><input className="input" value={examName} onChange={(e) => setExamName(e.target.value)} placeholder={examType === "LGS" ? "ör. LGS Genel Deneme #5" : "ör. TYT Genel Deneme #7"} /></div>
            {role === "coach" ? (
              <div className="field"><label className="label">Öğrenci</label>
                <select className="select" value={who} onChange={(e) => setWho(e.target.value)}>{roster.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}</select>
              </div>
            ) : (
              <div className="field"><label className="label">Öğrenci</label><input className="input" value={who} disabled /></div>
            )}
          </div>

          {MANUAL_CATS.map((cat) => (
            <div key={cat}>
              <div className="row" style={{ gap: 8, marginBottom: 8 }}>
                <span className="swatch" style={{ width: 9, height: 9, borderRadius: 3, background: CAT_COLOR[cat] || SUBJECT_COLORS[cat] || "var(--primary)" }} />
                <span style={{ fontWeight: 700, fontSize: 12.5 }}>{cat}</span>
                <span className="badge badge-muted" style={{ marginLeft: "auto", height: 20 }}>{byCat[cat].n.toFixed(2).replace(/\.00$/, "")} net</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {MANUAL_SUBJECTS.filter((s) => s.cat === cat).map((s) => (
                  <div className="manual-row" key={s.name}>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{s.name} <span className="muted" style={{ fontWeight: 500, fontSize: 11 }}>/ {s.ss}</span></span>
                    <label className="manual-in"><span style={{ color: "var(--success)" }}>D</span><input inputMode="numeric" value={vals[s.name]?.d ?? ""} onChange={(e) => setV(s.name, "d", e.target.value)} /></label>
                    <label className="manual-in"><span style={{ color: "var(--danger)" }}>Y</span><input inputMode="numeric" value={vals[s.name]?.y ?? ""} onChange={(e) => setV(s.name, "y", e.target.value)} /></label>
                    <span className="tnum" style={{ width: 52, textAlign: "right", fontWeight: 800, fontSize: 13 }}>{calcNet(+vals[s.name]?.d || 0, +vals[s.name]?.y || 0).toFixed(2).replace(/\.00$/, "")}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="modal-foot">
          <div style={{ flex: 1 }}>
            <span className="muted" style={{ fontSize: 11.5, fontWeight: 700 }}>TOPLAM NET</span>
            <div className="tnum" style={{ fontSize: 22, fontWeight: 800 }}>{toplamNet.toFixed(2).replace(/\.00$/, "")}</div>
          </div>
          <button className="btn btn-ghost" onClick={onClose}>Vazgeç</button>
          <button className="btn btn-primary" disabled={!valid} onClick={save} style={{ opacity: valid ? 1 : 0.5 }}><Icon name={done ? "check" : "checkCircle"} size={16} />{done ? "Kaydedildi" : "Sonucu Kaydet"}</button>
        </div>
      </div>
    </div>
  ), document.body);
}

Object.assign(window, { ManualExamModal });
