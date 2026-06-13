/* Yanlış Defteri sayfası + Hata Frekansı analizi + Sıfır Hata Döngüsü + ekleme modalı + odak tekrar. */

function HataFrekansiCard({ student, role }) {
  useMistakes(student);
  const f = mistakeFrequency(student, 14);
  if (!f.total) {
    return role === "coach" ? null : (
      <Section title="Hata Frekansı" sub="Son 14 günün hata tipi analizi">
        <div className="card-body"><div style={{ padding: "20px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Henüz yanlış eklenmedi. İlk yanlışını ekleyince burada hata tipi dağılımın çıkacak.</div></div>
      </Section>
    );
  }
  const top3 = f.ranked.slice(0, 3);
  const maxN = Math.max(...Object.values(f.byType));
  const sentence = "Son " + f.days + " günde " + top3.map((k) => f.byType[k] + " " + HATA_TIPI[k].label.toLowerCase()).join(", ") + ".";
  return (
    <Section title="Hata Frekansı" sub={role === "coach" ? `${student} · son 14 gün` : "Son 14 günde hangi tür hatayı daha çok yapıyorsun"} action={<Badge tone="primary" icon="chart">{f.total} yanlış</Badge>}>
      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 15 }}>
        <div className="hf-head">
          <span className="ic"><Icon name="bolt" size={17} /></span>
          <p><b>{sentence}</b> {f.diagnosis}</p>
        </div>
        <div className="hf-grid">
          <div className="hf-bars">
            {f.ranked.map((k) => {
              const t = HATA_TIPI[k];
              return (
                <div className="hf-bar" key={k}>
                  <span className="hf-lbl"><span className={"badge badge-" + t.tone} style={{ height: 20 }}><Icon name={t.icon} size={11} />{t.label}</span></span>
                  <span className="hf-track"><span style={{ width: Math.round((f.byType[k] / maxN) * 100) + "%", background: `var(--${t.tone})` }} /></span>
                  <span className="hf-n tnum">{f.byType[k]}</span>
                </div>
              );
            })}
          </div>
          <div className="hf-topics">
            <div className="hf-th">En sık yanlış konular</div>
            {f.topTopics.map((t) => (
              <div className="hf-tr" key={t.k}><span>{t.k}</span><span className="badge badge-muted" style={{ height: 19 }}>{t.n}×</span></div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

function MistakeAddModal({ open, onClose, student, sinav, initial }) {
  const CURR = (typeof getCurriculum === "function") ? getCurriculum(sinav || "YKS") : {};
  const subjects = Object.keys(CURR);
  const sources = (typeof getSources === "function") ? getSources(student) : [];
  const [subject, setSubject] = useState(subjects[0] || "");
  const [topic, setTopic] = useState("");
  const [subtopic, setSubtopic] = useState("");
  const [errorType, setErrorType] = useState("islem");
  const [source, setSource] = useState("");
  const [qType, setQType] = useState("klasik");
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState(null);
  const fileRef = React.useRef(null);

  const topics = subject && CURR[subject] ? CURR[subject].flatMap((g) => g.konular) : [];
  useEffect(() => {
    if (open) {
      const s = (initial && initial.subject) || subjects[0] || "";
      setSubject(s); setTopic((initial && initial.topic) || ""); setSubtopic(""); setErrorType("islem");
      setSource(""); setQType("klasik"); setNote(""); setPhoto(null);
    }
  }, [open]); // eslint-disable-line
  useEffect(() => { if (topic && !topics.includes(topic)) setTopic(""); }, [subject]); // eslint-disable-line
  if (!open) return null;

  const onFile = (e) => { const file = e.target.files && e.target.files[0]; if (file && typeof misResizeImage === "function") misResizeImage(file, 520, (d) => setPhoto(d)); };
  const ok = subject && topic;
  const save = () => {
    if (!ok) return;
    addMistake({ student, subject, topic, subtopic, errorType, source, qType, note, photo });
    if (typeof toast === "function") toast("Yanlış deftere eklendi · 1 gün sonra tekrar", { icon: "checkCircle" });
    onClose();
  };

  return ReactDOM.createPortal((
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="row" style={{ gap: 11 }}>
            <span className="lr-icon" style={{ width: 38, height: 38, background: "var(--danger-soft)", color: "var(--danger)" }}><Icon name="alert" size={19} /></span>
            <div><h3 style={{ fontSize: 16, fontWeight: 800 }}>Yanlış ekle</h3><div className="muted" style={{ fontSize: 12 }}>Hatayı kaydet — sistem tekrarını otomatik açar</div></div>
          </div>
          <button className="icon-btn" style={{ width: 36, height: 36 }} onClick={onClose} aria-label="Kapat"><Icon name="plus" size={18} style={{ transform: "rotate(45deg)" }} /></button>
        </div>
        <div className="modal-body" style={{ gap: 13 }}>
          <div className="yd-frow">
            <div className="field"><label className="label">Ders</label><select className="select" value={subject} onChange={(e) => setSubject(e.target.value)}>{subjects.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
            <div className="field"><label className="label">Konu</label><select className="select" value={topic} onChange={(e) => setTopic(e.target.value)}><option value="">Konu seç…</option>{topics.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
          </div>
          <div className="yd-frow">
            <div className="field"><label className="label">Alt konu</label><input className="input" value={subtopic} onChange={(e) => setSubtopic(e.target.value)} placeholder="ör. Yaş problemi" /></div>
            <div className="field"><label className="label">Soru türü</label><select className="select" value={qType} onChange={(e) => setQType(e.target.value)}>{Object.keys(SORU_TURU).map((k) => <option key={k} value={k}>{SORU_TURU[k]}</option>)}</select></div>
          </div>
          <div className="field">
            <label className="label">Hata tipi</label>
            <div className="yd-types">
              {Object.keys(HATA_TIPI).map((k) => {
                const t = HATA_TIPI[k]; const on = errorType === k;
                return <button key={k} type="button" className={"yd-type" + (on ? " on" : "")} style={on ? { borderColor: `var(--${t.tone})`, color: `var(--${t.tone})` } : undefined} onClick={() => setErrorType(k)}><Icon name={t.icon} size={14} />{t.label}</button>;
              })}
            </div>
          </div>
          <div className="field"><label className="label">Kaynak (bağımsız)</label><input className="input" list="yd-src-list" value={source} onChange={(e) => setSource(e.target.value)} placeholder="345, Bilgi Sarmal, kendi PDF'im…" /><datalist id="yd-src-list">{sources.map((s) => <option key={s} value={s} />)}</datalist></div>
          <div className="field"><label className="label">Çözüm notu</label><textarea className="input" style={{ minHeight: 64, resize: "vertical", padding: "9px 12px" }} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Neyi atladın, doğru çözüm ne?" /></div>
          <div className="field">
            <label className="label">Fotoğraf (opsiyonel)</label>
            {photo
              ? <div className="yd-photo"><img src={photo} alt="yanlış" /><button className="mini-btn danger" onClick={() => setPhoto(null)} aria-label="Kaldır"><Icon name="plus" size={14} style={{ transform: "rotate(45deg)" }} /></button></div>
              : <button type="button" className="yd-photo-add" onClick={() => fileRef.current && fileRef.current.click()}><Icon name="plus" size={16} />Soru fotoğrafı ekle</button>}
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onFile} />
          </div>
        </div>
        <div className="modal-foot">
          <span className="muted" style={{ fontSize: 12 }}>Tekrar takvimi: 1 → 3 → 7 → 21 gün</span>
          <div className="row" style={{ gap: 10, marginLeft: "auto" }}>
            <button className="btn btn-ghost" onClick={onClose}>Vazgeç</button>
            <button className="btn btn-primary" onClick={save} disabled={!ok}><Icon name="check" size={16} />Deftere ekle</button>
          </div>
        </div>
      </div>
    </div>
  ), document.body);
}

function MistakeStageDots({ stage }) {
  return (
    <span className="yd-dots" title={`${stage}/4 tekrar tamam`}>
      {MIS_INTERVALS.map((d, i) => <span key={i} className={"yd-dot" + (i < stage ? " on" : "")} title={d + " gün"} />)}
    </span>
  );
}

/* ---- Yanlışları toplu deftere ekle (ödev sonucundan / denemeden) ---- */
function MistakeBatchModal({ open, onClose, student, source, slots }) {
  const [rows, setRows] = useState([]);
  const [bulk, setBulk] = useState("islem");
  useEffect(() => { if (open) { setRows((slots || []).map((s) => ({ subject: s.subject, topic: s.topic, qType: s.qType || "klasik", errorType: "islem", on: true }))); setBulk("islem"); } }, [open]); // eslint-disable-line
  if (!open) return null;
  const onCount = rows.filter((r) => r.on).length;
  const setType = (i, t) => setRows((r) => r.map((x, j) => j === i ? { ...x, errorType: t } : x));
  const applyAll = (t) => { setBulk(t); setRows((r) => r.map((x) => ({ ...x, errorType: t }))); };
  const toggle = (i) => setRows((r) => r.map((x, j) => j === i ? { ...x, on: !x.on } : x));
  const save = () => {
    rows.filter((r) => r.on).forEach((r) => addMistake({ student, subject: r.subject, topic: r.topic, subtopic: "", errorType: r.errorType, source: source || "", qType: r.qType, note: "", photo: null }));
    if (typeof toast === "function") toast(onCount + " yanlış deftere eklendi · tekrar takvimi açıldı", { icon: "checkCircle" });
    onClose();
  };
  return ReactDOM.createPortal((
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="row" style={{ gap: 11 }}>
            <span className="lr-icon" style={{ width: 38, height: 38, background: "var(--danger-soft)", color: "var(--danger)" }}><Icon name="alert" size={19} /></span>
            <div><h3 style={{ fontSize: 16, fontWeight: 800 }}>Yanlışları deftere ekle</h3><div className="muted" style={{ fontSize: 12 }}>{(slots || []).length} yanlış · her birine hata tipi seç</div></div>
          </div>
          <button className="icon-btn" style={{ width: 36, height: 36 }} onClick={onClose} aria-label="Kapat"><Icon name="plus" size={18} style={{ transform: "rotate(45deg)" }} /></button>
        </div>
        <div className="modal-body" style={{ gap: 13 }}>
          <div className="yd-batch-bulk">
            <span className="muted" style={{ fontSize: 12, fontWeight: 700 }}>Hepsine uygula:</span>
            <div className="yd-types">
              {Object.keys(HATA_TIPI).map((k) => { const t = HATA_TIPI[k]; const on = bulk === k; return <button key={k} type="button" className={"yd-type" + (on ? " on" : "")} style={on ? { borderColor: `var(--${t.tone})`, color: `var(--${t.tone})` } : undefined} onClick={() => applyAll(k)}><Icon name={t.icon} size={13} />{t.short}</button>; })}
            </div>
          </div>
          <div className="yd-batch-list">
            {rows.map((r, i) => {
              const c = (typeof SUBJECT_COLORS !== "undefined" && SUBJECT_COLORS[r.subject]) || "var(--primary)";
              return (
                <div className={"yd-batch-row" + (r.on ? "" : " off")} key={i}>
                  <button type="button" className={"chk sm" + (r.on ? " done" : "")} onClick={() => toggle(i)} aria-label="Dahil et"><Icon name="check" size={11} stroke={3} /></button>
                  <span className="sw" style={{ width: 9, height: 9, borderRadius: 3, background: c, flexShrink: 0 }} />
                  <div className="yd-batch-main"><b>{r.topic}</b><span className="muted">{r.subject}</span></div>
                  <select className="select" style={{ height: 32, width: 138 }} value={r.errorType} onChange={(e) => setType(i, e.target.value)} disabled={!r.on}>{Object.keys(HATA_TIPI).map((k) => <option key={k} value={k}>{HATA_TIPI[k].label}</option>)}</select>
                </div>
              );
            })}
          </div>
        </div>
        <div className="modal-foot">
          <span className="muted" style={{ fontSize: 12 }}>{source ? "Kaynak: " + source : "1 → 3 → 7 → 21 gün tekrar açılır"}</span>
          <div className="row" style={{ gap: 10, marginLeft: "auto" }}>
            <button className="btn btn-ghost" onClick={onClose}>Vazgeç</button>
            <button className="btn btn-primary" onClick={save} disabled={!onCount}><Icon name="check" size={16} />{onCount} yanlışı ekle</button>
          </div>
        </div>
      </div>
    </div>
  ), document.body);
}

/* ---- Odak tekrar (kart kart gözden geçirme) ---- */
function ZeroErrorReview({ open, list, onClose }) {
  const [idx, setIdx] = useState(0);
  const [reviewed, setReviewed] = useState(0);
  useEffect(() => { if (open) { setIdx(0); setReviewed(0); } }, [open]);
  if (!open) return null;
  const done = idx >= list.length;
  const m = list[idx];
  const t = m ? HATA_TIPI[m.errorType] : null;
  const c = m ? ((typeof SUBJECT_COLORS !== "undefined" && SUBJECT_COLORS[m.subject]) || "var(--primary)") : "var(--primary)";
  const doReview = () => { if (m) { reviewMistake(m.id); setReviewed((r) => r + 1); } setIdx((i) => i + 1); };

  return ReactDOM.createPortal((
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="row" style={{ gap: 11 }}>
            <span className="lr-icon" style={{ width: 38, height: 38, background: "var(--primary-soft)", color: "var(--primary-600)" }}><Icon name="ai" size={19} /></span>
            <div><h3 style={{ fontSize: 16, fontWeight: 800 }}>Odak Tekrar</h3><div className="muted" style={{ fontSize: 12 }}>{done ? "Tamamlandı" : `${idx + 1} / ${list.length} · sıfır hata döngüsü`}</div></div>
          </div>
          <button className="icon-btn" style={{ width: 36, height: 36 }} onClick={onClose} aria-label="Kapat"><Icon name="plus" size={18} style={{ transform: "rotate(45deg)" }} /></button>
        </div>
        {!done ? (
          <>
            <div className="yd-rev-prog"><span style={{ width: ((idx) / list.length) * 100 + "%" }} /></div>
            <div className="modal-body" style={{ gap: 13 }}>
              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                <span className="ngm-subj" style={{ color: c, fontSize: 12.5 }}><span className="sw" style={{ width: 9, height: 9, borderRadius: 3, background: c }} />{m.subject}</span>
                <span className={"badge badge-" + t.tone} style={{ height: 22 }}><Icon name={t.icon} size={12} />{t.label}</span>
                {SORU_TURU[m.qType] ? <span className="badge badge-muted" style={{ height: 22 }}>{SORU_TURU[m.qType]}</span> : null}
              </div>
              <div className="yd-rev-topic">{m.topic}{m.subtopic ? <span className="muted" style={{ fontWeight: 600, fontSize: 16 }}> · {m.subtopic}</span> : null}</div>
              {m.photo ? <img className="yd-rev-photo" src={m.photo} alt="yanlış" /> : null}
              {m.note ? <div className="yd-rev-note"><div className="lbl">Çözüm notun</div>{m.note}</div> : <div className="yd-rev-note empty">Bu yanlışta not yok — doğru çözümü zihninden geçir, sonra işaretle.</div>}
              <div className="between" style={{ fontSize: 12, color: "var(--muted)" }}>
                <span className="row" style={{ gap: 8 }}><MistakeStageDots stage={m.stage} /> {m.stage < MIS_INTERVALS.length ? MIS_INTERVALS[m.stage] + ". gün tekrarı" : "son tekrar"}</span>
                {m.source ? <span>{m.source}</span> : null}
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setIdx((i) => i + 1)}>Atla</button>
              <button className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={doReview}><Icon name="check" size={16} />Tekrar ettim</button>
            </div>
          </>
        ) : (
          <>
            <div className="modal-body" style={{ alignItems: "center", textAlign: "center", gap: 12, padding: "34px 24px" }}>
              <span className="lr-icon" style={{ width: 60, height: 60, background: "var(--success-soft)", color: "var(--success)" }}><Icon name="checkCircle" size={30} /></span>
              <div style={{ fontSize: 18, fontWeight: 800 }}>Tekrar turu bitti 🎯</div>
              <div className="muted" style={{ fontSize: 13.5, lineHeight: 1.5 }}>{reviewed} yanlışı tekrar ettin. Bir sonraki aralıkta sistem otomatik hatırlatacak.</div>
            </div>
            <div className="modal-foot"><button className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={onClose}>Kapat</button></div>
          </>
        )}
      </div>
    </div>
  ), document.body);
}

function ZeroErrorLoop({ student }) {
  const due = dueMistakes(student);
  const [showAll, setShowAll] = useState(false);
  const [review, setReview] = useState(false);
  const [snapshot, setSnapshot] = useState([]);
  if (!due.length) {
    return (
      <Section title="Sıfır Hata Döngüsü" sub="1 → 3 → 7 → 21 gün otomatik tekrar takvimi">
        <div className="card-body"><div className="yd-clear"><Icon name="checkCircle" size={20} />Bugün tekrar edilecek yanlış yok — döngü temiz.</div></div>
      </Section>
    );
  }
  const shown = showAll ? due : due.slice(0, 5);
  return (
    <Section title="Sıfır Hata Döngüsü" sub="Bugün tekrar edilecekler — bitirince bir sonraki aralığa geçer" action={
      <div className="row" style={{ gap: 8 }}>
        <Badge tone="warning" icon="clock">{due.length} tekrar</Badge>
        <button className="btn btn-primary btn-sm" onClick={() => { setSnapshot(due); setReview(true); }}><Icon name="ai" size={15} />Odak tekrar</button>
      </div>
    }>
      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {shown.map((m) => {
          const t = HATA_TIPI[m.errorType];
          const c = (typeof SUBJECT_COLORS !== "undefined" && SUBJECT_COLORS[m.subject]) || "var(--primary)";
          const nextLbl = m.stage < MIS_INTERVALS.length ? MIS_INTERVALS[m.stage] + ". gün tekrarı" : "son tekrar";
          return (
            <div className="yd-due" key={m.id}>
              <span className="sw" style={{ background: c }} />
              <div className="yd-dmain">
                <div className="yd-dtitle">{m.topic} <span className="muted" style={{ fontWeight: 600 }}>· {m.subject}{m.subtopic ? " · " + m.subtopic : ""}</span></div>
                <div className="yd-dmeta"><span className={"badge badge-" + t.tone} style={{ height: 19 }}><Icon name={t.icon} size={11} />{t.label}</span><MistakeStageDots stage={m.stage} /><span className="muted" style={{ fontSize: 11.5 }}>{nextLbl}</span></div>
              </div>
              <button className="btn btn-light btn-sm yd-due-btn" onClick={() => { reviewMistake(m.id); const last = m.stage + 1 >= MIS_INTERVALS.length; if (typeof toast === "function") toast(last ? m.topic + " · kapandı 🎯 sıfır hata!" : m.topic + " tekrar edildi", { icon: last ? "checkCircle" : "ai" }); }}><Icon name="check" size={15} />Tekrar ettim</button>
            </div>
          );
        })}
        {due.length > 5 ? <button className="yd-more" onClick={() => setShowAll((s) => !s)}>{showAll ? "Daha az göster" : `+${due.length - 5} tekrar daha göster`}</button> : null}
      </div>
      <ZeroErrorReview open={review} list={snapshot} onClose={() => setReview(false)} />
    </Section>
  );
}

function MistakeRow({ m, onDel }) {
  const t = HATA_TIPI[m.errorType];
  const st = TEKRAR_DURUM[m.status];
  const c = (typeof SUBJECT_COLORS !== "undefined" && SUBJECT_COLORS[m.subject]) || "var(--primary)";
  const [open, setOpen] = useState(false);
  return (
    <div className="yd-item">
      <div className="yd-irow">
        {m.photo ? <img className="yd-thumb" src={m.photo} alt="" onClick={() => setOpen(true)} /> : <span className="yd-thumb ph" style={{ background: `color-mix(in srgb, ${c} 12%, transparent)`, color: c }}><Icon name="alert" size={16} /></span>}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="yd-ititle"><span className="sw" style={{ background: c }} />{m.topic}{m.subtopic ? <span className="muted" style={{ fontWeight: 600 }}> · {m.subtopic}</span> : null}</div>
          <div className="yd-imeta">
            <span className={"badge badge-" + t.tone} style={{ height: 19 }}><Icon name={t.icon} size={11} />{t.short}</span>
            <span className="muted">{m.subject}</span>
            {m.source ? <span className="muted">· {m.source}</span> : null}
            {SORU_TURU[m.qType] ? <span className="muted">· {SORU_TURU[m.qType]}</span> : null}
          </div>
          {m.note ? <div className="yd-inote">{m.note}</div> : null}
        </div>
        <div className="yd-iright">
          <span className={"badge badge-" + st.tone} style={{ height: 21 }}><Icon name={st.icon} size={11} />{st.label}</span>
          <MistakeStageDots stage={m.stage} />
          <button className="mini-btn danger" onClick={() => onDel(m.id)} aria-label="Sil"><Icon name="plus" size={14} style={{ transform: "rotate(45deg)" }} /></button>
        </div>
      </div>
      {open && m.photo ? <div className="modal-overlay" onClick={() => setOpen(false)}><img src={m.photo} alt="yanlış" style={{ maxWidth: "90vw", maxHeight: "85vh", borderRadius: 14, boxShadow: "var(--shadow-lg)" }} onClick={(e) => e.stopPropagation()} /></div> : null}
    </div>
  );
}

function YanlisDefteriPage() {
  const me = (typeof loadAuth === "function" && loadAuth()?.name) || "Elif Yıldız";
  const sinav = (typeof studentSinav === "function") ? studentSinav() : "YKS";
  const all = useMistakes(me);
  const [add, setAdd] = useState(false);
  const [fDers, setFDers] = useState("all");
  const [fTip, setFTip] = useState("all");
  const [fDurum, setFDurum] = useState("all");

  const subjects = Array.from(new Set(all.map((m) => m.subject)));
  const open = all.filter((m) => m.status !== "kapandi").length;
  const closed = all.filter((m) => m.status === "kapandi").length;
  const dueCount = dueMistakes(me).length;
  const shown = all.filter((m) => (fDers === "all" || m.subject === fDers) && (fTip === "all" || m.errorType === fTip) && (fDurum === "all" || m.status === fDurum));

  const SUM = [
    { ic: "alert", tone: "danger", v: all.length, l: "Toplam yanlış" },
    { ic: "clock", tone: "warning", v: open, l: "Açık · takipte" },
    { ic: "checkCircle", tone: "success", v: closed, l: "Kapandı · sıfır hata" },
    { ic: "ai", tone: "info", v: dueCount, l: "Bugün tekrar" },
  ];

  return (
    <div className="stack rise">
      <PageHead title="Yanlış Defteri" sub="Hatalarını kaydet, sistem unutturmadan tekrar ettirsin" actions={<button className="btn btn-primary" onClick={() => setAdd(true)}><Icon name="plus" size={16} />Yanlış ekle</button>} />

      <div className="yd-summary">
        {SUM.map((s) => (
          <div className="yd-sum" key={s.l}>
            <span className={"stat-icon tone-" + s.tone} style={{ width: 40, height: 40 }}><Icon name={s.ic} size={19} /></span>
            <div><div className="v tnum">{s.v}</div><div className="l">{s.l}</div></div>
          </div>
        ))}
      </div>

      <ZeroErrorLoop student={me} />
      <HataFrekansiCard student={me} role="student" />

      <Section title="Tüm Yanlışlar" sub={`${shown.length} kayıt`}>
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="yd-toolbar">
            <select className="select" style={{ height: 34, fontSize: 12.5 }} value={fDers} onChange={(e) => setFDers(e.target.value)}><option value="all">Tüm dersler</option>{subjects.map((s) => <option key={s} value={s}>{s}</option>)}</select>
            <select className="select" style={{ height: 34, fontSize: 12.5 }} value={fTip} onChange={(e) => setFTip(e.target.value)}><option value="all">Tüm hata tipleri</option>{Object.keys(HATA_TIPI).map((k) => <option key={k} value={k}>{HATA_TIPI[k].label}</option>)}</select>
            <select className="select" style={{ height: 34, fontSize: 12.5 }} value={fDurum} onChange={(e) => setFDurum(e.target.value)}><option value="all">Tüm durumlar</option>{Object.keys(TEKRAR_DURUM).map((k) => <option key={k} value={k}>{TEKRAR_DURUM[k].label}</option>)}</select>
          </div>
          {shown.length === 0
            ? <div style={{ padding: "26px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Bu filtrede yanlış yok.</div>
            : shown.map((m) => <MistakeRow key={m.id} m={m} onDel={(id) => { removeMistake(id); if (typeof toast === "function") toast("Yanlış silindi"); }} />)}
        </div>
      </Section>

      <MistakeAddModal open={add} onClose={() => setAdd(false)} student={me} sinav={sinav} />
    </div>
  );
}

/* ---- Koç: öğrencinin yanlış defteri (görüntüle + konuya göre ödev ata) ---- */
function CoachMistakesCard({ student, onAssign }) {
  useMistakes(student);
  const all = getMistakes(student).filter((m) => m.status !== "kapandi");
  const due = (typeof dueMistakes === "function") ? dueMistakes(student).length : 0;
  if (!all.length) {
    return (
      <Section title="Öğrencinin Yanlış Defteri" sub="Öğrencinin eklediği yanlışlar burada görünür">
        <div className="card-body"><div style={{ padding: "20px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Bu öğrenci henüz yanlış eklemedi.</div></div>
      </Section>
    );
  }
  const groups = {};
  all.forEach((m) => {
    const k = m.subject + "::" + m.topic;
    (groups[k] = groups[k] || { subject: m.subject, topic: m.topic, items: [], types: {}, subs: new Set() });
    groups[k].items.push(m); groups[k].types[m.errorType] = (groups[k].types[m.errorType] || 0) + 1;
    if (m.subtopic) groups[k].subs.add(m.subtopic);
  });
  const list = Object.values(groups).sort((a, b) => b.items.length - a.items.length);
  return (
    <Section title="Öğrencinin Yanlış Defteri" sub="Açık yanlışlar — konuya göre doğrudan ödev atayabilirsin"
      action={<div className="row" style={{ gap: 8 }}><Badge tone="danger" icon="alert">{all.length} açık</Badge>{due ? <Badge tone="warning" icon="clock">{due} tekrar bekliyor</Badge> : null}</div>}>
      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {list.map((g) => {
          const c = (typeof SUBJECT_COLORS !== "undefined" && SUBJECT_COLORS[g.subject]) || "var(--primary)";
          const domType = Object.keys(g.types).sort((a, b) => g.types[b] - g.types[a])[0];
          const t = HATA_TIPI[domType];
          const subs = Array.from(g.subs).slice(0, 3).join(", ");
          return (
            <div className="yd-due" key={g.subject + "::" + g.topic}>
              <span className="sw" style={{ background: c }} />
              <div className="yd-dmain">
                <div className="yd-dtitle">{g.topic} <span className="muted" style={{ fontWeight: 600 }}>· {g.subject}</span></div>
                <div className="yd-dmeta">
                  <span className={"badge badge-" + t.tone} style={{ height: 19 }}><Icon name={t.icon} size={11} />{t.label}</span>
                  <span className="muted" style={{ fontSize: 11.5 }}>{g.items.length} yanlış</span>
                  {subs ? <span className="muted" style={{ fontSize: 11.5 }}>· {subs}</span> : null}
                </div>
              </div>
              <button className="btn btn-light btn-sm yd-due-btn" onClick={() => onAssign && onAssign(g.subject, g.topic)}><Icon name="plus" size={15} />Ödev ata</button>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

Object.assign(window, { HataFrekansiCard, MistakeAddModal, MistakeBatchModal, ZeroErrorLoop, ZeroErrorReview, MistakeRow, CoachMistakesCard, YanlisDefteriPage });
