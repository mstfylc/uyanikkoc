/* Uyanık Koç mobil — Denemeler, Program, Profil ekranları */

/* ============================================================
   DENEMELER
   ============================================================ */
function DenemelerScreen() {
  const [sel, setSel] = useState(null); // seçili deneme (detay)
  const [kayit, setKayit] = useState(false);
  useMV();
  const mem = mvMembership();
  const plan = mvPlan(mem);
  const latest = M_EXAMS[0];
  const maxTrend = Math.max(...M_EXAM_TREND.map((d) => d.v));

  if (sel) return <ExamDetail exam={sel} onBack={() => setSel(null)} />;

  return (
    <div className="uk-scroll">
      <div className="uk-safe-top" />
      <div className="uk-ptitle" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
        <div><h1>Denemeler</h1><p>{M_EXAMS.length} deneme · ortalama yükseliyor</p></div>
        <button className="uk-iconbtn" style={{ background: "var(--primary)", color: "#fff", border: "none" }} onClick={() => setKayit(true)} aria-label="Denemeye kayıt ol"><MIcon name="plus" size={20} /></button>
      </div>

      {/* Deneme kayıt CTA */}
      <div className="uk-sec">
        <button className="uk-card uk-card-pad" onClick={() => setKayit(true)} style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 13, cursor: "pointer", border: "1.5px solid color-mix(in srgb, var(--primary) 30%, var(--border))", background: "linear-gradient(120deg, color-mix(in srgb, var(--primary) 7%, var(--surface)), var(--surface))" }}>
          <span style={{ width: 44, height: 44, borderRadius: 13, display: "grid", placeItems: "center", background: "linear-gradient(140deg,var(--primary-300),var(--primary-700))", color: "#fff", flexShrink: 0, boxShadow: "var(--shadow-primary)" }}><MIcon name="calendar" size={21} /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14.5, fontWeight: 800 }}>Denemeye kayıt ol</div>
            <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>{plan ? plan.name : "Yaklaşan denemeleri gör · üyelik al"}</div>
          </div>
          {plan ? <span className={`uk-badge ${plan.mode === "kargo" ? "info" : "primary"}`}>{plan.mode === "kargo" ? "Kargo" : "Yüz yüze"}</span> : <span className="uk-badge warning">Üyelik yok</span>}
          <MIcon name="chevronRight" size={18} style={{ color: "var(--faint)" }} />
        </button>
      </div>

      {/* Net trendi */}
      <div className="uk-sec" style={{ marginTop: 16 }}>
        <div className="uk-card uk-card-pad">
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)" }}>Net Gelişimi (TYT)</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
                <span style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-.02em" }} className="tnum">{latest.net}</span>
                <span className="uk-badge success"><MIcon name="arrowUp" size={12} /> {latest.delta} net</span>
              </div>
            </div>
            <span className="uk-badge muted">Son 6</span>
          </div>
          <div className="uk-chart">
            {M_EXAM_TREND.map((d, i) => (
              <div key={i} className={`col${i === M_EXAM_TREND.length - 1 ? " peak" : ""}`}>
                <span className="vv tnum">{d.v}</span>
                <div className="track"><div className="fill" style={{ height: (d.v / maxTrend) * 100 + "%" }} /></div>
                <label>{d.l}</label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Geçmiş denemeler */}
      <div className="uk-sec" style={{ marginTop: 22 }}>
        <div className="uk-sec-head"><h2>Geçmiş denemeler</h2></div>
        {M_EXAMS.map((e) => {
          const up = !e.delta.startsWith("-");
          return (
            <button key={e.id} className="uk-exam" onClick={() => setSel(e)} style={{ width: "100%", textAlign: "left" }}>
              <span className="ec"><MIcon name="chart" size={22} /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="en">{e.name}</div>
                <div className="em">{e.pub} · {e.date}</div>
                <div className="uk-meta" style={{ marginTop: 7 }}>
                  <span className="uk-badge muted">{e.type}</span>
                  <span className="mi">Sıralama {e.rank}</span>
                </div>
              </div>
              <div className="right">
                <div className="net tnum">{e.net}</div>
                <div className="delta" style={{ color: up ? "var(--success)" : "var(--danger)" }}>{up ? "▲" : "▼"} {e.delta}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ height: 24 }} />
      {kayit && <DenemeKayitSheet onClose={() => setKayit(false)} />}
    </div>
  );
}

/* ---- Deneme detay / analiz ---- */
function ExamDetail({ exam, onBack }) {
  const up = !exam.delta.startsWith("-");
  return (
    <div className="uk-scroll">
      <div className="uk-safe-top" />
      <div style={{ padding: "4px 16px 8px" }}>
        <button className="uk-iconbtn" onClick={onBack} style={{ width: 40, height: 40 }}><MIcon name="chevronLeft" size={20} /></button>
      </div>
      <div className="uk-ptitle" style={{ paddingTop: 6 }}>
        <h1 style={{ fontSize: 23 }}>{exam.name}</h1>
        <p>{exam.pub} · {exam.date}</p>
      </div>

      {/* özet kart */}
      <div className="uk-sec">
        <div className="uk-hero" style={{ borderRadius: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,.8)" }}>Toplam Net</div>
              <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-.03em", lineHeight: 1.1 }} className="tnum">{exam.net}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="uk-badge" style={{ background: "rgba(255,255,255,.2)", color: "#fff" }}>{up ? "▲" : "▼"} {exam.delta} net</div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "rgba(255,255,255,.85)", marginTop: 10 }}>Türkiye sıralaması</div>
              <div style={{ fontSize: 17, fontWeight: 800 }} className="tnum">{exam.rank}</div>
            </div>
          </div>
        </div>
      </div>

      {/* bölüm bazlı analiz */}
      <div className="uk-sec" style={{ marginTop: 22 }}>
        <div className="uk-sec-head"><h2>Bölüm bazlı netler</h2></div>
        <div className="uk-card uk-card-pad">
          <div className="uk-subj">
            {exam.parts.map((p) => {
              const pct = (p.net / p.max) * 100;
              const tone = pct >= 80 ? "var(--success)" : pct >= 55 ? "var(--warning)" : "var(--danger)";
              return (
                <div key={p.n}>
                  <div className="row1">
                    <span className="sname"><span className="sw" style={{ background: tone }} />{p.n}</span>
                    <span className="spct tnum">{p.net} <span style={{ color: "var(--muted)", fontWeight: 600 }}>/ {p.max}</span></span>
                  </div>
                  <div className="uk-bar"><span style={{ width: pct + "%", background: tone }} /></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI öneri bandı */}
      <div className="uk-sec" style={{ marginTop: 16 }}>
        <div className="uk-card uk-card-pad" style={{ display: "flex", gap: 13, alignItems: "flex-start", borderStyle: "dashed", borderColor: "color-mix(in srgb, var(--primary) 34%, transparent)", background: "linear-gradient(120deg, color-mix(in srgb, var(--primary) 7%, var(--surface)), var(--surface))" }}>
          <span style={{ width: 42, height: 42, borderRadius: 12, display: "grid", placeItems: "center", background: "linear-gradient(140deg,var(--primary-300),var(--primary-700))", color: "#fff", flexShrink: 0, boxShadow: "var(--shadow-primary)" }}><MIcon name="ai" size={21} /></span>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 800 }}>Koç önerisi</div>
            <div style={{ fontSize: 12.5, color: "var(--text-2)", fontWeight: 500, marginTop: 4, lineHeight: 1.5 }}>Fen Bilimleri netini yükseltmek için bu hafta Kimya "Mol Kavramı" ve Fizik "Newton Yasaları" tekrarına odaklan.</div>
          </div>
        </div>
      </div>

      <div style={{ height: 24 }} />
    </div>
  );
}

/* ============================================================
   PROGRAM
   ============================================================ */
const M_PROG_KEY = "uk_prog_status_v1";
function ProgramScreen() {
  const [day, setDay] = useState(M_TODAY);
  const todayIdx = M_DAYS.indexOf(M_TODAY);
  const [status, setStatus] = useState(() => {
    const saved = (() => { try { return JSON.parse(localStorage.getItem(M_PROG_KEY)) || {}; } catch (e) { return {}; } })();
    const init = {};
    Object.keys(M_SCHEDULE).forEach((d) => (M_SCHEDULE[d] || []).forEach((b, i) => { const k = d + "-" + i; init[k] = saved[k] || (b.done ? "done" : "todo"); }));
    return { ...init, ...saved };
  });
  const blocks = M_SCHEDULE[day] || [];
  const setBlock = (k, v) => { const nx = { ...status, [k]: v }; setStatus(nx); try { localStorage.setItem(M_PROG_KEY, JSON.stringify(nx)); } catch (e) {} };
  const doneToday = blocks.filter((_, i) => status[day + "-" + i] === "done").length;

  return (
    <div className="uk-scroll">
      <div className="uk-safe-top" />
      <div className="uk-ptitle">
        <h1>Program</h1>
        <p>{M_DAYS_FULL[day]} · {doneToday}/{blocks.length} blok tamam</p>
      </div>

      <div className="uk-segrow">
        {M_DAYS.map((d, i) => (
          <button key={d} className={`uk-seg${day === d ? " on" : ""}`} onClick={() => setDay(d)} style={{ flexDirection: "column", height: 52, padding: "0 14px", gap: 2 }}>
            <span style={{ fontSize: 12, opacity: .85 }}>{d}</span>
            {i === todayIdx ? <span style={{ fontSize: 9.5, fontWeight: 800 }}>BUGÜN</span> : null}
          </button>
        ))}
      </div>

      <div className="uk-sec" style={{ marginTop: 18, gap: 14 }}>
        {blocks.length === 0 ? (
          <div style={{ padding: "50px 30px", textAlign: "center", color: "var(--muted)", fontSize: 14 }}>Bu gün için planlanmış blok yok.</div>
        ) : blocks.map((b, i) => {
          const c = M_SUBJECT_COLORS[b.subj] || "var(--primary)";
          const k = day + "-" + i;
          const st = status[k] || "todo";
          const isDone = st === "done", isProg = st === "progress";
          return (
            <div className="uk-block" key={i}>
              <div className="time">{b.t}<span>{b.e}</span></div>
              <div className="b" style={{ borderLeftColor: c, opacity: isDone ? .72 : 1 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <div className="bs" style={{ color: c }}>{b.subj.toUpperCase()}</div>
                  <span className="uk-badge muted" style={{ height: 21 }}>{b.type}</span>
                </div>
                <div className="bt" style={{ textDecoration: isDone ? "line-through" : "none", color: isDone ? "var(--muted)" : "var(--text)" }}>{b.topic}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
                  {isProg ? <span className="uk-badge warning" style={{ height: 24 }}><MIcon name="clock" size={12} /> Devam ediyor</span> : null}
                  {isDone ? (
                    <>
                      <span className="uk-badge success" style={{ height: 24 }}><MIcon name="check" size={12} /> Bitti</span>
                      <button onClick={() => setBlock(k, "todo")} style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--faint)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Geri al</button>
                    </>
                  ) : st === "todo" ? (
                    <button className="uk-btn uk-btn-light" style={{ height: 36, paddingInline: 16, marginLeft: "auto", boxShadow: "none", color: c }} onClick={() => setBlock(k, "progress")}><MIcon name="play" size={14} /> Başla</button>
                  ) : (
                    <button className="uk-btn uk-btn-primary" style={{ height: 36, paddingInline: 16, marginLeft: "auto" }} onClick={() => { setBlock(k, "done"); ukToast("Blok tamamlandı 🎉"); }}><MIcon name="check" size={14} /> Bitir</button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ height: 24 }} />
    </div>
  );
}

/* ============================================================
   PROFİL
   ============================================================ */
function ProfilScreen({ onLogout, dark, setDark, openSub }) {
  const [notif, setNotif] = useState(true);
  const [pickAv, setPickAv] = useState(false);
  const [sheet, setSheet] = useState(null);
  useMV();
  const mem = mvPlan(mvMembership());
  return (
    <div className="uk-scroll">
      <div className="uk-safe-top" />
      <div className="uk-ptitle"><h1>Profil</h1></div>

      {/* kullanıcı kartı */}
      <div className="uk-sec">
        <div className="uk-card uk-card-pad" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 4, paddingTop: 22, paddingBottom: 22 }}>
          <MAvatarEditable name={M_STUDENT.name} initials="EY" size={76} avatarKey="me:student" onOpen={() => setPickAv(true)} />
          <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-.02em", marginTop: 12, width: "100%", lineHeight: 1.2 }}>{M_STUDENT.name}</div>
          <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600, width: "100%" }}>{M_STUDENT.grade}</div>
          <div className="uk-badge primary" style={{ marginTop: 10 }}><MIcon name="target" size={13} /> Hedef: {M_STUDENT.goal}</div>
        </div>
      </div>

      {/* özet istatistik */}
      <div className="uk-sec" style={{ marginTop: 14 }}>
        <div className="uk-stats" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
          {[["flame", M_STUDENT.streak, "gün seri", "var(--warning)"], ["chart", M_STUDENT.net, "net", "var(--primary-600)"], ["clock", M_STUDENT.weekHours, "saat/hf", "var(--info)"]].map(([ic, v, l, col]) => (
            <div className="uk-card" key={l} style={{ padding: "14px 8px", textAlign: "center" }}>
              <span style={{ color: col, display: "inline-grid", placeItems: "center" }}><MIcon name={ic} size={18} fill={ic === "flame"} /></span>
              <div style={{ fontSize: 20, fontWeight: 800, marginTop: 6 }} className="tnum">{v}</div>
              <div style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 700, marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* başarımlar */}
      <div className="uk-sec" style={{ marginTop: 22 }}>
        <div className="uk-sec-head"><h2>Başarımlar</h2><span className="uk-badge muted">4 / 6</span></div>
        <div className="uk-ach">
          {M_ACHIEVEMENTS.map((a) => (
            <div key={a.name} className={`a${a.earned ? "" : " locked"}`}>
              <span className="ic"><MIcon name={a.icon} size={22} fill={a.earned && (a.icon === "flame" || a.icon === "star")} /></span>
              <div className="an">{a.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ayarlar */}
      <div className="uk-sec" style={{ marginTop: 22 }}>
        <div className="uk-sec-head"><h2>Ayarlar</h2></div>
        <div className="uk-list">
          <div className="uk-li" onClick={() => setPickAv(true)} style={{ cursor: "pointer" }}>
            <span className="lic" style={{ background: "var(--primary-soft)", color: "var(--primary-600)" }}><MIcon name="user" size={17} /></span>
            <span className="lt">Profil fotoğrafı</span>
            <span className="lr">ikon / foto</span>
            <MIcon name="chevronRight" size={18} style={{ color: "var(--faint)" }} />
          </div>
          <div className="uk-li">
            <span className="lic" style={{ background: "var(--warning-soft)", color: "var(--warning)" }}><MIcon name="bell" size={17} /></span>
            <span className="lt">Bildirimler</span>
            <button className={`uk-switch${notif ? " on" : ""}`} onClick={() => setNotif(!notif)}><span /></button>
          </div>
          <div className="uk-li">
            <span className="lic" style={{ background: "var(--surface-3)", color: "var(--text-2)" }}><MIcon name="moon" size={17} /></span>
            <span className="lt">Koyu tema</span>
            <button className={`uk-switch${dark ? " on" : ""}`} onClick={() => setDark(!dark)}><span /></button>
          </div>
          <div className="uk-li" onClick={() => openSub("kaynaklar")} style={{ cursor: "pointer" }}>
            <span className="lic" style={{ background: "var(--primary-soft)", color: "var(--primary-600)" }}><MIcon name="book" size={17} /></span>
            <span className="lt">Kaynaklarım</span>
            <span className="lr">{M_SOURCES.length} kitap</span>
            <MIcon name="chevronRight" size={18} style={{ color: "var(--faint)" }} />
          </div>
          <div className="uk-li" onClick={() => openSub("randevu")} style={{ cursor: "pointer" }}>
            <span className="lic" style={{ background: "var(--success-soft)", color: "var(--success)" }}><MIcon name="calendar" size={17} /></span>
            <span className="lt">Randevularım</span>
            <MIcon name="chevronRight" size={18} style={{ color: "var(--faint)" }} />
          </div>
          <div className="uk-li" onClick={() => setSheet("uyelik")} style={{ cursor: "pointer" }}>
            <span className="lic" style={{ background: "var(--primary-soft)", color: "var(--primary-600)" }}><MIcon name="chart" size={17} /></span>
            <span className="lt">Deneme üyeliği</span>
            <span className="lr">{mem ? (mem.mode === "kargo" ? "Kargo" : "Yüz yüze") : "Yok"}</span>
            <MIcon name="chevronRight" size={18} style={{ color: "var(--faint)" }} />
          </div>
          <div className="uk-li" onClick={() => setSheet("sifre")} style={{ cursor: "pointer" }}>
            <span className="lic" style={{ background: "var(--surface-3)", color: "var(--text-2)" }}><MIcon name="shield" size={17} /></span>
            <span className="lt">Şifre & Güvenlik</span>
            <MIcon name="chevronRight" size={18} style={{ color: "var(--faint)" }} />
          </div>
          <div className="uk-li" onClick={() => openSub("destek")} style={{ cursor: "pointer" }}>
            <span className="lic" style={{ background: "var(--info-soft)", color: "var(--info)" }}><MIcon name="help" size={17} /></span>
            <span className="lt">Yardım & Destek</span>
            <MIcon name="chevronRight" size={18} style={{ color: "var(--faint)" }} />
          </div>
        </div>
      </div>

      <div className="uk-sec" style={{ marginTop: 16 }}>
        <button className="uk-btn uk-btn-light uk-btn-block" style={{ color: "var(--danger)", height: 50 }} onClick={onLogout}>
          <MIcon name="logout" size={18} /> Çıkış Yap
        </button>
      </div>

      <div style={{ textAlign: "center", fontSize: 11.5, color: "var(--faint)", fontWeight: 600, marginTop: 16 }}>Uyanık Koç · Sürüm 1.0.0</div>
      <div style={{ height: 24 }} />
      {pickAv && <MAvatarPickerSheet name={M_STUDENT.name} avatarKey="me:student" onClose={() => setPickAv(false)} />}
      {sheet === "uyelik" && <DenemeUyelikSheet onClose={() => setSheet(null)} />}
      {sheet === "sifre" && <SifreSheet onClose={() => setSheet(null)} />}
    </div>
  );
}

Object.assign(window, { DenemelerScreen, ExamDetail, ProgramScreen, ProfilScreen });
