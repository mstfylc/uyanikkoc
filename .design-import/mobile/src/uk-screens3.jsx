/* Uyanık Koç mobil — ek öğrenci özellikleri: Konu Takibi, Kaynaklarım,
   Randevular, Mesajlaşma, Motivasyon. Hepsi geri butonlu alt-ekran. */

function SubHeader({ title, sub, onBack, action }) {
  return (
    <>
      <div style={{ padding: "4px 16px 0" }}>
        <button className="uk-iconbtn" onClick={onBack} style={{ width: 40, height: 40 }}><MIcon name="chevronLeft" size={20} /></button>
      </div>
      <div className="uk-ptitle" style={{ paddingTop: 8, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: 24, whiteSpace: "nowrap" }}>{title}</h1>
          {sub ? <p>{sub}</p> : null}
        </div>
        {action || null}
      </div>
    </>
  );
}

/* ============================================================
   KONU TAKİBİ
   ============================================================ */
function KonuScreen({ onBack }) {
  const subjects = Object.keys(M_TOPICS);
  const [active, setActive] = useState(subjects[1]); // Matematik
  const list = M_TOPICS[active];
  const c = M_SUBJECT_COLORS[active] || "var(--primary)";
  const done = list.filter((t) => t.s === "done").length;
  const prog = list.filter((t) => t.s === "progress").length;
  const pct = Math.round((done / list.length) * 100);

  return (
    <div className="uk-scroll">
      <div className="uk-safe-top" />
      <SubHeader title="Konu Takibi" sub={`${active} · %${pct} tamamlandı`} onBack={onBack} />

      <div className="uk-segrow">
        {subjects.map((s) => (
          <button key={s} className={`uk-seg${active === s ? " on" : ""}`} onClick={() => setActive(s)}
            style={active === s ? { background: M_SUBJECT_COLORS[s], borderColor: M_SUBJECT_COLORS[s] } : {}}>
            <span className="sw" style={{ width: 8, height: 8, borderRadius: 3, background: active === s ? "#fff" : M_SUBJECT_COLORS[s], display: "inline-block" }} />{s}
          </button>
        ))}
      </div>

      <div className="uk-sec" style={{ marginTop: 16 }}>
        <div className="uk-card uk-card-pad">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)" }}>{done} bitti · {prog} devam · {list.length - done - prog} başlanmadı</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: c }} className="tnum">%{pct}</div>
          </div>
          <div className="uk-bar"><span style={{ width: pct + "%", background: c }} /></div>
        </div>
      </div>

      <div className="uk-sec" style={{ marginTop: 14, gap: 8 }}>
        {list.map((t) => {
          const st = M_TOPIC_STATUS[t.s];
          return (
            <div className="uk-odev" key={t.n} style={{ alignItems: "center", padding: "13px 14px" }}>
              <span className="ic" style={{ width: 36, height: 36, background: t.s === "done" ? "var(--success-soft)" : t.s === "progress" ? "var(--warning-soft)" : "var(--surface-3)", color: t.s === "done" ? "var(--success)" : t.s === "progress" ? "var(--warning)" : "var(--faint)" }}>
                <MIcon name={t.s === "done" ? "checkCircle" : t.s === "progress" ? "clock" : "book"} size={18} />
              </span>
              <div className="body">
                <div className="ttl" style={{ fontSize: 14 }}>{t.n}</div>
                {t.s === "progress" ? (
                  <div className="uk-bar" style={{ height: 6, marginTop: 8 }}><span style={{ width: (t.p || 0) + "%", background: c }} /></div>
                ) : null}
              </div>
              <span className={`uk-badge ${st.tone}`}>{t.s === "progress" ? `%${t.p}` : st.label}</span>
            </div>
          );
        })}
      </div>
      <div style={{ height: 24 }} />
    </div>
  );
}

/* ============================================================
   KAYNAKLARIM
   ============================================================ */
function KaynaklarimScreen({ onBack }) {
  const [mine, setMine] = useState(M_SOURCES);
  const [adding, setAdding] = useState(false);
  const has = (n) => mine.some((m) => m.name === n);
  const add = (k) => { if (!has(k.name)) setMine([...mine, k]); };
  const remove = (n) => setMine(mine.filter((m) => m.name !== n));

  return (
    <div className="uk-scroll">
      <div className="uk-safe-top" />
      <SubHeader title="Kaynaklarım" sub={`${mine.length} kaynak · koçun ödev atarken bunlardan seçer`} onBack={onBack}
        action={<button className="uk-btn uk-btn-primary" onClick={() => setAdding(true)}><MIcon name="plus" size={15} /> Ekle</button>} />

      <div className="uk-sec" style={{ marginTop: 8, gap: 8 }}>
        {mine.map((s) => {
          const tur = M_KAYNAK_TUR[s.tur] || M_KAYNAK_TUR.soru;
          const c = M_SUBJECT_COLORS[s.subj] || "var(--primary)";
          return (
            <div className="uk-odev" key={s.name} style={{ alignItems: "center", padding: "13px 14px" }}>
              <span className="ic" style={{ width: 38, height: 38, background: `color-mix(in srgb, ${c} 13%, transparent)`, color: c }}><MIcon name={tur.icon} size={18} /></span>
              <div className="body">
                <div className="ttl" style={{ fontSize: 14 }}>{s.name}</div>
                <div className="uk-meta" style={{ marginTop: 5 }}>
                  <span className="mi">{s.subj}</span><span className="mi d">{tur.label}</span>
                </div>
              </div>
              <button className="uk-iconbtn" style={{ width: 34, height: 34, boxShadow: "none", color: "var(--faint)" }} onClick={() => remove(s.name)}>
                <MIcon name="plus" size={16} style={{ transform: "rotate(45deg)" }} />
              </button>
            </div>
          );
        })}
      </div>

      {adding && (
        <div className="uk-sheet-overlay" onClick={() => setAdding(false)}>
          <div className="uk-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="uk-grip" />
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Katalogdan ekle</div>
            <div style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600, marginBottom: 14 }}>Bilinen yayınevi kitaplarından seç</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {M_CATALOG.map((k) => {
                const tur = M_KAYNAK_TUR[k.tur] || M_KAYNAK_TUR.soru;
                const on = has(k.name);
                return (
                  <button key={k.name} onClick={() => add(k)} disabled={on} className="uk-odev" style={{ alignItems: "center", padding: "12px 14px", width: "100%", textAlign: "left", opacity: on ? .55 : 1 }}>
                    <span className="ic" style={{ width: 36, height: 36, background: "var(--surface-3)", color: "var(--text-2)" }}><MIcon name={tur.icon} size={17} /></span>
                    <div className="body"><div className="ttl" style={{ fontSize: 13.5 }}>{k.name}</div><div className="uk-meta" style={{ marginTop: 4 }}><span className="mi">{k.subj}</span><span className="mi d">{tur.label}</span></div></div>
                    <span className={`uk-badge ${on ? "success" : "primary"}`}>{on ? <><MIcon name="check" size={12} /> Eklendi</> : "Ekle"}</span>
                  </button>
                );
              })}
            </div>
            <button className="uk-btn uk-btn-light uk-btn-block" style={{ marginTop: 14, height: 48, boxShadow: "none" }} onClick={() => setAdding(false)}>Bitti</button>
          </div>
        </div>
      )}
      <div style={{ height: 24 }} />
    </div>
  );
}

/* ============================================================
   RANDEVULAR
   ============================================================ */
function RandevularScreen({ onBack }) {
  const [mode, setMode] = useState("Yüz yüze");
  const [picked, setPicked] = useState(null);
  const [booked, setBooked] = useState(false);

  return (
    <div className="uk-scroll">
      <div className="uk-safe-top" />
      <SubHeader title="Randevular" sub="Koçunla görüşme planla" onBack={onBack} />

      <div className="uk-sec">
        <div className="uk-sec-head"><h2>Yaklaşan</h2></div>
        {M_APPTS.map((a) => (
          <div className="uk-odev" key={a.id} style={{ alignItems: "center" }}>
            <span className="ic" style={{ background: "var(--primary-soft)", color: "var(--primary-600)" }}><MIcon name={a.mode === "Online" ? "ai" : a.mode === "Telefon" ? "phone" : "users"} size={19} /></span>
            <div className="body">
              <div className="ttl" style={{ fontSize: 14 }}>{a.topic}</div>
              <div className="uk-meta" style={{ marginTop: 6 }}>
                <span className="uk-badge muted"><MIcon name="calendar" size={12} /> {a.date}</span>
                <span className="mi">{a.time} · {a.mode}</span>
              </div>
            </div>
            <span className={`uk-badge ${a.status === "onaylı" ? "success" : "warning"}`}>{a.status}</span>
          </div>
        ))}
      </div>

      <div className="uk-sec" style={{ marginTop: 22 }}>
        <div className="uk-sec-head"><h2>Yeni randevu</h2></div>
        <div className="uk-card uk-card-pad">
          <div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--text-2)", marginBottom: 8 }}>Görüşme türü</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
            {M_APPT_MODES.map((m) => (
              <button key={m} className={`uk-seg${mode === m ? " on" : ""}`} style={{ flex: 1, justifyContent: "center" }} onClick={() => setMode(m)}>
                <MIcon name={m === "Online" ? "ai" : m === "Telefon" ? "phone" : "users"} size={15} /> {m}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--text-2)", marginBottom: 8 }}>Müsait slotlar</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {M_APPT_SLOTS.map((d) => (
              <div key={d.day}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", marginBottom: 7 }}>{M_DAYS_FULL[d.day]}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {d.times.map((t) => {
                    const id = d.day + t; const on = picked === id;
                    return <button key={t} className={`uk-seg${on ? " on" : ""}`} style={{ height: 38 }} onClick={() => { setPicked(id); setBooked(false); }}>{t}</button>;
                  })}
                </div>
              </div>
            ))}
          </div>
          <button className="uk-btn uk-btn-primary uk-btn-block" style={{ marginTop: 18, background: booked ? "var(--success)" : undefined }} disabled={!picked} onClick={() => setBooked(true)}>
            <MIcon name={booked ? "check" : "calendar"} size={18} /> {booked ? "Randevu talebi gönderildi" : "Randevu İste"}
          </button>
        </div>
      </div>
      <div style={{ height: 24 }} />
    </div>
  );
}

/* ============================================================
   MESAJLAŞMA (koç ile)
   ============================================================ */
function MesajScreen({ onBack }) {
  const [msgs, setMsgs] = useState(M_MESSAGES);
  const [val, setVal] = useState("");
  const endRef = useRef(null);
  const send = () => {
    const t = val.trim(); if (!t) return;
    setMsgs([...msgs, { from: "me", text: t, time: "09:24" }]);
    setVal("");
  };
  useEffect(() => { if (endRef.current) endRef.current.scrollTop = endRef.current.scrollHeight; });

  return (
    <div className="uk-screen" style={{ position: "absolute", inset: 0 }}>
      <div className="uk-safe-top" />
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "2px 16px 12px", borderBottom: "1px solid var(--border)" }}>
        <button className="uk-iconbtn" onClick={onBack} style={{ width: 40, height: 40 }}><MIcon name="chevronLeft" size={20} /></button>
        <span className="uk-avatar" style={{ width: 40, height: 40, fontSize: 14, background: "linear-gradient(140deg,#8E87D6,#463DA6)" }}>DE</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 800 }}>{M_STUDENT.coach}</div>
          <div style={{ fontSize: 11.5, color: "var(--success)", fontWeight: 700 }}>● Çevrimiçi</div>
        </div>
      </div>

      <div className="uk-scroll" ref={endRef} style={{ padding: "16px 16px 8px", display: "flex", flexDirection: "column", gap: 10 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.from === "me" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "78%", padding: "10px 13px", borderRadius: m.from === "me" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: m.from === "me" ? "var(--primary)" : "var(--surface)", color: m.from === "me" ? "#fff" : "var(--text)", border: m.from === "me" ? "none" : "1px solid var(--border)", boxShadow: "var(--shadow-sm)", fontSize: 14, fontWeight: 500, lineHeight: 1.4 }}>
              {m.text}
              <div style={{ fontSize: 10, fontWeight: 600, marginTop: 4, opacity: .6, textAlign: "right" }}>{m.time}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, padding: "10px 16px calc(16px + env(safe-area-inset-bottom))", borderTop: "1px solid var(--border)", background: "var(--surface)" }}>
        <div className="uk-inputwrap" style={{ flex: 1, height: 48 }}>
          <input placeholder="Mesaj yaz…" value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") send(); }} style={{ fontSize: 14 }} />
        </div>
        <button className="uk-iconbtn" style={{ width: 48, height: 48, background: "var(--primary)", color: "#fff", border: "none", borderRadius: 14 }} onClick={send}><MIcon name="send" size={19} /></button>
      </div>
    </div>
  );
}

/* ============================================================
   MOTİVASYON + KOÇ DEĞERLENDİRME
   ============================================================ */
function MotivasyonScreen({ onBack }) {
  const [stars, setStars] = useState(5);
  const [sent, setSent] = useState(false);
  return (
    <div className="uk-scroll">
      <div className="uk-safe-top" />
      <SubHeader title="Motivasyon" sub="Koçundan günün notu" onBack={onBack} />

      <div className="uk-sec">
        <div className="uk-hero" style={{ borderRadius: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <span style={{ width: 38, height: 38, borderRadius: 11, display: "grid", placeItems: "center", background: "rgba(255,255,255,.18)" }}><MIcon name="heart" size={19} fill /></span>
            <div><div style={{ fontSize: 13, fontWeight: 800 }}>{M_MOTIVATION.coach}</div><div style={{ fontSize: 11.5, color: "rgba(255,255,255,.8)", fontWeight: 600 }}>{M_MOTIVATION.date}</div></div>
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.5 }}>{M_MOTIVATION.body}</div>
        </div>
      </div>

      <div className="uk-sec" style={{ marginTop: 22 }}>
        <div className="uk-sec-head"><h2>Koçunu değerlendir</h2></div>
        <div className="uk-card uk-card-pad" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 13.5, color: "var(--text-2)", fontWeight: 600, marginBottom: 14 }}>Koçluk desteğinden ne kadar memnunsun?</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 16 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => { setStars(n); setSent(false); }} style={{ color: n <= stars ? "var(--warning)" : "var(--border-strong)" }}>
                <MIcon name="star" size={34} fill={n <= stars} />
              </button>
            ))}
          </div>
          <button className="uk-btn uk-btn-primary uk-btn-block" style={{ background: sent ? "var(--success)" : undefined }} onClick={() => setSent(true)}>
            <MIcon name={sent ? "check" : "send"} size={17} /> {sent ? "Değerlendirmen gönderildi" : "Gönder"}
          </button>
        </div>
      </div>
      <div style={{ height: 24 }} />
    </div>
  );
}

Object.assign(window, { SubHeader, KonuScreen, KaynaklarimScreen, RandevularScreen, MesajScreen, MotivasyonScreen });
