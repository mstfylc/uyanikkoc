/* Uyanık Koç mobil — Veli (parent) ekranları + kabuğu.
   Çocuk değiştirici, ödev/deneme takibi (salt görüntüleme), raporlar, ödeme, mesajlaşma. */

/* ---- Çocuk değiştirici (üst pill + seçim sheet) ---- */
function ChildSwitcher({ child, children, onPick }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} style={{ display: "flex", alignItems: "center", gap: 11, width: "100%", padding: "10px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, boxShadow: "var(--shadow-sm)", textAlign: "left" }}>
        <span className="uk-avatar" style={{ width: 40, height: 40, fontSize: 14 }}>{child.initials}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>İzlenen öğrenci</div>
          <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-.01em" }}>{child.name}</div>
        </div>
        <span className="uk-badge muted" style={{ height: 22 }}>{child.grade.split(" · ")[0]}</span>
        <MIcon name="chevronDown" size={18} style={{ color: "var(--faint)" }} />
      </button>

      {open && (
        <div className="uk-sheet-overlay" onClick={() => setOpen(false)}>
          <div className="uk-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="uk-grip" />
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 14 }}>Öğrenci seç</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {children.map((c) => {
                const on = c.id === child.id;
                return (
                  <button key={c.id} onClick={() => { onPick(c); setOpen(false); }} className="uk-odev" style={{ alignItems: "center", width: "100%", textAlign: "left", borderColor: on ? "var(--primary)" : "var(--border)", background: on ? "var(--primary-soft)" : "var(--surface)" }}>
                    <span className="uk-avatar" style={{ width: 44, height: 44, fontSize: 15 }}>{c.initials}</span>
                    <div className="body">
                      <div className="ttl" style={{ fontSize: 15 }}>{c.name}</div>
                      <div className="uk-meta" style={{ marginTop: 4 }}><span className="mi">{c.grade}</span><span className="mi d">Koç: {c.coach}</span></div>
                    </div>
                    {on ? <MIcon name="checkCircle" size={22} style={{ color: "var(--primary)" }} /> : null}
                  </button>
                );
              })}
            </div>
            <button className="uk-btn uk-btn-light uk-btn-block" style={{ marginTop: 14, height: 48, boxShadow: "none" }} onClick={() => setOpen(false)}>Kapat</button>
          </div>
        </div>
      )}
    </>
  );
}

/* ---- Salt-görüntüleme ödev kartı (veli) ---- */
function POdevCard({ o }) {
  const c = M_SUBJECT_COLORS[o.subject] || "var(--primary)";
  const typeList = o.types && o.types.length ? o.types : ["soru"];
  const t = M_ODEV_TYPES[typeList[0]] || M_ODEV_TYPES.soru;
  const needsResult = typeList.some((k) => M_ODEV_TYPES[k] && M_ODEV_TYPES[k].needsResult);
  const overdue = o.status === "pending" && o.due && new Date(o.due) < new Date("2026-06-06");
  return (
    <div className={`uk-odev${o.status === "done" ? " done" : ""}`}>
      <span className="ic" style={{ background: `color-mix(in srgb, ${c} 13%, transparent)`, color: c }}><MIcon name={t.icon} size={20} /></span>
      <div className="body">
        <div className="ttl">{o.topic}</div>
        <div className="uk-meta">
          <span className="uk-chip"><span className="sw" style={{ background: c }} />{o.subject}</span>
          {typeList.map((k) => <span key={k} className="mi d">{(M_ODEV_TYPES[k] || {}).label}</span>)}
          {needsResult && o.count ? <span className="mi d">{o.count} soru</span> : null}
        </div>
        {o.status === "done" && o.result ? (
          <div className="uk-result">
            <span style={{ color: "var(--success)" }}>✓ {o.result.d}</span>
            <span style={{ color: "var(--danger)" }}>✕ {o.result.y}</span>
            <span style={{ color: "var(--muted)" }}>○ {o.result.b}</span>
            <span className="uk-badge primary">net {mNet(o.result.d, o.result.y)}</span>
          </div>
        ) : null}
        <div style={{ marginTop: 10 }}>
          {o.status === "done"
            ? <span className="uk-badge success"><MIcon name="check" size={13} /> Tamamlandı</span>
            : <span className="uk-badge warning"><MIcon name="clock" size={13} /> {overdue ? "Gecikti" : "Bekliyor"} · {o.due ? new Date(o.due).toLocaleDateString("tr-TR", { day: "numeric", month: "short" }) : ""}</span>}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   VELİ — ANA SAYFA
   ============================================================ */
function ParentHome({ child, children, onPick, go, openSub }) {
  const pending = child.odev.filter((o) => o.status !== "done");
  const doneCount = child.odev.length - pending.length;
  const pct = Math.round((doneCount / child.odev.length) * 100);
  return (
    <div className="uk-scroll">
      <div className="uk-safe-top" />
      <div className="uk-head">
        <MAvatar name={P_PARENT.name} initials={P_PARENT.initials} size={46} avatarKey="me:parent" gradient="linear-gradient(140deg,#8E87D6,#463DA6)" />
        <div>
          <div className="hi">Merhaba,</div>
          <div className="nm">{P_PARENT.name}</div>
        </div>
        <div className="uk-head-actions">
          <button className="uk-iconbtn" onClick={() => window.dispatchEvent(new CustomEvent("uk-open-notif"))}><MIcon name="bell" size={20} /><span className="dot" /></button>
        </div>
      </div>

      <div className="uk-sec"><ChildSwitcher child={child} children={children} onPick={onPick} /></div>

      {/* özet hero */}
      <div className="uk-sec" style={{ marginTop: 14 }}>
        <div className="uk-hero">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div className="uk-badge" style={{ background: "rgba(255,255,255,.18)", color: "#fff" }}><MIcon name="flame" size={13} fill /> {child.streak} gün seri</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.85)" }}>{child.goal}</div>
          </div>
          <h2 style={{ marginTop: 14 }}>{child.name.split(" ")[0]} bu hafta %{child.completion} tamamladı</h2>
          <p>{doneCount} ödev bitti · {pending.length} bekliyor · {child.weekHours} saat çalışma</p>
          <div className="uk-hero-bar"><span style={{ width: pct + "%" }} /></div>
        </div>
      </div>

      {/* stat pills */}
      <div className="uk-sec" style={{ marginTop: 16 }}>
        <div className="uk-stats">
          <div className="uk-card uk-stat">
            <div className="lab"><span className="ic" style={{ background: "var(--primary-soft)", color: "var(--primary-600)" }}><MIcon name="chart" size={15} /></span> Toplam Net</div>
            <div className="val tnum">{child.net}</div>
            <div className="sub" style={{ color: "var(--success)" }}>▲ son denemede artış</div>
          </div>
          <div className="uk-card uk-stat">
            <div className="lab"><span className="ic" style={{ background: "var(--info-soft)", color: "var(--info)" }}><MIcon name="clock" size={15} /></span> Bu hafta</div>
            <div className="val tnum">{child.weekHours}<span style={{ fontSize: 15, fontWeight: 700, color: "var(--muted)" }}> sa</span></div>
            <div className="sub muted">çalışma süresi</div>
          </div>
        </div>
      </div>

      {/* hızlı erişim */}
      <div className="uk-sec" style={{ marginTop: 22 }}>
        <div className="uk-sec-head"><h2>Hızlı erişim</h2></div>
        <div className="uk-qa">
          {[
            ["raporlar", "shield", "Raporlar", "var(--primary-soft)", "var(--primary-600)", () => go("raporlar")],
            ["mesaj", "message", "Koça Mesaj", "var(--warning-soft)", "var(--warning)", () => openSub("pmesaj")],
            ["randevu", "calendar", "Randevu", "var(--success-soft)", "var(--success)", () => openSub("prandevu")],
            ["odeme", "card", "Ödeme", "var(--info-soft)", "var(--info)", () => openSub("odeme")],
            ["odevler", "clipboard", "Ödevler", "var(--primary-soft)", "var(--primary-600)", () => go("odevler")],
            ["denemeler", "chart", "Denemeler", "var(--danger-soft)", "var(--danger)", () => go("denemeler")],
          ].map(([key, ic, label, bg, col, fn]) => (
            <button key={key} onClick={fn}>
              <span className="qic" style={{ background: bg, color: col }}><MIcon name={ic} size={21} /></span>
              <span className="qn">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* bugünün ödevleri (salt görüntüleme) */}
      <div className="uk-sec" style={{ marginTop: 22 }}>
        <div className="uk-sec-head"><h2>Bugünün ödevleri</h2><button className="more" onClick={() => go("odevler")}>Tümü <MIcon name="chevronRight" size={14} /></button></div>
        {pending.slice(0, 2).map((o) => <POdevCard key={o.id} o={o} />)}
      </div>

      {/* koç bandı */}
      <div className="uk-sec" style={{ marginTop: 22 }}>
        <div className="uk-card uk-coach" style={{ display: "flex" }}>
          <span className="uk-avatar" style={{ width: 48, height: 48, fontSize: 16, background: "linear-gradient(140deg,#8E87D6,#463DA6)" }}>{child.coachInitials}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="cn">{child.coach}</div>
            <div className="cr">{child.name.split(" ")[0]} — Koçu</div>
          </div>
          <button className="uk-iconbtn" style={{ background: "var(--primary)", color: "#fff", border: "none" }} onClick={() => openSub("pmesaj")}><MIcon name="message" size={19} /></button>
        </div>
      </div>
      <div style={{ height: 24 }} />
    </div>
  );
}

/* ============================================================
   VELİ — ÖDEVLER (salt görüntüleme)
   ============================================================ */
function ParentOdevler({ child }) {
  const pending = child.odev.filter((o) => o.status !== "done");
  const doneList = child.odev.filter((o) => o.status === "done");
  return (
    <div className="uk-scroll">
      <div className="uk-safe-top" />
      <div className="uk-ptitle"><h1>Ödevler</h1><p>{child.name} · {pending.length} bekleyen</p></div>
      {pending.length > 0 && (
        <div className="uk-sec"><div className="uk-sec-head"><h2>Bekleyen <span style={{ color: "var(--muted)", fontWeight: 700 }}>· {pending.length}</span></h2></div>
          {pending.map((o) => <POdevCard key={o.id} o={o} />)}</div>
      )}
      {doneList.length > 0 && (
        <div className="uk-sec" style={{ marginTop: 22 }}><div className="uk-sec-head"><h2 style={{ color: "var(--muted)" }}>Tamamlanan <span style={{ fontWeight: 700 }}>· {doneList.length}</span></h2></div>
          {doneList.map((o) => <POdevCard key={o.id} o={o} />)}</div>
      )}
      <div style={{ height: 24 }} />
    </div>
  );
}

/* ============================================================
   VELİ — DENEMELER (salt görüntüleme, detay = ExamDetail)
   ============================================================ */
function ParentDenemeler({ child }) {
  const [sel, setSel] = useState(null);
  if (sel) return <ExamDetail exam={sel} onBack={() => setSel(null)} />;
  const maxTrend = Math.max(...child.trend.map((d) => d.v));
  const latest = child.exams[0];
  return (
    <div className="uk-scroll">
      <div className="uk-safe-top" />
      <div className="uk-ptitle"><h1>Denemeler</h1><p>{child.name} · {child.exams.length} deneme</p></div>
      <div className="uk-sec">
        <div className="uk-card uk-card-pad">
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
            <div><div style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)" }}>Net Gelişimi</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}><span style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-.02em" }} className="tnum">{latest.net}</span><span className="uk-badge success"><MIcon name="arrowUp" size={12} /> {latest.delta}</span></div></div>
          </div>
          <div className="uk-chart">
            {child.trend.map((d, i) => (
              <div key={i} className={`col${i === child.trend.length - 1 ? " peak" : ""}`}>
                <span className="vv tnum">{d.v}</span>
                <div className="track"><div className="fill" style={{ height: (d.v / maxTrend) * 100 + "%" }} /></div>
                <label>{d.l}</label>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="uk-sec" style={{ marginTop: 22 }}>
        <div className="uk-sec-head"><h2>Geçmiş denemeler</h2></div>
        {child.exams.map((e) => {
          const up = !e.delta.startsWith("-");
          return (
            <button key={e.id} className="uk-exam" onClick={() => setSel(e)} style={{ width: "100%", textAlign: "left" }}>
              <span className="ec"><MIcon name="chart" size={22} /></span>
              <div style={{ flex: 1, minWidth: 0 }}><div className="en">{e.name}</div><div className="em">{e.pub} · {e.date}</div>
                <div className="uk-meta" style={{ marginTop: 7 }}><span className="uk-badge muted">{e.type}</span><span className="mi">{e.rank}</span></div></div>
              <div className="right"><div className="net tnum">{e.net}</div><div className="delta" style={{ color: up ? "var(--success)" : "var(--danger)" }}>{up ? "▲" : "▼"} {e.delta}</div></div>
            </button>
          );
        })}
      </div>
      <div style={{ height: 24 }} />
    </div>
  );
}

/* ============================================================
   VELİ — GELİŞİM RAPORLARI
   ============================================================ */
function ParentRaporlar({ child }) {
  const [sel, setSel] = useState(null);
  if (sel) return <RaporDetail child={child} rapor={sel} onBack={() => setSel(null)} />;
  return (
    <div className="uk-scroll">
      <div className="uk-safe-top" />
      <div className="uk-ptitle"><h1>Gelişim Raporları</h1><p>{child.name} · koçun haftalık değerlendirmesi</p></div>
      <div className="uk-sec" style={{ gap: 10 }}>
        {child.reports.map((r) => (
          <button key={r.id} className="uk-card uk-card-pad" onClick={() => setSel(r)} style={{ width: "100%", textAlign: "left", display: "block" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 15, fontWeight: 800, whiteSpace: "nowrap" }}>{r.week}</div><div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>{r.date}</div></div>
              {r.status === "yeni" ? <span className="uk-badge primary">Yeni</span> : <span className="uk-badge muted">Okundu</span>}
            </div>
            <div style={{ display: "flex", gap: 18, marginTop: 14 }}>
              {[["Tamamlama", "%" + r.completion], ["Net", r.net], ["Çalışma", r.hours + " sa"]].map(([l, v]) => (
                <div key={l}><div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-.02em" }} className="tnum">{v}</div><div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>{l}</div></div>
              ))}
            </div>
            <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 4, fontSize: 12.5, fontWeight: 700, color: "var(--primary-600)" }}>Raporu gör <MIcon name="chevronRight" size={14} /></div>
          </button>
        ))}
      </div>
      <div style={{ height: 24 }} />
    </div>
  );
}

function RaporDetail({ child, rapor, onBack }) {
  return (
    <div className="uk-scroll">
      <div className="uk-safe-top" />
      <SubHeader title={rapor.week} sub={`${child.name} · gelişim raporu`} onBack={onBack} />
      <div className="uk-sec">
        <div className="uk-hero" style={{ borderRadius: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            {[["Tamamlama", "%" + rapor.completion], ["Toplam Net", rapor.net], ["Çalışma", rapor.hours + " sa"]].map(([l, v]) => (
              <div key={l}><div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.02em" }} className="tnum">{v}</div><div style={{ fontSize: 11.5, color: "rgba(255,255,255,.82)", fontWeight: 600, marginTop: 3 }}>{l}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="uk-sec" style={{ marginTop: 20 }}>
        <div className="uk-sec-head"><h2>Ders bazlı ilerleme</h2></div>
        <div className="uk-card uk-card-pad"><div className="uk-subj">
          {child.subjects.map((s) => {
            const c = M_SUBJECT_COLORS[s.name] || "var(--primary)";
            return (
              <div key={s.name}><div className="row1"><span className="sname"><span className="sw" style={{ background: c }} />{s.name}</span><span className="spct tnum">net {s.net}</span></div>
                <div className="uk-bar"><span style={{ width: s.pct + "%", background: c }} /></div></div>
            );
          })}
        </div></div>
      </div>

      <div className="uk-sec" style={{ marginTop: 22 }}>
        <div className="uk-sec-head"><h2>Kaynak ilerlemesi</h2><span className="uk-badge muted">{M_SOURCES.length} kitap</span></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {M_SOURCES.map((s) => {
            const tur = M_KAYNAK_TUR[s.tur] || M_KAYNAK_TUR.soru;
            const dur = M_KAYNAK_DURUM[s.status] || M_KAYNAK_DURUM.beklemede;
            const c = M_SUBJECT_COLORS[s.subj] || "var(--primary)";
            const barCol = s.status === "bitti" ? "var(--success)" : s.status === "aktif" ? c : "var(--border-strong)";
            return (
              <div className="uk-card uk-card-pad" key={s.name} style={{ padding: "12px 13px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                  <span className="ic" style={{ width: 36, height: 36, borderRadius: 10, display: "grid", placeItems: "center", background: `color-mix(in srgb, ${c} 13%, transparent)`, color: c, flexShrink: 0 }}><MIcon name={tur.icon} size={17} /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700 }}>{s.name}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 4 }}>
                      <span className={`uk-badge ${dur.tone}`} style={{ height: 20, fontSize: 10.5 }}><MIcon name={dur.icon} size={11} /> {dur.label}</span>
                      {s.soru > 0 && <span style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600 }}>{s.soru} soru</span>}
                    </div>
                  </div>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: barCol === "var(--border-strong)" ? "var(--faint)" : barCol, minWidth: 36, textAlign: "right" }}>%{s.progress}</span>
                </div>
                <div className="uk-bar" style={{ height: 6, marginTop: 10 }}><span style={{ width: s.progress + "%", background: barCol }} /></div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="uk-sec" style={{ marginTop: 16 }}>
        <div className="uk-card uk-card-pad" style={{ display: "flex", gap: 13, alignItems: "flex-start" }}>
          <span className="uk-avatar" style={{ width: 42, height: 42, fontSize: 14, background: "linear-gradient(140deg,#8E87D6,#463DA6)" }}>{child.coachInitials}</span>
          <div><div style={{ fontSize: 13.5, fontWeight: 800 }}>{child.coach} — Koç notu</div>
            <div style={{ fontSize: 13, color: "var(--text-2)", fontWeight: 500, marginTop: 5, lineHeight: 1.5 }}>{rapor.note}</div></div>
        </div>
      </div>
      <div style={{ height: 24 }} />
    </div>
  );
}

/* ============================================================
   VELİ — ÖDEME / ABONELİK
   ============================================================ */
function OdemeScreen({ onBack }) {
  const b = P_BILLING;
  const [uyelik, setUyelik] = useState(false);
  useMV();
  const mem = mvPlan(mvMembership());
  return (
    <div className="uk-scroll">
      <div className="uk-safe-top" />
      <SubHeader title="Ödeme & Abonelik" sub="Plan, kart ve faturalar" onBack={onBack} />
      <div className="uk-sec">
        <div className="uk-hero">
          <div className="uk-badge" style={{ background: "rgba(255,255,255,.18)", color: "#fff" }}><MIcon name="shield" size={13} /> Aktif abonelik</div>
          <h2 style={{ marginTop: 12 }}>{b.plan}</h2>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 8 }}><span style={{ fontSize: 30, fontWeight: 800 }}>{b.price}</span><span style={{ fontSize: 14, color: "rgba(255,255,255,.8)", fontWeight: 600 }}>{b.cycle}</span></div>
          <p style={{ marginTop: 8 }}>{b.children} öğrenci · {b.renew} tarihinde yenilenecek</p>
        </div>
      </div>

      <div className="uk-sec" style={{ marginTop: 18 }}>
        <div className="uk-sec-head"><h2>Ödeme yöntemi</h2></div>
        <div className="uk-card uk-card-pad" style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ width: 46, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#1a1f71,#2a3eb1)", display: "grid", placeItems: "center", color: "#fff", fontWeight: 800, fontSize: 11, letterSpacing: ".04em" }}>VISA</span>
          <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700 }}>•••• •••• •••• {b.card.last4}</div><div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>Son kullanma {b.card.exp}</div></div>
          <button className="uk-btn uk-btn-light" style={{ height: 36 }}>Değiştir</button>
        </div>
      </div>

      <div className="uk-sec" style={{ marginTop: 22 }}>
        <div className="uk-sec-head"><h2>Faturalar</h2></div>
        <div className="uk-list">
          {b.invoices.map((f) => (
            <div className="uk-li" key={f.id}>
              <span className="lic" style={{ background: "var(--success-soft)", color: "var(--success)" }}><MIcon name="check" size={16} /></span>
              <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700 }}>{f.amount}</div><div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>{f.date} · {f.desc}</div></div>
              <span className="uk-badge success">{f.status}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="uk-sec" style={{ marginTop: 22 }}>
        <div className="uk-sec-head"><h2>Deneme Üyeliği</h2>{mem ? <span className={`uk-badge ${mem.mode === "kargo" ? "info" : "primary"}`}>{mem.name}</span> : <span className="uk-badge muted">Yok</span>}</div>
        <button className="uk-card uk-card-pad" onClick={() => setUyelik(true)} style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 13, cursor: "pointer" }}>
          <span style={{ width: 42, height: 42, borderRadius: 12, display: "grid", placeItems: "center", background: mem ? `color-mix(in srgb, ${mem.color} 14%, transparent)` : "var(--surface-3)", color: mem ? mem.color : "var(--faint)", flexShrink: 0 }}><MIcon name={mem && mem.mode === "kargo" ? "notebook" : "chart"} size={20} /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 800 }}>{mem ? mem.name : "Deneme üyeliği seç"}</div>
            <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>{mem ? mem.tagline : "Yüz Yüze veya Aylık Kargo paketi"}</div>
          </div>
          <MIcon name="chevronRight" size={18} style={{ color: "var(--faint)" }} />
        </button>
      </div>

      <div className="uk-sec" style={{ marginTop: 16 }}>
        <button className="uk-btn uk-btn-light uk-btn-block" style={{ height: 50 }}><MIcon name="refresh" size={17} /> Planı değiştir</button>
      </div>
      <div style={{ height: 24 }} />
      {uyelik && <DenemeUyelikSheet onClose={() => setUyelik(false)} />}
    </div>
  );
}

/* ---- Veli ↔ koç mesajlaşma ---- */
function ParentMesaj({ child, onBack }) {
  const [msgs, setMsgs] = useState(P_MESSAGES);
  const [val, setVal] = useState("");
  const endRef = useRef(null);
  const send = () => { const t = val.trim(); if (!t) return; setMsgs([...msgs, { from: "me", text: t, time: "10:15" }]); setVal(""); };
  useEffect(() => { if (endRef.current) endRef.current.scrollTop = endRef.current.scrollHeight; });
  return (
    <div className="uk-screen" style={{ position: "absolute", inset: 0 }}>
      <div className="uk-safe-top" />
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "2px 16px 12px", borderBottom: "1px solid var(--border)" }}>
        <button className="uk-iconbtn" onClick={onBack} style={{ width: 40, height: 40 }}><MIcon name="chevronLeft" size={20} /></button>
        <span className="uk-avatar" style={{ width: 40, height: 40, fontSize: 14, background: "linear-gradient(140deg,#8E87D6,#463DA6)" }}>{child.coachInitials}</span>
        <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 15, fontWeight: 800 }}>{child.coach}</div><div style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 700 }}>{child.name.split(" ")[0]} — Koçu</div></div>
      </div>
      <div className="uk-scroll" ref={endRef} style={{ padding: "16px 16px 8px", display: "flex", flexDirection: "column", gap: 10 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.from === "me" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "78%", padding: "10px 13px", borderRadius: m.from === "me" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: m.from === "me" ? "var(--primary)" : "var(--surface)", color: m.from === "me" ? "#fff" : "var(--text)", border: m.from === "me" ? "none" : "1px solid var(--border)", boxShadow: "var(--shadow-sm)", fontSize: 14, fontWeight: 500, lineHeight: 1.4 }}>
              {m.text}<div style={{ fontSize: 10, fontWeight: 600, marginTop: 4, opacity: .6, textAlign: "right" }}>{m.time}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, padding: "10px 16px calc(16px + env(safe-area-inset-bottom))", borderTop: "1px solid var(--border)", background: "var(--surface)" }}>
        <div className="uk-inputwrap" style={{ flex: 1, height: 48 }}><input placeholder="Koça mesaj yaz…" value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") send(); }} style={{ fontSize: 14 }} /></div>
        <button className="uk-iconbtn" style={{ width: 48, height: 48, background: "var(--primary)", color: "#fff", border: "none", borderRadius: 14 }} onClick={send}><MIcon name="send" size={19} /></button>
      </div>
    </div>
  );
}

/* ============================================================
   VELİ — PROFİL
   ============================================================ */
function ParentProfil({ child, children, onPick, onLogout, dark, setDark, openSub }) {
  const [notif, setNotif] = useState(true);
  const [pickAv, setPickAv] = useState(false);
  const [sheet, setSheet] = useState(null);
  return (
    <div className="uk-scroll">
      <div className="uk-safe-top" />
      <div className="uk-ptitle"><h1>Profil</h1></div>
      <div className="uk-sec">
        <div className="uk-card uk-card-pad" style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <MAvatarEditable name={P_PARENT.name} initials={P_PARENT.initials} size={60} avatarKey="me:parent" gradient="linear-gradient(140deg,#8E87D6,#463DA6)" onOpen={() => setPickAv(true)} />
          <div><div style={{ fontSize: 18, fontWeight: 800 }}>{P_PARENT.name}</div><div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>Veli · {P_PARENT.phone}</div></div>
        </div>
      </div>

      <div className="uk-sec" style={{ marginTop: 18 }}>
        <div className="uk-sec-head"><h2>Öğrencilerim</h2><span className="uk-badge muted">{children.length}</span></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {children.map((c) => (
            <button key={c.id} className="uk-odev" onClick={() => onPick(c)} style={{ alignItems: "center", width: "100%", textAlign: "left", borderColor: c.id === child.id ? "var(--primary)" : "var(--border)" }}>
              <span className="uk-avatar" style={{ width: 44, height: 44, fontSize: 15 }}>{c.initials}</span>
              <div className="body"><div className="ttl" style={{ fontSize: 15 }}>{c.name}</div><div className="uk-meta" style={{ marginTop: 4 }}><span className="mi">{c.grade}</span><span className="mi d">Koç: {c.coach}</span></div></div>
              {c.id === child.id ? <span className="uk-badge primary">İzlenen</span> : <MIcon name="chevronRight" size={18} style={{ color: "var(--faint)" }} />}
            </button>
          ))}
        </div>
      </div>

      <div className="uk-sec" style={{ marginTop: 22 }}>
        <div className="uk-sec-head"><h2>Ayarlar</h2></div>
        <div className="uk-list">
          <div className="uk-li" onClick={() => setPickAv(true)} style={{ cursor: "pointer" }}>
            <span className="lic" style={{ background: "var(--primary-soft)", color: "var(--primary-600)" }}><MIcon name="user" size={17} /></span>
            <span className="lt">Profil fotoğrafı</span><span className="lr">ikon / foto</span><MIcon name="chevronRight" size={18} style={{ color: "var(--faint)" }} />
          </div>
          <div className="uk-li" onClick={() => openSub("odeme")} style={{ cursor: "pointer" }}>
            <span className="lic" style={{ background: "var(--info-soft)", color: "var(--info)" }}><MIcon name="card" size={17} /></span>
            <span className="lt">Ödeme & Abonelik</span><span className="lr">{P_BILLING.plan.split(" — ")[0]}</span><MIcon name="chevronRight" size={18} style={{ color: "var(--faint)" }} />
          </div>
          <div className="uk-li">
            <span className="lic" style={{ background: "var(--warning-soft)", color: "var(--warning)" }}><MIcon name="bell" size={17} /></span>
            <span className="lt">Bildirimler</span><button className={`uk-switch${notif ? " on" : ""}`} onClick={() => setNotif(!notif)}><span /></button>
          </div>
          <div className="uk-li">
            <span className="lic" style={{ background: "var(--surface-3)", color: "var(--text-2)" }}><MIcon name="moon" size={17} /></span>
            <span className="lt">Koyu tema</span><button className={`uk-switch${dark ? " on" : ""}`} onClick={() => setDark(!dark)}><span /></button>
          </div>
          <div className="uk-li" onClick={() => setSheet("sifre")} style={{ cursor: "pointer" }}>
            <span className="lic" style={{ background: "var(--surface-3)", color: "var(--text-2)" }}><MIcon name="shield" size={17} /></span>
            <span className="lt">Şifre & Güvenlik</span><MIcon name="chevronRight" size={18} style={{ color: "var(--faint)" }} />
          </div>
          <div className="uk-li" onClick={() => openSub("destek")} style={{ cursor: "pointer" }}>
            <span className="lic" style={{ background: "var(--primary-soft)", color: "var(--primary-600)" }}><MIcon name="help" size={17} /></span>
            <span className="lt">Yardım & Destek</span><MIcon name="chevronRight" size={18} style={{ color: "var(--faint)" }} />
          </div>
        </div>
      </div>

      <div className="uk-sec" style={{ marginTop: 16 }}>
        <button className="uk-btn uk-btn-light uk-btn-block" style={{ color: "var(--danger)", height: 50 }} onClick={onLogout}><MIcon name="logout" size={18} /> Çıkış Yap</button>
      </div>
      <div style={{ textAlign: "center", fontSize: 11.5, color: "var(--faint)", fontWeight: 600, marginTop: 16 }}>Uyanık Koç · Veli · Sürüm 1.0.0</div>
      <div style={{ height: 24 }} />
      {pickAv && <MAvatarPickerSheet name={P_PARENT.name} avatarKey="me:parent" onClose={() => setPickAv(false)} />}
      {sheet === "sifre" && <SifreSheet onClose={() => setSheet(null)} />}
    </div>
  );
}

/* ============================================================
   VELİ — KABUK (tablar + alt-ekranlar + çocuk durumu)
   ============================================================ */
function ParentTabBar({ active, go }) {
  const tabs = [
    { id: "home", label: "Ana Sayfa", icon: "home" },
    { id: "odevler", label: "Ödevler", icon: "clipboard" },
    { id: "denemeler", label: "Denemeler", icon: "chart" },
    { id: "raporlar", label: "Raporlar", icon: "shield" },
    { id: "profil", label: "Profil", icon: "user" },
  ];
  return (
    <div className="uk-tabbar">
      {tabs.map((t) => (
        <button key={t.id} className={`uk-tab${active === t.id ? " on" : ""}`} onClick={() => go(t.id)}>
          <MIcon name={t.icon} size={24} fill={active === t.id} stroke={active === t.id ? 0 : 2} />
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

function ParentShell({ dark, setDark, onLogout }) {
  const [tab, setTab] = useState("home");
  const [sub, setSub] = useState(null);
  const [childId, setChildId] = useState(P_CHILDREN[0].id);
  const child = P_CHILDREN.find((c) => c.id === childId);
  const go = (x) => { setSub(null); setTab(x); };
  const onPick = (c) => { setChildId(c.id); };

  return (
    <div className="uk-screen" data-screen-label={"veli-" + (sub || tab)}>
      {sub === "odeme" ? <OdemeScreen onBack={() => setSub(null)} />
        : sub === "pmesaj" ? <ParentMesaj child={child} onBack={() => setSub(null)} />
        : sub === "prandevu" ? <RandevularScreen onBack={() => setSub(null)} />
        : sub === "destek" ? <DestekScreen role="parent" onBack={() => setSub(null)} />
        : (
          <>
            <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }} key={tab + childId}>
              {tab === "home" && <ParentHome child={child} children={P_CHILDREN} onPick={onPick} go={go} openSub={setSub} />}
              {tab === "odevler" && <ParentOdevler child={child} />}
              {tab === "denemeler" && <ParentDenemeler child={child} />}
              {tab === "raporlar" && <ParentRaporlar child={child} />}
              {tab === "profil" && <ParentProfil child={child} children={P_CHILDREN} onPick={onPick} onLogout={onLogout} dark={dark} setDark={setDark} openSub={setSub} />}
            </div>
            <ParentTabBar active={tab} go={go} />
          </>
        )}
    </div>
  );
}

Object.assign(window, {
  ChildSwitcher, POdevCard, ParentHome, ParentOdevler, ParentDenemeler,
  ParentRaporlar, RaporDetail, OdemeScreen, ParentMesaj, ParentProfil, ParentTabBar, ParentShell,
});
