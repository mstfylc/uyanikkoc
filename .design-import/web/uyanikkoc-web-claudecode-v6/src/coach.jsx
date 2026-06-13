/* Koç (Coach) Dashboard */

function RiskDot({ risk }) {
  const r = RISK[risk];
  return <Badge tone={r.tone} dot>{r.label}</Badge>;
}

function MiniSpark({ data, dir }) {
  const color = dir === "down" ? "var(--danger)" : dir === "flat" ? "var(--muted)" : "var(--success)";
  return <div style={{ width: 72, height: 30 }}><Sparkline data={data} w={72} h={30} color={color} fill={false} /></div>;
}

function StudentsTable() {
  const roster = useRoster();
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState({ key: null, dir: "desc" });
  const base = roster.filter((s) => filter === "risk" ? (s.risk === "attention" || s.risk === "critical") : true);
  const RISK_ORDER = { critical: 0, attention: 1, ok: 2, good: 3, excellent: 4 };
  const sortVal = (s, key) => key === "completion" ? s.completion : key === "net" ? (s.trend[s.trend.length - 1] - s.trend[0]) : key === "risk" ? (RISK_ORDER[s.risk] ?? 9) : 0;
  const rows = sort.key ? [...base].sort((a, b) => { const d = sortVal(a, sort.key) - sortVal(b, sort.key); return sort.dir === "asc" ? d : -d; }) : base;
  const toggleSort = (key) => setSort((p) => p.key === key ? (p.dir === "desc" ? { key, dir: "asc" } : { key: null, dir: "desc" }) : { key, dir: "desc" });
  const Th = ({ k, children, align }) => (
    <th style={{ textAlign: align || "left", cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }} onClick={() => toggleSort(k)} title="Sırala">
      <span className="row" style={{ gap: 5, display: "inline-flex", alignItems: "center", justifyContent: align === "right" ? "flex-end" : "flex-start", color: sort.key === k ? "var(--primary-600)" : undefined }}>
        {children}<Icon name={sort.key === k ? (sort.dir === "asc" ? "arrowUp" : "arrowDown") : "chevronDown"} size={13} style={{ opacity: sort.key === k ? 1 : 0.35 }} />
      </span>
    </th>
  );
  return (
    <Section
      title="Öğrencilerim"
      sub={`${roster.length} aktif öğrenci`}
      action={
        <div className="filters">
          <button className={filter === "all" ? "on" : ""} onClick={() => setFilter("all")}>Tümü</button>
          <button className={filter === "risk" ? "on" : ""} onClick={() => setFilter("risk")}>Risk altında</button>
        </div>
      }
    >
      <div className="card-body" style={{ padding: 0 }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Öğrenci</th>
              <Th k="completion">Tamamlama</Th>
              <Th k="net">Net Trendi</Th>
              <Th k="risk">Durum</Th>
              <th style={{ textAlign: "right" }}>Son Aktivite</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => {
              const dir = s.trend[s.trend.length - 1] >= s.trend[0] ? (s.trend[s.trend.length-1] > s.trend[0] ? "up" : "flat") : "down";
              const cColor = s.completion >= 75 ? "var(--success)" : s.completion >= 50 ? "var(--warning)" : "var(--danger)";
              return (
                <tr key={s.id} style={{ cursor: "pointer" }} onClick={() => { window.__ukCoachStudent = s.id; window.dispatchEvent(new CustomEvent("uk-nav", { detail: { page: "c-topics" } })); }} title={`${s.name} — detay`}>
                  <td>
                    <div className="name">
                      <Avatar name={s.name} size={36} />
                      <div>
                        <b>{s.name}</b><br /><span>{s.grade}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ width: 132 }}>
                      <div className="between" style={{ marginBottom: 6 }}>
                        <span className="tnum" style={{ fontSize: 12.5, fontWeight: 700 }}>{s.completion}%</span>
                      </div>
                      <Bar value={s.completion} color={cColor} thin />
                    </div>
                  </td>
                  <td>
                    <div className="row" style={{ gap: 10 }}>
                      <MiniSpark data={s.trend} dir={dir} />
                      <span className="tnum" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-2)" }}>{s.net}</span>
                    </div>
                  </td>
                  <td><RiskDot risk={s.risk} /></td>
                  <td style={{ textAlign: "right" }}>
                    <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>{s.last}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

function CoachTasks() {
  const roster = (typeof useRoster === "function") ? useRoster() : [];
  const first = roster[0];
  const [ata, setAta] = useState(false);
  return (
    <Section title="Aksiyon Gerektirenler" sub="Önceliklendirilmiş" action={<Badge tone="danger">{COACH_TASKS.length}</Badge>}>
      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {COACH_TASKS.map((t) => (
          <div className="lrow" key={t.id} style={{ cursor: "pointer" }} onClick={() => window.dispatchEvent(new CustomEvent("uk-nav", { detail: { page: "students" } }))}>
            <span className="lr-icon" style={{ background: `var(--${t.tone}-soft)`, color: `var(--${t.tone})` }}>
              <Icon name={t.icon} size={18} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="lr-title" style={{ fontSize: 13, whiteSpace: "normal" }}>{t.title}</div>
              <div style={{ marginTop: 5 }}><Badge tone={t.tone}>{t.tag}</Badge></div>
            </div>
            <Icon name="chevronRight" size={17} style={{ color: "var(--faint)" }} />
          </div>
        ))}
        <button className="btn btn-primary" style={{ width: "100%", marginTop: 2 }} onClick={() => setAta(true)}><Icon name="plus" size={16} />Yeni ödev ata</button>
      </div>
      {first ? <OdevAtaModal open={ata} onClose={() => setAta(false)} studentName={first.name} examType={first.sinav || "YKS"} onAssign={() => { if (typeof toast === "function") toast("Ödev atandı"); }} /> : null}
    </Section>
  );
}

function WeeklyCompletion() {
  const avg = Math.round(COACH_WEEK_COMPLETION.reduce((s, d) => s + d.v, 0) / COACH_WEEK_COMPLETION.length);
  const peak = COACH_WEEK_COMPLETION.reduce((m, d, i, a) => d.v > a[m].v ? i : m, 0);
  return (
    <Section
      title="Haftalık Sınıf Tamamlaması"
      sub="Tüm öğrencilerin günlük ortalaması"
      action={<div className="row" style={{ gap: 8 }}><span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>Ortalama</span><span className="badge badge-primary" style={{ height: 24 }}>{avg}%</span></div>}
    >
      <div className="card-body">
        <BarChart data={COACH_WEEK_COMPLETION} max={100} peakIdx={peak} />
        <hr className="hr" style={{ margin: "18px 0 16px" }} />
        <div className="grid g-4" style={{ gap: 12 }}>
          {Object.entries(RISK).map(([k, r]) => {
            const n = COACH_STUDENTS.filter((s) => s.risk === k).length;
            return (
              <div key={k} style={{ background: "var(--surface-3)", borderRadius: 12, padding: "12px 14px" }}>
                <div className="row" style={{ gap: 7 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 3, background: `var(--${r.tone})` }} />
                  <span style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600 }}>{r.label}</span>
                </div>
                <div className="tnum" style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{n}</div>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

function ActivityFeed() {
  return (
    <Section title="Son Aktivite" action={<button className="link-btn" onClick={() => window.dispatchEvent(new CustomEvent("uk-nav", { detail: { page: "students" } }))}>Tümü<Icon name="chevronRight" /></button>}>
      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {COACH_ACTIVITY.map((a, i) => (
          <div key={i} className="row" style={{ gap: 13, padding: "11px 4px", borderBottom: i < COACH_ACTIVITY.length - 1 ? "1px solid var(--border)" : "none", alignItems: "flex-start" }}>
            <span className="lr-icon" style={{ width: 36, height: 36, background: `var(--${a.tone})`, color: "#fff", flexShrink: 0 }}>
              <Icon name={a.icon} size={17} stroke={2.3} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, lineHeight: 1.4 }}><b style={{ fontWeight: 700 }}>{a.who}</b> <span style={{ color: "var(--text-2)" }}>{a.what}</span></div>
              <div style={{ fontSize: 11.5, color: "var(--faint)", marginTop: 2 }}>{a.when} önce</div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function CoachTriage() {
  const roster = (typeof useRoster === "function") ? useRoster() : [];
  const reports = (typeof useReports === "function") ? useReports() : [];
  const appts = (typeof useAppts === "function") ? useAppts() : [];
  const risk = roster.filter((s) => s.risk === "attention" || s.risk === "critical");
  const review = ((typeof COACH_ASSIGNMENTS !== "undefined") ? COACH_ASSIGNMENTS : []).filter((a) => a.status === "submitted" || a.status === "overdue");
  const pendingReports = reports.filter((r) => r.status === "pending");
  const pendingAppts = appts.filter((a) => a.status === "pending");
  const nav = (page) => window.dispatchEvent(new CustomEvent("uk-nav", { detail: { page } }));
  const approve = (id) => { if (typeof approveReport === "function") approveReport(id); if (typeof toast === "function") toast("Rapor onaylandı ve veliye gönderildi", { icon: "send" }); };
  const approveAll = () => { if (typeof approveAllReports === "function") approveAllReports(); if (typeof toast === "function") toast("Tüm raporlar velilere gönderildi", { icon: "send" }); };

  return (
    <div className="grid triage-grid">
      {/* 1 — Risk altındaki öğrenciler */}
      <div className="card triage-card">
        <div className="triage-head">
          <span className="ic" style={{ background: "var(--danger-soft)", color: "var(--danger)" }}><Icon name="alert" size={18} /></span>
          <div className="tx"><b>Risk altındaki öğrenciler</b><span>acil ilgi gerekiyor</span></div>
          <span className="badge badge-danger">{risk.length}</span>
        </div>
        <div className="triage-body">
          {risk.length === 0 ? <div className="triage-empty">Risk altında öğrenci yok 🎉</div>
            : risk.slice(0, 4).map((s) => (
              <button key={s.id || s.name} className="triage-row" onClick={() => nav("students")}>
                <Avatar name={s.name} size={30} />
                <div className="info"><b>{s.name}</b><span>%{s.completion} tamamlama</span></div>
                <RiskDot risk={s.risk} />
              </button>
            ))}
        </div>
        {risk.length > 0 ? <button className="triage-foot" onClick={() => nav("students")}>Tüm öğrenciler<Icon name="chevronRight" size={15} /></button> : null}
      </div>

      {/* 2 — Bugün incelenecek ödevler */}
      <div className="card triage-card">
        <div className="triage-head">
          <span className="ic" style={{ background: "var(--info-soft)", color: "var(--info)" }}><Icon name="clipboard" size={18} /></span>
          <div className="tx"><b>İncelenecek ödevler</b><span>teslim edildi, sonuç bekliyor</span></div>
          <span className="badge badge-info">{review.length}</span>
        </div>
        <div className="triage-body">
          {review.length === 0 ? <div className="triage-empty">İncelenecek ödev yok 🎉</div>
            : review.slice(0, 4).map((a) => {
              const c = (typeof SUBJECT_COLORS !== "undefined" && SUBJECT_COLORS[a.subject]) || "var(--primary)";
              return (
                <button key={a.id} className="triage-row" onClick={() => nav("c-assignments")}>
                  <span className="dot" style={{ background: c }} />
                  <div className="info"><b>{a.title}</b><span>{a.student} · {a.subject}</span></div>
                  <Icon name="chevronRight" size={16} style={{ color: "var(--faint)" }} />
                </button>
              );
            })}
        </div>
        {review.length > 0 ? <button className="triage-foot" onClick={() => nav("c-assignments")}>Ödev &amp; Görev<Icon name="chevronRight" size={15} /></button> : null}
      </div>

      {/* 3 — Veli / rapor onayları */}
      <div className="card triage-card">
        <div className="triage-head">
          <span className="ic" style={{ background: "var(--warning-soft)", color: "var(--warning)" }}><Icon name="check" size={18} /></span>
          <div className="tx"><b>Onay bekleyenler</b><span>veli raporları &amp; randevular</span></div>
          <span className="badge badge-warning">{pendingReports.length + pendingAppts.length}</span>
        </div>
        <div className="triage-body">
          {pendingReports.length === 0 && pendingAppts.length === 0 ? <div className="triage-empty">Onay bekleyen yok 🎉</div> : null}
          {pendingReports.slice(0, 3).map((r) => (
            <div key={r.id} className="triage-row">
              <span className="ic2" style={{ background: "var(--surface-3)", color: "var(--text-2)" }}><Icon name="trend" size={15} /></span>
              <div className="info"><b>{r.student} raporu</b><span>{r.parent} · %{r.completion} · net {r.net}</span></div>
              <button className="btn btn-primary btn-sm" style={{ height: 28 }} onClick={() => approve(r.id)}><Icon name="check" size={13} />Onayla</button>
            </div>
          ))}
          {pendingAppts.length > 0 ? (
            <button className="triage-row" onClick={() => nav("appointments")}>
              <span className="ic2" style={{ background: "var(--surface-3)", color: "var(--text-2)" }}><Icon name="calendar" size={15} /></span>
              <div className="info"><b>{pendingAppts.length} randevu isteği</b><span>onay bekliyor</span></div>
              <Icon name="chevronRight" size={16} style={{ color: "var(--faint)" }} />
            </button>
          ) : null}
        </div>
        {pendingReports.length > 0 ? <button className="triage-foot accent" onClick={approveAll}><Icon name="send" size={14} />Tüm raporları onayla</button> : null}
      </div>
    </div>
  );
}

function CoachDashboard() {
  return (
    <div className="stack rise">
      <div className="grid g-4">
        <StatCard icon="users" tone="primary" value={COACH.students} label="Toplam öğrenci" delta="+2 bu ay" deltaDir="up" />
        <StatCard icon="target" tone="success" value={`${COACH.avgCompletion}%`} label="Ortalama tamamlama" delta="+5%" deltaDir="up" />
        <StatCard icon="alert" tone="danger" value={COACH.atRisk} label="Risk altındaki öğrenci" delta="+1" deltaDir="down" />
        <StatCard icon="clipboard" tone="warning" value={COACH.pendingReview} label="Bekleyen inceleme" delta="3 bugün" deltaDir="flat" />
      </div>

      <div className="grid col-main">
        <StudentsTable />
        <CoachTasks />
      </div>

      <div className="grid col-main">
        <WeeklyCompletion />
        <ActivityFeed />
      </div>
    </div>
  );
}

window.CoachDashboard = CoachDashboard;
window.StudentsTable = StudentsTable;

/* Koç: Öğrenci Ekle modalı */
function AddStudentModal({ open, onClose, onAdded }) {
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("11");
  const [alan, setAlan] = useState("Sayısal");
  const [sube, setSube] = useState("");
  const [numara, setNumara] = useState("");
  const [hedef, setHedef] = useState("");
  useEffect(() => { if (open) { setName(""); setGrade("11"); setAlan("Sayısal"); setSube(""); setNumara(""); setHedef(""); } }, [open]);
  if (!open) return null;
  const valid = name.trim().length >= 3;
  const submit = () => {
    if (!valid) return;
    addStudent({ name: name.trim(), grade: `${grade} · ${alan}`, sube: sube.trim(), numara: numara.trim(), hedef: hedef.trim() });
    onAdded && onAdded();
    onClose();
  };
  return ReactDOM.createPortal((
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="row" style={{ gap: 9 }}>
            <span className="stat-icon tone-primary" style={{ width: 36, height: 36 }}><Icon name="users" size={18} /></span>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800 }}>Öğrenci Ekle</h3>
              <div className="muted" style={{ fontSize: 12.5 }}>Listene yeni öğrenci ekle</div>
            </div>
          </div>
          <button className="icon-btn" style={{ width: 36, height: 36 }} onClick={onClose} aria-label="Kapat"><Icon name="plus" size={18} style={{ transform: "rotate(45deg)" }} /></button>
        </div>
        <div className="modal-body" style={{ gap: 14 }}>
          <div className="field">
            <label className="label">Ad Soyad</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="ör. Ayşe Demir" autoFocus />
          </div>
          <div className="grid g-2" style={{ gap: 12 }}>
            <div className="field">
              <label className="label">Sınıf</label>
              <select className="select" value={grade} onChange={(e) => setGrade(e.target.value)}>
                {["9", "10", "11", "12", "Mezun"].map((g) => <option key={g} value={g}>{g}{g !== "Mezun" ? ". Sınıf" : ""}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="label">Alan</label>
              <select className="select" value={alan} onChange={(e) => setAlan(e.target.value)}>
                {["Sayısal", "Eşit Ağırlık", "Sözel", "Dil"].map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
          <div className="grid g-2" style={{ gap: 12 }}>
            <div className="field">
              <label className="label">Şube <span className="muted" style={{ fontWeight: 500 }}>(ops.)</span></label>
              <input className="input" value={sube} onChange={(e) => setSube(e.target.value)} placeholder="ör. 11-SAY" />
            </div>
            <div className="field">
              <label className="label">Okul No <span className="muted" style={{ fontWeight: 500 }}>(ops.)</span></label>
              <input className="input" value={numara} onChange={(e) => setNumara(e.target.value)} placeholder="ör. 1024" inputMode="numeric" />
            </div>
          </div>
          <div className="field">
            <label className="label">Hedef <span className="muted" style={{ fontWeight: 500 }}>(ops.)</span></label>
            <input className="input" value={hedef} onChange={(e) => setHedef(e.target.value)} placeholder="ör. Tıp · YKS 2026" />
          </div>
        </div>
        <div className="modal-foot" style={{ justifyContent: "flex-end" }}>
          <button className="btn btn-ghost" onClick={onClose}>Vazgeç</button>
          <button className="btn btn-primary" disabled={!valid} onClick={submit} style={{ opacity: valid ? 1 : 0.5 }}><Icon name="plus" size={16} />Öğrenci Ekle</button>
        </div>
      </div>
    </div>
  ), document.body);
}

/* Koç: Öğrencilerim sayfası */
function CoachStudentsPage() {
  const roster = useRoster();
  const [adding, setAdding] = useState(false);
  const [motiv, setMotiv] = useState(false);
  const [toast, setToast] = useState(false);
  const atRisk = roster.filter((s) => s.risk === "attention" || s.risk === "critical").length;
  const avg = roster.length ? Math.round(roster.reduce((s, x) => s + x.completion, 0) / roster.length) : 0;
  return (
    <div className="stack rise">
      <PageHead title="Öğrencilerim" sub="Takip ettiğin tüm öğrenciler" actions={
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-light btn-sm" onClick={() => setMotiv(true)}><Icon name="heart" size={15} />Motivasyon Gönder</button>
          <button className="btn btn-primary btn-sm" onClick={() => setAdding(true)}><Icon name="plus" size={16} />Öğrenci ekle</button>
        </div>
      } />
      <div className="grid g-4">
        <StatCard icon="users" tone="primary" value={roster.length} label="Aktif öğrenci" />
        <StatCard icon="target" tone="success" value={`${avg}%`} label="Ortalama tamamlama" />
        <StatCard icon="alert" tone="danger" value={atRisk} label="Risk altında" />
        <StatCard icon="star" tone="warning" value={roster.filter((s) => s.risk === "excellent").length} label="Mükemmel" />
      </div>
      <StudentsTable />
      <AddStudentModal open={adding} onClose={() => setAdding(false)} onAdded={() => { setToast(true); setTimeout(() => setToast(false), 2600); }} />
      <MotivationSendModal open={motiv} onClose={() => setMotiv(false)} />
      {toast ? ReactDOM.createPortal((
        <div className="toast">
          <span className="lr-icon" style={{ width: 34, height: 34, background: "var(--success-soft)", color: "var(--success)" }}><Icon name="checkCircle" size={18} /></span>
          <div><b style={{ fontSize: 13.5, fontWeight: 700 }}>Öğrenci eklendi</b><div className="muted" style={{ fontSize: 12 }}>Listene başarıyla eklendi</div></div>
        </div>
      ), document.body) : null}
    </div>
  );
}
window.CoachStudentsPage = CoachStudentsPage;
window.AddStudentModal = AddStudentModal;
