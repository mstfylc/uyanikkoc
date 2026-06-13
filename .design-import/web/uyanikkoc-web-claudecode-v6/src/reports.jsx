/* Veli gelişim raporları — koç onaylar & gönderir, veliye bildirim düşer,
   veli içeriği görüp takip eder. localStorage'da kalıcı. */

const REPORTS_KEY = "uk_reports_v1";
function reportsSeed() {
  const base = (typeof PARENT_REPORTS !== "undefined") ? PARENT_REPORTS : [];
  const seeded = base.map((r) => ({ ...r, sentAt: null, coachNote: "" }));
  // Demo: Elif'in velisi (Ayşe Yıldız) onaylanmış raporları görsün
  const elif = seeded.find((r) => r.student === "Elif Yıldız");
  if (elif) {
    elif.status = "approved";
    elif.sentAt = Date.now() - 2 * 86400000;
    elif.coachNote = "Bu hafta tempo çok iyiydi; matematik netleri yükselişte. Hafta sonu deneme analizine birlikte bakacağız.";
    seeded.unshift({ id: "r-elif-prev", student: "Elif Yıldız", parent: "Ayşe Yıldız", week: "19 – 25 May", completion: 81, net: "+8", status: "approved", sentAt: Date.now() - 9 * 86400000, coachNote: "Düzenli ilerleme. Paragrafta hız çalışmaları işe yaramaya başladı." });
  }
  return seeded;
}
let _reports = (() => { try { const s = localStorage.getItem(REPORTS_KEY); if (s) return JSON.parse(s); } catch (e) {} return reportsSeed(); })();
const _rpListeners = new Set();
function persistReports() { try { localStorage.setItem(REPORTS_KEY, JSON.stringify(_reports)); } catch (e) {} _rpListeners.forEach((l) => l()); }
function useReports() {
  const [, force] = React.useState(0);
  React.useEffect(() => { const l = () => force((x) => x + 1); _rpListeners.add(l); return () => _rpListeners.delete(l); }, []);
  return _reports;
}
function approveReport(id, note) {
  _reports = _reports.map((r) => r.id === id ? { ...r, status: "approved", sentAt: Date.now(), coachNote: note != null ? note : r.coachNote } : r);
  persistReports();
  const r = _reports.find((x) => x.id === id);
  if (r && typeof pushNotif === "function") pushNotif("parent", { icon: "trend", tone: "success", title: "Yeni gelişim raporu", desc: `${r.student} · ${r.week} · %${r.completion} tamamlama (${r.net} net)`, page: "p-reports" });
}
function approveAllReports(note) { _reports.forEach((r) => { if (r.status !== "approved") approveReport(r.id, note); }); }

/* rapor içeriğini deterministik üret */
function reportDetail(r) {
  const c = r.completion;
  const assignTotal = 12, assignDone = Math.round(assignTotal * c / 100);
  const hours = Math.round(c / 100 * 18 + 6);
  const subs = ["Matematik", "Fizik", "Kimya", "Türkçe"];
  const subjects = subs.map((n, i) => ({ n, pct: Math.max(35, Math.min(98, c - 12 + i * 7 + ((r.student.length * (i + 1)) % 14))) }));
  return { assignTotal, assignDone, hours, examCount: 2, subjects };
}

/* ---- içerik detay modalı (koç onay + veli görüntüleme) ---- */
function ReportDetailModal({ open, report, coach, onClose }) {
  const [note, setNote] = useState("");
  useEffect(() => { if (open && report) setNote(report.coachNote || ""); }, [open, report]);
  if (!open || !report) return null;
  const r = report; const d = reportDetail(r);
  const up = String(r.net).startsWith("+");
  const send = () => { approveReport(r.id, note.trim()); if (typeof toast === "function") toast(`${r.parent}'a rapor gönderildi · bildirim iletildi`, { icon: "send" }); onClose(); };
  return ReactDOM.createPortal((
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 560, height: "min(760px, calc(100vh - 40px))" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="row" style={{ gap: 11 }}><Avatar name={r.student} size={42} /><div><h3 style={{ fontSize: 16, fontWeight: 800 }}>{r.student} · Haftalık Rapor</h3><div className="muted" style={{ fontSize: 12 }}>{r.week} · Veli: {r.parent}</div></div></div>
          <button className="icon-btn" style={{ width: 36, height: 36 }} onClick={onClose} aria-label="Kapat"><Icon name="plus" size={18} style={{ transform: "rotate(45deg)" }} /></button>
        </div>
        <div className="modal-body" style={{ gap: 16 }}>
          <div className="grid g-4" style={{ gap: 10 }}>
            <div className="rep-stat"><span className="muted">Tamamlama</span><b className="tnum" style={{ color: r.completion >= 75 ? "var(--success)" : "var(--warning)" }}>{r.completion}%</b></div>
            <div className="rep-stat"><span className="muted">Net gelişimi</span><b className="tnum" style={{ color: up ? "var(--success)" : "var(--danger)" }}>{r.net}</b></div>
            <div className="rep-stat"><span className="muted">Çalışma</span><b className="tnum">{d.hours}s</b></div>
            <div className="rep-stat"><span className="muted">Ödev</span><b className="tnum">{d.assignDone}/{d.assignTotal}</b></div>
          </div>

          <div>
            <div className="label" style={{ marginBottom: 10 }}>Ders bazında ilerleme</div>
            <div className="subj">
              {d.subjects.map((s) => (
                <div className="subj-row" key={s.n}>
                  <div className="between" style={{ marginBottom: 7 }}><span className="sname"><span className="swatch" style={{ background: SUBJECT_COLORS[s.n] || "var(--primary)" }} />{s.n}</span><span className="tnum" style={{ fontSize: 12.5, fontWeight: 700 }}>{s.pct}%</span></div>
                  <Bar value={s.pct} color={SUBJECT_COLORS[s.n] || "var(--primary)"} thin />
                </div>
              ))}
            </div>
          </div>

          <div className="rep-summary">
            <Icon name="checkCircle" size={16} style={{ color: "var(--success)", flexShrink: 0 }} />
            <div><b style={{ fontSize: 13 }}>Bu hafta {d.examCount} deneme çözüldü.</b><div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>{r.student}, ödevlerinin %{r.completion}'ini tamamladı ve net gelişimi {r.net} oldu.</div></div>
          </div>

          {coach ? (
            <div className="field"><label className="label">Veliye not (opsiyonel)</label><textarea className="textarea" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Veliye iletmek istediğin kısa not..." /></div>
          ) : r.coachNote ? (
            <div className="rep-summary" style={{ background: "var(--primary-soft)" }}><Icon name="message" size={16} style={{ color: "var(--primary-600)", flexShrink: 0 }} /><div><b style={{ fontSize: 12, color: "var(--primary-600)" }}>Koçun notu</b><div style={{ fontSize: 12.5, marginTop: 2 }}>{r.coachNote}</div></div></div>
          ) : null}
        </div>
        <div className="modal-foot">
          {coach
            ? <><button className="btn btn-light" onClick={onClose}>Kapat</button><button className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={send}><Icon name={r.status === "approved" ? "check" : "send"} size={16} />{r.status === "approved" ? "Tekrar gönder" : "Onayla & Gönder"}</button></>
            : <button className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={() => { downloadText(`rapor-${r.student.replace(/\s/g, "-")}-${r.week}.txt`, [`UYANIK KOÇ — GELİŞİM RAPORU`, "", `Öğrenci: ${r.student}`, `Hafta: ${r.week}`, `Tamamlama: %${r.completion}`, `Net gelişimi: ${r.net}`, `Çalışma: ${d.hours} saat`, `Ödev: ${d.assignDone}/${d.assignTotal}`, r.coachNote ? `\nKoç notu: ${r.coachNote}` : ""].join("\n")); toast("Rapor indirildi", { icon: "download" }); }}><Icon name="download" size={16} />Raporu indir</button>}
        </div>
      </div>
    </div>
  ), document.body);
}

/* ---- Veli: Gelişim Raporları ---- */
function ParentReportsPage() {
  const me = (typeof loadAuth === "function" && loadAuth()?.name) || "Ayşe Yıldız";
  const reports = useReports().filter((r) => r.parent === me && r.status === "approved");
  const [detail, setDetail] = useState(null);
  return (
    <div className="stack rise">
      <PageHead title="Gelişim Raporları" sub="Koçun gönderdiği haftalık raporları görüntüle ve indir" />
      {reports.length === 0 ? (
        <div className="card"><div className="card-pad" style={{ padding: "56px 24px", textAlign: "center", color: "var(--muted)", fontSize: 13.5 }}>Henüz rapor gönderilmedi. Koçun haftalık raporu onayladığında burada görünecek.</div></div>
      ) : (
        <Section title="Haftalık Raporlar" sub={`${reports.length} rapor`}>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {reports.map((r) => {
              const up = String(r.net).startsWith("+");
              return (
                <button key={r.id} className="lrow" style={{ textAlign: "left", cursor: "pointer" }} onClick={() => setDetail(r)}>
                  <span className="lr-icon" style={{ background: "var(--success-soft)", color: "var(--success)", flexShrink: 0 }}><Icon name="trend" size={19} /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="lr-title">{r.student} · {r.week}</div>
                    <div className="lr-meta"><span className="badge badge-muted" style={{ height: 19 }}>%{r.completion} tamamlama</span><span className={`delta ${up ? "up" : "down"}`} style={{ fontSize: 11 }}><Icon name={up ? "arrowUp" : "arrowDown"} size={11} />{r.net} net</span>{r.sentAt ? <span className="d">{new Date(r.sentAt).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}</span> : null}</div>
                  </div>
                  <Icon name="chevronRight" size={17} style={{ color: "var(--faint)" }} />
                </button>
              );
            })}
          </div>
        </Section>
      )}
      <ReportDetailModal open={!!detail} report={detail} onClose={() => setDetail(null)} />
    </div>
  );
}

Object.assign(window, { useReports, approveReport, approveAllReports, reportDetail, ReportDetailModal, ParentReportsPage });
