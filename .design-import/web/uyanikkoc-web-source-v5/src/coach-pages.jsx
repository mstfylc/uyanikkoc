/* Coach sub-pages: Ödev & Görev, Raporlar */

/* ---------------- Ödev & Görev ---------------- */
function CoachSelfStudyPanel({ student }) {
  const self = (typeof useSelfStudy === "function") ? useSelfStudy(student) : [];
  const rel = (ts) => { if (!ts) return ""; const d = Math.floor((Date.now() - ts) / 86400000); return d <= 0 ? "bugün" : d === 1 ? "dün" : d < 7 ? d + " gün önce" : d < 30 ? Math.floor(d / 7) + " hafta önce" : Math.floor(d / 30) + " ay önce"; };
  const totalSoru = self.reduce((a, s) => a + (s.kind === "cozdum" ? (s.soru || 0) : 0), 0);
  return (
    <Section title="Ödev Harici Çalışma" sub="Öğrencinin kendi inisiyatifiyle yaptığı çalışmalar" action={
      <div className="row" style={{ gap: 8 }}>
        {totalSoru > 0 ? <span className="badge badge-info"><Icon name="notebook" size={13} />{totalSoru.toLocaleString("tr-TR")} soru</span> : null}
        <Badge tone="muted">{self.length}</Badge>
      </div>
    }>
      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {self.length === 0 ? (
          <div style={{ padding: "22px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Bu öğrenci henüz ödev harici çalışma girmedi.</div>
        ) : self.map((s) => {
          const c = (typeof SUBJECT_COLORS !== "undefined" && SUBJECT_COLORS[s.subject]) || "var(--primary)";
          const cozdum = s.kind === "cozdum";
          return (
            <div className="lrow" key={s.id} style={{ cursor: "default", alignItems: "center" }}>
              <span className="lr-icon" style={{ background: `color-mix(in srgb, ${c} 13%, transparent)`, color: c, flexShrink: 0 }}><Icon name={cozdum ? "notebook" : "book"} size={18} /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="lr-title" style={{ fontSize: 13.5 }}>{s.book}</div>
                <div className="lr-meta">
                  <span className="chip" style={{ height: 20, fontSize: 10.5 }}><span className="swatch" style={{ background: c }} />{s.subject}</span>
                  <span className="d">{rel(s.date)}</span>
                </div>
              </div>
              {cozdum
                ? <div style={{ textAlign: "right" }}>
                    <div className="tnum" style={{ fontSize: 14, fontWeight: 800 }}>{s.soru} <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)" }}>soru</span></div>
                    {s.dogru != null ? <div className="tnum" style={{ fontSize: 11.5, fontWeight: 700, color: "var(--success)" }}>{s.dogru} doğru · %{Math.round((s.dogru / s.soru) * 100)}</div> : null}
                  </div>
                : <span className="badge badge-info"><Icon name="book" size={12} />konu çalıştı</span>}
            </div>
          );
        })}
      </div>
    </Section>
  );
}

/* ---- Koç: tamamlanan ödev / deneme hakkında öğrenciye not gönder ---- */
function CoachNoteModal({ open, onClose, student, context, odevId }) {
  const [text, setText] = useState("");
  useEffect(() => { if (open) setText(""); }, [open]);
  if (!open) return null;
  const coach = (typeof COACH !== "undefined" && COACH.name) || "Dilek Emen";
  const TMPL = ["Eline sağlık, güzel ilerleme 👏", "Bu konuda biraz daha pratik gerekiyor.", "Yanlışlarını deftere eklemeyi unutma.", "Süre yönetimine dikkat edelim."];
  const send = () => {
    if (!text.trim()) return;
    if (typeof sendMsg === "function") sendMsg("dm:" + student, coach, "coach", "📌 " + context.title + " — " + text.trim());
    if (odevId && typeof updateOdev === "function") updateOdev(odevId, { feedback: text.trim() });
    if (typeof toast === "function") toast(student.split(" ")[0] + "'e geri bildirim gönderildi", { icon: "send" });
    onClose();
  };
  return ReactDOM.createPortal((
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 470 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="row" style={{ gap: 11 }}>
            <span className="lr-icon" style={{ width: 38, height: 38, background: "var(--primary-soft)", color: "var(--primary-600)" }}><Icon name="send" size={18} /></span>
            <div><h3 style={{ fontSize: 15.5, fontWeight: 800 }}>Geri bildirim gönder</h3><div className="muted" style={{ fontSize: 12 }}>{student}</div></div>
          </div>
          <button className="icon-btn" style={{ width: 36, height: 36 }} onClick={onClose} aria-label="Kapat"><Icon name="plus" size={18} style={{ transform: "rotate(45deg)" }} /></button>
        </div>
        <div className="modal-body" style={{ gap: 12 }}>
          <div className="ata-srcinfo" style={{ marginTop: 0 }}><Icon name={context.kind === "deneme" ? "chart" : "clipboard"} size={14} style={{ color: "var(--primary)", flexShrink: 0 }} /><span className="nm">{context.title}</span>{context.stat ? <span className="sb">{context.stat}</span> : null}</div>
          <textarea className="input" style={{ minHeight: 96, resize: "vertical", padding: "10px 12px" }} value={text} onChange={(e) => setText(e.target.value)} placeholder="Öğrenciye notunu yaz…" autoFocus />
          <div className="row" style={{ gap: 7, flexWrap: "wrap" }}>
            {TMPL.map((t) => <button key={t} type="button" className="yd-type" style={{ fontWeight: 600, whiteSpace: "nowrap" }} onClick={() => setText((x) => x ? x + " " + t : t)}>{t}</button>)}
          </div>
        </div>
        <div className="modal-foot">
          <span className="muted" style={{ fontSize: 12 }}>Mesaj olarak iletilir · öğrenciye bildirim gider</span>
          <div className="row" style={{ gap: 10, marginLeft: "auto" }}>
            <button className="btn btn-ghost" onClick={onClose}>Vazgeç</button>
            <button className="btn btn-primary" onClick={send} disabled={!text.trim()}><Icon name="send" size={15} />Gönder</button>
          </div>
        </div>
      </div>
    </div>
  ), document.body);
}

function CoachAssignmentRow({ a }) {
  const [noteOpen, setNoteOpen] = useState(false);
  const c = SUBJECT_COLORS[a.subject] || "var(--primary)";
  const typeList = a.types && a.types.length ? a.types : [a.type];
  const t = ODEV_TYPES[typeList[0]] || ODEV_TYPES.soru;
  const needsResult = typeList.some((k) => ODEV_TYPES[k] && ODEV_TYPES[k].needsResult);
  const overdue = a.status !== "done" && a.due && new Date(a.due) < new Date("2026-06-05");
  return (
    <div className="lrow" style={{ alignItems: "flex-start" }}>
      <Avatar name={a.student} size={38} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="lr-title">{a.topic} <span className="muted" style={{ fontWeight: 500 }}>· {a.student}</span></div>
        <div className="lr-meta">
          <span className="chip" style={{ height: 21, fontSize: 10.5, padding: "0 7px" }}><span className="swatch" style={{ background: c }} />{a.subject}</span>
          {typeList.map((k) => <span key={k} className="d">{(ODEV_TYPES[k] || {}).label || k}</span>)}
          {needsResult && a.count ? <span className="d">{a.count} soru</span> : null}
          <span className="d row" style={{ gap: 4 }}><Icon name="book" size={12} style={{ color: "var(--faint)" }} />{a.source}</span>
          {a.due ? <span className="d" style={{ color: overdue ? "var(--danger)" : "var(--muted)", fontWeight: overdue ? 700 : 500 }}>{new Date(a.due).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}</span> : null}
        </div>
        {a.note ? <div style={{ fontSize: 11.5, color: "var(--text-2)", marginTop: 5 }}>📌 {a.note}</div> : null}
        {a.status === "done" && a.result ? (
          <div className="row" style={{ gap: 10, marginTop: 7, fontSize: 11.5, fontWeight: 700 }}>
            <span style={{ color: "var(--success)" }}>✓ {a.result.d}</span>
            <span style={{ color: "var(--danger)" }}>✕ {a.result.y}</span>
            <span className="muted">○ {a.result.b}</span>
            <span className="badge badge-primary" style={{ height: 19 }}>net {Math.max(0, a.result.d - a.result.y / 4).toFixed(2).replace(/\.00$/, "")}</span>
            {a.count ? <span className="badge badge-muted" style={{ height: 19 }}>%{Math.round(((a.result.d + a.result.y + a.result.b) / a.count) * 100)} çözüm</span> : null}
          </div>
        ) : null}
      </div>
      {a.status === "done"
        ? <Badge tone="success" icon="checkCircle">{a.result ? "Sonuç girildi" : "Tamamlandı"}</Badge>
        : <Badge tone={overdue ? "danger" : "warning"} icon={overdue ? "alert" : "clock"}>{overdue ? "Gecikti" : "Bekliyor"}</Badge>}
      {a.status === "done" ? <button className="btn btn-light btn-sm" style={{ flexShrink: 0 }} onClick={() => setNoteOpen(true)}><Icon name="send" size={14} />Not</button> : null}
      <CoachNoteModal open={noteOpen} onClose={() => setNoteOpen(false)} student={a.student} odevId={a.id} context={{ title: a.topic + " ödevi", kind: "odev", stat: a.result ? `${a.result.d} doğru · net ${Math.max(0, a.result.d - a.result.y / 4).toFixed(2).replace(/\.00$/, "")}` : null }} />
    </div>
  );
}

function CreateForm({ onCreate }) {
  const [student, setStudent] = useState(STUDENT_OPTIONS[0]);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Matematik");
  const [type, setType] = useState("homework");
  const [priority, setPriority] = useState("medium");
  const [due, setDue] = useState("");
  const [ok, setOk] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (title.trim().length < 2) return;
    onCreate({ id: "n" + Date.now(), title: title.trim(), subject, type, priority, student, due: due || "Belirtilmedi", status: "pending" });
    setTitle(""); setDue("");
    setOk(true);
    setTimeout(() => setOk(false), 2200);
  };

  return (
    <Section title="Yeni Ödev Ata" sub="Öğrencine görev oluştur">
      <form className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }} onSubmit={submit}>
        <div className="field">
          <label className="label">Öğrenci</label>
          <select className="select" value={student} onChange={(e) => setStudent(e.target.value)}>
            {STUDENT_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="field">
          <label className="label">Başlık</label>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ör. Türev — 40 soruluk test" />
        </div>
        <div className="grid g-2" style={{ gap: 12 }}>
          <div className="field">
            <label className="label">Ders</label>
            <select className="select" value={subject} onChange={(e) => setSubject(e.target.value)}>
              {Object.keys(SUBJECT_COLORS).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="label">Tür</label>
            <select className="select" value={type} onChange={(e) => setType(e.target.value)}>
              {Object.entries(TYPE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
        </div>
        <div className="grid g-2" style={{ gap: 12 }}>
          <div className="field">
            <label className="label">Öncelik</label>
            <select className="select" value={priority} onChange={(e) => setPriority(e.target.value)}>
              {Object.entries(PRIORITY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="label">Son tarih</label>
            <input className="input" value={due} onChange={(e) => setDue(e.target.value)} placeholder="ör. Yarın" />
          </div>
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
          <Icon name={ok ? "check" : "plus"} size={16} />{ok ? "Ödev atandı!" : "Ödevi ata"}
        </button>
        {ok ? <div className="badge badge-success" style={{ alignSelf: "center" }}><Icon name="checkCircle" size={13} />Listenin başına eklendi</div> : null}
      </form>
    </Section>
  );
}

function CoachAssignmentsPage() {
  const roster = useRoster();
  const odevler = useOdevler();
  const [week, setWeek] = useState("w0");
  const [filter, setFilter] = useState("all");
  const [stu, setStu] = useState("all");
  const [ata, setAta] = useState(false);
  const [smart, setSmart] = useState(false);
  const ataStudent = stu !== "all" ? roster.find((s) => s.name === stu) : roster[0];

  const weekHasData = (w) => odevler.some((o) => o.week === w);
  const inWeek = odevler.filter((o) => o.week === week);
  const total = inWeek.length;
  const completed = inWeek.filter((o) => o.status === "done").length;
  const withResult = inWeek.filter((o) => o.status === "done" && o.result).length;
  const overdue = inWeek.filter((o) => o.status !== "done" && o.due && new Date(o.due) < new Date("2026-06-05")).length;
  const rate = total ? Math.round((completed / total) * 100) : 0;

  const FILTERS = { all: "Tümü", pending: "Bekleyen", done: "Tamamlanan", result: "Sonuçlu" };
  const matchF = (o) => filter === "all" ? true : filter === "done" ? o.status === "done" : filter === "result" ? (o.status === "done" && o.result) : o.status !== "done";
  const shown = inWeek.filter((o) => (stu === "all" || o.student === stu) && matchF(o));

  return (
    <div className="stack rise">
      <PageHead title="Ödev & Görev" sub="Atadığın ödevler, kaynaklar ve öğrenci sonuçları" actions={
        <div className="row" style={{ gap: 8 }}>
          <select className="select" style={{ height: 36, maxWidth: 180 }} value={stu} onChange={(e) => setStu(e.target.value)}>
            <option value="all">Tüm öğrenciler</option>
            {roster.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
          <button className="btn btn-smart" onClick={() => setSmart(true)}><Icon name="bolt" size={16} />Akıllı Ödev</button>
          <button className="btn btn-primary" onClick={() => setAta(true)}><Icon name="plus" size={16} />Ödev Ata</button>
        </div>
      } />

      <div className="seg" style={{ width: "fit-content", flexWrap: "wrap" }}>
        {WEEKS.map((w) => (
          <button key={w.id} className={week === w.id ? "on" : ""} onClick={() => setWeek(w.id)} disabled={!weekHasData(w.id)} style={{ opacity: weekHasData(w.id) ? 1 : 0.4 }}>{w.label}</button>
        ))}
      </div>

      <div className="grid g-4">
        <StatCard icon="clipboard" tone="primary" value={total} label="Atanan ödev" />
        <StatCard icon="target" tone="success" value={`${rate}%`} label="Tamamlanma" />
        <StatCard icon="chart" tone="info" value={withResult} label="Sonuç girilen" />
        <StatCard icon="alert" tone="danger" value={overdue} label="Gecikmiş" />
      </div>

      <Section
        title="Atanan Ödevler"
        sub={`${WEEKS.find((w) => w.id === week).range} · ${shown.length} görev`}
        action={
          <div className="filters">
            {Object.entries(FILTERS).map(([k, v]) => (
              <button key={k} className={filter === k ? "on" : ""} onClick={() => setFilter(k)}>{v}</button>
            ))}
          </div>
        }
      >
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {shown.length === 0
            ? <div style={{ padding: "26px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Bu görünümde ödev yok. <span style={{ color: "var(--primary-600)", fontWeight: 700 }}>Konu Takibi</span> sayfasından "Ödev Ata" ile ekleyebilirsin.</div>
            : shown.map((a) => <CoachAssignmentRow key={a.id} a={a} />)}
        </div>
      </Section>

      {stu === "all"
        ? <div className="card"><div className="card-body" style={{ padding: "22px 18px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Kaynak takibini ve ödev harici çalışmaları görmek için yukarıdan <b style={{ color: "var(--text-2)" }}>bir öğrenci seç</b>.</div></div>
        : <React.Fragment>
            <CoachSelfStudyPanel student={stu} />
            <KaynakTracker student={stu} editable defaultExam={(roster.find((s) => s.name === stu) || {}).sinav || "Tümü"} />
          </React.Fragment>}
      {ataStudent ? <OdevAtaModal open={ata} onClose={() => setAta(false)} studentName={ataStudent.name} examType={ataStudent.sinav || "YKS"} bulkRoster={roster} defaultAll={stu === "all"} onAssign={() => {}} /> : null}
      {typeof SmartOdevModal === "function" ? <SmartOdevModal open={smart} onClose={() => setSmart(false)} student={ataStudent ? ataStudent.name : null} onAssign={() => { setWeek("w0"); setStu(ataStudent ? ataStudent.name : "all"); }} /> : null}
    </div>
  );
}

/* ---------------- Raporlar ---------------- */
function classTrend() {
  const n = COACH_STUDENTS[0].trend.length;
  const out = [];
  for (let i = 0; i < n; i++) out.push(Math.round(COACH_STUDENTS.reduce((s, st) => s + st.trend[i], 0) / COACH_STUDENTS.length));
  return out;
}

function CoachReportsPage() {
  const reports = useReports();
  const [detail, setDetail] = useState(null);
  const approveAll = () => { approveAllReports(); if (typeof toast === "function") toast("Tüm raporlar onaylandı ve velilere gönderildi", { icon: "send" }); };

  const pending = reports.filter((r) => r.status === "pending").length;
  const trend = classTrend();
  const avg = Math.round(COACH_STUDENTS.reduce((s, x) => s + x.completion, 0) / COACH_STUDENTS.length);
  const weekAvg = Math.round(COACH_WEEK_COMPLETION.reduce((s, d) => s + d.v, 0) / COACH_WEEK_COMPLETION.length);
  const [repFilter, setRepFilter] = useState("all");
  const filtered = reports.filter((r) => repFilter === "all" ? true : repFilter === "pending" ? r.status !== "approved" : r.status === "approved");
  const parseNet = (r) => parseFloat(String(r.net).replace("+", "")) || 0;
  const topImp = reports.length ? [...reports].sort((a, b) => parseNet(b) - parseNet(a))[0] : null;
  const needAtt = reports.length ? [...reports].sort((a, b) => a.completion - b.completion)[0] : null;

  return (
    <div className="stack rise">
      <PageHead title="Raporlar" sub="Sınıf performansı ve veli raporları" actions={pending > 0 ? <button className="btn btn-primary btn-sm" onClick={approveAll}><Icon name="check" size={16} />Tümünü onayla ({pending})</button> : <Badge tone="success" icon="checkCircle">Tümü onaylandı</Badge>} />

      <div className="grid g-4">
        <StatCard icon="clipboard" tone="warning" value={pending} label="Onay bekleyen rapor" />
        <StatCard icon="target" tone="success" value={`${avg}%`} label="Sınıf tamamlama" />
        <StatCard icon="trend" tone="primary" value={`+${trend[trend.length - 1] - trend[0]}`} label="Sınıf net artışı" />
        <StatCard icon="alert" tone="danger" value={COACH.atRisk} label="Risk altında" />
      </div>

      <Section title="Sınıf Net Gelişimi" sub="Tüm öğrencilerin ortalama neti" action={<Badge tone="primary">{trend[trend.length - 1]} net</Badge>}>
        <div className="card-body"><Sparkline data={trend} color="var(--primary)" h={80} /></div>
      </Section>

      {topImp || needAtt ? (
        <div className="grid g-2" style={{ gap: 14 }}>
          {topImp ? (
            <div className="card"><div className="card-pad" style={{ display: "flex", gap: 13, alignItems: "center" }}>
              <span className="stat-icon tone-success"><Icon name="trend" size={22} /></span>
              <div style={{ flex: 1, minWidth: 0 }}><div className="muted" style={{ fontSize: 11.5, fontWeight: 700 }}>EN ÇOK GELİŞEN</div><div className="row" style={{ gap: 9, marginTop: 4 }}><Avatar name={topImp.student} size={30} /><b style={{ fontSize: 14 }}>{topImp.student}</b><span className="delta up"><Icon name="arrowUp" size={12} />{topImp.net} net</span></div></div>
              <button className="btn btn-light btn-sm" onClick={() => setDetail(topImp)}>Rapor</button>
            </div></div>
          ) : null}
          {needAtt ? (
            <div className="card"><div className="card-pad" style={{ display: "flex", gap: 13, alignItems: "center" }}>
              <span className="stat-icon tone-danger"><Icon name="alert" size={22} /></span>
              <div style={{ flex: 1, minWidth: 0 }}><div className="muted" style={{ fontSize: 11.5, fontWeight: 700 }}>İLGİ GEREKTİREN</div><div className="row" style={{ gap: 9, marginTop: 4 }}><Avatar name={needAtt.student} size={30} /><b style={{ fontSize: 14 }}>{needAtt.student}</b><span className="badge badge-danger" style={{ height: 20 }}>%{needAtt.completion} tamamlama</span></div></div>
              <button className="btn btn-light btn-sm" onClick={() => setDetail(needAtt)}>Rapor</button>
            </div></div>
          ) : null}
        </div>
      ) : null}

      <div className="grid col-main">
        <Section title="Veli Raporları" sub={`${pending} onay bekliyor`} action={
          <div className="filters">
            <button className={repFilter === "all" ? "on" : ""} onClick={() => setRepFilter("all")}>Tümü</button>
            <button className={repFilter === "pending" ? "on" : ""} onClick={() => setRepFilter("pending")}>Bekleyen</button>
            <button className={repFilter === "approved" ? "on" : ""} onClick={() => setRepFilter("approved")}>Gönderilen</button>
          </div>
        }>
          <div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
            <table className="tbl" style={{ minWidth: 540 }}>
              <thead><tr><th>Öğrenci / Veli</th><th>Hafta</th><th>Tamamlama</th><th>Net</th><th style={{ textAlign: "right" }}>İşlem</th></tr></thead>
              <tbody>
                {filtered.map((r) => {
                  const up = r.net.startsWith("+");
                  return (
                    <tr key={r.id}>
                      <td><div className="name"><Avatar name={r.student} size={34} /><div><b>{r.student}</b><br /><span>{r.parent}</span></div></div></td>
                      <td><span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, whiteSpace: "nowrap" }}>{r.week}</span></td>
                      <td><span className="tnum" style={{ fontWeight: 700, color: r.completion >= 75 ? "var(--success)" : r.completion >= 50 ? "var(--warning)" : "var(--danger)" }}>{r.completion}%</span></td>
                      <td><span className={`delta ${up ? "up" : "down"}`}><Icon name={up ? "arrowUp" : "arrowDown"} size={12} />{r.net}</span></td>
                      <td style={{ textAlign: "right" }}>
                        <div className="row" style={{ gap: 6, justifyContent: "flex-end" }}>
                          <button className="btn btn-light btn-sm" onClick={() => setDetail(r)}><Icon name="chart" size={14} />Görüntüle</button>
                          {r.status === "approved"
                            ? <Badge tone="success" icon="check">Gönderildi</Badge>
                            : <button className="btn btn-primary btn-sm" onClick={() => setDetail(r)}>Onayla & Gönder</button>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 ? <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--muted)", fontSize: 13, padding: "20px" }}>Bu filtrede rapor yok.</td></tr> : null}
              </tbody>
            </table>
          </div>
        </Section>

        <div className="stack">
          <Section title="Haftalık Tamamlama" sub="Sınıf günlük ortalaması" action={<Badge tone="primary">{weekAvg}%</Badge>}>
            <div className="card-body"><BarChart data={COACH_WEEK_COMPLETION} max={100} peakIdx={4} /></div>
          </Section>
          <Section title="Risk Dağılımı">
            <div className="card-body subj">
              {Object.entries(RISK).map(([k, r]) => {
                const n = COACH_STUDENTS.filter((s) => s.risk === k).length;
                const pct = Math.round((n / COACH_STUDENTS.length) * 100);
                return (
                  <div className="subj-row" key={k}>
                    <div className="between" style={{ marginBottom: 8 }}>
                      <span className="sname"><span className="swatch" style={{ background: `var(--${r.tone})` }} />{r.label}</span>
                      <span className="spct tnum">{n} öğrenci</span>
                    </div>
                    <Bar value={pct} color={`var(--${r.tone})`} thin />
                  </div>
                );
              })}
            </div>
          </Section>
        </div>
      </div>
      {typeof CoachRatingsSummary === "function" ? <CoachRatingsSummary /> : null}
      <ReportDetailModal open={!!detail} report={detail} coach onClose={() => setDetail(null)} />
    </div>
  );
}

Object.assign(window, { CoachAssignmentsPage, CoachReportsPage, CoachNoteModal });
