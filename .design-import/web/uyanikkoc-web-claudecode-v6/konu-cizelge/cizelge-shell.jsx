/* Koç paneli kabuğu — Yıllık Çizelge entegrasyonu (iki yöntem birlikte):
   1) Konu Takibi sayfasının tablo bölümünde "Liste / Çizelge" anahtarı (gömülü)
   2) Sol menüde ayrı "Yıllık Çizelge" ekranı (tam-ekran) */

const CIZ_NAV = [
  { key: "dashboard", label: "Dashboard", icon: "dashboard" },
  { key: "students", label: "Öğrencilerim", icon: "users" },
  { key: "konu", label: "Konu Takibi", icon: "book" },
  { key: "cizelge", label: "Yıllık Çizelge", icon: "notebook", tag: "Yeni" },
  { key: "exams", label: "Denemeler", icon: "chart" },
  { key: "odev", label: "Ödev & Görev", icon: "clipboard" },
  { key: "mesaj", label: "Mesajlar", icon: "message" },
  { key: "randevu", label: "Randevular", icon: "calendar" },
];

/* ---- Liste görünümü (mevcut basit tablo) ---- */
function ListeView({ subj }) {
  const ALL0 = React.useMemo(() => cizBuildAll(), []);
  const rows = React.useMemo(() => {
    return CIZ_CURR[subj].map((g) => ({
      grup: g.grup,
      konular: g.konular.map((t) => {
        const arr = ALL0[subj][t];
        const s = arr.reduce((a, x) => a + x.soru, 0), d = arr.reduce((a, x) => a + x.dogru, 0), n = arr.length;
        const r = s ? d / s : 0;
        const status = n === 0 ? "todo" : r >= 0.78 && n >= 5 ? "done" : "progress";
        return { t, s, d, n, r, status };
      }),
    }));
  }, [subj, ALL0]);

  const STA = {
    done: { label: "Tamamlandı", tone: "success", icon: "checkCircle" },
    progress: { label: "Devam ediyor", tone: "warning", icon: "clock" },
    todo: { label: "Başlanmadı", tone: "muted", icon: "book" },
  };

  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table className="tbl" style={{ minWidth: 640 }}>
          <thead><tr>
            <th>Konu</th>
            <th style={{ textAlign: "center" }}>Oturum</th>
            <th style={{ textAlign: "center" }}>Soru</th>
            <th style={{ textAlign: "center" }}>Doğru</th>
            <th style={{ width: 150 }}>Doğru oranı</th>
            <th style={{ textAlign: "right" }}>Durum</th>
          </tr></thead>
          <tbody>
            {rows.map((g) => (
              <React.Fragment key={g.grup}>
                <tr style={{ background: "var(--surface-3)" }}>
                  <td colSpan="6" style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--text-2)", padding: "8px 16px" }}>{g.grup}<span style={{ color: "var(--faint)", marginLeft: 8 }}>{g.konular.length} konu</span></td>
                </tr>
                {g.konular.map((r) => {
                  const cfg = STA[r.status];
                  const fg = r.r >= 0.85 ? "var(--success)" : r.r >= 0.70 ? "#2F7A4E" : r.r >= 0.55 ? "var(--warning)" : "var(--danger)";
                  return (
                    <tr key={r.t}>
                      <td><div className="row" style={{ gap: 10 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: r.status === "done" ? "var(--success)" : r.status === "progress" ? "var(--warning)" : "var(--faint)", flexShrink: 0 }} /><b style={{ fontSize: 13, fontWeight: 700 }}>{r.t}</b></div></td>
                      <td style={{ textAlign: "center" }}><span className="tnum muted" style={{ fontSize: 12.5, fontWeight: 700 }}>{r.n || "—"}</span></td>
                      <td style={{ textAlign: "center" }}><span className="tnum" style={{ fontWeight: 700 }}>{r.s || "—"}</span></td>
                      <td style={{ textAlign: "center" }}><span className="tnum" style={{ fontWeight: 800, color: r.d ? "var(--success)" : "var(--faint)" }}>{r.d || "—"}</span></td>
                      <td>
                        {r.n ? (
                          <div className="row" style={{ gap: 9 }}>
                            <div style={{ flex: 1, height: 6, borderRadius: 999, background: "var(--surface-3)", overflow: "hidden" }}><span style={{ display: "block", height: "100%", width: `${Math.round(r.r * 100)}%`, background: fg, borderRadius: 999 }} /></div>
                            <span className="tnum" style={{ fontSize: 12, fontWeight: 800, color: fg, minWidth: 34, textAlign: "right" }}>%{Math.round(r.r * 100)}</span>
                          </div>
                        ) : <span className="muted" style={{ fontSize: 12 }}>—</span>}
                      </td>
                      <td style={{ textAlign: "right" }}><span className={"badge badge-" + cfg.tone}><Icon name={cfg.icon} size={13} />{cfg.label}</span></td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---- Konu Tablosu bölümü: paylaşımlı ders sekmeleri + Liste/Çizelge anahtarı ---- */
function KonuTabloSection() {
  const subjects = Object.keys(CIZ_CURR);
  const [subj, setSubj] = React.useState(subjects[0]);
  const [mode, setMode] = React.useState("cizelge");

  return (
    <div className="stack" style={{ gap: 14 }}>
      <div className="between" style={{ flexWrap: "wrap", gap: 12 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-.015em" }}>Konu Tablosu</h3>
          <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>Ders bazında konu ilerlemesi · iki görünüm</div>
        </div>
        <div className="seg">
          <button className={mode === "liste" ? "on" : ""} onClick={() => setMode("liste")}><Icon name="clipboard" size={15} />Liste</button>
          <button className={mode === "cizelge" ? "on" : ""} onClick={() => setMode("cizelge")}><Icon name="notebook" size={15} />Çizelge</button>
        </div>
      </div>

      {/* shared subject tabs */}
      <div className="cz-tabs">
        {subjects.map((s) => {
          const on = s === subj; const c = CIZ_SUBJ_COLOR[s];
          const nTopics = CIZ_CURR[s].reduce((a, g) => a + g.konular.length, 0);
          return (
            <button key={s} className={"cz-tab" + (on ? " on" : "")} style={on ? { background: c } : {}} onClick={() => setSubj(s)}>
              {!on && <span className="sw" style={{ background: c }} />}{s}<span className="ct">{nTopics}</span>
            </button>
          );
        })}
      </div>

      {mode === "liste"
        ? <ListeView subj={subj} />
        : <KonuCizelge hideTabs subj={subj} onSubj={setSubj} maxHeight="58vh" showTip={false} />}

      {mode === "cizelge" && (
        <p className="muted" style={{ fontSize: 12 }}>
          <b style={{ color: "var(--text-2)" }}>İpucu:</b> Tekrar görünümünde hücreye tıklayıp soru/doğru gir; boş hücre yeni oturum ekler. Günlük/Haftalık'ta hücre tıklanınca kırılım açılır.
        </p>
      )}
    </div>
  );
}

/* ---- üst istatistik kartları ---- */
function StatRow() {
  const st = React.useMemo(() => {
    const ALL = cizBuildAll();
    let totalTopics = 0, doneTopics = 0, soru = 0, dogru = 0;
    Object.keys(ALL).forEach((subj) => Object.keys(ALL[subj]).forEach((t) => {
      const arr = ALL[subj][t]; totalTopics++;
      const s = arr.reduce((a, x) => a + x.soru, 0), d = arr.reduce((a, x) => a + x.dogru, 0);
      soru += s; dogru += d;
      if (arr.length >= 5 && (s ? d / s : 0) >= 0.78) doneTopics++;
    }));
    return { totalTopics, doneTopics, soru, pct: Math.round((doneTopics / totalTopics) * 100), ort: soru ? Math.round((dogru / soru) * 100) : 0 };
  }, []);
  const cards = [
    { icon: "book", tone: "primary", value: `%${st.pct}`, label: "Genel konu tamamlama" },
    { icon: "checkCircle", tone: "success", value: `${st.doneTopics}/${st.totalTopics}`, label: "Tamamlanan konu" },
    { icon: "notebook", tone: "info", value: st.soru.toLocaleString("tr-TR"), label: "Çözülen soru" },
    { icon: "target", tone: "warning", value: `%${st.ort}`, label: "Ortalama doğru oranı" },
  ];
  const toneBg = { primary: "var(--primary-soft)", success: "var(--success-soft)", info: "var(--info-soft)", warning: "var(--warning-soft)" };
  const toneFg = { primary: "var(--primary-600)", success: "var(--success)", info: "var(--info)", warning: "var(--warning)" };
  return (
    <div className="grid g-4">
      {cards.map((c) => (
        <div className="card stat" key={c.label}><div className="card-pad">
          <div className="stat-top"><span className="stat-icon" style={{ background: toneBg[c.tone], color: toneFg[c.tone] }}><Icon name={c.icon} size={22} /></span></div>
          <div><div className="stat-value">{c.value}</div><div className="stat-label">{c.label}</div></div>
        </div></div>
      ))}
    </div>
  );
}

/* ---- Konu Takibi sayfası (entegre) ---- */
function KonuTakibiPage() {
  return (
    <div className="stack">
      <div className="between" style={{ flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.025em" }}>Konu Takibi</h1>
          <p className="muted" style={{ fontSize: 13, marginTop: 3 }}>Öğrencinin ders bazında konu ilerlemesi, çözülen soru ve doğru takibi</p>
        </div>
        <div className="row" style={{ gap: 10 }}>
          <select className="select" style={{ minWidth: 210 }} defaultValue="elif"><option value="elif">Elif Yıldız · 11 · Sayısal</option><option>Mert Kaya · 12 · Sayısal</option><option>Zeynep Ak · 11 · Eşit Ağırlık</option></select>
          <button className="btn btn-primary"><Icon name="plus" size={16} />Ödev Ata</button>
        </div>
      </div>
      <StudentStrip />
      <StatRow />
      <KonuTabloSection />
    </div>
  );
}

/* ---- Yıllık Çizelge ekranı (ayrı/tam) ---- */
function CizelgeScreen() {
  return (
    <div className="stack">
      <div className="between" style={{ flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.025em" }}>Yıllık Konu Takip Çizelgesi</h1>
          <p className="muted" style={{ fontSize: 13, marginTop: 3 }}>Tüm yılın oturum oturum çalışma kaydı · Tekrar / Günlük / Haftalık</p>
        </div>
        <button className="btn btn-light"><Icon name="download" size={16} />Dışa aktar</button>
      </div>
      <StudentStrip />
      <KonuCizelge maxHeight="66vh" />
    </div>
  );
}

/* ================= APP SHELL ================= */
function CoachShell() {
  const [page, setPage] = React.useState("konu");
  const [theme, setTheme] = React.useState("light");
  React.useEffect(() => { document.documentElement.setAttribute("data-theme", theme); }, [theme]);

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark"><Icon name="cap" size={20} /></div>
          <div className="logo-text"><b>Uyanık Koç</b><span>Koç Paneli</span></div>
        </div>
        <nav className="nav">
          <div className="nav-label">Çalışma</div>
          {CIZ_NAV.map((n) => {
            const active = n.key === page;
            const clickable = n.key === "konu" || n.key === "cizelge";
            return (
              <button key={n.key} className={"nav-item" + (active ? " active" : "")} onClick={() => clickable && setPage(n.key)} style={{ opacity: clickable ? 1 : .55, cursor: clickable ? "pointer" : "default" }}>
                <Icon name={n.icon} size={19} />{n.label}
                {n.tag && <span className="nav-tag">{n.tag}</span>}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-foot">
          <div className="user-card">
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(140deg,var(--primary-300),var(--primary-700))", color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>MK</div>
            <div className="user-meta"><b>Murat Koç</b><span style={{ fontSize: 11.5, color: "var(--muted)" }}>Matematik Koçu</span></div>
          </div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="crumb"><b>{page === "cizelge" ? "Yıllık Çizelge" : "Konu Takibi"}</b><span>Koç Paneli</span></div>
          <div className="topbar-actions">
            <button className="icon-btn" title="Tema" onClick={() => setTheme((t) => t === "light" ? "dark" : "light")}><Icon name={theme === "light" ? "moon" : "sun"} size={19} /></button>
            <button className="icon-btn"><Icon name="bell" size={19} /><span className="dot" /></button>
          </div>
        </header>
        <div style={{ padding: "24px clamp(16px,3vw,32px) 60px", maxWidth: 1480, width: "100%", margin: "0 auto" }}>
          {page === "cizelge" ? <CizelgeScreen /> : <KonuTakibiPage />}
        </div>
      </div>
    </div>
  );
}

window.CoachShell = CoachShell;
