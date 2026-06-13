/* Okul ders programı — öğrenci doldurur, koç görüntüler. localStorage'da kalıcı. */

const SCHOOL_DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum"];
const SCHOOL_PERIODS = 8;
const SCHED_KEY = "uk_school_sched_v1";

let _sched = (() => { try { const s = localStorage.getItem(SCHED_KEY); if (s) return JSON.parse(s); } catch (e) {} return {
  "Elif Yıldız": { goes: true, grid: {
    "Pzt": ["Matematik", "Matematik", "Fizik", "Türkçe", "Kimya", "Beden", "", ""],
    "Sal": ["Türkçe", "Biyoloji", "Biyoloji", "Matematik", "Tarih", "Din", "", ""],
    "Çar": ["Fizik", "Fizik", "Matematik", "Kimya", "Türkçe", "İngilizce", "", ""],
    "Per": ["Kimya", "Matematik", "Türkçe", "Biyoloji", "Coğrafya", "Rehberlik", "", ""],
    "Cum": ["Matematik", "Türkçe", "Fizik", "Edebiyat", "Beden", "", "", ""],
  } },
}; })();

const _schListeners = new Set();
function persistSched() { try { localStorage.setItem(SCHED_KEY, JSON.stringify(_sched)); } catch (e) {} _schListeners.forEach((l) => l()); }
function getSched(student) {
  if (!_sched[student]) _sched[student] = { goes: false, grid: {} };
  return _sched[student];
}
function setSchedCell(student, day, period, value) {
  const cur = getSched(student);
  const grid = { ...cur.grid };
  grid[day] = (grid[day] || Array(SCHOOL_PERIODS).fill("")).slice();
  grid[day][period] = value;
  _sched = { ..._sched, [student]: { ...cur, grid } };
  persistSched();
}
function setSchedGoes(student, goes) { const cur = getSched(student); _sched = { ..._sched, [student]: { ...cur, goes } }; persistSched(); }
function useSched(student) {
  const [, force] = React.useState(0);
  React.useEffect(() => { const l = () => force((x) => x + 1); _schListeners.add(l); return () => _schListeners.delete(l); }, []);
  return getSched(student);
}

/* renk: ders adına göre */
function cellColor(v) {
  if (!v) return null;
  for (const k of Object.keys(SUBJECT_COLORS)) if (v.toLocaleLowerCase("tr-TR").includes(k.toLocaleLowerCase("tr-TR"))) return SUBJECT_COLORS[k];
  return "var(--muted)";
}

function SchoolScheduleEditor({ student }) {
  const sch = useSched(student);
  return (
    <Section
      title="Okul Ders Programım"
      sub="Okula gidiyorsan haftalık ders programını gir — koçun çalışma planını buna göre ayarlar"
      action={
        <button className={`switch${sch.goes ? " on" : ""}`} onClick={() => setSchedGoes(student, !sch.goes)} aria-label="Okula gidiyorum"><span /></button>
      }
    >
      <div className="card-body">
        {!sch.goes ? (
          <div style={{ padding: "20px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Okula gitmiyorum / tam zamanlı hazırlanıyorum. <span style={{ color: "var(--text-2)" }}>Açmak için sağdaki anahtarı kullan.</span></div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="sched-tbl">
              <thead><tr><th></th>{SCHOOL_DAYS.map((d) => <th key={d}>{d}</th>)}</tr></thead>
              <tbody>
                {Array.from({ length: SCHOOL_PERIODS }).map((_, p) => (
                  <tr key={p}>
                    <td className="sched-period">{p + 1}.</td>
                    {SCHOOL_DAYS.map((d) => {
                      const v = (sch.grid[d] || [])[p] || "";
                      const c = cellColor(v);
                      return (
                        <td key={d} className="sched-cell" style={c ? { borderLeft: `3px solid ${c}` } : null}>
                          <input value={v} onChange={(e) => setSchedCell(student, d, p, e.target.value)} placeholder="—" />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Section>
  );
}

function SchoolScheduleView({ student, bare }) {
  const sch = useSched(student);
  const inner = !sch.goes ? (
    <div style={{ padding: "20px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Öğrenci okula gitmiyor / tam zamanlı hazırlanıyor.</div>
  ) : (
    <div style={{ overflowX: "auto" }}>
      <table className="sched-tbl">
        <thead><tr><th></th>{SCHOOL_DAYS.map((d) => <th key={d}>{d}</th>)}</tr></thead>
        <tbody>
          {Array.from({ length: SCHOOL_PERIODS }).map((_, p) => (
            <tr key={p}>
              <td className="sched-period">{p + 1}.</td>
              {SCHOOL_DAYS.map((d) => {
                const v = (sch.grid[d] || [])[p] || "";
                const c = cellColor(v);
                return <td key={d} className="sched-cell view" style={c ? { borderLeft: `3px solid ${c}` } : null}><span>{v || "—"}</span></td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  if (bare) return inner;
  return (
    <Section title="Okul Ders Programı" sub={`${student} · haftalık`} action={sch.goes ? <Badge tone="info" icon="calendar">Okula gidiyor</Badge> : null}>
      <div className="card-body">{inner}</div>
    </Section>
  );
}

/* ---- Okul sınavları (yazılılar) — öğrenci ekler, koç görüntüler ---- */
const SCHOOL_EXAM_KEY = "uk_school_exams_v1";
let _schExams = (() => { try { const s = localStorage.getItem(SCHOOL_EXAM_KEY); if (s) return JSON.parse(s); } catch (e) {} return {
  "Elif Yıldız": [
    { id: "se1", name: "Türkçe 2. Yazılı", subject: "Türkçe", date: "2026-06-09" },
    { id: "se2", name: "Matematik 2. Yazılı", subject: "Matematik", date: "2026-06-12" },
    { id: "se3", name: "Fizik Yazılısı", subject: "Fizik", date: "2026-06-18" },
  ],
}; })();
const _seListeners = new Set();
function persistSchExams() { try { localStorage.setItem(SCHOOL_EXAM_KEY, JSON.stringify(_schExams)); } catch (e) {} _seListeners.forEach((l) => l()); }
function getSchoolExams(student) { return _schExams[student] || []; }
function addSchoolExam(student, data) { const e = { id: "se" + Date.now() + Math.floor(Math.random() * 99), name: (data.name || "Sınav").trim(), subject: data.subject || "", date: data.date }; _schExams = { ..._schExams, [student]: [...(_schExams[student] || []), e] }; persistSchExams(); return e; }
function removeSchoolExam(student, id) { _schExams = { ..._schExams, [student]: (_schExams[student] || []).filter((x) => x.id !== id) }; persistSchExams(); }
function useSchoolExams(student) { const [, f] = React.useState(0); React.useEffect(() => { const l = () => f((x) => x + 1); _seListeners.add(l); return () => _seListeners.delete(l); }, []); return _schExams[student] || []; }
const _SE_TODAY = new Date("2026-06-05");
function _seYmd(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }

function SchoolExams({ student, editable }) {
  const exams = useSchoolExams(student);
  const [view, setView] = React.useState("liste");
  const subs = (typeof getCurriculum === "function") ? Object.keys(getCurriculum((typeof studentSinav === "function") ? studentSinav() : "YKS")) : Object.keys(typeof SUBJECT_COLORS !== "undefined" ? SUBJECT_COLORS : {});
  const [name, setName] = React.useState("");
  const [subject, setSubject] = React.useState(subs[0] || "");
  const [date, setDate] = React.useState("");
  const sorted = exams.slice().sort((a, b) => a.date.localeCompare(b.date));
  const firstDate = sorted.length ? new Date(sorted[0].date + "T00:00:00") : _SE_TODAY;
  const [month, setMonth] = React.useState(() => new Date(firstDate.getFullYear(), firstDate.getMonth(), 1));
  const add = () => { if (!date) return; addSchoolExam(student, { name: name || (subject + " Sınavı"), subject, date }); setName(""); setDate(""); if (typeof toast === "function") toast("Okul sınavı eklendi", { icon: "calendar" }); };
  const fmt = (d) => new Date(d + "T00:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "short" });
  const byDate = {}; exams.forEach((e) => { (byDate[e.date] = byDate[e.date] || []).push(e); });
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const startDow = (first.getDay() + 6) % 7;
  const dim = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = []; for (let i = 0; i < startDow; i++) cells.push(null); for (let d = 1; d <= dim; d++) cells.push(new Date(month.getFullYear(), month.getMonth(), d)); while (cells.length % 7) cells.push(null);
  const DOW = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
  return (
    <Section title="Okul Sınavları" sub={editable ? "Okul yazılı/sınav tarihlerini ekle — koçun da görür" : `${student} · okul sınav takvimi`}
      action={<div className="seg" style={{ height: 32 }}><button className={view === "liste" ? "on" : ""} onClick={() => setView("liste")}><Icon name="clipboard" size={14} />Liste</button><button className={view === "takvim" ? "on" : ""} onClick={() => setView("takvim")}><Icon name="calendar" size={14} />Takvim</button></div>}>
      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {editable ? (
          <div className="row" style={{ gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div className="field" style={{ flex: "1 1 150px" }}><label className="label">Sınav adı</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Örn. Matematik 2. Yazılı" /></div>
            <div className="field" style={{ width: 150 }}><label className="label">Ders</label><select className="select" value={subject} onChange={(e) => setSubject(e.target.value)}>{subs.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
            <div className="field" style={{ width: 160 }}><label className="label">Tarih</label><input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
            <button className="btn btn-primary" onClick={add} disabled={!date}><Icon name="plus" size={16} />Ekle</button>
          </div>
        ) : null}
        {exams.length === 0 ? <div style={{ padding: "18px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Henüz okul sınavı eklenmedi.</div> : view === "takvim" ? (
          <div>
            <div className="between" style={{ marginBottom: 10 }}>
              <button className="icon-btn" style={{ width: 30, height: 30 }} aria-label="Önceki ay" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><Icon name="chevronRight" size={15} style={{ transform: "rotate(180deg)" }} /></button>
              <b style={{ fontSize: 13.5, textTransform: "capitalize" }}>{month.toLocaleDateString("tr-TR", { month: "long", year: "numeric" })}</b>
              <button className="icon-btn" style={{ width: 30, height: 30 }} aria-label="Sonraki ay" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><Icon name="chevronRight" size={15} /></button>
            </div>
            <div className="odev-cal-grid head">{DOW.map((d) => <div key={d} className="odev-cal-dow">{d}</div>)}</div>
            <div className="odev-cal-grid">
              {cells.map((d, i) => {
                if (!d) return <div key={i} className="odev-cal-cell empty" />;
                const k = _seYmd(d); const items = byDate[k] || []; const isToday = _seYmd(_SE_TODAY) === k;
                return (
                  <div key={i} className={"odev-cal-cell" + (isToday ? " today" : "") + (items.length ? " has" : "")} style={{ cursor: "default" }} title={items.map((e) => e.name).join(", ")}>
                    <span className="odev-cal-num">{d.getDate()}</span>
                    {items.length ? <span className="odev-cal-dots">{items.slice(0, 4).map((e, j) => <span key={j} className="odev-cal-dot" style={{ background: cellColor(e.subject) || "var(--danger)" }} />)}</span> : null}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="stack" style={{ gap: 8 }}>
            {sorted.map((e) => {
              const c = cellColor(e.subject) || "var(--danger)";
              const dl = Math.ceil((new Date(e.date + "T00:00:00") - _SE_TODAY) / 86400000);
              return (
                <div key={e.id} className="lrow" style={{ padding: "10px 12px" }}>
                  <span className="lr-icon" style={{ width: 36, height: 36, background: `color-mix(in srgb, ${c} 14%, transparent)`, color: c, flexShrink: 0 }}><Icon name="calendar" size={17} /></span>
                  <div style={{ flex: 1, minWidth: 0 }}><div className="lr-title">{e.name}</div><div className="lr-meta"><span className="chip" style={{ height: 21, fontSize: 10.5, padding: "0 8px" }}><span className="swatch" style={{ background: c }} />{e.subject}</span><span className="d">{fmt(e.date)}</span></div></div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}><div className="tnum" style={{ fontSize: 12.5, fontWeight: 700, color: dl < 0 ? "var(--muted)" : dl <= 3 ? "var(--danger)" : "var(--text)" }}>{dl < 0 ? `${-dl}g önce` : dl === 0 ? "Bugün" : `${dl} gün`}</div></div>
                  {editable ? <button className="icon-btn" style={{ width: 30, height: 30, flexShrink: 0 }} title="Sil" onClick={() => { removeSchoolExam(student, e.id); if (typeof toast === "function") toast("Sınav silindi", { icon: "alert" }); }}><Icon name="plus" size={14} style={{ transform: "rotate(45deg)" }} /></button> : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Section>
  );
}

Object.assign(window, { SchoolScheduleEditor, SchoolScheduleView, getSched, useSched, SchoolExams, getSchoolExams, addSchoolExam, removeSchoolExam, useSchoolExams });
