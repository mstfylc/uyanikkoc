/* ============================================================
   Bildirim sistemi — rol bazlı bildirim akışı (topbar zili) +
   Ayarlar'daki bildirim tercihleri paneli. localStorage'da kalıcı.
   ============================================================ */

/* ---- bildirim akışı (seed) ---- */
function notifSeed() {
  return {
    student: [
      { id: "s1", icon: "clipboard", tone: "primary", title: "Yeni ödev atandı", desc: "Matematik · Türev — 40 soru, son teslim 6 Haziran", min: 12, read: false, page: "assignments" },
      { id: "s2", icon: "chart", tone: "info", title: "Deneme sonucun hazır", desc: "Apotemi TYT-3 · 31 net — analizini incele", min: 95, read: false, page: "exams" },
      { id: "s3", icon: "calendar", tone: "warning", title: "Randevu hatırlatması", desc: "Koç görüşmen yarın 17:00'de (yüz yüze)", min: 240, read: false, page: "appointments" },
      { id: "s4", icon: "flame", tone: "danger", title: "Seri rekorun yolda 🔥", desc: "12 gündür kesintisizsin — bugünü de tamamla", min: 600, read: true, page: "motivation" },
      { id: "s5", icon: "message", tone: "info", title: "Koçundan mesaj", desc: "Dilek Emen: Paragrafa biraz daha ağırlık verelim.", min: 1450, read: true, page: "dashboard" },
    ],
    coach: [
      { id: "c1", icon: "alert", tone: "danger", title: "Risk altında öğrenci", desc: "Ece Şahin 4 gündür ödev tamamlamadı", min: 30, read: false, page: "students" },
      { id: "c2", icon: "checkCircle", tone: "success", title: "Ödev tamamlandı", desc: "Elif Yıldız · Türev ödevini bitirdi (31/40 doğru)", min: 75, read: false, page: "c-assignments" },
      { id: "c3", icon: "chart", tone: "info", title: "Yeni deneme sonuçları", desc: "ÖZDEBİR TYT-5 sonuçları içe aktarılmayı bekliyor", min: 180, read: false, page: "c-exams" },
      { id: "c4", icon: "calendar", tone: "warning", title: "Randevu talebi", desc: "Mert Demir online görüşme istedi · onayla", min: 320, read: false, page: "appointments" },
      { id: "c5", icon: "banknote", tone: "success", title: "Tahsilat alındı", desc: "Can Aydın · VIP yıllık ödemesi tamamlandı", min: 900, read: true, page: "revenue" },
    ],
    parent: [
      { id: "p1", icon: "chart", tone: "info", title: "Çocuğunuzun deneme sonucu", desc: "Elif · TYT-3 denemesinde 31 net (+2.5)", min: 95, read: false, page: "p-exams" },
      { id: "p2", icon: "trend", tone: "success", title: "Haftalık gelişim raporu", desc: "Bu hafta %86 ödev tamamlama — raporu görüntüle", min: 300, read: false, page: "dashboard" },
      { id: "p3", icon: "calendar", tone: "warning", title: "Veli görüşmesi", desc: "Koç Dilek Emen ile görüşme Cuma 18:00", min: 720, read: false, page: "appointments" },
      { id: "p4", icon: "card", tone: "primary", title: "Abonelik yenileme", desc: "Plus Koçluk aboneliğiniz 279 gün sonra yenilenecek", min: 2880, read: true, page: "billing" },
    ],
  };
}

const NOTIF_KEY = "uk_notif_v2";
let _notif = (() => { try { const s = localStorage.getItem(NOTIF_KEY); if (s) return JSON.parse(s); } catch (e) {} return notifSeed(); })();
const _nListeners = new Set();
function persistNotif() { try { localStorage.setItem(NOTIF_KEY, JSON.stringify(_notif)); } catch (e) {} _nListeners.forEach((l) => l()); }

function useNotifs(role) {
  const [, force] = React.useState(0);
  React.useEffect(() => { const l = () => force((x) => x + 1); _nListeners.add(l); return () => _nListeners.delete(l); }, []);
  const list = _notif[role] || [];
  return {
    list,
    unread: list.filter((n) => !n.read).length,
    markRead: (id) => { _notif = { ..._notif, [role]: list.map((n) => n.id === id ? { ...n, read: true } : n) }; persistNotif(); },
    markAll: () => { _notif = { ..._notif, [role]: list.map((n) => ({ ...n, read: true })) }; persistNotif(); },
    remove: (id) => { _notif = { ..._notif, [role]: list.filter((n) => n.id !== id) }; persistNotif(); },
  };
}

function relTime(min) {
  if (min < 1) return "az önce";
  if (min < 60) return min + " dk önce";
  const h = Math.floor(min / 60);
  if (h < 24) return h + " saat önce";
  const d = Math.floor(h / 24);
  return d + " gün önce";
}

/* ---- Topbar zili + açılır panel ---- */
function NotifBell({ role, goPage }) {
  const { list, unread, markRead, markAll } = useNotifs(role);
  const [open, setOpen] = useState(false);
  const today = list.filter((n) => n.min < 1440);
  const earlier = list.filter((n) => n.min >= 1440);
  const onClick = (n) => { markRead(n.id); setOpen(false); if (n.page) window.dispatchEvent(new CustomEvent("uk-nav", { detail: { page: n.page } })); };

  const Row = (n) => (
    <button key={n.id} className={`notif-row${n.read ? "" : " unread"}`} onClick={() => onClick(n)}>
      <span className={`notif-ic tone-${n.tone}`}><Icon name={n.icon} size={16} /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="notif-title">{n.title}</div>
        <div className="notif-desc">{n.desc}</div>
        <div className="notif-time">{relTime(n.min)}</div>
      </div>
      {!n.read ? <span className="notif-dot" /> : null}
    </button>
  );

  return (
    <div style={{ position: "relative" }}>
      <button className="icon-btn" aria-label="Bildirimler" onClick={() => setOpen((o) => !o)}>
        <Icon name="bell" size={19} />
        {unread > 0 ? <span className="notif-badge tnum">{unread > 9 ? "9+" : unread}</span> : null}
      </button>
      {open ? (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setOpen(false)} />
          <div className="notif-pop">
            <div className="notif-pop-head">
              <div className="row" style={{ gap: 8 }}><b style={{ fontSize: 14 }}>Bildirimler</b>{unread > 0 ? <span className="badge badge-primary" style={{ height: 20, fontSize: 10.5 }}>{unread} yeni</span> : null}</div>
              {unread > 0 ? <button className="link-btn" style={{ fontSize: 12 }} onClick={markAll}>Tümünü okundu işaretle</button> : null}
            </div>
            <div className="notif-list">
              {list.length === 0 ? (
                <div style={{ padding: "36px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}><Icon name="bell" size={26} style={{ color: "var(--faint)" }} /><div style={{ marginTop: 8 }}>Yeni bildirim yok</div></div>
              ) : (
                <>
                  {today.length > 0 ? <div className="notif-sec">Bugün</div> : null}
                  {today.map(Row)}
                  {earlier.length > 0 ? <div className="notif-sec">Daha önce</div> : null}
                  {earlier.map(Row)}
                </>
              )}
            </div>
            <button className="notif-foot" onClick={() => { setOpen(false); goPage("settings"); }}>
              <Icon name="settings" size={15} />Bildirim ayarları
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}

/* ============================================================
   Bildirim Tercihleri (Ayarlar → Bildirimler)
   ============================================================ */
const NOTIF_CHANNELS = [
  { key: "app", label: "Uygulama", icon: "bell" },
  { key: "email", label: "E-posta", icon: "message" },
  { key: "sms", label: "SMS", icon: "send" },
];

const NOTIF_CATS = {
  student: [
    { key: "odev", icon: "clipboard", tone: "primary", title: "Ödev hatırlatmaları", desc: "Yeni ödev, yaklaşan ve geciken teslimler" },
    { key: "deneme", icon: "chart", tone: "info", title: "Deneme sonuçları", desc: "Sonuç yayınlandığında ve analiz hazır olduğunda" },
    { key: "randevu", icon: "calendar", tone: "warning", title: "Randevu hatırlatmaları", desc: "Koç görüşmelerinden önce hatırlatma" },
    { key: "mesaj", icon: "message", tone: "info", title: "Mesajlar", desc: "Koçundan gelen yeni mesajlar" },
    { key: "motivasyon", icon: "flame", tone: "danger", title: "Motivasyon & seri", desc: "Çalışma serisi, rozetler ve günlük hatırlatma" },
  ],
  coach: [
    { key: "odev", icon: "clipboard", tone: "primary", title: "Ödev & görev", desc: "Öğrenci ödevi tamamladığında veya geciktiğinde" },
    { key: "risk", icon: "alert", tone: "danger", title: "Risk uyarıları", desc: "Öğrenci aktivitesi düştüğünde erken uyarı" },
    { key: "deneme", icon: "chart", tone: "info", title: "Deneme sonuçları", desc: "İçe aktarılan denemeler ve sınıf ortalaması" },
    { key: "randevu", icon: "calendar", tone: "warning", title: "Randevu talepleri", desc: "Yeni randevu istekleri ve hatırlatmalar" },
    { key: "mesaj", icon: "message", tone: "info", title: "Mesajlar", desc: "Öğrenci ve velilerden gelen mesajlar" },
    { key: "tahsilat", icon: "banknote", tone: "success", title: "Tahsilat & gelir", desc: "Ödeme alındığında ve geciken tahsilatlarda" },
  ],
  parent: [
    { key: "deneme", icon: "chart", tone: "info", title: "Deneme sonuçları", desc: "Çocuğunuzun deneme sonuçları yayınlandığında" },
    { key: "ozet", icon: "trend", tone: "success", title: "Haftalık rapor", desc: "Gelişim özeti ve tamamlama oranları" },
    { key: "randevu", icon: "calendar", tone: "warning", title: "Veli görüşmeleri", desc: "Koçla planlanan görüşme hatırlatmaları" },
    { key: "mesaj", icon: "message", tone: "info", title: "Mesajlar", desc: "Koçtan gelen mesaj ve duyurular" },
    { key: "odeme", icon: "card", tone: "primary", title: "Ödeme & abonelik", desc: "Yenileme, fatura ve ödeme hatırlatmaları" },
  ],
};

const NPREF_KEY = "uk_notif_prefs_v1";
function notifPrefDefaults(role) {
  const m = {};
  (NOTIF_CATS[role] || []).forEach((c) => {
    m[c.key] = { app: true, email: c.key !== "motivasyon", sms: c.key === "randevu" || c.key === "risk" };
  });
  return { types: m, quiet: { enabled: true, from: "22:00", to: "07:00" } };
}
function loadNotifPrefs(role) {
  try { const s = JSON.parse(localStorage.getItem(NPREF_KEY) || "{}"); if (s[role]) return s[role]; } catch (e) {}
  return notifPrefDefaults(role);
}
function saveNotifPrefs(role, prefs) {
  let all = {}; try { all = JSON.parse(localStorage.getItem(NPREF_KEY) || "{}"); } catch (e) {}
  all[role] = prefs; localStorage.setItem(NPREF_KEY, JSON.stringify(all));
}

function NotificationSettings({ role }) {
  const cats = NOTIF_CATS[role] || NOTIF_CATS.student;
  const [prefs, setPrefs] = useState(() => loadNotifPrefs(role));
  const [saved, setSaved] = useState(false);
  useEffect(() => { setPrefs(loadNotifPrefs(role)); }, [role]);

  const setType = (cat, ch, val) => setPrefs((p) => ({ ...p, types: { ...p.types, [cat]: { ...p.types[cat], [ch]: val } } }));
  const setQuiet = (patch) => setPrefs((p) => ({ ...p, quiet: { ...p.quiet, ...patch } }));
  const commit = () => { saveNotifPrefs(role, prefs); setSaved(true); setTimeout(() => setSaved(false), 1800); if (typeof toast === "function") toast("Bildirim tercihlerin kaydedildi"); };

  const activeCount = cats.reduce((a, c) => a + NOTIF_CHANNELS.filter((ch) => prefs.types[c.key] && prefs.types[c.key][ch.key]).length, 0);

  return (
    <div className="stack">
      <Section
        title="Bildirim Tercihleri"
        sub="Hangi bildirimleri hangi kanaldan alacağını seç"
        action={<button className="btn btn-primary btn-sm" onClick={commit}><Icon name={saved ? "check" : "settings"} size={15} />{saved ? "Kaydedildi" : "Tercihleri kaydet"}</button>}
      >
        <div className="card-body" style={{ padding: 0 }}>
          {/* kanal başlıkları */}
          <div className="npref-grid npref-head">
            <div className="npref-cat-h">Bildirim türü</div>
            {NOTIF_CHANNELS.map((ch) => (
              <div key={ch.key} className="npref-ch-h"><Icon name={ch.icon} size={14} />{ch.label}</div>
            ))}
          </div>
          {cats.map((c) => (
            <div className="npref-grid npref-row" key={c.key}>
              <div className="npref-cat">
                <span className={`notif-ic tone-${c.tone}`} style={{ width: 34, height: 34 }}><Icon name={c.icon} size={16} /></span>
                <div style={{ minWidth: 0 }}>
                  <div className="npref-title">{c.title}</div>
                  <div className="npref-desc">{c.desc}</div>
                </div>
              </div>
              {NOTIF_CHANNELS.map((ch) => {
                const on = !!(prefs.types[c.key] && prefs.types[c.key][ch.key]);
                return (
                  <div key={ch.key} className="npref-ch">
                    <button className={`switch sm${on ? " on" : ""}`} onClick={() => setType(c.key, ch.key, !on)} aria-label={`${c.title} · ${ch.label}`}><span /></button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Rahatsız Etme Saatleri" sub="Bu aralıkta uygulama ve SMS bildirimleri ertelenir">
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <label className="renew-toggle">
            <div><b style={{ fontSize: 13.5 }}>Rahatsız etme modu</b><div className="muted" style={{ fontSize: 12 }}>Belirlediğin saatlerde sessize alınır</div></div>
            <button className={`switch${prefs.quiet.enabled ? " on" : ""}`} onClick={() => setQuiet({ enabled: !prefs.quiet.enabled })} aria-label="Rahatsız etme"><span /></button>
          </label>
          {prefs.quiet.enabled ? (
            <div className="row" style={{ gap: 14, flexWrap: "wrap" }}>
              <div className="field"><label className="label">Başlangıç</label><input type="time" className="input tnum" style={{ width: 140 }} value={prefs.quiet.from} onChange={(e) => setQuiet({ from: e.target.value })} /></div>
              <div className="field"><label className="label">Bitiş</label><input type="time" className="input tnum" style={{ width: 140 }} value={prefs.quiet.to} onChange={(e) => setQuiet({ to: e.target.value })} /></div>
              <div className="row" style={{ alignSelf: "flex-end", gap: 7, color: "var(--muted)", fontSize: 12, paddingBottom: 10 }}><Icon name="moon" size={14} />Acil tahsilat/randevu bildirimleri istisna</div>
            </div>
          ) : null}
        </div>
      </Section>

      <div className="muted" style={{ fontSize: 11.5, display: "flex", alignItems: "center", gap: 6, paddingLeft: 2 }}>
        <Icon name="bell" size={13} />{activeCount} kanal etkin · E-posta {(loadAuth && loadAuth()?.email) || "hesabına"} adresine gönderilir.
      </div>
    </div>
  );
}

Object.assign(window, { useNotifs, NotifBell, NotificationSettings, relTime });

/* feed'e dışarıdan bildirim ekle (ör. koç motivasyon/rapor gönderince) */
function pushNotif(role, n) {
  const list = _notif[role] || [];
  _notif = { ..._notif, [role]: [{ id: "n" + Date.now() + Math.round(Math.random() * 999), min: 0, read: false, ...n }, ...list] };
  persistNotif();
}
window.pushNotif = pushNotif;
