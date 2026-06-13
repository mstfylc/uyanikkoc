/* Akıllı Ödev Sistemi — öğrencinin hedefine, netlerine, eksik konularına,
   müsaitliğine ve geçen hafta performansına göre otomatik haftalık ödev önerisi.
   Koç düzenleyebilir · kaynak bağımsız · gecikme uyarısı + kalite (doğruluk + süre) ölçümü. */

const SMART_BASE = new Date("2026-06-05");
function _smYmd(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
const SM_DOW = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

const SM_INTENSITY = {
  low:  { label: "Düşük",  soru: [15, 25], perDay: 1 },
  mid:  { label: "Orta",   soru: [25, 40], perDay: 1 },
  high: { label: "Yüksek", soru: [40, 55], perDay: 2 },
};
const SM_FOCUS = {
  tekrar: { label: "Tekrar", word: "tekrar" },
  karma:  { label: "Karma",  word: "karma" },
  yeni:   { label: "Yeni konu", word: "yeni konu" },
};
const SM_SOURCES = {
  free: "Kaynak fark etmez (öğrenci kendi kaynağından)",
  pdf:  "Koç PDF / föy",
};

/* ---- öğrenci sinyallerini topla ---- */
function _smSignals(name) {
  const S = (typeof COACH_STUDENTS !== "undefined" && COACH_STUDENTS.find((x) => x.name === name)) || null;
  const sinav = (S && S.sinav) || "YKS";
  const CURR = (typeof getCurriculum === "function") ? getCurriculum(sinav) : {};
  if (typeof ensureKonuSeed === "function") ensureKonuSeed(name, CURR);
  const subs = Object.keys(CURR).map((s) => {
    const list = (typeof konuList === "function") ? konuList(name, s, CURR) : [];
    const done = list.filter((t) => t.s === "done").length;
    const prog = list.filter((t) => t.s === "progress").length;
    const pct = list.length ? Math.round((done / list.length) * 100) : 0;
    return { subject: s, list, done, prog, total: list.length, pct };
  });
  const weak = [...subs].filter((x) => x.total).sort((a, b) => a.pct - b.pct).slice(0, 3);
  const completion = S ? S.completion : 70;
  const trend = (S && S.trend) || [];
  const net = S ? S.net : 0;
  const netDelta = trend.length >= 2 ? trend[trend.length - 1] - trend[trend.length - 2] : 0;
  const goal = (sinav === "LGS" ? "LGS" : "YKS") + " 2026";
  const targetNet = net ? net + Math.max(18, Math.round(net * 0.08)) : 0;
  const progCount = subs.reduce((a, x) => a + x.prog, 0);
  const todoCount = subs.reduce((a, x) => a + (x.total - x.done - x.prog), 0);
  // tahmini müsaitlik: tamamlama yüksekse daha çok gün
  const availDays = completion >= 80 ? 6 : completion >= 60 ? 5 : 4;
  return { S, name, sinav, CURR, subs, weak, completion, net, netDelta, goal, targetNet, progCount, todoCount, availDays };
}

function _smTopicsOfSubject(sig, subject) {
  const groups = sig.CURR[subject] || [];
  return groups.flatMap((g) => g.konular);
}

/* ---- öneri planı üret ---- */
function _smGenerate(sig, opts) {
  const ic = SM_INTENSITY[opts.intensity];
  const targets = [];
  sig.weak.forEach((wd) => {
    const prog = wd.list.filter((t) => t.s === "progress");
    const todo = wd.list.filter((t) => t.s === "todo");
    const doneL = wd.list.filter((t) => t.s === "done");
    let ordered;
    if (opts.focus === "tekrar") ordered = [...prog, ...doneL, ...todo];
    else if (opts.focus === "yeni") ordered = [...todo, ...prog];
    else ordered = [...prog, ...todo, ...doneL];
    ordered.slice(0, 2).forEach((t) => targets.push({ subject: wd.subject, topic: t.n, status: t.s }));
  });
  if (targets.length === 0 && sig.subs[0]) {
    sig.subs[0].list.slice(0, 3).forEach((t) => targets.push({ subject: sig.subs[0].subject, topic: t.n, status: t.s }));
  }
  const cap = Math.max(opts.days, Math.min(opts.days * ic.perDay, targets.length || opts.days));
  const chosen = targets.slice(0, cap);
  const [lo, hi] = ic.soru;
  return chosen.map((t, i) => {
    const dayIdx = i % opts.days;
    const isNew = t.status === "todo" && opts.focus !== "tekrar";
    const type = isNew ? "konu" : "soru";
    const count = type === "soru" ? Math.round((lo + (hi - lo) * ((i % 3) / 2)) / 5) * 5 : 0;
    return { uid: "it" + i + "_" + Date.now(), day: dayIdx, subject: t.subject, topic: t.topic, type, count, source: opts.source, status: t.status };
  });
}

function _smSentence(sig, opts) {
  const first = sig.name.split(" ")[0];
  const w = sig.weak[0];
  const w2 = sig.weak[1];
  const weakStr = w ? (w.subject + (w2 ? " ve " + w2.subject : "")) : "zayıf dersleri";
  const compTone = sig.completion < 65 ? "düşük kaldı" : sig.completion < 85 ? "orta seviyede" : "yüksek";
  const ic = SM_INTENSITY[opts.intensity];
  return `${first}, ${weakStr} konularında geride (${w ? "%" + w.pct : ""}). ` +
    `Geçen hafta ödev tamamlama oranı %${sig.completion} (${compTone}). ` +
    `Bu hafta ${opts.days} güne bölünmüş, ${ic.label.toLowerCase()} yoğunluklu, ${SM_FOCUS[opts.focus].word} ağırlıklı bir plan önerdim.`;
}

function SmartOdevModal({ open, onClose, student, onAssign }) {
  const name = student || ((typeof COACH_STUDENTS !== "undefined" && COACH_STUDENTS[0] && COACH_STUDENTS[0].name) || "Elif Yıldız");
  const [sig, setSig] = useState(null);
  const [opts, setOpts] = useState({ intensity: "mid", days: 4, focus: "karma", source: "free", overdueAlert: true, quality: true });
  const [items, setItems] = useState([]);
  const [assigned, setAssigned] = useState(false);

  useEffect(() => {
    if (!open) return;
    const s = _smSignals(name);
    const intensity = s.completion < 65 ? "low" : s.completion < 85 ? "mid" : "high";
    const focus = s.progCount >= 3 ? "tekrar" : (s.todoCount > s.progCount * 2 ? "yeni" : "karma");
    const days = Math.min(s.availDays, intensity === "low" ? 3 : intensity === "mid" ? 4 : 5);
    const o = { intensity, days, focus, source: "free", overdueAlert: true, quality: true };
    setSig(s); setOpts(o); setItems(_smGenerate(s, o)); setAssigned(false);
  }, [open, name]);

  if (!open) return null;
  const ic = SM_INTENSITY[opts.intensity];

  const regen = (patch) => { const o = { ...opts, ...patch }; setOpts(o); if (sig) setItems(_smGenerate(sig, o)); };
  const setOpt = (patch) => setOpts((o) => ({ ...o, ...patch }));
  const setSourceAll = (src) => { setOpt({ source: src }); setItems((its) => its.map((it) => ({ ...it, source: src }))); };
  const editItem = (uid, patch) => setItems((its) => its.map((it) => it.uid === uid ? { ...it, ...patch } : it));
  const removeItem = (uid) => setItems((its) => its.filter((it) => it.uid !== uid));
  const addRow = (day) => {
    const wd = (sig && sig.weak[0]) || (sig && sig.subs[0]);
    const subject = wd ? wd.subject : Object.keys((sig && sig.CURR) || {})[0];
    const tops = sig ? _smTopicsOfSubject(sig, subject) : [];
    setItems((its) => [...its, { uid: "it" + Date.now(), day, subject, topic: tops[0] || "Konu", type: "soru", count: 20, source: opts.source, status: "todo" }]);
  };

  const totalSoru = items.filter((it) => it.type === "soru").reduce((a, it) => a + (it.count || 0), 0);
  const usedDays = new Set(items.map((it) => it.day)).size;

  const assign = () => {
    if (!items.length) return;
    const list = items.map((it, i) => {
      const due = new Date(SMART_BASE.getTime() + (it.day + 1) * 86400000);
      const srcLabel = it.source === "free" ? "Kaynak fark etmez" : it.source === "pdf" ? "Koç PDF / föy" : it.source;
      const note = (opts.focus === "tekrar" ? "Tekrar ağırlıklı" : it.type === "konu" ? "Önce konu, sonra örnek" : "Süreli çöz") + (opts.quality ? " · süreyi not et" : "");
      return {
        id: "sm" + Date.now() + "_" + i, student: name, week: "w0",
        subject: it.subject, topic: it.topic, source: srcLabel,
        count: it.count, type: it.type, note,
        due: _smYmd(due), status: "pending", result: null, assignedAt: Date.now(),
        smart: true, overdueAlert: opts.overdueAlert, quality: opts.quality,
      };
    });
    if (typeof addOdevler === "function") addOdevler(list);
    setAssigned(true);
    if (typeof toast === "function") toast(`${list.length} akıllı ödev ${name.split(" ")[0]}'e atandı`, { icon: "bolt" });
    if (onAssign) onAssign(list);
    setTimeout(onClose, 650);
  };

  const Seg = ({ value, map, onPick }) => (
    <div className="seg" style={{ height: 34 }}>
      {Object.keys(map).map((k) => (
        <button key={k} className={value === k ? "on" : ""} style={{ fontSize: 12 }} onClick={() => onPick(k)}>{map[k].label}</button>
      ))}
    </div>
  );

  const studentSources = (typeof getSources === "function") ? getSources(name) : [];

  return ReactDOM.createPortal((
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel sm-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="row" style={{ gap: 11 }}>
            <span className="lr-icon" style={{ width: 38, height: 38, background: "var(--primary-soft)", color: "var(--primary-600)" }}><Icon name="bolt" size={20} /></span>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800 }}>Akıllı Ödev Sistemi</h3>
              <div className="muted" style={{ fontSize: 12 }}>{name} · otomatik haftalık öneri</div>
            </div>
          </div>
          <button className="icon-btn" style={{ width: 36, height: 36 }} onClick={onClose} aria-label="Kapat"><Icon name="plus" size={18} style={{ transform: "rotate(45deg)" }} /></button>
        </div>

        <div className="modal-body" style={{ gap: 16 }}>
          {/* 1 · Analiz */}
          {sig ? (
            <div className="sm-analiz">
              <div className="sm-sig">
                <div className="s"><span className="k">Hedef</span><span className="v">{sig.goal}</span><span className="muted" style={{ fontSize: 11 }}>≈ {sig.targetNet} net hedef</span></div>
                <div className="s"><span className="k">Şu anki net</span><span className="v">{sig.net}</span><span style={{ fontSize: 11, fontWeight: 700, color: sig.netDelta >= 0 ? "var(--success)" : "var(--danger)" }}>{sig.netDelta >= 0 ? "▲ +" : "▼ "}{sig.netDelta} son deneme</span></div>
                <div className="s"><span className="k">Geçen hafta</span><span className="v" style={{ color: sig.completion < 65 ? "var(--danger)" : sig.completion < 85 ? "var(--warning)" : "var(--success)" }}>%{sig.completion}</span><span className="muted" style={{ fontSize: 11 }}>ödev tamamlama</span></div>
                <div className="s"><span className="k">Müsaitlik</span><span className="v">{sig.availDays} gün</span><span className="muted" style={{ fontSize: 11 }}>tahmini / hafta</span></div>
              </div>
              <div style={{ marginTop: 12 }}>
                <div className="k" style={{ fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--faint)", marginBottom: 7 }}>Öncelikli zayıf alanlar</div>
                <div className="sm-weakchips">
                  {sig.weak.map((w) => (
                    <span key={w.subject} className="sm-weakchip">
                      <span style={{ width: 8, height: 8, borderRadius: 3, background: (SUBJECT_COLORS[w.subject] || "var(--primary)") }} />
                      {w.subject}<b style={{ color: "var(--muted)", fontWeight: 800 }}>%{w.pct}</b>
                    </span>
                  ))}
                </div>
              </div>
              <div className="sm-reco">
                <span className="ic"><Icon name="bolt" size={17} /></span>
                <p>{_smSentence(sig, opts)}</p>
              </div>
            </div>
          ) : null}

          {/* 2 · Plan ayarları */}
          <div>
            <div className="sm-sechd">Plan ayarları <span>— değiştir, plan otomatik güncellensin</span></div>
            <div className="sm-controls">
              <div className="sm-ctl"><span className="label">Yoğunluk</span><Seg value={opts.intensity} map={SM_INTENSITY} onPick={(k) => regen({ intensity: k })} /></div>
              <div className="sm-ctl"><span className="label">Odak</span><Seg value={opts.focus} map={SM_FOCUS} onPick={(k) => regen({ focus: k })} /></div>
              <div className="sm-ctl"><span className="label">Güne böl</span><NumStepper value={opts.days} step={1} min={1} max={7} size="sm" onChange={(n) => regen({ days: Math.max(1, n) })} /></div>
              <div className="sm-ctl" style={{ flex: 1, minWidth: 180 }}><span className="label">Kaynak (bağımsız)</span>
                <select className="select" style={{ height: 34 }} value={opts.source} onChange={(e) => setSourceAll(e.target.value)}>
                  <option value="free">Kaynak fark etmez</option>
                  <option value="pdf">Koç PDF / föy</option>
                  {studentSources.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="row" style={{ gap: 20, flexWrap: "wrap", marginTop: 12 }}>
              <label className="sm-toggle"><button className={"switch sm" + (opts.overdueAlert ? " on" : "")} onClick={() => setOpt({ overdueAlert: !opts.overdueAlert })} aria-label="Gecikme uyarısı"><span /></button>Geciken ödevde otomatik uyarı</label>
              <label className="sm-toggle"><button className={"switch sm" + (opts.quality ? " on" : "")} onClick={() => setOpt({ quality: !opts.quality })} aria-label="Kalite ölç"><span /></button>Kalite ölç (doğruluk + süre)</label>
            </div>
          </div>

          {/* 3 · Önerilen plan */}
          <div>
            <div className="sm-sechd" style={{ display: "flex", alignItems: "center" }}>
              Önerilen plan <span>— her satırı düzenleyebilirsin</span>
              <button className="btn btn-light btn-sm" style={{ marginLeft: "auto" }} onClick={() => sig && setItems(_smGenerate(sig, opts))}><Icon name="ai" size={14} />Yeniden öner</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {Array.from({ length: opts.days }).map((_, d) => {
                const dayItems = items.filter((it) => it.day === d);
                const due = new Date(SMART_BASE.getTime() + (d + 1) * 86400000);
                return (
                  <div className="sm-day" key={d}>
                    <div className="sm-day-head">
                      <span className="lr-icon" style={{ width: 24, height: 24, fontSize: 11, fontWeight: 800, background: "var(--surface-3)", color: "var(--text-2)" }}>{d + 1}</span>
                      <b>Gün {d + 1}</b>
                      <span className="muted" style={{ fontSize: 11.5 }}>· {SM_DOW[due.getDay()]}</span>
                      <button className="sm-add" onClick={() => addRow(d)} title="Bu güne ödev ekle"><Icon name="plus" size={14} />Satır</button>
                    </div>
                    <div className="sm-items">
                      {dayItems.length === 0
                        ? <div className="sm-emptyrow">Bu gün boş — serbest tekrar ya da “+ Satır” ile ödev ekle.</div>
                        : dayItems.map((it) => {
                          const c = SUBJECT_COLORS[it.subject] || "var(--primary)";
                          const tops = _smTopicsOfSubject(sig, it.subject);
                          return (
                            <div className="sm-item" key={it.uid}>
                              <span className="sw" style={{ background: c }} />
                              <select className="select sm-isel sm-itopic" value={it.topic} onChange={(e) => editItem(it.uid, { topic: e.target.value })} title={it.subject}>
                                {tops.includes(it.topic) ? null : <option value={it.topic}>{it.topic}</option>}
                                {tops.map((t) => <option key={t} value={t}>{t}</option>)}
                              </select>
                              <div className="sm-ictl">
                                <select className="select sm-isel sm-itype" value={it.type} onChange={(e) => editItem(it.uid, { type: e.target.value })}>
                                  {Object.keys(ODEV_TYPES).filter((k) => k !== "test").map((k) => <option key={k} value={k}>{ODEV_TYPES[k].label}</option>)}
                                </select>
                                {it.type === "soru"
                                  ? <NumStepper value={it.count} step={5} min={0} max={300} size="sm" onChange={(n) => editItem(it.uid, { count: n })} />
                                  : <span className="sm-typetag">{ODEV_TYPES[it.type].label}</span>}
                              </div>
                              <button className="mini-btn danger" onClick={() => removeItem(it.uid)} aria-label="Sil"><Icon name="plus" size={14} style={{ transform: "rotate(45deg)" }} /></button>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="modal-foot">
          <div className="muted" style={{ fontSize: 12.5, fontWeight: 600 }}>
            <b style={{ color: "var(--text)" }}>{items.length}</b> ödev · <b style={{ color: "var(--text)" }}>{totalSoru}</b> soru hedefi · {usedDays} güne yayılmış
          </div>
          <div className="row" style={{ gap: 10, marginLeft: "auto" }}>
            <button className="btn btn-ghost" onClick={onClose}>Vazgeç</button>
            <button className="btn btn-primary" onClick={assign} disabled={!items.length || assigned}>
              <Icon name={assigned ? "check" : "bolt"} size={16} />{assigned ? "Atandı!" : "Planı ata"}
            </button>
          </div>
        </div>
      </div>
    </div>
  ), document.body);
}

Object.assign(window, { SmartOdevModal });
