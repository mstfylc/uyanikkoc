/* App shell — sidebar nav (routing), topbar, role + theme switching */

const MENUS = {
  student: {
    crumb: "Öğrenci Paneli",
    items: [
      { key: "dashboard", label: "Dashboard", icon: "dashboard" },
      { key: "schedule", label: "Çalışma Programı", icon: "calendar" },
      { key: "topics", label: "Konu Takibi", icon: "book" },
      { key: "exams", label: "Denemeler", icon: "chart" },
      { key: "mistakes", label: "Yanlış Defteri", icon: "alert", tag: "Yeni" },
      { key: "assignments", label: "Ödevlerim", icon: "clipboard", count: 4 },
      { key: "messages", label: "Mesajlar", icon: "message" },
      { key: "appointments", label: "Randevular", icon: "calendar" },
      { key: "tests", label: "Testlerim", icon: "star" },
      { key: "ai-coach", label: "AI Koç", icon: "ai", tag: "Yakında" },
      { key: "motivation", label: "Motivasyon", icon: "star" },
      { key: "billing", label: "Abonelik", icon: "card" },
    ],
    user: { name: STUDENT.name, sub: STUDENT.grade },
  },
  coach: {
    crumb: "Koç Paneli",
    items: [
      { key: "dashboard", label: "Dashboard", icon: "dashboard" },
      { key: "students", label: "Öğrencilerim", icon: "users" },
      { key: "c-topics", label: "Konu Takibi", icon: "book" },
      { key: "c-cizelge", label: "Yıllık Çizelge", icon: "notebook", tag: "Yeni" },
      { key: "c-assignments", label: "Ödev & Görev", icon: "clipboard" },
      { key: "c-exams", label: "Denemeler", icon: "chart" },
      { key: "c-online", label: "Online Denemeler", icon: "notebook" },
      { key: "messages", label: "Mesajlar", icon: "message", count: 5 },
      { key: "appointments", label: "Randevular", icon: "calendar" },
      { key: "tests", label: "Envanter & Testler", icon: "star" },
      { key: "reports", label: "Raporlar", icon: "trend" },
      { key: "revenue", label: "Gelir & Tahsilat", icon: "banknote" },
    ],
    user: { name: COACH.name, sub: COACH.role },
  },
  parent: {
    crumb: "Veli Paneli",
    items: [
      { key: "dashboard", label: "Genel Bakış", icon: "dashboard" },
      { key: "p-exams", label: "Deneme Sonuçları", icon: "chart" },
      { key: "p-reports", label: "Gelişim Raporları", icon: "trend" },
      { key: "messages", label: "Mesajlar", icon: "message" },
      { key: "appointments", label: "Randevular", icon: "calendar" },
      { key: "billing", label: "Abonelik", icon: "card" },
    ],
    user: { name: "Ayşe Yıldız", sub: "Veli · Elif'in annesi" },
  },
};

const GENEL = [
  { key: "support", label: "Destek", icon: "message" },
  { key: "settings", label: "Ayarlar", icon: "settings" },
];

/* Mobil alt navigasyon — her rol için başparmakla erişilen 4 ana bölüm + "Menü" */
const BOTTOM_NAV = {
  student: [
    { key: "dashboard", label: "Ana Sayfa", icon: "dashboard" },
    { key: "schedule", label: "Program", icon: "calendar" },
    { key: "assignments", label: "Ödevler", icon: "clipboard" },
    { key: "messages", label: "Mesajlar", icon: "message" },
  ],
  coach: [
    { key: "dashboard", label: "Ana Sayfa", icon: "dashboard" },
    { key: "students", label: "Öğrenciler", icon: "users" },
    { key: "c-assignments", label: "Ödevler", icon: "clipboard" },
    { key: "messages", label: "Mesajlar", icon: "message" },
  ],
  parent: [
    { key: "dashboard", label: "Genel", icon: "dashboard" },
    { key: "p-exams", label: "Denemeler", icon: "chart" },
    { key: "messages", label: "Mesajlar", icon: "message" },
    { key: "appointments", label: "Randevu", icon: "calendar" },
  ],
};

const ROUTES = {
  student: {
    dashboard: StudentDashboard, schedule: SchedulePage, topics: TopicsPage,
    exams: ExamsPage, assignments: AssignmentsPage, appointments: StudentAppointmentsPage, tests: StudentTestsPage, "ai-coach": AiCoachPage, motivation: MotivationPage, messages: MessagesPage,
    mistakes: (typeof YanlisDefteriPage === "function" ? YanlisDefteriPage : (typeof window !== "undefined" && window.YanlisDefteriPage)),
    settings: SettingsPage, billing: BillingPage,
  },
  coach: {
    dashboard: CoachDashboard, students: CoachStudentsPage, "c-topics": CoachKonuPage,
    "c-cizelge": CoachKonuCizelgePage,
    "c-assignments": CoachAssignmentsPage, "c-exams": CoachExamsPage, "c-online": CoachOnlineExams, appointments: CoachAppointmentsPage, tests: CoachTestsPage,
    messages: MessagesPage, reports: CoachReportsPage,
    settings: SettingsPage, revenue: CoachRevenueGate,
  },
  parent: {
    dashboard: VeliDashboard, "p-exams": VeliDenemelerPage, "p-reports": ParentReportsPage, messages: MessagesPage, appointments: StudentAppointmentsPage,
    settings: SettingsPage, billing: BillingPage,
  },
};

function findItem(role, key) {
  return [...MENUS[role].items, ...GENEL].find((i) => i.key === key);
}

function Sidebar({ role, page, setPage, onLogout, auth, open, onClose }) {
  const menu = MENUS[role];
  const renderItem = (it) => {
    const active = it.key === page;
    return (
      <button key={it.key} className={`nav-item${active ? " active" : ""}`} onClick={() => { setPage(it.key); onClose && onClose(); }}>
        <Icon name={it.icon} size={19} />
        <span>{it.label}</span>
        {it.count ? <span className="nav-count tnum">{it.count}</span> : null}
        {it.tag ? <span className="nav-tag">{it.tag}</span> : null}
      </button>
    );
  };
  return (
    <aside className={`sidebar theme-fade${open ? " open" : ""}`}>
      <div className="sidebar-logo">
        <span className="logo-mark"><UKLogoGlyph size={20} /></span>
        <span className="logo-text">
          <b>Uyanık Koç</b>
          <span>Akıllı koçluk</span>
        </span>
      </div>
      <nav className="nav">
        <div className="nav-label">Menü</div>
        {menu.items.map(renderItem)}
        <div className="nav-label">Genel</div>
        {GENEL.map(renderItem)}
      </nav>
      <div className="sidebar-foot">
        <button className="user-card" onClick={() => { setPage("profile"); onClose && onClose(); }}>
          <Avatar name={(auth && auth.name) || menu.user.name} size={38} avatarKey={meKey(auth)} />
          <div className="user-meta">
            <b>{(auth && auth.name) || menu.user.name}</b>
            <span>{menu.user.sub}</span>
          </div>
          <Icon name="chevronRight" size={16} style={{ color: "var(--faint)" }} />
        </button>
      </div>
    </aside>
  );
}

function SearchSheet({ role, onClose }) {
  const [q, setQ] = useState("");
  return ReactDOM.createPortal((
    <div className="search-sheet-overlay" onMouseDown={onClose}>
      <div className="search-sheet" onMouseDown={(e) => e.stopPropagation()}>
        <div className="search-sheet-bar">
          <Icon name="search" size={18} style={{ color: "var(--muted)", flexShrink: 0 }} />
          <input autoFocus placeholder={role === "coach" ? "Öğrenci ara..." : "Ödev, konu veya kaynak ara..."} value={q} onChange={(e) => setQ(e.target.value)} />
          <button className="icon-btn" style={{ width: 34, height: 34 }} onClick={onClose} aria-label="Kapat"><Icon name="plus" size={18} style={{ transform: "rotate(45deg)" }} /></button>
        </div>
        <div className="search-sheet-body">
          {q.trim()
            ? <div className="search-sheet-hint"><b>"{q}"</b> için sonuçlar burada listelenir.</div>
            : <div className="search-sheet-hint">Aramak için yazmaya başla.</div>}
        </div>
      </div>
    </div>
  ), document.body);
}

function Topbar({ role, page, setRole, theme, setTheme, goPage, onLogout, auth, onMenu }) {
  const menu = MENUS[role];
  const item = findItem(role, page);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const ROLES = [["student", "Öğrenci", "cap"], ["coach", "Koç", "users"], ["parent", "Veli", "heart"]];
  return (
    <header className="topbar theme-fade">
      <button className="menu-btn" aria-label="Menü" onClick={() => onMenu && onMenu()}><Icon name="menu" size={20} /></button>
      <div className="crumb">
        <b>{page === "profile" ? "Profil" : item ? item.label : "Dashboard"}</b>
        <span>{menu.crumb}</span>
      </div>

      <div className="searchbox tb-search">
        <Icon name="search" size={17} />
        <input placeholder={role === "coach" ? "Öğrenci ara..." : "Ödev veya konu ara..."} />
        <kbd>⌘K</kbd>
      </div>

      <div className="topbar-actions">
        <div className="seg tb-roles" role="tablist" aria-label="Rol seçimi">
          <button className={role === "student" ? "on" : ""} onClick={() => setRole("student")}>
            <Icon name="cap" size={16} />Öğrenci
          </button>
          <button className={role === "coach" ? "on" : ""} onClick={() => setRole("coach")}>
            <Icon name="users" size={16} />Koç
          </button>
          <button className={role === "parent" ? "on" : ""} onClick={() => setRole("parent")}>
            <Icon name="heart" size={16} />Veli
          </button>
        </div>

        <button className="icon-btn tb-search-m" onClick={() => setSearchOpen(true)} aria-label="Ara" title="Ara">
          <Icon name="search" size={19} />
        </button>

        <button className="icon-btn tb-theme" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Tema değiştir" title="Tema değiştir">
          <Icon name={theme === "dark" ? "sun" : "moon"} size={19} />
        </button>

        <NotifBell role={role} goPage={goPage} />

        <div style={{ position: "relative" }}>
          <button className="user-menu-btn" onClick={() => setMenuOpen((o) => !o)} aria-label="Hesap menüsü">
            <Avatar name={(auth && auth.name) || menu.user.name} size={40} avatarKey={meKey(auth)} />
          </button>
          {menuOpen ? (
            <>
              <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setMenuOpen(false)} />
              <div className="user-pop">
                <div className="row" style={{ gap: 11, padding: "4px 8px 12px", borderBottom: "1px solid var(--border)" }}>
                  <Avatar name={(auth && auth.name) || menu.user.name} size={40} avatarKey={meKey(auth)} />
                  <div style={{ minWidth: 0 }}>
                    <b style={{ fontSize: 13.5, display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{(auth && auth.name) || menu.user.name}</b>
                    <span className="muted" style={{ fontSize: 11.5 }}>{(auth && auth.email) || ""}</span>
                  </div>
                </div>
                <div className="pop-roles">
                  <div className="pop-rolelabel">Görünüm</div>
                  {ROLES.map(([r, l, ic]) => (
                    <button key={r} className={"pop-item" + (role === r ? " on" : "")} onClick={() => { setMenuOpen(false); setRole(r); }}>
                      <Icon name={ic} size={17} />{l}{role === r ? <Icon name="check" size={15} style={{ marginLeft: "auto", color: "var(--primary)" }} /> : null}
                    </button>
                  ))}
                  <hr className="hr" style={{ margin: "6px 0" }} />
                </div>
                <button className="pop-item" onClick={() => { setMenuOpen(false); goPage("profile"); }}><Icon name="users" size={17} />Profilim</button>
                <button className="pop-item" onClick={() => { setMenuOpen(false); goPage("settings"); }}><Icon name="settings" size={17} />Ayarlar</button>
                <button className="pop-item" onClick={() => { setMenuOpen(false); setTheme(theme === "dark" ? "light" : "dark"); }}><Icon name={theme === "dark" ? "sun" : "moon"} size={17} />{theme === "dark" ? "Açık tema" : "Koyu tema"}</button>
                <hr className="hr" style={{ margin: "6px 0" }} />
                <button className="pop-item danger" onClick={() => { setMenuOpen(false); onLogout(); }}><Icon name="logout" size={17} />Çıkış Yap</button>
              </div>
            </>
          ) : null}
        </div>
      </div>
      {searchOpen ? <SearchSheet role={role} onClose={() => setSearchOpen(false)} /> : null}
    </header>
  );
}

function BottomNav({ role, page, navOpen, onSelect, onMenu }) {
  const items = BOTTOM_NAV[role] || [];
  return (
    <nav className="bottom-nav" aria-label="Alt menü">
      {items.map((it) => {
        const active = it.key === page && !navOpen;
        const src = MENUS[role].items.find((m) => m.key === it.key);
        const count = src && src.count;
        return (
          <button
            key={it.key}
            className={"bn-item" + (active ? " active" : "")}
            onClick={() => onSelect(it.key)}
            aria-current={active ? "page" : undefined}
          >
            <span className="bn-ic">
              <Icon name={it.icon} size={22} />
              {count ? <span className="bn-badge">{count}</span> : null}
            </span>
            <span className="bn-label">{it.label}</span>
          </button>
        );
      })}
      <button
        className={"bn-item" + (navOpen ? " active" : "")}
        onClick={onMenu}
        aria-label="Tüm menü"
        aria-expanded={navOpen}
      >
        <span className="bn-ic"><Icon name="menu" size={22} /></span>
        <span className="bn-label">Menü</span>
      </button>
    </nav>
  );
}

function App() {
  const [auth, setAuth] = useState(() => loadAuth());
  const [role, setRole] = useState(() => (loadAuth() && loadAuth().role) || localStorage.getItem("uk_role") || "student");
  const [page, setPage] = useState(() => localStorage.getItem("uk_page_" + (localStorage.getItem("uk_role") || "student")) || "dashboard");
  const [theme, setTheme] = useState(() => localStorage.getItem("uk_theme") || "light");
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("uk_theme", theme);
  }, [theme]);
  useEffect(() => { localStorage.setItem("uk_role", role); }, [role]);
  useEffect(() => { localStorage.setItem("uk_page_" + role, page); }, [role, page]);

  const login = (u) => { saveAuth(u); setAuth(u); setRole(u.role); setPage("dashboard"); };
  const logout = () => { saveAuth(null); setAuth(null); };

  const switchRole = (r) => {
    setRole(r);
    setPage(localStorage.getItem("uk_page_" + r) || "dashboard");
    if (auth) { const u = { ...DEMO_USERS[r], remember: auth.remember }; saveAuth(u); setAuth(u); }
  };

  const goPage = (p) => {
    setPage(p);
    const main = document.querySelector(".main");
    if (main) main.scrollTo({ top: 0 });
    window.scrollTo({ top: 0 });
  };

  useEffect(() => {
    const onNav = (e) => { const p = e.detail && e.detail.page; if (p) goPage(p); };
    window.addEventListener("uk-nav", onNav);
    return () => window.removeEventListener("uk-nav", onNav);
  }, []);

  if (!auth) return <LoginScreen onLogin={login} />;

  const Page = ROUTES[role][page];
  const item = findItem(role, page);

  return (
    <div className="app">
      {navOpen ? <div className="sidebar-backdrop" onClick={() => setNavOpen(false)} /> : null}
      <Sidebar role={role} page={page} setPage={goPage} onLogout={logout} auth={auth} open={navOpen} onClose={() => setNavOpen(false)} />
      <div className="main">
        <Topbar role={role} page={page} setRole={switchRole} theme={theme} setTheme={setTheme} goPage={goPage} onLogout={logout} auth={auth} onMenu={() => setNavOpen(true)} />
        <div className="content" key={role + ":" + page}>
          {page === "profile"
            ? <ProfilePage auth={auth} role={role} onLogout={logout} theme={theme} setTheme={setTheme} />
            : page === "support"
            ? <SupportPage role={role} />
            : page === "settings"
            ? <SettingsPage role={role} auth={auth} theme={theme} setTheme={setTheme} onLogout={logout} />
            : page === "messages"
            ? <MessagesPage role={role} />
            : Page ? <Page /> : <PlaceholderPage title={item ? item.label : "Sayfa"} sub={MENUS[role].crumb} icon={item ? item.icon : "settings"} />}
        </div>
      </div>
      <BottomNav
        role={role}
        page={page}
        navOpen={navOpen}
        onSelect={(k) => { setNavOpen(false); goPage(k); }}
        onMenu={() => setNavOpen((o) => !o)}
      />
      <ToastHost />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
