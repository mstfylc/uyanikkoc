/* Öğrenci (Student) Dashboard */

function PriorityGlass() {
  const top = STUDENT_ASSIGNMENTS.find((a) => a.overdue) || STUDENT_ASSIGNMENTS.find((a) => !a.done);
  return (
    <div className="glass" style={{ padding: 16, display: "flex", alignItems: "center", gap: 14, minWidth: 290 }}>
      <span style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,.16)", display: "grid", placeItems: "center", flexShrink: 0 }}>
        <Icon name="target" size={22} />
      </span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "rgba(255,255,255,.7)" }}>Bugünün önceliği</div>
        <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{top.title}</div>
        <div style={{ fontSize: 11.5, color: "rgba(255,255,255,.72)", marginTop: 2 }}>{top.subject} · Son tarih {top.due}</div>
      </div>
      <button className="btn btn-sm btn-white" onClick={() => window.dispatchEvent(new CustomEvent("uk-nav", { detail: { page: "assignments" } }))}>Başla<Icon name="chevronRight" size={15} /></button>
    </div>
  );
}

function StreakCard() {
  const days = ["P", "S", "Ç", "P", "C", "C", "P"];
  const state = ["on", "on", "on", "on", "on", "today", ""];
  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div className="card-pad" style={{ display: "flex", flexDirection: "column", gap: 18, flex: 1 }}>
        <div className="between">
          <div className="row" style={{ gap: 8 }}>
            <span className="stat-icon tone-warning" style={{ width: 38, height: 38 }}><Icon name="flame" size={20} fill /></span>
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>Çalışma Serisi</div>
          </div>
          <Badge tone="warning" icon="bolt">Aktif</Badge>
        </div>
        <div className="row" style={{ alignItems: "flex-end", gap: 12 }}>
          <div className="streak-num tnum" style={{ color: "var(--warning)" }}>{STUDENT.streak}</div>
          <div style={{ paddingBottom: 6 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>gün üst üste</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Rekorun: 21 gün</div>
          </div>
        </div>
        <div className="dots">
          {days.map((d, i) => (
            <i key={i} className={state[i]}>{d}</i>
          ))}
        </div>
        <div className="mt-auto" style={{ fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.5, background: "var(--surface-3)", padding: "11px 13px", borderRadius: 11 }}>
          <b style={{ color: "var(--warning)" }}>Harika gidiyorsun!</b> Bugünü de tamamlarsan rekorun 13 güne çıkacak. 💪
        </div>
      </div>
    </div>
  );
}

function AiBand() {
  return (
    <div className="ai-band rise">
      <span className="ai-orb"><Icon name="ai" size={24} fill /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="row" style={{ gap: 8 }}>
          <b style={{ fontSize: 14 }}>AI Koç</b>
          <Badge tone="primary" dot>Yakında</Badge>
        </div>
        <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>
          Kişisel yapay zekâ koçun; zayıf konularını analiz edip sana özel program çıkaracak.
        </div>
      </div>
      <button className="btn btn-sm btn-light" onClick={() => window.dispatchEvent(new CustomEvent("uk-nav", { detail: { page: "ai-coach" } }))}>Detay</button>
    </div>
  );
}

function AssignmentRow({ a, onToggle }) {
  const t = TYPE[a.type];
  const p = PRIORITY[a.priority];
  const color = SUBJECT_COLORS[a.subject];
  return (
    <div className={`lrow${a.done ? " done" : ""}`}>
      <button className={`chk${a.done ? " done" : ""}`} onClick={() => onToggle(a.id)} aria-label="Tamamla">
        <Icon name="check" size={14} stroke={3} />
      </button>
      <span className="lr-icon" style={{ background: `color-mix(in srgb, ${color} 13%, transparent)`, color }}>
        <Icon name={t.icon} size={19} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="lr-title">{a.title}</div>
        <div className="lr-meta">
          <span className="chip" style={{ height: 22, fontSize: 11, padding: "0 8px" }}>
            <span className="swatch" style={{ background: color }} />{a.subject}
          </span>
          <span className="d">{t.label}</span>
          <span className="d row" style={{ gap: 4 }}>
            <Icon name="clock" size={13} style={{ color: a.overdue ? "var(--danger)" : "var(--faint)" }} />
            <span style={{ color: a.overdue ? "var(--danger)" : "var(--muted)", fontWeight: a.overdue ? 700 : 500 }}>{a.due}</span>
          </span>
        </div>
      </div>
      {a.done
        ? <Badge tone="success" icon="check">Bitti</Badge>
        : <Badge tone={p.tone}>{p.label}</Badge>}
    </div>
  );
}

function Assignments() {
  const [list, setList] = useState(STUDENT_ASSIGNMENTS);
  const [filter, setFilter] = useState("pending");
  const toggle = (id) => setList((l) => l.map((a) => a.id === id ? { ...a, done: !a.done, overdue: false } : a));
  const shown = list.filter((a) => filter === "all" ? true : filter === "done" ? a.done : !a.done);
  const pending = list.filter((a) => !a.done).length;
  return (
    <Section
      title="Ödevlerim"
      sub={`${pending} bekleyen görev`}
      action={
        <div className="filters">
          <button className={filter === "pending" ? "on" : ""} onClick={() => setFilter("pending")}>Bekleyen</button>
          <button className={filter === "done" ? "on" : ""} onClick={() => setFilter("done")}>Bitti</button>
          <button className={filter === "all" ? "on" : ""} onClick={() => setFilter("all")}>Tümü</button>
        </div>
      }
    >
      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {shown.length === 0
          ? <div style={{ padding: "26px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Bu görünümde görev yok 🎉</div>
          : shown.map((a) => <AssignmentRow key={a.id} a={a} onToggle={toggle} />)}
      </div>
    </Section>
  );
}

function SubjectProgress() {
  return (
    <Section title="Ders İlerlemesi" sub="Konu tamamlama oranların" action={<button className="link-btn" onClick={() => window.dispatchEvent(new CustomEvent("uk-nav", { detail: { page: "topics" } }))}>Detay<Icon name="chevronRight" /></button>}>
      <div className="card-body subj">
        {STUDENT_SUBJECTS.map((s) => {
          const c = SUBJECT_COLORS[s.name];
          return (
            <div className="subj-row" key={s.name}>
              <div className="between">
                <span className="sname"><span className="swatch" style={{ background: c }} />{s.name}</span>
                <span className="row" style={{ gap: 8 }}>
                  <span className="badge badge-muted" style={{ height: 20, fontSize: 10.5 }}>{s.net} net</span>
                  <span className="spct tnum">{s.pct}%</span>
                </span>
              </div>
              <Bar value={s.pct} color={c} />
            </div>
          );
        })}
      </div>
    </Section>
  );
}

function ExamPerformance() {
  const last = STUDENT_NET_TREND[STUDENT_NET_TREND.length - 1];
  const prev = STUDENT_NET_TREND[STUDENT_NET_TREND.length - 2];
  const diff = last - prev;
  return (
    <Section
      title="Deneme Performansı"
      sub="Son 6 TYT denemesi"
      action={<Badge tone="success" icon="trend">Net +{last - STUDENT_NET_TREND[0]}</Badge>}
    >
      <div className="card-body">
        <div className="between" style={{ marginBottom: 6 }}>
          <div>
            <div className="row" style={{ gap: 8, alignItems: "baseline" }}>
              <span className="tnum" style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-.02em" }}>{last}</span>
              <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>net</span>
              <Delta dir="up">+{diff}</Delta>
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>6. denemen · 120 soruda</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>Sıralama tahmini</div>
            <div className="tnum" style={{ fontSize: 18, fontWeight: 800, color: "var(--primary)" }}>~48.000</div>
          </div>
        </div>
        <Sparkline data={STUDENT_NET_TREND} color="var(--primary)" h={68} />
        <hr className="hr" style={{ margin: "16px 0" }} />
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", marginBottom: 4 }}>Deneme başarı yüzdesi</div>
        <BarChart data={STUDENT_EXAMS} max={100} peakIdx={5} />
      </div>
    </Section>
  );
}

function UpcomingExams() {
  const [kayit, setKayit] = useState(false);
  return (
    <Section title="Yaklaşan Denemeler" action={<button className="link-btn" onClick={() => window.dispatchEvent(new CustomEvent("uk-nav", { detail: { page: "exams" } }))}>Takvim<Icon name="chevronRight" /></button>}>
      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {STUDENT_EXAMS_UP.map((e, i) => (
          <div className="lrow" key={i} style={{ cursor: "pointer" }} onClick={() => setKayit(true)}>
            <span className="lr-icon" style={{ flexDirection: "column", gap: 0, background: "var(--surface-3)" }}>
              <Icon name="calendar" size={18} style={{ color: `var(--${e.tone})` }} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="lr-title">{e.name}</div>
              <div className="lr-meta">{e.org}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12.5, fontWeight: 700 }}>{e.date}</div>
              <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{e.time}</div>
            </div>
          </div>
        ))}
        <button className="btn btn-light" style={{ width: "100%" }} onClick={() => setKayit(true)}><Icon name="plus" size={16} />Denemeye kayıt ol</button>
      </div>
      {typeof DenemeKayitModal === "function" ? <DenemeKayitModal open={kayit} onClose={() => setKayit(false)} /> : null}
    </Section>
  );
}

function StudentDashboard() {
  const done = STUDENT_ASSIGNMENTS.filter((a) => a.done).length;
  const total = STUDENT_ASSIGNMENTS.length;
  const pending = total - done;
  const rate = Math.round((done / total) * 100);
  return (
    <div className="stack rise">
      <div className="grid col-main">
        <div className="hero">
          <div className="between" style={{ alignItems: "flex-start", marginBottom: 20, gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.78)", fontWeight: 600, marginBottom: 6 }}>Günaydın 👋</div>
              <h2 style={{ marginBottom: 7 }}>{STUDENT.name.split(" ")[0]}, bugün 4 görevin var</h2>
              <p>Hedef <b style={{ color: "#fff" }}>{STUDENT.goal}</b> · Koçun {STUDENT.coach}</p>
            </div>
            <span className="badge" style={{ background: "rgba(255,255,255,.16)", color: "#fff", height: 26 }}>
              <Icon name="cap" size={14} />{STUDENT.grade}
            </span>
          </div>
          <PriorityGlass />
        </div>
        <StreakCard />
      </div>

      <div className="grid g-4">
        <StatCard icon="clock" tone="primary" value={`${STUDENT.weekHours}s`} label="Bu hafta çalışma" delta={STUDENT.weekHoursDelta} deltaDir="up" />
        <StatCard icon="checkCircle" tone="success" value={done} label="Tamamlanan ödev" delta="+2" deltaDir="up" />
        <StatCard icon="clipboard" tone="warning" value={pending} label="Bekleyen görev" delta="1 gecikmiş" deltaDir="down" />
        <StatCard icon="target" tone="info" value={`${rate}%`} label="Haftalık tamamlama" delta="+8%" deltaDir="up" />
      </div>

      <div className="grid col-main">
        <Assignments />
        <SubjectProgress />
      </div>

      {typeof TakvimimCard === "function" ? <TakvimimCard /> : null}

      <div className="grid col-main">
        <ExamPerformance />
        <UpcomingExams />
      </div>

      <AiBand />
    </div>
  );
}

window.StudentDashboard = StudentDashboard;
window.Assignments = Assignments;
window.AssignmentRow = AssignmentRow;
window.StreakCard = StreakCard;
