/* ============================================================
   Yönetim Paneli — uygulama kabuğu
   3 mod: Süper Admin · Kurum/Franchise Yöneticisi · Bireysel Koç
   ============================================================ */
const { useState: useS, useEffect: useE } = React;

const MODES = {
  superadmin: {
    label: "Süper Admin", icon: "shield", crumb: "Platform Yönetimi",
    items: [
      { key: "genel", label: "Genel Bakış", icon: "dashboard" },
      { key: "kurumlar", label: "Kurumlar & Franchise", icon: "building" },
      { key: "lisanslar", label: "Lisans Takibi", icon: "shield" },
      { key: "koclar", label: "Bireysel Koçlar", icon: "users" },
      { key: "gelir", label: "Gelir & Faturalama", icon: "banknote" },
      { key: "raporlar", label: "Raporlar", icon: "trend" },
      { key: "talepler", label: "Demo & Üyelikler", icon: "bell" },
      { key: "kampanyalar", label: "Kampanyalar", icon: "bolt" },
      { key: "lisans-turleri", label: "Lisans Türleri", icon: "card" },
      { key: "moduller", label: "Modül Bayrakları", icon: "bolt" },
      { key: "destek", label: "Destek & Sistem", icon: "message" },
      { key: "ayarlar", label: "Ayarlar", icon: "settings" },
    ],
    user: { name: "Uyanık Koç", sub: "Platform yöneticisi" },
  },
  kurum: {
    label: "Kurum Yöneticisi", icon: "building", crumb: "Kurum Paneli",
    items: [
      { key: "k-dashboard", label: "Dashboard", icon: "dashboard" },
      { key: "k-koclar", label: "Koçlar", icon: "users" },
      { key: "k-ogrenciler", label: "Öğrenciler", icon: "cap" },
      { key: "k-subeler", label: "Şubeler", icon: "building" },
      { key: "k-lisans", label: "Lisans & Kapasite", icon: "shield" },
      { key: "k-gelir", label: "Gelir & Tahsilat", icon: "banknote" },
      { key: "k-paketler", label: "Öğrenci Paketleri", icon: "wallet" },
      { key: "k-raporlar", label: "Raporlar", icon: "trend" },
      { key: "k-yoneticiler", label: "Yöneticiler", icon: "users" },
      { key: "k-ayarlar", label: "Ayarlar", icon: "settings" },
    ],
  },
  coach: {
    label: "Bireysel Koç", icon: "users", crumb: "Koç Lisansı",
    items: [
      { key: "bk-lisans", label: "Lisansım", icon: "shield" },
      { key: "bk-feedback", label: "Geri Bildirimlerim", icon: "heart" },
      { key: "bk-planlar", label: "Planlar & Yükselt", icon: "bolt" },
      { key: "bk-paketler", label: "Öğrenci Paketleri", icon: "wallet" },
      { key: "bk-faturalar", label: "Faturalar", icon: "receipt" },
    ],
  },
};

function renderPage(mode, page, ctx) {
  if (mode === "superadmin") {
    if (page === "genel") return <SAOverview goto={ctx.goto} />;
    if (page === "kurumlar") return <SAOrgs openOrg={ctx.openOrg} />;
    if (page === "kurum-detay") return <SAOrgDetail orgId={ctx.detailOrgId} back={() => ctx.goto("kurumlar")} />;
    if (page === "lisanslar") return <SALicenses openOrg={ctx.openOrg} />;
    if (page === "koclar") return <SACoaches />;
    if (page === "gelir") return <SARevenue />;
    if (page === "raporlar") return <SAReports />;
    if (page === "talepler") return <SALeads />;
    if (page === "kampanyalar") return <SACampaigns />;
    if (page === "lisans-turleri") return <SAPlans />;
    if (page === "koc-detay") return <SACoachProfile coachId={ctx.detailCoachId} back={() => ctx.goto("koclar")} />;
    if (page === "moduller") return <SAModules />;
    if (page === "destek") return <SASupport />;
    if (page === "ayarlar") return <SASettings />;
    return <SAOverview goto={ctx.goto} />;
  }
  if (mode === "kurum") {
    if (page === "k-dashboard") return <KurumDashboard goto={ctx.goto} />;
    if (page === "k-koclar") return <KurumCoaches />;
    if (page === "k-ogrenciler") return <KurumStudents />;
    if (page === "k-subeler") return <KurumBranches />;
    if (page === "k-lisans") return <KurumLicense />;
    if (page === "k-gelir") return <KurumRevenue />;
    if (page === "k-paketler") return <KurumPackages />;
    if (page === "k-raporlar") return <KurumReports />;
    if (page === "k-yoneticiler") return <KurumManagers />;
    if (page === "k-coach-detay") return <KurumCoachDetail coachId={ctx.detailKCoachId} back={() => ctx.goto("k-koclar")} />;
    if (page === "k-student-detay") return <KurumStudentDetail studentId={ctx.detailStudentId} back={() => ctx.goto("k-ogrenciler")} />;
    if (page === "k-ayarlar") return <KurumSettings />;
    return <KurumDashboard goto={ctx.goto} />;
  }
  if (mode === "coach") {
    if (page === "bk-lisans") return <CoachMyLicense goto={ctx.goto} />;
    if (page === "bk-feedback") return <CoachFeedback />;
    if (page === "bk-planlar") return <CoachPlans goto={ctx.goto} />;
    if (page === "bk-paketler") return <CoachPackages />;
    if (page === "bk-faturalar") return <CoachInvoices />;
    return <CoachMyLicense goto={ctx.goto} />;
  }
  return null;
}

function adminIdentity(mode) {
  if (mode === "kurum") { const o = getActiveOrg(); return { name: o.owner.name, email: o.owner.email, phone: o.owner.phone, sub: "Kurum yöneticisi · " + o.name, key: "admin:kurum:" + o.id, tone: o.tone, icon: "building" }; }
  if (mode === "coach") { const c = getMyCoach(); return { name: c.name, email: c.email, phone: c.phone, sub: "Bireysel koç", key: "coach:" + c.id, tone: "var(--warning)", icon: "users" }; }
  return { name: "Uyanık Koç", email: "admin@uyanikkoc.com", phone: "0850 000 00 00", sub: "Platform yöneticisi", key: "admin:superadmin", tone: "var(--primary)", icon: "shield" };
}

/* Profil sayfası (yönetim paneli) */
function AdminProfile({ mode, theme, setTheme }) {
  const a = useAdmin();
  const id = adminIdentity(mode);
  const [name, setName] = useS(id.name);
  const [email, setEmail] = useS(id.email);
  const [phone, setPhone] = useS(id.phone || "");
  const [saved, setSaved] = useS(false);
  useE(() => { const i = adminIdentity(mode); setName(i.name); setEmail(i.email); setPhone(i.phone || ""); }, [mode]);
  const save = () => { if (mode === "kurum") { const o = getActiveOrg(); updateOrg(o.id, { owner: { ...o.owner, name, email, phone } }); } setSaved(true); toast("Profil güncellendi", { icon: "checkCircle" }); setTimeout(() => setSaved(false), 1800); };

  return (
    <div className="stack rise">
      <PageHead title="Profil" sub="Hesap bilgilerin, profil fotoğrafın ve tercihlerin" />
      <div className="grid col-rail">
        <div className="card" style={{ alignSelf: "start", overflow: "hidden" }}>
          <div style={{ height: 84, background: `linear-gradient(135deg, ${id.tone}, color-mix(in srgb, ${id.tone} 60%, #000))` }} />
          <div className="card-pad" style={{ paddingTop: 0, textAlign: "center" }}>
            <div style={{ marginTop: -38, display: "flex", justifyContent: "center" }}>
              <div style={{ border: "4px solid var(--surface)", borderRadius: "50%" }}><Avatar name={name} size={76} avatarKey={id.key} /></div>
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, marginTop: 10 }}>{name}</div>
            <div className="muted" style={{ fontSize: 12.5 }}>{id.sub}</div>
            <div className="row" style={{ justifyContent: "center", marginTop: 10 }}>
              <span className="badge badge-primary" style={{ height: 24 }}><Icon name={id.icon} size={13} />{MODES[mode].label}</span>
            </div>
          </div>
        </div>
        <div className="stack">
          <Section title="Profil Fotoğrafı" sub="Hazır bir ikon seç ya da kendi fotoğrafını yükle">
            <div className="card-body"><AvatarPicker name={name} avatarKey={id.key} /></div>
          </Section>
          <Section title="Hesap Bilgileri" action={<button className="btn btn-primary btn-sm" onClick={save}><Icon name={saved ? "check" : "settings"} size={15} />{saved ? "Kaydedildi" : "Kaydet"}</button>}>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="grid g-2" style={{ gap: 12 }}>
                <div className="field"><label className="label">Ad Soyad</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></div>
                <div className="field"><label className="label">Telefon</label><input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
              </div>
              <div className="field"><label className="label">E-posta</label><input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            </div>
          </Section>
          <Section title="Tercihler">
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div className="between" style={{ padding: "10px 0" }}>
                <div className="row" style={{ gap: 12 }}><span className="lr-icon" style={{ width: 38, height: 38, background: "var(--surface-3)" }}><Icon name={theme === "dark" ? "moon" : "sun"} size={18} /></span><div><div style={{ fontSize: 13.5, fontWeight: 700 }}>Koyu tema</div><div className="muted" style={{ fontSize: 12 }}>Göz yorgunluğunu azalt</div></div></div>
                <button className={`switch${theme === "dark" ? " on" : ""}`} onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Tema"><span /></button>
              </div>
            </div>
          </Section>
          <Section title="Hesap">
            <div className="card-body" style={{ gap: 9, display: "flex", flexDirection: "column" }}>
              <button className="btn btn-light" style={{ justifyContent: "center" }} onClick={() => { resetAdmin(); toast("Demo verileri sıfırlandı", { icon: "refresh" }); }}><Icon name="refresh" size={16} />Demo verilerini sıfırla</button>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function AdminSidebar({ mode, page, setPage, open, onClose }) {
  const menu = MODES[mode];
  return (
    <aside className={`sidebar theme-fade${open ? " open" : ""}`}>
      <div className="sidebar-logo">
        <span className="logo-mark"><UKLogoGlyph size={20} /></span>
        <span className="logo-text"><b>Uyanık Koç</b><span>Yönetim Paneli</span></span>
      </div>
      <nav className="nav">
        <div className="nav-label">{menu.crumb}</div>
        {menu.items.map((it) => {
          const active = it.key === page || (it.key === "kurumlar" && page === "kurum-detay");
          return (
            <button key={it.key} className={`nav-item${active ? " active" : ""}`} onClick={() => { setPage(it.key); onClose && onClose(); }}>
              <Icon name={it.icon} size={19} /><span>{it.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="sidebar-foot">
        <button className="user-card" onClick={() => { setPage("profile"); onClose && onClose(); }}>
          <Avatar name={mode === "kurum" ? getActiveOrg().owner.name : mode === "coach" ? getMyCoach().name : "Platform Ekibi"} size={38} avatarKey={adminIdentity(mode).key} tone={mode === "superadmin" ? "var(--primary)" : mode === "kurum" ? getActiveOrg().tone : "var(--warning)"} />
          <div className="user-meta"><b>{mode === "kurum" ? getActiveOrg().owner.name : mode === "coach" ? getMyCoach().name : "Platform Ekibi"}</b><span>{menu.label}</span></div>
          <Icon name="chevronRight" size={16} style={{ color: "var(--faint)" }} />
        </button>
      </div>
    </aside>
  );
}

function AdminTopbar({ mode, setMode, page, theme, setTheme, onMenu, onProfile }) {
  const menu = MODES[mode];
  const a = useAdmin();
  const id = adminIdentity(mode);
  const [menuOpen, setMenuOpen] = useS(false);
  const activeItem = menu.items.find((i) => i.key === page);
  const crumbLabel = page === "kurum-detay" ? "Kurum Detayı" : page === "profile" ? "Profil" : activeItem ? activeItem.label : menu.label;

  return (
    <header className="topbar theme-fade">
      <button className="menu-btn" aria-label="Menü" onClick={onMenu}><Icon name="menu" size={20} /></button>
      <div className="crumb"><b>{crumbLabel}</b><span>{menu.crumb}</span></div>

      {mode === "kurum" ? (
        <div className="searchbox" style={{ maxWidth: 260, padding: "0 12px" }}>
          <Icon name="building" size={16} />
          <select value={a.activeOrgId} onChange={(e) => { _admin = { ..._admin, activeOrgId: e.target.value }; persistAdmin(); }}
            style={{ border: "none", background: "transparent", font: "inherit", fontSize: 13, fontWeight: 600, color: "var(--text)", width: "100%", outline: "none", cursor: "pointer" }}>
            {a.orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        </div>
      ) : <div className="searchbox" style={{ maxWidth: 240 }}><Icon name="search" size={17} /><input placeholder="Ara..." /><kbd>⌘K</kbd></div>}

      <div className="topbar-actions">
        <div className="mode-seg" role="tablist" aria-label="Panel modu">
          <button className={mode === "superadmin" ? "on" : ""} onClick={() => setMode("superadmin")} title="Süper Admin"><Icon name="shield" size={16} /><span className="ms-label">Süper Admin</span></button>
          <button className={mode === "kurum" ? "on" : ""} onClick={() => setMode("kurum")} title="Kurum"><Icon name="building" size={16} /><span className="ms-label">Kurum</span></button>
          <button className={mode === "coach" ? "on" : ""} onClick={() => setMode("coach")} title="Koç"><Icon name="users" size={16} /><span className="ms-label">Koç</span></button>
        </div>
        <button className="icon-btn" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Tema" title="Tema değiştir"><Icon name={theme === "dark" ? "sun" : "moon"} size={19} /></button>

        <div style={{ position: "relative" }}>
          <button className="user-menu-btn" onClick={() => setMenuOpen((o) => !o)} aria-label="Hesap menüsü">
            <Avatar name={id.name} size={40} avatarKey={id.key} tone={id.tone} />
          </button>
          {menuOpen ? (
            <>
              <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setMenuOpen(false)} />
              <div className="user-pop">
                <div className="row" style={{ gap: 11, padding: "4px 8px 12px", borderBottom: "1px solid var(--border)" }}>
                  <Avatar name={id.name} size={40} avatarKey={id.key} tone={id.tone} />
                  <div style={{ minWidth: 0 }}>
                    <b style={{ fontSize: 13.5, display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{id.name}</b>
                    <span className="muted" style={{ fontSize: 11.5 }}>{id.email}</span>
                  </div>
                </div>
                <button className="pop-item" onClick={() => { setMenuOpen(false); onProfile(); }}><Icon name="users" size={17} />Profilim</button>
                <button className="pop-item" onClick={() => { setMenuOpen(false); setTheme(theme === "dark" ? "light" : "dark"); }}><Icon name={theme === "dark" ? "sun" : "moon"} size={17} />{theme === "dark" ? "Açık tema" : "Koyu tema"}</button>
                <hr className="hr" style={{ margin: "6px 0" }} />
                <button className="pop-item" onClick={() => { setMenuOpen(false); resetAdmin(); toast("Demo verileri sıfırlandı", { icon: "refresh" }); }}><Icon name="refresh" size={17} />Demo verilerini sıfırla</button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function AdminApp() {
  const [mode, setMode] = useS(() => { const m = localStorage.getItem("uk_admin_mode"); return (m && MODES[m]) ? m : "superadmin"; });
  const [pages, setPages] = useS(() => { try { return JSON.parse(localStorage.getItem("uk_admin_pages")) || {}; } catch (e) { return {}; } });
  const [detailOrgId, setDetailOrgId] = useS(null);
  const [detailCoachId, setDetailCoachId] = useS(null);
  const [detailKCoachId, setDetailKCoachId] = useS(null);
  const [detailStudentId, setDetailStudentId] = useS(null);
  const [theme, setTheme] = useS(() => localStorage.getItem("uk_theme") || "light");
  const [navOpen, setNavOpen] = useS(false);

  const page = pages[mode] || MODES[mode].items[0].key;
  const setPage = (p) => { const np = { ...pages, [mode]: p }; setPages(np); localStorage.setItem("uk_admin_pages", JSON.stringify(np)); const main = document.querySelector(".main"); if (main) main.scrollTo({ top: 0 }); };

  useE(() => { document.documentElement.setAttribute("data-theme", theme); localStorage.setItem("uk_theme", theme); }, [theme]);
  useE(() => { localStorage.setItem("uk_admin_mode", mode); }, [mode]);

  const goto = (p) => setPage(p);
  const openOrg = (id) => { setDetailOrgId(id); setPage("kurum-detay"); };
  const openCoach = (id) => { setDetailCoachId(id); setPage("koc-detay"); };
  const openKCoach = (id) => { setDetailKCoachId(id); setPage("k-coach-detay"); };
  const openStudent = (id) => { setDetailStudentId(id); setPage("k-student-detay"); };
  window.__adminNav = { goPage: goto, openOrg, openCoach, openKCoach, openStudent };

  return (
    <div className="app">
      {navOpen ? <div className="sidebar-backdrop" onClick={() => setNavOpen(false)} /> : null}
      <AdminSidebar mode={mode} page={page} setPage={setPage} open={navOpen} onClose={() => setNavOpen(false)} />
      <div className="main">
        <AdminTopbar mode={mode} setMode={(m) => { setMode(m); setNavOpen(false); }} page={page} theme={theme} setTheme={setTheme} onMenu={() => setNavOpen(true)} onProfile={() => setPage("profile")} />
        <div className="content" key={mode + ":" + page}>
          {page === "profile"
            ? <AdminProfile mode={mode} theme={theme} setTheme={setTheme} />
            : renderPage(mode, page, { goto, openOrg, detailOrgId, detailCoachId, detailKCoachId, detailStudentId })}
        </div>
      </div>
      <ToastHost />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<AdminApp />);
