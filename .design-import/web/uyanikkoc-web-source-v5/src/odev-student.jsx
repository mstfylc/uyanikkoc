/* Öğrenci ödevleri — hafta seçici, sonuç girişi (D/Y/B), kaynaklarım. */

function OdevResultModal({ open, odev, onClose }) {
  const [d, setD] = useState(""); const [y, setY] = useState(""); const [b, setB] = useState("");
  const [done, setDone] = useState(false);
  const [batch, setBatch] = useState(false);
  useEffect(() => { if (open && odev) { setD(odev.result?.d ?? ""); setY(odev.result?.y ?? ""); setB(odev.result?.b ?? ""); setDone(false); setBatch(false); } }, [open, odev]);
  if (!open || !odev) return null;
  const needs = (odev.types && odev.types.length ? odev.types : [odev.type]).some((k) => ODEV_TYPES[k] && ODEV_TYPES[k].needsResult);
  const num = (x) => { const n = parseInt(String(x).replace(/[^\d]/g, ""), 10); return isNaN(n) ? 0 : n; };
  const td = num(d), ty = num(y), tb = num(b);
  const net = Math.max(0, td - ty / 4).toFixed(2).replace(/\.00$/, "");
  const valid = !needs || (td + ty + tb > 0);

  const save = () => {
    updateOdev(odev.id, { status: "done", result: needs ? { d: td, y: ty, b: tb } : null });
    if (typeof toast === "function") toast(needs ? "Sonuç kaydedildi · net " + net : "Görev tamamlandı", { icon: "checkCircle" });
    if (needs && ty > 0 && typeof MistakeBatchModal === "function") { setBatch(true); }
    else { setDone(true); setTimeout(() => { setDone(false); onClose(); }, 900); }
  };

  const batchSlots = Array.from({ length: Math.min(ty, 12) }).map(() => ({ subject: odev.subject, topic: odev.topic, qType: "klasik" }));

  return ReactDOM.createPortal((
    <>
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="row" style={{ gap: 10 }}>
            <span className="lr-icon" style={{ background: `color-mix(in srgb, ${SUBJECT_COLORS[odev.subject] || "var(--primary)"} 14%, transparent)`, color: SUBJECT_COLORS[odev.subject] || "var(--primary)" }}><Icon name={ODEV_TYPES[odev.type].icon} size={19} /></span>
            <div>
              <h3 style={{ fontSize: 15.5, fontWeight: 800 }}>{odev.topic}</h3>
              <div className="muted" style={{ fontSize: 12 }}>{odev.subject} · {odev.source}</div>
            </div>
          </div>
          <button className="icon-btn" style={{ width: 36, height: 36 }} onClick={onClose} aria-label="Kapat"><Icon name="plus" size={18} style={{ transform: "rotate(45deg)" }} /></button>
        </div>
        <div className="modal-body" style={{ gap: 14 }}>
          {needs ? (
            <>
              <div className="muted" style={{ fontSize: 12.5 }}>Hedef <b style={{ color: "var(--text)" }}>{odev.count} soru</b> · sonucu gir:</div>
              <div style={{ display: "flex", gap: 10 }}>
                {[["Doğru", d, setD, "var(--success)"], ["Yanlış", y, setY, "var(--danger)"], ["Boş", b, setB, "var(--muted)"]].map(([lbl, val, set, col]) => (
                  <div className="field" key={lbl} style={{ flex: 1, minWidth: 0 }}>
                    <label className="label" style={{ color: col }}>{lbl}</label>
                    <input className="input tnum" style={{ textAlign: "center", fontWeight: 800, fontSize: 16, width: "100%", minWidth: 0, padding: "0 6px" }} inputMode="numeric" value={val} onChange={(e) => set(e.target.value.replace(/[^\d]/g, ""))} placeholder="0" />
                  </div>
                ))}
              </div>
              <div className="between" style={{ padding: "10px 14px", background: "var(--surface-3)", borderRadius: 11 }}>
                <span className="muted" style={{ fontSize: 12.5, fontWeight: 700 }}>Hesaplanan net</span>
                <span className="tnum" style={{ fontSize: 18, fontWeight: 800, color: "var(--primary)" }}>{net}</span>
              </div>
            </>
          ) : (
            <div style={{ padding: "20px 0", textAlign: "center" }}>
              <div className="muted" style={{ fontSize: 13.5, lineHeight: 1.5 }}>Bu görevi tamamladıysan işaretle. {odev.note ? `"${odev.note}"` : ""}</div>
            </div>
          )}
        </div>
        <div className="modal-foot" style={{ justifyContent: "flex-end" }}>
          <button className="btn btn-ghost" onClick={onClose}>Vazgeç</button>
          <button className="btn btn-primary" disabled={!valid} onClick={save} style={{ opacity: valid ? 1 : 0.5 }}><Icon name={done ? "check" : "checkCircle"} size={16} />{done ? "Kaydedildi" : needs ? "Sonucu Kaydet" : "Tamamlandı"}</button>
        </div>
      </div>
    </div>
    {typeof MistakeBatchModal === "function" ? <MistakeBatchModal open={batch} onClose={() => { setBatch(false); onClose(); }} student={odev.student} source={odev.source} slots={batchSlots} /> : null}
    </>
  ), document.body);
}

function OdevCard({ o, onResult }) {
  const c = SUBJECT_COLORS[o.subject] || "var(--primary)";
  const typeList = o.types && o.types.length ? o.types : [o.type];
  const t = ODEV_TYPES[typeList[0]] || ODEV_TYPES.soru;
  const needsResult = typeList.some((k) => ODEV_TYPES[k] && ODEV_TYPES[k].needsResult);
  const overdue = o.status === "pending" && o.due && new Date(o.due) < new Date("2026-06-05");
  return (
    <div className={`lrow${o.status === "done" ? " done" : ""}`} style={{ alignItems: "flex-start" }}>
      <span className="lr-icon" style={{ background: `color-mix(in srgb, ${c} 13%, transparent)`, color: c, flexShrink: 0 }}><Icon name={t.icon} size={19} /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="lr-title">{o.topic}</div>
        <div className="lr-meta">
          <span className="chip" style={{ height: 21, fontSize: 10.5, padding: "0 8px" }}><span className="swatch" style={{ background: c }} />{o.subject}</span>
          {typeList.map((k) => <span key={k} className="d">{(ODEV_TYPES[k] || {}).label || k}</span>)}
          {needsResult && o.count ? <span className="d">{o.count} soru</span> : null}
          <span className="d row" style={{ gap: 4 }}><Icon name="book" size={12} style={{ color: "var(--faint)" }} />{o.source}</span>
        </div>
        {o.note ? <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 6, background: "var(--surface-3)", padding: "6px 10px", borderRadius: 8, display: "inline-block" }}>📌 {o.note}</div> : null}
        {o.status === "done" && o.result ? (
          <div className="row" style={{ gap: 10, marginTop: 8, fontSize: 11.5, fontWeight: 700 }}>
            <span style={{ color: "var(--success)" }}>✓ {o.result.d} doğru</span>
            <span style={{ color: "var(--danger)" }}>✕ {o.result.y} yanlış</span>
            <span className="muted">○ {o.result.b} boş</span>
            <span className="badge badge-primary" style={{ height: 19 }}>net {Math.max(0, o.result.d - o.result.y / 4).toFixed(2).replace(/\.00$/, "")}</span>
          </div>
        ) : null}
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
        {o.status === "done"
          ? <Badge tone="success" icon="check">Bitti</Badge>
          : <button className="btn btn-primary btn-sm" onClick={() => onResult(o)}>{needsResult ? "Sonuç Gir" : "Tamamla"}</button>}
        {o.due ? <span style={{ fontSize: 11, fontWeight: 600, color: overdue ? "var(--danger)" : "var(--muted)" }}>{overdue ? "Gecikti · " : ""}{new Date(o.due).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}</span> : null}
      </div>
    </div>
  );
}

function KaynaklarimCard({ student, defaultExam = "Tümü" }) {
  const mine = useSources(student);
  const [val, setVal] = useState("");
  const [katalog, setKatalog] = useState(false);
  const add = () => { const t = val.trim(); if (t) { addSource(student, t); setVal(""); } };
  return (
    <Section
      title="Kaynaklarım"
      sub="Elindeki kitapları katalogdan seç — koçun ödev atarken bunlardan seçebilir"
      action={
        <div className="row" style={{ gap: 8 }}>
          <Badge tone="muted" icon="book">{mine.length}</Badge>
          <button className="btn btn-primary btn-sm" onClick={() => setKatalog(true)}><Icon name="plus" size={15} />Katalogdan ekle</button>
        </div>
      }
    >
      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        {mine.length === 0 ? (
          <button onClick={() => setKatalog(true)} className="dropzone" style={{ padding: "26px 24px" }}>
            <Icon name="book" size={26} style={{ color: "var(--faint)" }} />
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-2)" }}>Henüz kaynak yok</div>
            <div className="muted" style={{ fontSize: 12 }}>Bilinen yayınevi kitaplarını <b style={{ color: "var(--primary-600)" }}>katalogdan</b> ekle</div>
          </button>
        ) : (
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            {mine.map((s) => {
              const k = (typeof katalogByLabel === "function") ? katalogByLabel(s) : null;
              const tur = k ? (KAYNAK_TUR[k.t] || null) : null;
              return (
                <span key={s} className="chip" style={{ height: 30, paddingRight: 6 }} title={k ? `${k.s} · ${tur ? tur.label : ""}` : "Özel kaynak"}>
                  <Icon name={tur ? tur.icon : "book"} size={13} style={{ color: k ? "var(--primary)" : "var(--faint)" }} />
                  {s}
                  <button onClick={() => removeSource(student, s)} style={{ border: "none", background: "none", color: "var(--faint)", cursor: "pointer", display: "grid", placeItems: "center", marginLeft: 2 }} aria-label="Kaldır"><Icon name="plus" size={13} style={{ transform: "rotate(45deg)" }} /></button>
                </span>
              );
            })}
          </div>
        )}

        <div>
          <div className="muted" style={{ fontSize: 11.5, fontWeight: 600, marginBottom: 6 }}>Listede yoksa — özel kaynağını yaz:</div>
          <div className="add-topic">
            <Icon name="plus" size={14} style={{ color: "var(--faint)", flexShrink: 0 }} />
            <input className="add-topic-input" placeholder="Özel kaynak / fotokopi / öğretmen notu... (Enter)" value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") add(); }} />
            {val.trim() ? <button className="btn btn-primary btn-sm" onClick={add} style={{ height: 28 }}>Ekle</button> : null}
          </div>
        </div>
      </div>

      <KaynakKatalogModal open={katalog} onClose={() => setKatalog(false)} student={student} defaultExam={defaultExam} />
    </Section>
  );
}

function StudentOdevList({ student }) {
  const odevler = useOdevler();
  const [week, setWeek] = useState("w0");
  const [resultModal, setResultModal] = useState(null);
  const mine = odevler.filter((o) => o.student === student);
  const _tom = new Date(ODEV_TODAY.getTime() + 86400000);
  const _todayY = _odevYmd(ODEV_TODAY), _tomY = _odevYmd(_tom);
  const wk = week === "today" ? mine.filter((o) => o.due === _todayY) : week === "tomorrow" ? mine.filter((o) => o.due === _tomY) : mine.filter((o) => o.week === week);
  const pending = wk.filter((o) => o.status !== "done");
  const doneList = wk.filter((o) => o.status === "done");
  const weekHasData = (w) => mine.some((o) => o.week === w);

  return (
    <>
      <div className="seg" style={{ width: "fit-content", flexWrap: "wrap" }}>
        {[["today", "Bugün"], ["tomorrow", "Yarın"]].map(([k, l]) => (
          <button key={k} className={week === k ? "on" : ""} onClick={() => setWeek(k)}>{l}</button>
        ))}
        {WEEKS.map((w) => (
          <button key={w.id} className={week === w.id ? "on" : ""} onClick={() => setWeek(w.id)} disabled={!weekHasData(w.id)} style={{ opacity: weekHasData(w.id) ? 1 : 0.4 }}>
            {w.label}
          </button>
        ))}
      </div>

      <Section title="Atanan Ödevler" sub={`${(WEEKS.find((w) => w.id === week) || {}).range || (week === "today" ? "Bugün" : week === "tomorrow" ? "Yarın" : "")} · ${pending.length} bekleyen`}>
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {wk.length === 0 ? <div style={{ padding: "24px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Bu hafta atanmış ödev yok.</div>
            : [...pending, ...doneList].map((o) => <OdevCard key={o.id} o={o} onResult={setResultModal} />)}
        </div>
      </Section>

      <OdevResultModal open={!!resultModal} odev={resultModal} onClose={() => setResultModal(null)} />
    </>
  );
}

/* ---- Takvim görünümü: ödevleri bitiş tarihine göre ay ızgarasında göster ---- */
function _odevYmd(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
const ODEV_TODAY = new Date("2026-06-05");
const ODEV_DOW = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

function OdevCalendar({ student }) {
  const odevler = useOdevler().filter((o) => o.student === student);
  const [resultModal, setResultModal] = useState(null);

  const byDate = {};
  odevler.forEach((o) => { const k = o.due || "none"; (byDate[k] = byDate[k] || []).push(o); });
  const undated = byDate["none"] || [];

  // varsayılan ay: en çok ödev olan ay, yoksa demo "bugün" ayı
  const monthsCount = {};
  odevler.forEach((o) => { if (o.due) { const k = o.due.slice(0, 7); monthsCount[k] = (monthsCount[k] || 0) + 1; } });
  const defKey = Object.keys(monthsCount).sort((a, b) => monthsCount[b] - monthsCount[a])[0] || _odevYmd(ODEV_TODAY).slice(0, 7);
  const [yy, mo] = defKey.split("-").map(Number);
  const [month, setMonth] = useState(new Date(yy, mo - 1, 1));
  const [sel, setSel] = useState(null);

  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const startDow = (first.getDay() + 6) % 7; // Pazartesi = 0
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(month.getFullYear(), month.getMonth(), d));
  while (cells.length % 7) cells.push(null);

  const selList = sel ? (byDate[sel] || []) : [];
  const monthLabel = month.toLocaleDateString("tr-TR", { month: "long", year: "numeric" });
  const monthCount = odevler.filter((o) => o.due && o.due.slice(0, 7) === _odevYmd(month).slice(0, 7)).length;

  return (
    <>
      <Section title="Ödev Takvimi" sub={`${monthCount} görev · güne tıklayıp detayları gör`}
        action={
          <div className="row" style={{ gap: 8, alignItems: "center" }}>
            <button className="icon-btn" style={{ width: 32, height: 32 }} aria-label="Önceki ay" onClick={() => { setSel(null); setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1)); }}><Icon name="chevronRight" size={16} style={{ transform: "rotate(180deg)" }} /></button>
            <b style={{ fontSize: 13.5, minWidth: 130, textAlign: "center", textTransform: "capitalize" }}>{monthLabel}</b>
            <button className="icon-btn" style={{ width: 32, height: 32 }} aria-label="Sonraki ay" onClick={() => { setSel(null); setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1)); }}><Icon name="chevronRight" size={16} /></button>
          </div>
        }>
        <div className="card-body">
          <div className="odev-cal-grid head">{ODEV_DOW.map((d) => <div key={d} className="odev-cal-dow">{d}</div>)}</div>
          <div className="odev-cal-grid">
            {cells.map((d, i) => {
              if (!d) return <div key={i} className="odev-cal-cell empty" />;
              const k = _odevYmd(d);
              const items = byDate[k] || [];
              const isToday = _odevYmd(ODEV_TODAY) === k;
              const isSel = sel === k;
              return (
                <button key={i} type="button" className={"odev-cal-cell" + (isToday ? " today" : "") + (isSel ? " sel" : "") + (items.length ? " has" : "")} onClick={() => setSel(isSel ? null : k)}>
                  <span className="odev-cal-num">{d.getDate()}</span>
                  {items.length ? (
                    <span className="odev-cal-dots">
                      {items.slice(0, 4).map((o, j) => {
                        const c = SUBJECT_COLORS[o.subject] || "var(--primary)";
                        const overdue = o.status !== "done" && new Date(o.due) < ODEV_TODAY;
                        return <span key={j} className="odev-cal-dot" title={o.subject + " · " + o.topic} style={{ background: o.status === "done" ? "var(--success)" : overdue ? "var(--danger)" : c }} />;
                      })}
                      {items.length > 4 ? <span className="odev-cal-more">+{items.length - 4}</span> : null}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
          <div className="row" style={{ gap: 14, flexWrap: "wrap", marginTop: 14, fontSize: 11.5, color: "var(--muted)" }}>
            <span className="row" style={{ gap: 5 }}><span className="odev-cal-dot" style={{ background: "var(--primary)" }} />Bekleyen</span>
            <span className="row" style={{ gap: 5 }}><span className="odev-cal-dot" style={{ background: "var(--success)" }} />Tamamlanan</span>
            <span className="row" style={{ gap: 5 }}><span className="odev-cal-dot" style={{ background: "var(--danger)" }} />Gecikmiş</span>
          </div>
        </div>
      </Section>

      {sel ? (
        <Section title={new Date(sel).toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "long" })} sub={`${selList.length} görev`}>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {selList.length === 0 ? <div style={{ padding: "18px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Bu gün için görev yok.</div> : selList.map((o) => <OdevCard key={o.id} o={o} onResult={setResultModal} />)}
          </div>
        </Section>
      ) : null}

      {undated.length ? (
        <Section title="Tarihsiz görevler" sub={`${undated.length} görev`}>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>{undated.map((o) => <OdevCard key={o.id} o={o} onResult={setResultModal} />)}</div>
        </Section>
      ) : null}

      <OdevResultModal open={!!resultModal} odev={resultModal} onClose={() => setResultModal(null)} />
    </>
  );
}

/* ---- Günlük çalışma planı: bugünden başlayan ajanda + geciken görevler ---- */
function _odevDayLabel(ymd) {
  const DAY = 86400000;
  const d0 = new Date(_odevYmd(ODEV_TODAY) + "T00:00:00");
  const d = new Date(ymd + "T00:00:00");
  const diff = Math.round((d - d0) / DAY);
  if (diff === 0) return "Bugün";
  if (diff === 1) return "Yarın";
  if (diff === -1) return "Dün";
  return d.toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" });
}
function _odevSoruTarget(items) {
  return items.reduce((a, o) => {
    const tl = o.types && o.types.length ? o.types : [o.type];
    const needs = tl.some((k) => ODEV_TYPES[k] && ODEV_TYPES[k].needsResult);
    return a + (needs ? (o.count || 0) : 0);
  }, 0);
}

function OdevDailyPlan({ student }) {
  const odevler = useOdevler().filter((o) => o.student === student);
  const [resultModal, setResultModal] = useState(null);
  const todayYmd = _odevYmd(ODEV_TODAY);

  const overdue = odevler.filter((o) => o.status !== "done" && o.due && o.due < todayYmd).sort((a, b) => a.due.localeCompare(b.due));
  const upcoming = odevler.filter((o) => o.due && o.due >= todayYmd);
  const byDay = {};
  upcoming.forEach((o) => { (byDay[o.due] = byDay[o.due] || []).push(o); });
  const days = Object.keys(byDay).sort();
  // bugün hiç görev yoksa bile "Bugün" başlığını göster
  if (!byDay[todayYmd]) { byDay[todayYmd] = []; if (!days.includes(todayYmd)) days.unshift(todayYmd); days.sort(); }

  return (
    <>
      {overdue.length ? (
        <Section title="Geciken görevler" sub={`${overdue.length} görev tarihini geçti — önce bunları tamamla`}>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {overdue.map((o) => <OdevCard key={o.id} o={o} onResult={setResultModal} />)}
          </div>
        </Section>
      ) : null}

      {days.map((ymd) => {
        const items = byDay[ymd].slice().sort((a, b) => Number(a.status === "done") - Number(b.status === "done"));
        const doneN = items.filter((o) => o.status === "done").length;
        const soru = _odevSoruTarget(items);
        const isToday = ymd === todayYmd;
        return (
          <Section key={ymd}
            title={_odevDayLabel(ymd)}
            sub={items.length ? `${items.length} görev · ${doneN}/${items.length} tamam${soru ? ` · ${soru} soru hedefi` : ""}` : "Planlı görev yok — serbest tekrar günü"}>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {items.length === 0
                ? <div style={{ padding: "16px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Bugün koçundan atanmış görev yok. Eksik konularına tekrar yapabilirsin. 💪</div>
                : items.map((o) => <OdevCard key={o.id} o={o} onResult={setResultModal} />)}
            </div>
          </Section>
        );
      })}

      <OdevResultModal open={!!resultModal} odev={resultModal} onClose={() => setResultModal(null)} />
    </>
  );
}

Object.assign(window, { StudentOdevList, OdevCalendar, OdevDailyPlan, KaynaklarimCard, OdevResultModal, OdevCard });
