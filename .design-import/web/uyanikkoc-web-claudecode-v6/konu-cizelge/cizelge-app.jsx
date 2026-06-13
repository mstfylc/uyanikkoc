/* Yıllık Konu Takip Çizelgesi — koç paneli ızgarası
   KonuCizelge: yeniden kullanılabilir çekirdek (ders sekmeleri + ızgara kartı).
   Hem tam-ekran (CizelgePage) hem de Konu Takibi sayfasında gömülü kullanılır. */
/* React hooks erişimi: React.useState / useMemo / useEffect / useRef */

/* ---- yardımcılar ---- */
function cizRate(s, d) { return s > 0 ? d / s : 0; }
function cizHeat(s, d) {
  if (s === 0) return "";
  const r = d / s;
  if (r >= 0.85) return "heat-a";
  if (r >= 0.70) return "heat-b";
  if (r >= 0.55) return "heat-c";
  return "heat-d";
}
function cizNet(s, d) { const n = d - (s - d) / 4; return Math.round(n * 100) / 100; }
function cizHeatBg(r) { return r >= 0.85 ? "var(--success-soft)" : r >= 0.70 ? "#EAF4ED" : r >= 0.55 ? "var(--warning-soft)" : "var(--danger-soft)"; }
function cizHeatFg(r) { return r >= 0.85 ? "var(--success)" : r >= 0.70 ? "#2F7A4E" : r >= 0.55 ? "var(--warning)" : "var(--danger)"; }

/* ---- görünüm sütunları ---- */
function buildColumns(view, topicsSessions, weekIdx) {
  if (view === "tekrar") {
    let maxRep = 0;
    Object.values(topicsSessions).forEach((arr) => { if (arr.length > maxRep) maxRep = arr.length; });
    maxRep = Math.max(maxRep, 52);
    const cols = [];
    for (let i = 0; i < maxRep; i++) cols.push({ key: "r" + i, label: (i + 1) + ".", sub: null });
    return { cols, kind: "tekrar" };
  }
  if (view === "gun") {
    const mon = cizMonday(weekIdx);
    const cols = [];
    for (let dow = 0; dow < 7; dow++) {
      const d = new Date(mon); d.setDate(mon.getDate() + dow);
      cols.push({ key: "d" + dow, label: CIZ_DAYS[dow], sub: d.getDate() + "", date: d, dow });
    }
    return { cols, kind: "gun" };
  }
  const cols = [];
  for (let w = 0; w < CIZ_WEEKS; w++) cols.push({ key: "w" + w, label: (w + 1) + ". Hf", sub: null, w });
  return { cols, kind: "hafta" };
}

function cellFor(kind, sessions, col) {
  if (kind === "tekrar") {
    const idx = parseInt(col.key.slice(1), 10);
    const ses = sessions[idx];
    return ses ? { s: ses.soru, d: ses.dogru, sessions: [ses], single: ses } : null;
  }
  if (kind === "gun") {
    const day = col.date;
    const m = sessions.filter((x) => x.date.getFullYear() === day.getFullYear() && x.date.getMonth() === day.getMonth() && x.date.getDate() === day.getDate());
    if (!m.length) return null;
    return { s: m.reduce((a, x) => a + x.soru, 0), d: m.reduce((a, x) => a + x.dogru, 0), sessions: m };
  }
  const m = sessions.filter((x) => x.w === col.w);
  if (!m.length) return null;
  return { s: m.reduce((a, x) => a + x.soru, 0), d: m.reduce((a, x) => a + x.dogru, 0), sessions: m };
}

/* ---- localStorage override hook (paylaşımlı) ---- */
function useCizOverrides() {
  const [overrides, setOverrides] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem("cz-overrides") || "{}"); } catch (e) { return {}; }
  });
  React.useEffect(() => { try { localStorage.setItem("cz-overrides", JSON.stringify(overrides)); } catch (e) {} }, [overrides]);
  return [overrides, setOverrides];
}

/* ================= POPOVER ================= */
function CellPopover({ anchor, kind, topic, col, cell, editable, onSave, onClose }) {
  const single = cell && cell.single;
  const [sv, setSv] = React.useState(single ? String(single.soru) : "");
  const [dv, setDv] = React.useState(single ? String(single.dogru) : "");
  const popRef = React.useRef(null);
  const [pos, setPos] = React.useState({ left: -9999, top: -9999 });

  React.useEffect(() => {
    if (!anchor) return;
    const r = anchor.getBoundingClientRect();
    const W = 268, H = popRef.current ? popRef.current.offsetHeight : 220;
    let left = r.left + r.width / 2 - W / 2;
    left = Math.max(12, Math.min(left, window.innerWidth - W - 12));
    let top = r.bottom + 8;
    if (top + H > window.innerHeight - 12) top = r.top - H - 8;
    setPos({ left, top });
  }, [anchor, cell]);

  const sN = parseInt(sv, 10), dN = parseInt(dv, 10);
  const sHas = sv.trim() !== "" && !isNaN(sN);
  const dHas = dv.trim() !== "" && !isNaN(dN);
  const sNeg = sHas && sN < 0, dNeg = dHas && dN < 0;
  const exceeds = sHas && dHas && dN > sN;
  const valid = sHas && dHas && !sNeg && !dNeg && !exceeds;
  const errMsg = (sNeg || dNeg) ? "Değerler negatif olamaz."
    : exceeds ? "Doğru sayısı, soru sayısından fazla olamaz."
    : (!sHas || !dHas) ? "Soru ve doğru sayısını girin." : "";
  const periodLabel = kind === "tekrar" ? (parseInt(col.key.slice(1), 10) + 1) + ". tekrar"
    : kind === "gun" ? cizFmtFull(col.date) : col.label;

  return ReactDOM.createPortal(
    <div className="cz-pop-overlay" onMouseDown={onClose}>
      <div ref={popRef} className="cz-pop" style={{ left: pos.left, top: pos.top }} onMouseDown={(e) => e.stopPropagation()}>
        <h4>{topic}</h4>
        <div className="psub">{periodLabel}{cell && cell.sessions.length > 1 ? ` · ${cell.sessions.length} oturum` : ""}</div>

        {kind === "tekrar" && editable ? (
          <React.Fragment>
            <div className="fields">
              <div className="f"><label>Soru <span className="req">*</span></label><input className={sNeg ? "err" : ""} type="number" min="0" value={sv} onChange={(e) => setSv(e.target.value)} autoFocus /></div>
              <div className="f"><label>Doğru <span className="req">*</span></label><input className={(exceeds || dNeg) ? "err" : ""} type="number" min="0" value={dv} onChange={(e) => setDv(e.target.value)} /></div>
            </div>
            {errMsg
              ? <div className="cz-err"><Icon name="alert" size={14} />{errMsg}</div>
              : <div className="netbox"><span className="l">Net <span style={{ opacity: .7 }}>(yanlış ÷ 4)</span></span><span className="v" style={{ color: "var(--primary)" }}>{cizNet(sN, dN)}</span></div>}
            <div className="actions">
              <button className="btn btn-light btn-sm grow" onClick={onClose}>Vazgeç</button>
              <button className="btn btn-primary btn-sm grow" disabled={!valid} onClick={() => valid && onSave(sN, dN)}><Icon name="check" size={15} />Kaydet</button>
            </div>
          </React.Fragment>
        ) : (
          <React.Fragment>
            {cell ? (
              <React.Fragment>
                <div className="netbox" style={{ marginTop: 13 }}>
                  <span className="l">Toplam</span>
                  <span className="v">{cell.s} soru · <span style={{ color: "var(--success)" }}>{cell.d} doğru</span> · %{Math.round(cizRate(cell.s, cell.d) * 100)}</span>
                </div>
                <div className="cz-brk">
                  {cell.sessions.map((x) => (
                    <div className="cz-brk-row" key={x.id}>
                      <span className="dt">{cizFmtFull(x.date)}</span>
                      <span className="vals"><span className="sv">{x.soru} S</span><span style={{ color: cizRate(x.soru, x.dogru) >= 0.7 ? "var(--success)" : "var(--warning)" }}>{x.dogru} D</span></span>
                    </div>
                  ))}
                </div>
              </React.Fragment>
            ) : <div className="cz-brk-empty">Bu dönemde kayıt yok.</div>}
            <div className="actions"><button className="btn btn-light btn-sm grow" onClick={onClose}>Kapat</button></div>
          </React.Fragment>
        )}
      </div>
    </div>, document.body);
}

/* ================= ÇEKİRDEK: ders sekmeleri + ızgara ================= */
function KonuCizelge({ maxHeight = "70vh", showTip = true, hideTabs = false, subj: subjProp, onSubj }) {
  const ALL0 = React.useMemo(() => cizBuildAll(), []);
  const subjects = Object.keys(CIZ_CURR);
  const [overrides, setOverrides] = useCizOverrides();

  const [subjState, setSubjState] = React.useState(subjects[0]);
  const subj = subjProp != null ? subjProp : subjState;
  const setSubj = onSubj || setSubjState;
  const [view, setView] = React.useState("tekrar");
  const [weekIdx, setWeekIdx] = React.useState(CIZ_WEEKS - 1);
  const [editMode, setEditMode] = React.useState(true);
  const [q, setQ] = React.useState("");
  const [pop, setPop] = React.useState(null);
  const todayWeek = CIZ_WEEKS - 1;

  const topicsSessions = React.useMemo(() => {
    const o = {};
    CIZ_CURR[subj].flatMap((g) => g.konular).forEach((t) => {
      o[t] = ALL0[subj][t].map((s) => { const ov = overrides[s.id]; return ov ? { ...s, soru: ov.s, dogru: ov.d } : s; });
    });
    return o;
  }, [subj, overrides, ALL0]);

  const { cols, kind } = React.useMemo(() => buildColumns(view, topicsSessions, weekIdx), [view, topicsSessions, weekIdx]);

  const ql = q.trim().toLocaleLowerCase("tr");
  const groups = CIZ_CURR[subj].map((g) => ({
    grup: g.grup, konular: g.konular.filter((t) => !ql || t.toLocaleLowerCase("tr").includes(ql)),
  })).filter((g) => g.konular.length);

  const yearTotal = (topic) => {
    const arr = topicsSessions[topic];
    return { s: arr.reduce((a, x) => a + x.soru, 0), d: arr.reduce((a, x) => a + x.dogru, 0), n: arr.length };
  };
  const colTotals = cols.map((col) => {
    let s = 0, d = 0;
    Object.keys(topicsSessions).forEach((t) => { const c = cellFor(kind, topicsSessions[t], col); if (c) { s += c.s; d += c.d; } });
    return { s, d };
  });
  const grand = Object.keys(topicsSessions).reduce((a, t) => { const y = yearTotal(t); a.s += y.s; a.d += y.d; return a; }, { s: 0, d: 0 });

  const openCell = (e, topic, col, cell) => setPop({ anchor: e.currentTarget, topic, col, cell });
  const saveCell = (sN, dN) => {
    const { topic, col, cell } = pop;
    if (kind === "tekrar") {
      let id;
      if (cell && cell.single) id = cell.single.id;
      else { const arr = topicsSessions[topic]; id = `${subj}:${topic}:new:${arr.length}`; }
      setOverrides((o) => ({ ...o, [id]: { s: sN, d: dN } }));
    }
    setPop(null);
  };
  const color = CIZ_SUBJ_COLOR[subj];
  const scrollRef = React.useRef(null);
  const [collapsed, setCollapsed] = React.useState({});
  const toggleGrp = (grup) => setCollapsed((c) => ({ ...c, [grup]: !c[grup] }));
  const scrollByCols = (dir) => { const el = scrollRef.current; if (!el) return; try { el.scrollTo({ left: el.scrollLeft + dir * 360, behavior: "smooth" }); } catch (e) {} el.scrollLeft += dir * 360; };
  const [scState, setScState] = React.useState({ l: false, r: false, first: 1, last: 1, total: 0 });
  const updateSc = React.useCallback(() => {
    const el = scrollRef.current; if (!el) return;
    const FL = 234, FR = 132;
    const total = el.querySelectorAll("thead .r1 .cz-colhead").length || 0;
    const innerW = Math.max(1, el.scrollWidth - FL - FR);
    const colW = innerW / Math.max(1, total);
    const first = Math.min(total || 1, Math.floor(el.scrollLeft / colW) + 1);
    const visCols = Math.max(1, Math.round((el.clientWidth - FL - FR) / colW));
    const last = Math.min(total || 1, first + visCols - 1);
    setScState({ l: el.scrollLeft > 4, r: el.scrollLeft + el.clientWidth < el.scrollWidth - 4, first, last, total });
  }, []);
  React.useEffect(() => {
    updateSc();
    const el = scrollRef.current; if (!el) return;
    el.addEventListener("scroll", updateSc, { passive: true });
    window.addEventListener("resize", updateSc);
    return () => { el.removeEventListener("scroll", updateSc); window.removeEventListener("resize", updateSc); };
  }, [updateSc, view, subj, q]);

  return (
    <React.Fragment>
      {/* subject tabs */}
      {!hideTabs && (
        <div className="cz-tabs" style={{ marginBottom: 14 }}>
          {subjects.map((s) => {
            const on = s === subj; const c = CIZ_SUBJ_COLOR[s];
            const nTopics = CIZ_CURR[s].reduce((a, g) => a + g.konular.length, 0);
            return (
              <button key={s} className={"cz-tab" + (on ? " on" : "")} style={on ? { background: c } : {}} onClick={() => { setSubj(s); setPop(null); }}>
                {!on && <span className="sw" style={{ background: c }} />}{s}<span className="ct">{nTopics}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="card" style={{ overflow: "hidden" }}>
        <div className="cz-toolbar">
          <div className="cz-seg">
            <button className={view === "tekrar" ? "on" : ""} onClick={() => setView("tekrar")}><Icon name="refresh" size={14} />Tekrar</button>
            <button className={view === "gun" ? "on" : ""} onClick={() => setView("gun")}><Icon name="calendar" size={14} />Günlük</button>
            <button className={view === "hafta" ? "on" : ""} onClick={() => setView("hafta")}><Icon name="dashboard" size={14} />Haftalık</button>
          </div>

          {view === "gun" && (
            <div className="cz-nav">
              <button className="cz-navbtn" disabled={weekIdx <= 0} onClick={() => setWeekIdx((w) => Math.max(0, w - 1))} title="Önceki hafta"><Icon name="chevronRight" size={16} style={{ transform: "scaleX(-1)" }} /></button>
              <span className="lab">{cizWeekRange(weekIdx)}{weekIdx === todayWeek ? " · bu hafta" : ""}</span>
              <button className="cz-navbtn" disabled={weekIdx >= todayWeek} onClick={() => setWeekIdx((w) => Math.min(todayWeek, w + 1))} title="Sonraki hafta"><Icon name="chevronRight" size={16} /></button>
            </div>
          )}
          {view === "hafta" && <span className="muted" style={{ fontSize: 12.5, fontWeight: 600 }}>Son {CIZ_WEEKS} hafta · haftalık toplamlar</span>}

          <div className="grow" />

          <div className="cz-legend">
            <span className="item"><span className="dot heat-a" />%85+</span>
            <span className="item"><span className="dot heat-c" />%55–70</span>
            <span className="item"><span className="dot heat-d" />&lt;%55</span>
          </div>

          {view === "tekrar" && (
            <button className={"cz-tab" + (editMode ? " on" : "")} style={editMode ? { background: "var(--primary)", height: 36 } : { height: 36 }} onClick={() => setEditMode((e) => !e)}>
              <Icon name="pencil" size={14} />{editMode ? "Düzenleme açık" : "Düzenle"}
            </button>
          )}

          <div className="cz-search">
            <Icon name="search" size={15} />
            <input placeholder="Konu ara…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>

          {groups.length === 0 ? (
          <div className="cz-empty">
            <span className="cz-empty-ic"><Icon name="search" size={26} /></span>
            <b>“{q}” için sonuç yok</b>
            <p>Bu derste aramaya uyan konu bulunamadı. Farklı bir konu adı deneyin ya da aramayı temizleyin.</p>
            <button className="btn btn-light btn-sm" onClick={() => setQ("")}><Icon name="refresh" size={15} />Aramayı temizle</button>
          </div>
          ) : (
          <div className="cz-scrollwrap">
          {(view === "tekrar" || view === "hafta") && scState.total > 0 && (
            <div className="cz-colnav">
              <span className="hint"><Icon name="dashboard" size={14} />{scState.total} {view === "tekrar" ? "tekrar" : "hafta"} sütunu · oklarla ya da kaydırarak gez</span>
              <div className="cz-nav">
                <button className="cz-navbtn" disabled={!scState.l} onClick={() => scrollByCols(-1)} title="Önceki sütunlar"><Icon name="chevronRight" size={16} style={{ transform: "scaleX(-1)" }} /></button>
                <span className="lab">Sütun {scState.first}–{scState.last} <span style={{ color: "var(--faint)" }}>/ {scState.total}</span></span>
                <button className="cz-navbtn" disabled={!scState.r} onClick={() => scrollByCols(1)} title="Sonraki sütunlar"><Icon name="chevronRight" size={16} /></button>
              </div>
            </div>
          )}
          <div className="cz-scroll" ref={scrollRef} style={{ maxHeight }}>
          <table className="cz-grid">
            <thead>
              <tr className="r1">
                <th className="cz-corner" rowSpan="2"><span className="ttl">Konu / Tarih</span></th>
                {cols.map((col) => {
                  const isToday = (kind === "gun" && col.date && weekIdx === todayWeek);
                  return <th className={"cz-colhead" + (isToday ? " today" : "")} colSpan="2" key={col.key}>{col.label}{col.sub && <span className="sub">{col.sub}</span>}</th>;
                })}
                <th className="cz-toth" rowSpan="2"><div style={{ padding: "0 13px", textAlign: "left" }}><span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--faint)" }}>Top / Ort</span></div></th>
              </tr>
              <tr className="r2">
                {cols.map((col) => (
                  <React.Fragment key={col.key}>
                    <th className="cz-sub s">S</th><th className="cz-sub d sep">D</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>

            <tbody>
              {groups.map((g) => {
                const isCol = !!collapsed[g.grup];
                // grup özeti (katlıyken göstermek için)
                let gs = 0, gd = 0, gn = 0;
                g.konular.forEach((t) => { const y = yearTotal(t); gs += y.s; gd += y.d; if (y.n) gn++; });
                const gr = cizRate(gs, gd);
                return (
                <React.Fragment key={g.grup}>
                  <tr className={"cz-grp" + (isCol ? " collapsed" : "")} onClick={() => toggleGrp(g.grup)}>
                    <td className="cz-topic">
                      <span className="cz-grp-tog"><Icon name="chevronDown" size={15} style={{ transform: isCol ? "rotate(-90deg)" : "none", transition: "transform .18s" }} /></span>
                      {g.grup}<span className="cnt">{g.konular.length} konu</span>
                      {isCol ? <span className="cz-grp-sum">{gn}/{g.konular.length} tamam · {gs.toLocaleString("tr-TR")} soru</span> : null}
                    </td>
                    {cols.map((col) => <td className="cz-cell" colSpan="2" key={col.key} />)}
                    <td className="cz-tot">{isCol ? <div className="l1"><span className="soru tnum">{gs.toLocaleString("tr-TR")}<s> soru</s></span><span className="pct" style={{ background: gn ? cizHeatBg(gr) : "var(--surface-3)", color: gn ? cizHeatFg(gr) : "var(--faint)" }}>%{gn ? Math.round(gr * 100) : 0}</span></div> : null}</td>
                  </tr>
                  {!isCol && g.konular.map((topic) => {
                    const y = yearTotal(topic); const yr = cizRate(y.s, y.d);
                    const status = y.n === 0 ? "todo" : yr >= 0.78 && y.n >= 5 ? "done" : "progress";
                    const stColor = status === "done" ? "var(--success)" : status === "progress" ? "var(--warning)" : "var(--faint)";
                    return (
                      <tr key={topic}>
                        <td className="cz-topic">
                          <div className="row"><span className="st" style={{ background: stColor }} /><span className="nm">{topic}</span></div>
                          <div className="meta">{y.n} oturum{y.n ? ` · ${y.s} soru` : " · başlanmadı"}</div>
                        </td>
                        {cols.map((col) => {
                          const cell = cellFor(kind, topicsSessions[topic], col);
                          const editable = kind === "tekrar" && editMode;
                          if (!cell) {
                            return (
                              <React.Fragment key={col.key}>
                                <td className={"cz-cell empty" + (editable ? " edit-on" : "")} onClick={(e) => openCell(e, topic, col, null)} />
                                <td className={"cz-cell empty sep" + (editable ? " edit-on" : "")} onClick={(e) => openCell(e, topic, col, null)} />
                              </React.Fragment>
                            );
                          }
                          const heat = cizHeat(cell.s, cell.d);
                          return (
                            <React.Fragment key={col.key}>
                              <td className={"cz-cell s" + (editable ? " edit-on" : "")} onClick={(e) => openCell(e, topic, col, cell)}><span className="num">{cell.s}</span></td>
                              <td className={"cz-cell d sep " + heat + (editable ? " edit-on" : "")} onClick={(e) => openCell(e, topic, col, cell)}><span className="num">{cell.d}</span></td>
                            </React.Fragment>
                          );
                        })}
                        <td className="cz-tot">
                          <div className="l1">
                            <span className="soru tnum">{y.s}<s> soru</s></span>
                            <span className="pct" style={{ background: y.n ? cizHeatBg(yr) : "var(--surface-3)", color: y.n ? cizHeatFg(yr) : "var(--faint)" }}>%{y.n ? Math.round(yr * 100) : 0}</span>
                          </div>
                          <div className="barwrap"><span style={{ width: `${Math.round(yr * 100)}%`, background: y.n ? cizHeatFg(yr) : "var(--border-strong)" }} /></div>
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
                );
              })}
            </tbody>

            <tfoot>
              <tr>
                <td className="cz-topic">Sütun toplamı</td>
                {cols.map((col, i) => (
                  <React.Fragment key={col.key}>
                    <td className="cz-cell cz-foot-cell">{colTotals[i].s || ""}</td>
                    <td className="cz-cell cz-foot-cell d sep">{colTotals[i].d || ""}</td>
                  </React.Fragment>
                ))}
                <td className="cz-tot">
                  <div className="l1"><span className="soru tnum">{grand.s.toLocaleString("tr-TR")}<s> soru</s></span><span className="pct" style={{ background: "var(--primary-soft)", color: "var(--primary-600)" }}>%{grand.s ? Math.round((grand.d / grand.s) * 100) : 0}</span></div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
          </div>
          )}
      </div>

      {showTip && (
        <p className="muted" style={{ fontSize: 12, marginTop: 12 }}>
          <b style={{ color: "var(--text-2)" }}>İpucu:</b> Tekrar görünümünde bir hücreye tıklayıp soru/doğru girebilirsin; boş hücreye tıklamak yeni oturum ekler. Günlük ve Haftalık görünümlerde hücreye tıklayınca o dönemin kırılımı açılır. Değişiklikler tarayıcında saklanır.
        </p>
      )}

      {pop && <CellPopover anchor={pop.anchor} kind={kind} topic={pop.topic} col={pop.col} cell={pop.cell} editable={editMode} onSave={saveCell} onClose={() => setPop(null)} />}
    </React.Fragment>
  );
}

/* ---- öğrenci şeridi (yeniden kullanılabilir) ---- */
function StudentStrip() {
  const grand = React.useMemo(() => {
    const ALL = cizBuildAll(); let s = 0, d = 0;
    Object.keys(ALL).forEach((subj) => Object.keys(ALL[subj]).forEach((t) => ALL[subj][t].forEach((x) => { s += x.soru; d += x.dogru; })));
    return { s, d };
  }, []);
  return (
    <div className="card"><div style={{ display: "flex", alignItems: "center", gap: 15, flexWrap: "wrap", padding: 16 }}>
      <div style={{ width: 46, height: 46, borderRadius: "50%", background: "linear-gradient(140deg,var(--primary-300),var(--primary-700))", color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 16 }}>EY</div>
      <div style={{ flex: 1, minWidth: 170 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-.01em", whiteSpace: "nowrap" }}>Elif Yıldız</span>
          <span className="badge badge-primary">11. Sınıf · Sayısal</span>
        </div>
        <div className="muted" style={{ fontSize: 12.5 }}>KAMP ÜS programı · Hedef: YKS 2026</div>
      </div>
      <div style={{ display: "flex", gap: 18 }}>
        <div style={{ textAlign: "right" }}>
          <div className="muted" style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase" }}>Toplam soru</div>
          <div className="tnum" style={{ fontSize: 19, fontWeight: 800 }}>{grand.s.toLocaleString("tr-TR")}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="muted" style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase" }}>Ort. doğru</div>
          <div className="tnum" style={{ fontSize: 19, fontWeight: 800, color: "var(--success)" }}>%{grand.s ? Math.round((grand.d / grand.s) * 100) : 0}</div>
        </div>
      </div>
    </div></div>
  );
}

/* ================= TAM-EKRAN (standalone dosya) ================= */
function CizelgePage() {
  const [theme, setTheme] = React.useState("light");
  React.useEffect(() => { document.documentElement.setAttribute("data-theme", theme); }, [theme]);
  return (
    <div className="cz-page">
      <div className="cz-top">
        <div className="logo-mark" style={{ width: 34, height: 34, borderRadius: 10 }}><Icon name="cap" size={19} /></div>
        <div className="crumb">Koç Paneli <span className="sep">/</span> <b>Konu Takibi</b> <span className="sep">/</span> Yıllık Çizelge</div>
        <div className="right">
          <button className="icon-btn" style={{ width: 38, height: 38 }} title="Tema" onClick={() => setTheme((t) => t === "light" ? "dark" : "light")}><Icon name={theme === "light" ? "moon" : "sun"} size={18} /></button>
          <button className="btn btn-light btn-sm"><Icon name="download" size={15} />Dışa aktar</button>
        </div>
      </div>
      <div className="cz-title"><h1>Yıllık Konu Takip Çizelgesi</h1><p>Ders bazında, oturum oturum çözülen soru ve doğru takibi</p></div>
      <StudentStrip />
      <KonuCizelge />
    </div>
  );
}

window.KonuCizelge = KonuCizelge;
window.StudentStrip = StudentStrip;
window.CizelgePage = CizelgePage;
window.cizHeatBg = cizHeatBg;
window.cizHeatFg = cizHeatFg;
window.cizRate = cizRate;
