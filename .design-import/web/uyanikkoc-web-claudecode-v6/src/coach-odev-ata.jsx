/* Klavyeden yazılabilir stepper + Akordeon yapılı Ödev Ata modalı */
/* Konu grupları artık curriculum.jsx store'undan (useCurriculum) okunur */

/* ---- Klavyeden yazılabilir + butonlu sayı girişi ---- */
function NumStepper({ value, onChange, step = 10, min = 0, max = 9999, size, oa }) {
  const [text, setText] = useState(String(value));
  useEffect(() => { setText(String(value)); }, [value]);
  const commit = (raw) => {
    let n = parseInt(String(raw).replace(/[^\d]/g, ""), 10);
    if (isNaN(n)) n = min;
    n = Math.max(min, Math.min(max, n));
    onChange(n);
    setText(String(n));
  };
  return (
    <div className={oa ? "oa-stepper" : `stepper${size === "sm" ? " stepper-sm" : ""}`} onClick={(e) => e.stopPropagation()}>
      <button type="button" onClick={() => commit(value - step)} aria-label="Azalt">−</button>
      <input
        className="stepper-input tnum"
        value={text}
        onChange={(e) => setText(e.target.value.replace(/[^\d]/g, ""))}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { commit(e.target.value); e.currentTarget.blur(); } }}
        inputMode="numeric"
        aria-label="Hedef değeri"
      />
      <button type="button" onClick={() => commit(value + step)} aria-label="Artır">+</button>
    </div>
  );
}

/* ---- Ödev Ata Modalı (iki panelli: ders rail + konu detayı) ---- */
function OdevAtaModal({ open, onClose, studentName, examType, initialSubject, initialTopic, onAssign, bulkRoster, defaultAll }) {
  const CURR = useCurriculum(examType || "YKS");
  const SUBJ = Object.keys(CURR);
  const rosterNames = (bulkRoster || []).map((r) => r.name);
  const [recipients, setRecipients] = useState([]);
  const [active, setActive] = useState(initialSubject || "Türkçe");
  const [sel, setSel] = useState({});       // "Ders::Konu" -> soru
  const [done, setDone] = useState(false);
  const [defSoru, setDefSoru] = useState(30);
  const [defTest, setDefTest] = useState(5);
  const [note, setNote] = useState("");
  const [due, setDue] = useState("");
  const [types, setTypes] = useState(["soru"]);
  const [srcBySubj, setSrcBySubj] = useState({});   // ders -> kaynak
  const [srcSearch, setSrcSearch] = useState("");
  const [srcOpen, setSrcOpen] = useState(false);
  const [srcPub, setSrcPub] = useState("Tümü");   // kaynak pop: yayınevi filtresi

  const fixedCount = EXAM_SORU[examType || "YKS"] || 120;
  const hasSoru = types.includes("soru");
  const hasTest = types.includes("test");
  const showCount = hasSoru || hasTest;
  const unitSoru = hasSoru;            // soru seçiliyse soru birimi, sadece test ise test (adet)
  const unitLabel = unitSoru ? "soru" : "test";
  const cStep = unitSoru ? 10 : 1;
  const cMax = unitSoru ? 500 : 50;
  const defCount = unitSoru ? defSoru : defTest;
  const needsResult = hasSoru || hasTest;

  useEffect(() => {
    if (open) {
      setActive(initialSubject || "Türkçe");
      setDone(false);
      setNote(""); setDue(""); setTypes(["soru"]); setSrcBySubj({}); setSrcSearch(""); setSrcPub("Tümü");
      setRecipients(defaultAll ? rosterNames : (studentName ? [studentName] : []));
      if (initialSubject && initialTopic) setSel({ [`${initialSubject}::${initialTopic}`]: 30 });
      else setSel({});
    }
  }, [open, initialSubject, initialTopic]); // eslint-disable-line

  if (!open) return null;
  const isBulk = (bulkRoster || []).length > 0;
  const srcStudent = recipients[0] || studentName;
  const toggleRecipient = (n) => setRecipients((p) => p.includes(n) ? p.filter((x) => x !== n) : [...p, n]);
  const allOn = rosterNames.length > 0 && recipients.length === rosterNames.length;

  const toggleType = (k) => setTypes((p) => p.includes(k) ? (p.length > 1 ? p.filter((x) => x !== k) : p) : [...p, k]);

  const key = (s, k) => `${s}::${k}`;
  const toggle = (s, k) => setSel((p) => {
    const kk = key(s, k);
    const n = { ...p };
    if (n[kk] != null) delete n[kk]; else n[kk] = defCount;
    return n;
  });
  const setSoru = (s, k, v) => setSel((p) => ({ ...p, [key(s, k)]: v }));
  const groupAll = (s, konular, on) => setSel((p) => {
    const n = { ...p };
    konular.forEach((k) => { if (on) n[key(s, k)] = n[key(s, k)] ?? defCount; else delete n[key(s, k)]; });
    return n;
  });

  const selKeys = Object.keys(sel);
  const totalSoru = selKeys.reduce((a, k) => a + (sel[k] || 0), 0);
  const subjSelCount = (s) => selKeys.filter((k) => k.startsWith(s + "::")).length;

  // aktif dersin kaynakları — ulusal katalogdan (sınav-farkındalıklı) + öğrencinin özel kaynakları
  const examKey = (examType === "LGS") ? "LGS" : "YKS";
  const _norm = (s) => (s || "").toLocaleLowerCase("tr-TR");
  const srcPubOpts = katalogPublishers({ exam: examKey, subject: active });
  const catalogHits = katalogList({ exam: examKey, subject: active, pub: srcPub, q: srcSearch });
  const mineSet = new Set(getSources(srcStudent));
  // öğrencide olan kitaplar — bu derse uygun olanlar önce listelenir (durum + ilerleme ile)
  const studentItems = (typeof getSourceItems === "function") ? getSourceItems(srcStudent) : getSources(srcStudent).map((n) => ({ name: n, status: "beklemede", progress: 0 }));
  const studentForActive = studentItems.filter((it) => {
    const k = katalogByLabel(it.name);
    const subjOk = k ? k.s === active : true;
    return subjOk && srcPub === "Tümü" && _norm(it.name).includes(_norm(srcSearch));
  });
  const studentNameSet = new Set(studentForActive.map((it) => it.name));
  const myCustom = getSources(srcStudent).filter((s) => !katalogByLabel(s) && srcPub === "Tümü" && _norm(s).includes(_norm(srcSearch)));
  const activeSource = srcBySubj[active] || "";
  const activeItem = studentItems.find((it) => it.name === activeSource) || null;
  const activeCat = activeSource ? (typeof katalogByLabel === "function" && katalogByLabel(activeSource)) : null;
  const targets = isBulk ? recipients : (studentName ? [studentName] : []);
  const canAssign = selKeys.length > 0 && targets.length > 0;

  const assign = () => {
    if (!canAssign) return;
    const stamp = Date.now();
    const records = [];
    targets.forEach((stu, si) => {
      selKeys.forEach((k, i) => {
        const subject = k.split("::")[0], topic = k.split("::")[1];
        const src = srcBySubj[subject] || (sourcesForSubject(subject, stu)[0] || "");
        const count = sel[k];
        const primary = hasSoru ? "soru" : hasTest ? "test" : types[0];
        records.push({ id: "o" + stamp + "_" + si + "_" + i, student: stu, week: "w0", subject, topic, source: src, count, type: primary, types: [...types], note, due, status: "pending", result: null, assignedAt: stamp });
      });
    });
    addOdevler(records);
    onAssign && onAssign(records.map((r) => ({ subject: r.subject, topic: r.topic, soru: r.count })), note, due, targets);
    if (isBulk && typeof toast === "function") toast(`${selKeys.length} görev ${targets.length} öğrenciye atandı`);
    setDone(true);
    setTimeout(() => { setDone(false); onClose(); }, 1400);
  };

  return ReactDOM.createPortal((
    <div className="oa-overlay" onClick={onClose}>
      <div className="oa-sheet" onClick={(e) => e.stopPropagation()}>
        {/* header */}
        <div className="oa-head">
          <span className="ic"><Icon name="clipboard" size={19} /></span>
          <div className="tx">
            <h3>{isBulk ? "Toplu Ödev Ata" : "Ödev Ata"}</h3>
            <p>{isBulk ? `${recipients.length} öğrenci · derslere ve konulara ata` : `${studentName} · derslere ve konulara ata`}</p>
          </div>
          <button className="oa-x" onClick={onClose} aria-label="Kapat"><Icon name="plus" size={18} style={{ transform: "rotate(45deg)" }} /></button>
        </div>

        {/* config */}
        <div className="oa-config">
          {isBulk ? (
            <div className="oa-field">
              <span className="oa-label">Kime<span className="sub">{recipients.length}/{rosterNames.length}</span></span>
              <div className="oa-chips">
                {(bulkRoster || []).map((r) => {
                  const on = recipients.includes(r.name);
                  return <button key={r.name} type="button" className={"oa-chip" + (on ? " on" : "")} onClick={() => toggleRecipient(r.name)}><span className="tick"><Icon name="check" size={11} stroke={3} /></span>{r.name}</button>;
                })}
              </div>
              <button type="button" className="oa-allbtn" onClick={() => setRecipients(allOn ? [] : [...rosterNames])}>{allOn ? "Seçimi kaldır" : "Tümünü seç"}</button>
            </div>
          ) : null}

          <div className="oa-field">
            <span className="oa-label">Tür</span>
            <div className="oa-chips">
              {Object.entries(ODEV_TYPES).map(([k, v]) => (
                <button key={k} type="button" className={"oa-chip" + (types.includes(k) ? " on" : "")} onClick={() => toggleType(k)}>
                  <span className="tick"><Icon name="check" size={11} stroke={3} /></span>
                  <Icon name={v.icon} size={14} />{v.label}
                </button>
              ))}
            </div>
          </div>

          <div className="oa-field">
            <span className="oa-label">Kaynak<span className="sub">{active}</span></span>
            <div className="oa-srcwrap">
              <button type="button" className="oa-srctrigger" onClick={() => { setSrcOpen((o) => !o); setSrcSearch(""); }}>
                <Icon name="book" size={15} style={{ color: "var(--muted)", flexShrink: 0 }} />
                <span className={"lbl" + (activeSource ? "" : " ph")}>{activeSource || "Otomatik (derse göre)"}</span>
                <Icon name="chevronDown" size={15} style={{ color: "var(--faint)" }} />
              </button>
              {srcOpen ? (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 5 }} onClick={() => setSrcOpen(false)} />
                  <div className="oa-pop">
                    <div className="oa-popsearch"><Icon name="search" size={15} style={{ color: "var(--muted)" }} /><input autoFocus placeholder={`${active} kaynağı ara...`} value={srcSearch} onChange={(e) => setSrcSearch(e.target.value)} /></div>
                    {srcPubOpts.length > 1 ? (
                      <div className="oa-pubs">
                        <button type="button" className={"oa-pub" + (srcPub === "Tümü" ? " on" : "")} onClick={() => setSrcPub("Tümü")}>Tümü</button>
                        {srcPubOpts.map((p) => <button key={p} type="button" className={"oa-pub" + (srcPub === p ? " on" : "")} onClick={() => setSrcPub(p)}>{p}</button>)}
                      </div>
                    ) : null}
                    <div className="oa-poplist">
                      <button type="button" className="oa-srcitem" onClick={() => { setSrcBySubj((p) => ({ ...p, [active]: "" })); setSrcOpen(false); }}>
                        <span className="ic" style={{ color: "var(--muted)" }}><Icon name="bolt" size={14} /></span>
                        <div className="body"><span className="t1">Otomatik (derse göre)</span><span className="t2">öğrencinin kaynağına göre seçilir</span></div>
                      </button>
                      {(studentForActive.length > 0 || myCustom.filter((s) => !studentNameSet.has(s)).length > 0) ? <div className="oa-grouphd">Öğrencide olanlar</div> : null}
                      {studentForActive.map((it) => {
                        const k = katalogByLabel(it.name); const tur = k ? (KAYNAK_TUR[k.t] || KAYNAK_TUR.soru) : null;
                        const dur = (typeof KAYNAK_DURUM !== "undefined" && KAYNAK_DURUM[it.status]) || { label: "", tone: "muted" };
                        const dcol = { muted: "var(--faint)", info: "var(--info)", success: "var(--success)" }[dur.tone] || "var(--muted)";
                        return (
                          <button key={it.name} type="button" className={"oa-srcitem" + (activeSource === it.name ? " on" : "")} onClick={() => { setSrcBySubj((p) => ({ ...p, [active]: it.name })); setSrcOpen(false); }}>
                            <span className="ic" style={{ color: "var(--primary)" }}><Icon name={tur ? tur.icon : "book"} size={14} /></span>
                            <div className="body"><span className="t1">{k ? k.n : it.name}</span><span className="t2">{k ? `${k.p} · ` : "Özel · "}<span style={{ color: dcol, fontWeight: 700 }}>{dur.label} · %{it.progress}</span></span></div>
                            <span className="mini"><span style={{ width: it.progress + "%", background: dcol }} /></span>
                          </button>
                        );
                      })}
                      {myCustom.filter((s) => !studentNameSet.has(s)).map((s) => (
                        <button key={s} type="button" className={"oa-srcitem" + (activeSource === s ? " on" : "")} onClick={() => { setSrcBySubj((p) => ({ ...p, [active]: s })); setSrcOpen(false); }}>
                          <span className="ic" style={{ color: "var(--faint)" }}><Icon name="book" size={14} /></span>
                          <div className="body"><span className="t1">{s}</span><span className="t2">özel kaynak</span></div>
                        </button>
                      ))}
                      {catalogHits.filter((k) => !studentNameSet.has(kLabel(k))).length > 0 ? <div className="oa-grouphd">Katalog · {catalogHits.filter((k) => !studentNameSet.has(kLabel(k))).length}</div> : null}
                      {catalogHits.filter((k) => !studentNameSet.has(kLabel(k))).slice(0, 60).map((k) => {
                        const label = kLabel(k); const tur = KAYNAK_TUR[k.t] || KAYNAK_TUR.soru;
                        return (
                          <button key={k.id} type="button" className={"oa-srcitem" + (activeSource === label ? " on" : "")} onClick={() => { setSrcBySubj((p) => ({ ...p, [active]: label })); setSrcOpen(false); }}>
                            <span className="ic" style={{ color: "var(--primary)" }}><Icon name={tur.icon} size={14} /></span>
                            <div className="body"><span className="t1">{k.n}</span><span className="t2">{k.p} · {tur.short} · {k.soru > 0 ? `${k.soru.toLocaleString("tr-TR")} soru` : "Konu anlatımı"}</span></div>
                          </button>
                        );
                      })}
                      {catalogHits.length === 0 && studentForActive.length === 0 && myCustom.length === 0 ? <div className="oa-popempty">Sonuç yok</div> : null}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
            {showCount ? (
              <div className="oa-default">
                <span>Varsayılan {unitLabel}</span>
                {unitSoru ? <NumStepper oa value={defSoru} onChange={setDefSoru} step={10} min={0} max={500} /> : <NumStepper oa value={defTest} onChange={setDefTest} step={1} min={0} max={50} />}
              </div>
            ) : null}
          </div>

          {activeSource ? (() => {
            const dur = activeItem ? ((typeof KAYNAK_DURUM !== "undefined" && KAYNAK_DURUM[activeItem.status]) || null) : null;
            const dcol = dur ? ({ muted: "var(--faint)", info: "var(--info)", success: "var(--success)" }[dur.tone] || "var(--muted)") : "var(--muted)";
            return (
              <div className="oa-srcinfo">
                <Icon name="book" size={14} style={{ color: "var(--primary)", flexShrink: 0 }} />
                <span className="nm">{activeSource}</span>
                {activeCat ? <span className="sb">{activeCat.soru > 0 ? `${activeCat.soru.toLocaleString("tr-TR")} soru` : "Konu anlatımı"}</span> : null}
                {activeItem ? (
                  <span className="st" style={{ color: dcol }}>
                    <Icon name={(dur || {}).icon || "book"} size={12} />{(dur || {}).label} · %{activeItem.progress}
                    <span className="prog"><span style={{ width: activeItem.progress + "%", background: dcol }} /></span>
                  </span>
                ) : <span className="warn"><Icon name="alert" size={12} />öğrencinin listesinde yok</span>}
              </div>
            );
          })() : null}
        </div>

        {/* main: ders rayı + konu seçimi */}
        <div className="oa-main">
          <div className="oa-rail">
            {SUBJ.map((s) => {
              const c = SUBJECT_COLORS[s]; const on = active === s; const n = subjSelCount(s);
              return (
                <button key={s} type="button" className={"oa-subj" + (on ? " on" : "")} onClick={() => { setActive(s); setSrcPub("Tümü"); setSrcSearch(""); }}>
                  <span className="sw" style={{ background: c }} />
                  <span className="nm" style={{ color: on ? c : "var(--text)" }}>{s}</span>
                  {n > 0 ? <span className="ct" style={{ background: c }}>{n}</span> : <Icon name="chevronRight" size={15} style={{ color: "var(--faint)" }} />}
                </button>
              );
            })}
          </div>

          <div className="oa-topics">
            <div className="oa-topics-head"><span className="sw" style={{ background: SUBJECT_COLORS[active] }} /><b>{active}</b><span>{CURR[active].length} grup</span></div>
            {CURR[active].map((g) => {
              const allOnG = g.konular.length > 0 && g.konular.every((k) => sel[key(active, k)] != null);
              const someOn = g.konular.some((k) => sel[key(active, k)] != null);
              return (
                <div className="oa-grp" key={g.grup}>
                  <button type="button" className="oa-grp-head" onClick={() => groupAll(active, g.konular, !allOnG)}>
                    <span className={"oa-chk" + (allOnG ? " on" : someOn ? " part" : "")}><Icon name={allOnG ? "check" : "plus"} size={12} stroke={3} /></span>
                    <span className="nm">{g.grup}</span><span className="ct">{g.konular.length} konu</span>
                    <span className="act">{allOnG ? "tümünü kaldır" : "tümünü seç"}</span>
                  </button>
                  <div className="oa-grp-topics">
                    {g.konular.map((k) => {
                      const on = sel[key(active, k)] != null;
                      return (
                        <div className={"oa-topic" + (on ? " on" : "")} key={k} onClick={() => toggle(active, k)}>
                          <span className={"oa-chk" + (on ? " on" : "")} onClick={(e) => { e.stopPropagation(); toggle(active, k); }}><Icon name="check" size={12} stroke={3} /></span>
                          <span className="nm">{k}</span>
                          {on
                            ? (showCount
                                ? <NumStepper oa value={sel[key(active, k)]} onChange={(v) => setSoru(active, k, v)} step={cStep} min={0} max={cMax} />
                                : <span className="badge badge-success" style={{ height: 22 }}><Icon name="check" size={12} stroke={3} />seçildi</span>)
                            : <span className="pickhint">seç</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* footer */}
        <div className="oa-foot">
          <div className="oa-note"><Icon name="message" size={15} style={{ color: "var(--muted)", flexShrink: 0 }} /><input placeholder="Not ekle (opsiyonel)" value={note} onChange={(e) => setNote(e.target.value)} /></div>
          <label className="oa-date" title="Bitiş tarihi (opsiyonel)">
            <Icon name="calendar" size={15} style={{ color: "var(--muted)", flexShrink: 0 }} />
            <input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
            {due ? <button type="button" className="clear" onClick={() => setDue("")} aria-label="Tarihi temizle"><Icon name="plus" size={13} style={{ transform: "rotate(45deg)" }} /></button> : null}
          </label>
          <div className="oa-summary"><div className="big tnum">{selKeys.length} konu{(hasSoru || hasTest) ? ` · ${totalSoru} ${unitLabel}` : ""}</div><div className="sm">atanacak</div></div>
          <button type="button" className={"oa-assign" + (done ? " done" : "")} disabled={!canAssign} onClick={assign}>
            <Icon name={done ? "check" : "send"} size={16} />{done ? "Atandı!" : (isBulk ? `${recipients.length} Öğrenciye Ata` : "Ödevi Ata")}
          </button>
        </div>
      </div>
    </div>
  ), document.body);
}

Object.assign(window, { NumStepper, OdevAtaModal });
