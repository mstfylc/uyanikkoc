/* Student sub-pages: Konu Takibi, Çalışma Programı, Denemeler */

function PageHead({ title, sub, actions }) {
  return (
    <div className="between" style={{ alignItems: "flex-end" }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.02em" }}>{title}</h1>
        {sub ? <div className="muted" style={{ fontSize: 13, marginTop: 4, fontWeight: 500 }}>{sub}</div> : null}
      </div>
      {actions}
    </div>
  );
}

function tStats(list) {
  const done = list.filter((t) => t.s === "done").length;
  const prog = list.filter((t) => t.s === "progress").length;
  const total = list.length;
  return { done, prog, todo: total - done - prog, total, pct: Math.round((done / total) * 100) };
}

/* ---------------- Konu Takibi ---------------- */
function TopicStatusIcon({ s, p }) {
  if (s === "done") return <span className="lr-icon" style={{ width: 30, height: 30, background: "var(--success-soft)", color: "var(--success)" }}><Icon name="check" size={16} stroke={3} /></span>;
  if (s === "progress") return <span className="lr-icon" style={{ width: 30, height: 30, background: "var(--warning-soft)", color: "var(--warning)" }}><Icon name="clock" size={16} /></span>;
  return <span className="lr-icon" style={{ width: 30, height: 30, background: "var(--surface-3)", color: "var(--faint)", border: "1.5px dashed var(--border-strong)" }} />;
}

function TopicsPage() {
  const sinav = (typeof studentSinav === "function") ? studentSinav() : "YKS";
  const CURR = (typeof getCurriculum === "function") ? getCurriculum(sinav) : null;
  const me = (typeof loadAuth === "function" && loadAuth()?.name) || "Elif Yıldız";
  useKonu();
  if (typeof ensureKonuSeed === "function") ensureKonuSeed(me, CURR);
  const TOPICS = (() => {
    if (!CURR) return (typeof window !== "undefined" && window.TOPICS) || {};
    const out = {};
    Object.keys(CURR).forEach((s) => {
      out[s] = (typeof konuList === "function") ? konuList(me, s, CURR) : CURR[s].flatMap((g) => g.konular).map((n) => ({ n, s: "todo", p: 0 }));
    });
    return out;
  })();
  const scOf = (s) => (typeof SUBJECT_COLORS !== "undefined" && SUBJECT_COLORS[s]) || "var(--primary)";
  const subjects = Object.keys(TOPICS);
  const [active, setActive] = useState(subjects[0]);
  const all = subjects.flatMap((s) => TOPICS[s]);
  const overall = tStats(all);
  const list = TOPICS[active] || [];
  const st = tStats(list.length ? list : [{ s: "todo" }]);
  const mySources = (typeof useSources === "function") ? useSources(me).map((s) => s.name) : [];
  const [openTopic, setOpenTopic] = useState(null);
  const [srcProg, setSrcProg] = useState(() => {
    try {
      const v2 = localStorage.getItem("uk_topic_src_v2"); if (v2) return JSON.parse(v2);
      const v1 = JSON.parse(localStorage.getItem("uk_topic_src_v1") || "{}"); // eski boolean biçimi → taşı
      const out = {}; Object.keys(v1).forEach((tk) => { out[tk] = {}; Object.keys(v1[tk]).forEach((s) => { out[tk][s] = { mode: "pct", pct: v1[tk][s] ? 100 : 0, soru: 0 }; }); });
      return out;
    } catch (e) { return {}; }
  });
  const setSrc = (tkey, src, patch) => setSrcProg((prev) => { const cur = { ...(prev[tkey] || {}) }; cur[src] = { mode: "pct", pct: 0, soru: 0, ...(cur[src] || {}), ...patch }; const next = { ...prev, [tkey]: cur }; try { localStorage.setItem("uk_topic_src_v2", JSON.stringify(next)); } catch (e) {} return next; });
  const srcType = (s) => { const k = (typeof katalogByLabel === "function") ? katalogByLabel(s) : null; return k ? k.t : "custom"; };
  const srcEntry = (map, s) => map[s] || { mode: srcType(s) === "soru" ? "soru" : "pct", pct: 0, soru: 0 };

  const detailRef = React.useRef(null);
  const goSubject = (s, topicKey) => {
    setActive(s);
    setOpenTopic(topicKey || null);
    requestAnimationFrame(() => {
      const el = detailRef.current;
      if (el) { try { window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - 72, behavior: "smooth" }); } catch (e) {} }
    });
  };

  return (
    <div className="stack rise">
      <PageHead title="Konu Takibi" sub={`${sinav} müfredatına göre konu konu ilerlemen`} actions={<button className="btn btn-light btn-sm" onClick={() => {
        const rows = [["Ders", "Konu", "Durum"]];
        subjects.forEach((s) => TOPICS[s].forEach((t) => rows.push([s, t.n, TOPIC_STATUS[t.s].label])));
        downloadCSV("konu-takibi-raporu.csv", rows);
        toast("Konu takibi raporu indirildi", { icon: "download" });
      }}><Icon name="trend" size={16} />Rapor indir</button>} />

      {/* Özet şeridi — tek bakışta dağılım */}
      <div className="card" style={{ padding: "16px 18px" }}>
        <div className="between" style={{ marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
          <div className="row" style={{ gap: 10, alignItems: "baseline" }}>
            <span className="tnum" style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-.02em" }}>{overall.pct}%</span>
            <span className="muted" style={{ fontSize: 13, fontWeight: 600 }}>genel ilerleme · {overall.total} konu</span>
          </div>
          <div className="row" style={{ gap: 16, flexWrap: "wrap" }}>
            {[["success", "Tamamlanan", overall.done], ["warning", "Devam eden", overall.prog], ["faint", "Başlanmadı", overall.todo]].map(([tone, lbl, n]) => (
              <span key={lbl} className="row" style={{ gap: 7, alignItems: "center" }}>
                <span style={{ width: 9, height: 9, borderRadius: 3, background: tone === "faint" ? "var(--border-strong)" : `var(--${tone})` }} />
                <span className="muted" style={{ fontSize: 12.5, fontWeight: 600 }}>{lbl}</span>
                <b className="tnum" style={{ fontSize: 13 }}>{n}</b>
              </span>
            ))}
          </div>
        </div>
        <div className="kt-seg">
          <span style={{ width: `${(overall.done / overall.total) * 100}%`, background: "var(--success)" }} />
          <span style={{ width: `${(overall.prog / overall.total) * 100}%`, background: "var(--warning)" }} />
        </div>
      </div>

      {/* Müfredat ısı haritası — tüm dersler × konular tek bakışta */}
      <Section title="Müfredat haritası" sub="Her kare bir konu — yeşil tamam, sarı devam, kesik gri başlanmadı. Bir kareye dokun, aşağıda detayını aç.">
        <div className="card-body">
          <div className="kt-map">
            {subjects.map((s) => {
              const sc = tStats(TOPICS[s]);
              const c = scOf(s);
              const on = s === active;
              return (
                <div className={"kt-srow" + (on ? " on" : "")} key={s}>
                  <button type="button" className="kt-slabel" onClick={() => goSubject(s)}>
                    <span className="swatch" style={{ width: 10, height: 10, borderRadius: 4, background: c, flexShrink: 0 }} />
                    <b style={{ fontSize: 12.5, color: on ? c : "var(--text)" }}>{s}</b>
                  </button>
                  <div className="kt-cells">
                    {TOPICS[s].map((t, i) => {
                      const bg = t.s === "done" ? "var(--success)" : t.s === "progress" ? "var(--warning)" : "transparent";
                      return (
                        <button key={i} type="button" className={"kt-cell " + t.s} title={`${t.n} · ${TOPIC_STATUS[t.s].label}`} style={{ background: bg }}
                          onClick={() => goSubject(s, (t.s === "done" || t.s === "progress") && mySources.length ? s + "::" + t.n : null)} />
                      );
                    })}
                  </div>
                  <span className="tnum kt-spct" style={{ color: c }}>{sc.pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* Seçili ders — konu konu detay */}
      <div ref={detailRef}>
      <Section
        title={active}
        sub={`${st.done} tamamlandı · ${st.prog} devam ediyor · ${st.todo} başlanmadı`}
        action={<div className="row" style={{ gap: 10 }}>
          <div style={{ width: 130 }}><Bar value={st.pct} color={scOf(active)} /></div>
          <span className="tnum" style={{ fontWeight: 800, fontSize: 14, color: scOf(active) }}>{st.pct}%</span>
        </div>}
      >
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div className="kt-subjtabs">
              {subjects.map((s) => {
                const sc = tStats(TOPICS[s]);
                const c = scOf(s);
                const on = s === active;
                return (
                  <button key={s} type="button" className={"kt-subjtab" + (on ? " on" : "")} style={{ borderColor: on ? c : "var(--border)" }} onClick={() => { setActive(s); setOpenTopic(null); }}>
                    <span className="swatch" style={{ width: 9, height: 9, borderRadius: 3, background: c, flexShrink: 0 }} />
                    <span style={{ color: on ? c : "var(--text-2)" }}>{s}</span>
                    <span className="kt-subjtab-pct">{sc.pct}%</span>
                  </button>
                );
              })}
            </div>
            {list.map((t, i) => {
              const cfg = TOPIC_STATUS[t.s];
              const tkey = active + "::" + t.n;
              const canCheck = (t.s === "done" || t.s === "progress") && mySources.length > 0;
              const expanded = openTopic === tkey;
              const map = srcProg[tkey] || {};
              const doneCount = mySources.filter((s) => (srcEntry(map, s).pct || 0) >= 100).length;
              return (
                <div key={i} style={{ border: expanded ? "1px solid var(--border)" : "none", borderRadius: 14, overflow: "hidden", background: expanded ? "var(--surface-2)" : "transparent" }}>
                  <div className="lrow" style={{ padding: "11px 14px", cursor: canCheck ? "pointer" : "default", background: "transparent" }} onClick={canCheck ? () => setOpenTopic(expanded ? null : tkey) : undefined}>
                    <TopicStatusIcon s={t.s} p={t.p} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="lr-title" style={{ fontSize: 13.5 }}>{t.n}</div>
                      {t.s === "progress" ? <div style={{ marginTop: 7, maxWidth: 220 }}><Bar value={t.p} color="var(--warning)" thin /></div> : null}
                      {canCheck ? <div className="lr-meta" style={{ marginTop: 3 }}><span className="d" style={{ display: "inline-flex", alignItems: "center", gap: 4, color: doneCount === mySources.length ? "var(--success)" : "var(--muted)" }}><Icon name="book" size={12} />{doneCount}/{mySources.length} kaynak bitti</span></div> : null}
                    </div>
                    <button type="button" title="Durumu değiştir" onClick={(e) => { e.stopPropagation(); if (typeof cycleKonuStatus === "function") { const ns = cycleKonuStatus(me, active, t.n); if (typeof toast === "function") toast(t.n + " · " + (TOPIC_STATUS[ns] ? TOPIC_STATUS[ns].label : ns), { icon: ns === "done" ? "checkCircle" : "book" }); } }} style={{ border: "none", background: "none", padding: 0, cursor: "pointer" }}><Badge tone={cfg.tone}>{cfg.label}</Badge></button>
                    {canCheck ? <Icon name="chevronDown" size={17} style={{ color: "var(--faint)", transform: expanded ? "rotate(180deg)" : "none", transition: "transform .18s", flexShrink: 0 }} /> : null}
                  </div>
                  {expanded ? (
                    <div style={{ padding: "4px 14px 14px 52px", display: "flex", flexDirection: "column", gap: 7 }}>
                      <div className="muted" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".03em", marginBottom: 2 }}>Bu konuda elindeki kaynaklar</div>
                      {mySources.map((s) => {
                        const type = srcType(s);
                        const isSoru = type === "soru";
                        const tur = (typeof KAYNAK_TUR !== "undefined") ? KAYNAK_TUR[type] : null;
                        const en = srcEntry(map, s);
                        const complete = (en.pct || 0) >= 100;
                        const PCTS = [0, 25, 50, 75, 100];
                        const pctChip = (p) => <button key={p} type="button" className="chip" style={{ height: 28, cursor: "pointer", background: en.pct === p ? "var(--primary)" : undefined, color: en.pct === p ? "#fff" : undefined, borderColor: en.pct === p ? "var(--primary)" : undefined }} onClick={() => setSrc(tkey, s, { pct: p })}>%{p}</button>;
                        return (
                          <div key={s} style={{ padding: "9px 0", borderTop: "1px solid var(--border)" }}>
                            <div className="row" style={{ gap: 8, marginBottom: 8 }}>
                              <Icon name={tur ? tur.icon : "book"} size={14} style={{ color: complete ? "var(--success)" : "var(--faint)", flexShrink: 0 }} />
                              <span style={{ fontSize: 12.5, fontWeight: 700, flex: 1, minWidth: 0 }}>{s}</span>
                              <span className={`badge badge-${tur ? tur.tone : "muted"}`} style={{ height: 19, fontSize: 10 }}>{tur ? tur.short : "Kaynak"}</span>
                            </div>
                            {isSoru ? (
                              <div className="row" style={{ gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                                <div className="seg" style={{ height: 30 }}>
                                  <button className={en.mode === "soru" ? "on" : ""} style={{ fontSize: 11.5 }} onClick={() => setSrc(tkey, s, { mode: "soru" })}>Soru sayısı</button>
                                  <button className={en.mode === "pct" ? "on" : ""} style={{ fontSize: 11.5 }} onClick={() => setSrc(tkey, s, { mode: "pct" })}>Yüzde</button>
                                </div>
                                {en.mode === "soru"
                                  ? <div className="row" style={{ gap: 6, alignItems: "center" }}><input className="input tnum" type="number" min="0" value={en.soru || ""} onChange={(ev) => setSrc(tkey, s, { soru: Math.max(0, parseInt(ev.target.value || "0", 10)) })} placeholder="0" style={{ width: 84, height: 30, textAlign: "center", fontWeight: 700 }} /><span className="muted" style={{ fontSize: 12 }}>soru çözdüm</span></div>
                                  : <div className="row" style={{ gap: 5, flexWrap: "wrap" }}>{PCTS.map(pctChip)}</div>}
                              </div>
                            ) : (
                              <div className="row" style={{ gap: 5, flexWrap: "wrap", alignItems: "center" }}>
                                {PCTS.map(pctChip)}
                                {complete ? <span className="badge badge-success" style={{ height: 22 }}><Icon name="check" size={12} stroke={3} />Tamamlandı</span> : null}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </Section>
      </div>
    </div>
  );
}

/* ---------------- Çalışma Programı ---------------- */
function AddBlockModal({ open, day, onClose, onAdd }) {
  const _sinav = (typeof studentSinav === "function") ? studentSinav() : "YKS";
  const subs = (typeof getCurriculum === "function") ? Object.keys(getCurriculum(_sinav)) : Object.keys(SUBJECT_COLORS);
  const me = (typeof loadAuth === "function" && loadAuth()?.name) || "Elif Yıldız";
  const mySources = (typeof useSources === "function") ? useSources(me).map((s) => s.name) : [];
  const [t, setT] = useState("09:00");
  const [e, setE] = useState("10:00");
  const [subj, setSubj] = useState(subs[0]);
  const [topic, setTopic] = useState("");
  const [type, setType] = useState("Soru çözümü");
  const [kaynak, setKaynak] = useState("");
  const [count, setCount] = useState("");
  const [dogru, setDogru] = useState("");
  const [yanlis, setYanlis] = useState("");
  useEffect(() => { if (open) { setT("09:00"); setE("10:00"); setSubj(subs[0]); setTopic(""); setType("Soru çözümü"); setKaynak(""); setCount(""); setDogru(""); setYanlis(""); } }, [open]); // eslint-disable-line
  if (!open) return null;
  const isQuiz = type === "Soru çözümü" || type === "Deneme";
  const nC = parseInt(count, 10) || 0, nD = parseInt(dogru, 10) || 0, nY = parseInt(yanlis, 10) || 0;
  const bos = Math.max(0, nC - nD - nY);
  const net = Math.max(0, nD - nY / 4);
  const countMismatch = nC > 0 && nD + nY > nC;
  const ok = topic.trim().length > 1 && !countMismatch;
  return ReactDOM.createPortal((
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 460 }} onClick={(ev) => ev.stopPropagation()}>
        <div className="modal-head">
          <div className="row" style={{ gap: 11 }}><span className="stat-icon tone-primary" style={{ width: 38, height: 38 }}><Icon name="calendar" size={18} /></span><div><h3 style={{ fontSize: 15.5, fontWeight: 800 }}>Çalışma Bloğu Ekle</h3><div className="muted" style={{ fontSize: 12 }}>{DAYS_FULL[day]} programına</div></div></div>
          <button className="icon-btn" style={{ width: 36, height: 36 }} onClick={onClose} aria-label="Kapat"><Icon name="plus" size={18} style={{ transform: "rotate(45deg)" }} /></button>
        </div>
        <div className="modal-body" style={{ padding: 20, gap: 13 }}>
          <div className="row" style={{ gap: 10 }}>
            <div className="field" style={{ flex: 1 }}><label className="label">Başlangıç</label><input type="time" className="input tnum" value={t} onChange={(ev) => setT(ev.target.value)} /></div>
            <div className="field" style={{ flex: 1 }}><label className="label">Bitiş</label><input type="time" className="input tnum" value={e} onChange={(ev) => setE(ev.target.value)} /></div>
          </div>
          <div className="field"><label className="label">Ders</label>
            <select className="select" value={subj} onChange={(ev) => setSubj(ev.target.value)}>{subs.map((s) => <option key={s} value={s}>{s}</option>)}</select>
          </div>
          <div className="field"><label className="label">Kaynak <span className="muted" style={{ fontWeight: 600 }}>(kitabın)</span></label>
            <select className="select" value={kaynak} onChange={(ev) => setKaynak(ev.target.value)}>
              <option value="">Kaynak seç (opsiyonel)</option>
              {mySources.map((k) => <option key={k} value={k}>{k}</option>)}
              <option value="__diger">Diğer / listede yok</option>
            </select>
            {mySources.length === 0 ? <span className="muted" style={{ fontSize: 11, marginTop: 5 }}>Henüz kaynağın yok. “Ödevlerim → Kaynaklarım”dan kitap ekleyebilirsin.</span> : null}
          </div>
          <div className="field"><label className="label">Konu / başlık</label><input className="input" placeholder="ör. Türev - kural tekrarı" value={topic} onChange={(ev) => setTopic(ev.target.value)} autoFocus /></div>
          <div className="field"><label className="label">Tür</label>
            <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>{["Soru çözümü", "Konu tekrarı", "Deneme", "Video ders"].map((x) => <button key={x} type="button" className={`chip${type === x ? " on" : ""}`} style={{ cursor: "pointer", background: type === x ? "var(--primary-soft)" : undefined, color: type === x ? "var(--primary-600)" : undefined, borderColor: type === x ? "var(--primary)" : undefined }} onClick={() => setType(x)}>{x}</button>)}</div>
          </div>
          {isQuiz ? (
            <div className="field">
              <label className="label">Soru çözümü <span className="muted" style={{ fontWeight: 600 }}>(opsiyonel)</span></label>
              <div className="row" style={{ gap: 8 }}>
                <div style={{ flex: 1 }}><input className="input tnum" inputMode="numeric" placeholder="Soru" value={count} onChange={(ev) => setCount(ev.target.value.replace(/\D/g, ""))} /></div>
                <div style={{ flex: 1 }}><input className="input tnum" inputMode="numeric" placeholder="Doğru" value={dogru} onChange={(ev) => setDogru(ev.target.value.replace(/\D/g, ""))} /></div>
                <div style={{ flex: 1 }}><input className="input tnum" inputMode="numeric" placeholder="Yanlış" value={yanlis} onChange={(ev) => setYanlis(ev.target.value.replace(/\D/g, ""))} /></div>
              </div>
              {countMismatch ? (
                <span style={{ fontSize: 11.5, color: "var(--danger)", marginTop: 5 }}>Doğru + yanlış, soru sayısını aşamaz.</span>
              ) : nC > 0 ? (
                <div className="row" style={{ gap: 12, marginTop: 8, fontSize: 12, fontWeight: 700, color: "var(--text-2)" }}>
                  <span><span className="muted" style={{ fontWeight: 600 }}>Boş:</span> <span className="tnum">{bos}</span></span>
                  <span style={{ color: "var(--primary-600)" }}><span className="muted" style={{ fontWeight: 600 }}>Net:</span> <span className="tnum">{net.toFixed(2)}</span></span>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
        <div className="modal-foot"><button className="btn btn-light" onClick={onClose}>Vazgeç</button><button className="btn btn-primary" disabled={!ok} style={{ marginLeft: "auto", opacity: ok ? 1 : 0.5 }} onClick={() => onAdd({ t, e, subj, topic: topic.trim(), type, kaynak: kaynak === "__diger" ? "" : kaynak, count: nC || null, dogru: count ? nD : null, yanlis: count ? nY : null })}><Icon name="plus" size={16} />Ekle</button></div>
      </div>
    </div>
  ), document.body);
}

function SchedulePage() {
  const me = (typeof loadAuth === "function" && loadAuth()?.name) || "Elif Yıldız";
  const days = Object.keys(SCHEDULE);
  const [day, setDay] = useState(TODAY_KEY);
  const [view, setView] = useState("day");
  const [extra, setExtra] = useState({});
  const [doneKeys, setDoneKeys] = useState(() => new Set());
  const [progKeys, setProgKeys] = useState(() => new Set());
  const [addOpen, setAddOpen] = useState(false);
  const blocksOf = (d) => [...SCHEDULE[d], ...((extra[d]) || [])];
  const bkey = (d, b) => `${d}:${b.t}:${b.topic}`;
  const isDone = (d, b) => b.done || doneKeys.has(bkey(d, b));
  const isProg = (d, b) => !isDone(d, b) && progKeys.has(bkey(d, b));
  const startBlock = (d, b) => { setProgKeys((s) => { const n = new Set(s); n.add(bkey(d, b)); return n; }); if (typeof toast === "function") toast(`“${b.topic}” başladı — kolay gelsin!`, { icon: "bolt" }); };
  const finishBlock = (d, b) => { const k = bkey(d, b); setProgKeys((s) => { const n = new Set(s); n.delete(k); return n; }); setDoneKeys((s) => { const n = new Set(s); n.add(k); return n; }); if (typeof toast === "function") toast(`“${b.topic}” tamamlandı ✓`, { icon: "checkCircle" }); };
  const addBlock = (blk) => { setExtra((x) => ({ ...x, [day]: [...((x[day]) || []), blk] })); setAddOpen(false); toast("Çalışma bloğu eklendi"); };
  const blocks = blocksOf(day);
  const totalH = STUDENT_WEEK.reduce((s, d) => s + d.v, 0);
  const sessions = days.reduce((s, d) => s + blocksOf(d).length, 0);

  const BlockCard = ({ d, b }) => {
    const c = SUBJECT_COLORS[b.subj] || "var(--primary)";
    const done = isDone(d, b);
    const prog = isProg(d, b);
    return (
      <div className={`lrow${done ? " done" : ""}`} style={{ padding: "12px 14px" }}>
        <div style={{ textAlign: "center", minWidth: 50 }}>
          <div style={{ fontSize: 12, fontWeight: 800 }} className="tnum">{b.t}</div>
          <div style={{ fontSize: 10.5, color: "var(--muted)" }} className="tnum">{b.e}</div>
        </div>
        <span style={{ width: 4, alignSelf: "stretch", borderRadius: 4, background: c, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="lr-title">{b.topic}</div>
          <div className="lr-meta"><span className="chip" style={{ height: 22, fontSize: 11, padding: "0 8px" }}><span className="swatch" style={{ background: c }} />{b.subj}</span><span className="d">{b.type}</span>{b.kaynak ? <span className="d" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Icon name="book" size={12} />{b.kaynak}</span> : null}{b.count ? <span className="d tnum">{b.count} soru{b.dogru != null ? ` · ${b.dogru}D ${b.yanlis}Y · net ${Math.max(0, b.dogru - b.yanlis / 4).toFixed(2)}` : ""}</span> : null}</div>
        </div>
        {done
          ? <Badge tone="success" icon="check">Bitti</Badge>
          : prog
          ? <div className="row" style={{ gap: 8 }}><Badge tone="warning" icon="clock">Devam ediyor</Badge><button className="btn btn-primary btn-sm" onClick={() => finishBlock(d, b)}><Icon name="check" size={14} stroke={3} />Bitir</button></div>
          : <button className="btn btn-light btn-sm" onClick={() => startBlock(d, b)}><Icon name="bolt" size={14} />Başla</button>}
      </div>
    );
  };

  return (
    <div className="stack rise">
      <PageHead title="Çalışma Programı" sub="Koçunla planladığın haftalık çalışma takvimi" actions={
        <div className="row" style={{ gap: 8 }}>
          <div className="seg" style={{ width: "fit-content" }}>
            <button className={view === "day" ? "on" : ""} onClick={() => setView("day")}><Icon name="calendar" size={15} />Gün</button>
            <button className={view === "week" ? "on" : ""} onClick={() => setView("week")}><Icon name="dashboard" size={15} />Hafta</button>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setAddOpen(true)}><Icon name="plus" size={16} />Çalışma bloğu ekle</button>
        </div>
      } />

      {view === "week" ? (
        <Section title="Haftanın Tümü" sub="Tüm haftalık çalışma programın tek bakışta" action={<Badge tone="muted" icon="calendar">{sessions} blok</Badge>}>
          <div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
            {(() => {
              const toMin = (s) => { const [h, m] = s.split(":").map(Number); return h * 60 + (m || 0); };
              const all = days.flatMap((d) => blocksOf(d));
              const minStart = Math.min(...all.map((b) => toMin(b.t)), 9 * 60);
              const maxEnd = Math.max(...all.map((b) => toMin(b.e)), 18 * 60);
              const startH = Math.floor(minStart / 60);
              const endH = Math.ceil(maxEnd / 60);
              const HOUR = 56;
              const gridH = (endH - startH) * HOUR;
              const hours = Array.from({ length: endH - startH + 1 }, (_, i) => startH + i);
              return (
                <div className="wk-cal" style={{ minWidth: 760 }}>
                  <div className="wk-corner" />
                  {days.map((d) => (
                    <div key={d} className={`wk-dayhead${d === TODAY_KEY ? " today" : ""}`}>
                      <span>{d}</span>
                      {d === TODAY_KEY ? <span className="wk-todaydot" /> : null}
                    </div>
                  ))}
                  <div className="wk-gutter" style={{ height: gridH }}>
                    {hours.map((h) => <div key={h} className="wk-hour" style={{ height: HOUR }}><span>{String(h).padStart(2, "0")}:00</span></div>)}
                  </div>
                  {days.map((d) => (
                    <div key={d} className={`wk-col${d === TODAY_KEY ? " today" : ""}`} style={{ height: gridH }}>
                      {hours.slice(0, -1).map((h) => <div key={h} className="wk-line" style={{ top: (h - startH) * HOUR }} />)}
                      {blocksOf(d).map((b, i) => {
                        const top = (toMin(b.t) - startH * 60) / 60 * HOUR;
                        const h = Math.max(26, (toMin(b.e) - toMin(b.t)) / 60 * HOUR - 3);
                        const c = SUBJECT_COLORS[b.subj] || "var(--primary)";
                        const done = isDone(d, b);
                        const prog = isProg(d, b);
                        return (
                          <button key={i} className={`wk-block${done ? " done" : ""}`} style={{ top, height: h, background: `color-mix(in srgb, ${c} 14%, var(--surface))`, borderColor: c }} title={`${b.t}–${b.e} · ${b.topic}`} onClick={() => done ? null : prog ? finishBlock(d, b) : startBlock(d, b)}>
                            <span className="wk-block-bar" style={{ background: c }} />
                            <span className="wk-block-in">
                              <span className="wk-block-time tnum">{b.t}</span>
                              <span className="wk-block-topic">{b.topic}</span>
                              <span className="wk-block-subj" style={{ color: c }}>{done ? "✓ " : prog ? "● " : ""}{b.subj}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </Section>
      ) : (
      <>
      <div className="seg" style={{ width: "fit-content", flexWrap: "wrap" }}>
        {days.map((d) => (
          <button key={d} className={day === d ? "on" : ""} onClick={() => setDay(d)}>
            {d}{d === TODAY_KEY ? <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--primary)", display: "inline-block" }} /> : null}
          </button>
        ))}
        <button onClick={() => setView("week")} title="Haftanın tamamını gör" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Icon name="dashboard" size={14} />Tüm hafta</button>
      </div>

      <div className="grid col-main">
        <Section title={DAYS_FULL[day]} sub={`${blocks.length} çalışma bloğu`} action={day === TODAY_KEY ? <Badge tone="primary" dot>Bugün</Badge> : null}>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {blocks.map((b, i) => <BlockCard key={i} d={day} b={b} />)}
          </div>
        </Section>

        <div className="stack">
          <div className="grid g-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <StatCard icon="clock" tone="primary" value={`${totalH}s`} label="Bu hafta plan" />
            <StatCard icon="calendar" tone="info" value={sessions} label="Toplam blok" />
          </div>
          <Section title="Haftalık Çalışma" sub="Günlük tamamlanan saat">
            <div className="card-body">
              <BarChart data={STUDENT_WEEK} max={6} peakIdx={5} />
            </div>
          </Section>
        </div>
      </div>
      </>
      )}

      <AddBlockModal open={addOpen} day={day} onClose={() => setAddOpen(false)} onAdd={addBlock} />
      <SchoolScheduleEditor student={me} />
      <SchoolExams student={me} editable />
    </div>
  );
}

/* ---------------- Denemeler ---------------- */
function ExamsPage() {
  const [sel, setSel] = useState(EXAM_HISTORY[0].id);
  const [manual, setManual] = useState(false);
  const [kayit, setKayit] = useState(false);
  const [tab, setTab] = useState(() => { const h = (typeof window !== "undefined") && window.__ukExamTab; if (h) { window.__ukExamTab = null; return h; } return "sonuclar"; });
  const exam = EXAM_HISTORY.find((e) => e.id === sel);
  const nets = [...EXAM_HISTORY].reverse().map((e) => e.net);
  const avg = (EXAM_HISTORY.reduce((s, e) => s + e.net, 0) / EXAM_HISTORY.length).toFixed(1);
  const best = Math.max(...EXAM_HISTORY.map((e) => e.net));

  return (
    <div className="stack rise">
      <PageHead title="Denemeler" sub="Deneme sonuçların ve net analizin" actions={
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-light btn-sm" onClick={() => setKayit(true)}><Icon name="calendar" size={15} />Denemeye kayıt ol</button>
          <button className="btn btn-primary btn-sm" onClick={() => setManual(true)}><Icon name="plus" size={16} />Sonuç gir</button>
        </div>
      } />

      <div className="seg" style={{ width: "fit-content", flexWrap: "wrap" }}>
        <button className={tab === "sonuclar" ? "on" : ""} onClick={() => setTab("sonuclar")}><Icon name="chart" size={16} />Sonuçlar</button>
        <button className={tab === "analiz" ? "on" : ""} onClick={() => setTab("analiz")}><Icon name="target" size={16} />Analiz</button>
        <button className={tab === "online" ? "on" : ""} onClick={() => setTab("online")}><Icon name="notebook" size={16} />Online Deneme</button>
      </div>

      <ManualExamModal open={manual} onClose={() => setManual(false)} role="student" />
      {typeof DenemeKayitModal === "function" ? <DenemeKayitModal open={kayit} onClose={() => setKayit(false)} /> : null}

      {typeof NetGainMap === "function" ? <NetGainMap role="student" /> : null}

      {tab === "analiz" ? <StudentImportedAnalysis /> : tab === "online" ? <StudentOnlineExams /> : (
      <>
      <div className="grid g-4">
        <StatCard icon="chart" tone="primary" value={EXAM_HISTORY.length} label="Toplam deneme" />
        <StatCard icon="target" tone="info" value={avg} label="Ortalama net" />
        <StatCard icon="award" tone="success" value={best} label="En yüksek net" />
        <StatCard icon="trend" tone="warning" value={exam.rank} label="Sıralama tahmini" />
      </div>

      <Section title="Net Gelişimi" sub="Son denemelerdeki TYT netlerin" action={<Badge tone="success" icon="trend">+{(nets[nets.length - 1] - nets[0]).toFixed(1)} net</Badge>}>
        <div className="card-body"><Sparkline data={nets} color="var(--primary)" h={84} /></div>
      </Section>

      <div className="grid col-main">
        <Section title="Deneme Geçmişi" sub={`${EXAM_HISTORY.length} sonuç`}>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {EXAM_HISTORY.map((e) => {
              const on = e.id === sel;
              const up = parseFloat(e.delta) >= 0;
              return (
                <button key={e.id} className="lrow" style={{ borderColor: on ? "var(--primary)" : "var(--border)", boxShadow: on ? "0 0 0 3px var(--ring)" : "none", textAlign: "left", cursor: "pointer" }} onClick={() => setSel(e.id)}>
                  <span className="lr-icon" style={{ background: "var(--primary-soft)", color: "var(--primary-600)" }}><Icon name="chart" size={19} /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="lr-title">{e.name}</div>
                    <div className="lr-meta"><span className="badge badge-muted" style={{ height: 19, fontSize: 10 }}>{e.type}</span><span className="d">{e.pub}</span><span className="d">{e.date}</span></div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="tnum" style={{ fontSize: 18, fontWeight: 800 }}>{e.net}</div>
                    <span className={`delta ${up ? "up" : "down"}`} style={{ fontSize: 11 }}><Icon name={up ? "arrowUp" : "arrowDown"} size={12} />{e.delta}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </Section>

        <Section title="Net Dağılımı" sub={exam.name} action={<Badge tone="primary">{exam.net} net</Badge>}>
          <div className="card-body subj">
            {exam.parts.map((p, i) => {
              const pct = Math.round((p.net / p.max) * 100);
              return (
                <div className="subj-row" key={i}>
                  <div className="between" style={{ marginBottom: 8 }}>
                    <span className="sname">{p.n}</span>
                    <span className="tnum" style={{ fontSize: 12.5, fontWeight: 800, whiteSpace: "nowrap" }}>{p.net} <span className="muted" style={{ fontWeight: 600 }}>/ {p.max}</span></span>
                  </div>
                  <Bar value={pct} color="var(--primary)" />
                  <div className="row" style={{ gap: 14, marginTop: 8, fontSize: 11.5, fontWeight: 600, flexWrap: "wrap" }}>
                    <span style={{ color: "var(--success)", whiteSpace: "nowrap" }}>✓ {p.c} doğru</span>
                    <span style={{ color: "var(--danger)", whiteSpace: "nowrap" }}>✕ {p.w} yanlış</span>
                    <span className="muted" style={{ whiteSpace: "nowrap" }}>○ {p.b} boş</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      </div>
      </>
      )}
    </div>
  );
}

Object.assign(window, { PageHead, TopicsPage, SchedulePage, ExamsPage });
