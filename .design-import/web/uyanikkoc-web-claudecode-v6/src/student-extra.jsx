/* Student sub-pages: Ödevlerim, Motivasyon, AI Koç + Placeholder */

/* ---------------- Ödevlerim ---------------- */
function AssignmentsPage() {
  const me = (typeof loadAuth === "function" && loadAuth()?.name) || "Elif Yıldız";
  const odevler = useOdevler().filter((o) => o.student === me);
  const [view, setView] = useState("gunluk");
  const total = odevler.length;
  const done = odevler.filter((o) => o.status === "done").length;
  const overdue = odevler.filter((o) => o.status !== "done" && o.due && new Date(o.due) < new Date("2026-06-05")).length;
  return (
    <div className="stack rise">
      <PageHead title="Ödevlerim" sub="Koçunun atadığı görevler — sonucunu gir, takip et"
        actions={
          <div className="seg" role="tablist" aria-label="Görünüm">
            <button className={view === "liste" ? "on" : ""} onClick={() => setView("liste")}><Icon name="clipboard" size={15} />Liste</button>
            <button className={view === "gunluk" ? "on" : ""} onClick={() => setView("gunluk")}><Icon name="checkCircle" size={15} />Günlük plan</button>
            <button className={view === "takvim" ? "on" : ""} onClick={() => setView("takvim")}><Icon name="calendar" size={15} />Takvim</button>
          </div>
        } />
      <div className="grid g-4">
        <StatCard icon="clipboard" tone="primary" value={total} label="Toplam görev" />
        <StatCard icon="checkCircle" tone="success" value={done} label="Tamamlanan" />
        <StatCard icon="clock" tone="warning" value={total - done} label="Bekleyen" />
        <StatCard icon="alert" tone="danger" value={overdue} label="Gecikmiş" />
      </div>
      {view === "takvim" ? <OdevCalendar student={me} /> : view === "gunluk" ? <OdevDailyPlan student={me} /> : <StudentOdevList student={me} />}
      <KaynakTracker student={me} editable defaultExam="Tümü" />
    </div>
  );
}

/* ---------------- Motivasyon ---------------- */
const TARGET_RANK_KEY = "uk_target_rank";
function loadTargetRank() { try { return localStorage.getItem(TARGET_RANK_KEY) || "50.000"; } catch (e) { return "50.000"; } }

function TargetRankModal({ open, current, onClose, onSave }) {
  const [val, setVal] = useState(current);
  useEffect(() => { if (open) setVal(current); }, [open, current]);
  if (!open) return null;
  const clean = val.replace(/[^\d]/g, "");
  const fmt = clean ? Number(clean).toLocaleString("tr-TR") : "";
  return ReactDOM.createPortal((
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="row" style={{ gap: 11 }}>
            <span className="stat-icon tone-primary" style={{ width: 38, height: 38 }}><Icon name="target" size={18} /></span>
            <div><h3 style={{ fontSize: 15.5, fontWeight: 800 }}>Hedef Sıralaman</h3><div className="muted" style={{ fontSize: 12 }}>YKS 2026 için hedeflediğin sıralama</div></div>
          </div>
          <button className="icon-btn" style={{ width: 36, height: 36 }} onClick={onClose} aria-label="Kapat"><Icon name="plus" size={18} style={{ transform: "rotate(45deg)" }} /></button>
        </div>
        <div className="modal-body" style={{ padding: 20, gap: 14 }}>
          <div className="field">
            <label className="label">Hedef sıralama (ilk ...)</label>
            <div className="input-icon"><input className="input tnum" inputMode="numeric" placeholder="50.000" value={fmt} onChange={(e) => setVal(e.target.value)} autoFocus /><span className="muted" style={{ fontSize: 12, fontWeight: 700 }}>. kişi</span></div>
          </div>
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            {["10.000", "25.000", "50.000", "100.000"].map((p) => (
              <button key={p} className="chip" style={{ cursor: "pointer" }} onClick={() => setVal(p)}>İlk {p}</button>
            ))}
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-light" onClick={onClose}>Vazgeç</button>
          <button className="btn btn-primary" disabled={!clean} onClick={() => onSave(Number(clean).toLocaleString("tr-TR"))} style={{ marginLeft: "auto", opacity: clean ? 1 : 0.5 }}><Icon name="check" size={16} />Kaydet</button>
        </div>
      </div>
    </div>
  ), document.body);
}

function MotivationPage() {
  const examDate = "20 Haz 2026";
  const daysLeft = 15;
  const me = (typeof loadAuth === "function" && loadAuth()?.name) || "Elif Yıldız";
  const motiv = (typeof useMotiv === "function") ? useMotiv(me) : null;
  const [rank, setRank] = useState(loadTargetRank);
  const [editRank, setEditRank] = useState(false);
  return (
    <div className="stack rise">
      <PageHead title="Motivasyon" sub="Serini koru, rozetlerini topla, hedefe odaklan" />

      <div className="grid col-main">
        <div className="hero" style={{ display: "flex", flexDirection: "column", justifyContent: "center", minHeight: 200 }}>
          <div className="between" style={{ alignItems: "flex-start" }}>
            <div>
              <div className="row" style={{ gap: 8 }}>
                <Icon name="flame" size={22} fill />
                <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,.85)" }}>Çalışma Serisi</span>
              </div>
              <div className="row" style={{ alignItems: "flex-end", gap: 12, marginTop: 14 }}>
                <div style={{ fontSize: 60, fontWeight: 800, letterSpacing: "-.03em", lineHeight: 1 }} className="tnum">12</div>
                <div style={{ paddingBottom: 8 }}>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>gün üst üste</div>
                  <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.75)" }}>Rekorun: 21 gün</div>
                </div>
              </div>
            </div>
            <span className="badge" style={{ background: "rgba(255,255,255,.16)", color: "#fff", height: 26 }}><Icon name="bolt" size={14} fill />Aktif</span>
          </div>
          <div className="glass" style={{ marginTop: 18, padding: "12px 14px", fontSize: 13, lineHeight: 1.5 }}>
            Bu hafta <b style={{ color: "#fff" }}>{STUDENT.weekHours} saat</b> çalıştın — geçen haftaya göre <b style={{ color: "#fff" }}>+3.2 saat</b>. Aynı tempoda devam!
          </div>
        </div>

        <Section title="Hedefe Kalan" sub="YKS 2026">
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center", textAlign: "center" }}>
            <Ring value={Math.round(((90 - daysLeft) / 90) * 100)} size={148} stroke={13} color="var(--primary)" label={daysLeft} sub="gün kaldı" big />
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700 }}>{examDate} · Cumartesi</div>
              <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>TYT oturumu 10:15'te başlıyor</div>
            </div>
            <button className="btn btn-light" style={{ width: "100%" }} onClick={() => setEditRank(true)}><Icon name="target" size={16} />Hedef sıralaman: {rank}<Icon name="settings" size={14} style={{ marginLeft: "auto", color: "var(--faint)" }} /></button>
          </div>
        </Section>
      </div>

      <TargetRankModal open={editRank} current={rank} onClose={() => setEditRank(false)} onSave={(v) => { setRank(v); try { localStorage.setItem(TARGET_RANK_KEY, v); } catch (e) {} setEditRank(false); if (typeof toast === "function") toast("Hedef sıralaman güncellendi: İlk " + v); }} />
      {typeof CoachRatingCard === "function" ? <CoachRatingCard student={me} /> : null}

      <Section title="Rozetlerin" sub={`${ACHIEVEMENTS.filter((a) => a.earned).length}/${ACHIEVEMENTS.length} kazanıldı`} action={<button className="link-btn" onClick={() => toast("Tüm rozetlerin bu listede görünüyor", { icon: "award" })}>Tümü<Icon name="chevronRight" /></button>}>
        <div className="card-body">
          <div className="medal-grid">
            {ACHIEVEMENTS.map((a, i) => (
              <div key={i} className={`medal${a.earned ? " earned" : " locked"}`} title={a.desc}>
                <span className="m-ic" style={a.earned ? { background: `radial-gradient(circle at 34% 26%, color-mix(in srgb, ${a.color} 62%, #fff), ${a.color})`, boxShadow: `0 9px 20px -7px ${a.color}` } : undefined}>
                  <Icon name={a.icon} size={26} fill={a.earned} />
                  {a.earned
                    ? <span className="m-check"><Icon name="check" size={12} stroke={3.2} /></span>
                    : <span className="m-lock"><Icon name="lock" size={11} /></span>}
                </span>
                <div className="m-name">{a.name}</div>
                <div className="m-desc">{a.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <div className="card" style={{ background: "linear-gradient(120deg, color-mix(in srgb, var(--primary) 7%, var(--surface)), var(--surface))" }}>
        <div className="card-pad" style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <span className="ai-orb" style={{ width: 52, height: 52 }}><Icon name="heart" size={24} fill /></span>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-.01em" }}>“{motiv ? motiv.text : "Bugün attığın küçük adım, sınav günü en büyük farkın olacak."}”</div>
            <div className="muted" style={{ fontSize: 12.5, marginTop: 4 }}>Koçun {(motiv && motiv.from) || "Dilek Emen"}'dan {motiv ? "motivasyon mesajı" : "günün notu"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- AI Koç (Yakında) ---------------- */
const AI_FEATURES = [
  { icon: "target", title: "Zayıf konu tespiti", desc: "Deneme ve ödev verinden en çok hata yaptığın konuları otomatik bulur." },
  { icon: "calendar", title: "Akıllı program", desc: "Sana özel, güne ve net hedefine göre güncellenen çalışma planı." },
  { icon: "message", title: "7/24 soru çözümü", desc: "Takıldığın soruyu fotoğrafla, adım adım çözüm ve benzer sorular gelsin." },
  { icon: "trend", title: "Net tahmini", desc: "Gidişatına göre sınav netini ve sıralamanı tahmin eder." },
];

function AiCoachPage() {
  const [joined, setJoined] = useState(false);
  const [how, setHow] = useState(false);
  return (
    <div className="stack rise">
      <PageHead title="AI Koç" sub="Kişisel yapay zekâ koçun — çok yakında" actions={<Badge tone="primary" dot>Yakında</Badge>} />

      <div className="hero" style={{ display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap" }}>
        <span className="glass" style={{ width: 76, height: 76, borderRadius: 20, display: "grid", placeItems: "center", flexShrink: 0 }}>
          <Icon name="ai" size={38} fill />
        </span>
        <div style={{ flex: 1, minWidth: 240 }}>
          <h2 style={{ fontSize: 24 }}>Senin için düşünen bir koç</h2>
          <p style={{ marginTop: 8, maxWidth: 560 }}>Uyanık AI Koç; netlerini, ödevlerini ve çalışma alışkanlıklarını analiz ederek sana özel öneriler ve program çıkaracak. Beta erişimi için sıraya gir.</p>
          <div className="row" style={{ gap: 10, marginTop: 18 }}>
            <button className="btn btn-white" onClick={() => { if (!joined) { setJoined(true); if (typeof toast === "function") toast("Beta sırasına eklendin — yer açılınca haber vereceğiz!", { icon: "bolt" }); } }} style={joined ? { opacity: .85 } : null}>
              <Icon name={joined ? "check" : "bolt"} size={16} />{joined ? "Sıraya eklendin" : "Erken erişime katıl"}
            </button>
            <button className="btn" style={{ background: "rgba(255,255,255,.14)", color: "#fff" }} onClick={() => setHow(true)}>Nasıl çalışır?</button>
          </div>
        </div>
      </div>

      <div className="grid g-2">
        {AI_FEATURES.map((f, i) => (
          <div key={i} className="card"><div className="card-pad" style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <span className="stat-icon tone-primary" style={{ flexShrink: 0 }}><Icon name={f.icon} size={22} /></span>
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 700 }}>{f.title}</div>
              <div className="muted" style={{ fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          </div></div>
        ))}
      </div>

      <Section title="Önizleme" sub="AI Koç sohbeti — demo">
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ alignSelf: "flex-end", maxWidth: "75%", background: "var(--primary)", color: "#fff", padding: "11px 15px", borderRadius: "14px 14px 4px 14px", fontSize: 13.5 }}>
            Türev konusunda hep hata yapıyorum, ne yapmalıyım?
          </div>
          <div style={{ alignSelf: "flex-start", maxWidth: "78%", background: "var(--surface-3)", padding: "11px 15px", borderRadius: "14px 14px 14px 4px", fontSize: 13.5, lineHeight: 1.55 }}>
            <div className="row" style={{ gap: 7, marginBottom: 6 }}><span className="ai-orb" style={{ width: 24, height: 24, borderRadius: 8 }}><Icon name="ai" size={13} fill /></span><b style={{ fontSize: 12.5 }}>AI Koç</b></div>
            Son 3 denemende türevde ortalama 4 yanlışın var. Önce <b>türev alma kurallarını</b> tekrar et, ardından sana 20 soruluk bir set hazırlayayım mı?
          </div>
          <div className="row" style={{ gap: 10, opacity: 0.6, marginTop: 4 }}>
            <div className="searchbox" style={{ flex: 1, display: "flex" }}><input placeholder="Mesaj yaz... (yakında aktif)" disabled /></div>
            <button className="btn btn-primary" disabled><Icon name="send" size={16} /></button>
          </div>
        </div>
      </Section>

      {how ? ReactDOM.createPortal((
        <div className="modal-overlay" onClick={() => setHow(false)}>
          <div className="modal-panel" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div className="row" style={{ gap: 11 }}>
                <span className="ai-orb" style={{ width: 38, height: 38 }}><Icon name="ai" size={19} fill /></span>
                <div><h3 style={{ fontSize: 15.5, fontWeight: 800 }}>AI Koç nasıl çalışır?</h3><div className="muted" style={{ fontSize: 12 }}>3 adımda kişisel asistanın</div></div>
              </div>
              <button className="icon-btn" style={{ width: 36, height: 36 }} onClick={() => setHow(false)} aria-label="Kapat"><Icon name="plus" size={18} style={{ transform: "rotate(45deg)" }} /></button>
            </div>
            <div className="modal-body" style={{ padding: 20, gap: 16 }}>
              {[["chart", "Verini analiz eder", "Denemelerini, ödev sonuçlarını ve çalışma alışkanlıklarını inceler."], ["target", "Zayıf noktaları bulur", "En çok hata yaptığın konuları ve eksiklerini tespit eder."], ["calendar", "Plan önerir", "Sana özel, güncellenen bir çalışma programı ve soru seti hazırlar."]].map(([ic, t, d], i) => (
                <div key={i} className="row" style={{ gap: 13, alignItems: "flex-start" }}>
                  <span className="stat-icon tone-primary" style={{ width: 36, height: 36, flexShrink: 0 }}><Icon name={ic} size={17} /></span>
                  <div><div style={{ fontSize: 13.5, fontWeight: 700 }}>{i + 1}. {t}</div><div className="muted" style={{ fontSize: 12.5, marginTop: 2, lineHeight: 1.45 }}>{d}</div></div>
                </div>
              ))}
            </div>
            <div className="modal-foot"><button className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={() => { setHow(false); if (!joined) { setJoined(true); toast("Beta sırasına eklendin!", { icon: "bolt" }); } }}><Icon name="bolt" size={16} />Erken erişime katıl</button></div>
          </div>
        </div>
      ), document.body) : null}
    </div>
  );
}

/* ---------------- Placeholder (henüz yapılmamış sayfalar) ---------------- */
function PlaceholderPage({ title, sub, icon = "settings" }) {
  return (
    <div className="stack rise">
      <PageHead title={title} sub={sub} />
      <div className="card"><div className="card-pad" style={{ padding: "64px 24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 14 }}>
        <span className="stat-icon tone-primary" style={{ width: 60, height: 60, borderRadius: 18 }}><Icon name={icon} size={28} /></span>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700 }}>{title} hazırlanıyor</div>
          <div className="muted" style={{ fontSize: 13.5, marginTop: 6, maxWidth: 420, lineHeight: 1.5 }}>Bu ekran tasarım sistemine eklendi; içerik akışı bir sonraki adımda detaylandırılabilir.</div>
        </div>
        <button className="btn btn-light btn-sm" onClick={() => window.dispatchEvent(new CustomEvent("uk-nav", { detail: { page: "dashboard" } }))}>Geri dön</button>
      </div></div>
    </div>
  );
}

Object.assign(window, { AssignmentsPage, MotivationPage, AiCoachPage, PlaceholderPage });
