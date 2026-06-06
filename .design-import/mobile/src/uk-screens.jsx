/* Uyanık Koç mobil — Giriş, Ana Sayfa, Ödevler ekranları */

const { useState, useEffect, useRef } = React;

/* ============================================================
   GİRİŞ — telefon + SMS (ana) / e-posta (alternatif)
   ============================================================ */
function LoginScreen({ onDone, defaultMode = "phone" }) {
  const [mode, setMode] = useState(defaultMode); // phone | email
  const [step, setStep] = useState("enter"); // enter | otp
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [otp, setOtp] = useState("");

  const phoneValid = phone.replace(/\D/g, "").length >= 10;
  const emailValid = /\S+@\S+\.\S+/.test(email) && pass.length >= 4;

  const fmtPhone = (v) => {
    const d = v.replace(/\D/g, "").slice(0, 10);
    const p = [];
    if (d.length > 0) p.push(d.slice(0, 3));
    if (d.length > 3) p.push(d.slice(3, 6));
    if (d.length > 6) p.push(d.slice(6, 8));
    if (d.length > 8) p.push(d.slice(8, 10));
    return p.join(" ");
  };

  // OTP otomatik dolum simülasyonu (görsel) + bağımsız ilerleme zamanlayıcısı
  useEffect(() => {
    if (step !== "otp") return;
    setOtp("");
    const seq = "428913";
    let n = 0;
    const iv = setInterval(() => { n++; setOtp(seq.slice(0, n)); if (n >= 6) clearInterval(iv); }, 200);
    const done = setTimeout(onDone, 1500); // dolumdan bağımsız: her hâlükârda giriş yapar
    return () => { clearInterval(iv); clearTimeout(done); };
  }, [step]);

  return (
    <div className="uk-login">
      <div className="uk-login-art">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 52, height: 52, borderRadius: 16, display: "grid", placeItems: "center", background: "rgba(255,255,255,.16)", border: "1px solid rgba(255,255,255,.22)", backdropFilter: "blur(6px)" }}>
            <UKMark size={30} />
          </span>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.02em" }}>Uyanık Koç</div>
        </div>
        <h1 style={{ marginTop: 26 }}>{step === "otp" ? "Kodu doğrula" : "Hedefe giden\nyolda yanındayız"}</h1>
        <p>{step === "otp" ? `${mode === "phone" ? "+90 " + fmtPhone(phone) : email} adresine kod gönderildi` : "Koçunla, ödevlerinle ve denemelerinle tek yerde."}</p>
      </div>

      <div className="uk-login-body">
        {step === "enter" && mode === "phone" && (
          <div className="uk-rise">
            <div className="uk-field">
              <label>Telefon numarası</label>
              <div className="uk-inputwrap">
                <span className="pre">🇹🇷 +90</span>
                <input inputMode="numeric" placeholder="5__ ___ __ __" value={fmtPhone(phone)} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
            <button className="uk-btn uk-btn-primary uk-btn-block" style={{ marginTop: 22 }} disabled={!phoneValid} onClick={() => setStep("otp")}>
              <MIcon name="message" size={18} /> SMS Kodu Gönder
            </button>
            <div className="uk-or">veya</div>
            <button className="uk-btn uk-btn-light uk-btn-block" onClick={() => setMode("email")}>
              <MIcon name="mail" size={18} /> E-posta ile giriş
            </button>
          </div>
        )}

        {step === "enter" && mode === "email" && (
          <div className="uk-rise">
            <div className="uk-field" style={{ marginBottom: 16 }}>
              <label>E-posta</label>
              <div className="uk-inputwrap">
                <MIcon name="mail" size={18} style={{ color: "var(--muted)" }} />
                <input type="email" placeholder="ornek@eposta.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <div className="uk-field">
              <label>Şifre</label>
              <div className="uk-inputwrap">
                <MIcon name="shield" size={18} style={{ color: "var(--muted)" }} />
                <input type="password" placeholder="••••••••" value={pass} onChange={(e) => setPass(e.target.value)} />
              </div>
            </div>
            <button className="uk-btn uk-btn-primary uk-btn-block" style={{ marginTop: 22 }} disabled={!emailValid} onClick={onDone}>
              Giriş Yap
            </button>
            <div className="uk-or">veya</div>
            <button className="uk-btn uk-btn-light uk-btn-block" onClick={() => setMode("phone")}>
              <MIcon name="phone" size={18} /> Telefon ile giriş
            </button>
          </div>
        )}

        {step === "otp" && (
          <div className="uk-rise">
            <div className="uk-field">
              <label>6 haneli kod</label>
              <div className="uk-otp">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={`box${otp[i] ? " filled" : ""}${otp.length === i ? " cursor" : ""}`}>{otp[i] || ""}</div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 22, color: "var(--muted)", fontSize: 13, fontWeight: 600 }}>
              <MIcon name="clock" size={15} /> Kod otomatik algılanıyor…
            </div>
            <button className="uk-btn uk-btn-light uk-btn-block" style={{ marginTop: 22 }} onClick={() => setStep("enter")}>
              Numarayı değiştir
            </button>
          </div>
        )}

        <div style={{ marginTop: "auto", textAlign: "center", fontSize: 11.5, color: "var(--faint)", fontWeight: 600, paddingTop: 20, lineHeight: 1.5 }}>
          Devam ederek <b style={{ color: "var(--muted)" }}>Kullanım Koşulları</b> ve<br /><b style={{ color: "var(--muted)" }}>Gizlilik Politikası</b>'nı kabul edersin.
        </div>
      </div>
    </div>
  );
}

/* küçük marka glyph'i (logo.jsx ile aynı geometri) */
function UKMark({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ color: "#fff" }}>
      <path d="M7 8.5 V13 a5 5 0 0 0 10 0 V8.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M12 2.2 C12.5 4.1 13.2 4.8 15 5.3 C13.2 5.8 12.5 6.5 12 8.4 C11.5 6.5 10.8 5.8 9 5.3 C10.8 4.8 11.5 4.1 12 2.2 Z" fill="currentColor" />
    </svg>
  );
}

/* ============================================================
   ANA SAYFA
   ============================================================ */
function HomeScreen({ go, openResult, openSub }) {
  const todays = M_ODEVLER.filter((o) => o.week === "w0");
  const pending = todays.filter((o) => o.status !== "done");
  const doneCount = todays.length - pending.length;
  const pct = Math.round((doneCount / todays.length) * 100);

  return (
    <div className="uk-scroll">
      <div className="uk-safe-top" />
      <div className="uk-head">
        <span className="uk-avatar" style={{ width: 46, height: 46, fontSize: 16 }}>EY</span>
        <div>
          <div className="hi">İyi çalışmalar,</div>
          <div className="nm">{M_STUDENT.first} 👋</div>
        </div>
        <div className="uk-head-actions">
          <button className="uk-iconbtn"><MIcon name="bell" size={20} /><span className="dot" /></button>
        </div>
      </div>

      {/* Hero */}
      <div className="uk-sec uk-rise">
        <div className="uk-hero">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div className="uk-badge" style={{ background: "rgba(255,255,255,.18)", color: "#fff" }}>
              <MIcon name="flame" size={13} fill /> {M_STUDENT.streak} gün seri
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.85)" }}>{M_TODAY === "Cmt" ? "Cumartesi" : ""} · 6 Haz</div>
          </div>
          <h2 style={{ marginTop: 14 }}>{pending.length > 0 ? `Bugün ${pending.length} ödevin var` : "Bugünün ödevleri tamam! 🎉"}</h2>
          <p>{doneCount} tamamlandı · {pending.length} bekliyor</p>
          <div className="uk-hero-bar"><span style={{ width: pct + "%" }} /></div>
          <button className="uk-hero-cta" onClick={() => go("odevler")}>
            Ödevlere git <MIcon name="chevronRight" size={16} />
          </button>
        </div>
      </div>

      {/* Stat pills */}
      <div className="uk-sec" style={{ marginTop: 16 }}>
        <div className="uk-stats">
          <div className="uk-card uk-stat">
            <div className="lab"><span className="ic" style={{ background: "var(--primary-soft)", color: "var(--primary-600)" }}><MIcon name="chart" size={15} /></span> Toplam Net</div>
            <div className="val tnum">{M_STUDENT.net}</div>
            <div className="sub" style={{ color: "var(--success)" }}>▲ son denemede +15</div>
          </div>
          <div className="uk-card uk-stat">
            <div className="lab"><span className="ic" style={{ background: "var(--info-soft)", color: "var(--info)" }}><MIcon name="clock" size={15} /></span> Bu hafta</div>
            <div className="val tnum">{M_STUDENT.weekHours}<span style={{ fontSize: 15, fontWeight: 700, color: "var(--muted)" }}> sa</span></div>
            <div className="sub" style={{ color: "var(--success)" }}>▲ +3.2 saat</div>
          </div>
        </div>
      </div>

      {/* Bugünün ödevleri */}
      <div className="uk-sec" style={{ marginTop: 22 }}>
        <div className="uk-sec-head">
          <h2>Bugünün ödevleri</h2>
          <button className="more" onClick={() => go("odevler")}>Tümü <MIcon name="chevronRight" size={14} /></button>
        </div>
        {pending.slice(0, 3).map((o) => <OdevCardM key={o.id} o={o} onResult={openResult} />)}
      </div>

      {/* Yaklaşan deneme */}
      <div className="uk-sec" style={{ marginTop: 22 }}>
        <div className="uk-sec-head"><h2>Yaklaşan deneme</h2></div>
        <button className="uk-card uk-card-pad" style={{ display: "flex", alignItems: "center", gap: 14, textAlign: "left", width: "100%" }} onClick={() => go("denemeler")}>
          <span style={{ width: 52, height: 52, borderRadius: 14, display: "grid", placeItems: "center", background: "var(--primary-soft)", color: "var(--primary-600)", flexShrink: 0 }}><MIcon name="target" size={24} /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-.01em" }}>{M_UPCOMING.name}</div>
            <div style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600, marginTop: 3 }}>{M_UPCOMING.org}</div>
            <div className="uk-meta" style={{ marginTop: 8 }}>
              <span className="uk-badge primary"><MIcon name="calendar" size={12} /> {M_UPCOMING.date}</span>
              <span className="uk-badge muted"><MIcon name="clock" size={12} /> {M_UPCOMING.time}</span>
            </div>
          </div>
        </button>
      </div>

      {/* Hızlı erişim */}
      <div className="uk-sec" style={{ marginTop: 22 }}>
        <div className="uk-sec-head"><h2>Hızlı erişim</h2></div>
        <div className="uk-qa">
          {[
            ["konu", "book", "Konu Takibi", "var(--primary-soft)", "var(--primary-600)"],
            ["kaynaklar", "notebook", "Kaynaklarım", "var(--info-soft)", "var(--info)"],
            ["randevu", "calendar", "Randevular", "var(--success-soft)", "var(--success)"],
            ["mesaj", "message", "Mesajlar", "var(--warning-soft)", "var(--warning)"],
            ["motivasyon", "heart", "Motivasyon", "var(--danger-soft)", "var(--danger)"],
            ["denemeler", "chart", "Denemeler", "var(--primary-soft)", "var(--primary-600)"],
          ].map(([key, ic, label, bg, col]) => (
            <button key={key} onClick={() => key === "denemeler" ? go("denemeler") : openSub(key)}>
              <span className="qic" style={{ background: bg, color: col }}><MIcon name={ic} size={21} fill={ic === "heart"} /></span>
              <span className="qn">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Koç bandı */}
      <div className="uk-sec" style={{ marginTop: 22 }}>
        <div className="uk-card uk-coach" style={{ display: "flex" }}>
          <span className="uk-avatar" style={{ width: 48, height: 48, fontSize: 16, background: "linear-gradient(140deg,#8E87D6,#463DA6)" }}>DE</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="cn">{M_STUDENT.coach}</div>
            <div className="cr">Koçun · YKS & LGS</div>
          </div>
          <button className="uk-iconbtn" style={{ background: "var(--primary)", color: "#fff", border: "none" }} onClick={() => openSub("mesaj")}><MIcon name="message" size={19} /></button>
        </div>
      </div>

      <div style={{ height: 24 }} />
    </div>
  );
}

/* ============================================================
   ÖDEV KARTI (ortak)
   ============================================================ */
function OdevCardM({ o, onResult }) {
  const c = M_SUBJECT_COLORS[o.subject] || "var(--primary)";
  const typeList = o.types && o.types.length ? o.types : ["soru"];
  const t = M_ODEV_TYPES[typeList[0]] || M_ODEV_TYPES.soru;
  const needsResult = typeList.some((k) => M_ODEV_TYPES[k] && M_ODEV_TYPES[k].needsResult);
  const overdue = o.status === "pending" && o.due && new Date(o.due) < new Date("2026-06-06");
  const dueLabel = o.due ? new Date(o.due).toLocaleDateString("tr-TR", { day: "numeric", month: "short" }) : "";

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
        <div className="uk-meta" style={{ marginTop: 6 }}>
          <span className="mi"><MIcon name="book" size={13} style={{ color: "var(--faint)" }} />{o.source}</span>
        </div>
        {o.note ? <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 8, background: "var(--surface-3)", padding: "7px 11px", borderRadius: 9, fontWeight: 600 }}>📌 {o.note}</div> : null}

        {o.status === "done" && o.result ? (
          <div className="uk-result">
            <span style={{ color: "var(--success)" }}>✓ {o.result.d} doğru</span>
            <span style={{ color: "var(--danger)" }}>✕ {o.result.y} yanlış</span>
            <span style={{ color: "var(--muted)" }}>○ {o.result.b} boş</span>
            <span className="uk-badge primary">net {mNet(o.result.d, o.result.y)}</span>
          </div>
        ) : null}

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
          {o.status === "done"
            ? <span className="uk-badge success"><MIcon name="check" size={13} /> Tamamlandı</span>
            : <button className="uk-btn uk-btn-primary" onClick={() => onResult(o)} style={{ height: 36 }}>{needsResult ? "Sonuç Gir" : "Tamamla"}</button>}
          {o.status !== "done" && o.due ? (
            <span style={{ fontSize: 12, fontWeight: 700, color: overdue ? "var(--danger)" : "var(--muted)" }}>{overdue ? "Gecikti · " : "Son: "}{dueLabel}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ÖDEVLER ekranı
   ============================================================ */
function OdevlerScreen({ openResult }) {
  const [week, setWeek] = useState("w0");
  const wk = M_ODEVLER.filter((o) => o.week === week);
  const pending = wk.filter((o) => o.status !== "done");
  const doneList = wk.filter((o) => o.status === "done");
  const weekHasData = (w) => M_ODEVLER.some((o) => o.week === w);
  const winfo = M_WEEKS.find((w) => w.id === week);

  return (
    <div className="uk-scroll">
      <div className="uk-safe-top" />
      <div className="uk-ptitle">
        <h1>Ödevler</h1>
        <p>{winfo.range} · {pending.length} bekleyen ödev</p>
      </div>

      <div className="uk-segrow">
        {M_WEEKS.map((w) => (
          <button key={w.id} className={`uk-seg${week === w.id ? " on" : ""}`} disabled={!weekHasData(w.id)} onClick={() => setWeek(w.id)}>{w.label}</button>
        ))}
      </div>

      {pending.length > 0 && (
        <div className="uk-sec" style={{ marginTop: 16 }}>
          <div className="uk-sec-head"><h2>Bekleyen <span style={{ color: "var(--muted)", fontWeight: 700 }}>· {pending.length}</span></h2></div>
          {pending.map((o) => <OdevCardM key={o.id} o={o} onResult={openResult} />)}
        </div>
      )}

      {doneList.length > 0 && (
        <div className="uk-sec" style={{ marginTop: 22 }}>
          <div className="uk-sec-head"><h2 style={{ color: "var(--muted)" }}>Tamamlanan <span style={{ fontWeight: 700 }}>· {doneList.length}</span></h2></div>
          {doneList.map((o) => <OdevCardM key={o.id} o={o} onResult={openResult} />)}
        </div>
      )}

      {wk.length === 0 && (
        <div style={{ padding: "60px 30px", textAlign: "center", color: "var(--muted)", fontSize: 14 }}>Bu hafta atanmış ödev yok.</div>
      )}

      <div style={{ height: 24 }} />
    </div>
  );
}

/* ============================================================
   SONUÇ GİRİŞ — bottom sheet (D / Y / B → net)
   ============================================================ */
function ResultSheet({ odev, onClose }) {
  const [d, setD] = useState(""); const [y, setY] = useState(""); const [b, setB] = useState("");
  const [saved, setSaved] = useState(false);
  if (!odev) return null;
  const typeList = odev.types && odev.types.length ? odev.types : ["soru"];
  const needs = typeList.some((k) => M_ODEV_TYPES[k] && M_ODEV_TYPES[k].needsResult);
  const c = M_SUBJECT_COLORS[odev.subject] || "var(--primary)";
  const num = (x) => { const n = parseInt(String(x).replace(/\D/g, ""), 10); return isNaN(n) ? 0 : n; };
  const td = num(d), ty = num(y);
  const net = mNet(td, ty);
  const valid = !needs || (td + ty + num(b) > 0);

  const save = () => { setSaved(true); setTimeout(onClose, 950); };

  return (
    <div className="uk-sheet-overlay" onClick={onClose}>
      <div className="uk-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="uk-grip" />
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <span style={{ width: 44, height: 44, borderRadius: 13, display: "grid", placeItems: "center", background: `color-mix(in srgb, ${c} 14%, transparent)`, color: c, flexShrink: 0 }}><MIcon name={(M_ODEV_TYPES[typeList[0]] || M_ODEV_TYPES.soru).icon} size={21} /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-.01em", lineHeight: 1.25 }}>{odev.topic}</div>
            <div style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>{odev.subject} · {odev.source}</div>
          </div>
        </div>

        {needs ? (
          <>
            <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600, marginBottom: 12 }}>Hedef <b style={{ color: "var(--text)" }}>{odev.count} soru</b> · sonucu gir:</div>
            <div className="uk-dyb">
              <div className="f"><label style={{ color: "var(--success)" }}>Doğru</label><input inputMode="numeric" placeholder="0" value={d} onChange={(e) => setD(e.target.value.replace(/\D/g, ""))} /></div>
              <div className="f"><label style={{ color: "var(--danger)" }}>Yanlış</label><input inputMode="numeric" placeholder="0" value={y} onChange={(e) => setY(e.target.value.replace(/\D/g, ""))} /></div>
              <div className="f"><label style={{ color: "var(--muted)" }}>Boş</label><input inputMode="numeric" placeholder="0" value={b} onChange={(e) => setB(e.target.value.replace(/\D/g, ""))} /></div>
            </div>
            <div className="uk-netbox"><span className="l">Hesaplanan net</span><span className="v tnum">{net}</span></div>
          </>
        ) : (
          <div style={{ padding: "14px 0 6px", textAlign: "center", color: "var(--text-2)", fontSize: 14, lineHeight: 1.5 }}>
            Bu görevi tamamladıysan işaretle.{odev.note ? ` "${odev.note}"` : ""}
          </div>
        )}

        <button className="uk-btn uk-btn-primary uk-btn-block" style={{ marginTop: 20, background: saved ? "var(--success)" : undefined }} disabled={!valid} onClick={save}>
          <MIcon name={saved ? "check" : "checkCircle"} size={18} /> {saved ? "Kaydedildi!" : needs ? "Sonucu Kaydet" : "Tamamlandı olarak işaretle"}
        </button>
        <button className="uk-btn uk-btn-light uk-btn-block" style={{ marginTop: 10, height: 46, boxShadow: "none" }} onClick={onClose}>Vazgeç</button>
      </div>
    </div>
  );
}

Object.assign(window, { LoginScreen, HomeScreen, OdevlerScreen, OdevCardM, ResultSheet, UKMark });
