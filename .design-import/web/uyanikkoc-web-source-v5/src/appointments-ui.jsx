/* Randevu sayfaları (koç + öğrenci) + öğrenci not kartı (koç). */

/* ---- Koç: Randevular ---- */
function CoachAppointmentsPage() {
  const appts = useAppts();
  const settings = useApptSettings();
  const [tab, setTab] = useState("liste");

  const pending = appts.filter((a) => a.status === "pending");
  const approved = appts.filter((a) => a.status === "approved");

  return (
    <div className="stack rise">
      <PageHead title="Randevular" sub="Görüşme taleplerini yönet ve müsait saatlerini belirle" />

      <div className="seg" style={{ width: "fit-content" }}>
        <button className={tab === "liste" ? "on" : ""} onClick={() => setTab("liste")}><Icon name="calendar" size={16} />Randevular {pending.length ? <span className="nav-count tnum" style={{ minWidth: 18, height: 18, fontSize: 10.5 }}>{pending.length}</span> : null}</button>
        <button className={tab === "musait" ? "on" : ""} onClick={() => setTab("musait")}><Icon name="clock" size={16} />Müsait Saatlerim</button>
      </div>

      {tab === "liste" ? (
        <>
          <div className="grid g-4">
            <StatCard icon="clock" tone="warning" value={pending.length} label="Onay bekleyen" />
            <StatCard icon="checkCircle" tone="success" value={approved.length} label="Onaylı randevu" />
            <StatCard icon="ai" tone="info" value={approved.filter((a) => a.mode === "online").length} label="Online" />
            <StatCard icon="phone" tone="success" value={approved.filter((a) => a.mode === "telefon").length} label="Telefon" />
          </div>

          {pending.length ? (
            <Section title="Onay Bekleyenler" sub={`${pending.length} talep`} action={<Badge tone="warning">{pending.length}</Badge>}>
              <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {pending.map((a) => <ApptRow key={a.id} a={a} coach />)}
              </div>
            </Section>
          ) : null}

          <Section title="Yaklaşan Randevular" sub={`${approved.length} onaylı`}>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {approved.length === 0 ? <div style={{ padding: "20px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Onaylı randevu yok.</div>
                : approved.map((a) => <ApptRow key={a.id} a={a} coach />)}
            </div>
          </Section>
        </>
      ) : (
        <CoachAvailability />
      )}
    </div>
  );
}

function ApptRow({ a, coach }) {
  const m = APPT_MODE[a.mode] || APPT_MODE.online; const st = APPT_STATUS[a.status];
  return (
    <div className="lrow" style={{ alignItems: "flex-start" }}>
      {coach ? <Avatar name={a.student} size={38} /> : <span className="lr-icon" style={{ background: "var(--primary-soft)", color: "var(--primary-600)" }}><Icon name="calendar" size={19} /></span>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="lr-title">{coach ? a.student : "Koç görüşmesi"} <span className="muted" style={{ fontWeight: 500 }}>· {a.day} {a.slot}</span>{coach && a.byRole === "parent" ? <span className="badge badge-muted" style={{ height: 18, fontSize: 9.5, marginLeft: 6 }}>Veli</span> : null}</div>
        <div className="lr-meta">
          <span className="badge" style={{ height: 20, background: `var(--${m.tone}-soft)`, color: `var(--${m.tone})` }}><Icon name={m.icon} size={12} />{m.label}</span>
          {a.topic ? <span className="d">{a.topic}</span> : null}
        </div>
      </div>
      {coach && a.status === "pending" ? (
        <div className="row" style={{ gap: 6 }}>
          <button className="btn btn-primary btn-sm" onClick={() => setApptStatus(a.id, "approved")}><Icon name="check" size={14} />Onayla</button>
          <button className="btn btn-light btn-sm" onClick={() => setApptStatus(a.id, "rejected")}>Reddet</button>
        </div>
      ) : <Badge tone={st.tone} dot>{st.label}</Badge>}
    </div>
  );
}

function CoachAvailability() {
  const s = useApptSettings();
  const [edit, setEdit] = useState(null); // {day, slot, x, y}
  const allowed = allowedModes(s);
  const typeRows = [
    ["allowOnline", "video", "Online randevu", "Öğrenciler online görüşme isteyebilir", "info"],
    ["allowYuzyuze", "users", "Yüz yüze randevu", "Öğrenciler yüz yüze görüşme isteyebilir", "primary"],
    ["allowTelefon", "phone", "Telefon görüşmesi", "Öğrenciler telefonla görüşme isteyebilir", "success"],
  ];
  const openCell = (e, day, slot) => { const r = e.currentTarget.getBoundingClientRect(); setEdit({ day, slot, x: r.left + r.width / 2, y: r.bottom + 6 }); };
  return (
    <>
      <Section title="Randevu Ayarları" sub="Görüşme tiplerini ve haftalık limitleri belirle">
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {typeRows.map(([key, icon, title, desc, tone], i) => (
            <React.Fragment key={key}>
              {i > 0 ? <hr className="hr" /> : null}
              <div className="between" style={{ padding: "10px 0" }}>
                <div className="row" style={{ gap: 12 }}><span className="lr-icon" style={{ width: 38, height: 38, background: `var(--${tone}-soft)`, color: `var(--${tone})` }}><Icon name={icon} size={18} /></span><div><div style={{ fontSize: 13.5, fontWeight: 700 }}>{title}</div><div className="muted" style={{ fontSize: 12 }}>{desc}</div></div></div>
                <button className={`switch${s[key] ? " on" : ""}`} onClick={() => setApptSettings({ [key]: !s[key] })}><span /></button>
              </div>
            </React.Fragment>
          ))}
          <hr className="hr" />
          <div className="between" style={{ padding: "12px 0", flexWrap: "wrap", gap: 12 }}>
            <div className="row" style={{ gap: 12 }}><span className="lr-icon" style={{ width: 38, height: 38, background: "var(--surface-3)" }}><Icon name="cap" size={18} /></span><div><div style={{ fontSize: 13.5, fontWeight: 700 }}>Öğrenci haftalık limiti</div><div className="muted" style={{ fontSize: 12 }}>Bir öğrencinin haftada isteyebileceği max randevu (0 = sınırsız)</div></div></div>
            <NumStepper value={s.weeklyLimitStudent ?? 2} onChange={(v) => setApptSettings({ weeklyLimitStudent: v })} step={1} min={0} max={14} size="sm" />
          </div>
          <hr className="hr" />
          <div className="between" style={{ padding: "12px 0", flexWrap: "wrap", gap: 12 }}>
            <div className="row" style={{ gap: 12 }}><span className="lr-icon" style={{ width: 38, height: 38, background: "var(--surface-3)" }}><Icon name="heart" size={18} /></span><div><div style={{ fontSize: 13.5, fontWeight: 700 }}>Veli haftalık limiti</div><div className="muted" style={{ fontSize: 12 }}>Bir velinin haftada isteyebileceği max randevu (0 = sınırsız)</div></div></div>
            <NumStepper value={s.weeklyLimitParent ?? 1} onChange={(v) => setApptSettings({ weeklyLimitParent: v })} step={1} min={0} max={14} size="sm" />
          </div>
        </div>
      </Section>

      <Section title="Müsait Saatlerim" sub="Hücreye tıkla, o saatte sunduğun görüşme tiplerini seç">
        <div className="card-body" style={{ overflowX: "auto" }}>
          <div className="avail-legend">
            {allowed.map((m) => <span key={m} className="row" style={{ gap: 5, fontSize: 11.5, fontWeight: 600, color: "var(--text-2)" }}><span className="amode-dot" style={{ background: `var(--${APPT_MODE[m].tone})` }} />{APPT_MODE[m].label}</span>)}
          </div>
          <div className="avail-grid">
            <div></div>
            {APPT_DAYS.map((d) => <div key={d} className="avail-day">{d}</div>)}
            {APPT_SLOTS.map((slot) => (
              <React.Fragment key={slot}>
                <div className="avail-slot">{slot}</div>
                {APPT_DAYS.map((d) => {
                  const modes = availModes(s, d, slot);
                  const on = modes.length > 0;
                  return (
                    <button key={d + slot} className={`avail-cell${on ? " on" : ""}`} onClick={(e) => openCell(e, d, slot)} aria-label={`${d} ${slot}`}>
                      {on ? <span className="amode-dots">{modes.map((m) => <span key={m} className="amode-dot" style={{ background: `var(--${APPT_MODE[m].tone})` }} />)}</span> : <Icon name="plus" size={12} style={{ color: "var(--faint)" }} />}
                    </button>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
          <div className="muted" style={{ fontSize: 11.5, marginTop: 12, display: "flex", alignItems: "center", gap: 6 }}><Icon name="bolt" size={13} />Renkli noktalar o saatte sunulan görüşme tiplerini gösterir.</div>
        </div>
      </Section>

      {edit ? ReactDOM.createPortal((
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 60 }} onClick={() => setEdit(null)} />
          <div className="appt-pop" style={{ left: Math.min(edit.x, window.innerWidth - 180), top: edit.y }}>
            <div className="appt-pop-h">{edit.day} · {edit.slot}</div>
            {allowed.length === 0 ? <div className="muted" style={{ fontSize: 12, padding: "6px 4px" }}>Önce görüşme tipi aç.</div> : allowed.map((m) => {
              const on = availModes(s, edit.day, edit.slot).includes(m);
              return (
                <button key={m} className={`appt-pop-row${on ? " on" : ""}`} onClick={() => toggleSlotMode(edit.day, edit.slot, m)}>
                  <span className="amode-dot" style={{ background: `var(--${APPT_MODE[m].tone})` }} />
                  <Icon name={APPT_MODE[m].icon} size={14} /><span style={{ flex: 1, textAlign: "left" }}>{APPT_MODE[m].label}</span>
                  <span className={`chk sm${on ? " done" : ""}`}><Icon name="check" size={11} stroke={3} /></span>
                </button>
              );
            })}
          </div>
        </>
      ), document.body) : null}
    </>
  );
}

/* ---- Öğrenci: Randevu Al ---- */
function StudentAppointmentsPage() {
  const auth = (typeof loadAuth === "function") ? loadAuth() : null;
  const me = (auth && auth.name) || "Elif Yıldız";
  const role = (auth && auth.role) || "student";
  const isParent = role === "parent";
  const appts = useAppts();
  const s = useApptSettings();
  const [modal, setModal] = useState(false);
  const mine = appts.filter((a) => a.student === me);
  const used = mine.filter((a) => a.status !== "rejected" && a.status !== "cancelled").length;
  const limit = isParent ? (s.weeklyLimitParent ?? 1) : (s.weeklyLimitStudent ?? 2);
  const canRequest = limit === 0 || used < limit;

  return (
    <div className="stack rise">
      <PageHead title="Randevular" sub={isParent ? "Çocuğunun koçuyla online, yüz yüze veya telefonla görüşme planla" : "Koçunla online, yüz yüze veya telefonla görüşme planla"} actions={
        <button className="btn btn-primary" disabled={!canRequest} onClick={() => setModal(true)} style={{ opacity: canRequest ? 1 : 0.5 }}><Icon name="plus" size={16} />Randevu İste</button>
      } />

      <div className="card"><div className="card-pad" style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <span className="stat-icon tone-primary" style={{ width: 46, height: 46, borderRadius: 13 }}><Icon name="target" size={22} /></span>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{limit === 0 ? "Sınırsız randevu hakkın var" : `Bu hafta ${used}/${limit} randevu kullandın`}</div>
          <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>{canRequest ? "Koçunun müsait saatlerinden seçim yapabilirsin." : "Haftalık randevu hakkın doldu. Gelecek hafta tekrar dene."}</div>
        </div>
        {limit > 0 ? <div className="dots">{Array.from({ length: limit }).map((_, i) => <i key={i} className={i < used ? "on today" : ""} style={{ width: 30, height: 30 }}>{i < used ? "✓" : "+"}</i>)}</div> : null}
      </div></div>

      <Section title="Randevularım" sub={`${mine.length} talep`}>
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {mine.length === 0 ? <div style={{ padding: "20px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Henüz randevu talebin yok.</div>
            : mine.map((a) => <ApptRow key={a.id} a={a} />)}
        </div>
      </Section>

      <ApptRequestModal open={modal} onClose={() => setModal(false)} student={me} role={role} settings={s} />
    </div>
  );
}

function ApptRequestModal({ open, onClose, student, role, settings }) {
  const modes = allowedModes(settings);
  const [day, setDay] = useState("");
  const [slot, setSlot] = useState("");
  const [mode, setMode] = useState(modes[0] || "online");
  const [topic, setTopic] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => { if (open) { setDay(""); setSlot(""); setMode(modes[0] || "online"); setTopic(""); setDone(false); } }, [open]); // eslint-disable-line
  if (!open) return null;
  const days = APPT_DAYS.filter((d) => APPT_SLOTS.some((sl) => availModes(settings, d, sl).includes(mode)));
  const slots = day ? APPT_SLOTS.filter((sl) => availModes(settings, day, sl).includes(mode)) : [];
  const valid = day && slot && mode;
  const pickMode = (m) => { setMode(m); setDay(""); setSlot(""); };
  const submit = () => {
    if (!valid) return;
    addAppt({ student, day, slot, mode, topic: topic.trim(), byRole: role || "student" });
    if (typeof toast === "function") toast("Randevu talebin gönderildi — koç onayı bekleniyor", { icon: "calendar" });
    setDone(true); setTimeout(() => { setDone(false); onClose(); }, 1100);
  };
  return ReactDOM.createPortal((
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="row" style={{ gap: 9 }}><span className="stat-icon tone-primary" style={{ width: 36, height: 36 }}><Icon name="calendar" size={18} /></span><div><h3 style={{ fontSize: 16, fontWeight: 800 }}>Randevu İste</h3><div className="muted" style={{ fontSize: 12.5 }}>Koç Dilek Emen · müsait saatlerden seç</div></div></div>
          <button className="icon-btn" style={{ width: 36, height: 36 }} onClick={onClose} aria-label="Kapat"><Icon name="plus" size={18} style={{ transform: "rotate(45deg)" }} /></button>
        </div>
        <div className="modal-body" style={{ gap: 14 }}>
          <div className="field">
            <label className="label">Görüşme türü</label>
            {modes.length === 0 ? <div className="muted" style={{ fontSize: 12.5 }}>Koç şu an randevu kabul etmiyor.</div> : (
              <div className="seg" style={{ width: "fit-content", flexWrap: "wrap" }}>
                {modes.map((m) => <button key={m} type="button" className={mode === m ? "on" : ""} onClick={() => pickMode(m)}><Icon name={APPT_MODE[m].icon} size={15} />{APPT_MODE[m].label}</button>)}
              </div>
            )}
          </div>
          <div className="field">
            <label className="label">Gün <span className="muted" style={{ fontWeight: 500 }}>({APPT_MODE[mode] ? APPT_MODE[mode].label.toLocaleLowerCase("tr-TR") : ""} müsait günler)</span></label>
            <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
              {days.length === 0 ? <span className="muted" style={{ fontSize: 12.5 }}>Bu tür için müsait gün yok.</span> : days.map((d) => <button key={d} type="button" className={`type-chip${day === d ? " on" : ""}`} onClick={() => { setDay(d); setSlot(""); }}>{d}</button>)}
            </div>
          </div>
          {day ? (
            <div className="field">
              <label className="label">Saat</label>
              <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
                {slots.map((sl) => <button key={sl} type="button" className={`type-chip${slot === sl ? " on" : ""}`} onClick={() => setSlot(sl)}>{sl}</button>)}
              </div>
            </div>
          ) : null}
          <div className="field">
            <label className="label">Konu <span className="muted" style={{ fontWeight: 500 }}>(ops.)</span></label>
            <input className="input" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="ör. Türev sorularında takılıyorum" />
          </div>
        </div>
        <div className="modal-foot" style={{ justifyContent: "flex-end" }}>
          <button className="btn btn-ghost" onClick={onClose}>Vazgeç</button>
          <button className="btn btn-primary" disabled={!valid} onClick={submit} style={{ opacity: valid ? 1 : 0.5 }}><Icon name={done ? "check" : "send"} size={16} />{done ? "Gönderildi" : "Talep Gönder"}</button>
        </div>
      </div>
    </div>
  ), document.body);
}

/* ---- Öğrenci notları (koç) ---- */
function StudentNotesCard({ student }) {
  const notes = useNotes(student);
  const [text, setText] = useState("");
  const [kind, setKind] = useState("gorusme");
  const sorted = [...notes].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  const add = () => { const t = text.trim(); if (!t) return; addNote(student, { text: t, kind }); setText(""); };
  return (
    <Section title="Öğrenci Notları" sub="Görüşme notların, uyarılar ve hatırlatmalar" action={<Badge tone="muted" icon="notebook">{notes.length}</Badge>}>
      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, background: "var(--surface-3)", padding: 12, borderRadius: 12 }}>
          <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
            {Object.entries(NOTE_KINDS).map(([k, v]) => <button key={k} type="button" className={`type-chip${kind === k ? " on" : ""}`} onClick={() => setKind(k)}><Icon name={v.icon} size={13} />{v.label}</button>)}
          </div>
          <div className="row" style={{ gap: 8 }}>
            <input className="input" style={{ flex: 1 }} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") add(); }} placeholder="Not ekle veya uyarı yaz..." />
            <button className="btn btn-primary" disabled={!text.trim()} onClick={add} style={{ opacity: text.trim() ? 1 : 0.5 }}><Icon name="plus" size={16} />Ekle</button>
          </div>
        </div>
        {sorted.length === 0 ? <div style={{ padding: "10px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Henüz not yok.</div>
          : sorted.map((n) => {
            const k = NOTE_KINDS[n.kind] || NOTE_KINDS.genel;
            return (
              <div key={n.id} className="lrow" style={{ alignItems: "flex-start", borderColor: n.pinned ? "color-mix(in srgb, var(--warning) 40%, transparent)" : "var(--border)" }}>
                <span className="lr-icon" style={{ background: `var(--${k.tone}-soft)`, color: `var(--${k.tone})`, flexShrink: 0 }}><Icon name={k.icon} size={17} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, lineHeight: 1.45 }}>{n.text}</div>
                  <div className="lr-meta"><Badge tone={k.tone}>{k.label}</Badge><span className="d">{n.date}</span>{n.pinned ? <span className="d" style={{ color: "var(--warning)", fontWeight: 700 }}>📌 Sabit</span> : null}</div>
                </div>
                <div className="row" style={{ gap: 2 }}>
                  <button className="mini-btn" onClick={() => togglePin(student, n.id)} aria-label="Sabitle"><Icon name="star" size={15} fill={n.pinned} /></button>
                  <button className="mini-btn danger" onClick={() => removeNote(student, n.id)} aria-label="Sil"><Icon name="plus" size={15} style={{ transform: "rotate(45deg)" }} /></button>
                </div>
              </div>
            );
          })}
      </div>
    </Section>
  );
}

Object.assign(window, { CoachAppointmentsPage, StudentAppointmentsPage, StudentNotesCard, ApptRow });
