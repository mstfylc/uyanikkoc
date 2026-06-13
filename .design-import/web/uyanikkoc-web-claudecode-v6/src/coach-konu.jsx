/* Koç: Konu Takibi — öğrencinin ders bazında konu takibi (Excel "KONU TAKİBİ" + "GİRİŞ" sayfaları baz alındı) */

const KAYNAKLAR = {
  "Türkçe": ["Hız ve Renk Paragraf", "Bilgi Sarmalı", "Arı Paragraf"],
  "Matematik": ["Mikro Mat", "Bilgi Sarmalı (BS)"],
  "Geometri": ["Antrenmanlarla Geo 1"],
  "Fizik": ["Bilgi Sarmalı", "Paraf", "ENS"],
  "Kimya": ["Hız ve Renk", "Bilgi Sarmalı", "Orbital"],
  "Biyoloji": ["Bilgi Sarmalı", "Biyotik", "Aydın"],
  "Fen Bilimleri": ["Hız ve Renk", "Tonguç", "3D"],
  "T.C. İnkılap Tarihi": ["Tonguç", "Bilgi Sarmalı"],
  "Din Kültürü": ["Tonguç", "Aydın"],
  "İngilizce": ["Tonguç", "Rehber"],
};
const KAYNAK_DEF = ["Bilgi Sarmalı", "Tonguç", "3D"];

/* Net gelişimi yapısı sınav türüne göre */
const NET_CONFIG = {
  YKS: {
    TYT: [
      { ders: "Türkçe", bas: 35, son: 35, max: 40 }, { ders: "Matematik", bas: 20, son: 30, max: 40 },
      { ders: "Sosyal Bilimler", bas: 12, son: 18, max: 20 }, { ders: "Fen Bilimleri", bas: 10, son: 16, max: 20 },
    ],
    AYT: [
      { ders: "Matematik", bas: 15, son: 33, max: 40 }, { ders: "Fizik", bas: 9, son: 13, max: 14 },
      { ders: "Kimya", bas: 9, son: 14, max: 13 }, { ders: "Biyoloji", bas: 11, son: 15, max: 13 },
    ],
  },
  LGS: {
    "Sayısal": [
      { ders: "Matematik", bas: 9, son: 16, max: 20 }, { ders: "Fen Bilimleri", bas: 11, son: 17, max: 20 },
    ],
    "Sözel": [
      { ders: "Türkçe", bas: 13, son: 18, max: 20 }, { ders: "T.C. İnkılap Tarihi", bas: 6, son: 9, max: 10 },
      { ders: "Din Kültürü", bas: 7, son: 9, max: 10 }, { ders: "İngilizce", bas: 6, son: 8, max: 10 },
    ],
  },
};

/* deterministic per-student topic state from overall completion + curriculum */
function buildSubjectTopics(subject, comp, CURR, student) {
  const list = (CURR[subject] || []).flatMap((g) => g.konular);
  const doneCount = Math.round(list.length * (comp / 100));
  const srcs = KAYNAKLAR[subject] || KAYNAK_DEF;
  return list.map((n, i) => {
    let s = (student && typeof konuStatus === "function") ? konuStatus(student, subject, n) : (i < doneCount ? "done" : i === doneCount ? "progress" : "todo");
    const soru = s === "done" ? 50 + ((i * 23) % 90) : s === "progress" ? 20 + ((i * 7) % 20) : 0;
    const dogru = s === "todo" ? 0 : Math.round(soru * (0.62 + ((i * 5) % 20) / 100));
    // bir konuda birden fazla kaynak olabilir — deterministik 1–3 kaynak
    const start = (i * 3) % srcs.length;
    const cnt = Math.min(srcs.length, 1 + ((i + (s === "done" ? 1 : 0)) % 3));
    const kaynaklar = [...new Set(Array.from({ length: cnt }, (_, j) => srcs[(start + j) % srcs.length]))];
    // her kaynağın bitirilme durumu (done konuda çoğu bitik)
    const kaynakDone = kaynaklar.map((k, j) => s === "done" ? (j < cnt - ((i % 2)) ) : s === "progress" ? j === 0 : false);
    return { n, s, soru, dogru, kaynaklar, kaynakDone, kaynak: kaynaklar[0] };
  });
}

function CoachKonuPage() {
  const roster = useRoster();
  const [sid, setSid] = useState(() => { const pre = (typeof window !== "undefined") && window.__ukCoachStudent; if (pre) { window.__ukCoachStudent = null; return pre; } return COACH_STUDENTS[0].id; });
  const student = roster.find((s) => s.id === sid) || roster[0] || COACH_STUDENTS[0];
  const sinav = student.sinav || "YKS";
  const CURR = useCurriculum(sinav);
  if (typeof useKonu === "function") useKonu();
  if (typeof ensureKonuSeed === "function") ensureKonuSeed(student.name, CURR);
  const KONU_SUBJECTS = Object.keys(CURR);
  const [subj, setSubj] = useState(KONU_SUBJECTS[0]);
  const activeSubj = KONU_SUBJECTS.includes(subj) ? subj : KONU_SUBJECTS[0];
  const comp = student.completion;
  const ref = 88; // referans tamamlama

  // overall topic stats across subjects
  const perSubj = KONU_SUBJECTS.map((s) => {
    const t = buildSubjectTopics(s, comp, CURR, student.name);
    return { s, t, done: t.filter((x) => x.s === "done").length, total: t.length, soru: t.reduce((a, x) => a + x.soru, 0) };
  });
  const totalTopics = perSubj.reduce((a, x) => a + x.total, 0);
  const doneTopics = perSubj.reduce((a, x) => a + x.done, 0);
  const totalSoru = perSubj.reduce((a, x) => a + x.soru, 0);
  const overallPct = Math.round((doneTopics / totalTopics) * 100);

  // net gelişimi scaled by student completion — sınav türüne göre
  const scaleNet = (g) => Math.round(g * Math.min(1, comp / ref));
  const NET_GROUPS = NET_CONFIG[sinav];
  const netGroupNames = Object.keys(NET_GROUPS);
  const buildNet = (grp) => NET_GROUPS[grp].map((r) => ({ ...r, son: r.bas + scaleNet(r.son - r.bas) }));
  const netData = netGroupNames.map((g) => ({ grp: g, rows: buildNet(g) }));
  const totalGain = netData.reduce((a, g) => a + g.rows.reduce((b, r) => b + (r.son - r.bas), 0), 0);

  // Haftalık soru takibi (scaled)
  const DAY_LABELS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
  const weekBase = [120, 140, 95, 165, 110, 185, 60];
  const wf = 0.42 + 0.58 * (comp / 100);
  const weekSoru = weekBase.map((v, i) => ({ l: DAY_LABELS[i], v: Math.round(v * wf) }));
  const weekTotal = weekSoru.reduce((a, d) => a + d.v, 0);
  const subjWeek = perSubj.map((p) => ({ s: p.s, done: Math.max(1, Math.round((p.soru / totalSoru) * weekTotal)) }));
  const doneOf = (s) => subjWeek.find((d) => d.s === s).done;

  // Haftalık soru HEDEFLERİ — grup (alt kırılım) bazında. Anahtar: "Ders::Grup"
  const gkey = (s, g) => `${s}::${g}`;
  const defaultTargets = () => {
    const o = {};
    KONU_SUBJECTS.forEach((s) => {
      const groups = CURR[s] || [];
      const per = Math.round((doneOf(s) * 1.25 / Math.max(1, groups.length)) / 5) * 5 || 10;
      groups.forEach((g) => { o[gkey(s, g.grup)] = per; });
    });
    return o;
  };
  const [targets, setTargets] = useState(defaultTargets);
  const [savedTick, setSavedTick] = useState(false);
  const [expTarget, setExpTarget] = useState(null);
  const [kaynakFilter, setKaynakFilter] = useState(null);
  const [netView, setNetView] = useState("gelisim");
  const [soruView, setSoruView] = useState("week");
  const [soruWeek, setSoruWeek] = useState(0);
  useEffect(() => { setKaynakFilter(null); }, [sid, sinav, subj]);
  const [htWeek, setHtWeek] = useState("w0");
  const isMonth = htWeek === "month";
  const isPastWeek = htWeek !== "w0";
  const weekFactor = isMonth ? 1 : ({ w0: 1, w1: 0.82, w2: 0.7, w3: 0.6 }[htWeek] || 1);
  useEffect(() => { setTargets(defaultTargets()); }, [sid, sinav]);

  const subjTarget = (s) => (CURR[s] || []).reduce((a, g) => a + (targets[gkey(s, g.grup)] || 0), 0);
  // grup başına gerçekleşen: dersin haftalık çözülenini konu sayısına göre dağıt
  const groupDone = (s, g) => {
    const groups = CURR[s] || [];
    const totalKonu = groups.reduce((a, x) => a + x.konular.length, 0) || 1;
    return Math.round(doneOf(s) * (g.konular.length / totalKonu));
  };
  const totalTarget = KONU_SUBJECTS.reduce((a, s) => a + subjTarget(s), 0);
  const totalDone = subjWeek.reduce((a, d) => a + d.done, 0);
  const setGroupTarget = (s, g, v) => setTargets((t) => ({ ...t, [gkey(s, g)]: v }));
  const saveTargets = () => { setSavedTick(true); setTimeout(() => setSavedTick(false), 2000); };

  // Ödev Ata modalı
  const [modal, setModal] = useState({ open: false, subject: null, topic: null });
  const [schedModal, setSchedModal] = useState(false);
  const [assignedToast, setAssignedToast] = useState(null);
  const openAta = (subject = null, topic = null) => setModal({ open: true, subject, topic });
  const handleAssign = (items, note, due) => {
    const konu = items.length, soru = items.reduce((a, x) => a + x.soru, 0);
    setAssignedToast({ konu, soru, due });
    setTimeout(() => setAssignedToast(null), 3600);
  };

  // Deneme analizleri: en çok yanlış yapılan (zayıf) konular
  const weak = perSubj
    .flatMap((p) => p.t.filter((t) => t.soru > 0).map((t) => ({ ...t, subj: p.s, oran: Math.round((t.dogru / t.soru) * 100), yanlis: t.soru - t.dogru })))
    .sort((a, b) => a.oran - b.oran)
    .slice(0, 5);

  const cur = perSubj.find((x) => x.s === activeSubj);

  // Soru Takibi — gün-gün / hafta / ay (deterministik demo dağılımı)
  const WEEK_NAV = ["Bu hafta", "1 hafta önce", "2 hafta önce", "3 hafta önce"];
  const WK_FACTORS = [1, 0.82, 0.7, 0.6];
  const DAY_WEIGHTS = [0.15, 0.16, 0.12, 0.16, 0.12, 0.17, 0.12];
  const hseed = (str) => { let h = 0; for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0; return h; };
  const dailyTotals = (wIdx) => DAY_LABELS.map((l, di) => {
    const base = weekTotal * WK_FACTORS[wIdx] * DAY_WEIGHTS[di];
    const jit = (hseed(sid + ":" + wIdx + ":" + di) % 23) - 11;
    return { l, v: Math.max(0, Math.round(base + jit)) };
  });
  const monthlyTotals = () => [3, 2, 1, 0].map((wi) => ({ l: wi === 0 ? "Bu hafta" : wi + " hf önce", v: dailyTotals(wi).reduce((a, d) => a + d.v, 0) }));
  const soruData = soruView === "month" ? monthlyTotals() : dailyTotals(soruWeek);
  const soruTotal = soruData.reduce((a, d) => a + d.v, 0);
  const soruAvg = Math.round(soruTotal / soruData.length);
  const soruPeak = soruData.reduce((m, d, i, a) => d.v > a[m].v ? i : m, 0);

  return (
    <div className="stack rise">
      <PageHead
        title="Konu Takibi"
        sub="Öğrencinin ders bazında konu ilerlemesi, çözülen soru ve net gelişimi"
        actions={
          <div className="row" style={{ gap: 10 }}>
            <div className="field" style={{ minWidth: 200 }}>
              <select className="select" value={sid} onChange={(e) => setSid(e.target.value)}>
                {roster.map((s) => <option key={s.id} value={s.id}>{s.name} · {s.grade} · {s.sinav || "YKS"}</option>)}
              </select>
            </div>
            <button className="btn btn-primary" onClick={() => openAta()}><Icon name="plus" size={16} />Ödev Ata</button>
          </div>
        }
      />

      {/* student strip */}
      <div className="card"><div className="card-pad" style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <Avatar name={student.name} size={52} />
        <div style={{ flex: 1, minWidth: 180 }}>
          <div className="row" style={{ gap: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-.01em" }}>{student.name}</span>
            <span className="badge badge-primary">{sinav}</span>
          </div>
          <div className="muted" style={{ fontSize: 12.5 }}>{student.grade} · {sinav === "LGS" ? "LGS 2026 hedefi" : "Hedef: YKS 2026"} · KAMP ÜS programı</div>
        </div>
        <div className="row" style={{ gap: 10 }}>
          <button className="btn btn-light btn-sm" onClick={() => setSchedModal(true)}><Icon name="calendar" size={15} />Okul Programı</button>
          <RiskDot risk={student.risk} />
          <span className="badge badge-muted"><Icon name="clock" size={13} />{student.last}</span>
        </div>
      </div></div>

      {typeof NetGainMap === "function" ? <NetGainMap student={student.name} sinav={sinav} role="coach" onPick={(a) => openAta(a.subject, a.topic)} /> : null}

      {typeof CoachMistakesCard === "function" ? <CoachMistakesCard student={student.name} onAssign={(s, t) => openAta(s, t)} /> : null}
      {typeof HataFrekansiCard === "function" ? <HataFrekansiCard student={student.name} role="coach" /> : null}

      <div className="grid g-4">
        <StatCard icon="book" tone="primary" value={`${overallPct}%`} label="Genel konu tamamlama" />
        <StatCard icon="checkCircle" tone="success" value={`${doneTopics}/${totalTopics}`} label="Tamamlanan konu" />
        <StatCard icon="notebook" tone="info" value={totalSoru.toLocaleString("tr-TR")} label="Çözülen soru" />
        <StatCard icon="trend" tone="warning" value={`+${totalGain}`} label={sinav === "LGS" ? "Net gelişimi (LGS)" : "Net gelişimi (TYT+AYT)"} />
      </div>

      {/* Net gelişimi */}
      <StudentNotesCard student={student.name} />
      <Section title="Net Gelişimi" sub={sinav === "LGS" ? "Başlangıç → Son net (Sayısal / Sözel)" : "Başlangıç → Son net (TYT / AYT)"} action={<div className="row" style={{ gap: 8, alignItems: "center" }}><div className="seg" style={{ height: 32 }}><button className={netView === "gelisim" ? "on" : ""} onClick={() => setNetView("gelisim")}>Gelişim</button><button className={netView === "liste" ? "on" : ""} onClick={() => setNetView("liste")}>Tüm denemeler</button></div><Badge tone="success" icon="trend">+{totalGain} net</Badge></div>}>
        <div className="card-body">
          {netView === "liste" ? <ExamHistoryList studentName={student.name} /> : <div className="grid g-2" style={{ gap: 28 }}>
            {netData.map(({ grp, rows }) => (
              <div key={grp}>
                <div className="row" style={{ gap: 8, marginBottom: 14 }}><span className="badge badge-primary">{grp}</span><span className="muted" style={{ fontSize: 12 }}>Net karşılaştırması</span></div>
                <div className="subj">
                  {rows.map((r, i) => {
                    const max = r.max || 40;
                    const gain = r.son - r.bas;
                    return (
                      <div className="subj-row" key={i}>
                        <div className="between" style={{ marginBottom: 7 }}>
                          <span className="sname">{r.ders}</span>
                          <span className="row" style={{ gap: 8 }}>
                            <span className="tnum muted" style={{ fontSize: 12 }}>{r.bas}</span>
                            <Icon name="chevronRight" size={13} style={{ color: "var(--faint)" }} />
                            <span className="tnum" style={{ fontSize: 13, fontWeight: 800 }}>{r.son}</span>
                            {gain > 0 ? <span className="delta up" style={{ fontSize: 11 }}><Icon name="arrowUp" size={11} />{gain}</span> : <span className="delta flat" style={{ fontSize: 11 }}>0</span>}
                          </span>
                        </div>
                        <div className="bar" style={{ position: "relative" }}>
                          <span style={{ width: `${(r.bas / max) * 100}%`, background: "var(--border-strong)" }} />
                          <span style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${(r.son / max) * 100}%`, background: "var(--primary)", borderRadius: 999 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>}
        </div>
      </Section>

      {/* Soru hedefleri + Deneme analizleri (zayıf konular) */}
      <div className="grid col-main">
        <Section
          title="Haftalık Soru Hedefi"
          sub={isMonth ? "Bu ayın toplam hedefi ve gerçekleşmesi (4 hafta)" : isPastWeek ? `${WEEKS.find((w) => w.id === htWeek).range} · geçmiş hedef (salt görünüm)` : "Öğrencin için ders bazında hedef belirle"}
          action={
            isMonth
              ? <Badge tone="primary" icon="calendar">Aylık görünüm</Badge>
              : isPastWeek
              ? <Badge tone="muted" icon="clock">Geçmiş hafta</Badge>
              : <button className="btn btn-primary btn-sm" onClick={saveTargets}>
                  <Icon name={savedTick ? "check" : "target"} size={15} />{savedTick ? "Kaydedildi" : "Hedefleri kaydet"}
                </button>
          }
        >
          <div className="card-body">
            <div className="seg" style={{ width: "fit-content", flexWrap: "wrap", marginBottom: 14 }}>
              {WEEKS.map((w) => (
                <button key={w.id} className={htWeek === w.id ? "on" : ""} onClick={() => setHtWeek(w.id)}>{w.label}</button>
              ))}
              <button className={isMonth ? "on" : ""} onClick={() => setHtWeek("month")} style={{ fontWeight: 700 }}><Icon name="dashboard" size={14} />Tablo</button>
            </div>
            <div className="between" style={{ marginBottom: 16, padding: "12px 14px", background: "var(--surface-3)", borderRadius: 12 }}>
              <div>
                <div className="muted" style={{ fontSize: 11.5, fontWeight: 700 }}>{isMonth ? "TOPLAM HEDEF" : "HAFTALIK TOPLAM HEDEF"}</div>
                <div className="row" style={{ gap: 8, alignItems: "baseline", marginTop: 2 }}>
                  <span className="tnum" style={{ fontSize: 26, fontWeight: 800 }}>{(isPastWeek ? Math.round(totalTarget * weekFactor) : totalTarget).toLocaleString("tr-TR")}</span>
                  <span className="muted" style={{ fontSize: 12.5, fontWeight: 600 }}>soru</span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="muted" style={{ fontSize: 11.5, fontWeight: 700 }}>{isMonth ? "TOPLAM ÇÖZÜLEN" : "BU HAFTA ÇÖZÜLEN"}</div>
                <div className="row" style={{ gap: 8, alignItems: "baseline", marginTop: 2, justifyContent: "flex-end" }}>
                  <span className="tnum" style={{ fontSize: 26, fontWeight: 800, color: "var(--primary)" }}>{(isPastWeek ? Math.round(totalDone * weekFactor) : totalDone).toLocaleString("tr-TR")}</span>
                  <span className="badge badge-primary" style={{ height: 22 }}>%{Math.round((totalDone / totalTarget) * 100)}</span>
                </div>
              </div>
            </div>

            {isMonth ? (
              <div style={{ overflowX: "auto", border: "1px solid var(--border)", borderRadius: 12 }}>
                <table className="tbl" style={{ minWidth: 520 }}>
                  <thead><tr><th>Ders</th><th>Kırılım</th><th style={{ textAlign: "center" }}>Konu</th><th style={{ textAlign: "center" }}>Hedef</th><th style={{ textAlign: "center" }}>Çözülen</th><th style={{ textAlign: "right" }}>Durum</th></tr></thead>
                  <tbody>
                    {KONU_SUBJECTS.flatMap((s) => {
                      const c = SUBJECT_COLORS[s];
                      const groups = CURR[s] || [];
                      return groups.map((g, gi) => {
                        const gt = targets[gkey(s, g.grup)] || 0;
                        const gd = groupDone(s, g);
                        const pct = gt ? Math.min(100, Math.round((gd / gt) * 100)) : 0;
                        const ghit = gd >= gt && gt > 0;
                        return (
                          <tr key={s + g.grup}>
                            <td>{gi === 0 ? <div className="row" style={{ gap: 8 }}><span className="swatch" style={{ width: 9, height: 9, borderRadius: 3, background: c }} /><b style={{ fontSize: 12.5 }}>{s}</b></div> : null}</td>
                            <td><span style={{ fontSize: 12.5, fontWeight: 600 }}>{g.grup}</span></td>
                            <td style={{ textAlign: "center" }}><span className="muted tnum" style={{ fontSize: 12 }}>{g.konular.length}</span></td>
                            <td style={{ textAlign: "center" }}><span className="tnum" style={{ fontWeight: 700 }}>{gt}</span></td>
                            <td style={{ textAlign: "center" }}><span className="tnum" style={{ fontWeight: 700, color: ghit ? "var(--success)" : "var(--text-2)" }}>{gd}</span></td>
                            <td style={{ textAlign: "right" }}><div className="row" style={{ gap: 8, justifyContent: "flex-end" }}><div style={{ width: 70 }}><Bar value={pct} color={ghit ? "var(--success)" : c} thin /></div><span className="tnum" style={{ fontSize: 11.5, fontWeight: 700, minWidth: 32, textAlign: "right" }}>%{pct}</span></div></td>
                          </tr>
                        );
                      });
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
            <div className="subj" style={{ gap: 10 }}>
              {KONU_SUBJECTS.map((s) => {
                const c = SUBJECT_COLORS[s];
                const tgt = isPastWeek ? Math.round(subjTarget(s) * weekFactor / 5) * 5 : subjTarget(s);
                const done = isPastWeek ? Math.round(doneOf(s) * weekFactor) : doneOf(s);
                const pct = tgt ? Math.min(100, Math.round((done / tgt) * 100)) : 0;
                const hit = done >= tgt && tgt > 0;
                const open2 = expTarget === s;
                const groups = CURR[s] || [];
                return (
                  <div className={`acc-item${open2 ? " open" : ""}`} key={s}>
                    <button className="acc-head" style={{ padding: "11px 14px" }} onClick={() => setExpTarget(open2 ? null : s)}>
                      <span className="swatch" style={{ width: 11, height: 11, borderRadius: 4, background: c, flexShrink: 0 }} />
                      <span style={{ fontWeight: 700, fontSize: 13.5 }}>{s}</span>
                      <span className="muted" style={{ fontSize: 11 }}>{groups.length} kırılım</span>
                      <div className="row" style={{ gap: 12, marginLeft: "auto" }}>
                        <span className="tnum" style={{ fontSize: 12.5, fontWeight: 700, color: hit ? "var(--success)" : "var(--text-2)" }}>{done} / {tgt}</span>
                        <Icon name="chevronDown" size={16} style={{ color: "var(--faint)", transform: open2 ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
                      </div>
                    </button>
                    <div style={{ padding: "0 14px 11px" }}>
                      <div className="bar"><span style={{ width: `${pct}%`, background: hit ? "var(--success)" : c }} /></div>
                    </div>
                    {open2 ? (
                      <div className="acc-body" style={{ paddingTop: 2 }}>
                        {groups.map((g) => {
                          const gt = targets[gkey(s, g.grup)] || 0;
                          const gd = groupDone(s, g);
                          const ghit = gd >= gt && gt > 0;
                          return (
                            <div className="grp-target" key={g.grup}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="row" style={{ gap: 8 }}>
                                  <span style={{ fontWeight: 700, fontSize: 12.5 }}>{g.grup}</span>
                                  <span className="muted" style={{ fontSize: 10.5 }}>{g.konular.length} konu</span>
                                </div>
                                <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{g.konular.join(" · ")}</div>
                              </div>
                              <span className="tnum" style={{ fontSize: 12, fontWeight: 700, color: ghit ? "var(--success)" : "var(--muted)", whiteSpace: "nowrap" }}>{gd} / {gt}</span>
                              {isPastWeek
                                ? <span className="badge badge-muted" style={{ height: 30 }}>{gt}</span>
                                : <NumStepper value={gt} onChange={(v) => setGroupTarget(s, g.grup, v)} step={5} min={0} max={1000} size="sm" />}
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
            )}
            <div className="muted" style={{ fontSize: 11.5, marginTop: 14, display: "flex", alignItems: "center", gap: 6 }}>
              <Icon name="bolt" size={13} />Hedefler öğrencinin paneline “Haftalık Hedef” olarak yansır.
            </div>
          </div>
        </Section>

        <Section title="Deneme Analizleri" sub="En çok yanlış yapılan konular" action={<Badge tone="danger" icon="alert">{weak.length} zayıf konu</Badge>}>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {weak.map((t, i) => {
              const c = SUBJECT_COLORS[t.subj];
              const tone = t.oran < 55 ? "danger" : t.oran < 70 ? "warning" : "success";
              return (
                <div className="lrow" key={i}>
                  <span className="lr-icon" style={{ background: `color-mix(in srgb, ${c} 13%, transparent)`, color: c }}><Icon name="alert" size={18} /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="lr-title">{t.n}</div>
                    <div className="lr-meta">
                      <span className="chip" style={{ height: 21, fontSize: 10.5, padding: "0 7px" }}><span className="swatch" style={{ background: c }} />{t.subj}</span>
                      <span className="d" style={{ color: "var(--danger)", fontWeight: 700 }}>{t.yanlis} yanlış</span>
                      <span className="d">%{t.oran} doğru</span>
                    </div>
                  </div>
                  <button className="btn btn-light btn-sm" onClick={() => openAta(t.subj, t.n)}><Icon name="plus" size={15} />Ödev ata</button>
                </div>
              );
            })}
          </div>
        </Section>
      </div>

      {/* Soru Takibi — gün-gün / hafta / ay navigasyonlu */}
      <Section title="Soru Takibi" sub={soruView === "month" ? "Son 4 hafta çözülen soru" : `${WEEK_NAV[soruWeek]} · günlük çözülen soru`}
        action={
          <div className="seg" style={{ width: "fit-content" }}>
            <button className={soruView === "week" ? "on" : ""} onClick={() => setSoruView("week")}>Haftalık</button>
            <button className={soruView === "month" ? "on" : ""} onClick={() => setSoruView("month")}>Aylık</button>
          </div>
        }>
        <div className="card-body">
          <div className="between" style={{ marginBottom: 14, flexWrap: "wrap", gap: 12 }}>
            <div className="row" style={{ gap: 18 }}>
              <div><div className="muted" style={{ fontSize: 11, fontWeight: 700 }}>TOPLAM</div><div className="row" style={{ gap: 6, alignItems: "baseline" }}><span className="tnum" style={{ fontSize: 24, fontWeight: 800 }}>{soruTotal.toLocaleString("tr-TR")}</span><span className="muted" style={{ fontSize: 12 }}>soru</span></div></div>
              <div><div className="muted" style={{ fontSize: 11, fontWeight: 700 }}>{soruView === "month" ? "HAFTA ORT." : "GÜN ORT."}</div><div className="tnum" style={{ fontSize: 24, fontWeight: 800, color: "var(--primary)" }}>{soruAvg.toLocaleString("tr-TR")}</div></div>
            </div>
            {soruView === "week" ? (
              <div className="row" style={{ gap: 6 }}>
                <button className="icon-btn" style={{ width: 34, height: 34 }} disabled={soruWeek >= 3} onClick={() => setSoruWeek((w) => Math.min(3, w + 1))} title="Önceki hafta"><Icon name="chevronRight" size={16} style={{ transform: "scaleX(-1)" }} /></button>
                <span style={{ fontSize: 12.5, fontWeight: 700, minWidth: 92, textAlign: "center" }}>{WEEK_NAV[soruWeek]}</span>
                <button className="icon-btn" style={{ width: 34, height: 34 }} disabled={soruWeek <= 0} onClick={() => setSoruWeek((w) => Math.max(0, w - 1))} title="Sonraki hafta"><Icon name="chevronRight" size={16} /></button>
              </div>
            ) : null}
          </div>
          <div className="soru-chart">
            {soruData.map((d, i) => {
              const max = Math.max(...soruData.map((x) => x.v), 1);
              const h = Math.round((d.v / max) * 100);
              return (
                <div className={`sc-col${i === soruPeak ? " peak" : ""}`} key={i}>
                  <span className="sc-val tnum">{d.v}</span>
                  <div className="sc-track"><div className="sc-bar" style={{ height: `${h}%` }} /></div>
                  <span className="sc-lab">{d.l}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* Konu takibi: ders rayı + konu kartları (yeni tasarım) */}
      <div className="ktx">
        <div className="ktx-rail">
          <div className="ktx-rail-head"><b>Dersler</b></div>
          <div className="ktx-rail-list">
            {perSubj.map((p) => {
              const c = SUBJECT_COLORS[p.s];
              const on = p.s === activeSubj;
              const pct = Math.round((p.done / p.total) * 100);
              return (
                <button key={p.s} type="button" className={"ktx-subj" + (on ? " on" : "")} onClick={() => setSubj(p.s)}>
                  <div className="top"><span className="sw" style={{ background: c }} /><span className="nm" style={{ color: on ? c : "var(--text)" }}>{p.s}</span><span className="pct" style={{ color: c }}>%{pct}</span></div>
                  <div className="meta">{p.done}/{p.total} konu · {p.soru.toLocaleString("tr-TR")} soru</div>
                  <div className="bar"><span style={{ width: pct + "%", background: c }} /></div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="ktx-panel">
          <div className="ktx-phead">
            <span className="sw" style={{ background: SUBJECT_COLORS[activeSubj] }} />
            <div>
              <div className="ttl">{activeSubj}</div>
              <div className="sub">{cur.done}/{cur.total} konu tamamlandı · {cur.soru.toLocaleString("tr-TR")} soru</div>
            </div>
            {(() => {
              const srcs = KAYNAKLAR[activeSubj] || KAYNAK_DEF;
              return (
                <div className="ktx-filters">
                  <button type="button" className={"ktx-fchip" + (!kaynakFilter ? " on" : "")} onClick={() => setKaynakFilter(null)}>Tümü</button>
                  {srcs.map((k) => {
                    const on = kaynakFilter === k;
                    return <button type="button" key={k} className={"ktx-fchip" + (on ? " on" : "")} onClick={() => setKaynakFilter(on ? null : k)}><Icon name="book" size={12} />{k}</button>;
                  })}
                </div>
              );
            })()}
          </div>

          <div className="ktx-body">
            {(() => {
              const rendered = (CURR[activeSubj] || []).map((g) => {
                const gtopics = cur.t.filter((t) => g.konular.includes(t.n));
                const shown = kaynakFilter ? gtopics.filter((t) => (t.kaynaklar || [t.kaynak]).includes(kaynakFilter)) : gtopics;
                return { g, gtopics, shown };
              }).filter((x) => x.shown.length > 0);
              if (rendered.length === 0) {
                return (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 9, padding: "38px 24px", textAlign: "center" }}>
                    <span style={{ width: 48, height: 48, borderRadius: 14, background: "var(--surface-3)", color: "var(--faint)", display: "grid", placeItems: "center" }}><Icon name="book" size={24} /></span>
                    <b style={{ fontSize: 14, fontWeight: 800 }}>“{kaynakFilter}” kaynağıyla konu yok</b>
                    <p className="muted" style={{ fontSize: 12.5, maxWidth: 340 }}>{activeSubj} dersinde bu kaynakla işlenmiş konu bulunamadı. Filtreyi kaldırıp tüm konuları gör.</p>
                    <button className="btn btn-light btn-sm" onClick={() => setKaynakFilter(null)}><Icon name="refresh" size={15} />Filtreyi kaldır</button>
                  </div>
                );
              }
              return rendered.map(({ g, gtopics, shown }) => {
                const gdone = gtopics.filter((t) => t.s === "done").length;
                const gpct = Math.round((gdone / gtopics.length) * 100);
                return (
                  <div className="ktx-grp" key={g.grup}>
                    <div className="ktx-grp-head">
                      <span className="gn">{g.grup}</span>
                      <span className="gc">{gdone}/{gtopics.length} konu</span>
                      <span className="gbar"><span style={{ width: gpct + "%", background: gpct >= 80 ? "var(--success)" : SUBJECT_COLORS[activeSubj] }} /></span>
                      <span className="gp">%{gpct}</span>
                    </div>
                    {shown.map((t, i) => {
                      const kList = t.kaynaklar || [t.kaynak];
                      const oran = t.soru > 0 ? Math.round((t.dogru / t.soru) * 100) : null;
                      const accColor = oran == null ? "var(--faint)" : oran >= 70 ? "var(--success)" : oran >= 55 ? "var(--warning)" : "var(--danger)";
                      return (
                        <div className={"ktx-topic " + t.s} key={i}>
                          <button type="button" className={"ktx-st " + t.s} title="Durumu değiştir (koç)" onClick={() => { if (typeof cycleKonuStatus === "function") { const ns = cycleKonuStatus(student.name, activeSubj, t.n); if (typeof toast === "function") toast(t.n + " · " + ns, { icon: ns === "done" ? "checkCircle" : "book" }); } }} style={{ border: "none", cursor: "pointer" }}><Icon name={t.s === "done" ? "check" : t.s === "progress" ? "clock" : "book"} size={16} stroke={t.s === "done" ? 3 : 2} /></button>
                          <div className="ktx-tmain">
                            <div className="ktx-tname">{t.n}</div>
                            <div className="ktx-srcs">
                              {kList.map((k, ki) => {
                                const kdone = (t.kaynakDone && t.kaynakDone[ki]);
                                return <span key={k} className={"ktx-src" + (kdone ? " done" : "")}><Icon name={kdone ? "check" : "book"} size={10} stroke={kdone ? 3 : 2} />{k}</span>;
                              })}
                            </div>
                          </div>
                          <div className="ktx-tstat">
                            {t.soru > 0 ? (
                              <React.Fragment>
                                <div className="l1"><span className="soru">{t.soru}<s> soru</s></span><span className="acc" style={{ color: accColor }}>%{oran}</span></div>
                                <div className="accbar"><span style={{ width: (oran || 0) + "%", background: accColor }} /></div>
                              </React.Fragment>
                            ) : <span className="empty">başlanmadı</span>}
                          </div>
                          <button type="button" className="ktx-ata" title="Bu konuya ödev ata" onClick={() => openAta(activeSubj, t.n)}><Icon name="plus" size={16} /></button>
                        </div>
                      );
                    })}
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>

      <OdevAtaModal
        open={modal.open}
        onClose={() => setModal({ open: false, subject: null, topic: null })}
        studentName={student.name}
        examType={sinav}
        initialSubject={modal.subject}
        initialTopic={modal.topic}
        onAssign={handleAssign}
      />
      {schedModal ? ReactDOM.createPortal((
        <div className="modal-overlay" onClick={() => setSchedModal(false)}>
          <div className="modal-panel" style={{ maxWidth: 720 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div className="row" style={{ gap: 9 }}>
                <span className="stat-icon tone-info" style={{ width: 36, height: 36 }}><Icon name="calendar" size={18} /></span>
                <div><h3 style={{ fontSize: 16, fontWeight: 800 }}>Okul Ders Programı</h3><div className="muted" style={{ fontSize: 12.5 }}>{student.name}</div></div>
              </div>
              <button className="icon-btn" style={{ width: 36, height: 36 }} onClick={() => setSchedModal(false)} aria-label="Kapat"><Icon name="plus" size={18} style={{ transform: "rotate(45deg)" }} /></button>
            </div>
            <div className="modal-body"><SchoolScheduleView student={student.name} bare /><div style={{ marginTop: 14 }}><SchoolExams student={student.name} /></div></div>
          </div>
        </div>
      ), document.body) : null}
      {assignedToast ? ReactDOM.createPortal((
        <div className="toast">
          <span className="lr-icon" style={{ width: 34, height: 34, background: "var(--success-soft)", color: "var(--success)" }}><Icon name="checkCircle" size={18} /></span>
          <div>
            <b style={{ fontSize: 13.5, fontWeight: 700 }}>Ödev atandı</b>
            <div className="muted" style={{ fontSize: 12 }}>{assignedToast.konu} konu · {assignedToast.soru} soru {student.name.split(" ")[0]}'e gönderildi{assignedToast.due ? ` · son tarih ${new Date(assignedToast.due).toLocaleDateString("tr-TR")}` : ""}</div>
          </div>
        </div>
      ), document.body) : null}
    </div>
  );
}

window.CoachKonuPage = CoachKonuPage;
