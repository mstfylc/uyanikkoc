/* Envanter & Testler arayüzü — koç gönderir/sonuç+not, öğrenci çözer. */

/* ---- Koç: Testler ---- */
function CoachTestsPage() {
  const roster = useRoster();
  const assigns = useTassign();
  const tests = useTests();
  const [sendOpen, setSendOpen] = useState(false);
  const [buildOpen, setBuildOpen] = useState(false);
  const [stu, setStu] = useState("all");
  const completed = assigns.filter((a) => a.status === "completed");
  const shown = assigns.filter((a) => stu === "all" || a.student === stu);

  return (
    <div className="stack rise">
      <PageHead title="Envanter & Testler" sub="Psikolojik ve yetenek testleri oluştur, gönder, sonuçları analiz et" actions={
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-primary" onClick={() => setSendOpen(true)}><Icon name="send" size={16} />Test Gönder</button>
        </div>
      } />

      <div className="grid g-4">
        <StatCard icon="notebook" tone="primary" value={tests.length} label="Test türü" />
        <StatCard icon="send" tone="info" value={assigns.length} label="Gönderilen" />
        <StatCard icon="checkCircle" tone="success" value={completed.length} label="Tamamlanan" />
        <StatCard icon="clock" tone="warning" value={assigns.length - completed.length} label="Bekleyen" />
      </div>

      <Section title="Test Kataloğu" sub="Öğrencilere gönderebileceğin envanterler · kendi testini de oluşturabilirsin" action={<button className="btn btn-primary btn-sm" onClick={() => setBuildOpen(true)}><Icon name="plus" size={15} />Yeni test</button>}>
        <div className="card-body"><div className="grid g-2" style={{ gap: 12 }}>
          {tests.map((t) => {
            const qs = testQuestions(t);
            const kinds = [...new Set(qs.map((q) => q.kind))];
            return (
            <div key={t.id} className="lrow" style={{ cursor: "default", alignItems: "flex-start" }}>
              <span className="lr-icon" style={{ background: `var(--${t.tone}-soft)`, color: `var(--${t.tone})`, flexShrink: 0 }}><Icon name={t.icon} size={19} /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="lr-title">{t.name}{t.custom ? <span className="badge badge-primary" style={{ height: 18, fontSize: 9.5, marginLeft: 7 }}>Özel</span> : null}</div>
                <div className="lr-meta">{t.desc}</div>
                <div className="row" style={{ gap: 5, marginTop: 7, flexWrap: "wrap" }}>
                  <span className="badge badge-muted" style={{ height: 19, fontSize: 10 }}>{qs.length} soru</span>
                  {kinds.map((k) => <span key={k} className="badge badge-muted" style={{ height: 19, fontSize: 10 }}><Icon name={(QKINDS[k] || {}).icon || "chart"} size={11} />{(QKINDS[k] || {}).label?.split(" ")[0] || k}</span>)}
                </div>
              </div>
              {t.custom ? <button className="icon-btn" style={{ width: 30, height: 30, color: "var(--danger)" }} title="Sil" onClick={() => { if (confirm(`"${t.name}" testi silinsin mi?`)) { deleteCustomTest(t.id); toast("Test silindi"); } }}><Icon name="plus" size={14} style={{ transform: "rotate(45deg)" }} /></button> : null}
            </div>
          ); })}
        </div></div>
      </Section>

      <Section title="Gönderilen Testler" sub={`${shown.length} kayıt`} action={
        <select className="select" style={{ height: 34, fontSize: 12.5, maxWidth: 180 }} value={stu} onChange={(e) => setStu(e.target.value)}>
          <option value="all">Tüm öğrenciler</option>
          {roster.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
        </select>
      }>
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {shown.length === 0 ? <div style={{ padding: "20px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Henüz test gönderilmedi.</div>
            : shown.map((a) => <CoachTestRow key={a.id} a={a} />)}
        </div>
      </Section>

      <TestSendModal open={sendOpen} onClose={() => setSendOpen(false)} roster={roster} tests={tests} />
      <TestBuilderModal open={buildOpen} onClose={() => setBuildOpen(false)} />
    </div>
  );
}

function CoachTestRow({ a }) {
  const t = testById(a.testId); if (!t) return null;
  const [note, setNote] = useState(a.coachNote || "");
  const [editing, setEditing] = useState(false);
  return (
    <div className="lrow" style={{ alignItems: "flex-start" }}>
      <Avatar name={a.student} size={36} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="lr-title">{t.name} <span className="muted" style={{ fontWeight: 500 }}>· {a.student}</span></div>
        <div className="lr-meta">
          <span className="badge" style={{ height: 20, background: `var(--${t.tone}-soft)`, color: `var(--${t.tone})` }}><Icon name={t.icon} size={12} />{t.name.split(" ")[0]}</span>
          {a.status === "completed"
            ? <span className="badge" style={{ height: 20, background: `var(--${a.bandTone || "primary"}-soft)`, color: `var(--${a.bandTone || "primary"})` }}>Sonuç: {a.band}{a.score != null ? ` (${a.score.toFixed(1)}/5)` : ""}</span>
            : <Badge tone="warning" dot>Öğrenci bekleniyor</Badge>}
          <span className="d">{a.status === "completed" ? "Çözüldü: " + (a.completedAt ? new Date(a.completedAt).toLocaleDateString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—") : "Gönderildi: " + (a.sentAt ? new Date(a.sentAt).toLocaleDateString("tr-TR", { day: "numeric", month: "short" }) : "—")}</span>
          {a.reminders ? <span className="d" style={{ color: "var(--warning)" }}>{a.reminders} hatırlatma</span> : null}
        </div>
        {a.status !== "completed" ? (
          <div className="row" style={{ gap: 8, marginTop: 8, flexWrap: "wrap" }}>
            <button className="btn btn-light btn-sm" onClick={() => { remindTest(a.id); toast(a.student + " için test hatırlatması gönderildi", { icon: "bell" }); }}><Icon name="bell" size={14} />Hatırlat</button>
            {a.remindedAt ? <span className="muted" style={{ fontSize: 11.5, alignSelf: "center" }}>Son hatırlatma: {new Date(a.remindedAt).toLocaleDateString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span> : null}
          </div>
        ) : null}
        {a.status === "completed" ? (
          editing ? (
            <div className="row" style={{ gap: 8, marginTop: 8 }}>
              <input className="input" style={{ flex: 1, height: 34 }} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Sonuçla ilgili not..." autoFocus />
              <button className="btn btn-primary btn-sm" onClick={() => { setTestNote(a.id, note); setEditing(false); }}>Kaydet</button>
            </div>
          ) : (
            a.coachNote
              ? <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 7, background: "var(--surface-3)", padding: "7px 11px", borderRadius: 9, display: "flex", gap: 8, alignItems: "center" }}>📝 {a.coachNote}<button className="link-btn" onClick={() => setEditing(true)} style={{ marginLeft: "auto" }}>Düzenle</button></div>
              : <button className="btn btn-light btn-sm" style={{ marginTop: 8 }} onClick={() => setEditing(true)}><Icon name="plus" size={14} />Not ekle</button>
          )
        ) : null}
      </div>
    </div>
  );
}

function TestSendModal({ open, onClose, roster, tests }) {
  const catalog = tests || TEST_CATALOG;
  const [student, setStudent] = useState("");
  const [testId, setTestId] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => { if (open) { setStudent(roster[0]?.name || ""); setTestId(""); setDone(false); } }, [open]);
  if (!open) return null;
  const valid = student && testId;
  const submit = () => { if (!valid) return; sendTest(student, testId); setDone(true); setTimeout(() => { setDone(false); onClose(); }, 1000); };
  return ReactDOM.createPortal((
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="row" style={{ gap: 9 }}><span className="stat-icon tone-primary" style={{ width: 36, height: 36 }}><Icon name="send" size={18} /></span><div><h3 style={{ fontSize: 16, fontWeight: 800 }}>Test Gönder</h3><div className="muted" style={{ fontSize: 12.5 }}>Öğrenciye envanter ata</div></div></div>
          <button className="icon-btn" style={{ width: 36, height: 36 }} onClick={onClose} aria-label="Kapat"><Icon name="plus" size={18} style={{ transform: "rotate(45deg)" }} /></button>
        </div>
        <div className="modal-body" style={{ gap: 14 }}>
          <div className="field"><label className="label">Öğrenci</label>
            <select className="select" value={student} onChange={(e) => setStudent(e.target.value)}>{roster.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}</select>
          </div>
          <div className="field"><label className="label">Test</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {catalog.map((t) => (
                <button key={t.id} type="button" className={`pick-row${testId === t.id ? " on" : ""}`} onClick={() => setTestId(t.id)} style={{ border: "1px solid var(--border)" }}>
                  <span className="lr-icon" style={{ width: 34, height: 34, background: `var(--${t.tone}-soft)`, color: `var(--${t.tone})` }}><Icon name={t.icon} size={17} /></span>
                  <div style={{ flex: 1, textAlign: "left" }}><div style={{ fontSize: 13, fontWeight: 700 }}>{t.name}</div><div className="muted" style={{ fontSize: 11.5 }}>{testQuestions(t).length} soru</div></div>
                  {testId === t.id ? <Icon name="checkCircle" size={18} style={{ color: "var(--primary)" }} /> : null}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="modal-foot" style={{ justifyContent: "flex-end" }}>
          <button className="btn btn-ghost" onClick={onClose}>Vazgeç</button>
          <button className="btn btn-primary" disabled={!valid} onClick={submit} style={{ opacity: valid ? 1 : 0.5 }}><Icon name={done ? "check" : "send"} size={16} />{done ? "Gönderildi" : "Gönder"}</button>
        </div>
      </div>
    </div>
  ), document.body);
}

/* ---- Öğrenci: Testlerim ---- */
function StudentTestsPage() {
  const me = (typeof loadAuth === "function" && loadAuth()?.name) || "Elif Yıldız";
  const assigns = useTassign().filter((a) => a.student === me);
  const [run, setRun] = useState(null);
  const pending = assigns.filter((a) => a.status !== "completed");
  const completed = assigns.filter((a) => a.status === "completed");

  return (
    <div className="stack rise">
      <PageHead title="Testlerim" sub="Koçunun gönderdiği envanter ve testler" />
      <div className="grid g-4">
        <StatCard icon="notebook" tone="primary" value={assigns.length} label="Gönderilen test" />
        <StatCard icon="clock" tone="warning" value={pending.length} label="Bekleyen" />
        <StatCard icon="checkCircle" tone="success" value={completed.length} label="Tamamlanan" />
        <StatCard icon="star" tone="info" value={TEST_CATALOG.length} label="Test türü" />
      </div>

      <Section title="Yapılacak Testler" sub={`${pending.length} bekleyen`}>
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {pending.length === 0 ? <div style={{ padding: "20px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Bekleyen test yok 🎉</div>
            : pending.map((a) => { const t = testById(a.testId); return (
              <div key={a.id} className="lrow">
                <span className="lr-icon" style={{ background: `var(--${t.tone}-soft)`, color: `var(--${t.tone})`, flexShrink: 0 }}><Icon name={t.icon} size={19} /></span>
                <div style={{ flex: 1, minWidth: 0 }}><div className="lr-title">{t.name}</div><div className="lr-meta">{t.desc} · {t.questions.length} soru</div></div>
                <button className="btn btn-primary btn-sm" onClick={() => setRun(a)}>Testi Çöz</button>
              </div>
            ); })}
        </div>
      </Section>

      {completed.length ? (
        <Section title="Tamamlanan Testler" sub={`${completed.length} sonuç`}>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {completed.map((a) => { const t = testById(a.testId); return (
              <div key={a.id} className="lrow" style={{ cursor: "default" }}>
                <span className="lr-icon" style={{ background: `var(--${t.tone}-soft)`, color: `var(--${t.tone})`, flexShrink: 0 }}><Icon name={t.icon} size={19} /></span>
                <div style={{ flex: 1, minWidth: 0 }}><div className="lr-title">{t.name}</div><div className="lr-meta"><span className="badge" style={{ height: 20, background: `var(--${a.bandTone || "primary"}-soft)`, color: `var(--${a.bandTone || "primary"})` }}>{a.band}</span>{a.coachNote ? <span className="d">Koç notu: {a.coachNote}</span> : null}</div></div>
                <Badge tone="success" icon="check">Bitti</Badge>
              </div>
            ); })}
          </div>
        </Section>
      ) : null}

      <TestRunModal open={!!run} assign={run} onClose={() => setRun(null)} />
    </div>
  );
}

function TestRunModal({ open, assign, onClose }) {
  const t = assign ? testById(assign.testId) : null;
  const qs = t ? testQuestions(t) : [];
  const [ans, setAns] = useState({});
  const [result, setResult] = useState(null);
  useEffect(() => { if (open) { setAns({}); setResult(null); } }, [open, assign]);
  if (!open || !t) return null;
  const set = (i, v) => setAns((p) => ({ ...p, [i]: v }));
  const answered = qs.filter((_, i) => ans[i] !== undefined).length;
  const allAnswered = answered === qs.length;
  const pct = Math.round((answered / qs.length) * 100);
  const submit = () => {
    const vals = qs.map((q, i) => answerScore(q.kind, ans[i], q));
    const score = vals.reduce((a, b) => a + b, 0) / vals.length;
    const band = scoreBand(t, score);
    completeTest(assign.id, score, band.label, band.tone);
    setResult({ score, ...band });
  };

  const Control = ({ q, i }) => {
    const a = ans[i];
    if (q.kind === "yesno") {
      return (
        <div className="run-yn">
          {[["Evet", true, "success"], ["Hayır", false, "danger"]].map(([lbl, val, tn]) => (
            <button key={lbl} type="button" className={`run-yn-btn${a === val ? " on " + tn : ""}`} onClick={() => set(i, val)}>
              <Icon name={val ? "check" : "plus"} size={16} style={val ? null : { transform: "rotate(45deg)" }} />{lbl}
            </button>
          ))}
        </div>
      );
    }
    if (q.kind === "scale") {
      return (
        <div className="run-scale">
          {Array.from({ length: 11 }, (_, v) => (
            <button key={v} type="button" className={`run-scale-n${a === v ? " on" : ""}`} onClick={() => set(i, v)}>{v}</button>
          ))}
          <div className="run-scale-cap"><span>Düşük</span><span>Yüksek</span></div>
        </div>
      );
    }
    if (q.kind === "choice") {
      return (
        <div className="run-choice">
          {(q.options || []).map((opt, idx) => (
            <button key={idx} type="button" className={`run-opt${a === idx ? " on" : ""}`} onClick={() => set(i, idx)}>
              <span className={`run-radio${a === idx ? " on" : ""}`} />{opt}
            </button>
          ))}
        </div>
      );
    }
    // likert
    return (
      <div className="run-likert">
        {LIKERT.map((lbl, v) => (
          <button key={v} type="button" className={`run-lk${a === v ? " on" : ""}`} onClick={() => set(i, v)} style={a === v ? { "--lk": `var(--${["danger", "warning", "warning", "success", "success"][v]})` } : null}>
            <span className="run-lk-dot" />{lbl}
          </button>
        ))}
      </div>
    );
  };

  return ReactDOM.createPortal((
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 580, height: "min(760px, calc(100vh - 40px))" }} onClick={(e) => e.stopPropagation()}>
        {result ? (
          <div className="co-secure" style={{ padding: "52px 32px" }}>
            <div className="co-ok" style={{ background: `var(--${result.tone})` }}><Icon name="checkCircle" size={34} stroke={2.5} /></div>
            <h3>Test tamamlandı</h3>
            <div className="row" style={{ gap: 8 }}><span className={`badge badge-${result.tone}`} style={{ height: 28, fontSize: 13 }}>{result.label}</span><span className="muted tnum" style={{ fontSize: 13 }}>{result.score.toFixed(1)}/5</span></div>
            <p className="muted">Sonucun koçuna iletildi. Koçun değerlendirip not ekleyecek.</p>
            <button className="btn btn-primary" onClick={onClose}><Icon name="check" size={16} />Kapat</button>
          </div>
        ) : (
          <>
            <div className="modal-head" style={{ flexDirection: "column", alignItems: "stretch", gap: 12 }}>
              <div className="between">
                <div className="row" style={{ gap: 10 }}><span className="stat-icon" style={{ width: 38, height: 38, background: `var(--${t.tone}-soft)`, color: `var(--${t.tone})` }}><Icon name={t.icon} size={18} /></span><div><h3 style={{ fontSize: 15.5, fontWeight: 800 }}>{t.name}</h3><div className="muted" style={{ fontSize: 12 }}>{qs.length} soru · samimi yanıtla</div></div></div>
                <button className="icon-btn" style={{ width: 36, height: 36 }} onClick={onClose} aria-label="Kapat"><Icon name="plus" size={18} style={{ transform: "rotate(45deg)" }} /></button>
              </div>
              <div className="run-prog"><div className="run-prog-bar" style={{ width: pct + "%" }} /></div>
            </div>
            <div className="modal-body" style={{ gap: 14, background: "var(--surface-2)" }}>
              {qs.map((q, i) => (
                <div key={i} className="run-q">
                  <div className="run-q-head"><span className="run-q-no">{i + 1}</span><span className="run-q-text">{q.text}</span>{ans[i] !== undefined ? <Icon name="checkCircle" size={16} style={{ color: "var(--success)", marginLeft: "auto", flexShrink: 0 }} /> : null}</div>
                  <Control q={q} i={i} />
                </div>
              ))}
            </div>
            <div className="modal-foot" style={{ justifyContent: "space-between" }}>
              <span className="muted" style={{ fontSize: 12, fontWeight: 600 }}>{answered}/{qs.length} yanıtlandı</span>
              <button className="btn btn-primary" disabled={!allAnswered} onClick={submit} style={{ opacity: allAnswered ? 1 : 0.5 }}><Icon name="checkCircle" size={16} />Testi Bitir</button>
            </div>
          </>
        )}
      </div>
    </div>
  ), document.body);
}

/* ---- Koç: Test Oluştur (özel soru tipleri) ---- */
const TEST_ICONS = ["star", "alert", "bolt", "target", "book", "heart", "ai", "notebook"];
const TEST_TONES = ["primary", "info", "success", "warning", "danger"];
function TestBuilderModal({ open, onClose }) {
  const blank = () => ({ text: "", kind: "likert", options: ["", ""] });
  const [name, setName] = useState(""); const [desc, setDesc] = useState("");
  const [icon, setIcon] = useState("star"); const [tone, setTone] = useState("primary");
  const [qs, setQs] = useState([blank()]);
  useEffect(() => { if (open) { setName(""); setDesc(""); setIcon("star"); setTone("primary"); setQs([blank()]); } }, [open]);
  if (!open) return null;
  const setQ = (i, patch) => setQs((p) => p.map((q, j) => j === i ? { ...q, ...patch } : q));
  const setOpt = (i, oi, v) => setQs((p) => p.map((q, j) => j === i ? { ...q, options: q.options.map((o, k) => k === oi ? v : o) } : q));
  const addOpt = (i) => setQs((p) => p.map((q, j) => j === i ? { ...q, options: [...q.options, ""] } : q));
  const delOpt = (i, oi) => setQs((p) => p.map((q, j) => j === i ? { ...q, options: q.options.filter((_, k) => k !== oi) } : q));
  const valid = name.trim().length > 1 && qs.length > 0 && qs.every((q) => q.text.trim() && (q.kind !== "choice" || q.options.filter((o) => o.trim()).length >= 2));
  const save = () => {
    const questions = qs.map((q) => q.kind === "choice" ? { text: q.text.trim(), kind: "choice", options: q.options.map((o) => o.trim()).filter(Boolean) } : { text: q.text.trim(), kind: q.kind });
    addCustomTest({ name: name.trim(), desc: desc.trim() || "Özel envanter", icon, tone, questions, bands: [[0, 2.5, "Düşük", "danger"], [2.5, 3.7, "Orta", "warning"], [3.7, 5, "Yüksek", "success"]] });
    toast("Test oluşturuldu: " + name.trim()); onClose();
  };
  return ReactDOM.createPortal((
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 620, height: "min(820px, calc(100vh - 32px))" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="row" style={{ gap: 11 }}><span className="stat-icon tone-primary" style={{ width: 38, height: 38 }}><Icon name="plus" size={18} /></span><div><h3 style={{ fontSize: 15.5, fontWeight: 800 }}>Test Oluştur</h3><div className="muted" style={{ fontSize: 12 }}>Kendi envanterini ve soru tiplerini tanımla</div></div></div>
          <button className="icon-btn" style={{ width: 36, height: 36 }} onClick={onClose} aria-label="Kapat"><Icon name="plus" size={18} style={{ transform: "rotate(45deg)" }} /></button>
        </div>
        <div className="modal-body" style={{ padding: "16px 20px", gap: 14 }}>
          <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
            <div className="field" style={{ flex: "1 1 220px" }}><label className="label">Test adı</label><input className="input" placeholder="ör. Çalışma Alışkanlıkları" value={name} onChange={(e) => setName(e.target.value)} autoFocus /></div>
            <div className="field" style={{ flex: "1 1 220px" }}><label className="label">Açıklama</label><input className="input" placeholder="Kısa açıklama" value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
          </div>
          <div className="row" style={{ gap: 18, flexWrap: "wrap" }}>
            <div><div className="label" style={{ marginBottom: 6 }}>İkon</div><div className="row" style={{ gap: 6 }}>{TEST_ICONS.map((ic) => <button key={ic} type="button" className="icon-btn" style={{ width: 36, height: 36, border: "1px solid " + (icon === ic ? "var(--primary)" : "var(--border)"), background: icon === ic ? "var(--primary-soft)" : "var(--surface)", color: icon === ic ? "var(--primary-600)" : "var(--muted)" }} onClick={() => setIcon(ic)}><Icon name={ic} size={17} /></button>)}</div></div>
            <div><div className="label" style={{ marginBottom: 6 }}>Renk</div><div className="row" style={{ gap: 7 }}>{TEST_TONES.map((tn) => <button key={tn} type="button" onClick={() => setTone(tn)} style={{ width: 28, height: 28, borderRadius: 8, background: `var(--${tn})`, border: tone === tn ? "2px solid var(--text)" : "2px solid transparent", cursor: "pointer" }} aria-label={tn} />)}</div></div>
          </div>

          <div className="between" style={{ marginTop: 4 }}><label className="label" style={{ margin: 0 }}>Sorular</label><span className="badge badge-muted" style={{ height: 20 }}>{qs.length} soru</span></div>
          {qs.map((q, i) => (
            <div key={i} className="build-q">
              <div className="row" style={{ gap: 8, alignItems: "flex-start" }}>
                <span className="run-q-no" style={{ marginTop: 6 }}>{i + 1}</span>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                  <input className="input" placeholder="Soru metni" value={q.text} onChange={(e) => setQ(i, { text: e.target.value })} />
                  <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                    <select className="select" style={{ height: 34, flex: "0 1 200px" }} value={q.kind} onChange={(e) => setQ(i, { kind: e.target.value })}>
                      {Object.entries(QKINDS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                    <span className="muted" style={{ fontSize: 11.5 }}>{(QKINDS[q.kind] || {}).hint}</span>
                    {qs.length > 1 ? <button className="icon-btn" style={{ width: 32, height: 32, color: "var(--danger)", marginLeft: "auto" }} onClick={() => setQs((p) => p.filter((_, j) => j !== i))} aria-label="Soruyu sil"><Icon name="plus" size={14} style={{ transform: "rotate(45deg)" }} /></button> : null}
                  </div>
                  {q.kind === "choice" ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingLeft: 2 }}>
                      {q.options.map((o, oi) => (
                        <div key={oi} className="row" style={{ gap: 7 }}>
                          <span className="run-radio" style={{ flexShrink: 0 }} />
                          <input className="input" style={{ height: 34, flex: 1 }} placeholder={`Seçenek ${oi + 1}`} value={o} onChange={(e) => setOpt(i, oi, e.target.value)} />
                          {q.options.length > 2 ? <button className="icon-btn" style={{ width: 30, height: 30, color: "var(--faint)" }} onClick={() => delOpt(i, oi)} aria-label="Sil"><Icon name="plus" size={13} style={{ transform: "rotate(45deg)" }} /></button> : null}
                        </div>
                      ))}
                      <button className="link-btn" style={{ fontSize: 12, alignSelf: "flex-start" }} onClick={() => addOpt(i)}><Icon name="plus" size={13} />Seçenek ekle</button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
          <button className="btn btn-light" style={{ alignSelf: "flex-start" }} onClick={() => setQs((p) => [...p, blank()])}><Icon name="plus" size={15} />Soru ekle</button>
        </div>
        <div className="modal-foot">
          <button className="btn btn-light" onClick={onClose}>Vazgeç</button>
          <button className="btn btn-primary" disabled={!valid} style={{ marginLeft: "auto", opacity: valid ? 1 : 0.5 }} onClick={save}><Icon name="check" size={16} />Testi Kaydet</button>
        </div>
      </div>
    </div>
  ), document.body);
}

Object.assign(window, { CoachTestsPage, StudentTestsPage, TestBuilderModal });
