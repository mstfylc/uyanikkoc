/* Uyanık Koç mobil — Koç Faz 3+4: Bildirimler, Mesajlar (gelen kutusu + sohbet),
   Randevular, Profil ve kabuk (CoachShell + CoachTabBar). */

/* ============================================================
   KOÇ — BİLDİRİMLER (sheet)
   ============================================================ */
function CoachNotifSheet({ onClose }) {
  const toneBg = { primary: "var(--primary-soft)", success: "var(--success-soft)", warning: "var(--warning-soft)", info: "var(--info-soft)", danger: "var(--danger-soft)" };
  const toneFg = { primary: "var(--primary-600)", success: "var(--success)", warning: "var(--warning)", info: "var(--info)", danger: "var(--danger)" };
  return (
    <div className="uk-sheet-overlay" onClick={onClose}>
      <div className="uk-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="uk-grip" />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>Bildirimler</div>
          <button className="more" style={{ fontSize: 13, fontWeight: 700, color: "var(--primary-600)" }} onClick={() => { onClose(); ukToast("Tümü okundu işaretlendi"); }}>Tümünü okundu yap</button>
        </div>
        <div>
          {C_NOTIFS.map((n, i) => (
            <div key={i} className={`uk-notif${n.unread ? " unread" : ""}`}>
              <span className="nic" style={{ background: toneBg[n.tone], color: toneFg[n.tone] }}><MIcon name={n.icon} size={18} fill={n.icon === "flame"} /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="nt">{n.title}</div>
                <div className="nd">{n.desc}</div>
                <div className="ntime">{n.time}</div>
              </div>
            </div>
          ))}
        </div>
        <button className="uk-btn uk-btn-light uk-btn-block" style={{ marginTop: 14, height: 48, boxShadow: "none" }} onClick={onClose}>Kapat</button>
        <div style={{ height: 6 }} />
      </div>
    </div>
  );
}

/* ============================================================
   KOÇ — MESAJLAR (gelen kutusu)
   ============================================================ */
function CoachInbox({ openThread }) {
  const [q, setQ] = useState("");
  let list = C_THREADS;
  if (q.trim()) list = list.filter((t) => t.name.toLowerCase().includes(q.trim().toLowerCase()));
  const totalUnread = C_THREADS.reduce((n, t) => n + t.unread, 0);
  return (
    <div className="uk-scroll">
      <div className="uk-safe-top" />
      <div className="uk-ptitle"><h1>Mesajlar</h1><p>{C_THREADS.length} sohbet · {totalUnread} okunmamış</p></div>
      <div className="uk-sec">
        <div className="uk-inputwrap" style={{ height: 48 }}>
          <MIcon name="message" size={17} style={{ color: "var(--faint)" }} />
          <input placeholder="Sohbet ara…" value={q} onChange={(e) => setQ(e.target.value)} style={{ fontSize: 14.5 }} />
        </div>
      </div>
      <div className="uk-sec" style={{ marginTop: 14, gap: 0 }}>
        <div className="uk-list">
          {list.map((t) => (
            <button key={t.id} className="uk-li" onClick={() => openThread(t.id)} style={{ width: "100%", textAlign: "left", cursor: "pointer", alignItems: "flex-start", paddingBlock: 14 }}>
              <span className="uk-avatar" style={{ width: 46, height: 46, fontSize: 15, background: t.kind === "Veli" ? "linear-gradient(140deg,#8E87D6,#463DA6)" : null }}>{t.initials}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ fontSize: 14.5, fontWeight: 800, letterSpacing: "-.01em", whiteSpace: "nowrap" }}>{t.name}</span>
                  <span className="uk-badge muted" style={{ height: 19, fontSize: 10.5, padding: "0 7px" }}>{t.kind}</span>
                  <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--faint)", fontWeight: 600, flexShrink: 0 }}>{t.time}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <span style={{ fontSize: 13, color: t.unread ? "var(--text-2)" : "var(--muted)", fontWeight: t.unread ? 600 : 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{t.last}</span>
                  {t.unread ? <span style={{ minWidth: 18, height: 18, padding: "0 5px", borderRadius: 999, background: "var(--primary)", color: "#fff", fontSize: 10.5, fontWeight: 800, display: "grid", placeItems: "center", flexShrink: 0 }}>{t.unread}</span> : null}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div style={{ height: 24 }} />
    </div>
  );
}

/* ============================================================
   KOÇ — SOHBET
   ============================================================ */
function CoachThread({ thread, onBack }) {
  const [msgs, setMsgs] = useState(thread.msgs);
  const [val, setVal] = useState("");
  const endRef = useRef(null);
  const send = () => { const t = val.trim(); if (!t) return; setMsgs([...msgs, { from: "me", text: t, time: "16:50" }]); setVal(""); };
  useEffect(() => { if (endRef.current) endRef.current.scrollTop = endRef.current.scrollHeight; });
  return (
    <div className="uk-screen" style={{ position: "absolute", inset: 0 }}>
      <div className="uk-safe-top" />
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "2px 16px 12px", borderBottom: "1px solid var(--border)" }}>
        <button className="uk-iconbtn" onClick={onBack} style={{ width: 40, height: 40 }}><MIcon name="chevronLeft" size={20} /></button>
        <span className="uk-avatar" style={{ width: 40, height: 40, fontSize: 14, background: thread.kind === "Veli" ? "linear-gradient(140deg,#8E87D6,#463DA6)" : null }}>{thread.initials}</span>
        <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 15, fontWeight: 800 }}>{thread.name}</div><div style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 700 }}>{thread.kind}</div></div>
        <button className="uk-iconbtn" onClick={() => ukToast("Arama başlatılıyor…")} style={{ width: 40, height: 40 }}><MIcon name="phone" size={18} /></button>
      </div>
      <div className="uk-scroll" ref={endRef} style={{ padding: "16px 16px 8px", display: "flex", flexDirection: "column", gap: 10 }}>
        {msgs.length === 0 ? <div style={{ textAlign: "center", color: "var(--faint)", fontSize: 13, fontWeight: 600, marginTop: 40 }}>Henüz mesaj yok. İlk mesajı sen yaz.</div> : null}
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.from === "me" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "78%", padding: "10px 13px", borderRadius: m.from === "me" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: m.from === "me" ? "var(--primary)" : "var(--surface)", color: m.from === "me" ? "#fff" : "var(--text)", border: m.from === "me" ? "none" : "1px solid var(--border)", boxShadow: "var(--shadow-sm)", fontSize: 14, fontWeight: 500, lineHeight: 1.4 }}>
              {m.text}<div style={{ fontSize: 10, fontWeight: 600, marginTop: 4, opacity: .6, textAlign: "right" }}>{m.time}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, padding: "10px 16px calc(16px + env(safe-area-inset-bottom))", borderTop: "1px solid var(--border)", background: "var(--surface)" }}>
        <div className="uk-inputwrap" style={{ flex: 1, height: 48 }}><input placeholder="Mesaj yaz…" value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") send(); }} style={{ fontSize: 14 }} /></div>
        <button className="uk-iconbtn" style={{ width: 48, height: 48, background: "var(--primary)", color: "#fff", border: "none", borderRadius: 14 }} onClick={send}><MIcon name="send" size={19} /></button>
      </div>
    </div>
  );
}

/* ============================================================
   KOÇ — RANDEVULAR / PROGRAM
   ============================================================ */
function CoachProgram({ openStudent }) {
  const [appts, setAppts] = useState(C_APPTS);
  const act = (id, status) => { setAppts(appts.map((a) => a.id === id ? { ...a, status } : a)); ukToast(status === "onaylı" ? "Randevu onaylandı ✓" : "Randevu reddedildi"); };

  // güne göre grupla (sıra: bugünden ileri)
  const order = ["Cmt", "Paz", "Pzt", "Sal", "Çar", "Per", "Cum"];
  const groups = order.map((d) => ({ day: d, items: appts.filter((a) => a.day === d) })).filter((g) => g.items.length);
  const pendingCount = appts.filter((a) => a.status === "bekliyor").length;

  return (
    <div className="uk-scroll">
      <div className="uk-safe-top" />
      <div className="uk-ptitle" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div><h1>Program</h1><p>{appts.length} randevu · {pendingCount} onay bekliyor</p></div>
        <button className="uk-iconbtn" onClick={() => ukToast("Yeni randevu oluştur")} style={{ background: "var(--primary)", color: "#fff", border: "none" }}><MIcon name="plus" size={20} /></button>
      </div>

      {groups.map((g) => {
        const label = g.items[0].date;
        const isToday = g.day === C_TODAY;
        return (
          <div className="uk-sec" key={g.day} style={{ marginTop: 18 }}>
            <div className="uk-sec-head"><h2 style={{ fontSize: 15 }}>{label}{isToday ? <span style={{ marginLeft: 8, fontSize: 11.5, color: "var(--primary-600)", fontWeight: 800 }}>Bugün</span> : null}</h2></div>
            {g.items.map((a) => {
              const c = M_SUBJECT_COLORS[a.subject];
              const modeTone = a.mode === "Online" ? "info" : a.mode === "Telefon" ? "warning" : "success";
              const pending = a.status === "bekliyor";
              return (
                <div key={a.id} className="uk-odev" style={{ alignItems: "stretch", borderColor: pending ? "color-mix(in srgb, var(--warning) 40%, var(--border))" : "var(--border)" }}>
                  <div style={{ width: 50, textAlign: "center", flexShrink: 0, paddingTop: 2 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-.02em" }} className="tnum">{a.time}</div>
                    <div style={{ fontSize: 10.5, fontWeight: 600, color: "var(--faint)" }}>{a.end}</div>
                  </div>
                  <div style={{ width: 1, background: "var(--border)", flexShrink: 0 }} />
                  <div className="body" onClick={() => openStudent(a.sid)} style={{ cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="uk-avatar" style={{ width: 26, height: 26, fontSize: 11 }}>{a.initials}</span>
                      <span className="ttl" style={{ fontSize: 14 }}>{a.student}</span>
                    </div>
                    <div className="uk-meta" style={{ marginTop: 6 }}>
                      <span className={`uk-badge ${modeTone}`}>{a.mode}</span>
                      <span className="mi d">{a.topic}</span>
                    </div>
                    {pending ? (
                      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                        <button className="uk-btn uk-btn-primary" style={{ height: 34, flex: 1 }} onClick={(e) => { e.stopPropagation(); act(a.id, "onaylı"); }}><MIcon name="check" size={14} /> Onayla</button>
                        <button className="uk-btn uk-btn-light" style={{ height: 34, paddingInline: 14 }} onClick={(e) => { e.stopPropagation(); act(a.id, "reddedildi"); }}>Reddet</button>
                      </div>
                    ) : a.status === "onaylı" ? <div style={{ marginTop: 8 }}><span className="uk-badge success"><MIcon name="check" size={12} /> Onaylı</span></div>
                      : <div style={{ marginTop: 8 }}><span className="uk-badge danger">Reddedildi</span></div>}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
      <div style={{ height: 24 }} />
    </div>
  );
}

/* ============================================================
   KOÇ — PROFİL
   ============================================================ */
function CoachProfil({ onLogout, dark, setDark, openGlobal }) {
  const [notif, setNotif] = useState(true);
  const [pickAv, setPickAv] = useState(false);
  const [sheet, setSheet] = useState(null);
  return (
    <div className="uk-scroll">
      <div className="uk-safe-top" />
      <div className="uk-ptitle"><h1>Profil</h1></div>

      <div className="uk-sec">
        <div className="uk-card uk-card-pad" style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <MAvatarEditable name={C_COACH.name} initials={C_COACH.initials} size={62} avatarKey="me:coach" onOpen={() => setPickAv(true)} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{C_COACH.name}</div>
            <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>{C_COACH.title}</div>
          </div>
        </div>
      </div>

      {/* koç istatistikleri */}
      <div className="uk-sec" style={{ marginTop: 16 }}>
        <div className="uk-stats" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
          {[["users", "Öğrenci", C_COACH.studentCount, "var(--primary-soft)", "var(--primary-600)"],
            ["star", "Puan", C_COACH.rating, "var(--warning-soft)", "var(--warning)"],
            ["award", "Yıl", C_COACH.yearsExp, "var(--success-soft)", "var(--success)"]].map(([ic, l, v, bg, col]) => (
            <div className="uk-card uk-stat" key={l} style={{ padding: "14px 12px" }}>
              <span style={{ width: 30, height: 30, borderRadius: 9, display: "grid", placeItems: "center", background: bg, color: col }}><MIcon name={ic} size={16} fill={ic === "star"} /></span>
              <div className="val tnum" style={{ fontSize: 22, marginTop: 8 }}>{v}</div>
              <div className="sub muted">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* iletişim */}
      <div className="uk-sec" style={{ marginTop: 20 }}>
        <div className="uk-sec-head"><h2>Hesap</h2></div>
        <div className="uk-list">
          <div className="uk-li"><span className="lic" style={{ background: "var(--info-soft)", color: "var(--info)" }}><MIcon name="mail" size={17} /></span><span className="lt">E-posta</span><span className="lr">{C_COACH.email}</span></div>
          <div className="uk-li"><span className="lic" style={{ background: "var(--success-soft)", color: "var(--success)" }}><MIcon name="phone" size={17} /></span><span className="lt">Telefon</span><span className="lr">{C_COACH.phone}</span></div>
          <div className="uk-li" onClick={() => ukToast("Kadro yönetimi")} style={{ cursor: "pointer" }}><span className="lic" style={{ background: "var(--primary-soft)", color: "var(--primary-600)" }}><MIcon name="users" size={17} /></span><span className="lt">Kadro yönetimi</span><MIcon name="chevronRight" size={18} style={{ color: "var(--faint)" }} /></div>
        </div>
      </div>

      {/* ayarlar */}
      <div className="uk-sec" style={{ marginTop: 22 }}>
        <div className="uk-sec-head"><h2>Ayarlar</h2></div>
        <div className="uk-list">
          <div className="uk-li" onClick={() => setPickAv(true)} style={{ cursor: "pointer" }}>
            <span className="lic" style={{ background: "var(--primary-soft)", color: "var(--primary-600)" }}><MIcon name="user" size={17} /></span>
            <span className="lt">Profil fotoğrafı</span><span className="lr">ikon / foto</span><MIcon name="chevronRight" size={18} style={{ color: "var(--faint)" }} />
          </div>
          <div className="uk-li">
            <span className="lic" style={{ background: "var(--warning-soft)", color: "var(--warning)" }}><MIcon name="bell" size={17} /></span>
            <span className="lt">Bildirimler</span><button className={`uk-switch${notif ? " on" : ""}`} onClick={() => setNotif(!notif)}><span /></button>
          </div>
          <div className="uk-li">
            <span className="lic" style={{ background: "var(--surface-3)", color: "var(--text-2)" }}><MIcon name="moon" size={17} /></span>
            <span className="lt">Koyu tema</span><button className={`uk-switch${dark ? " on" : ""}`} onClick={() => setDark(!dark)}><span /></button>
          </div>
          <div className="uk-li" onClick={() => setSheet("sifre")} style={{ cursor: "pointer" }}>
            <span className="lic" style={{ background: "var(--surface-3)", color: "var(--text-2)" }}><MIcon name="shield" size={17} /></span>
            <span className="lt">Şifre & Güvenlik</span><MIcon name="chevronRight" size={18} style={{ color: "var(--faint)" }} />
          </div>
          <div className="uk-li" onClick={() => openGlobal("destek")} style={{ cursor: "pointer" }}>
            <span className="lic" style={{ background: "var(--primary-soft)", color: "var(--primary-600)" }}><MIcon name="help" size={17} /></span>
            <span className="lt">Yardım & Destek</span><MIcon name="chevronRight" size={18} style={{ color: "var(--faint)" }} />
          </div>
        </div>
      </div>

      <div className="uk-sec" style={{ marginTop: 16 }}>
        <button className="uk-btn uk-btn-light uk-btn-block" style={{ color: "var(--danger)", height: 50 }} onClick={onLogout}><MIcon name="logout" size={18} /> Çıkış Yap</button>
      </div>
      <div style={{ textAlign: "center", fontSize: 11.5, color: "var(--faint)", fontWeight: 600, marginTop: 16 }}>Uyanık Koç · Koç · Sürüm 1.0.0</div>
      <div style={{ height: 24 }} />
      {pickAv && <MAvatarPickerSheet name={C_COACH.name} avatarKey="me:coach" onClose={() => setPickAv(false)} />}
      {sheet === "sifre" && <SifreSheet onClose={() => setSheet(null)} />}
    </div>
  );
}

/* ============================================================
   KOÇ — TAB BAR + KABUK
   ============================================================ */
function CoachTabBar({ active, go, unread }) {
  const tabs = [
    { id: "bugun", label: "Bugün", icon: "home" },
    { id: "ogrenciler", label: "Öğrenciler", icon: "users" },
    { id: "mesajlar", label: "Mesajlar", icon: "message", count: unread },
    { id: "program", label: "Program", icon: "calendar" },
    { id: "profil", label: "Profil", icon: "user" },
  ];
  return (
    <div className="uk-tabbar">
      {tabs.map((t) => (
        <button key={t.id} className={`uk-tab${active === t.id ? " on" : ""}`} onClick={() => go(t.id)}>
          {t.count ? <span className="tabcount">{t.count}</span> : null}
          <MIcon name={t.icon} size={24} fill={active === t.id} stroke={active === t.id ? 0 : 2} />
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

function CoachShell({ dark, setDark, onLogout }) {
  const [tab, setTab] = useState("bugun");
  const [detail, setDetail] = useState(null);   // öğrenci id
  const [thread, setThread] = useState(null);   // thread obj
  const [global, setGlobal] = useState(null);   // duyuru | gorevler | deneme
  const unread = C_THREADS.reduce((n, t) => n + t.unread, 0);

  const openStudent = (id) => setDetail(id);
  const openThreadById = (tid) => { const t = C_THREADS.find((x) => x.id === tid); if (t) setThread(t); };
  const openThreadForStudent = (sid) => {
    const s = cStudent(sid);
    let t = C_THREADS.find((x) => x.sid === sid);
    if (!t) t = { id: "tmp-" + sid, sid, name: s.name, initials: s.initials, kind: "Öğrenci", msgs: [] };
    setThread(t);
  };
  const openAppts = () => { setDetail(null); setThread(null); setTab("program"); };
  const onAppt = () => { setDetail(null); setTab("program"); };

  if (thread) return <CoachThread thread={thread} onBack={() => setThread(null)} />;
  if (detail) return <StudentDetail sid={detail} onBack={() => setDetail(null)} onMessage={openThreadForStudent} onAppt={onAppt} />;
  if (global === "duyuru") return <AnnouncementScreen onBack={() => setGlobal(null)} />;
  if (global === "gorevler") return <TasksScreen onBack={() => setGlobal(null)} openStudent={(id) => { setGlobal(null); setDetail(id); }} />;
  if (global === "deneme") return <ExamAssignScreen onBack={() => setGlobal(null)} />;
  if (global === "destek") return <DestekScreen role="coach" onBack={() => setGlobal(null)} />;

  return (
    <div className="uk-screen" data-screen-label={"koc-" + tab}>
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }} key={tab}>
        {tab === "bugun" && <CoachBugun go={setTab} openStudent={openStudent} openThread={openThreadForStudent} openAppts={openAppts} openGlobal={setGlobal} />}
        {tab === "ogrenciler" && <CoachOgrenciler openStudent={openStudent} />}
        {tab === "mesajlar" && <CoachInbox openThread={openThreadById} />}
        {tab === "program" && <CoachProgram openStudent={openStudent} />}
        {tab === "profil" && <CoachProfil onLogout={onLogout} dark={dark} setDark={setDark} openGlobal={setGlobal} />}
      </div>
      <CoachTabBar active={tab} go={setTab} unread={unread} />
    </div>
  );
}

Object.assign(window, {
  CoachNotifSheet, CoachInbox, CoachThread, CoachProgram, CoachProfil, CoachTabBar, CoachShell,
});
