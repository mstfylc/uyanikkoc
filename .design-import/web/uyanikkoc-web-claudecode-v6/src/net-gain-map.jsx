/* Net Kaybı Haritası (v1) — "en hızlı net artışı nereden gelir?"
   Sinyaller: ders bazlı net açığı · konu tamamlanma açığı · yanlış/boş ağırlığı ·
   son 3 deneme trendi · hedef nete katkı potansiyeli.
   v2 notu: ÖSYM katsayıları + bölüm hedefi + sıralama tahmini eklenebilir. */

const NGM_BAND = { "Türkçe": "TYT", "Matematik": "TYT", "Geometri": "AYT", "Fizik": "AYT", "Kimya": "AYT", "Biyoloji": "AYT" };
const NGM_MAXNET = { "Türkçe": 40, "Matematik": 40, "Geometri": 10, "Fizik": 14, "Kimya": 13, "Biyoloji": 13, "Fen Bilimleri": 20, "T.C. İnkılap Tarihi": 10, "Din Kültürü": 10, "İngilizce": 10, "Sosyal Bilimler": 20 };
const NGM_LEVER = {
  konu:   { short: "konu eksiği",     word: "konu", tone: "info",    icon: "book" },
  kalite: { short: "çözüm kalitesi",  word: "kalite", tone: "danger", icon: "target" },
  sure:   { short: "süre yönetimi",   word: "süre", tone: "warning", icon: "clock" },
  tekrar: { short: "tekrar",          word: "tekrar", tone: "primary", icon: "ai" },
};
const NGM_ERR_LEVER = { bilgi: "konu", islem: "kalite", sure: "sure", dikkat: "sure", yorum: "kalite", unutma: "tekrar" };

function _ngmHash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
function _ngmStatusRank(s) { return s === "todo" ? 0 : s === "progress" ? 1 : 2; }

function _ngmBuild(student, sinav) {
  const CURR = (typeof getCurriculum === "function") ? getCurriculum(sinav) : {};
  if (typeof ensureKonuSeed === "function") ensureKonuSeed(student, CURR);
  const areas = [];
  // gerçek Yanlış Defteri sinyali (kapanmamış yanlışlar) — ders/konu bazında
  const mlist = (typeof getMistakes === "function") ? getMistakes(student).filter((m) => m.status !== "kapandi") : [];
  const mSubj = {}, mTopic = {};
  mlist.forEach((m) => {
    (mSubj[m.subject] = mSubj[m.subject] || { n: 0, types: {} });
    mSubj[m.subject].n++; mSubj[m.subject].types[m.errorType] = (mSubj[m.subject].types[m.errorType] || 0) + 1;
    const tk = m.subject + "::" + m.topic;
    (mTopic[tk] = mTopic[tk] || { n: 0, types: {} });
    mTopic[tk].n++; mTopic[tk].types[m.errorType] = (mTopic[tk].types[m.errorType] || 0) + 1;
  });
  const _domType = (types) => Object.keys(types).sort((a, b) => types[b] - types[a])[0];
  Object.keys(CURR).forEach((subject) => {
    const list = (typeof konuList === "function") ? konuList(student, subject, CURR) : [];
    if (!list.length) return;
    const done = list.filter((t) => t.s === "done").length;
    const konuPct = Math.round((done / list.length) * 100);
    const h = _ngmHash(student + "::" + subject);
    const sm = mSubj[subject];
    let accuracy = Math.min(94, Math.max(38, Math.round(konuPct * 0.45 + 42 + (h % 18) - 9)));
    if (sm) accuracy = Math.max(34, accuracy - Math.min(24, sm.n * 4)); // gerçek yanlışlar doğruluğu düşürür
    const maxNet = NGM_MAXNET[subject] || 20;
    const curNet = accuracy / 100 * maxNet;
    const target = maxNet * 0.9;
    const netGap = Math.max(0, target - curNet);
    const trendDir = sm && sm.n >= 2 ? -1 : ((h % 5 === 0) ? 0 : (h % 3 === 0 ? -1 : (accuracy < 60 ? -1 : 1)));
    // hata kayıtlı konular öne çıksın
    const weakTopics = [...list].sort((a, b) => {
      const ma = (mTopic[subject + "::" + a.n] || {}).n || 0, mb = (mTopic[subject + "::" + b.n] || {}).n || 0;
      return (mb - ma) || (_ngmStatusRank(a.s) - _ngmStatusRank(b.s)) || ((_ngmHash(a.n) % 7) - (_ngmHash(b.n) % 7));
    }).slice(0, 2);
    weakTopics.forEach((tp) => {
      const tk = subject + "::" + tp.n;
      const mk = mTopic[tk];
      const mkCount = mk ? mk.n : 0;
      const compGap = tp.s === "todo" ? 100 : tp.s === "progress" ? 55 : 15;
      const wrongWeight = mk ? Math.min(100, 46 + mk.n * 14) : (100 - accuracy);
      const trendPen = trendDir < 0 ? 100 : trendDir === 0 ? 60 : 22;
      const netGapNorm = Math.min(100, (netGap / maxNet) * 100 * 1.25);
      const mkBoost = Math.min(28, mkCount * 11);
      const gain = Math.min(100, Math.round(0.30 * compGap + 0.28 * wrongWeight + 0.18 * netGapNorm + 0.14 * trendPen) + mkBoost);
      const estNet = +(gain / 100 * (maxNet / 9) * 1.15).toFixed(1);
      let lever;
      if (mk) lever = NGM_ERR_LEVER[_domType(mk.types)] || "kalite";
      else if (tp.s === "todo") lever = "konu";
      else if (accuracy < 56) lever = "kalite";
      else if (trendDir < 0) lever = "sure";
      else lever = "tekrar";
      areas.push({ subject, topic: tp.n, band: NGM_BAND[subject] || null, status: tp.s, accuracy, compGap, netGap: +netGap.toFixed(1), trendDir, gain, estNet, lever, mkCount });
    });
  });
  areas.sort((a, b) => b.gain - a.gain || b.estNet - a.estNet);
  // aynı dersten ardışık iki alan üst sıralarda olmasın — çeşitlilik
  const top = [];
  const used = {};
  areas.forEach((a) => { if (top.length < 3 && (used[a.subject] || 0) < 1) { top.push(a); used[a.subject] = 1; } });
  areas.forEach((a) => { if (top.length < 3 && !top.includes(a)) top.push(a); });
  const rest = areas.filter((a) => !top.includes(a)).slice(0, 5);
  const totalNet = +top.reduce((s, a) => s + a.estNet, 0).toFixed(1);
  return { top, rest, totalNet };
}

function _ngmPhrase(a) {
  const L = NGM_LEVER[a.lever];
  const base = (a.band ? a.band + " " : "") + a.topic;
  return (a.lever === "sure" || a.lever === "kalite") ? base + " · " + L.short : base;
}

function NetGainMap({ student, sinav, role, onPick }) {
  const me = student || ((typeof loadAuth === "function" && loadAuth()?.name) || "Elif Yıldız");
  const exam = sinav || (typeof studentSinav === "function" ? studentSinav() : "YKS");
  if (typeof useKonu === "function") useKonu();
  if (typeof useMistakes === "function") useMistakes(me);
  const { top, rest, totalNet } = _ngmBuild(me, exam);
  if (!top.length) return null;

  const scOf = (s) => (typeof SUBJECT_COLORS !== "undefined" && SUBJECT_COLORS[s]) || "var(--primary)";
  const trendGlyph = (d) => d < 0 ? { t: "▼ düşüyor", c: "var(--danger)" } : d === 0 ? { t: "▬ yatay", c: "var(--warning)" } : { t: "▲ çıkıyor", c: "var(--success)" };

  return (
    <Section
      title="Net Kaybı Haritası"
      sub="En hızlı net kazancı veren alanlar — tamamlanma açığı, yanlış/boş ağırlığı ve deneme trendi birlikte"
      action={<Badge tone="success" icon="bolt">≈ +{totalNet} net potansiyel</Badge>}
    >
      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* manşet cümle */}
        <div className="ngm-head">
          <span className="ic"><Icon name="bolt" size={18} /></span>
          <p>En hızlı net artışı şu alanlardan gelir: {top.map((a, i) => (
            <React.Fragment key={i}><b>{_ngmPhrase(a)}</b>{i < top.length - 1 ? ", " : "."}</React.Fragment>
          ))}</p>
        </div>

        {/* top 3 kazanç kartı */}
        <div className="ngm-cards">
          {top.map((a, i) => {
            const c = scOf(a.subject);
            const L = NGM_LEVER[a.lever];
            const tg = trendGlyph(a.trendDir);
            const factors = [
              { k: "Tamamlanma açığı", v: a.compGap },
              { k: "Yanlış / boş", v: 100 - a.accuracy },
              { k: "Net açığı", v: Math.min(100, Math.round((a.netGap / (NGM_MAXNET[a.subject] || 20)) * 100 * 1.25)) },
            ];
            return (
              <div className="ngm-card" key={i} style={{ borderTopColor: c }}>
                <div className="ngm-rank">{i + 1}</div>
                <div className="ngm-top">
                  <div className="row" style={{ gap: 7, flexWrap: "wrap" }}>
                    {a.band ? <span className="ngm-band">{a.band}</span> : null}
                    <span className="ngm-subj" style={{ color: c }}><span className="sw" style={{ background: c }} />{a.subject}</span>
                  </div>
                  <div className="ngm-topic">{a.topic}</div>
                </div>
                <div className="ngm-gain"><span className="n">+{a.estNet}</span><span className="u">net potansiyel</span></div>
                <div className="ngm-levers">
                  <span className={"badge badge-" + L.tone} style={{ height: 22 }}><Icon name={L.icon} size={12} />{L.short}</span>
                  <span className="ngm-trend" style={{ color: tg.c }}>{tg.t}</span>
                  {a.mkCount ? <span className="ngm-mk" title="Yanlış Defteri'nden"><Icon name="alert" size={11} />{a.mkCount} yanlış</span> : null}
                </div>
                <div className="ngm-factors">
                  {factors.map((f) => (
                    <div className="ngm-f" key={f.k}>
                      <span className="fl">{f.k}</span>
                      <span className="fb"><span style={{ width: Math.max(6, f.v) + "%", background: c }} /></span>
                    </div>
                  ))}
                </div>
                {role === "coach"
                  ? <button className="btn btn-light btn-sm ngm-cta" onClick={() => onPick && onPick(a)}><Icon name="plus" size={14} />Bu konuya ödev ata</button>
                  : role === "parent" ? null
                  : <button className="btn btn-light btn-sm ngm-cta" onClick={() => { if (typeof toast === "function") toast(a.topic + " programına eklendi", { icon: "calendar" }); window.dispatchEvent(new CustomEvent("uk-nav", { detail: { page: "schedule" } })); }}><Icon name="calendar" size={14} />Programa ekle</button>}
              </div>
            );
          })}
        </div>

        {/* sıradaki alanlar */}
        {rest.length ? (
          <div>
            <div className="ngm-resthd">Sıradaki fırsatlar</div>
            <div className="ngm-list">
              {rest.map((a, i) => {
                const c = scOf(a.subject);
                const L = NGM_LEVER[a.lever];
                return (
                  <div className="ngm-row" key={i}>
                    <span className="sw" style={{ background: c }} />
                    <div className="ngm-rmain">
                      <div className="ngm-rtitle">{a.band ? <span className="ngm-band sm">{a.band}</span> : null}{a.topic}<span className="muted" style={{ fontWeight: 600 }}> · {a.subject}</span></div>
                      <div className="ngm-rbar"><span style={{ width: Math.min(100, a.gain) + "%", background: c }} /></div>
                    </div>
                    <span className={"badge badge-" + L.tone} style={{ height: 21 }}>{L.short}</span>
                    <span className="ngm-rnet">+{a.estNet}</span>
                    {role === "coach" ? <button className="mini-btn" title="Ödev ata" onClick={() => onPick && onPick(a)}><Icon name="plus" size={15} /></button> : null}
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="muted" style={{ fontSize: 11.5, display: "flex", alignItems: "center", gap: 6 }}>
          <Icon name="bolt" size={13} />v1 — tamamlanma, yanlış/boş ve trend sinyallerinden hesaplanır. <b style={{ fontWeight: 700 }}>v2</b>’de ÖSYM katsayıları, bölüm hedefi ve sıralama tahmini eklenecek.
        </div>
      </div>
    </Section>
  );
}

Object.assign(window, { NetGainMap });
