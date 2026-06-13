/* Uyanık Koç mobil — Web v4 paritesi (paylaşılan):
   · Destek / SSS ekranı (öğrenci/veli/koç) — akordeon + arama + kategori + talep
   · Deneme Kayıt + Üyelik sistemi (Yüz Yüze / Kargo) + Online Optik form
   · Şifre & Güvenlik sheet'i
   Hepsi localStorage'da kalıcı, mobil tasarım diline uyumlu. */

/* ============================================================
   KÜÇÜK STORE YARDIMCILARI
   ============================================================ */
function mvGet(key, def) { try { const s = localStorage.getItem(key); if (s) return JSON.parse(s); } catch (e) {} return def; }
function mvSet(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) {} }
const _mvL = new Set();
function mvNotify() { _mvL.forEach((l) => l()); }
function useMV() {
  const [, force] = React.useState(0);
  React.useEffect(() => { const l = () => force((x) => x + 1); _mvL.add(l); return () => _mvL.delete(l); }, []);
}

/* ============================================================
   SSS + DESTEK
   ============================================================ */
const MV_SSS = {
  student: [
    { q: "Ödevimin sonucunu nasıl girerim?", a: "Ödevlerim sekmesinde ilgili ödevde “Sonuç Gir” butonuna dokun, doğru/yanlış/boş sayını gir. Net otomatik hesaplanır ve koçun görür.", cat: "odev" },
    { q: "Denemeye nasıl kayıt olurum?", a: "Denemeler sekmesinde “Denemeye kayıt ol” butonuna dokun, yaklaşan denemelerden birini seç. Üyeliğin varsa pakete dahildir; yoksa ücretini ödeyerek kaydolursun.", cat: "deneme" },
    { q: "Kargo üyeliğim var, denemeyi nasıl çözerim?", a: "Aylık Kargo Üyeliğinde deneme kitapçığın adresine gelir. Kayıt olduğun denemeyi “Online optik formu doldur” ile girersin; net anında hesaplanır.", cat: "deneme" },
    { q: "Koçumdan nasıl randevu alırım?", a: "Profil → Randevularım veya ana sayfadaki Randevu kısayolundan “Randevu İste” ile online/yüz yüze ve müsait saat seçersin.", cat: "randevu" },
    { q: "Elimdeki kaynakları nasıl eklerim?", a: "Profil → Kaynaklarım alanından sahip olduğun kitapları ekle. Koçun ödev atarken bunlardan seçebilir.", cat: "odev" },
    { q: "Rozetleri nasıl kazanırım?", a: "Profil → Başarımlar bölümünde rozetlerin görünür. Seri yapma, deneme çözme, hedef tutturma ile rozet kazanırsın.", cat: "hesap" },
  ],
  parent: [
    { q: "Çocuğumun deneme sonuçlarını nereden görürüm?", a: "Denemeler sekmesinde çocuğunun her denemedeki neti, sıralaması ve ders bazında gelişimi listelenir.", cat: "deneme" },
    { q: "Gelişim raporları ne sıklıkla geliyor?", a: "Koç haftalık raporu hazırlayıp onayladığında Raporlar sekmene düşer ve bildirim alırsın.", cat: "rapor" },
    { q: "Koçla nasıl iletişime geçerim?", a: "Ana sayfadaki Koça Mesaj kısayolundan doğrudan yazabilir, Randevu’dan veli görüşmesi talep edebilirsin.", cat: "randevu" },
    { q: "Aboneliğimi ve deneme üyeliğini nasıl yönetirim?", a: "Profil → Ödeme & Abonelik’ten koçluk paketini, deneme üyeliğini (yüz yüze / kargo) ve faturaları görüp yönetebilirsin.", cat: "hesap" },
    { q: "Birden fazla çocuğum var, nasıl geçiş yaparım?", a: "Ana sayfanın üstündeki çocuk seçiciden çocuklar arasında geçiş yapabilirsin; tüm veriler seçili çocuğa göre güncellenir.", cat: "hesap" },
  ],
  coach: [
    { q: "Öğrenciye nasıl ödev atarım?", a: "Öğrenci detayında “Ödev Ata” ile ders → konu, tür (soru/test/konu), kaynak ve sayı belirle. Toplu atama için Görevler ekranını kullan.", cat: "odev" },
    { q: "Yeni deneme oluşturup öğrenci kaydı alabilir miyim?", a: "Denemeler ekranında “Deneme Oluştur” ile tarih/tür/yer belirle. Öğrenciler kendi uygulamasından kayıt olur; kayıt ve ödeme/paket durumunu deneme kartından görürsün.", cat: "deneme" },
    { q: "Randevu taleplerini nasıl onaylarım?", a: "Program sekmesinde bekleyen randevuların “Onayla / Reddet” butonlarıyla yönetilir.", cat: "randevu" },
    { q: "Öğrenciye gizli not bırakabilir miyim?", a: "Öğrenci detayında “Gizli Not” alanı yalnızca sana görünür; veli ve öğrenci göremez.", cat: "hesap" },
    { q: "Toplu duyuruyu kimler görür?", a: "Toplu Duyuru tüm kadrona aynı anda iletilir; öğrencilerin bildirim olarak alır.", cat: "hesap" },
  ],
};
const MV_CATS = { all: "Tümü", deneme: "Denemeler", odev: "Ödev & Konu", randevu: "Randevu", rapor: "Rapor", hesap: "Hesap" };

const MV_TK_KEY = "uk_m_tickets_v1";
const MV_TK_STATUS = { open: { label: "Açık", tone: "warning" }, answered: { label: "Yanıtlandı", tone: "success" }, closed: { label: "Kapandı", tone: "muted" } };
function mvTickets() {
  return mvGet(MV_TK_KEY, [
    { id: "DST-2052", cat: "oneri", msg: "Haftalık rapora SMS bildirimi eklenebilir mi?", status: "open", reply: null },
    { id: "DST-2038", cat: "hesap", msg: "Koçumu göremiyorum, panel boş geliyor.", status: "answered", reply: "Hesabın koça bağlandı, artık görünüyor. İyi çalışmalar!" },
  ]);
}

function DestekScreen({ role = "student", onBack }) {
  useMV();
  const faqAll = MV_SSS[role] || MV_SSS.student;
  const [open, setOpen] = useState(0);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [tkCat, setTkCat] = useState("teknik");
  const [msg, setMsg] = useState("");
  const cats = ["all", ...[...new Set(faqAll.map((x) => x.cat))]];
  const list = faqAll.filter((x) => (cat === "all" || x.cat === cat) && (q.trim() === "" || (x.q + " " + x.a).toLocaleLowerCase("tr-TR").includes(q.toLocaleLowerCase("tr-TR"))));
  const tickets = mvTickets();
  const TK = { teknik: "Teknik sorun", oneri: "Öneri", hesap: "Hesap", diger: "Diğer" };
  const send = () => {
    if (msg.trim().length < 5) return;
    const id = "DST-" + Math.floor(2100 + Math.random() * 800);
    mvSet(MV_TK_KEY, [{ id, cat: tkCat, msg: msg.trim(), status: "open", reply: null }, ...tickets]); mvNotify();
    setMsg(""); ukToast("Destek talebin oluşturuldu · " + id);
  };

  return (
    <div className="uk-scroll">
      <div className="uk-safe-top" />
      <SubHeader title="Yardım & Destek" sub="Sık sorulan sorular ve iletişim" onBack={onBack} />

      {/* iletişim kanalları */}
      <div className="uk-sec" style={{ gap: 9 }}>
        {[["message", "Canlı Destek", "Hafta içi 09:00 – 18:00", "primary"], ["mail", "E-posta", "destek@uyanikkoc.com", "info"]].map(([ic, t, d, tone]) => (
          <div className="uk-li" key={t} style={{ cursor: "pointer" }} onClick={() => ukToast(t + " · " + d)}>
            <span className="lic" style={{ background: `var(--${tone}-soft)`, color: `var(--${tone})` }}><MIcon name={ic} size={17} /></span>
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 14, fontWeight: 700 }}>{t}</div><div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>{d}</div></div>
            <MIcon name="chevronRight" size={18} style={{ color: "var(--faint)" }} />
          </div>
        ))}
      </div>

      {/* SSS */}
      <div className="uk-sec" style={{ marginTop: 22 }}>
        <div className="uk-sec-head"><h2>Sık Sorulan Sorular</h2><span className="uk-badge muted">{list.length}</span></div>
        <div className="uk-inputwrap" style={{ height: 46, marginBottom: 10 }}>
          <MIcon name="help" size={17} style={{ color: "var(--faint)" }} />
          <input placeholder="Soru ara…" value={q} onChange={(e) => { setQ(e.target.value); setOpen(-1); }} style={{ fontSize: 14 }} />
        </div>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 12 }}>
          {cats.map((c) => (
            <button key={c} className={`uk-seg${cat === c ? " on" : ""}`} style={{ height: 34 }} onClick={() => { setCat(c); setOpen(-1); }}>{MV_CATS[c] || c}</button>
          ))}
        </div>
        <div className="uk-list">
          {list.length === 0 ? <div style={{ padding: "20px 14px", textAlign: "center", color: "var(--muted)", fontSize: 13, fontWeight: 600 }}>“{q}” için sonuç yok. Aşağıdan destek talebi oluşturabilirsin.</div> : null}
          {list.map((item, i) => {
            const on = open === i;
            return (
              <div key={item.q} style={{ borderBottom: "1px solid var(--border)" }}>
                <button onClick={() => setOpen(on ? -1 : i)} style={{ width: "100%", textAlign: "left", background: "none", border: "none", padding: "14px 4px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, flex: 1, color: "var(--text)", lineHeight: 1.4 }}>{item.q}</span>
                  <MIcon name="chevronDown" size={17} style={{ color: "var(--faint)", flexShrink: 0, transform: on ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
                </button>
                {on ? <div style={{ padding: "0 4px 14px", fontSize: 13, color: "var(--text-2)", lineHeight: 1.55 }}>{item.a}</div> : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* talep oluştur */}
      <div className="uk-sec" style={{ marginTop: 22 }}>
        <div className="uk-sec-head"><h2>Destek Talebi</h2></div>
        <div className="uk-card uk-card-pad">
          <div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--text-2)", marginBottom: 8 }}>Konu</div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 14 }}>
            {Object.entries(TK).map(([k, v]) => <button key={k} className={`uk-seg${tkCat === k ? " on" : ""}`} style={{ height: 34 }} onClick={() => setTkCat(k)}>{v}</button>)}
          </div>
          <textarea rows={4} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Yaşadığın sorunu veya önerini yaz…"
            style={{ width: "100%", border: "1.5px solid var(--border-strong)", borderRadius: 12, padding: "11px 13px", font: "inherit", fontSize: 14, fontWeight: 500, color: "var(--text)", background: "var(--surface)", resize: "vertical", boxSizing: "border-box" }} />
          <button className="uk-btn uk-btn-primary uk-btn-block" style={{ marginTop: 12 }} disabled={msg.trim().length < 5} onClick={send}><MIcon name="send" size={16} /> Gönder</button>
        </div>
      </div>

      {/* taleplerim */}
      <div className="uk-sec" style={{ marginTop: 22 }}>
        <div className="uk-sec-head"><h2>Taleplerim</h2><span className="uk-badge muted">{tickets.filter((t) => t.status !== "closed").length} açık</span></div>
        <div className="uk-sec" style={{ gap: 9, padding: 0 }}>
          {tickets.length === 0 ? <div style={{ padding: "18px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Henüz talebin yok.</div>
            : tickets.map((t) => {
              const st = MV_TK_STATUS[t.status] || MV_TK_STATUS.open;
              return (
                <div className="uk-card uk-card-pad" key={t.id}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)" }} className="tnum">{t.id}</span>
                    <span style={{ fontSize: 12, color: "var(--faint)" }}>· {TK[t.cat] || t.cat}</span>
                    <span className={`uk-badge ${st.tone}`} style={{ marginLeft: "auto" }}>{st.label}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 7, lineHeight: 1.45 }}>{t.msg}</div>
                  {t.reply ? <div style={{ marginTop: 9, background: "var(--surface-3)", borderRadius: 10, padding: "9px 12px", fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.5 }}><b style={{ color: "var(--primary-600)", fontSize: 11.5 }}>Destek ekibi:</b> {t.reply}</div> : null}
                </div>
              );
            })}
        </div>
      </div>
      <div style={{ height: 24 }} />
    </div>
  );
}

/* ============================================================
   DENEME — ÜYELİK + KAYIT + ONLINE OPTİK
   ============================================================ */
const MV_PLANS = [
  { id: "yuzyuze", name: "Yüz Yüze Deneme Paketi", mode: "yuzyuze", color: "var(--primary)", price: 1200, popular: true, tagline: "Kurumda gözetmenli, kağıt deneme",
    perks: ["Ayda 4 yüz yüze deneme", "Kurumda optik okuma", "Anında net & sıralama", "Salonda sınav provası"] },
  { id: "kargo", name: "Aylık Kargo Üyeliği", mode: "kargo", color: "var(--info)", price: 750, tagline: "Denemeler adresine gelir, online optik",
    perks: ["Her ay kargoyla adresine", "Online optik formdan giriş", "Net anında otomatik", "Dilediğin yerde, dilediğin saatte"],
    note: "Bu üyelikte kayıt olduğun denemeleri online optik formdan doldurursun." },
];
function mvPlan(id) { return MV_PLANS.find((p) => p.id === id) || null; }
const MV_EVENTS = [
  { id: "ev1", name: "TYT Genel Deneme #8", examType: "TYT", date: "14 Haz 2026", time: "10:00", place: "Kampüs Koç · Kadıköy", soru: 120, price: 150 },
  { id: "ev2", name: "AYT Sayısal Deneme #4", examType: "AYT", date: "21 Haz 2026", time: "10:00", place: "Kampüs Koç · Kadıköy", soru: 80, price: 150 },
  { id: "ev4", name: "TYT Kamp Denemesi", examType: "TYT", date: "28 Haz 2026", time: "13:30", place: "Online / Kargo", soru: 120, price: 120 },
];
/* optik bölümleri (örnek) */
const MV_OPTIK_PARTS = {
  TYT: [{ n: "Türkçe", max: 40 }, { n: "Sosyal", max: 20 }, { n: "Matematik", max: 40 }, { n: "Fen", max: 20 }],
  AYT: [{ n: "Matematik", max: 40 }, { n: "Fizik", max: 14 }, { n: "Kimya", max: 13 }, { n: "Biyoloji", max: 13 }],
};

const MV_MEM_KEY = "uk_m_membership_v1";
const MV_REG_KEY = "uk_m_regs_v1";
function mvMembership() { return mvGet(MV_MEM_KEY, "kargo"); }
function mvSetMembership(id) { mvSet(MV_MEM_KEY, id); mvNotify(); }
function mvRegs() { return mvGet(MV_REG_KEY, {}); }
function mvIsReg(id) { return !!mvRegs()[id]; }
function mvRegister(id) {
  const mem = mvMembership();
  const mode = mem === "kargo" ? "online" : "yuzyuze";
  const payment = mem ? "paket" : "odendi";
  const r = { ...mvRegs(), [id]: { mode, payment, optik: null } };
  mvSet(MV_REG_KEY, r); mvNotify();
  return { mode, payment };
}
function mvSetOptik(id, optik) { const r = { ...mvRegs() }; if (r[id]) { r[id] = { ...r[id], optik }; mvSet(MV_REG_KEY, r); mvNotify(); } }

/* Üyelik seçim sheet'i */
function DenemeUyelikSheet({ onClose }) {
  useMV();
  const cur = mvMembership();
  return (
    <div className="uk-sheet-overlay" onClick={onClose}>
      <div className="uk-sheet" onClick={(e) => e.stopPropagation()} style={{ maxHeight: "88%", overflowY: "auto" }}>
        <div className="uk-grip" />
        <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 2 }}>Deneme Üyeliği</div>
        <div style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600, marginBottom: 16 }}>Deneme sınavlarına erişim için paket seç</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {MV_PLANS.map((p) => {
            const isCur = cur === p.id;
            return (
              <div key={p.id} className="uk-card uk-card-pad" style={{ border: isCur ? "1.5px solid var(--primary)" : "1px solid var(--border)", position: "relative" }}>
                {p.popular ? <span className="uk-badge primary" style={{ position: "absolute", top: -10, right: 14 }}>En çok tercih edilen</span> : null}
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 4, background: p.color }} />
                  <div style={{ fontSize: 15.5, fontWeight: 800 }}>{p.name}</div>
                </div>
                <div style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600, marginTop: 3 }}>{p.tagline}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 10 }}><span style={{ fontSize: 24, fontWeight: 800 }} className="tnum">₺{p.price.toLocaleString("tr-TR")}</span><span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>/ay</span></div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7, margin: "12px 0" }}>
                  {p.perks.map((f, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, fontWeight: 600, color: "var(--text-2)" }}><MIcon name="check" size={14} stroke={2.6} style={{ color: p.color, flexShrink: 0 }} /> {f}</div>)}
                </div>
                {p.note ? <div style={{ background: "var(--info-soft)", borderRadius: 10, padding: "9px 11px", fontSize: 11.5, color: "var(--text-2)", display: "flex", gap: 7, marginBottom: 12, lineHeight: 1.45 }}><MIcon name="notebook" size={14} style={{ color: "var(--info)", flexShrink: 0 }} /> {p.note}</div> : null}
                {isCur
                  ? <button className="uk-btn uk-btn-light uk-btn-block" disabled style={{ opacity: .8, boxShadow: "none" }}><MIcon name="check" size={16} /> Mevcut üyeliğin</button>
                  : <button className="uk-btn uk-btn-primary uk-btn-block" onClick={() => { mvSetMembership(p.id); ukToast(p.name + " aktif edildi"); }}>{p.name} Seç</button>}
              </div>
            );
          })}
        </div>
        {cur ? <button className="uk-btn uk-btn-light uk-btn-block" style={{ marginTop: 12, color: "var(--danger)", boxShadow: "none" }} onClick={() => { mvSetMembership(null); ukToast("Deneme üyeliğin iptal edildi"); }}>Üyeliği iptal et</button> : null}
        <button className="uk-btn uk-btn-light uk-btn-block" style={{ marginTop: 10, boxShadow: "none" }} onClick={onClose}>Kapat</button>
        <div style={{ height: 6 }} />
      </div>
    </div>
  );
}

/* Online optik form sheet'i */
function OptikSheet({ ev, onClose }) {
  const parts = MV_OPTIK_PARTS[ev.examType] || MV_OPTIK_PARTS.TYT;
  const [vals, setVals] = useState(parts.map(() => ({ d: "", y: "" })));
  const set = (i, k, v) => setVals(vals.map((x, j) => j === i ? { ...x, [k]: v.replace(/\D/g, "") } : x));
  const partNet = (i) => { const d = +vals[i].d || 0, y = +vals[i].y || 0; return Math.max(0, d - y / 4); };
  const total = parts.reduce((a, _, i) => a + partNet(i), 0);
  const submit = () => { mvSetOptik(ev.id, { net: +total.toFixed(2), parts: parts.map((p, i) => ({ n: p.n, net: +partNet(i).toFixed(2) })) }); ukToast("Optik gönderildi · net " + total.toFixed(2).replace(/\.00$/, "")); onClose(); };
  return (
    <div className="uk-sheet-overlay" onClick={onClose}>
      <div className="uk-sheet" onClick={(e) => e.stopPropagation()} style={{ maxHeight: "90%", overflowY: "auto" }}>
        <div className="uk-grip" />
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
          <span style={{ width: 34, height: 34, borderRadius: 10, display: "grid", placeItems: "center", background: "var(--info-soft)", color: "var(--info)" }}><MIcon name="notebook" size={17} /></span>
          <div><div style={{ fontSize: 16, fontWeight: 800 }}>Online Optik Form</div><div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>{ev.name}</div></div>
        </div>
        <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, margin: "10px 0 12px", lineHeight: 1.45 }}>Her bölüm için doğru ve yanlış sayını gir. Net otomatik hesaplanır.</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {parts.map((p, i) => (
            <div key={p.n} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1, fontSize: 13.5, fontWeight: 700 }}>{p.n}<span style={{ color: "var(--faint)", fontWeight: 600, fontSize: 11.5 }}> / {p.max}</span></div>
              <input inputMode="numeric" placeholder="D" value={vals[i].d} onChange={(e) => set(i, "d", e.target.value)} style={{ width: 52, height: 40, textAlign: "center", border: "1.5px solid var(--border-strong)", borderRadius: 10, font: "inherit", fontSize: 15, fontWeight: 800, color: "var(--success)", background: "var(--surface)" }} />
              <input inputMode="numeric" placeholder="Y" value={vals[i].y} onChange={(e) => set(i, "y", e.target.value)} style={{ width: 52, height: 40, textAlign: "center", border: "1.5px solid var(--border-strong)", borderRadius: 10, font: "inherit", fontSize: 15, fontWeight: 800, color: "var(--danger)", background: "var(--surface)" }} />
              <div style={{ width: 48, textAlign: "right", fontSize: 14, fontWeight: 800 }} className="tnum">{partNet(i).toFixed(2).replace(/\.00$/, "")}</div>
            </div>
          ))}
        </div>
        <div className="uk-card uk-card-pad" style={{ marginTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--primary-soft)", border: "none" }}>
          <span style={{ fontSize: 13.5, fontWeight: 800, color: "var(--primary-700)" }}>Toplam Net</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: "var(--primary-700)" }} className="tnum">{total.toFixed(2).replace(/\.00$/, "")}</span>
        </div>
        <button className="uk-btn uk-btn-primary uk-btn-block" style={{ marginTop: 14 }} onClick={submit}><MIcon name="send" size={16} /> Optiği gönder</button>
        <button className="uk-btn uk-btn-light uk-btn-block" style={{ marginTop: 10, boxShadow: "none" }} onClick={onClose}>Vazgeç</button>
        <div style={{ height: 6 }} />
      </div>
    </div>
  );
}

/* Denemeye kayıt sheet'i (öğrenci) */
function DenemeKayitSheet({ onClose, sinav = "YKS" }) {
  useMV();
  const mem = mvMembership();
  const plan = mvPlan(mem);
  const regs = mvRegs();
  const [optik, setOptik] = useState(null); // ev obj
  const list = MV_EVENTS.filter((e) => sinav === "LGS" ? e.examType === "LGS" : e.examType !== "LGS");
  const doReg = (ev) => { mvRegister(ev.id); ukToast("“" + ev.name + "” için kaydın alındı"); };

  return (
    <div className="uk-sheet-overlay" onClick={onClose}>
      <div className="uk-sheet" onClick={(e) => e.stopPropagation()} style={{ maxHeight: "90%", overflowY: "auto" }}>
        <div className="uk-grip" />
        <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 2 }}>Denemeye Kayıt Ol</div>
        <div style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600, marginBottom: 14 }}>Yaklaşan denemelerden seç</div>

        {plan ? (
          <div style={{ display: "flex", gap: 9, alignItems: "center", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 12, padding: "10px 12px", marginBottom: 12 }}>
            <span style={{ width: 32, height: 32, borderRadius: 9, display: "grid", placeItems: "center", background: `color-mix(in srgb, ${plan.color} 14%, transparent)`, color: plan.color, flexShrink: 0 }}><MIcon name={plan.mode === "kargo" ? "notebook" : "checkCircle"} size={16} /></span>
            <div style={{ fontSize: 12.5 }}><b>Aktif üyeliğin: {plan.name}</b><div style={{ color: "var(--muted)", fontWeight: 600 }}>{plan.mode === "kargo" ? "Denemeler kargoyla gelir, online optik doldurursun." : "Denemeler paketine dahil, kurumda yüz yüze."}</div></div>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 9, alignItems: "center", background: "var(--warning-soft)", borderRadius: 12, padding: "10px 12px", marginBottom: 12 }}>
            <MIcon name="help" size={18} style={{ color: "var(--warning)", flexShrink: 0 }} />
            <div style={{ fontSize: 12.5, fontWeight: 600 }}>Deneme üyeliğin yok — her deneme için ayrı ücret ödenir.</div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {list.map((ev) => {
            const reg = regs[ev.id];
            const covered = !!mem;
            return (
              <div className="uk-card uk-card-pad" key={ev.id}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
                  <span style={{ width: 40, height: 40, borderRadius: 11, display: "grid", placeItems: "center", background: "var(--primary-soft)", color: "var(--primary-600)", flexShrink: 0 }}><MIcon name="chart" size={19} /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 800 }}>{ev.name}</div>
                    <div className="uk-meta" style={{ marginTop: 6 }}>
                      <span className="uk-badge muted" style={{ height: 20 }}>{ev.examType}</span>
                      <span className="mi">{ev.date} · {ev.time}</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--faint)", fontWeight: 600, marginTop: 5 }}>{ev.place} · {ev.soru} soru</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 800, color: covered ? "var(--success)" : "var(--text)" }}>{covered ? "Pakete dahil" : "₺" + ev.price}</div>
                  </div>
                </div>
                <div style={{ marginTop: 11 }}>
                  {!reg ? (
                    <button className="uk-btn uk-btn-primary uk-btn-block" style={{ height: 42 }} onClick={() => doReg(ev)}><MIcon name="plus" size={15} /> {covered ? "Kayıt ol" : "Kayıt ol & öde"}</button>
                  ) : reg.mode === "online" ? (
                    reg.optik
                      ? <div className="uk-badge success" style={{ height: 34, width: "100%", justifyContent: "center" }}><MIcon name="checkCircle" size={14} /> Optik gönderildi · net {reg.optik.net}</div>
                      : <button className="uk-btn uk-btn-light uk-btn-block" style={{ height: 42, color: "var(--info)" }} onClick={() => setOptik(ev)}><MIcon name="notebook" size={15} /> Online optik formu doldur</button>
                  ) : (
                    <div className="uk-badge success" style={{ height: 34, width: "100%", justifyContent: "center" }}><MIcon name="check" size={14} /> Kayıtlısın · {ev.place}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <button className="uk-btn uk-btn-light uk-btn-block" style={{ marginTop: 14, boxShadow: "none" }} onClick={onClose}>Kapat</button>
        <div style={{ height: 6 }} />
      </div>
      {optik && <OptikSheet ev={optik} onClose={() => setOptik(null)} />}
    </div>
  );
}

/* ============================================================
   ŞİFRE & GÜVENLİK
   ============================================================ */
function SifreSheet({ onClose }) {
  const [cur, setCur] = useState("");
  const [n1, setN1] = useState("");
  const [n2, setN2] = useState("");
  const ok = cur.length >= 4 && n1.length >= 6 && n1 === n2;
  const inputStyle = { width: "100%", height: 48, border: "1.5px solid var(--border-strong)", borderRadius: 12, padding: "0 14px", font: "inherit", fontSize: 15, fontWeight: 600, color: "var(--text)", background: "var(--surface)", boxSizing: "border-box" };
  return (
    <div className="uk-sheet-overlay" onClick={onClose}>
      <div className="uk-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="uk-grip" />
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
          <span style={{ width: 34, height: 34, borderRadius: 10, display: "grid", placeItems: "center", background: "var(--primary-soft)", color: "var(--primary-600)" }}><MIcon name="shield" size={17} /></span>
          <div style={{ fontSize: 16, fontWeight: 800 }}>Şifre & Güvenlik</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div><div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", marginBottom: 6 }}>Mevcut şifre</div><input type="password" value={cur} onChange={(e) => setCur(e.target.value)} style={inputStyle} /></div>
          <div><div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", marginBottom: 6 }}>Yeni şifre</div><input type="password" value={n1} onChange={(e) => setN1(e.target.value)} placeholder="En az 6 karakter" style={inputStyle} /></div>
          <div><div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", marginBottom: 6 }}>Yeni şifre (tekrar)</div><input type="password" value={n2} onChange={(e) => setN2(e.target.value)} style={inputStyle} /></div>
          {n2.length > 0 && n1 !== n2 ? <div style={{ fontSize: 12, fontWeight: 600, color: "var(--danger)" }}>Şifreler eşleşmiyor.</div> : null}
        </div>
        <button className="uk-btn uk-btn-primary uk-btn-block" style={{ marginTop: 16 }} disabled={!ok} onClick={() => { ukToast("Şifren güncellendi"); onClose(); }}><MIcon name="check" size={16} /> Şifreyi güncelle</button>
        <button className="uk-btn uk-btn-light uk-btn-block" style={{ marginTop: 10, boxShadow: "none" }} onClick={onClose}>Vazgeç</button>
        <div style={{ height: 6 }} />
      </div>
    </div>
  );
}

Object.assign(window, {
  mvGet, mvSet, useMV, DestekScreen,
  MV_PLANS, mvPlan, MV_EVENTS, mvMembership, mvSetMembership, mvRegs, mvIsReg, mvRegister,
  DenemeUyelikSheet, OptikSheet, DenemeKayitSheet, SifreSheet,
});
