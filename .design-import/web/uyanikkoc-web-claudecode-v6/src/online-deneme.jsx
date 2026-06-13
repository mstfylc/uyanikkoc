/* Online Denemeler — deneme kitapçığı kargoyla gider, öğrenci optik formu
   online doldurur, net anında hesaplanır. localStorage'da kalıcı. */

const ONLINE_EXAMS = [
  { id: "oe1", name: "TYT Genel Deneme #7", pub: "Uyanık Yayınları", examType: "TYT", subject: "Türkçe", date: "8 Haz 2026", count: 20, cargo: "Kargoda" },
  { id: "oe2", name: "AYT Matematik Branş", pub: "Apotemi", examType: "AYT", subject: "Matematik", date: "7 Haz 2026", count: 15, cargo: "Teslim edildi" },
  { id: "oe3", name: "LGS Genel Deneme #4", pub: "Nartest", examType: "LGS", subject: "Karma", date: "9 Haz 2026", count: 20, cargo: "Kargoda" },
];
const OPT = ["A", "B", "C", "D", "E"];
/* deterministik cevap anahtarı */
function answerKey(exam) {
  const opts = exam.examType === "LGS" ? 4 : 5;
  let seed = exam.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return Array.from({ length: exam.count }, (_, i) => { seed = (seed * 9301 + 49297 + i * 233) % 233280; return OPT[seed % opts]; });
}
function examOptions(exam) { return exam.examType === "LGS" ? OPT.slice(0, 4) : OPT; }
function netCoef(exam) { return exam.examType === "LGS" ? 3 : 4; }

const ONLINE_KEY = "uk_online_subs_v1";
let _onsubs = (() => { try { const s = localStorage.getItem(ONLINE_KEY); if (s) return JSON.parse(s); } catch (e) {} return {}; })();
const _onListeners = new Set();
function persistOnsubs() { try { localStorage.setItem(ONLINE_KEY, JSON.stringify(_onsubs)); } catch (e) {} _onListeners.forEach((l) => l()); }
function subKey(examId, student) { return examId + "|" + student; }
function getSubmission(examId, student) { return _onsubs[subKey(examId, student)] || null; }
function submitOptik(exam, student, answers) {
  const key = answerKey(exam);
  let d = 0, y = 0, b = 0;
  answers.forEach((a, i) => { if (a == null) b++; else if (a === key[i]) d++; else y++; });
  const net = Math.max(0, d - y / netCoef(exam));
  const rec = { answers, d, y, b, net: Math.round(net * 100) / 100, at: Date.now() };
  _onsubs = { ..._onsubs, [subKey(exam.id, student)]: rec };
  persistOnsubs();
  return rec;
}
function useOnsubs() {
  const [, force] = React.useState(0);
  React.useEffect(() => { const l = () => force((x) => x + 1); _onListeners.add(l); return () => _onListeners.delete(l); }, []);
  return _onsubs;
}

/* ---- Optik Form modalı ---- */
function OptikFormModal({ open, exam, student, onClose }) {
  const [ans, setAns] = useState([]);
  const [result, setResult] = useState(null);
  useEffect(() => { if (open && exam) { const ex = getSubmission(exam.id, student); setAns(ex ? ex.answers : Array(exam.count).fill(null)); setResult(ex || null); } }, [open, exam, student]);
  if (!open || !exam) return null;
  const opts = examOptions(exam);
  const key = result ? answerKey(exam) : null;
  const answered = ans.filter((a) => a != null).length;
  const set = (i, o) => { if (result) return; setAns((p) => p.map((x, j) => j === i ? (x === o ? null : o) : x)); };
  const submit = () => setResult(submitOptik(exam, student, ans));

  return ReactDOM.createPortal((
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 480, height: "min(820px, calc(100vh - 32px))" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head" style={{ flexDirection: "column", alignItems: "stretch", gap: 10 }}>
          <div className="between">
            <div className="row" style={{ gap: 10 }}><span className="stat-icon tone-primary" style={{ width: 38, height: 38 }}><Icon name="notebook" size={18} /></span><div><h3 style={{ fontSize: 15.5, fontWeight: 800 }}>Optik Form</h3><div className="muted" style={{ fontSize: 12 }}>{exam.name} · {exam.count} soru</div></div></div>
            <button className="icon-btn" style={{ width: 36, height: 36 }} onClick={onClose} aria-label="Kapat"><Icon name="plus" size={18} style={{ transform: "rotate(45deg)" }} /></button>
          </div>
          {!result ? <div className="run-prog"><div className="run-prog-bar" style={{ width: (answered / exam.count * 100) + "%" }} /></div> : null}
        </div>

        {result ? (
          <div className="modal-body" style={{ gap: 14 }}>
            <div className="opt-result">
              <div className="opt-net"><span className="tnum">{result.net.toFixed(2).replace(/\.00$/, "")}</span><span className="muted">net</span></div>
              <div className="opt-dyb">
                <div><b className="tnum" style={{ color: "var(--success)" }}>{result.d}</b><span>Doğru</span></div>
                <div><b className="tnum" style={{ color: "var(--danger)" }}>{result.y}</b><span>Yanlış</span></div>
                <div><b className="tnum" style={{ color: "var(--muted)" }}>{result.b}</b><span>Boş</span></div>
              </div>
            </div>
            <div className="opt-review">
              {ans.map((a, i) => {
                const ok = a === key[i]; const blank = a == null;
                return <div key={i} className={`opt-rev${blank ? " blank" : ok ? " ok" : " no"}`}><span className="tnum">{i + 1}</span><b>{blank ? "—" : a}</b>{!ok && !blank ? <span className="opt-rev-key tnum">{key[i]}</span> : null}</div>;
              })}
            </div>
          </div>
        ) : (
          <div className="modal-body" style={{ gap: 4, padding: "12px 16px" }}>
            {ans.map((a, i) => (
              <div key={i} className="opt-row">
                <span className="opt-no tnum">{i + 1}</span>
                <div className="opt-bubbles">
                  {opts.map((o) => <button key={o} className={`opt-bub${a === o ? " on" : ""}`} onClick={() => set(i, o)}>{o}</button>)}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="modal-foot" style={{ justifyContent: "space-between" }}>
          {result
            ? <><span className="muted" style={{ fontSize: 12, fontWeight: 600 }}>Optik gönderildi ✓</span><button className="btn btn-primary" onClick={onClose}><Icon name="check" size={16} />Kapat</button></>
            : <><span className="muted" style={{ fontSize: 12, fontWeight: 600 }}>{answered}/{exam.count} işaretlendi</span><button className="btn btn-primary" disabled={answered === 0} onClick={submit} style={{ opacity: answered ? 1 : .5 }}><Icon name="send" size={16} />Gönder</button></>}
        </div>
      </div>
    </div>
  ), document.body);
}

/* ---- Öğrenci: Online Denemeler ---- */
function StudentOnlineExams() {
  const me = (typeof loadAuth === "function" && loadAuth()?.name) || "Elif Yıldız";
  useOnsubs();
  const sinav = (typeof loadAuth === "function" && /LGS/i.test(loadAuth()?.sub || "")) ? "LGS" : "YKS";
  const exams = ONLINE_EXAMS.filter((e) => sinav === "LGS" ? e.examType === "LGS" : e.examType !== "LGS");
  const [run, setRun] = useState(null);
  return (
    <>
      <div className="notice" style={{ background: "var(--primary-soft)", borderColor: "color-mix(in srgb, var(--primary) 25%, transparent)" }}>
        <Icon name="notebook" size={18} style={{ color: "var(--primary-600)", flexShrink: 0 }} />
        <div style={{ flex: 1 }}><b style={{ fontSize: 13.5 }}>Online deneme nasıl çalışır?</b><div className="muted" style={{ fontSize: 12.5 }}>Deneme kitapçığın kargoyla gelir. Çözdükten sonra optik formu buradan online doldur, netin anında hesaplansın.</div></div>
      </div>
      <Section title="Online Denemelerim" sub={`${exams.length} deneme · optik formu online doldur`}>
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {exams.map((e) => {
            const sub = getSubmission(e.id, me);
            return (
              <div key={e.id} className="lrow" style={{ cursor: "default" }}>
                <span className="lr-icon" style={{ background: "var(--primary-soft)", color: "var(--primary-600)", flexShrink: 0 }}><Icon name="notebook" size={19} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="lr-title">{e.name}</div>
                  <div className="lr-meta"><span className="badge badge-muted" style={{ height: 19 }}>{e.examType}</span><span className="d">{e.pub}</span><span className="d">{e.count} soru</span>
                    <span className="badge" style={{ height: 19, background: e.cargo === "Kargoda" ? "var(--warning-soft)" : "var(--success-soft)", color: e.cargo === "Kargoda" ? "var(--warning)" : "var(--success)" }}>{e.cargo}</span>
                  </div>
                </div>
                {sub
                  ? <div className="row" style={{ gap: 8 }}><span className="badge badge-success" style={{ height: 24 }}>Net {sub.net.toFixed(2).replace(/\.00$/, "")}</span><button className="btn btn-light btn-sm" onClick={() => setRun(e)}>Optiği Gör</button></div>
                  : <button className="btn btn-primary btn-sm" onClick={() => setRun(e)}><Icon name="notebook" size={14} />Optik Doldur</button>}
              </div>
            );
          })}
        </div>
      </Section>
      <OptikFormModal open={!!run} exam={run} student={me} onClose={() => setRun(null)} />
    </>
  );
}

/* ============================================================
   Koç hesabı: bireysel mi / kuruma bağlı mı + yetkiler + online deneme paketi
   Bireysel koç her şeyi yapar; kuruma bağlı koç yalnız kurumun verdiği yetkiyle.
   Online deneme ayrıca bir PAKET özelliği (süper admin/kurum açmazsa kilitli).
   ============================================================ */
const COACH_ACCT_KEY = "uk_coach_acct_v1";
let _coachAcct = (() => { try { const s = localStorage.getItem(COACH_ACCT_KEY); if (s) return JSON.parse(s); } catch (e) {} return {
  type: "bireysel", orgName: "Kampüs Koç",
  perms: { denemeOlustur: true, denemeSil: true, gelirGorunur: true, onlineDeneme: true },
  packageOnlineDeneme: true,
}; })();
const _caListeners = new Set();
function persistCoachAcct() { try { localStorage.setItem(COACH_ACCT_KEY, JSON.stringify(_coachAcct)); } catch (e) {} _caListeners.forEach((l) => l()); }
function setCoachAcct(patch) { _coachAcct = typeof patch === "function" ? patch(_coachAcct) : { ..._coachAcct, ...patch }; persistCoachAcct(); }
function useCoachAcct() { const [, f] = React.useState(0); React.useEffect(() => { const l = () => f((x) => x + 1); _caListeners.add(l); return () => _caListeners.delete(l); }, []); return _coachAcct; }
/* yetki: bireysel her zaman açık; kuruma bağlıysa kurum izni gerekir */
function coachCan(perm) { const a = _coachAcct; if (a.type === "bireysel") return true; return !!(a.perms && a.perms[perm]); }
function onlineDenemeEnabled() { return !!_coachAcct.packageOnlineDeneme; }

/* ---- koç oluşturduğu online denemeler ---- */
const COACH_OEXAM_KEY = "uk_coach_oexams_v1";
let _coachOExams = (() => { try { const s = localStorage.getItem(COACH_OEXAM_KEY); if (s) return JSON.parse(s); } catch (e) {} return []; })();
const _coeListeners = new Set();
function persistCoachOExams() { try { localStorage.setItem(COACH_OEXAM_KEY, JSON.stringify(_coachOExams)); } catch (e) {} _coeListeners.forEach((l) => l()); }
function addCoachOExam(data) { const e = { id: "coe" + Date.now(), name: (data.name || "Online Deneme").trim(), examType: data.examType || "TYT", count: Math.max(1, +data.count || 20), key: data.key || [], pdfName: data.pdfName || "", createdAt: Date.now(), by: data.by || "Dilek Emen" }; _coachOExams = [e, ..._coachOExams]; persistCoachOExams(); if (typeof pushNotif === "function") pushNotif("student", { icon: "notebook", tone: "primary", title: "Yeni online deneme 📝", desc: e.name + " yayınlandı", page: "exams" }); return e; }
function deleteCoachOExam(id) { _coachOExams = _coachOExams.filter((e) => e.id !== id); persistCoachOExams(); }
function useCoachOExams() { const [, f] = React.useState(0); React.useEffect(() => { const l = () => f((x) => x + 1); _coeListeners.add(l); return () => _coeListeners.delete(l); }, []); return _coachOExams; }
function parseAnswerKey(text, opts) { const valid = OPT.slice(0, opts); return (text || "").toUpperCase().replace(/[^A-E]/g, "").split("").filter((c) => valid.includes(c)); }

/* ---- Koç: Online Deneme Oluştur modalı ---- */
function OnlineDenemeOlusturModal({ open, onClose }) {
  const [name, setName] = useState("");
  const [examType, setExamType] = useState("TYT");
  const [count, setCount] = useState(20);
  const [keyText, setKeyText] = useState("");
  const [pdfName, setPdfName] = useState("");
  const fileRef = useRef(null);
  useEffect(() => { if (open) { setName(""); setExamType("TYT"); setCount(20); setKeyText(""); setPdfName(""); } }, [open]);
  if (!open) return null;
  const opts = examType === "LGS" ? 4 : 5;
  const parsed = parseAnswerKey(keyText, opts);
  const lenOk = parsed.length === +count;
  const valid = name.trim().length > 1 && +count > 0 && lenOk;
  const onFile = (e) => { const f = e.target.files && e.target.files[0]; if (f) { setPdfName(f.name); if (typeof toast === "function") toast("PDF eklendi: " + f.name + " — cevap anahtarını aşağıya yapıştır/gir", { icon: "notebook" }); } e.target.value = ""; };
  const save = () => { if (!valid) return; addCoachOExam({ name: name.trim(), examType, count: +count, key: parsed, pdfName }); toast("Online deneme oluşturuldu ve öğrencilere yayınlandı 📝", { icon: "checkCircle" }); onClose(); };
  return ReactDOM.createPortal((
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 520, height: "min(760px, calc(100vh - 32px))" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="row" style={{ gap: 11 }}><span className="stat-icon tone-primary" style={{ width: 38, height: 38 }}><Icon name="notebook" size={18} /></span><div><h3 style={{ fontSize: 15.5, fontWeight: 800 }}>Online Deneme Oluştur</h3><div className="muted" style={{ fontSize: 12 }}>Soru sayısı ve cevap anahtarını belirle</div></div></div>
          <button className="icon-btn" style={{ width: 36, height: 36 }} onClick={onClose} aria-label="Kapat"><Icon name="plus" size={18} style={{ transform: "rotate(45deg)" }} /></button>
        </div>
        <div className="modal-body" style={{ gap: 14 }}>
          <div className="field"><label className="label">Deneme adı</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Örn. TYT Genel Deneme #8" /></div>
          <div className="grid g-2" style={{ gap: 12 }}>
            <div className="field"><label className="label">Tür</label><select className="select" value={examType} onChange={(e) => setExamType(e.target.value)}>{["TYT", "AYT", "YKS", "LGS"].map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
            <div className="field"><label className="label">Soru sayısı</label><input className="input tnum" type="number" min="1" max="200" value={count} onChange={(e) => setCount(e.target.value)} /></div>
          </div>
          <div className="field">
            <label className="label">Cevap anahtarı <span className="muted" style={{ fontWeight: 500 }}>({opts === 4 ? "A–D" : "A–E"} · {parsed.length}/{count})</span></label>
            <textarea className="textarea" rows={3} value={keyText} onChange={(e) => setKeyText(e.target.value)} placeholder={"Örn. ABCDА BCDEA CDAB...  (harfleri sırayla yapıştır)"} style={{ textTransform: "uppercase", letterSpacing: ".08em", fontFamily: "ui-monospace,Menlo,monospace" }} />
            <div className="row" style={{ gap: 8, marginTop: 8, flexWrap: "wrap", alignItems: "center" }}>
              <input ref={fileRef} type="file" accept="application/pdf" onChange={onFile} style={{ display: "none" }} />
              <button type="button" className="btn btn-light btn-sm" onClick={() => fileRef.current && fileRef.current.click()}><Icon name="notebook" size={14} />PDF'ten içe aktar</button>
              {pdfName ? <span className="badge badge-muted" style={{ height: 22 }}><Icon name="checkCircle" size={12} />{pdfName}</span> : null}
              <span className={`badge badge-${lenOk ? "success" : "warning"}`} style={{ height: 22, marginLeft: "auto" }}>{lenOk ? "Tam" : `${parsed.length}/${count}`}</span>
            </div>
            <div className="muted" style={{ fontSize: 11.5, marginTop: 6 }}>PDF eklersen referans olarak saklanır; cevap anahtarını harf dizisi olarak yapıştır/gir.</div>
          </div>
        </div>
        <div className="modal-foot"><button className="btn btn-light" onClick={onClose}>Vazgeç</button><button className="btn btn-primary" style={{ marginLeft: "auto" }} disabled={!valid} onClick={save}><Icon name="send" size={16} />Oluştur & yayınla</button></div>
      </div>
    </div>
  ), document.body);
}

/* yetki/paket kilidi şeridi */
function LockBanner({ icon, title, desc }) {
  return (
    <div className="notice" style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
      <span className="lr-icon" style={{ width: 38, height: 38, background: "var(--surface-3)", color: "var(--muted)", flexShrink: 0 }}><Icon name={icon || "lock"} size={18} /></span>
      <div style={{ flex: 1 }}><b style={{ fontSize: 13.5 }}>{title}</b><div className="muted" style={{ fontSize: 12.5 }}>{desc}</div></div>
    </div>
  );
}

/* ---- Koç: Online Denemeler (oluştur + yönet) ---- */
function CoachOnlineExams() {
  const acct = useCoachAcct();
  const list = useCoachOExams();
  const [open, setOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const canCreate = coachCan("denemeOlustur");
  const canDelete = coachCan("denemeSil");
  const pkg = onlineDenemeEnabled();
  return (
    <div className="stack rise">
      <PageHead title="Online Denemeler" sub="Online deneme oluştur, cevap anahtarını belirle, öğrencilere yayınla"
        actions={pkg && canCreate ? <button className="btn btn-primary" onClick={() => setOpen(true)}><Icon name="plus" size={16} />Online Deneme Oluştur</button> : null} />

      <CoachAccessPanel />

      {!pkg ? <LockBanner icon="lock" title="Online deneme paketi kapalı" desc="Bu özellik kuruma/koça tanımlı bir paket modülüdür. Süper admin / kurum bu paketi açmadan online deneme oluşturulamaz." />
        : !canCreate ? <LockBanner icon="lock" title="Deneme oluşturma yetkin yok" desc={`${acct.orgName || "Kurumun"} bu yetkiyi vermedi. Kuruma bağlı koçlar yalnızca kurum izniyle online deneme oluşturabilir.`} />
        : null}

      <Section title="Oluşturduğun Online Denemeler" sub={`${list.length} deneme`}>
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {list.length === 0 ? <div style={{ padding: "22px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Henüz online deneme oluşturmadın.</div>
            : list.map((e) => (
              <div key={e.id} className="lrow" style={{ cursor: "default" }}>
                <span className="lr-icon" style={{ background: "var(--primary-soft)", color: "var(--primary-600)", flexShrink: 0 }}><Icon name="notebook" size={19} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="lr-title">{e.name}</div>
                  <div className="lr-meta"><span className="badge badge-muted" style={{ height: 19 }}>{e.examType}</span><span className="d">{e.count} soru</span><span className="d">Cevap anahtarı: {e.key.length}/{e.count}</span>{e.pdfName ? <span className="d"><Icon name="notebook" size={11} /> {e.pdfName}</span> : null}</div>
                </div>
                <button className="btn btn-ghost-danger btn-sm" disabled={!canDelete} title={canDelete ? "Sil" : "Silme yetkin yok (kuruma bağlı)"} onClick={() => setConfirmDel(e)}><Icon name="plus" size={14} style={{ transform: "rotate(45deg)" }} />{canDelete ? "Sil" : "Kilitli"}</button>
              </div>
            ))}
        </div>
      </Section>

      {pkg && canCreate ? <OnlineDenemeOlusturModal open={open} onClose={() => setOpen(false)} /> : null}
      {confirmDel ? ReactDOM.createPortal((
        <div className="modal-overlay" onClick={() => setConfirmDel(null)}>
          <div className="modal-panel" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-body" style={{ padding: 24, textAlign: "center", gap: 12 }}>
              <span className="stat-icon tone-danger" style={{ width: 48, height: 48, margin: "0 auto" }}><Icon name="alert" size={24} /></span>
              <h3 style={{ fontSize: 17, fontWeight: 800 }}>Denemeyi sil?</h3>
              <p className="muted" style={{ fontSize: 13 }}>{confirmDel.name} kaldırılacak. Bu işlem için bildirim oluşturulur.</p>
            </div>
            <div className="modal-foot"><button className="btn btn-light" onClick={() => setConfirmDel(null)}>Vazgeç</button><button className="btn btn-danger" style={{ marginLeft: "auto" }} onClick={() => { deleteCoachOExam(confirmDel.id); if (typeof pushNotif === "function") pushNotif("coach", { icon: "alert", tone: "danger", title: "Online deneme silindi", desc: confirmDel.name + " silindi", page: "c-online" }); toast("Deneme silindi · bildirim oluşturuldu", { icon: "alert", tone: "danger" }); setConfirmDel(null); }}>Sil</button></div>
          </div>
        </div>
      ), document.body) : null}
    </div>
  );
}

/* yetki & paket durumu — demo amaçlı değiştirilebilir panel */
function CoachAccessPanel() {
  const a = useCoachAcct();
  const isKurum = a.type === "kurum";
  const Row = ({ k, label }) => (
    <div className="between" style={{ padding: "9px 0" }}>
      <span style={{ fontSize: 13 }}>{label}</span>
      <button className={`switch${(a.type === "bireysel" || a.perms[k]) ? " on" : ""}`} disabled={a.type === "bireysel"} onClick={() => setCoachAcct((s) => ({ ...s, perms: { ...s.perms, [k]: !s.perms[k] } }))} style={a.type === "bireysel" ? { opacity: .55 } : null}><span /></button>
    </div>
  );
  return (
    <Section title="Hesap & Yetkiler" sub="Bireysel koç tüm yetkilere sahiptir; kuruma bağlı koçun yetkilerini kurum belirler"
      action={<span className={`badge badge-${isKurum ? "info" : "success"}`} style={{ height: 24 }}><Icon name={isKurum ? "building" : "users"} size={13} />{isKurum ? "Kuruma bağlı · " + (a.orgName || "") : "Bireysel lisans"}</span>}>
      <div className="card-body">
        <div className="field" style={{ marginBottom: 8 }}><label className="label">Koç tipi (demo)</label>
          <div className="seg" style={{ width: "fit-content" }}>
            <button className={!isKurum ? "on" : ""} onClick={() => setCoachAcct({ type: "bireysel" })}>Bireysel</button>
            <button className={isKurum ? "on" : ""} onClick={() => setCoachAcct({ type: "kurum" })}>Kuruma bağlı</button>
          </div>
        </div>
        <Row k="denemeOlustur" label="Deneme oluşturabilir" />
        <Row k="denemeSil" label="Deneme silebilir" />
        <Row k="onlineDeneme" label="Online deneme kullanabilir" />
        <Row k="gelirGorunur" label="Gelir & Tahsilat görebilir" />
        <hr className="hr" />
        <div className="between" style={{ padding: "9px 0" }}>
          <div><div style={{ fontSize: 13, fontWeight: 600 }}>Online deneme paketi (süper admin/kurum)</div><div className="muted" style={{ fontSize: 11.5 }}>Paket kapalıysa yetki açık olsa bile oluşturulamaz</div></div>
          <button className={`switch${a.packageOnlineDeneme ? " on" : ""}`} onClick={() => setCoachAcct({ packageOnlineDeneme: !a.packageOnlineDeneme })}><span /></button>
        </div>
      </div>
    </Section>
  );
}

/* Gelir & Tahsilat görünürlük kilidi (gelirGorunur yetkisi) */
function CoachRevenueGate() {
  useCoachAcct();
  if (!coachCan("gelirGorunur")) return (
    <div className="stack rise">
      <PageHead title="Gelir & Tahsilat" sub="Kazanç ve tahsilat özetin" />
      <LockBanner icon="lock" title="Gelir & Tahsilat görünür değil" desc="Kuruma bağlı koçlar için bu alanı kurum açmadıkça görüntüleyemez. Bireysel koç lisansında veya kurum izin verdiğinde görünür." />
    </div>
  );
  return (typeof BranchRevenuePage === "function") ? <BranchRevenuePage /> : null;
}

Object.assign(window, { ONLINE_EXAMS, OptikFormModal, StudentOnlineExams, answerKey, getSubmission, submitOptik, useOnsubs,
  useCoachAcct, setCoachAcct, coachCan, onlineDenemeEnabled, useCoachOExams, addCoachOExam, deleteCoachOExam, parseAnswerKey,
  OnlineDenemeOlusturModal, CoachOnlineExams, CoachAccessPanel, CoachRevenueGate });
