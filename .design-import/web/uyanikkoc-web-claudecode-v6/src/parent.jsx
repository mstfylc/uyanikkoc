/* Veli (parent) rolü — çocuğunun ödev, deneme, randevu, koç notları özetini görür. */

const CHILD = "Elif Yıldız"; // demo: velinin çocuğu

function VeliDashboard() {
  const odevler = useOdevler().filter((o) => o.student === CHILD);
  const exams = useExams();
  const notes = useNotes(CHILD);
  const appts = useAppts().filter((a) => a.student === CHILD);
  const sch = useSched(CHILD);

  const wk = odevler.filter((o) => o.week === "w0");
  const done = wk.filter((o) => o.status === "done").length;
  const rate = wk.length ? Math.round((done / wk.length) * 100) : 0;
  const lastExam = exams.length ? exams[0].students.find((s) => s.ad === CHILD) : null;
  const pinned = notes.filter((n) => n.pinned);

  return (
    <div className="stack rise">
      <div className="hero">
        <div className="between" style={{ alignItems: "flex-start", flexWrap: "wrap", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.78)", fontWeight: 600, marginBottom: 6 }}>Merhaba 👋</div>
            <h2 style={{ marginBottom: 7 }}>Çocuğunuz {CHILD.split(" ")[0]}'in gelişimi</h2>
            <p>Koç <b style={{ color: "#fff" }}>Dilek Emen</b> · 11. Sınıf Sayısal · Hedef YKS 2026</p>
          </div>
          <span className="badge" style={{ background: "rgba(255,255,255,.16)", color: "#fff", height: 26 }}><Icon name="cap" size={14} />Veli Paneli</span>
        </div>
      </div>

      <div className="grid g-4">
        <StatCard icon="target" tone="success" value={`${rate}%`} label="Bu hafta ödev tamamlama" />
        <StatCard icon="clipboard" tone="warning" value={wk.length - done} label="Bekleyen ödev" />
        <StatCard icon="chart" tone="primary" value={lastExam ? lastExam.toplamNet.toFixed(1) : "—"} label="Son deneme neti" />
        <StatCard icon="flame" tone="danger" value="12" label="Çalışma serisi (gün)" />
      </div>

      <div className="grid col-main">
        <Section title="Haftalık Ödevler" sub={`${CHILD} · bu hafta`} action={<Badge tone={rate >= 70 ? "success" : "warning"}>{done}/{wk.length} tamam</Badge>}>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {wk.length === 0 ? <div style={{ padding: "16px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Bu hafta ödev yok.</div>
              : wk.map((o) => {
                const c = SUBJECT_COLORS[o.subject] || "var(--primary)";
                return (
                  <div className="lrow" key={o.id} style={{ cursor: "default" }}>
                    <span className="lr-icon" style={{ background: `color-mix(in srgb, ${c} 13%, transparent)`, color: c, flexShrink: 0 }}><Icon name={(ODEV_TYPES[o.type] || ODEV_TYPES.soru).icon} size={18} /></span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="lr-title">{o.topic}</div>
                      <div className="lr-meta"><span className="chip" style={{ height: 20, fontSize: 10.5 }}><span className="swatch" style={{ background: c }} />{o.subject}</span>{o.result ? <span className="d" style={{ color: "var(--success)" }}>net {Math.max(0, o.result.d - o.result.y / 4).toFixed(2).replace(/\.00$/, "")}</span> : null}</div>
                    </div>
                    {o.status === "done" ? <Badge tone="success" icon="check">Bitti</Badge> : <Badge tone="warning" dot>Bekliyor</Badge>}
                  </div>
                );
              })}
          </div>
        </Section>

        <div className="stack">
          <Section title="Koçtan Notlar" sub="Önemli uyarılar">
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(pinned.length ? pinned : notes.slice(0, 2)).length === 0 ? <div style={{ padding: "10px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Henüz not yok.</div>
                : (pinned.length ? pinned : notes.slice(0, 2)).map((n) => {
                  const k = NOTE_KINDS[n.kind] || NOTE_KINDS.genel;
                  return (
                    <div className="lrow" key={n.id} style={{ cursor: "default", alignItems: "flex-start" }}>
                      <span className="lr-icon" style={{ background: `var(--${k.tone}-soft)`, color: `var(--${k.tone})`, flexShrink: 0 }}><Icon name={k.icon} size={17} /></span>
                      <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, lineHeight: 1.4 }}>{n.text}</div><div className="lr-meta"><Badge tone={k.tone}>{k.label}</Badge><span className="d">{n.date}</span></div></div>
                    </div>
                  );
                })}
            </div>
          </Section>

          <Section title="Yaklaşan Randevu">
            <div className="card-body">
              {appts.filter((a) => a.status === "approved").length === 0 ? <div style={{ padding: "10px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Onaylı randevu yok.</div>
                : appts.filter((a) => a.status === "approved").map((a) => (
                  <div key={a.id} className="lrow" style={{ cursor: "default" }}>
                    <span className="lr-icon" style={{ background: "var(--primary-soft)", color: "var(--primary-600)" }}><Icon name="calendar" size={18} /></span>
                    <div style={{ flex: 1 }}><div className="lr-title">Koç görüşmesi</div><div className="lr-meta">{a.day} {a.slot} · {APPT_MODE[a.mode].label}</div></div>
                  </div>
                ))}
            </div>
          </Section>
        </div>
      </div>

      {typeof NetGainMap === "function" ? <NetGainMap student={CHILD} sinav="YKS" role="parent" /> : null}
      {typeof HataFrekansiCard === "function" ? <HataFrekansiCard student={CHILD} role="coach" /> : null}

      <KaynakTracker student={CHILD} editable={false} />
    </div>
  );
}

function VeliDenemelerPage() {
  const exams = useExams();
  if (!exams.length) return <div className="stack rise"><PageHead title="Deneme Sonuçları" sub={`${CHILD}`} /><div className="card"><div className="card-pad" style={{ padding: "40px", textAlign: "center", color: "var(--muted)", fontSize: 13.5 }}>Henüz açıklanmış deneme sonucu yok.</div></div></div>;
  const exam = exams[0];
  const me = exam.students.find((s) => s.ad === CHILD) || exam.students[0];
  return (
    <div className="stack rise">
      <PageHead title="Deneme Sonuçları" sub={`${CHILD} · ${exam.name}`} />
      <div className="grid g-4">
        <StatCard icon="chart" tone="primary" value={me.toplamNet.toFixed(1)} label="Toplam net" />
        <StatCard icon="award" tone="success" value={me.puan ? me.puan.toFixed(0) : "—"} label="Puan" />
        <StatCard icon="trend" tone="info" value={me.rank ? me.rank.toLocaleString("tr-TR") : "—"} label="Sıralama" />
        <StatCard icon="users" tone="warning" value={exam.students.length} label="Katılan" />
      </div>
      <Section title="Ders Bazında Net" sub="Çocuğunuzun bu denemedeki dağılımı">
        <div className="card-body subj">
          {(exam.catOrder || CAT_ORDER).map((c) => {
            const n = me.byCat[c]?.n ?? 0;
            const max = c === "Türkçe" || c === "Matematik" || c === "Fen Bilimleri" ? (exam.examType === "LGS" ? 20 : 40) : (exam.examType === "LGS" ? 10 : 20);
            return (
              <div className="subj-row" key={c}>
                <div className="between" style={{ marginBottom: 7 }}><span className="sname"><span className="swatch" style={{ background: CAT_COLOR[c] || SUBJECT_COLORS[c] || "var(--primary)" }} />{c}</span><span className="tnum" style={{ fontWeight: 800, fontSize: 13 }}>{n.toFixed(2).replace(/\.00$/, "")} / {max}</span></div>
                <Bar value={(n / max) * 100} color={CAT_COLOR[c] || SUBJECT_COLORS[c] || "var(--primary)"} />
              </div>
            );
          })}
        </div>
      </Section>
      <Section title="Tüm Denemeler" sub="Çocuğunuzun içe aktarılan denemelerdeki ilerlemesi" action={<Badge tone="muted" icon="chart">{exams.length} deneme</Badge>}>
        <div className="card-body"><ExamHistoryList studentName={CHILD} /></div>
      </Section>
    </div>
  );
}

Object.assign(window, { VeliDashboard, VeliDenemelerPage, CHILD });
