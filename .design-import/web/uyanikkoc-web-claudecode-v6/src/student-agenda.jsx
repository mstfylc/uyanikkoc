/* Takvimim — öğrenci dashboard ajandası. Randevu + deneme + ödev + Sıfır Hata tekrarlarını
   tek akışta birleştirir. Ajanda / Hafta / Ay görünümleri. Tüm kaynaklar gerçek store'lardan. */

const AG_DOW = { "Pzt": 1, "Sal": 2, "Çar": 3, "Per": 4, "Cum": 5, "Cmt": 6, "Paz": 0 };
const AG_MON = { "Oca": 0, "Şub": 1, "Mar": 2, "Nis": 3, "May": 4, "Haz": 5, "Tem": 6, "Ağu": 7, "Eyl": 8, "Eki": 9, "Kas": 10, "Ara": 11 };
const AG_DOW_SHORT = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
const AG_WD = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const AG_MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const AG_KINDS = {
  odev:    { label: "Ödev",    icon: "clipboard", tone: "primary" },
  deneme:  { label: "Deneme",  icon: "chart",     tone: "info" },
  randevu: { label: "Randevu", icon: "calendar",  tone: "success" },
  tekrar:  { label: "Tekrar",  icon: "ai",        tone: "warning" },
};

function _agStrip(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function _agAddDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function _agSameDay(a, b) { return _agStrip(a).getTime() === _agStrip(b).getTime(); }
function _agStartOfWeek(d) { const x = _agStrip(d); const wd = (x.getDay() + 6) % 7; x.setDate(x.getDate() - wd); return x; } // Pazartesi
function _agParseYmd(s) { const p = String(s).split("-").map(Number); return new Date(p[0], p[1] - 1, p[2]); }
function _agParseExam(dateStr) {
  const m = String(dateStr).trim().match(/^(\d{1,2})\s+(\p{L}+)/u);
  if (!m) return null;
  const day = parseInt(m[1], 10); const mon = AG_MON[m[2]];
  if (mon == null) return null;
  return new Date(2026, mon, day);
}
function _agDowDate(base, name) {
  const target = AG_DOW[name]; if (target == null) return null;
  const d = new Date(base);
  for (let i = 0; i < 7; i++) { if (d.getDay() === target) return new Date(d); d.setDate(d.getDate() + 1); }
  return null;
}

function _agBuild(me) {
  const today = _agStrip(typeof MIS_TODAY !== "undefined" ? MIS_TODAY : new Date());
  const items = [];
  const scOf = (s) => (typeof SUBJECT_COLORS !== "undefined" && SUBJECT_COLORS[s]) || "var(--primary)";

  if (typeof getOdevler === "function") {
    getOdevler().filter((o) => o.student === me && o.status !== "done" && o.due).forEach((o) => {
      const date = _agParseYmd(o.due);
      const tIcon = (typeof ODEV_TYPES !== "undefined" && ODEV_TYPES[o.type]) ? ODEV_TYPES[o.type].icon : "clipboard";
      items.push({ date, kind: "odev", title: o.topic, sub: o.subject + (o.count ? ` · ${o.count} soru` : ""), color: scOf(o.subject), icon: tIcon, page: "assignments" });
    });
  }
  if (typeof STUDENT_EXAMS_UP !== "undefined") {
    STUDENT_EXAMS_UP.forEach((e) => {
      const date = _agParseExam(e.date); if (!date) return;
      items.push({ date, kind: "deneme", title: e.name, sub: e.org, time: e.time, color: `var(--${e.tone || "info"})`, icon: "chart", page: "exams" });
    });
  }
  if (typeof getAppts === "function") {
    getAppts().filter((a) => a.student === me && a.status !== "rejected" && a.status !== "cancelled").forEach((a) => {
      const date = _agDowDate(today, a.day); if (!date) return;
      const mode = (typeof APPT_MODE !== "undefined" && APPT_MODE[a.mode]) ? APPT_MODE[a.mode] : { label: "Görüşme", icon: "calendar" };
      const st = (typeof APPT_STATUS !== "undefined" && APPT_STATUS[a.status]) ? APPT_STATUS[a.status].label : a.status;
      items.push({ date, kind: "randevu", title: "Koç görüşmesi · " + mode.label, sub: (a.topic || "Koçluk görüşmesi") + " · " + st, time: a.slot, color: "var(--success)", icon: mode.icon, page: "appointments" });
    });
  }
  if (typeof dueMistakes === "function") {
    dueMistakes(me).slice(0, 8).forEach((m) => {
      const date = m.nextDue ? _agParseYmd(m.nextDue) : today;
      const t = (typeof HATA_TIPI !== "undefined" && HATA_TIPI[m.errorType]) ? HATA_TIPI[m.errorType].label : "";
      items.push({ date, kind: "tekrar", title: "Tekrar: " + m.topic, sub: m.subject + (t ? " · " + t : ""), color: "var(--warning)", icon: "ai", page: "mistakes" });
    });
  }

  items.forEach((it) => { it.diff = Math.round((_agStrip(it.date) - today) / 86400000); });
  items.sort((a, b) => (a.date - b.date) || (a.kind < b.kind ? -1 : 1));
  return { items, today };
}

function _agGroupLabel(diff, date) {
  if (diff < 0) return "Gecikmiş";
  if (diff === 0) return "Bugün";
  if (diff === 1) return "Yarın";
  return date.toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" });
}

function AgRow({ it }) {
  return (
    <button className="ag-row" onClick={() => window.dispatchEvent(new CustomEvent("uk-nav", { detail: { page: it.page } }))}>
      <span className="ag-ic" style={{ background: `color-mix(in srgb, ${it.color} 14%, transparent)`, color: it.color }}><Icon name={it.icon} size={16} /></span>
      <span className="ag-main"><span className="ag-title">{it.title}</span><span className="ag-sub">{it.sub}</span></span>
      <span className="ag-right"><span className={"badge badge-" + AG_KINDS[it.kind].tone} style={{ height: 20 }}>{AG_KINDS[it.kind].label}</span>{it.time ? <span className="ag-time">{it.time}</span> : null}</span>
    </button>
  );
}

function AgChip({ it }) {
  return (
    <button className="ag-chip" style={{ borderLeftColor: it.color }} title={it.title + " · " + it.sub} onClick={() => window.dispatchEvent(new CustomEvent("uk-nav", { detail: { page: it.page } }))}>
      <Icon name={it.icon} size={11} style={{ color: it.color, flexShrink: 0 }} />
      <span className="t">{it.title}</span>
      {it.time ? <span className="tm">{it.time}</span> : null}
    </button>
  );
}

/* ---- Ajanda görünümü ---- */
function AgAgenda({ items, today }) {
  const win = items.filter((it) => it.diff >= -14 && it.diff <= 45);
  const groups = []; const map = {};
  win.forEach((it) => {
    const key = it.diff < 0 ? "overdue" : it.date.toISOString().slice(0, 10);
    if (!map[key]) { map[key] = { key, diff: it.diff, date: it.date, list: [] }; groups.push(map[key]); }
    map[key].list.push(it);
  });
  if (!groups.length) return <div className="ag-empty">Yaklaşan kayıt yok 🎉</div>;
  return groups.map((g) => (
    <div className="ag-group" key={g.key}>
      <div className={"ag-ghead" + (g.diff < 0 ? " od" : g.diff === 0 ? " td" : "")}>{_agGroupLabel(g.diff, g.date)}{g.diff > 1 ? null : <span className="ag-gdate">{g.diff < 0 ? "takipte" : g.date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}</span>}</div>
      <div className="ag-list">{g.list.map((it, i) => <AgRow key={i} it={it} />)}</div>
    </div>
  ));
}

/* ---- Hafta görünümü ---- */
function AgWeek({ items, today, off, setOff }) {
  const start = _agAddDays(_agStartOfWeek(today), off * 7);
  const days = Array.from({ length: 7 }).map((_, i) => _agAddDays(start, i));
  const end = days[6];
  const label = start.getDate() + " " + AG_MONTHS[start.getMonth()].slice(0, 3) + " – " + end.getDate() + " " + AG_MONTHS[end.getMonth()].slice(0, 3);
  return (
    <div>
      <div className="ag-nav">
        <button className="ag-navbtn" onClick={() => setOff(off - 1)} aria-label="Önceki hafta"><Icon name="chevronLeft" size={16} /></button>
        <span className="ag-navlbl">{label}</span>
        <button className="ag-navbtn" onClick={() => setOff(off + 1)} aria-label="Sonraki hafta"><Icon name="chevronRight" size={16} /></button>
        {off !== 0 ? <button className="ag-today" onClick={() => setOff(0)}>Bugün</button> : null}
      </div>
      <div className="ag-wk">
        {days.map((d, i) => {
          const dayItems = items.filter((it) => _agSameDay(it.date, d));
          const isToday = _agSameDay(d, today);
          return (
            <div className={"ag-wk-col" + (isToday ? " today" : "")} key={i}>
              <div className="ag-wk-head"><span className="wd">{AG_WD[i]}</span><span className="dn">{d.getDate()}</span></div>
              <div className="ag-wk-body">
                {dayItems.length ? dayItems.map((it, j) => <AgChip key={j} it={it} />) : <span className="ag-wk-empty">—</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---- Ay görünümü ---- */
function AgMonth({ items, today, monthDate, setMonthDate, sel, setSel }) {
  const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const gridStart = _agStartOfWeek(first);
  const cells = Array.from({ length: 42 }).map((_, i) => _agAddDays(gridStart, i));
  const inMonth = (d) => d.getMonth() === monthDate.getMonth();
  const selDay = sel || today;
  const selItems = items.filter((it) => _agSameDay(it.date, selDay));
  const move = (n) => { setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() + n, 1)); };
  const sameMonthToday = today.getMonth() === monthDate.getMonth() && today.getFullYear() === monthDate.getFullYear();
  return (
    <div>
      <div className="ag-nav">
        <button className="ag-navbtn" onClick={() => move(-1)} aria-label="Önceki ay"><Icon name="chevronLeft" size={16} /></button>
        <span className="ag-navlbl">{AG_MONTHS[monthDate.getMonth()]} {monthDate.getFullYear()}</span>
        <button className="ag-navbtn" onClick={() => move(1)} aria-label="Sonraki ay"><Icon name="chevronRight" size={16} /></button>
        {!sameMonthToday ? <button className="ag-today" onClick={() => { setMonthDate(new Date(today.getFullYear(), today.getMonth(), 1)); setSel(today); }}>Bugün</button> : null}
      </div>
      <div className="ag-wd-head">{AG_WD.map((w) => <span key={w}>{w}</span>)}</div>
      <div className="ag-mo">
        {cells.map((d, i) => {
          const dayItems = items.filter((it) => _agSameDay(it.date, d));
          const kinds = Array.from(new Set(dayItems.map((it) => it.kind)));
          const isToday = _agSameDay(d, today);
          const isSel = _agSameDay(d, selDay);
          return (
            <button className={"ag-mo-cell" + (inMonth(d) ? "" : " out") + (isToday ? " today" : "") + (isSel ? " sel" : "")} key={i} onClick={() => setSel(d)}>
              <span className="dn">{d.getDate()}</span>
              <span className="ag-mo-dots">{kinds.slice(0, 4).map((k) => <i key={k} style={{ background: `var(--${AG_KINDS[k].tone})` }} />)}</span>
              {dayItems.length > 0 ? <span className="ag-mo-n">{dayItems.length}</span> : null}
            </button>
          );
        })}
      </div>
      <div className="ag-mo-day">
        <div className="ag-ghead td">{_agSameDay(selDay, today) ? "Bugün" : selDay.toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" })}</div>
        {selItems.length ? <div className="ag-list">{selItems.map((it, i) => <AgRow key={i} it={it} />)}</div> : <div className="ag-empty">Bu gün için kayıt yok.</div>}
      </div>
    </div>
  );
}

function TakvimimCard() {
  const me = (typeof loadAuth === "function" && loadAuth()?.name) || "Elif Yıldız";
  if (typeof useOdevler === "function") useOdevler();
  if (typeof useMistakes === "function") useMistakes(me);
  if (typeof useAppts === "function") useAppts();
  const { items, today } = _agBuild(me);
  const [view, setView] = useState("ajanda");
  const [filter, setFilter] = useState("all");
  const [wkOff, setWkOff] = useState(0);
  const [monthDate, setMonthDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [sel, setSel] = useState(null);

  const counts = { all: items.length };
  Object.keys(AG_KINDS).forEach((k) => { counts[k] = items.filter((it) => it.kind === k).length; });
  const fItems = items.filter((it) => filter === "all" || it.kind === filter);

  return (
    <Section
      title="Takvimim"
      sub="Randevu, deneme, ödev ve tekrarların tek takvimde"
      action={
        <div className="seg" style={{ height: 34 }}>
          <button className={view === "ajanda" ? "on" : ""} onClick={() => setView("ajanda")}><Icon name="clipboard" size={14} />Ajanda</button>
          <button className={view === "hafta" ? "on" : ""} onClick={() => setView("hafta")}><Icon name="calendar" size={14} />Hafta</button>
          <button className={view === "ay" ? "on" : ""} onClick={() => setView("ay")}><Icon name="notebook" size={14} />Ay</button>
        </div>
      }
    >
      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="ag-filters">
          <button className={filter === "all" ? "on" : ""} onClick={() => setFilter("all")}>Tümü <b>{counts.all}</b></button>
          {Object.keys(AG_KINDS).map((k) => counts[k] ? (
            <button key={k} className={filter === k ? "on" : ""} onClick={() => setFilter(k)}><Icon name={AG_KINDS[k].icon} size={13} />{AG_KINDS[k].label} <b>{counts[k]}</b></button>
          ) : null)}
        </div>

        {view === "ajanda" ? <AgAgenda items={fItems} today={today} />
          : view === "hafta" ? <AgWeek items={fItems} today={today} off={wkOff} setOff={setWkOff} />
          : <AgMonth items={fItems} today={today} monthDate={monthDate} setMonthDate={setMonthDate} sel={sel} setSel={setSel} />}
      </div>
    </Section>
  );
}

Object.assign(window, { TakvimimCard });
