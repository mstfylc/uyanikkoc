/* Uyanık Koç mobil — Koç ek alanlar (öğrenciye özel):
   Çalışma programı oluşturma, Konu/müfredat takibi, Koç notları. */

/* ============================================================
   KOÇ — ÇALIŞMA PROGRAMI (haftalık plan oluştur/düzenle)
   ============================================================ */
function ProgramCoachScreen({ student, onBack }) {
  const [plan, setPlan] = useState(() => JSON.parse(JSON.stringify(C_PROGRAM_SEED)));
  const [day, setDay] = useState(M_TODAY);
  const [adding, setAdding] = useState(false);
  const subjects = Object.keys(M_SUBJECT_COLORS);
  const [f, setF] = useState({ t: "16:00", e: "17:00", subj: subjects[0], topic: "", type: "Konu" });

  const blocks = plan[day] || [];
  const totalBlocks = Object.values(plan).reduce((n, arr) => n + arr.length, 0);

  const addBlock = () => {
    if (!f.topic.trim()) return;
    const next = { ...plan, [day]: [...(plan[day] || []), { ...f }].sort((a, b) => a.t.localeCompare(b.t)) };
    setPlan(next); setAdding(false); setF({ ...f, topic: "" }); ukToast("Blok eklendi ✓");
  };
  const delBlock = (i) => { const arr = [...plan[day]]; arr.splice(i, 1); setPlan({ ...plan, [day]: arr }); };

  return (
    <div className="uk-scroll">
      <div className="uk-safe-top" />
      <SubHeader title="Çalışma programı" sub={`${student.name} · ${totalBlocks} blok / hafta`} onBack={onBack}
        action={<button className="uk-iconbtn" onClick={() => setAdding(!adding)} style={{ background: adding ? "var(--surface-3)" : "var(--primary)", color: adding ? "var(--text-2)" : "#fff", border: "none" }}><MIcon name={adding ? "chevronDown" : "plus"} size={20} /></button>} />

      {/* gün seçici */}
      <div className="uk-segrow">
        {M_DAYS.map((d) => (
          <button key={d} className={`uk-seg${day === d ? " on" : ""}`} onClick={() => setDay(d)}>
            {d}{d === M_TODAY ? <span style={{ width: 5, height: 5, borderRadius: 3, background: day === d ? "#fff" : "var(--primary)", display: "inline-block" }} /> : null}
          </button>
        ))}
      </div>

      {/* blok ekleme formu */}
      {adding && (
        <div className="uk-sec" style={{ marginTop: 14 }}>
          <div className="uk-card uk-card-pad" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 13.5, fontWeight: 800 }}>{M_DAYS_FULL[day]} · yeni blok</div>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1 }}><div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--muted)", marginBottom: 5 }}>Başlangıç</div><input type="time" value={f.t} onChange={(e) => setF({ ...f, t: e.target.value })} style={{ width: "100%", height: 44, borderRadius: 11, border: "1.5px solid var(--border-strong)", background: "var(--surface)", padding: "0 12px", fontSize: 14, fontWeight: 700, color: "var(--text)", fontFamily: "inherit" }} /></div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--muted)", marginBottom: 5 }}>Bitiş</div><input type="time" value={f.e} onChange={(e) => setF({ ...f, e: e.target.value })} style={{ width: "100%", height: 44, borderRadius: 11, border: "1.5px solid var(--border-strong)", background: "var(--surface)", padding: "0 12px", fontSize: 14, fontWeight: 700, color: "var(--text)", fontFamily: "inherit" }} /></div>
            </div>
            <div><div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--muted)", marginBottom: 6 }}>Ders</div>
              <div className="uk-segrow" style={{ padding: 0 }}>{subjects.map((s) => { const c = M_SUBJECT_COLORS[s]; return <button key={s} className={`uk-seg${f.subj === s ? " on" : ""}`} onClick={() => setF({ ...f, subj: s })} style={f.subj === s ? { background: c, borderColor: c } : null}><span style={{ width: 8, height: 8, borderRadius: 3, background: f.subj === s ? "#fff" : c, display: "inline-block" }} />{s}</button>; })}</div></div>
            <div><div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--muted)", marginBottom: 6 }}>Konu</div>
              <div className="uk-inputwrap" style={{ height: 46 }}><input placeholder="örn. Türev — kural tekrarı" value={f.topic} onChange={(e) => setF({ ...f, topic: e.target.value })} style={{ fontSize: 14 }} /></div></div>
            <div><div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--muted)", marginBottom: 6 }}>Tür</div>
              <div className="uk-segrow" style={{ padding: 0 }}>{C_BLOCK_TYPES.map((tp) => <button key={tp} className={`uk-seg${f.type === tp ? " on" : ""}`} onClick={() => setF({ ...f, type: tp })}>{tp}</button>)}</div></div>
            <button className="uk-btn uk-btn-primary" style={{ height: 46 }} disabled={!f.topic.trim()} onClick={addBlock}><MIcon name="plus" size={16} /> Bloğu ekle</button>
          </div>
        </div>
      )}

      {/* günün blokları */}
      <div className="uk-sec" style={{ marginTop: 18, gap: 12 }}>
        {blocks.length === 0
          ? <div className="uk-card uk-card-pad" style={{ textAlign: "center", color: "var(--muted)", fontWeight: 600, fontSize: 13.5 }}>{M_DAYS_FULL[day]} için blok yok. Üstten ekle.</div>
          : blocks.map((b, i) => {
            const c = M_SUBJECT_COLORS[b.subj] || "var(--primary)";
            return (
              <div key={i} className="uk-block">
                <div className="time">{b.t}<span>{b.e}</span></div>
                <div className="b" style={{ borderLeftColor: c, display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="bs" style={{ color: c }}>{b.subj.toUpperCase()} · {b.type}</div>
                    <div className="bt">{b.topic}</div>
                  </div>
                  <button className="uk-iconbtn" onClick={() => delBlock(i)} style={{ width: 32, height: 32, borderRadius: 9, color: "var(--danger)", flexShrink: 0 }}><MIcon name="plus" size={16} style={{ transform: "rotate(45deg)" }} /></button>
                </div>
              </div>
            );
          })}
      </div>

      <div className="uk-sec" style={{ marginTop: 20 }}>
        <button className="uk-btn uk-btn-primary uk-btn-block" onClick={() => { onBack(); ukToast("Program kaydedildi ✓"); }}><MIcon name="check" size={17} /> Programı kaydet ve gönder</button>
      </div>
      <div style={{ height: 24 }} />
    </div>
  );
}

/* ============================================================
   KOÇ — KONU / MÜFREDAT TAKİBİ (durum işaretle)
   ============================================================ */
function KonuCoachScreen({ student, onBack }) {
  const subjects = Object.keys(M_TOPICS);
  const [active, setActive] = useState(subjects[0]);
  const [data, setData] = useState(() => JSON.parse(JSON.stringify(M_TOPICS)));
  const list = data[active];
  const c = M_SUBJECT_COLORS[active] || "var(--primary)";
  const done = list.filter((t) => t.s === "done").length;
  const pct = Math.round((done / list.length) * 100);
  const cycle = { todo: "progress", progress: "done", done: "todo" };

  const tap = (i) => {
    const arr = data[active].map((t, j) => j === i ? { ...t, s: cycle[t.s], p: cycle[t.s] === "progress" ? (t.p || 50) : t.p } : t);
    setData({ ...data, [active]: arr });
  };

  return (
    <div className="uk-scroll">
      <div className="uk-safe-top" />
      <SubHeader title="Konu takibi" sub={`${student.name} · ${active} %${pct}`} onBack={onBack} />

      <div className="uk-segrow">
        {subjects.map((s) => {
          const sc = M_SUBJECT_COLORS[s];
          return <button key={s} className={`uk-seg${active === s ? " on" : ""}`} onClick={() => setActive(s)} style={active === s ? { background: sc, borderColor: sc } : null}><span style={{ width: 8, height: 8, borderRadius: 3, background: active === s ? "#fff" : sc, display: "inline-block" }} />{s}</button>;
        })}
      </div>

      {/* ilerleme özeti */}
      <div className="uk-sec" style={{ marginTop: 14 }}>
        <div className="uk-card uk-card-pad">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 13.5, fontWeight: 800 }}>{active} ilerlemesi</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: c }}>%{pct} · {done}/{list.length}</span>
          </div>
          <div className="uk-bar"><span style={{ width: pct + "%", background: c }} /></div>
          <div style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600, marginTop: 10 }}>Durumu değiştirmek için konuya dokun</div>
        </div>
      </div>

      {/* konu listesi */}
      <div className="uk-sec" style={{ marginTop: 14, gap: 8 }}>
        {list.map((t, i) => {
          const st = M_TOPIC_STATUS[t.s];
          const icon = t.s === "done" ? "checkCircle" : t.s === "progress" ? "clock" : "plus";
          return (
            <button key={t.n} className="uk-li" onClick={() => tap(i)} style={{ width: "100%", textAlign: "left", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "calc(14px * var(--rs))", boxShadow: "var(--shadow-sm)", cursor: "pointer" }}>
              <span className="lic" style={{ background: `var(--${st.tone}-soft)`, color: st.tone === "muted" ? "var(--muted)" : `var(--${st.tone})` }}><MIcon name={icon} size={17} /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{t.n}</div>
                {t.s === "progress" ? <div className="uk-bar" style={{ marginTop: 7, height: 5 }}><span style={{ width: (t.p || 50) + "%", background: "var(--warning)" }} /></div> : null}
              </div>
              <span className={`uk-badge ${st.tone}`}>{st.label}</span>
            </button>
          );
        })}
      </div>

      <div className="uk-sec" style={{ marginTop: 18 }}>
        <button className="uk-btn uk-btn-primary uk-btn-block" onClick={() => { onBack(); ukToast("Konu durumları kaydedildi ✓"); }}><MIcon name="check" size={17} /> Kaydet</button>
      </div>
      <div style={{ height: 24 }} />
    </div>
  );
}

/* ============================================================
   KOÇ — ÖĞRENCİ NOTLARI (detay içinde gömülü bölüm)
   ============================================================ */
function CoachNotes({ sid }) {
  const [notes, setNotes] = useState(() => (C_NOTES[sid] || []).slice());
  const [val, setVal] = useState("");
  const add = () => { const t = val.trim(); if (!t) return; setNotes([{ id: "nx" + Date.now(), text: t, date: "Bugün" }, ...notes]); setVal(""); ukToast("Not eklendi ✓"); };
  const del = (id) => setNotes(notes.filter((n) => n.id !== id));
  return (
    <div className="uk-card uk-card-pad" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 10 }}>
        <div className="uk-inputwrap" style={{ flex: 1, height: 46 }}><input placeholder="Gizli not ekle… (sadece koç görür)" value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") add(); }} style={{ fontSize: 14 }} /></div>
        <button className="uk-iconbtn" onClick={add} style={{ width: 46, height: 46, borderRadius: 13, background: "var(--primary)", color: "#fff", border: "none" }}><MIcon name="plus" size={20} /></button>
      </div>
      {notes.length === 0
        ? <div style={{ fontSize: 12.5, color: "var(--faint)", fontWeight: 600, padding: "4px 2px" }}>Henüz not yok.</div>
        : notes.map((n) => (
          <div key={n.id} style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 12px", background: "var(--warning-soft)", borderRadius: 13, border: "1px solid color-mix(in srgb, var(--warning) 22%, transparent)" }}>
            <MIcon name="edit" size={15} style={{ color: "var(--warning)", marginTop: 2, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", lineHeight: 1.45 }}>{n.text}</div>
              <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, marginTop: 4 }}>{n.date}</div>
            </div>
            <button onClick={() => del(n.id)} style={{ color: "var(--faint)", flexShrink: 0 }}><MIcon name="plus" size={15} style={{ transform: "rotate(45deg)" }} /></button>
          </div>
        ))}
    </div>
  );
}

Object.assign(window, { ProgramCoachScreen, KonuCoachScreen, CoachNotes });
