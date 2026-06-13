/* Uyanık Koç mobil — Koç Faz 2: Öğrenci detayı, Ödev atama sheet'i, Rapor yazma. */

/* ---- Koç ödev kartı (submitted/incele durumlu) ---- */
function CHwCard({ o, onApprove }) {
  const c = M_SUBJECT_COLORS[o.subject] || "var(--primary)";
  const typeList = o.types && o.types.length ? o.types : ["soru"];
  const t = M_ODEV_TYPES[typeList[0]] || M_ODEV_TYPES.soru;
  const overdue = o.status === "pending" && o.due && new Date(o.due) < new Date("2026-06-06");
  return (
    <div className={`uk-odev${o.status === "done" ? " done" : ""}`} style={{ alignItems: "flex-start" }}>
      <span className="ic" style={{ background: `color-mix(in srgb, ${c} 13%, transparent)`, color: c }}><MIcon name={t.icon} size={20} /></span>
      <div className="body">
        <div className="ttl">{o.topic}</div>
        <div className="uk-meta">
          <span className="uk-chip"><span className="sw" style={{ background: c }} />{o.subject}</span>
          {o.count ? <span className="mi d">{o.count} soru</span> : null}
          {o.source ? <span className="mi d">{o.source}</span> : null}
        </div>
        {o.result ? (
          <div className="uk-result">
            <span style={{ color: "var(--success)" }}>✓ {o.result.d}</span>
            <span style={{ color: "var(--danger)" }}>✕ {o.result.y}</span>
            <span style={{ color: "var(--muted)" }}>○ {o.result.b}</span>
            <span className="uk-badge primary">net {mNet(o.result.d, o.result.y)}</span>
          </div>
        ) : null}
        <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {o.status === "submitted"
            ? <><span className="uk-badge warning"><MIcon name="clock" size={13} /> İnceleme bekliyor</span>
                <button className="uk-btn uk-btn-primary" style={{ height: 32 }} onClick={() => onApprove(o.id)}><MIcon name="check" size={14} /> Onayla</button></>
            : o.status === "done"
              ? <span className="uk-badge success"><MIcon name="check" size={13} /> Tamamlandı</span>
              : <span className="uk-badge warning"><MIcon name="clock" size={13} /> {overdue ? "Gecikti" : "Bekliyor"} · {o.due ? new Date(o.due).toLocaleDateString("tr-TR", { day: "numeric", month: "short" }) : ""}</span>}
        </div>
      </div>
    </div>
  );
}

/* ---- Hızlı aksiyon butonu ---- */
function CActionBtn({ icon, label, bg, col, onClick }) {
  return (
    <button onClick={onClick} style={{ flex: "0 0 76px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "14px 6px", borderRadius: "calc(16px * var(--rs))", background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
      <span style={{ width: 42, height: 42, borderRadius: 13, display: "grid", placeItems: "center", background: bg, color: col }}><MIcon name={icon} size={20} /></span>
      <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-2)" }}>{label}</span>
    </button>
  );
}

/* ============================================================
   KOÇ — ÖĞRENCİ DETAYI
   ============================================================ */
function StudentDetail({ sid, onBack, onMessage, onAppt }) {
  const s = cStudent(sid);
  const [exam, setExam] = useState(null);
  const [assign, setAssign] = useState(false);
  const [report, setReport] = useState(false);
  const [program, setProgram] = useState(false);
  const [konu, setKonu] = useState(false);
  const [hw, setHw] = useState(s.odev);

  if (exam) return <ExamDetail exam={exam} onBack={() => setExam(null)} />;
  if (report) return <WriteReportScreen student={s} onBack={() => setReport(null)} />;
  if (program) return <ProgramCoachScreen student={s} onBack={() => setProgram(false)} />;
  if (konu) return <KonuCoachScreen student={s} onBack={() => setKonu(false)} />;

  const approve = (id) => { setHw(hw.map((o) => o.id === id ? { ...o, status: "done" } : o)); ukToast("Ödev onaylandı ✓"); };
  const pending = hw.filter((o) => o.status === "pending");
  const submitted = hw.filter((o) => o.status === "submitted");
  const doneList = hw.filter((o) => o.status === "done");
  const isNew = s.status === "new";
  const maxTrend = s.trend.length ? Math.max(...s.trend.map((d) => d.v)) : 1;

  return (
    <div className="uk-scroll">
      <div className="uk-safe-top" />
      <div style={{ padding: "4px 16px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button className="uk-iconbtn" onClick={onBack} style={{ width: 40, height: 40 }}><MIcon name="chevronLeft" size={20} /></button>
        <button className="uk-iconbtn" onClick={() => onMessage(s.id)} style={{ width: 40, height: 40 }}><MIcon name="message" size={19} /></button>
      </div>

      {/* öğrenci başlık kartı */}
      <div className="uk-sec" style={{ marginTop: 8 }}>
        <div className="uk-card uk-card-pad" style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span className="uk-avatar" style={{ width: 58, height: 58, fontSize: 19 }}>{s.initials}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-.02em" }}>{s.name}</span>
              <CStatusBadge status={s.status} small />
            </div>
            <div style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600, marginTop: 3 }}>{s.grade} · {s.goal}</div>
          </div>
        </div>
      </div>

      {/* hızlı aksiyonlar (yatay kaydırılabilir) */}
      <div className="uk-sec" style={{ marginTop: 14 }}>
        <div className="uk-segrow" style={{ padding: 0, gap: 10 }}>
          <CActionBtn icon="clipboard" label="Ödev ata" bg="var(--primary-soft)" col="var(--primary-600)" onClick={() => setAssign(true)} />
          <CActionBtn icon="calendar" label="Program" bg="var(--info-soft)" col="var(--info)" onClick={() => setProgram(true)} />
          <CActionBtn icon="book" label="Konular" bg="var(--success-soft)" col="var(--success)" onClick={() => setKonu(true)} />
          <CActionBtn icon="edit" label="Rapor" bg="var(--warning-soft)" col="var(--warning)" onClick={() => setReport(true)} />
          <CActionBtn icon="clock" label="Randevu" bg="var(--primary-soft)" col="var(--primary-600)" onClick={() => onAppt(s.id)} />
          <CActionBtn icon="message" label="Mesaj" bg="var(--info-soft)" col="var(--info)" onClick={() => onMessage(s.id)} />
        </div>
      </div>

      {isNew ? (
        <div className="uk-sec" style={{ marginTop: 22 }}>
          <div className="uk-card uk-card-pad" style={{ textAlign: "center", padding: "32px 22px" }}>
            <span style={{ width: 56, height: 56, borderRadius: 16, display: "grid", placeItems: "center", background: "var(--primary-soft)", color: "var(--primary-600)", margin: "0 auto 14px" }}><MIcon name="cap" size={26} /></span>
            <div style={{ fontSize: 15.5, fontWeight: 800 }}>Henüz veri yok</div>
            <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500, marginTop: 6, lineHeight: 1.5, maxWidth: 240, marginInline: "auto" }}>{s.name.split(" ")[0]} yeni atandı. İlk ödevi atayarak başla.</div>
            <button className="uk-btn uk-btn-primary" style={{ height: 46, marginTop: 18, paddingInline: 22 }} onClick={() => setAssign(true)}><MIcon name="plus" size={16} /> İlk ödevi ata</button>
          </div>
        </div>
      ) : (
        <>
          {/* özet istatistik */}
          <div className="uk-sec" style={{ marginTop: 20 }}>
            <div className="uk-stats">
              <div className="uk-card uk-stat">
                <div className="lab"><span className="ic" style={{ background: "var(--primary-soft)", color: "var(--primary-600)" }}><MIcon name="chart" size={15} /></span> Toplam net</div>
                <div className="val tnum">{s.net}</div>
              </div>
              <div className="uk-card uk-stat">
                <div className="lab"><span className="ic" style={{ background: "var(--warning-soft)", color: "var(--warning)" }}><MIcon name="flame" size={15} /></span> Seri</div>
                <div className="val tnum">{s.streak}<span style={{ fontSize: 14, fontWeight: 700, color: "var(--muted)" }}> gün</span></div>
              </div>
              <div className="uk-card uk-stat">
                <div className="lab"><span className="ic" style={{ background: "var(--success-soft)", color: "var(--success)" }}><MIcon name="checkCircle" size={15} /></span> Tamamlama</div>
                <div className="val tnum">%{s.completion}</div>
              </div>
              <div className="uk-card uk-stat">
                <div className="lab"><span className="ic" style={{ background: "var(--info-soft)", color: "var(--info)" }}><MIcon name="clock" size={15} /></span> Bu hafta</div>
                <div className="val tnum">{s.weekHours}<span style={{ fontSize: 14, fontWeight: 700, color: "var(--muted)" }}> sa</span></div>
              </div>
            </div>
          </div>

          {/* net gelişimi */}
          {s.trend.length >= 2 && (
            <div className="uk-sec" style={{ marginTop: 22 }}>
              <div className="uk-sec-head"><h2>Net gelişimi</h2></div>
              <div className="uk-card uk-card-pad">
                <div className="uk-chart">
                  {s.trend.map((d, i) => (
                    <div key={i} className={`col${i === s.trend.length - 1 ? " peak" : ""}`}>
                      <span className="vv tnum">{d.v}</span>
                      <div className="track"><div className="fill" style={{ height: (d.v / maxTrend) * 100 + "%" }} /></div>
                      <label>{d.l}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ders bazlı */}
          {s.subjects.length > 0 && (
            <div className="uk-sec" style={{ marginTop: 22 }}>
              <div className="uk-sec-head"><h2>Ders bazlı ilerleme</h2></div>
              <div className="uk-card uk-card-pad"><div className="uk-subj">
                {s.subjects.map((sub) => {
                  const c = M_SUBJECT_COLORS[sub.name] || "var(--primary)";
                  const arrow = sub.trend === "up" ? "▲" : sub.trend === "down" ? "▼" : "—";
                  const ac = sub.trend === "up" ? "var(--success)" : sub.trend === "down" ? "var(--danger)" : "var(--muted)";
                  return (
                    <div key={sub.name}>
                      <div className="row1"><span className="sname"><span className="sw" style={{ background: c }} />{sub.name}</span>
                        <span className="spct tnum">net {sub.net} <span style={{ color: ac, marginLeft: 2 }}>{arrow}</span></span></div>
                      <div className="uk-bar"><span style={{ width: sub.pct + "%", background: c }} /></div>
                    </div>
                  );
                })}
              </div></div>
            </div>
          )}

          {/* ödevler */}
          <div className="uk-sec" style={{ marginTop: 22 }}>
            <div className="uk-sec-head"><h2>Ödevler</h2><button className="more" onClick={() => setAssign(true)}><MIcon name="plus" size={14} /> Ata</button></div>
            {submitted.map((o) => <CHwCard key={o.id} o={o} onApprove={approve} />)}
            {pending.map((o) => <CHwCard key={o.id} o={o} onApprove={approve} />)}
            {doneList.map((o) => <CHwCard key={o.id} o={o} onApprove={approve} />)}
          </div>

          {/* denemeler */}
          {s.exams.length > 0 && (
            <div className="uk-sec" style={{ marginTop: 22 }}>
              <div className="uk-sec-head"><h2>Denemeler</h2></div>
              {s.exams.map((e) => {
                const up = !e.delta.startsWith("-");
                return (
                  <button key={e.id} className="uk-exam" onClick={() => setExam(e)} style={{ width: "100%", textAlign: "left" }}>
                    <span className="ec"><MIcon name="chart" size={22} /></span>
                    <div style={{ flex: 1, minWidth: 0 }}><div className="en">{e.name}</div><div className="em">{e.pub} · {e.date}</div></div>
                    <div className="right"><div className="net tnum">{e.net}</div><div className="delta" style={{ color: up ? "var(--success)" : "var(--danger)" }}>{up ? "▲" : "▼"} {e.delta}</div></div>
                  </button>
                );
              })}
            </div>
          )}

        </>
      )}

      {/* Çalışma programı */}
      <div className="uk-sec" style={{ marginTop: 22 }}>
        <div className="uk-sec-head"><h2>Çalışma programı</h2><button className="more" onClick={() => setProgram(true)}>Düzenle <MIcon name="chevronRight" size={14} /></button></div>
        <button className="uk-card uk-card-pad" onClick={() => setProgram(true)} style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ width: 44, height: 44, borderRadius: 13, display: "grid", placeItems: "center", background: "var(--info-soft)", color: "var(--info)", flexShrink: 0 }}><MIcon name="calendar" size={21} /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14.5, fontWeight: 800 }}>Haftalık plan</div>
            <div style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>{Object.values(C_PROGRAM_SEED).reduce((n, a) => n + a.length, 0)} blok · 7 gün</div>
          </div>
          <MIcon name="chevronRight" size={18} style={{ color: "var(--faint)" }} />
        </button>
      </div>

      {/* Konu takibi */}
      <div className="uk-sec" style={{ marginTop: 22 }}>
        <div className="uk-sec-head"><h2>Konu takibi</h2><button className="more" onClick={() => setKonu(true)}>İşaretle <MIcon name="chevronRight" size={14} /></button></div>
        {(() => {
          const all = Object.values(M_TOPICS).flat();
          const td = all.filter((t) => t.s === "done").length;
          const tp = all.filter((t) => t.s === "progress").length;
          const pct = Math.round((td / all.length) * 100);
          return (
            <button className="uk-card uk-card-pad" onClick={() => setKonu(true)} style={{ width: "100%", textAlign: "left", display: "block" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ width: 44, height: 44, borderRadius: 13, display: "grid", placeItems: "center", background: "var(--success-soft)", color: "var(--success)", flexShrink: 0 }}><MIcon name="book" size={21} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 800 }}>%{pct} tamamlandı</div>
                  <div style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>{td} bitti · {tp} devam ediyor · {all.length} konu</div>
                </div>
                <MIcon name="chevronRight" size={18} style={{ color: "var(--faint)" }} />
              </div>
              <div className="uk-bar" style={{ marginTop: 14 }}><span style={{ width: pct + "%" }} /></div>
            </button>
          );
        })()}
      </div>

      {/* Koç notları (gizli) */}
      <div className="uk-sec" style={{ marginTop: 22 }}>
        <div className="uk-sec-head"><h2>Koç notları</h2><span className="uk-badge muted"><MIcon name="shield" size={12} /> gizli</span></div>
        <CoachNotes sid={s.id} />
      </div>

      {/* Veli iletişim */}
      <div className="uk-sec" style={{ marginTop: 22 }}>
        <div className="uk-sec-head"><h2>Veli</h2></div>
        <div className="uk-card uk-coach" style={{ display: "flex" }}>
          <span className="uk-avatar" style={{ width: 46, height: 46, fontSize: 15, background: "linear-gradient(140deg,#8E87D6,#463DA6)" }}>{s.parent.split(" ").map((w) => w[0]).join("").slice(0, 2)}</span>
          <div style={{ flex: 1, minWidth: 0 }}><div className="cn">{s.parent}</div><div className="cr">{s.name.split(" ")[0]} — Velisi · {s.parentPhone}</div></div>
          <button className="uk-iconbtn" style={{ background: "var(--primary)", color: "#fff", border: "none" }} onClick={() => onMessage(s.id)}><MIcon name="message" size={19} /></button>
        </div>
      </div>

      <div style={{ height: 24 }} />
      {assign && <AssignSheet student={s} onClose={() => setAssign(false)} />}
    </div>
  );
}

/* ============================================================
   KOÇ — ÖDEV ATAMA (bottom sheet)
   ============================================================ */
function AssignSheet({ student, onClose }) {
  const subjects = Object.keys(M_SUBJECT_COLORS);
  const [subject, setSubject] = useState(subjects[0]);
  const [type, setType] = useState("soru");
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState("");
  const [source, setSource] = useState(C_ASSIGN_SOURCES[0]);
  const [due, setDue] = useState("");
  const dueOpts = [
    { v: "2026-06-07", l: "Yarın" }, { v: "2026-06-09", l: "Pzt" },
    { v: "2026-06-11", l: "Çar" }, { v: "2026-06-13", l: "Cmt" },
  ];
  const typeMeta = M_ODEV_TYPES[type];
  const valid = topic.trim().length > 2 && due;

  const submit = () => { onClose(); ukToast(`Ödev ${student.name.split(" ")[0]}'e atandı ✓`); };

  return (
    <div className="uk-sheet-overlay" onClick={onClose}>
      <div className="uk-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="uk-grip" />
        <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 18 }}>
          <span className="uk-avatar" style={{ width: 40, height: 40, fontSize: 14 }}>{student.initials}</span>
          <div style={{ minWidth: 0 }}><div style={{ fontSize: 16, fontWeight: 800, whiteSpace: "nowrap" }}>Ödev ata</div><div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{student.name}</div></div>
        </div>

        {/* ders */}
        <div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--text-2)", marginBottom: 8 }}>Ders</div>
        <div className="uk-segrow" style={{ padding: "0 0 4px", marginBottom: 16 }}>
          {subjects.map((s) => {
            const c = M_SUBJECT_COLORS[s];
            return <button key={s} className={`uk-seg${subject === s ? " on" : ""}`} onClick={() => setSubject(s)} style={subject === s ? { background: c, borderColor: c } : null}><span className="sw" style={{ width: 8, height: 8, borderRadius: 3, background: subject === s ? "#fff" : c, display: "inline-block" }} />{s}</button>;
          })}
        </div>

        {/* tür */}
        <div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--text-2)", marginBottom: 8 }}>Tür</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
          {Object.entries(M_ODEV_TYPES).map(([k, v]) => (
            <button key={k} onClick={() => setType(k)} style={{ display: "flex", alignItems: "center", gap: 8, height: 46, padding: "0 12px", borderRadius: 12, border: `1.5px solid ${type === k ? "var(--primary)" : "var(--border-strong)"}`, background: type === k ? "var(--primary-soft)" : "var(--surface)", color: type === k ? "var(--primary-600)" : "var(--text-2)", fontWeight: 700, fontSize: 13, textAlign: "left" }}>
              <MIcon name={v.icon} size={17} /> {v.label}
            </button>
          ))}
        </div>

        {/* konu */}
        <div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--text-2)", marginBottom: 8 }}>Konu / açıklama</div>
        <div className="uk-inputwrap" style={{ height: 52, marginBottom: 16 }}>
          <input placeholder="örn. Türev — kural tekrarı" value={topic} onChange={(e) => setTopic(e.target.value)} style={{ fontSize: 15 }} />
        </div>

        {/* soru sayısı (gerekirse) + kaynak */}
        {typeMeta.needsResult && (
          <>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--text-2)", marginBottom: 8 }}>Soru sayısı</div>
            <div className="uk-inputwrap" style={{ height: 52, marginBottom: 16 }}>
              <input type="number" inputMode="numeric" placeholder="örn. 40" value={count} onChange={(e) => setCount(e.target.value)} style={{ fontSize: 15 }} />
            </div>
          </>
        )}
        <div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--text-2)", marginBottom: 8 }}>Kaynak</div>
        <div className="uk-segrow" style={{ padding: "0 0 4px", marginBottom: 16 }}>
          {C_ASSIGN_SOURCES.map((src) => (
            <button key={src} className={`uk-seg${source === src ? " on" : ""}`} onClick={() => setSource(src)}>{src}</button>
          ))}
        </div>

        {/* teslim */}
        <div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--text-2)", marginBottom: 8 }}>Teslim tarihi</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
          {dueOpts.map((d) => (
            <button key={d.v} onClick={() => setDue(d.v)} style={{ flex: 1, height: 44, borderRadius: 12, border: `1.5px solid ${due === d.v ? "var(--primary)" : "var(--border-strong)"}`, background: due === d.v ? "var(--primary-soft)" : "var(--surface)", color: due === d.v ? "var(--primary-600)" : "var(--text-2)", fontWeight: 800, fontSize: 13 }}>{d.l}</button>
          ))}
        </div>

        <button className="uk-btn uk-btn-primary uk-btn-block" disabled={!valid} onClick={submit}><MIcon name="send" size={17} /> Ödevi ata</button>
        <div style={{ height: 6 }} />
      </div>
    </div>
  );
}

/* ============================================================
   KOÇ — RAPOR YAZMA
   ============================================================ */
function WriteReportScreen({ student, onBack }) {
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);
  const tips = [
    "Bu hafta belirgin gelişim gösterdi 👏",
    "Çalışma süresi artırılmalı.",
    "Deneme analizine ağırlık verilmeli.",
    "Veliyle görüşme öneriyorum.",
  ];

  if (sent) {
    return (
      <div className="uk-scroll">
        <div className="uk-safe-top" />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 30px", textAlign: "center" }}>
          <span style={{ width: 76, height: 76, borderRadius: 24, display: "grid", placeItems: "center", background: "var(--success-soft)", color: "var(--success)", marginBottom: 20 }}><MIcon name="checkCircle" size={38} /></span>
          <div style={{ fontSize: 20, fontWeight: 800 }}>Rapor gönderildi</div>
          <div style={{ fontSize: 14, color: "var(--muted)", fontWeight: 500, marginTop: 8, lineHeight: 1.5 }}>{student.name} ve velisine haftalık gelişim raporu iletildi.</div>
          <button className="uk-btn uk-btn-primary" style={{ height: 48, marginTop: 26, paddingInline: 26 }} onClick={onBack}>Bitti</button>
        </div>
      </div>
    );
  }

  return (
    <div className="uk-scroll">
      <div className="uk-safe-top" />
      <SubHeader title="Haftalık rapor" sub={`${student.name} · 2 – 8 Haziran`} onBack={onBack} />

      {/* otomatik özet */}
      <div className="uk-sec">
        <div className="uk-hero" style={{ borderRadius: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.82)", marginBottom: 4 }}>Bu haftanın otomatik özeti</div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 10 }}>
            {[["Tamamlama", "%" + student.completion], ["Toplam net", student.net], ["Çalışma", student.weekHours + " sa"]].map(([l, v]) => (
              <div key={l}><div style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-.02em" }} className="tnum">{v}</div><div style={{ fontSize: 11, color: "rgba(255,255,255,.82)", fontWeight: 600, marginTop: 3 }}>{l}</div></div>
            ))}
          </div>
        </div>
      </div>

      {/* koç notu */}
      <div className="uk-sec" style={{ marginTop: 20 }}>
        <div className="uk-sec-head"><h2>Koç notu</h2></div>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Bu haftaya dair değerlendirmeni yaz…" rows={5}
          style={{ width: "100%", border: "1.5px solid var(--border-strong)", borderRadius: 16, padding: "14px 16px", fontSize: 14.5, fontWeight: 500, fontFamily: "inherit", color: "var(--text)", background: "var(--surface)", resize: "none", outline: "none", lineHeight: 1.5 }} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
          {tips.map((tp) => (
            <button key={tp} onClick={() => setNote(note ? note + " " + tp : tp)} className="uk-chip" style={{ height: 30, cursor: "pointer" }}>+ {tp}</button>
          ))}
        </div>
      </div>

      <div className="uk-sec" style={{ marginTop: 22 }}>
        <button className="uk-btn uk-btn-primary uk-btn-block" disabled={note.trim().length < 5} onClick={() => setSent(true)}><MIcon name="send" size={17} /> Raporu gönder</button>
      </div>
      <div style={{ height: 24 }} />
    </div>
  );
}

Object.assign(window, { CHwCard, CActionBtn, StudentDetail, AssignSheet, WriteReportScreen });
