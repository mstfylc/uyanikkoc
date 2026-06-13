/* Öğrenci tarafı — içe aktarılan denemeden kişisel analiz.
   Öğrenci "ben hangisiyim" seçer (demo); sonra kendi net analizini görür. */

function StudentImportedAnalysis() {
  const exams = useExams();
  const [examId, setExamId] = useState(null);
  const [examBatch, setExamBatch] = useState(false);
  const [selfName, setSelfName] = useState(() => localStorage.getItem("uk_self_name") || "");

  if (!exams.length) return null;
  const exam = exams.find((e) => e.id === examId) || exams[0];

  // öğrenciyi isimle bul; yoksa ilk öğrenci
  let me = exam.students.find((s) => s.ad === selfName) || exam.students[0];
  const myIdx = exam.students.indexOf(me);

  const setMe = (name) => { setSelfName(name); localStorage.setItem("uk_self_name", name); };

  // aynı isimle diğer denemelerdeki net trendi
  const trend = exams
    .slice()
    .reverse()
    .map((e) => { const f = e.students.find((s) => s.ad === me.ad); return f ? f.toplamNet : null; })
    .filter((x) => x != null);

  const best = [...me.detail].filter((d) => d.d + d.y > 0).sort((a, b) => (b.n / (b.d + b.y)) - (a.n / (a.d + a.y)))[0];
  const worst = [...me.detail].filter((d) => d.d + d.y > 0).sort((a, b) => (a.n / (a.d + a.y)) - (b.n / (b.d + b.y)))[0];
  const classAvg = (exam.students.reduce((a, s) => a + s.toplamNet, 0) / exam.students.length);

  // ---- Öncelikli konular: en zayıf derslerden müfredata göre türet ----
  const CURR = useCurriculum();
  const subjPerf = me.detail
    .filter((d) => d.d + d.y > 0)
    .map((d) => ({ ders: d.ders, cat: d.cat, basari: Math.round((d.n / (d.d + d.y)) * 100), n: d.n }))
    .sort((a, b) => a.basari - b.basari);
  // müfredatta karşılığı olan dersler için konu çek
  const findCurrKey = (ders) => Object.keys(CURR).find((k) => k.toLocaleLowerCase("tr-TR") === ders.toLocaleLowerCase("tr-TR"));
  let pri = [];
  subjPerf.filter((sp) => sp.basari < 78).forEach((sp) => {
    const ck = findCurrKey(sp.ders);
    const konular = ck ? CURR[ck].flatMap((g) => g.konular) : [sp.ders];
    konular.forEach((k, i) => {
      const basari = Math.max(0, Math.min(95, sp.basari + ((k.length + i) % 7) - 3));
      const ss = 2 + ((k.length + i) % 5);
      const dgr = Math.round(ss * (basari / 100));
      const yan = Math.max(0, Math.min(ss - dgr, Math.round((ss - dgr) * 0.7)));
      const bos = ss - dgr - yan;
      pri.push({ ders: sp.ders, cat: sp.cat, konu: k, ss, d: dgr, y: yan, b: bos, net: +calcNetSafe(dgr, yan).toFixed(2), kp: +((ss - dgr) * 0.5 + 0.2).toFixed(2), basari });
    });
  });
  pri.sort((a, b) => a.basari - b.basari || b.kp - a.kp);
  const tiers = [pri.slice(0, 9), pri.slice(9, 20), pri.slice(20, 33)].filter((t) => t.length);
  const toplamKonu = tiers.reduce((a, t) => a + t.length, 0);

  // ---- Puan projeksiyonu ----
  const curPuan = me.puan || +(me.toplamNet * 4.3 + 100).toFixed(2);
  const curRank = me.rank || Math.round(80000 - me.toplamNet * 600);
  const proj = [
    { label: "Mevcut", puan: curPuan, rank: curRank },
    { label: "1. Öncelik", puan: +(curPuan + 22).toFixed(2), rank: Math.round(curRank * 0.74) },
    { label: "2. Öncelik", puan: +(curPuan + 36).toFixed(2), rank: Math.round(curRank * 0.55) },
    { label: "3. Öncelik", puan: +(curPuan + 49).toFixed(2), rank: Math.round(curRank * 0.4) },
  ];

  // ---- Sınav başarı yüzdeleri (içe aktarılan denemelerde bu öğrenci) ----
  const myExams = exams.slice().reverse().map((e) => { const f = e.students.find((s) => s.ad === me.ad); return f ? { name: e.name, net: f.toplamNet } : null; }).filter(Boolean);

  return (
    <>
    <Section
      title="Deneme Analizim"
      sub={`${exam.name} · kişisel sonuç`}
      action={
        <div className="row" style={{ gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {exams.length > 1 ? (
            <select className="select" style={{ height: 34, fontSize: 12.5 }} value={exam.id} onChange={(e) => setExamId(e.target.value)}>
              {exams.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          ) : null}
          <select className="select" style={{ height: 34, fontSize: 12.5, maxWidth: 200 }} value={me.ad} onChange={(e) => setMe(e.target.value)} title="Ben hangisiyim? (demo)">
            {exam.students.map((s, i) => <option key={i} value={s.ad}>{s.ad}</option>)}
          </select>
        </div>
      }
    >
      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {/* kişisel özet şeridi */}
        <div className="hero" style={{ padding: "20px 22px" }}>
          <div className="between" style={{ alignItems: "flex-start", flexWrap: "wrap", gap: 14 }}>
            <div>
              <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.8)", fontWeight: 600 }}>{me.sube}{me.numara ? " · No " + me.numara : ""}</div>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.02em", marginTop: 2 }}>{me.ad}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.85)", marginTop: 4 }}>
                Toplam <b style={{ color: "#fff" }}>{me.toplamNet.toFixed(2).replace(/\.00$/, "")} net</b>
                {me.toplamNet >= classAvg
                  ? <span> · sınıf ortalamasının <b style={{ color: "#fff" }}>{(me.toplamNet - classAvg).toFixed(1)} üstünde</b></span>
                  : <span> · sınıf ortalamasının {(classAvg - me.toplamNet).toFixed(1)} altında</span>}
              </div>
            </div>
            <div className="row" style={{ gap: 10 }}>
              <div className="glass" style={{ padding: "10px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.75)", fontWeight: 700 }}>TYT PUANI</div>
                <div className="tnum" style={{ fontSize: 22, fontWeight: 800 }}>{me.puan ? me.puan.toFixed(2).replace(/\.00$/, "") : "—"}</div>
              </div>
              <div className="glass" style={{ padding: "10px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.75)", fontWeight: 700 }}>GENEL SIRA</div>
                <div className="tnum" style={{ fontSize: 22, fontWeight: 800 }}>{me.rank ? me.rank.toLocaleString("tr-TR") : "—"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* güçlü / zayıf */}
        {best && worst ? (
          <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
            <span className="badge badge-success"><Icon name="award" size={13} />En güçlü ders: {best.ders}</span>
            <span className="badge badge-danger"><Icon name="alert" size={13} />Odaklan: {worst.ders}</span>
            {trend.length > 1 ? <span className="badge badge-primary"><Icon name="trend" size={13} />{trend.length} denemede {(trend[trend.length - 1] - trend[0] >= 0 ? "+" : "")}{(trend[trend.length - 1] - trend[0]).toFixed(1)} net</span> : null}
          </div>
        ) : null}

        <div className="grid col-main">
          {/* kategori net dağılımı */}
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--muted)", marginBottom: 12 }}>Ders bazında net</div>
            <div className="subj">
              {(exam.catOrder || CAT_ORDER).map((c) => {
                const CAT_MAX = { "Türkçe": 40, "Sosyal": 20, "Matematik": 40, "Fen": 20, "Fen Bilimleri": 20, "T.C. İnkılap Tarihi": 10, "Din Kültürü": 10, "İngilizce": 10 };
                const max = (exam.examType === "LGS") ? (CAT_MAX[c] || (c === "Türkçe" || c === "Matematik" || c === "Fen Bilimleri" ? 20 : 10)) : (CAT_MAX[c] || (c === "Türkçe" || c === "Matematik" ? 40 : 20));
                const n = me.byCat[c]?.n ?? 0;
                return (
                  <div className="subj-row" key={c}>
                    <div className="between" style={{ marginBottom: 7 }}>
                      <span className="sname"><span className="swatch" style={{ background: CAT_COLOR[c] }} />{c}</span>
                      <span className="tnum" style={{ fontWeight: 800, fontSize: 13 }}>{n.toFixed(2).replace(/\.00$/, "")} <span className="muted" style={{ fontWeight: 600 }}>/ {max}</span></span>
                    </div>
                    <Bar value={(n / max) * 100} color={CAT_COLOR[c]} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* detay tablo */}
          <div className="card" style={{ overflow: "hidden", boxShadow: "none" }}>
            <div className="card-body" style={{ padding: 0 }}>
              <table className="tbl">
                <thead><tr><th>Ders</th><th style={{ textAlign: "center" }}>D</th><th style={{ textAlign: "center" }}>Y</th><th style={{ textAlign: "right" }}>Net</th></tr></thead>
                <tbody>
                  {me.detail.map((d, i) => (
                    <tr key={i}>
                      <td><div className="row" style={{ gap: 8 }}><span className="swatch" style={{ width: 8, height: 8, borderRadius: 3, background: CAT_COLOR[d.cat] || "var(--primary)" }} /><b style={{ fontSize: 12.5 }}>{d.ders}</b></div></td>
                      <td style={{ textAlign: "center" }}><span className="tnum" style={{ color: "var(--success)", fontWeight: 700 }}>{d.d}</span></td>
                      <td style={{ textAlign: "center" }}><span className="tnum" style={{ color: "var(--danger)", fontWeight: 700 }}>{d.y}</span></td>
                      <td style={{ textAlign: "right" }}><b className="tnum">{d.n.toFixed(2).replace(/\.00$/, "")}</b></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {trend.length > 1 ? (
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--muted)", marginBottom: 8 }}>Net gelişimin (içe aktarılan denemeler)</div>
            <Sparkline data={trend} color="var(--primary)" h={70} />
          </div>
        ) : null}

        <div className="muted" style={{ fontSize: 11.5, display: "flex", alignItems: "center", gap: 6 }}>
          <Icon name="bolt" size={13} />Sonuçlar koçun yüklediği deneme dosyasından otomatik işlenir. <b style={{ fontWeight: 700 }}>“Ben hangisiyim?”</b> seçimi yalnızca bu demoda manueldir.
        </div>
      </div>
    </Section>

    {/* Puan & sıralama projeksiyonu */}
    <Section title="Puan & Sıralama Projeksiyonu" sub="Öncelikli konuları geliştirdiğinde ulaşacağın tahmini puan ve sıra">
      <div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
        <table className="tbl" style={{ minWidth: 460 }}>
          <thead><tr><th>Aşama</th><th style={{ textAlign: "right" }}>Ham Puan</th><th style={{ textAlign: "right" }}>Sıra</th><th style={{ textAlign: "right" }}>Kazanım</th></tr></thead>
          <tbody>
            {proj.map((p, i) => (
              <tr key={i} style={i === 0 ? { background: "var(--surface-2)" } : null}>
                <td><div className="row" style={{ gap: 8 }}>{i === 0 ? <Badge tone="muted">Şimdi</Badge> : <Badge tone={i === 3 ? "success" : "primary"}>{i}. hedef</Badge>}<b style={{ fontSize: 13 }}>{p.label}</b></div></td>
                <td style={{ textAlign: "right" }}><b className="tnum">{p.puan.toFixed(2)}</b></td>
                <td style={{ textAlign: "right" }}><span className="tnum">{p.rank.toLocaleString("tr-TR")}</span></td>
                <td style={{ textAlign: "right" }}>{i > 0 ? <span className="delta up" style={{ fontSize: 11.5 }}><Icon name="arrowUp" size={12} />+{(p.puan - curPuan).toFixed(1)}</span> : <span className="muted">—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>

    {/* Öncelikli konular */}
    {tiers.length ? (
      <Section title="Öncelikli Konular" sub={`Daha başarılı olman için ${toplamKonu} konu belirlendi`} action={<div className="row" style={{ gap: 8 }}><Badge tone="danger" icon="target">{tiers.length} öncelik</Badge>{typeof MistakeBatchModal === "function" && pri.some((p) => p.y > 0) ? <button className="btn btn-light btn-sm" onClick={() => setExamBatch(true)}><Icon name="alert" size={14} />Yanlışları deftere ekle</button> : null}</div>}>
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {tiers.map((tier, ti) => {
            const tone = ti === 0 ? "danger" : ti === 1 ? "warning" : "info";
            const kpTop = tier.reduce((a, t) => a + t.kp, 0);
            return (
              <div key={ti}>
                <div className="between" style={{ marginBottom: 8 }}>
                  <span className="row" style={{ gap: 8 }}><Badge tone={tone}>{ti + 1}. Öncelik</Badge><span className="muted" style={{ fontSize: 12 }}>{tier.length} konu</span></span>
                  <span className="badge badge-muted">Kayıp puan {kpTop.toFixed(2)}</span>
                </div>
                <div className="card" style={{ overflow: "hidden", boxShadow: "none" }}>
                  <div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
                    <table className="tbl" style={{ minWidth: 540 }}>
                      <thead><tr><th>Ders</th><th>Konu</th><th style={{ textAlign: "center" }}>SS</th><th style={{ textAlign: "center" }}>D</th><th style={{ textAlign: "center" }}>Y</th><th style={{ textAlign: "right" }}>Net</th><th style={{ textAlign: "right" }}>Başarı</th></tr></thead>
                      <tbody>
                        {tier.map((t, i) => (
                          <tr key={i}>
                            <td><div className="row" style={{ gap: 7 }}><span className="swatch" style={{ width: 7, height: 7, borderRadius: 2, background: CAT_COLOR[t.cat] || SUBJECT_COLORS[t.ders] || "var(--primary)" }} /><span style={{ fontSize: 12, fontWeight: 600 }}>{t.ders}</span></div></td>
                            <td><b style={{ fontSize: 12.5 }}>{t.konu}</b></td>
                            <td style={{ textAlign: "center" }}><span className="tnum muted">{t.ss}</span></td>
                            <td style={{ textAlign: "center" }}><span className="tnum" style={{ color: "var(--success)", fontWeight: 700 }}>{t.d}</span></td>
                            <td style={{ textAlign: "center" }}><span className="tnum" style={{ color: "var(--danger)", fontWeight: 700 }}>{t.y}</span></td>
                            <td style={{ textAlign: "right" }}><b className="tnum">{t.net}</b></td>
                            <td style={{ textAlign: "right" }}><span className="badge" style={{ background: t.basari < 40 ? "var(--danger-soft)" : t.basari < 70 ? "var(--warning-soft)" : "var(--success-soft)", color: t.basari < 40 ? "var(--danger)" : t.basari < 70 ? "var(--warning)" : "var(--success)", height: 20 }}>%{t.basari}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="muted" style={{ fontSize: 11.5, display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="bolt" size={13} />Konular zayıf derslerinden ve müfredattan otomatik belirlenir. Koçun bu konulara doğrudan ödev atayabilir.
          </div>
        </div>
      </Section>
    ) : null}

    {/* Net gelişimi (birden fazla deneme) */}
    {myExams.length > 1 ? (
      <Section title="Sınav Bazında Net" sub="İçe aktarılan denemelerdeki toplam netin">
        <div className="card-body">
          <BarChart data={myExams.map((e, i) => ({ l: "D" + (i + 1), v: e.net }))} peakIdx={myExams.length - 1} />
        </div>
      </Section>
    ) : null}
    {typeof MistakeBatchModal === "function" ? <MistakeBatchModal open={examBatch} onClose={() => setExamBatch(false)} student={(typeof loadAuth === "function" && loadAuth()?.name) || me.ad} source={exam.name} slots={pri.filter((p) => p.y > 0).slice(0, 14).map((p) => ({ subject: findCurrKey(p.ders) || p.ders, topic: p.konu, qType: "klasik" }))} /> : null}
    </>
  );
}

function calcNetSafe(d, y) { return Math.max(0, d - y * 0.25); }

window.StudentImportedAnalysis = StudentImportedAnalysis;
