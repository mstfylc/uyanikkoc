/* Uyanık Koç mobil — Koç ek alanlar (genel):
   Toplu duyuru, Koç görev listesi, Deneme atama & takibi. */

/* ============================================================
   KOÇ — TOPLU DUYURU / GRUP MESAJI
   ============================================================ */
function AnnouncementScreen({ onBack }) {
  const [list, setList] = useState(C_ANNOUNCEMENTS);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [aud, setAud] = useState(C_AUDIENCES[0]);
  const reachOf = (a) => a === "Tüm öğrenciler" ? 8 : a === "Tüm veliler" ? 8 : a === "Risk altındakiler" ? 2 : 4;
  const valid = title.trim().length > 2 && body.trim().length > 4;
  const send = () => {
    setList([{ id: "an" + Date.now(), title: title.trim(), body: body.trim(), audience: aud, time: "Az önce", reach: reachOf(aud) }, ...list]);
    setTitle(""); setBody(""); ukToast(`Duyuru ${reachOf(aud)} kişiye gönderildi ✓`);
  };
  return (
    <div className="uk-scroll">
      <div className="uk-safe-top" />
      <SubHeader title="Toplu duyuru" sub="Öğrenci ve velilere grup mesajı" onBack={onBack} />

      {/* oluştur */}
      <div className="uk-sec">
        <div className="uk-card uk-card-pad" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div><div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--text-2)", marginBottom: 7 }}>Kime?</div>
            <div className="uk-segrow" style={{ padding: 0 }}>{C_AUDIENCES.map((a) => (
              <button key={a} className={`uk-seg${aud === a ? " on" : ""}`} onClick={() => setAud(a)}>{a} <span style={{ opacity: .7 }}>{reachOf(a)}</span></button>
            ))}</div></div>
          <div><div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--text-2)", marginBottom: 7 }}>Başlık</div>
            <div className="uk-inputwrap" style={{ height: 48 }}><input placeholder="örn. Pazar TYT Deneme #7" value={title} onChange={(e) => setTitle(e.target.value)} style={{ fontSize: 14.5 }} /></div></div>
          <div><div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--text-2)", marginBottom: 7 }}>Mesaj</div>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Duyuru metnini yaz…" rows={4} style={{ width: "100%", border: "1.5px solid var(--border-strong)", borderRadius: 14, padding: "12px 14px", fontSize: 14.5, fontWeight: 500, fontFamily: "inherit", color: "var(--text)", background: "var(--surface)", resize: "none", outline: "none", lineHeight: 1.5 }} /></div>
          <button className="uk-btn uk-btn-primary" style={{ height: 48 }} disabled={!valid} onClick={send}><MIcon name="send" size={16} /> {aud} grubuna gönder</button>
        </div>
      </div>

      {/* geçmiş */}
      <div className="uk-sec" style={{ marginTop: 22, gap: 12 }}>
        <div className="uk-sec-head"><h2>Gönderilen duyurular</h2></div>
        {list.map((a) => (
          <div key={a.id} className="uk-card uk-card-pad">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ width: 34, height: 34, borderRadius: 10, display: "grid", placeItems: "center", background: "var(--primary-soft)", color: "var(--primary-600)", flexShrink: 0 }}><MIcon name="send" size={16} /></span>
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 14.5, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.title}</div></div>
              <span style={{ fontSize: 11, color: "var(--faint)", fontWeight: 600, flexShrink: 0 }}>{a.time}</span>
            </div>
            <div style={{ fontSize: 13, color: "var(--text-2)", fontWeight: 500, lineHeight: 1.5 }}>{a.body}</div>
            <div className="uk-meta" style={{ marginTop: 10 }}>
              <span className="uk-badge primary"><MIcon name="users" size={12} /> {a.audience}</span>
              <span className="mi d">{a.reach} kişiye ulaştı</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ height: 24 }} />
    </div>
  );
}

/* ============================================================
   KOÇ — GÖREV LİSTESİ (yapılacaklar)
   ============================================================ */
function TasksScreen({ onBack, openStudent }) {
  const [tasks, setTasks] = useState(C_TASKS);
  const [val, setVal] = useState("");
  const toggle = (id) => setTasks(tasks.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  const add = () => { const t = val.trim(); if (!t) return; setTasks([{ id: "tx" + Date.now(), text: t, sid: null, student: null, due: "Bugün", done: false, priority: "med" }, ...tasks]); setVal(""); };
  const open = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);

  const Row = ({ t }) => {
    const pr = C_TASK_PRIORITY[t.priority];
    return (
      <div className="uk-odev" style={{ alignItems: "center", opacity: t.done ? .6 : 1 }}>
        <button onClick={() => toggle(t.id)} style={{ width: 26, height: 26, borderRadius: 8, border: `2px solid ${t.done ? "var(--success)" : "var(--border-strong)"}`, background: t.done ? "var(--success)" : "transparent", display: "grid", placeItems: "center", flexShrink: 0 }}>
          {t.done ? <MIcon name="check" size={15} style={{ color: "#fff" }} /> : null}
        </button>
        <div className="body">
          <div className="ttl" style={{ fontSize: 14, textDecoration: t.done ? "line-through" : "none", color: t.done ? "var(--muted)" : "var(--text)" }}>{t.text}</div>
          <div className="uk-meta" style={{ marginTop: 6 }}>
            {!t.done ? <span className={`uk-badge ${pr.tone}`}>{pr.label}</span> : null}
            <span className="mi">{t.due}</span>
            {t.student ? <button className="mi d" onClick={() => openStudent(t.sid)} style={{ color: "var(--primary-600)", fontWeight: 700, cursor: "pointer" }}>{t.student}</button> : null}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="uk-scroll">
      <div className="uk-safe-top" />
      <SubHeader title="Görevlerim" sub={`${open.length} açık · ${done.length} tamamlandı`} onBack={onBack} />
      <div className="uk-sec">
        <div style={{ display: "flex", gap: 10 }}>
          <div className="uk-inputwrap" style={{ flex: 1, height: 48 }}><input placeholder="Yeni görev ekle…" value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") add(); }} style={{ fontSize: 14.5 }} /></div>
          <button className="uk-iconbtn" onClick={add} style={{ width: 48, height: 48, borderRadius: 14, background: "var(--primary)", color: "#fff", border: "none" }}><MIcon name="plus" size={20} /></button>
        </div>
      </div>
      <div className="uk-sec" style={{ marginTop: 16, gap: 10 }}>
        <div className="uk-sec-head"><h2>Açık görevler <span style={{ color: "var(--muted)", fontWeight: 700 }}>· {open.length}</span></h2></div>
        {open.map((t) => <Row key={t.id} t={t} />)}
      </div>
      {done.length > 0 && (
        <div className="uk-sec" style={{ marginTop: 22, gap: 10 }}>
          <div className="uk-sec-head"><h2 style={{ color: "var(--muted)" }}>Tamamlanan <span style={{ fontWeight: 700 }}>· {done.length}</span></h2></div>
          {done.map((t) => <Row key={t.id} t={t} />)}
        </div>
      )}
      <div style={{ height: 24 }} />
    </div>
  );
}

/* ============================================================
   KOÇ — DENEME ATAMA & TAKİBİ
   ============================================================ */
function ExamAssignScreen({ onBack }) {
  const [list, setList] = useState(C_EXAM_ASSIGN);
  const [composing, setComposing] = useState(false);
  const [open, setOpen] = useState(null);
  const [f, setF] = useState({ name: "", type: "TYT", date: "", aud: C_AUDIENCES[0] });
  const dateOpts = [{ v: "8 Haz 2026", l: "8 Haz Paz" }, { v: "15 Haz 2026", l: "15 Haz Paz" }, { v: "22 Haz 2026", l: "22 Haz Paz" }];
  const valid = f.name.trim().length > 2 && f.date;
  const reachOf = (a) => a === "Risk altındakiler" ? 2 : a === "12. sınıflar" ? 4 : 8;
  const create = () => {
    const n = reachOf(f.aud);
    setList([{ id: "ex" + Date.now(), name: f.name.trim(), type: f.type, date: f.date, audience: f.aud, status: "yaklaşan", taken: C_STUDENTS.filter((s) => s.status !== "new").slice(0, n).map((s) => ({ sid: s.id, name: s.name, initials: s.initials, net: null })) }, ...list]);
    setComposing(false); setF({ name: "", type: "TYT", date: "", aud: C_AUDIENCES[0] }); ukToast(`Deneme ${n} öğrenciye atandı ✓`);
  };

  return (
    <div className="uk-scroll">
      <div className="uk-safe-top" />
      <SubHeader title="Denemeler" sub="Atama ve sonuç takibi" onBack={onBack}
        action={<button className="uk-iconbtn" onClick={() => setComposing(!composing)} style={{ background: composing ? "var(--surface-3)" : "var(--primary)", color: composing ? "var(--text-2)" : "#fff", border: "none" }}><MIcon name={composing ? "chevronDown" : "plus"} size={20} /></button>} />

      {composing && (
        <div className="uk-sec">
          <div className="uk-card uk-card-pad" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 800 }}>Yeni deneme ata</div>
            <div><div style={{ fontSize: 12, fontWeight: 800, color: "var(--text-2)", marginBottom: 6 }}>Deneme adı</div>
              <div className="uk-inputwrap" style={{ height: 46 }}><input placeholder="örn. TYT Genel Deneme #8" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} style={{ fontSize: 14 }} /></div></div>
            <div><div style={{ fontSize: 12, fontWeight: 800, color: "var(--text-2)", marginBottom: 6 }}>Tür</div>
              <div className="uk-segrow" style={{ padding: 0 }}>{C_EXAM_TYPES.map((t) => <button key={t} className={`uk-seg${f.type === t ? " on" : ""}`} onClick={() => setF({ ...f, type: t })}>{t}</button>)}</div></div>
            <div><div style={{ fontSize: 12, fontWeight: 800, color: "var(--text-2)", marginBottom: 6 }}>Tarih</div>
              <div style={{ display: "flex", gap: 8 }}>{dateOpts.map((d) => <button key={d.v} onClick={() => setF({ ...f, date: d.v })} style={{ flex: 1, height: 42, borderRadius: 11, border: `1.5px solid ${f.date === d.v ? "var(--primary)" : "var(--border-strong)"}`, background: f.date === d.v ? "var(--primary-soft)" : "var(--surface)", color: f.date === d.v ? "var(--primary-600)" : "var(--text-2)", fontWeight: 800, fontSize: 12.5 }}>{d.l}</button>)}</div></div>
            <div><div style={{ fontSize: 12, fontWeight: 800, color: "var(--text-2)", marginBottom: 6 }}>Kime?</div>
              <div className="uk-segrow" style={{ padding: 0 }}>{C_AUDIENCES.filter((a) => !a.includes("veli")).map((a) => <button key={a} className={`uk-seg${f.aud === a ? " on" : ""}`} onClick={() => setF({ ...f, aud: a })}>{a}</button>)}</div></div>
            <button className="uk-btn uk-btn-primary" style={{ height: 46 }} disabled={!valid} onClick={create}><MIcon name="send" size={16} /> Denemeyi ata</button>
          </div>
        </div>
      )}

      <div className="uk-sec" style={{ marginTop: composing ? 22 : 4, gap: 12 }}>
        {list.map((ex) => {
          const took = ex.taken.filter((p) => p.net != null);
          const avg = took.length ? (took.reduce((n, p) => n + p.net, 0) / took.length).toFixed(1) : null;
          const isOpen = open === ex.id;
          const upcoming = ex.status === "yaklaşan";
          return (
            <div key={ex.id} className="uk-card" style={{ overflow: "hidden" }}>
              <button onClick={() => setOpen(isOpen ? null : ex.id)} style={{ width: "100%", textAlign: "left", padding: 16, display: "block" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                  <span className="ec" style={{ width: 44, height: 44, borderRadius: 13, display: "grid", placeItems: "center", background: upcoming ? "var(--info-soft)" : "var(--primary-soft)", color: upcoming ? "var(--info)" : "var(--primary-600)", flexShrink: 0 }}><MIcon name={upcoming ? "calendar" : "chart"} size={21} /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ex.name}</div>
                    <div className="uk-meta" style={{ marginTop: 5 }}><span className="uk-badge muted">{ex.type}</span><span className="mi d">{ex.date}</span></div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    {upcoming ? <span className="uk-badge info">Yaklaşan</span> : <><div style={{ fontSize: 18, fontWeight: 800 }} className="tnum">{avg}</div><div style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 700 }}>ort. net</div></>}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
                  <div className="uk-bar" style={{ flex: 1 }}><span style={{ width: (took.length / ex.taken.length) * 100 + "%", background: upcoming ? "var(--info)" : "var(--success)" }} /></div>
                  <span style={{ fontSize: 11.5, fontWeight: 800, color: "var(--text-2)", flexShrink: 0 }}>{upcoming ? `${ex.taken.length} kişi` : `${took.length}/${ex.taken.length} girdi`}</span>
                  <MIcon name="chevronDown" size={16} style={{ color: "var(--faint)", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
                </div>
              </button>
              {isOpen && (
                <div style={{ borderTop: "1px solid var(--border)", padding: "6px 16px 12px" }}>
                  {ex.taken.map((p) => (
                    <div key={p.sid} style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                      <span className="uk-avatar" style={{ width: 34, height: 34, fontSize: 12 }}>{p.initials}</span>
                      <span style={{ flex: 1, fontSize: 13.5, fontWeight: 700 }}>{p.name}</span>
                      {p.net != null
                        ? <span style={{ fontSize: 15, fontWeight: 800 }} className="tnum">{p.net}</span>
                        : upcoming ? <span className="uk-badge info">Bekleniyor</span> : <span className="uk-badge danger">Girmedi</span>}
                    </div>
                  ))}
                  {!upcoming && <button className="uk-btn uk-btn-light uk-btn-block" style={{ height: 42, marginTop: 12, boxShadow: "none" }} onClick={() => ukToast("Hatırlatma gönderildi")}><MIcon name="bell" size={15} /> Girmeyenlere hatırlat</button>}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ height: 24 }} />
    </div>
  );
}

Object.assign(window, { AnnouncementScreen, TasksScreen, ExamAssignScreen });
