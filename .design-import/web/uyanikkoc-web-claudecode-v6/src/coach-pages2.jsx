/* Coach sub-pages: Mesajlar, Denemeler (sınıf) */

/* ---------------- Mesajlar ---------------- */
function CoachMessagesPage() {
  const [convos, setConvos] = useState(() => MESSAGES.map((m) => ({ ...m, thread: [...m.thread] })));
  const [sel, setSel] = useState(convos[0].id);
  const [draft, setDraft] = useState("");
  const active = convos.find((c) => c.id === sel);

  const send = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    const now = new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
    setConvos((cs) => cs.map((c) => c.id === sel ? { ...c, thread: [...c.thread, { me: true, t: draft.trim(), time: now }], unread: 0 } : c));
    setDraft("");
  };
  const openConvo = (id) => { setSel(id); setConvos((cs) => cs.map((c) => c.id === id ? { ...c, unread: 0 } : c)); };

  return (
    <div className="stack rise">
      <PageHead title="Mesajlar" sub="Öğrenci ve velilerinle iletişim" />
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", height: 600 }}>
          {/* conversation list */}
          <div style={{ borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", minHeight: 0 }}>
            <div style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>
              <div className="searchbox" style={{ minWidth: 0, margin: 0, display: "flex" }}><Icon name="search" size={16} /><input placeholder="Sohbet ara..." /></div>
            </div>
            <div style={{ overflowY: "auto", flex: 1, padding: 8 }}>
              {convos.map((c) => {
                const on = c.id === sel;
                const last = c.thread[c.thread.length - 1];
                return (
                  <button key={c.id} onClick={() => openConvo(c.id)} style={{ display: "flex", gap: 12, padding: "11px 12px", borderRadius: 12, width: "100%", textAlign: "left", border: "none", background: on ? "var(--surface-3)" : "none", cursor: "pointer", alignItems: "center" }}>
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <Avatar name={c.name} size={42} />
                      {c.online ? <span style={{ position: "absolute", bottom: 1, right: 1, width: 11, height: 11, borderRadius: 999, background: "var(--success)", border: "2.5px solid var(--surface)" }} /> : null}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="between" style={{ gap: 6 }}>
                        <b style={{ fontSize: 13.5, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</b>
                        <span style={{ fontSize: 11, color: "var(--faint)", flexShrink: 0 }}>{c.time}</span>
                      </div>
                      <div className="between" style={{ gap: 6, marginTop: 2 }}>
                        <span style={{ fontSize: 12, color: "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{last.me ? "Sen: " : ""}{last.t}</span>
                        {c.unread ? <span className="nav-count tnum" style={{ minWidth: 18, height: 18, fontSize: 10.5 }}>{c.unread}</span> : null}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* thread */}
          <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
            <div className="row" style={{ gap: 12, padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ position: "relative" }}>
                <Avatar name={active.name} size={40} />
                {active.online ? <span style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderRadius: 999, background: "var(--success)", border: "2.5px solid var(--surface)" }} /> : null}
              </div>
              <div style={{ flex: 1 }}>
                <b style={{ fontSize: 14, fontWeight: 700 }}>{active.name}</b>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>{active.who}{active.online ? " · çevrimiçi" : ""}</div>
              </div>
              <button className="icon-btn" style={{ width: 36, height: 36 }}><Icon name="bell" size={17} /></button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "20px 18px", display: "flex", flexDirection: "column", gap: 12, background: "var(--surface-2)" }}>
              {active.thread.map((m, i) => (
                <div key={i} style={{ alignSelf: m.me ? "flex-end" : "flex-start", maxWidth: "72%" }}>
                  <div style={{ background: m.me ? "var(--primary)" : "var(--surface)", color: m.me ? "#fff" : "var(--text)", border: m.me ? "none" : "1px solid var(--border)", padding: "10px 14px", borderRadius: m.me ? "14px 14px 4px 14px" : "14px 14px 14px 4px", fontSize: 13.5, lineHeight: 1.5, boxShadow: "var(--shadow-sm)" }}>{m.t}</div>
                  <div style={{ fontSize: 10.5, color: "var(--faint)", marginTop: 4, textAlign: m.me ? "right" : "left" }}>{m.time}</div>
                </div>
              ))}
            </div>

            <form onSubmit={send} className="row" style={{ gap: 10, padding: 14, borderTop: "1px solid var(--border)" }}>
              <input className="input" style={{ flex: 1 }} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Mesaj yaz..." />
              <button type="submit" className="btn btn-primary" style={{ width: 44, padding: 0, flexShrink: 0 }}><Icon name="send" size={17} /></button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Denemeler (sınıf) ---------------- */
function classExamAvgs() {
  const n = COACH_STUDENTS[0].trend.length;
  return Array.from({ length: n }, (_, i) => Math.round(COACH_STUDENTS.reduce((s, st) => s + st.trend[i], 0) / COACH_STUDENTS.length));
}

/* öğrenci deneme detay modalı (içe aktarılan) */
function ExamStudentDetail({ student, examName, onClose }) {
  const [noteOpen, setNoteOpen] = useState(false);
  if (!student) return null;
  const best = [...student.detail].sort((a, b) => (b.n / Math.max(1, b.d + b.y)) - (a.n / Math.max(1, a.d + a.y)))[0];
  const worst = [...student.detail].filter((d) => d.d + d.y > 0).sort((a, b) => (a.n / Math.max(1, a.d + a.y)) - (b.n / Math.max(1, b.d + b.y)))[0];
  return ReactDOM.createPortal((
    <>
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="row" style={{ gap: 12 }}>
            <Avatar name={student.ad} size={44} />
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800 }}>{student.ad}</h3>
              <div className="muted" style={{ fontSize: 12.5 }}>{student.sube}{student.numara ? " · No " + student.numara : ""} · {examName}</div>
            </div>
          </div>
          <div className="row" style={{ gap: 8 }}>
            {typeof CoachNoteModal === "function" ? <button className="btn btn-light btn-sm" onClick={() => setNoteOpen(true)}><Icon name="send" size={14} />Not gönder</button> : null}
            <button className="icon-btn" style={{ width: 36, height: 36 }} onClick={onClose} aria-label="Kapat"><Icon name="plus" size={18} style={{ transform: "rotate(45deg)" }} /></button>
          </div>
        </div>
        <div className="modal-body" style={{ gap: 16 }}>
          <div className="grid g-3" style={{ gap: 12 }}>
            <div className="card" style={{ boxShadow: "none" }}><div className="card-pad" style={{ padding: 14 }}><div className="muted" style={{ fontSize: 11, fontWeight: 700 }}>TOPLAM NET</div><div className="tnum" style={{ fontSize: 24, fontWeight: 800 }}>{student.toplamNet.toFixed(2).replace(/\.00$/, "")}</div></div></div>
            <div className="card" style={{ boxShadow: "none" }}><div className="card-pad" style={{ padding: 14 }}><div className="muted" style={{ fontSize: 11, fontWeight: 700 }}>TYT PUANI</div><div className="tnum" style={{ fontSize: 24, fontWeight: 800, color: "var(--primary)" }}>{student.puan ? student.puan.toFixed(2).replace(/\.00$/, "") : "—"}</div></div></div>
            <div className="card" style={{ boxShadow: "none" }}><div className="card-pad" style={{ padding: 14 }}><div className="muted" style={{ fontSize: 11, fontWeight: 700 }}>GENEL SIRA</div><div className="tnum" style={{ fontSize: 24, fontWeight: 800 }}>{student.rank ? student.rank.toLocaleString("tr-TR") : "—"}</div></div></div>
          </div>

          {best && worst ? (
            <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
              <span className="badge badge-success"><Icon name="award" size={13} />En güçlü: {best.ders}</span>
              <span className="badge badge-danger"><Icon name="alert" size={13} />Geliştirilecek: {worst.ders}</span>
            </div>
          ) : null}

          <div className="card" style={{ overflow: "hidden" }}>
            <div className="card-body" style={{ padding: 0 }}>
              <table className="tbl">
                <thead><tr><th>Ders</th><th style={{ textAlign: "center" }}>Doğru</th><th style={{ textAlign: "center" }}>Yanlış</th><th style={{ textAlign: "center" }}>Boş</th><th style={{ textAlign: "right" }}>Net</th></tr></thead>
                <tbody>
                  {student.detail.map((d, i) => {
                    const bos = "—";
                    return (
                      <tr key={i}>
                        <td><div className="row" style={{ gap: 8 }}><span className="swatch" style={{ width: 8, height: 8, borderRadius: 3, background: CAT_COLOR[d.cat] || "var(--primary)" }} /><b style={{ fontSize: 12.5 }}>{d.ders}</b></div></td>
                        <td style={{ textAlign: "center" }}><span className="tnum" style={{ color: "var(--success)", fontWeight: 700 }}>{d.d}</span></td>
                        <td style={{ textAlign: "center" }}><span className="tnum" style={{ color: "var(--danger)", fontWeight: 700 }}>{d.y}</span></td>
                        <td style={{ textAlign: "center" }}><span className="tnum muted">{bos}</span></td>
                        <td style={{ textAlign: "right" }}><b className="tnum">{d.n.toFixed(2).replace(/\.00$/, "")}</b></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    {typeof CoachNoteModal === "function" ? <CoachNoteModal open={noteOpen} onClose={() => setNoteOpen(false)} student={student.ad} context={{ title: examName + " denemesi", kind: "deneme", stat: student.toplamNet.toFixed(2).replace(/\.00$/, "") + " net" }} /> : null}
    </>
  ), document.body);
}

function CoachExamsPage() {
  const exams = useExams();
  const [importing, setImporting] = useState(false);
  const [manual, setManual] = useState(false);
  const [examId, setExamId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [q, setQ] = useState("");

  const exam = exams.find((e) => e.id === examId) || exams[0];

  // mock sınıf (içe aktarılan deneme yoksa)
  const avgs = classExamAvgs();
  const lastAvg = avgs[avgs.length - 1];
  const chartData = EXAM_LABELS.map((l, i) => ({ l, v: avgs[i] }));

  return (
    <div className="stack rise">
      <PageHead title="Denemeler" sub="Deneme sonuçlarını içe aktar ve analiz et" actions={
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-light" onClick={() => setManual(true)}><Icon name="notebook" size={16} />Manuel Giriş</button>
          <button className="btn btn-primary" onClick={() => setImporting(true)}><Icon name="plus" size={16} />Deneme İçe Aktar</button>
        </div>
      } />

      {typeof CoachDenemeManager === "function" ? <CoachDenemeManager /> : null}

      {exams.length === 0 ? (
        <div className="card"><div className="card-pad" style={{ padding: "30px 24px", display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <span className="stat-icon tone-primary" style={{ width: 50, height: 50, borderRadius: 15 }}><Icon name="chart" size={24} /></span>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Henüz içe aktarılmış deneme yok</div>
            <div className="muted" style={{ fontSize: 13, marginTop: 3 }}>Yayınevinden gelen sonuç Excel'ini (.xlsx) yükleyerek tüm öğrencilerin sonuçlarını tek tıkla işle.</div>
          </div>
          <button className="btn btn-primary" onClick={() => setImporting(true)}><Icon name="plus" size={16} />Excel Yükle</button>
        </div></div>
      ) : null}

      {exam ? (() => {
        const studs = exam.students;
        const cats = exam.catOrder || CAT_ORDER;
        const exIdx = exams.indexOf(exam);
        const prevExam = exams[exIdx + 1];
        const prevNet = (ad) => { if (!prevExam) return null; const p = prevExam.students.find((x) => x.ad === ad); return p ? p.toplamNet : null; };
        const catMax = (c) => exam.examType === "LGS" ? (["Türkçe", "Matematik", "Fen Bilimleri"].includes(c) ? 20 : 10) : (["Türkçe", "Matematik"].includes(c) ? 40 : 20);
        const examAvg = (studs.reduce((a, s) => a + s.toplamNet, 0) / studs.length).toFixed(1);
        const best = studs[0];
        const catAvg = {};
        cats.forEach((c) => catAvg[c] = (studs.reduce((a, s) => a + (s.byCat[c]?.n || 0), 0) / studs.length));
        const filtered = q ? studs.filter((s) => s.ad.toLocaleLowerCase("tr-TR").includes(q.toLocaleLowerCase("tr-TR")) || (s.sube || "").toLocaleLowerCase("tr-TR").includes(q.toLocaleLowerCase("tr-TR"))) : studs;
        return (
          <>
            {exams.length > 1 ? (
              <div className="field" style={{ maxWidth: 360 }}>
                <label className="label">Deneme seç
                </label>
                <select className="select" value={exam.id} onChange={(e) => setExamId(e.target.value)}>
                  {exams.map((e) => <option key={e.id} value={e.id}>{e.name} · {e.date}{e.examType ? " · " + e.examType : ""}</option>)}
                </select>
              </div>
            ) : null}

            <div className="grid g-4">
              <StatCard icon="users" tone="primary" value={studs.length} label="Katılan öğrenci" />
              <StatCard icon="target" tone="info" value={examAvg} label="Sınıf ortalaması (net)" />
              <StatCard icon="award" tone="success" value={best.toplamNet.toFixed(2).replace(/\.00$/, "")} label={`En yüksek · ${best.ad.split(" ")[0]}`} />
              <StatCard icon="chart" tone="warning" value={best.puan ? best.puan.toFixed(0) : "—"} label="En yüksek TYT puanı" />
            </div>

            <Section title="Ders Ortalamaları" sub={`${exam.name} · ${exam.examType || "YKS"} · sınıf geneli`}>
              <div className="card-body subj">
                {cats.map((c) => {
                  const max = catMax(c);
                  return (
                    <div className="subj-row" key={c}>
                      <div className="between" style={{ marginBottom: 7 }}>
                        <span className="sname"><span className="swatch" style={{ background: CAT_COLOR[c] || SUBJECT_COLORS[c] || "var(--primary)" }} />{c}</span>
                        <span className="tnum" style={{ fontWeight: 800, fontSize: 13 }}>{catAvg[c].toFixed(1)} <span className="muted" style={{ fontWeight: 600 }}>/ {max}</span></span>
                      </div>
                      <Bar value={(catAvg[c] / max) * 100} color={CAT_COLOR[c] || SUBJECT_COLORS[c] || "var(--primary)"} />
                    </div>
                  );
                })}
              </div>
            </Section>

            <Section
              title="Sıralı Sonuç Listesi"
              sub={`${exam.name} · ${studs.length} öğrenci`}
              action={<div className="searchbox" style={{ minWidth: 200, margin: 0, display: "flex" }}><Icon name="search" size={16} /><input placeholder="Öğrenci / şube ara..." value={q} onChange={(e) => setQ(e.target.value)} /></div>}
            >
              <div className="card-body" style={{ padding: 0, overflowX: "auto", maxHeight: 560, overflowY: "auto" }}>
                <table className="tbl" style={{ minWidth: 720 }}>
                  <thead><tr><th>#</th><th>Öğrenci</th><th>Şube</th>{cats.map((c) => <th key={c} style={{ textAlign: "center" }}>{c}</th>)}<th style={{ textAlign: "right" }}>Net</th><th style={{ textAlign: "right" }}>Puan</th></tr></thead>
                  <tbody>
                    {filtered.map((s, idx) => {
                      const pn = prevNet(s.ad);
                      const dlt = pn == null ? null : +(s.toplamNet - pn).toFixed(2);
                      return (
                      <tr key={idx} style={{ cursor: "pointer" }} onClick={() => setDetail(s)}>
                        <td><span className="tnum" style={{ fontWeight: 800, color: studs.indexOf(s) < 3 ? "var(--primary)" : "var(--faint)" }}>{studs.indexOf(s) + 1}</span></td>
                        <td><div className="name"><Avatar name={s.ad} size={30} /><b style={{ fontSize: 12.5 }}>{s.ad}</b></div></td>
                        <td><span className="muted" style={{ fontSize: 11.5, whiteSpace: "nowrap" }}>{s.sube}</span></td>
                        {cats.map((c) => <td key={c} style={{ textAlign: "center" }}><span className="tnum" style={{ fontSize: 12 }}>{(s.byCat[c]?.n ?? 0).toFixed(2).replace(/\.00$/, "")}</span></td>)}
                        <td style={{ textAlign: "right" }}><div className="row" style={{ gap: 5, justifyContent: "flex-end" }}><b className="tnum">{s.toplamNet.toFixed(2).replace(/\.00$/, "")}</b>{dlt == null ? null : <span className="row" title={prevExam ? "Önceki: " + prevExam.name : ""} style={{ gap: 1, fontSize: 10.5, fontWeight: 800, color: dlt > 0 ? "var(--success)" : dlt < 0 ? "var(--danger)" : "var(--muted)" }}><Icon name={dlt > 0 ? "arrowUp" : dlt < 0 ? "arrowDown" : "chevronRight"} size={11} />{dlt > 0 ? "+" : ""}{dlt !== 0 ? dlt.toFixed(2).replace(/\.00$/, "") : "0"}</span>}</div></td>
                        <td style={{ textAlign: "right" }}><span className="tnum muted">{s.puan ? s.puan.toFixed(0) : "—"}</span></td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Section>
          </>
        );
      })() : null}

      {/* mevcut sınıf trendi (her zaman göster) */}
      <Section title="Sınıf Net Ortalaması (geçmiş)" sub="Takip ettiğin öğrencilerin deneme trendi" action={<Badge tone="success" icon="trend">+{lastAvg - avgs[0]} net</Badge>}>
        <div className="card-body"><BarChart data={chartData} peakIdx={EXAM_LABELS.length - 1} /></div>
      </Section>

      <DenemeImportModal open={importing} onClose={() => setImporting(false)} onImported={(p) => setExamId(null)} />
      <ManualExamModal open={manual} onClose={() => setManual(false)} role="coach" onSaved={() => setExamId(null)} />
      {detail ? <ExamStudentDetail student={detail} examName={exam.name} onClose={() => setDetail(null)} /> : null}
    </div>
  );
}

Object.assign(window, { CoachMessagesPage, CoachExamsPage });
