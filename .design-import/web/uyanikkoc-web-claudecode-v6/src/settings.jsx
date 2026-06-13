/* Ayarlar sayfası — sekmeli. "Müfredat & Konu Grupları" editörü koçun
   ders → konu grubu (alt kırılım) → konu yapısını düzenlemesini sağlar. */

/* küçük: düzenlenebilir etiket */
function EditableText({ value, onCommit, className, style, placeholder }) {
  const [v, setV] = useState(value);
  useEffect(() => { setV(value); }, [value]);
  return (
    <input
      className={className}
      style={style}
      value={v}
      placeholder={placeholder}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => { const t = v.trim(); if (t && t !== value) onCommit(t); else setV(value); }}
      onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); if (e.key === "Escape") { setV(value); e.currentTarget.blur(); } }}
    />
  );
}

/* ---- Müfredat editörü ---- */
function CurriculumEditor() {
  const [examType, setExamType] = useState("YKS");
  const CURR = useCurriculum(examType);
  const subjects = Object.keys(CURR);
  const [active, setActive] = useState(subjects[0]);
  const [newTopic, setNewTopic] = useState({});   // grupIdx -> text
  const activeSubj = subjects.includes(active) ? active : subjects[0];
  const groups = CURR[activeSubj] || [];

  const totalGroups = subjects.reduce((a, s) => a + CURR[s].length, 0);
  const totalTopics = subjects.reduce((a, s) => a + CURR[s].reduce((b, g) => b + g.konular.length, 0), 0);

  const mutate = (fn) => setCurriculum(examType, (c) => { const n = JSON.parse(JSON.stringify(c)); fn(n); return n; });
  const renameGroup = (gi, name) => mutate((n) => { n[activeSubj][gi].grup = name; });
  const addGroup = () => mutate((n) => { n[activeSubj].push({ grup: "Yeni Grup", konular: [] }); });
  const delGroup = (gi) => mutate((n) => { n[activeSubj].splice(gi, 1); });
  const moveGroup = (gi, dir) => mutate((n) => { const a = n[activeSubj]; const j = gi + dir; if (j < 0 || j >= a.length) return; [a[gi], a[j]] = [a[j], a[gi]]; });
  const renameTopic = (gi, ti, name) => mutate((n) => { n[activeSubj][gi].konular[ti] = name; });
  const delTopic = (gi, ti) => mutate((n) => { n[activeSubj][gi].konular.splice(ti, 1); });
  const addTopic = (gi) => {
    const t = (newTopic[gi] || "").trim();
    if (!t) return;
    mutate((n) => { n[activeSubj][gi].konular.push(t); });
    setNewTopic((p) => ({ ...p, [gi]: "" }));
  };

  return (
    <div className="stack">
      <div className="seg" style={{ width: "fit-content" }}>
        {EXAM_TYPES.map((t) => (
          <button key={t} className={examType === t ? "on" : ""} onClick={() => { setExamType(t); }}>{t}</button>
        ))}
      </div>
      <div className="between" style={{ flexWrap: "wrap", gap: 12 }}>
        <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
          <Badge tone="muted" icon="book">{subjects.length} ders</Badge>
          <Badge tone="muted" icon="notebook">{totalGroups} konu grubu</Badge>
          <Badge tone="muted" icon="checkCircle">{totalTopics} konu</Badge>
        </div>
        <button className="btn btn-light btn-sm" onClick={() => { if (confirm(`${examType} müfredatı varsayılana sıfırlansın mı? Yaptığın değişiklikler silinir.`)) resetCurriculum(examType); }}>
          <Icon name="trend" size={15} />Varsayılana sıfırla
        </button>
      </div>

      <div className="grid col-rail">
        {/* ders rail */}
        <div className="card" style={{ overflow: "hidden", alignSelf: "start" }}>
          <div className="card-head"><h3>Dersler</h3></div>
          <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 4 }}>
            {subjects.map((s) => {
              const c = SUBJECT_COLORS[s] || "var(--primary)";
              const on = s === activeSubj;
              return (
                <button key={s} className="user-card" style={{ background: on ? "var(--surface-3)" : "none", borderRadius: 11 }} onClick={() => setActive(s)}>
                  <span className="swatch" style={{ width: 10, height: 10, borderRadius: 4, background: c, flexShrink: 0 }} />
                  <div className="user-meta" style={{ flex: 1 }}>
                    <b style={{ fontSize: 13, color: on ? c : "var(--text)" }}>{s}</b>
                    <span style={{ fontSize: 11 }}>{CURR[s].length} grup · {CURR[s].reduce((a, g) => a + g.konular.length, 0)} konu</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* grup editörü */}
        <Section
          title={`${activeSubj} — Konu Grupları`}
          sub="Alt kırılımları ve konuları düzenle"
          action={<button className="btn btn-primary btn-sm" onClick={addGroup}><Icon name="plus" size={15} />Grup ekle</button>}
        >
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {groups.length === 0 ? (
              <div style={{ padding: "24px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Bu derste henüz grup yok. “Grup ekle” ile başla.</div>
            ) : groups.map((g, gi) => (
              <div className="edit-grp" key={gi}>
                <div className="edit-grp-head">
                  <span className="grip"><Icon name="menu" size={15} /></span>
                  <EditableText className="edit-grp-name" value={g.grup} onCommit={(t) => renameGroup(gi, t)} placeholder="Grup adı" />
                  <span className="muted" style={{ fontSize: 11.5, whiteSpace: "nowrap" }}>{g.konular.length} konu</span>
                  <div className="row" style={{ gap: 2, marginLeft: "auto" }}>
                    <button className="mini-btn" disabled={gi === 0} onClick={() => moveGroup(gi, -1)} aria-label="Yukarı"><Icon name="chevronDown" size={15} style={{ transform: "rotate(180deg)" }} /></button>
                    <button className="mini-btn" disabled={gi === groups.length - 1} onClick={() => moveGroup(gi, 1)} aria-label="Aşağı"><Icon name="chevronDown" size={15} /></button>
                    <button className="mini-btn danger" onClick={() => { if (confirm(`"${g.grup}" grubu silinsin mi?`)) delGroup(gi); }} aria-label="Sil"><Icon name="plus" size={15} style={{ transform: "rotate(45deg)" }} /></button>
                  </div>
                </div>
                <div className="edit-topics">
                  {g.konular.map((k, ti) => (
                    <div className="edit-topic" key={ti}>
                      <span className="dot-sm" style={{ background: SUBJECT_COLORS[activeSubj] || "var(--primary)" }} />
                      <EditableText className="edit-topic-name" value={k} onCommit={(t) => renameTopic(gi, ti, t)} />
                      <button className="mini-btn danger" onClick={() => delTopic(gi, ti)} aria-label="Konu sil"><Icon name="plus" size={13} style={{ transform: "rotate(45deg)" }} /></button>
                    </div>
                  ))}
                  <div className="add-topic">
                    <Icon name="plus" size={14} style={{ color: "var(--faint)", flexShrink: 0 }} />
                    <input
                      className="add-topic-input"
                      placeholder="Konu ekle ve Enter'a bas..."
                      value={newTopic[gi] || ""}
                      onChange={(e) => setNewTopic((p) => ({ ...p, [gi]: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === "Enter") addTopic(gi); }}
                    />
                    {(newTopic[gi] || "").trim() ? <button className="btn btn-primary btn-sm" onClick={() => addTopic(gi)} style={{ height: 28 }}>Ekle</button> : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}

/* ---- Ayarlar sayfası (yeniden tasarım) ---- */
const SETTINGS_TABS = [
  { key: "mufredat", label: "Müfredat", icon: "book", coachOnly: true },
  { key: "hesap", label: "Hesap", icon: "users" },
  { key: "gorunum", label: "Görünüm", icon: "sun" },
  { key: "bildirim", label: "Bildirimler", icon: "bell" },
  { key: "gizlilik", label: "Gizlilik & Güvenlik", icon: "lock" },
];

function SettingsAccountTab({ auth, role }) {
  const u = auth || (typeof DEMO_USERS !== "undefined" ? DEMO_USERS[role] : { name: "Kullanıcı", email: "", phone: "" });
  const roleLabel = role === "coach" ? "Koç" : role === "parent" ? "Veli" : "Öğrenci";
  return (
    <Section title="Hesap Bilgileri" sub="Profil bilgilerini görüntüle ve düzenle"
      action={<button className="btn btn-primary btn-sm" onClick={() => window.dispatchEvent(new CustomEvent("uk-nav", { detail: { page: "profile" } }))}><Icon name="settings" size={15} />Profili düzenle</button>}>
      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="row" style={{ gap: 14 }}>
          <Avatar name={u.name} size={56} avatarKey={typeof meKey === "function" ? meKey(u) : null} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="row" style={{ gap: 8 }}><b style={{ fontSize: 16, fontWeight: 800 }}>{u.name}</b><Badge tone={role === "coach" ? "primary" : "success"} icon={role === "coach" ? "users" : "cap"}>{roleLabel}</Badge></div>
            <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>{u.sub || ""}</div>
          </div>
        </div>
        <hr className="hr" />
        {[["message", "E-posta", u.email], ["phone", "Telefon", u.phone]].map(([ic, k, v]) => (
          <div className="between" key={k} style={{ padding: "2px 0" }}>
            <div className="row" style={{ gap: 11 }}><span className="lr-icon" style={{ width: 36, height: 36, background: "var(--surface-3)" }}><Icon name={ic} size={17} /></span><div><div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>{k}</div><div style={{ fontSize: 13.5, fontWeight: 700 }}>{v || "—"}</div></div></div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function SettingsAppearanceTab({ theme, setTheme }) {
  const t = theme || (typeof localStorage !== "undefined" && localStorage.getItem("uk_theme")) || "light";
  const apply = (val) => { if (typeof setTheme === "function") setTheme(val); else { document.documentElement.setAttribute("data-theme", val); try { localStorage.setItem("uk_theme", val); } catch (e) {} } };
  return (
    <Section title="Görünüm" sub="Tema ve okuma tercihleri">
      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <div className="label" style={{ marginBottom: 10 }}>Tema</div>
          <div className="grid g-2" style={{ gap: 12, maxWidth: 420 }}>
            {[["light", "Açık", "sun"], ["dark", "Koyu", "moon"]].map(([val, lbl, ic]) => (
              <button key={val} type="button" className="role-card" style={{ borderColor: t === val ? "var(--primary)" : "var(--border)", background: t === val ? "var(--primary-soft)" : "var(--surface)", boxShadow: t === val ? "0 0 0 3px color-mix(in srgb, var(--primary) 13%, transparent)" : "none" }} onClick={() => apply(val)}>
                <span className="rc-ic" style={{ background: t === val ? "var(--primary)" : "var(--surface-3)", color: t === val ? "#fff" : "var(--primary-600)" }}><Icon name={ic} size={20} /></span>
                <span style={{ flex: 1 }}><span className="rc-tt">{lbl} tema</span><span className="rc-sub" style={{ display: "block" }}>{val === "dark" ? "Göz yorgunluğunu azaltır" : "Aydınlık ortamlar için"}</span></span>
                {t === val ? <Icon name="checkCircle" size={18} style={{ color: "var(--primary)" }} /> : null}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

function SettingsPrivacyTab({ onLogout }) {
  const [p1, setP1] = useState(""); const [p2, setP2] = useState(""); const [p3, setP3] = useState("");
  const ok = p1 && p2.length >= 6 && p2 === p3;
  const save = () => { if (!ok) return; setP1(""); setP2(""); setP3(""); if (typeof toast === "function") toast("Şifren güncellendi", { icon: "checkCircle" }); };
  return (
    <div className="stack">
      <Section title="Şifre Değiştir" sub="Hesabını güvende tut">
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 13, maxWidth: 460 }}>
          <div className="field"><label className="label">Mevcut şifre</label><input className="input" type="password" value={p1} onChange={(e) => setP1(e.target.value)} placeholder="••••••••" /></div>
          <div className="field"><label className="label">Yeni şifre</label><input className="input" type="password" value={p2} onChange={(e) => setP2(e.target.value)} placeholder="En az 6 karakter" />{p2 && p2.length < 6 ? <span style={{ fontSize: 11.5, color: "var(--danger)", marginTop: 4 }}>En az 6 karakter</span> : null}</div>
          <div className="field"><label className="label">Yeni şifre (tekrar)</label><input className="input" type="password" value={p3} onChange={(e) => setP3(e.target.value)} placeholder="••••••••" />{p3 && p2 !== p3 ? <span style={{ fontSize: 11.5, color: "var(--danger)", marginTop: 4 }}>Şifreler eşleşmiyor</span> : null}</div>
          <button className="btn btn-primary" disabled={!ok} style={{ alignSelf: "flex-start", opacity: ok ? 1 : 0.5 }} onClick={save}><Icon name="lock" size={15} />Şifreyi güncelle</button>
        </div>
      </Section>
      <Section title="Oturum">
        <div className="card-body">
          <button className="btn btn-light" style={{ color: "var(--danger)" }} onClick={() => onLogout && onLogout()}><Icon name="logout" size={16} />Çıkış Yap</button>
        </div>
      </Section>
    </div>
  );
}

function SettingsPage({ role, auth, theme, setTheme, onLogout }) {
  const isCoach = role === "coach";
  const tabs = SETTINGS_TABS.filter((t) => !t.coachOnly || isCoach);
  const [tab, setTab] = useState(tabs[0].key);
  return (
    <div className="stack rise">
      <PageHead title="Ayarlar" sub={isCoach ? "Hesap, görünüm ve müfredat yapılandırması" : "Hesap ve görünüm ayarların"} />
      <div className="seg" style={{ width: "fit-content", flexWrap: "wrap" }}>
        {tabs.map((t) => (
          <button key={t.key} className={tab === t.key ? "on" : ""} onClick={() => setTab(t.key)}>
            <Icon name={t.icon} size={16} />{t.label}
          </button>
        ))}
      </div>

      {tab === "mufredat" && isCoach ? <CurriculumEditor /> : null}
      {tab === "hesap" ? <SettingsAccountTab auth={auth} role={role} /> : null}
      {tab === "gorunum" ? <SettingsAppearanceTab theme={theme} setTheme={setTheme} /> : null}
      {tab === "bildirim" ? <NotificationSettings role={role} /> : null}
      {tab === "gizlilik" ? <SettingsPrivacyTab onLogout={onLogout} /> : null}
    </div>
  );
}

window.SettingsPage = SettingsPage;
window.CurriculumEditor = CurriculumEditor;
