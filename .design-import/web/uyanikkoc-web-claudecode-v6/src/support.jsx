/* Destek sayfası — SSS akordeon + destek talebi + iletişim. Her iki rol. */

const SSS = {
  coach: [
    { q: "Deneme sonucu Excel'ini nasıl içe aktarırım?", a: "Denemeler sayfasında sağ üstteki “Deneme İçe Aktar” butonuna bas, yayınevinden gelen .xlsx dosyasını yükle. Sistem tüm öğrencilerin sonuçlarını otomatik işler.", cat: "deneme" },
    { q: "Öğrenciye nasıl ödev atarım?", a: "Konu Takibi sayfasında öğrenciyi seç, “Ödev Ata” butonuna bas. Ders → konu seç, tür (soru/video/konu), kaynak, soru ya da test sayısı ve istersen bitiş tarihi belirle.", cat: "odev" },
    { q: "Yeni bir deneme sınavı oluşturup öğrencileri kaydedebilir miyim?", a: "Denemeler sayfasındaki “Deneme Oluştur” ile tarih, tür ve yer belirleyip deneme açılabilirsin. Öğrenciler kendi panellerinden kayıt olur; kayıt sayısını ve ödeme/paket durumlarını deneme kartını açarak görürsün.", cat: "deneme" },
    { q: "Müfredattaki konuları değiştirebilir miyim?", a: "Ayarlar → Müfredat & Konu Grupları sekmesinden YKS ve LGS için ders, grup ve konuları düzenleyebilirsin. Değişiklikler ödev atama ve konu takibine anında yansır.", cat: "hesap" },
    { q: "Randevu limitini nasıl ayarlarım?", a: "Randevular → Müsait Saatlerim sekmesinde haftalık randevu limitini ve online/yüz yüze izinlerini belirleyebilirsin.", cat: "randevu" },
    { q: "Bir konuda birden fazla kaynağı nasıl takip ederim?", a: "Konu Takibi tablosunda her konunun altında öğrencinin o konudaki kaynakları ayrı ayrı görünür. Üstteki kaynak çiplerine tıklayarak listeyi tek bir kaynağa göre filtreleyebilirsin.", cat: "odev" },
  ],
  student: [
    { q: "Ödevimin sonucunu nasıl girerim?", a: "Ödevlerim sayfasında ilgili ödevde “Sonuç Gir” butonuna bas, kaç doğru/yanlış/boş yaptığını gir. Net otomatik hesaplanır ve koçun görür.", cat: "odev" },
    { q: "Denemeye nasıl kayıt olurum?", a: "Denemeler sayfasında (veya ana sayfadaki Yaklaşan Denemeler kartında) “Denemeye kayıt ol” butonuna bas, yaklaşan denemelerden birini seç. Üyeliğin varsa pakete dahildir; yoksa ücretini ödeyerek kaydolursun.", cat: "deneme" },
    { q: "Kargo üyeliğim var, denemeyi nasıl çözerim?", a: "Aylık Kargo Üyeliğinde deneme kitapçığın adresine gelir. Kayıt olduğun denemeyi Denemeler → Online Deneme sekmesinden optik formu doldurarak girersin; net anında hesaplanır.", cat: "deneme" },
    { q: "Koçumdan nasıl randevu alırım?", a: "Randevular sayfasında “Randevu İste” butonuna bas, online veya yüz yüze seç, koçunun müsait gün ve saatlerinden birini seç.", cat: "randevu" },
    { q: "Elimdeki kaynakları nasıl eklerim?", a: "Ödevlerim sayfasının altındaki “Kaynaklarım” alanına sahip olduğun kitapları ekle. Koçun sana ödev atarken bunlardan seçebilir; çalışma programına blok eklerken de kaynak seçebilirsin.", cat: "odev" },
    { q: "Deneme analizimi nerede görürüm?", a: "Denemeler sayfasında “Analiz” sekmesine geç. Net dağılımın, güçlü/zayıf derslerin ve öncelikli konuların orada listelenir.", cat: "deneme" },
    { q: "Rozetleri nasıl kazanırım?", a: "Motivasyon sayfasında rozetlerin listelenir. Seri yapma, deneme çözme, soru hedefini tutturma gibi davranışlarla rozet kazanırsın; kazanılanlar renkli, kilitliler gri görünür.", cat: "hesap" },
  ],
  parent: [
    { q: "Çocuğumun deneme sonuçlarını nereden görürüm?", a: "Deneme Sonuçları sayfasında çocuğunun her denemedeki neti, sıralaması ve ders bazında gelişimi listelenir.", cat: "deneme" },
    { q: "Gelişim raporları ne sıklıkla geliyor?", a: "Koç haftalık gelişim raporunu hazırlayıp onayladığında Gelişim Raporları sayfana düşer ve bildirim alırsın.", cat: "rapor" },
    { q: "Koçla nasıl iletişime geçerim?", a: "Mesajlar sayfasından koça doğrudan yazabilir, Randevular'dan veli görüşmesi talep edebilirsin.", cat: "randevu" },
    { q: "Aboneliğimi ve deneme üyeliğini nasıl yönetirim?", a: "Abonelik sayfasından koçluk paketini, deneme üyeliğini (yüz yüze / kargo) ve fatura geçmişini görüp yönetebilirsin.", cat: "hesap" },
  ],
};
const SSS_CATS = { all: "Tümü", deneme: "Denemeler", odev: "Ödev & Konu", randevu: "Randevu", rapor: "Rapor", hesap: "Hesap" };

/* ---- destek talepleri store'u (localStorage) ---- */
const TICKET_KEY = "uk_tickets_v1";
const TICKET_STATUS = { open: { label: "Açık", tone: "warning" }, answered: { label: "Yanıtlandı", tone: "success" }, closed: { label: "Kapandı", tone: "muted" } };
let _tickets = (() => { try { const s = localStorage.getItem(TICKET_KEY); if (s) return JSON.parse(s); } catch (e) {} return [
  { id: "DST-2041", user: "Dilek Emen", role: "coach", cat: "teknik", msg: "Deneme Excel'i bazı satırları atlıyor.", status: "answered", reply: "Şablonu güncelledik, tekrar dener misiniz? Sorun devam ederse dosyayı iletin.", createdAt: Date.now() - 2 * 86400000 },
  { id: "DST-2038", user: "Elif Yıldız", role: "student", cat: "hesap", msg: "Koçumu göremiyorum, panel boş geliyor.", status: "closed", reply: "Hesabın koça bağlandı, artık görünyor. İyi çalışmalar!", createdAt: Date.now() - 5 * 86400000 },
  { id: "DST-2052", user: "Ayşe Yıldız", role: "parent", cat: "oneri", msg: "Haftalık rapora SMS bildirimi eklenebilir mi?", status: "open", reply: null, createdAt: Date.now() - 6 * 3600000 },
]; })();
const _tkListeners = new Set();
function persistTickets() { try { localStorage.setItem(TICKET_KEY, JSON.stringify(_tickets)); } catch (e) {} _tkListeners.forEach((l) => l()); }
function addTicket(t) { const id = "DST-" + Math.floor(2100 + Math.random() * 800); _tickets = [{ id, status: "open", reply: null, createdAt: Date.now(), ...t }, ..._tickets]; persistTickets(); return id; }
function closeTicket(id) { _tickets = _tickets.map((t) => t.id === id ? { ...t, status: "closed" } : t); persistTickets(); }
function useTickets(user) {
  const [, force] = React.useState(0);
  React.useEffect(() => { const l = () => force((x) => x + 1); _tkListeners.add(l); return () => _tkListeners.delete(l); }, []);
  return _tickets.filter((t) => t.user === user);
}

function SupportPage({ role }) {
  const allFaq = SSS[role] || SSS.student;
  const me = (typeof loadAuth === "function" && loadAuth()?.name) || "Elif Yıldız";
  const myTickets = useTickets(me);
  const [open, setOpen] = useState(0);
  const [faqQ, setFaqQ] = useState("");
  const [faqCat, setFaqCat] = useState("all");
  const faqCats = ["all", ...[...new Set(allFaq.map((x) => x.cat).filter(Boolean))]];
  const list = allFaq.filter((x) => (faqCat === "all" || x.cat === faqCat) && (faqQ.trim() === "" || (x.q + " " + x.a).toLocaleLowerCase("tr-TR").includes(faqQ.toLocaleLowerCase("tr-TR"))));
  const [cat, setCat] = useState("teknik");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  const CATS = { teknik: "Teknik sorun", oneri: "Öneri", hesap: "Hesap", diger: "Diğer" };
  const send = () => {
    if (msg.trim().length < 5) return;
    const id = addTicket({ user: me, role, cat, msg: msg.trim() });
    setSent(true); setMsg("");
    if (typeof toast === "function") toast("Destek talebin oluşturuldu · " + id, { icon: "checkCircle" });
    setTimeout(() => setSent(false), 2600);
  };

  return (
    <div className="stack rise">
      <PageHead title="Destek" sub="Sık sorulan sorular, yardım ve iletişim" />

      <div className="grid g-3">
        {[["message", "Canlı Destek", "Hafta içi 09:00 – 18:00", "primary"], ["bell", "E-posta", "destek@uyanikkoc.com", "info"], ["ai", "Yardım Merkezi", "Rehber ve videolar", "success"]].map(([ic, t, d, tone]) => (
          <div key={t} className="card"><div className="card-pad" style={{ display: "flex", gap: 13, alignItems: "center" }}>
            <span className="stat-icon" style={{ background: `var(--${tone}-soft)`, color: `var(--${tone})` }}><Icon name={ic} size={22} /></span>
            <div><div style={{ fontSize: 14, fontWeight: 700 }}>{t}</div><div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>{d}</div></div>
          </div></div>
        ))}
      </div>

      <div className="grid col-main">
        <Section title="Sık Sorulan Sorular" sub={`${list.length} soru · ara veya kategoriye göre filtrele`}>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="field" style={{ marginBottom: 0 }}>
              <div className="searchbox" style={{ margin: 0, display: "flex", width: "100%" }}>
                <Icon name="search" size={16} />
                <input placeholder="Soru ara…" value={faqQ} onChange={(e) => { setFaqQ(e.target.value); setOpen(-1); }} style={{ width: "100%" }} />
              </div>
            </div>
            <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
              {faqCats.map((c) => <button key={c} type="button" className={`type-chip${faqCat === c ? " on" : ""}`} onClick={() => { setFaqCat(c); setOpen(-1); }}>{SSS_CATS[c] || c}</button>)}
            </div>
            {list.length === 0 ? <div style={{ padding: "18px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>“{faqQ}” için sonuç yok. Aşağıdan destek talebi oluşturabilirsin.</div> : null}
            {list.map((item, i) => {
              const on = open === i;
              return (
                <div className={`acc-item${on ? " open" : ""}`} key={item.q}>
                  <button className="acc-head" onClick={() => setOpen(on ? -1 : i)}>
                    <span className="lr-icon" style={{ width: 30, height: 30, background: "var(--primary-soft)", color: "var(--primary-600)" }}><Icon name="message" size={15} /></span>
                    <span style={{ fontWeight: 700, fontSize: 13.5, flex: 1 }}>{item.q}</span>
                    <Icon name="chevronDown" size={16} style={{ color: "var(--faint)", transform: on ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
                  </button>
                  {on ? <div style={{ padding: "0 16px 14px 58px", fontSize: 13, color: "var(--text-2)", lineHeight: 1.55 }}>{item.a}</div> : null}
                </div>
              );
            })}
          </div>
        </Section>

        <Section title="Destek Talebi Oluştur" sub="Sorununu ilet, ekibimiz dönüş yapsın">
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="field">
              <label className="label">Konu</label>
              <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
                {Object.entries(CATS).map(([k, v]) => <button key={k} type="button" className={`type-chip${cat === k ? " on" : ""}`} onClick={() => setCat(k)}>{v}</button>)}
              </div>
            </div>
            <div className="field">
              <label className="label">Mesajın</label>
              <textarea className="textarea" rows={4} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Yaşadığın sorunu veya önerini detaylıca yaz..." />
            </div>
            <button className="btn btn-primary" disabled={msg.trim().length < 5} onClick={send} style={{ opacity: msg.trim().length < 5 ? 0.5 : 1, alignSelf: "flex-start" }}>
              <Icon name={sent ? "check" : "send"} size={16} />{sent ? "Talebin alındı" : "Gönder"}
            </button>
            {sent ? <div className="badge badge-success" style={{ alignSelf: "flex-start" }}><Icon name="checkCircle" size={13} />En geç 24 saat içinde dönüş yapılacak</div> : null}
          </div>
        </Section>
      </div>

      <Section title="Destek Taleplerim" sub={`${myTickets.length} talep · durumlarını buradan takip et`} action={<Badge tone="muted" icon="message">{myTickets.filter((t) => t.status !== "closed").length} açık</Badge>}>
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {myTickets.length === 0 ? <div style={{ padding: "20px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Henüz destek talebin yok.</div>
            : myTickets.map((t) => {
              const st = TICKET_STATUS[t.status] || TICKET_STATUS.open;
              return (
                <div key={t.id} className="lrow" style={{ alignItems: "flex-start", flexDirection: "column", gap: 10 }}>
                  <div className="row" style={{ gap: 10, width: "100%" }}>
                    <span className="lr-icon" style={{ background: `var(--${st.tone}-soft)`, color: `var(--${st.tone})`, flexShrink: 0 }}><Icon name="message" size={17} /></span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="lr-title"><span className="tnum" style={{ color: "var(--muted)", fontWeight: 700, fontSize: 12 }}>{t.id}</span> · {CATS[t.cat] || t.cat}</div>
                      <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 3, lineHeight: 1.45 }}>{t.msg}</div>
                    </div>
                    <Badge tone={st.tone} dot>{st.label}</Badge>
                  </div>
                  {t.reply ? <div style={{ width: "100%", marginLeft: 38, background: "var(--surface-3)", borderRadius: 10, padding: "9px 13px", fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.5 }}><b style={{ color: "var(--primary-600)", fontSize: 11.5 }}>Destek ekibi:</b> {t.reply}</div> : null}
                  {t.status !== "closed" ? <button className="btn btn-light btn-sm" style={{ marginLeft: 38 }} onClick={() => { closeTicket(t.id); toast("Talep kapatıldı"); }}>Talebi kapat</button> : null}
                </div>
              );
            })}
        </div>
      </Section>
    </div>
  );
}

window.SupportPage = SupportPage;
