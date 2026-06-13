/* ============================================================
   SÜPER ADMIN — Demo & Üyelik Talepleri
   Gelen demo talepleri (lead funnel) + yeni üyelik & satın almalar.
   Süper admin VE destek yetkilisi erişebilir; demo takibi bir destek
   işi olduğu için her iki rol de talep durumunu yönetebilir.
   ============================================================ */

/* ---- durum & etiket sözlükleri ---- */
const DEMO_STATUS = {
  new: ["warning", "Yeni talep"],
  contacted: ["info", "İletişime geçildi"],
  scheduled: ["primary", "Demo planlandı"],
  converted: ["success", "Satışa döndü"],
  lost: ["muted", "Kayıp"],
};
const DEMO_FLOW = ["new", "contacted", "scheduled", "converted"];
const SIGNUP_TYPE = {
  new: ["success", "Yeni üyelik"],
  renewal: ["info", "Yenileme"],
  upgrade: ["primary", "Yükseltme"],
  trial: ["warning", "Ücretsiz deneme"],
};

function leadPlanName(d) {
  return d.kind === "org" ? orgPlanById(d.planId).name : coachPlanById(d.planId).name;
}
function leadPlanColor(d) {
  return d.kind === "org" ? orgPlanById(d.planId).color : coachPlanById(d.planId).color;
}
function timeAgo(ts) {
  const diff = Date.now() - ts;
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "az önce";
  if (h < 24) return h + " saat önce";
  const d = Math.floor(h / 24);
  return d + " gün önce";
}
function fmtDateTime(ts) {
  return new Date(ts).toLocaleString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}
function toLocalInput(ts) {
  if (!ts) return "";
  const d = new Date(ts - new Date().getTimezoneOffset() * 60000);
  return d.toISOString().slice(0, 16);
}
function fromLocalInput(v) { return v ? new Date(v).getTime() : null; }

/* ---- aşama göstergesi (stepper) ---- */
function LeadStepper({ d }) {
  const STAGES = [
    { k: "new", l: "Yeni talep", icon: "bell" },
    { k: "contacted", l: "İletişime geçildi", icon: "phone" },
    { k: "scheduled", l: "Demo planlandı", icon: "calendar" },
    { k: "converted", l: "Satışa döndü", icon: "checkCircle" },
  ];
  const lost = d.status === "lost";
  const curIdx = lost ? -1 : DEMO_FLOW.indexOf(d.status);
  const setStage = (k) => { setDemoStatus(d.id, k); toast(d.name + " · " + DEMO_STATUS[k][1], { icon: k === "converted" ? "checkCircle" : "check" }); };
  return (
    <div className="lead-stepper" style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
      {STAGES.map((s, i) => {
        const done = !lost && i < curIdx;
        const active = !lost && i === curIdx;
        const tone = active ? "var(--primary)" : done ? "var(--success)" : "var(--surface-3)";
        const fg = active || done ? "#fff" : "var(--muted)";
        return (
          <React.Fragment key={s.k}>
            <button onClick={() => setStage(s.k)} title={s.l}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: "2px 0" }}>
              <span style={{ width: 34, height: 34, borderRadius: "50%", display: "grid", placeItems: "center", background: tone, color: fg, transition: "all .2s", boxShadow: active ? "0 0 0 4px color-mix(in srgb, var(--primary) 20%, transparent)" : "none" }}>
                <Icon name={done ? "check" : s.icon} size={16} />
              </span>
              <span style={{ fontSize: 11, fontWeight: active ? 800 : 600, color: active ? "var(--text)" : "var(--muted)", textAlign: "center", lineHeight: 1.2 }}>{s.l}</span>
            </button>
            {i < STAGES.length - 1 ? <span style={{ flex: "0 0 18px", height: 2, background: (!lost && i < curIdx) ? "var(--success)" : "var(--border-strong)", alignSelf: "flex-start", marginTop: 18 }} /> : null}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ---- demo talebi detay & not modalı ---- */
function LeadDetailModal({ d, onClose }) {
  const a = useAdmin();
  const [text, setText] = uS("");
  const [showLost, setShowLost] = uS(false);
  const author = a.viewerAccess === "full" ? "Platform Ekibi" : "Destek Ekibi";
  const notes = (d.notes || []).slice().sort((x, y) => y.date - x.date);
  const lost = d.status === "lost";
  const add = () => { if (!text.trim()) return; addDemoNote(d.id, text.trim(), author); setText(""); toast("Not eklendi", { icon: "notebook" }); };
  return (
    <Modal title={d.name} sub={(d.kind === "org" ? "Kurum" : "Bireysel koç") + " · " + d.city + " · " + leadPlanName(d) + " planı"} width={620} onClose={onClose}
      foot={<>
        {lost
          ? <button className="btn btn-light" onClick={() => { setDemoStatus(d.id, "contacted"); toast(d.name + " yeniden açıldı", { icon: "refresh" }); }}><Icon name="refresh" size={16} />Yeniden aç</button>
          : <button className="btn btn-light" onClick={() => setShowLost(true)}><Icon name="alert" size={16} />Kayıp olarak işaretle</button>}
        <button className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={onClose}>Kapat</button>
      </>}>
      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
        <a className="badge badge-muted" href={"mailto:" + d.email} style={{ height: 26, textDecoration: "none" }}><Icon name="message" size={12} />{d.email}</a>
        <a className="badge badge-muted" href={"tel:" + d.phone.replace(/\s/g, "")} style={{ height: 26, textDecoration: "none" }}><Icon name="phone" size={12} />{d.phone}</a>
        <span className="badge badge-muted" style={{ height: 26 }}><Icon name="bell" size={12} />{d.source}</span>
      </div>

      <div>
        <div className="muted" style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: ".03em", textTransform: "uppercase", marginBottom: 12 }}>Aşama — tıklayarak ilerlet</div>
        <LeadStepper d={d} />
        {lost ? <div className="alert-strip" style={{ marginTop: 14 }}><span className="as-ic"><Icon name="alert" size={16} /></span><div style={{ flex: 1 }}><b style={{ fontSize: 13 }}>Talep kayıp olarak işaretlendi</b><div className="muted" style={{ fontSize: 12 }}>Kayıp nedeni not geçmişinde. Yeniden açmak için alttaki düğmeyi kullanın.</div></div></div> : null}
      </div>

      <Field label="Demo randevusu (tarih & saat)">
        <div className="row" style={{ gap: 8 }}>
          <input className="input" type="datetime-local" value={toLocalInput(d.scheduledAt)} onChange={(e) => { const ts = fromLocalInput(e.target.value); setDemoSchedule(d.id, ts); if (ts && d.status === "new") setDemoStatus(d.id, "contacted"); }} style={{ flex: 1 }} />
          {d.scheduledAt ? <button className="btn btn-light btn-sm" onClick={() => { setDemoSchedule(d.id, null); toast("Randevu kaldırıldı", { icon: "alert" }); }} title="Randevuyu kaldır"><Icon name="plus" size={15} style={{ transform: "rotate(45deg)" }} /></button> : null}
        </div>
        {d.scheduledAt ? <span className="muted" style={{ fontSize: 12, marginTop: 6, display: "block" }}><Icon name="calendar" size={12} /> {fmtDateTime(d.scheduledAt)} olarak planlandı</span> : null}
      </Field>

      <div>
        <div className="muted" style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: ".03em", textTransform: "uppercase", marginBottom: 9 }}>Görüşme notları</div>
        <div className="row" style={{ gap: 8, marginBottom: 12, alignItems: "flex-start" }}>
          <textarea className="input" rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="Görüşme / arama notu ekle…" style={{ flex: 1, resize: "vertical" }} onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) add(); }} />
          <button className="btn btn-primary" onClick={add} disabled={!text.trim()} style={{ flexShrink: 0 }}><Icon name="plus" size={16} />Ekle</button>
        </div>
        <div className="stack" style={{ gap: 9 }}>
          {notes.length === 0 ? <p className="muted" style={{ fontSize: 12.5 }}>Henüz not yok. İlk görüşme notunu ekleyin.</p> : notes.map((n) => (
            <div key={n.id} className="fb-card">
              <div className="fb-head"><span className="stat-icon tone-primary" style={{ width: 30, height: 30 }}><Icon name="notebook" size={15} /></span>
                <div style={{ flex: 1 }}><b style={{ fontSize: 12.5 }}>{n.author}</b><div className="muted" style={{ fontSize: 11 }}>{fmtDateTime(n.date)}</div></div>
                <button className="icon-btn" style={{ width: 30, height: 30 }} title="Sil" onClick={() => { deleteDemoNote(d.id, n.id); toast("Not silindi", { icon: "alert" }); }}><Icon name="plus" size={15} style={{ transform: "rotate(45deg)" }} /></button>
              </div>
              <p className="fb-quote">{n.text}</p>
            </div>
          ))}
        </div>
      </div>
      {showLost ? <LostReasonModal d={d} onClose={() => setShowLost(false)} /> : null}
    </Modal>
  );
}

/* ---- kay\u0131p olarak i\u015faretle (zorunlu a\u00e7\u0131klama) ---- */
function LostReasonModal({ d, onClose }) {
  const a = useAdmin();
  const [reason, setReason] = uS("");
  const author = a.viewerAccess === "full" ? "Platform Ekibi" : "Destek Ekibi";
  const ok = reason.trim().length > 0;
  const apply = () => {
    if (!ok) return;
    addDemoNote(d.id, "Kayıp nedeni: " + reason.trim(), author);
    setDemoStatus(d.id, "lost");
    toast(d.name + " kayıp olarak işaretlendi", { icon: "alert" });
    onClose();
  };
  return (
    <Modal title="Kayıp olarak işaretle" sub={d.name} width={460} onClose={onClose}
      foot={<><button className="btn btn-light" onClick={onClose}>Vazgeç</button><button className="btn btn-danger" style={{ marginLeft: "auto" }} disabled={!ok} onClick={apply}><Icon name="alert" size={16} />Kayıp olarak işaretle</button></>}>
      <Field label="Kayıp nedeni (zorunlu)"><textarea className="input" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Örn. Bütçe yetersiz, rakip tercih edildi, ulaşılamadı…" style={{ resize: "vertical" }} autoFocus /></Field>
      <p className="muted" style={{ fontSize: 12.5, lineHeight: 1.5 }}>Bu açıklama talebin not geçmişine eklenir ve talep <b>Kayıp</b> durumuna alınır.</p>
    </Modal>
  );
}

/* ---- gelen demo talebi kartı ---- */
function DemoCard({ d, canManage, onOpen, onLost }) {
  const meta = DEMO_STATUS[d.status] || DEMO_STATUS.new;
  const closed = d.status === "converted" || d.status === "lost";
  const noteCount = (d.notes || []).length;
  const advance = () => {
    const i = DEMO_FLOW.indexOf(d.status);
    const next = DEMO_FLOW[i + 1];
    if (next) { setDemoStatus(d.id, next); toast(d.name + " · " + DEMO_STATUS[next][1], { icon: next === "converted" ? "checkCircle" : "check" }); }
  };
  const nextLabel = { new: "İletişime geçildi", contacted: "Demo planlandı", scheduled: "Satışa döndü" }[d.status];
  return (
    <div className="card"><div className="card-pad" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="row" style={{ gap: 12, alignItems: "flex-start" }}>
        <OrgLogo name={d.name} tone={leadPlanColor(d)} size={42} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <b style={{ fontSize: 15, fontWeight: 800, display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.name}</b>
          <div className="row" style={{ gap: 6, flexWrap: "wrap", marginTop: 5 }}>
            <span className="badge badge-muted" style={{ height: 21, fontSize: 11 }}><Icon name={d.kind === "org" ? "building" : "users"} size={12} />{d.kind === "org" ? "Kurum" : "Bireysel koç"}</span>
            <span className={`badge badge-${meta[0]}`} style={{ height: 21, fontSize: 11 }}>{meta[1]}</span>
            <span className="muted" style={{ fontSize: 12 }}>{d.city} · {d.source} · {timeAgo(d.requestedAt)}</span>
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <span className="row" style={{ gap: 6, justifyContent: "flex-end", whiteSpace: "nowrap" }}><span className="plan-dot" style={{ background: leadPlanColor(d) }} /><b style={{ fontSize: 12.5 }}>{leadPlanName(d)}</b></span>
          <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>ilgilenilen plan</div>
        </div>
      </div>

      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
        <a className="badge badge-muted" href={"mailto:" + d.email} style={{ height: 26, textDecoration: "none" }}><Icon name="message" size={12} />{d.email}</a>
        <a className="badge badge-muted" href={"tel:" + d.phone.replace(/\s/g, "")} style={{ height: 26, textDecoration: "none" }}><Icon name="phone" size={12} />{d.phone}</a>
      </div>

      {d.note ? <p className="muted" style={{ fontSize: 12.5, lineHeight: 1.5 }}>{d.note}</p> : null}

      {(d.scheduledAt || noteCount > 0) ? (
        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          {d.scheduledAt ? <span className="badge badge-primary" style={{ height: 24 }}><Icon name="calendar" size={12} />Randevu: {fmtDateTime(d.scheduledAt)}</span> : null}
          {noteCount > 0 ? <span className="badge badge-muted" style={{ height: 24 }}><Icon name="notebook" size={12} />{noteCount} not</span> : null}
        </div>
      ) : null}

      {canManage ? (
        <div className="row" style={{ gap: 8, flexWrap: "wrap", borderTop: "1px solid var(--border)", paddingTop: 12 }}>
          {nextLabel ? <button className="btn btn-primary btn-sm" onClick={advance}><Icon name="check" size={14} />{nextLabel}</button> : null}
          <button className="btn btn-light btn-sm" onClick={() => onOpen(d.id)}><Icon name="notebook" size={14} />Detay & notlar</button>
          {closed && d.status === "lost" ? <button className="btn btn-light btn-sm" onClick={() => { setDemoStatus(d.id, "contacted"); toast(d.name + " talebi yeniden açıldı", { icon: "refresh" }); }}><Icon name="refresh" size={14} />Yeniden aç</button> : null}
          {!closed ? <button className="btn btn-light btn-sm" onClick={() => onLost(d)}><Icon name="alert" size={14} />Kayıp</button> : null}
          <button className="btn btn-ghost-danger btn-sm" style={{ marginLeft: "auto" }} title="Sil" onClick={() => { deleteDemoRequest(d.id); toast("Talep silindi", { icon: "alert" }); }}><Icon name="plus" size={14} style={{ transform: "rotate(45deg)" }} /></button>
        </div>
      ) : null}
    </div></div>
  );
}

/* ---- yeni demo talebi ekle ---- */
function AddDemoModal({ onClose }) {
  const [name, setName] = uS(""); const [kind, setKind] = uS("org");
  const [email, setEmail] = uS(""); const [phone, setPhone] = uS(""); const [city, setCity] = uS("");
  const plans = kind === "org" ? orgPlans() : coachPlans();
  const [planId, setPlanId] = uS(plans[0].id);
  const [source, setSource] = uS("Telefon"); const [note, setNote] = uS("");
  const ok = name.trim();
  const apply = () => {
    addDemoRequest({ name: name.trim(), kind, email: email.trim(), phone: phone.trim(), city: city.trim(), planId, source, note: note.trim() });
    toast("Demo talebi eklendi", { icon: "checkCircle" }); onClose();
  };
  return (
    <Modal title="Yeni demo talebi" sub="Telefon / e-posta ile gelen ilgiyi kaydet" onClose={onClose}
      foot={<><button className="btn btn-light" onClick={onClose}>Vazgeç</button><button className="btn btn-primary" style={{ marginLeft: "auto" }} disabled={!ok} onClick={apply}><Icon name="plus" size={16} />Talep ekle</button></>}>
      <Field label="Talep türü">
        <div className="seg" style={{ width: "100%" }}>
          <button className={kind === "org" ? "on" : ""} style={{ flex: 1 }} onClick={() => { setKind("org"); setPlanId(orgPlans()[0].id); }}>Kurum / Franchise</button>
          <button className={kind === "coach" ? "on" : ""} style={{ flex: 1 }} onClick={() => { setKind("coach"); setPlanId(coachPlans()[0].id); }}>Bireysel koç</button>
        </div>
      </Field>
      <Field label={kind === "org" ? "Kurum adı" : "Ad soyad"}><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder={kind === "org" ? "Örn. Yıldız Koleji" : "Örn. Mehmet Aksoy"} /></Field>
      <div className="grid g-2" style={{ gap: 12 }}>
        <Field label="E-posta"><input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@eposta.com" /></Field>
        <Field label="Telefon"><input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05xx xxx xx xx" /></Field>
      </div>
      <div className="grid g-2" style={{ gap: 12 }}>
        <Field label="Şehir"><input className="input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="İstanbul" /></Field>
        <Field label="Kaynak"><select className="input" value={source} onChange={(e) => setSource(e.target.value)}>{["Telefon", "Web sitesi", "Instagram", "Google reklam", "Referans", "Fuar / etkinlik"].map((s) => <option key={s} value={s}>{s}</option>)}</select></Field>
      </div>
      <Field label="İlgilenilen plan"><select className="input" value={planId} onChange={(e) => setPlanId(e.target.value)}>{plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
      <Field label="Not"><textarea className="input" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Görüşme notu (opsiyonel)" style={{ resize: "vertical" }} /></Field>
    </Modal>
  );
}

/* ============================================================
   ANA SAYFA — SALeads
   ============================================================ */
function SALeads() {
  const a = useAdmin();
  const demos = a.demoRequests || [];
  const signups = a.signups || [];
  const [tab, setTab] = uS("demo");
  const [statusF, setStatusF] = uS("all");
  const [q, setQ] = uS("");
  const [addOpen, setAddOpen] = uS(false);
  const [openId, setOpenId] = uS(null);
  const [lostId, setLostId] = uS(null);
  const openLead = openId ? demos.find((d) => d.id === openId) : null;
  const lostLead = lostId ? demos.find((d) => d.id === lostId) : null;

  /* demo takibi her iki rolde de açık (destek işi). Sadece kayıt silme bilgisel olarak farklı değil. */
  const isSupport = a.viewerAccess !== "full";

  const monthAgo = NOW - 30 * DAY;
  const openDemos = demos.filter((d) => d.status === "new" || d.status === "contacted" || d.status === "scheduled");
  const newDemos = demos.filter((d) => d.status === "new");
  const recentSignups = signups.filter((s) => s.at >= monthAgo);
  const newMembers = recentSignups.filter((s) => s.type === "new").length;
  const monthRevenue = recentSignups.reduce((sum, s) => sum + s.amount, 0);
  const closedDemos = demos.filter((d) => d.status === "converted" || d.status === "lost");
  const convCount = demos.filter((d) => d.status === "converted").length;
  const convRate = closedDemos.length ? Math.round((convCount / closedDemos.length) * 100) : 0;

  const FILTERS = [{ k: "all", l: "Tümü" }, { k: "new", l: "Yeni" }, { k: "contacted", l: "İletişimde" }, { k: "scheduled", l: "Planlandı" }, { k: "converted", l: "Döndü" }, { k: "lost", l: "Kayıp" }];
  const visibleDemos = demos
    .filter((d) => statusF === "all" ? true : d.status === statusF)
    .filter((d) => d.name.toLowerCase().includes(q.toLowerCase()) || (d.city || "").toLowerCase().includes(q.toLowerCase()))
    .sort((x, y) => y.requestedAt - x.requestedAt);

  /* funnel dilimleri */
  const funnel = [
    { k: "new", color: "var(--warning)" },
    { k: "contacted", color: "var(--info)" },
    { k: "scheduled", color: "var(--primary)" },
    { k: "converted", color: "var(--success)" },
    { k: "lost", color: "var(--faint)" },
  ].map((f) => ({ l: DEMO_STATUS[f.k][1], v: demos.filter((d) => d.status === f.k).length, color: f.color, icon: null }));

  const exportDemos = () => downloadCSV("demo-talepleri.csv", [
    ["Ad", "Tür", "Şehir", "Plan", "Kaynak", "Durum", "E-posta", "Telefon", "Tarih"],
    ...demos.map((d) => [d.name, d.kind === "org" ? "Kurum" : "Koç", d.city, leadPlanName(d), d.source, DEMO_STATUS[d.status][1], d.email, d.phone, fmtShort(d.requestedAt)]),
  ]);
  const exportSignups = () => downloadCSV("yeni-uyelikler.csv", [
    ["Üye", "Tür", "Şehir", "Plan", "İşlem", "Tutar", "Yöntem", "Tarih"],
    ...signups.map((s) => [s.name, s.kind === "org" ? "Kurum" : "Koç", s.city, leadPlanName(s), SIGNUP_TYPE[s.type][1], s.amount, s.method, fmtShort(s.at)]),
  ]);

  return (
    <div className="stack rise">
      <PageHead title="Demo & Üyelik Takibi" sub="Gelen demo taleplerini takip et, yeni üyelik ve satın almaları izle"
        actions={<>
          <button className="btn btn-light" onClick={tab === "demo" ? exportDemos : exportSignups}><Icon name="download" size={16} />CSV indir</button>
          {tab === "demo" ? <button className="btn btn-primary" onClick={() => setAddOpen(true)}><Icon name="plus" size={16} />Yeni demo talebi</button> : null}
        </>} />

      {isSupport ? (
        <div className="alert-strip">
          <span className="as-ic"><Icon name="message" size={16} /></span>
          <div style={{ flex: 1 }}><b style={{ fontSize: 13.5 }}>Destek yetkilisi erişimi</b><div className="muted" style={{ fontSize: 12 }}>Demo taleplerini takip edebilir ve durumlarını güncelleyebilirsiniz. Satın alma kayıtları yalnızca görüntülenir.</div></div>
        </div>
      ) : null}

      <div className="grid g-4">
        <StatCard icon="clock" tone="warning" value={openDemos.length} label="Açık demo talebi" sub={newDemos.length + " yeni"} />
        <StatCard icon="users" tone="success" value={newMembers} label="Yeni üyelik (30 gün)" />
        <StatCard icon="banknote" tone="primary" value={TRY(monthRevenue)} label="Satın alma (30 gün)" />
        <StatCard icon="trend" tone="info" value={"%" + convRate} label="Demo dönüşüm oranı" />
      </div>

      <div className="seg-tabs">
        <button className={`seg-tab${tab === "demo" ? " on" : ""}`} onClick={() => setTab("demo")}><Icon name="clipboard" size={16} />Demo talepleri<span className="tnum" style={{ marginLeft: 4, opacity: .6 }}>{demos.length}</span></button>
        <button className={`seg-tab${tab === "signup" ? " on" : ""}`} onClick={() => setTab("signup")}><Icon name="card" size={16} />Yeni üyelik & satın alma<span className="tnum" style={{ marginLeft: 4, opacity: .6 }}>{signups.length}</span></button>
      </div>

      {tab === "demo" ? (
        <div className="grid col-main">
          <div className="stack">
            <div className="between" style={{ flexWrap: "wrap", gap: 10 }}>
              <div className="seg">{FILTERS.map((f) => <button key={f.k} className={statusF === f.k ? "on" : ""} onClick={() => setStatusF(f.k)}>{f.l}</button>)}</div>
              <div className="searchbox" style={{ maxWidth: 260 }}><Icon name="search" size={17} /><input placeholder="Talep ara..." value={q} onChange={(e) => setQ(e.target.value)} /></div>
            </div>
            <div className="stack">
              {visibleDemos.map((d) => <DemoCard key={d.id} d={d} canManage={true} onOpen={setOpenId} onLost={(x) => setLostId(x.id)} />)}
            </div>
            {visibleDemos.length === 0 ? <EmptyState icon="clipboard" title="Talep bulunamadı" sub="Filtre veya aramayı değiştir" /> : null}
          </div>
          <div className="stack">
            <Section title="Talep hunisi" sub={demos.length + " toplam talep"}>
              <div className="card-body"><RankBars items={funnel} fmt={(v) => v} /></div>
            </Section>
            <Section title="Kaynaklar" sub="Talepler nereden geliyor">
              <div className="card-body" style={{ padding: 0 }}>
                {Object.entries(demos.reduce((acc, d) => { acc[d.source] = (acc[d.source] || 0) + 1; return acc; }, {}))
                  .sort((a2, b2) => b2[1] - a2[1])
                  .map(([src, n]) => (
                    <div key={src} className="kpi-row" style={{ padding: "13px 18px" }}>
                      <span className="muted" style={{ fontSize: 12.5 }}>{src}</span>
                      <b className="tnum" style={{ fontSize: 13 }}>{n}</b>
                    </div>
                  ))}
              </div>
            </Section>
          </div>
        </div>
      ) : (
        <Section title="Son üyelikler & satın almalar" sub={recentSignups.length + " işlem (son 30 gün) · " + TRY(monthRevenue)}>
          <div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
            <table className="tbl" style={{ minWidth: 760 }}>
              <thead><tr><th>Üye</th><th>Plan</th><th>İşlem</th><th>Yöntem</th><th>Tarih</th><th style={{ textAlign: "right" }}>Tutar</th></tr></thead>
              <tbody>{signups.slice().sort((x, y) => y.at - x.at).map((s) => { const meta = SIGNUP_TYPE[s.type] || SIGNUP_TYPE.new; return (
                <tr key={s.id}>
                  <td><div className="name"><OrgLogo name={s.name} tone={leadPlanColor(s)} size={34} /><div style={{ display: "flex", flexDirection: "column", lineHeight: 1.3 }}><b>{s.name}</b><span>{s.kind === "org" ? "Kurum" : "Bireysel koç"} · {s.city}</span></div></div></td>
                  <td><span className="row" style={{ gap: 7 }}><span className="plan-dot" style={{ background: leadPlanColor(s) }} /><span style={{ fontSize: 12.5, fontWeight: 600 }}>{leadPlanName(s)}</span></span></td>
                  <td><span className={`badge badge-${meta[0]}`} style={{ height: 22 }}>{meta[1]}</span></td>
                  <td><span className="muted" style={{ fontSize: 12.5 }}>{s.method}</span></td>
                  <td><span className="muted tnum" style={{ fontSize: 12.5 }}>{fmtShort(s.at)}</span></td>
                  <td style={{ textAlign: "right" }}><span className="tnum" style={{ fontWeight: 700 }}>{s.amount ? TRY(s.amount) : "—"}</span></td>
                </tr>
              ); })}</tbody>
            </table>
          </div>
        </Section>
      )}

      {addOpen ? <AddDemoModal onClose={() => setAddOpen(false)} /> : null}
      {openLead ? <LeadDetailModal d={openLead} onClose={() => setOpenId(null)} /> : null}
      {lostLead ? <LostReasonModal d={lostLead} onClose={() => setLostId(null)} /> : null}
    </div>
  );
}

Object.assign(window, { SALeads });
