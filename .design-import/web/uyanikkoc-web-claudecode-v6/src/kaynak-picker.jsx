/* Kaynak Kataloğu seçici modal — ders + yayınevi + tür filtresi, ara-seç.
   Öğrenci/koç bilinen yayınevi kitaplarını listeden ekler; özel durumlar
   için KaynaklarimCard'daki serbest ekleme alanı kullanılır. */

function ExamSeg({ value, onChange }) {
  const opts = [["Tümü", "Tümü"], ["YKS", "YKS"], ["LGS", "LGS"]];
  return (
    <div className="seg" style={{ width: "fit-content" }}>
      {opts.map(([k, l]) => (
        <button key={k} className={value === k ? "on" : ""} onClick={() => onChange(k)}>{l}</button>
      ))}
    </div>
  );
}

function KatalogRow({ k, added, onToggle }) {
  const tur = KAYNAK_TUR[k.t] || KAYNAK_TUR.soru;
  const col = (typeof SUBJECT_COLORS !== "undefined" && SUBJECT_COLORS[k.s]) || "var(--primary)";
  return (
    <div className="lrow" style={{ alignItems: "center", padding: "11px 13px" }}>
      <span className="lr-icon" style={{ width: 36, height: 36, background: `color-mix(in srgb, ${col} 13%, transparent)`, color: col }}>
        <Icon name={tur.icon} size={17} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="lr-title" style={{ whiteSpace: "normal" }}>{k.n}</div>
        <div className="lr-meta">
          <b style={{ color: "var(--text-2)", fontWeight: 700 }}>{k.p}</b>
          <span className="d">{tur.label}</span>
          <span className="d">{k.e.join(" · ")}</span>
          <span className="d" style={{ color: k.soru > 0 ? "var(--primary-600)" : "var(--muted)", fontWeight: 700 }}>{k.soru > 0 ? `${k.soru.toLocaleString("tr-TR")} soru` : "Konu anlatımı"}</span>
        </div>
      </div>
      <button
        className={added ? "btn btn-light btn-sm" : "btn btn-primary btn-sm"}
        onClick={onToggle}
        style={{ flexShrink: 0, minWidth: 96, justifyContent: "center" }}
      >
        <Icon name={added ? "check" : "plus"} size={15} />{added ? "Eklendi" : "Ekle"}
      </button>
    </div>
  );
}

function KaynakKatalogModal({ open, onClose, student, defaultExam = "Tümü" }) {
  const mine = useSources(student).map((s) => s.name);
  const [exam, setExam] = useState(defaultExam);
  const [subject, setSubject] = useState("Tümü");
  const [pub, setPub] = useState("Tümü");
  const [type, setType] = useState("Tümü");
  const [q, setQ] = useState("");

  useEffect(() => {
    if (open) { setExam(defaultExam); setSubject("Tümü"); setPub("Tümü"); setType("Tümü"); setQ(""); }
  }, [open, defaultExam]);

  // sınav değişince geçersiz ders/yayınevi seçimini sıfırla
  useEffect(() => {
    const dersler = exam === "Tümü" ? null : KAYNAK_DERSLER[exam];
    if (dersler && subject !== "Tümü" && !dersler.includes(subject)) setSubject("Tümü");
    const pubs = katalogPublishers({ exam, subject: "Tümü" });
    if (pub !== "Tümü" && !pubs.includes(pub)) setPub("Tümü");
  }, [exam]); // eslint-disable-line

  if (!open) return null;

  const dersOpts = exam === "Tümü"
    ? [...new Set([...KAYNAK_DERSLER.YKS, ...KAYNAK_DERSLER.LGS])]
    : KAYNAK_DERSLER[exam];
  const pubOpts = katalogPublishers({ exam, subject });
  const results = katalogList({ exam, subject, pub, type, q });

  // derse göre grupla
  const groups = {};
  results.forEach((k) => { (groups[k.s] = groups[k.s] || []).push(k); });
  const groupKeys = Object.keys(groups);

  const toggle = (k) => {
    const label = kLabel(k);
    if (mine.includes(label)) removeSource(student, label);
    else addSource(student, label);
  };

  return ReactDOM.createPortal((
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 680, height: "min(720px, calc(100vh - 48px))" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="row" style={{ gap: 11 }}>
            <span className="lr-icon" style={{ width: 38, height: 38, background: "var(--primary-soft)", color: "var(--primary-600)" }}><Icon name="book" size={19} /></span>
            <div>
              <h3 style={{ fontSize: 15.5, fontWeight: 800 }}>Kaynak Kataloğu</h3>
              <div className="muted" style={{ fontSize: 12 }}>Türkiye geneli bilinen yayınevi kitapları · {KAYNAK_KATALOG.length} kaynak</div>
            </div>
          </div>
          <button className="icon-btn" style={{ width: 36, height: 36 }} onClick={onClose} aria-label="Kapat"><Icon name="plus" size={18} style={{ transform: "rotate(45deg)" }} /></button>
        </div>

        {/* filtreler */}
        <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", background: "var(--surface-2)", display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="between" style={{ gap: 10, flexWrap: "wrap" }}>
            <ExamSeg value={exam} onChange={setExam} />
            <div className="searchbox" style={{ margin: 0, minWidth: 200, flex: "1 1 200px", display: "flex" }}>
              <Icon name="search" size={16} />
              <input placeholder="Kitap veya yayınevi ara..." value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
          </div>
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <select className="select" style={{ height: 36, flex: "1 1 140px", minWidth: 130 }} value={subject} onChange={(e) => { setSubject(e.target.value); setPub("Tümü"); }}>
              <option value="Tümü">Tüm dersler</option>
              {dersOpts.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select className="select" style={{ height: 36, flex: "1 1 140px", minWidth: 130 }} value={pub} onChange={(e) => setPub(e.target.value)}>
              <option value="Tümü">Tüm yayınevleri</option>
              {pubOpts.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <select className="select" style={{ height: 36, flex: "0 1 140px", minWidth: 120 }} value={type} onChange={(e) => setType(e.target.value)}>
              <option value="Tümü">Tüm türler</option>
              {Object.entries(KAYNAK_TUR).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
        </div>

        {/* sonuçlar */}
        <div className="modal-body" style={{ gap: 16, padding: "16px 20px" }}>
          {groupKeys.length === 0 ? (
            <div style={{ padding: "44px 0", textAlign: "center", color: "var(--muted)", fontSize: 13.5 }}>
              Eşleşen kaynak yok. Filtreyi gevşet ya da özel kaynağını listeden çıkıp serbest ekle.
            </div>
          ) : groupKeys.map((g) => {
            const col = (typeof SUBJECT_COLORS !== "undefined" && SUBJECT_COLORS[g]) || "var(--primary)";
            return (
              <div key={g} style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <div className="row" style={{ gap: 8, padding: "0 2px" }}>
                  <span style={{ width: 9, height: 9, borderRadius: 3, background: col }} />
                  <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".02em", color: "var(--text-2)" }}>{g}</span>
                  <span className="muted" style={{ fontSize: 11.5 }}>{groups[g].length}</span>
                </div>
                {groups[g].map((k) => (
                  <KatalogRow key={k.id} k={k} added={mine.includes(kLabel(k))} onToggle={() => toggle(k)} />
                ))}
              </div>
            );
          })}
        </div>

        <div className="modal-foot" style={{ justifyContent: "space-between" }}>
          <span className="muted" style={{ fontSize: 12.5, fontWeight: 600 }}>
            <b style={{ color: "var(--primary-600)" }}>{mine.length}</b> kaynak listende
          </span>
          <button className="btn btn-primary" onClick={onClose}><Icon name="check" size={16} />Bitti</button>
        </div>
      </div>
    </div>
  ), document.body);
}

Object.assign(window, { KaynakKatalogModal, KatalogRow, ExamSeg });
