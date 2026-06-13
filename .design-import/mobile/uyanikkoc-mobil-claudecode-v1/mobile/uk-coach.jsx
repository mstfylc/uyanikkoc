/* Uyanık Koç mobil — Koç (coach) Faz 1: kabuk parçaları, Bugün (dashboard),
   Öğrencilerim listesi. .uk-m stil sistemini birebir kullanır. */

/* ---- Durum rozeti ---- */
function CStatusBadge({ status, small }) {
  const s = C_STATUS[status] || C_STATUS.ok;
  return <span className={`uk-badge ${s.tone}`} style={small ? { height: 22 } : null}>{s.label}</span>;
}

/* ---- Net mini sparkline (öğrenci satırı için) ---- */
function CSpark({ trend, color }) {
  if (!trend || trend.length < 2) return null;
  const max = Math.max(...trend.map((d) => d.v));
  const min = Math.min(...trend.map((d) => d.v));
  const rng = max - min || 1;
  const w = 52, h = 22;
  const pts = trend.map((d, i) => {
    const x = (i / (trend.length - 1)) * w;
    const y = h - ((d.v - min) / rng) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block", overflow: "visible" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={w} cy={h - ((trend[trend.length - 1].v - min) / rng) * h} r="2.6" fill={color} />
    </svg>
  );
}

/* ---- Öğrenci satırı (liste + ana sayfa) ---- */
function CStudentRow({ s, onOpen }) {
  const trendUp = s.trend && s.trend.length >= 2 && s.trend[s.trend.length - 1].v >= s.trend[0].v;
  const sparkColor = s.status === "risk" ? "var(--danger)" : trendUp ? "var(--success)" : "var(--muted)";
  return (
    <button className="uk-odev" onClick={() => onOpen(s.id)} style={{ alignItems: "center", width: "100%", textAlign: "left" }}>
      <span className="uk-avatar" style={{ width: 46, height: 46, fontSize: 15 }}>{s.initials}</span>
      <div className="body">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="ttl" style={{ fontSize: 15 }}>{s.name}</span>
          {s.status !== "ok" ? <CStatusBadge status={s.status} small /> : null}
        </div>
        <div className="uk-meta" style={{ marginTop: 5 }}>
          <span className="mi">{s.grade.split(" · ")[0]}</span>
          <span className="mi d">{s.status === "new" ? "Henüz başlamadı" : `%${s.completion} tamam`}</span>
          {s.status !== "new" ? <span className="mi d">{s.lastActive}</span> : null}
        </div>
      </div>
      {s.status === "new"
        ? <MIcon name="chevronRight" size={18} style={{ color: "var(--faint)" }} />
        : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0 }}>
            <CSpark trend={s.trend} color={sparkColor} />
            <span style={{ fontSize: 11, fontWeight: 800, color: "var(--text-2)" }} className="tnum">net {s.net}</span>
          </div>
        )}
    </button>
  );
}

/* ---- İnceleme kuyruğu kartı ---- */
function CReviewCard({ r, onApprove, onOpen }) {
  const c = M_SUBJECT_COLORS[r.subject] || "var(--primary)";
  return (
    <div className="uk-odev" style={{ alignItems: "center" }}>
      <span className="uk-avatar" style={{ width: 44, height: 44, fontSize: 14 }}>{r.initials}</span>
      <div className="body" onClick={() => onOpen(r.sid)} style={{ cursor: "pointer" }}>
        <div className="ttl" style={{ fontSize: 14 }}>{r.topic}</div>
        <div className="uk-meta" style={{ marginTop: 5 }}>
          <span className="uk-chip"><span className="sw" style={{ background: c }} />{r.subject}</span>
          <span className="mi d">{r.student}</span>
        </div>
        {r.result ? (
          <div className="uk-result" style={{ marginTop: 8 }}>
            <span style={{ color: "var(--success)" }}>✓ {r.result.d}</span>
            <span style={{ color: "var(--danger)" }}>✕ {r.result.y}</span>
            <span style={{ color: "var(--muted)" }}>○ {r.result.b}</span>
            <span className="uk-badge primary">net {mNet(r.result.d, r.result.y)}</span>
          </div>
        ) : <div style={{ marginTop: 7 }}><span className="uk-badge muted">Sonuç girilmedi · tamamlandı</span></div>}
      </div>
      <button className="uk-iconbtn" onClick={() => onApprove(r.id)} style={{ background: "var(--success)", color: "#fff", border: "none", width: 40, height: 40 }} title="Onayla"><MIcon name="check" size={20} /></button>
    </div>
  );
}

/* ---- Aktivite satırı ---- */
function CActivityRow({ a }) {
  const tone = a.tone;
  const bg = `var(--${tone}-soft)`, col = `var(--${tone === "primary" ? "primary-600" : tone})`;
  return (
    <div className="uk-notif">
      <span className="nic" style={{ background: bg, color: col }}><MIcon name={a.icon} size={18} /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="nt" style={{ fontSize: 13.5 }}>{a.who}</div>
        <div className="nd">{a.what}</div>
        <div className="ntime">{a.time}</div>
      </div>
    </div>
  );
}

/* ============================================================
   KOÇ — BUGÜN (dashboard)
   ============================================================ */
function CoachBugun({ go, openStudent, openThread, openAppts, openGlobal }) {
  const [reviews, setReviews] = useState(C_REVIEWS);
  const [notifOpen, setNotifOpen] = useState(false);
  const todayAppts = C_APPTS.filter((a) => a.day === C_TODAY);
  const active = C_STUDENTS.filter((s) => s.status !== "new");
  const riskCount = C_STUDENTS.filter((s) => s.status === "risk").length;
  const avgComp = Math.round(active.reduce((n, s) => n + s.completion, 0) / active.length);
  const unread = C_THREADS.reduce((n, t) => n + t.unread, 0);

  const approve = (id) => { setReviews(reviews.filter((r) => r.id !== id)); ukToast("Ödev onaylandı ✓"); };

  return (
    <div className="uk-scroll">
      <div className="uk-safe-top" />
      <div className="uk-head">
        <MAvatar name={C_COACH.name} initials={C_COACH.initials} size={46} avatarKey="me:coach" />
        <div>
          <div className="hi">Günaydın,</div>
          <div className="nm">{C_COACH.name}</div>
        </div>
        <div className="uk-head-actions">
          <button className="uk-iconbtn" onClick={() => setNotifOpen(true)}><MIcon name="bell" size={20} /><span className="dot" /></button>
        </div>
      </div>

      {/* özet hero */}
      <div className="uk-sec" style={{ marginTop: 4 }}>
        <div className="uk-hero">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div className="uk-badge" style={{ background: "rgba(255,255,255,.18)", color: "#fff" }}><MIcon name="calendar" size={13} /> 6 Haziran Cumartesi</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.85)" }}>{C_COACH.studentCount} öğrenci</div>
          </div>
          <h2 style={{ marginTop: 14 }}>Bugün {todayAppts.length} randevun var</h2>
          <p>{reviews.length} ödev incelemeni bekliyor · {unread} okunmamış mesaj</p>
          <button className="uk-hero-cta" onClick={openAppts}>Günü planla <MIcon name="chevronRight" size={15} /></button>
        </div>
      </div>

      {/* stat pills 2x2 */}
      <div className="uk-sec" style={{ marginTop: 16 }}>
        <div className="uk-stats">
          <button className="uk-card uk-stat" onClick={() => go("ogrenciler")} style={{ textAlign: "left" }}>
            <div className="lab"><span className="ic" style={{ background: "var(--primary-soft)", color: "var(--primary-600)" }}><MIcon name="users" size={15} /></span> Aktif öğrenci</div>
            <div className="val tnum">{active.length}</div>
            <div className="sub muted">{C_STUDENTS.length - active.length} yeni atanan</div>
          </button>
          <button className="uk-card uk-stat" onClick={() => go("ogrenciler")} style={{ textAlign: "left" }}>
            <div className="lab"><span className="ic" style={{ background: "var(--danger-soft)", color: "var(--danger)" }}><MIcon name="shield" size={15} /></span> Risk altında</div>
            <div className="val tnum" style={{ color: "var(--danger)" }}>{riskCount}</div>
            <div className="sub" style={{ color: "var(--danger)" }}>takip gerekiyor</div>
          </button>
          <div className="uk-card uk-stat">
            <div className="lab"><span className="ic" style={{ background: "var(--success-soft)", color: "var(--success)" }}><MIcon name="checkCircle" size={15} /></span> Ort. tamamlama</div>
            <div className="val tnum">%{avgComp}</div>
            <div className="sub" style={{ color: "var(--success)" }}>bu hafta</div>
          </div>
          <button className="uk-card uk-stat" onClick={openAppts} style={{ textAlign: "left" }}>
            <div className="lab"><span className="ic" style={{ background: "var(--info-soft)", color: "var(--info)" }}><MIcon name="calendar" size={15} /></span> Bugün randevu</div>
            <div className="val tnum">{todayAppts.length}</div>
            <div className="sub muted">sonraki 11:00</div>
          </button>
        </div>
      </div>

      {/* hızlı erişim */}
      <div className="uk-sec" style={{ marginTop: 22 }}>
        <div className="uk-sec-head"><h2>Hızlı erişim</h2></div>
        <div className="uk-qa">
          {[
            ["duyuru", "send", "Duyuru", "var(--primary-soft)", "var(--primary-600)"],
            ["gorevler", "checkCircle", "Görevler", "var(--success-soft)", "var(--success)"],
            ["deneme", "chart", "Deneme ata", "var(--info-soft)", "var(--info)"],
          ].map(([key, ic, label, bg, col]) => (
            <button key={key} onClick={() => openGlobal(key)}>
              <span className="qic" style={{ background: bg, color: col }}><MIcon name={ic} size={21} /></span>
              <span className="qn">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* bugünün randevuları */}
      <div className="uk-sec" style={{ marginTop: 22 }}>
        <div className="uk-sec-head"><h2>Bugünün randevuları</h2><button className="more" onClick={openAppts}>Takvim <MIcon name="chevronRight" size={14} /></button></div>
        {todayAppts.map((a) => {
          const modeTone = a.mode === "Online" ? "info" : a.mode === "Telefon" ? "warning" : "success";
          return (
            <button key={a.id} className="uk-odev" onClick={() => openStudent(a.sid)} style={{ alignItems: "center", width: "100%", textAlign: "left" }}>
              <div style={{ width: 52, textAlign: "center", flexShrink: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-.02em" }} className="tnum">{a.time}</div>
                <div style={{ fontSize: 10.5, fontWeight: 600, color: "var(--faint)" }}>{a.end}</div>
              </div>
              <div style={{ width: 1, alignSelf: "stretch", background: "var(--border)" }} />
              <div className="body">
                <div className="ttl" style={{ fontSize: 14 }}>{a.topic}</div>
                <div className="uk-meta" style={{ marginTop: 5 }}><span className="mi">{a.student}</span></div>
              </div>
              <span className={`uk-badge ${modeTone}`}>{a.mode}</span>
            </button>
          );
        })}
      </div>

      {/* inceleme kuyruğu */}
      {reviews.length > 0 && (
        <div className="uk-sec" style={{ marginTop: 22 }}>
          <div className="uk-sec-head"><h2>İnceleme kuyruğu <span style={{ color: "var(--muted)", fontWeight: 700 }}>· {reviews.length}</span></h2></div>
          {reviews.map((r) => <CReviewCard key={r.id} r={r} onApprove={approve} onOpen={openStudent} />)}
        </div>
      )}

      {/* görevler */}
      {(() => {
        const open = C_TASKS.filter((t) => !t.done);
        return (
          <div className="uk-sec" style={{ marginTop: 22 }}>
            <div className="uk-sec-head"><h2>Görevlerim <span style={{ color: "var(--muted)", fontWeight: 700 }}>· {open.length}</span></h2><button className="more" onClick={() => openGlobal("gorevler")}>Tümü <MIcon name="chevronRight" size={14} /></button></div>
            <div className="uk-card uk-card-pad" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {open.slice(0, 3).map((t) => {
                const pr = C_TASK_PRIORITY[t.priority];
                return (
                  <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 11 }}>
                    <span style={{ width: 22, height: 22, borderRadius: 7, border: "2px solid var(--border-strong)", flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.text}</div>
                      <div style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>{t.due}{t.student ? " · " + t.student : ""}</div>
                    </div>
                    <span className={`uk-badge ${pr.tone}`} style={{ flexShrink: 0 }}>{pr.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* son hareketler */}
      <div className="uk-sec" style={{ marginTop: 22 }}>
        <div className="uk-sec-head"><h2>Son hareketler</h2></div>
        <div className="uk-card uk-card-pad" style={{ paddingTop: 4, paddingBottom: 4 }}>
          {C_ACTIVITY.map((a, i) => <CActivityRow key={i} a={a} />)}
        </div>
      </div>
      <div style={{ height: 24 }} />
      {notifOpen && <CoachNotifSheet onClose={() => setNotifOpen(false)} />}
    </div>
  );
}

/* ============================================================
   KOÇ — ÖĞRENCİLERİM (liste + arama + filtre)
   ============================================================ */
function CoachOgrenciler({ openStudent }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all"); // all | risk | new | ok
  const filters = [
    { id: "all", label: "Tümü", n: C_STUDENTS.length },
    { id: "risk", label: "Risk", n: C_STUDENTS.filter((s) => s.status === "risk").length },
    { id: "ok", label: "Yolunda", n: C_STUDENTS.filter((s) => s.status === "ok").length },
    { id: "new", label: "Yeni", n: C_STUDENTS.filter((s) => s.status === "new").length },
  ];
  let list = C_STUDENTS;
  if (filter !== "all") list = list.filter((s) => s.status === filter);
  if (q.trim()) list = list.filter((s) => s.name.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <div className="uk-scroll">
      <div className="uk-safe-top" />
      <div className="uk-ptitle"><h1>Öğrencilerim</h1><p>{C_STUDENTS.length} öğrenci · {C_STUDENTS.filter((s) => s.status === "risk").length} risk altında</p></div>

      {/* arama */}
      <div className="uk-sec">
        <div className="uk-inputwrap" style={{ height: 48 }}>
          <MIcon name="user" size={17} style={{ color: "var(--faint)" }} />
          <input placeholder="Öğrenci ara…" value={q} onChange={(e) => setQ(e.target.value)} style={{ fontSize: 14.5 }} />
        </div>
      </div>

      {/* filtre segmentleri */}
      <div className="uk-segrow" style={{ marginTop: 12 }}>
        {filters.map((f) => (
          <button key={f.id} className={`uk-seg${filter === f.id ? " on" : ""}`} onClick={() => setFilter(f.id)}>
            {f.label} <span style={{ opacity: .7 }}>{f.n}</span>
          </button>
        ))}
      </div>

      {/* liste */}
      <div className="uk-sec" style={{ marginTop: 16, gap: 10 }}>
        {list.length === 0
          ? <div className="uk-card uk-card-pad" style={{ textAlign: "center", color: "var(--muted)", fontWeight: 600, fontSize: 13.5 }}>Eşleşen öğrenci yok</div>
          : list.map((s) => <CStudentRow key={s.id} s={s} onOpen={openStudent} />)}
      </div>
      <div style={{ height: 24 }} />
    </div>
  );
}

Object.assign(window, {
  CStatusBadge, CSpark, CStudentRow, CReviewCard, CActivityRow, CoachBugun, CoachOgrenciler,
});
