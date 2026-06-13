/* Uyanık Koç mobil — Giriş, Ana Sayfa, Ödevler ekranları */

const { useState, useEffect, useRef } = React;

/* ============================================================
   ŞİFREMİ UNUTTUM — tam akış (e-posta & telefon ortak):
   yöntem seç → kod gönder → doğrula → yeni şifre → bitti
   (web auth.jsx ForgotFlow muadili)
   ============================================================ */
function MForgotFlow({ method0 = "email", id0 = "", onBack }) {
  const [method, setMethod] = useState(method0);
  const [step, setStep] = useState("send"); // send | code | reset | ok
  const [id, setId] = useState(id0 || "");
  const [code, setCode] = useState("");
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const isPhone = method === "phone";
  const idValid = isPhone ? id.replace(/\D/g, "").length >= 10 : /\S+@\S+\.\S+/.test(id);
  const codeValid = code.replace(/\D/g, "").length === 6;
  const passValid = pass.length >= 6 && pass === pass2;

  return (
    <div className="uk-rise">
      <div className="uk-method" style={{ marginBottom: 18 }}>
        <button className={`uk-method-tab${!isPhone ? " on" : ""}`} onClick={() => { setMethod("email"); setStep("send"); }}><MIcon name="mail" size={15} /> E-posta</button>
        <button className={`uk-method-tab${isPhone ? " on" : ""}`} onClick={() => { setMethod("phone"); setStep("send"); }}><MIcon name="phone" size={15} /> Telefon</button>
      </div>

      {step === "send" && (
        <>
          <div className="uk-field">
            <label>{isPhone ? "Telefon" : "E-posta"}</label>
            <div className="uk-inputwrap">
              <MIcon name={isPhone ? "phone" : "mail"} size={18} style={{ color: "var(--muted)" }} />
              <input inputMode={isPhone ? "numeric" : "email"} type={isPhone ? "tel" : "email"} placeholder={isPhone ? "5__ ___ __ __" : "ornek@eposta.com"} value={id} onChange={(e) => setId(e.target.value)} />
            </div>
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, marginTop: 10, lineHeight: 1.45 }}>{isPhone ? "Telefonuna SMS ile" : "E-posta adresine"} 6 haneli doğrulama kodu göndereceğiz.</div>
          <button className="uk-btn uk-btn-primary uk-btn-block" style={{ marginTop: 18 }} disabled={!idValid} onClick={() => { setStep("code"); ukToast((isPhone ? "SMS" : "E-posta") + " ile kod gönderildi"); }}>
            <MIcon name="send" size={17} /> Kodu gönder
          </button>
        </>
      )}

      {step === "code" && (
        <>
          <div className="uk-field">
            <label>6 haneli kod</label>
            <input className="uk-codebox" inputMode="numeric" maxLength={6} placeholder="••••••" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
            <button onClick={() => ukToast("Kod yeniden gönderildi")} style={{ background: "none", border: "none", color: "var(--primary-600)", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>Kodu tekrar gönder</button>
            <span style={{ fontSize: 11.5, color: "var(--faint)", fontWeight: 600 }}>Demo: herhangi 6 hane</span>
          </div>
          <button className="uk-btn uk-btn-primary uk-btn-block" style={{ marginTop: 18 }} disabled={!codeValid} onClick={() => setStep("reset")}>
            <MIcon name="checkCircle" size={17} /> Doğrula
          </button>
        </>
      )}

      {step === "reset" && (
        <>
          <div className="uk-field" style={{ marginBottom: 14 }}>
            <label>Yeni şifre</label>
            <div className="uk-inputwrap"><MIcon name="shield" size={18} style={{ color: "var(--muted)" }} /><input type="password" placeholder="En az 6 karakter" value={pass} onChange={(e) => setPass(e.target.value)} /></div>
          </div>
          <div className="uk-field">
            <label>Yeni şifre (tekrar)</label>
            <div className="uk-inputwrap"><MIcon name="shield" size={18} style={{ color: "var(--muted)" }} /><input type="password" placeholder="••••••••" value={pass2} onChange={(e) => setPass2(e.target.value)} /></div>
            {pass2 && pass !== pass2 ? <div style={{ fontSize: 11.5, color: "var(--danger)", fontWeight: 600, marginTop: 7 }}>Şifreler eşleşmiyor</div> : null}
          </div>
          <button className="uk-btn uk-btn-primary uk-btn-block" style={{ marginTop: 18 }} disabled={!passValid} onClick={() => setStep("ok")}>
            <MIcon name="shield" size={17} /> Şifreyi güncelle
          </button>
        </>
      )}

      {step === "ok" && (
        <div style={{ textAlign: "center", padding: "8px 0" }}>
          <span style={{ width: 64, height: 64, borderRadius: 20, display: "grid", placeItems: "center", background: "var(--success-soft)", color: "var(--success)", margin: "0 auto 16px" }}><MIcon name="checkCircle" size={30} /></span>
          <div style={{ fontSize: 16.5, fontWeight: 800 }}>Şifren güncellendi</div>
          <div style={{ fontSize: 13.5, color: "var(--muted)", fontWeight: 500, marginTop: 8, lineHeight: 1.5 }}>Yeni şifrenle giriş yapabilirsin.</div>
        </div>
      )}

      <button className="uk-btn uk-btn-light uk-btn-block" style={{ marginTop: 14, height: 48, boxShadow: "none" }} onClick={onBack}>
        <MIcon name="chevronLeft" size={17} /> Girişe dön
      </button>
    </div>
  );
}

/* ---- Kurumundan davet iste (bottom sheet) ---- */
function MRequestInviteSheet({ onClose }) {
  const [role, setRole] = useState("student");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [org, setOrg] = useState("");
  const [sent, setSent] = useState(false);
  const ok = name.trim() && contact.trim() && org.trim();
  const roles = [["student", "cap", "Öğrenci"], ["parent", "heart", "Veli"], ["coach", "users", "Koç"]];
  return (
    <div className="uk-sheet-overlay" onClick={onClose}>
      <div className="uk-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="uk-grip" />
        {sent ? (
          <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
            <span style={{ width: 64, height: 64, borderRadius: 20, display: "grid", placeItems: "center", background: "var(--success-soft)", color: "var(--success)", margin: "0 auto 16px" }}><MIcon name="send" size={28} /></span>
            <div style={{ fontSize: 17, fontWeight: 800 }}>Davet talebin iletildi</div>
            <div style={{ fontSize: 13.5, color: "var(--muted)", fontWeight: 500, marginTop: 8, lineHeight: 1.5 }}><b style={{ color: "var(--text)" }}>{org}</b> kurumuna talebin ulaştı. Onaylandığında <b style={{ color: "var(--text)" }}>{contact}</b> üzerinden davet bağlantısı alacaksın.</div>
            <button className="uk-btn uk-btn-primary uk-btn-block" style={{ marginTop: 20 }} onClick={onClose}>Tamam</button>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 16.5, fontWeight: 800 }}>Kurumundan davet iste</div>
            <div style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600, marginTop: 3, marginBottom: 16 }}>Bilgilerini bırak, kurumun seni sisteme davet etsin.</div>
            <div className="uk-segrow" style={{ padding: 0, marginBottom: 14 }}>
              {roles.map(([id, ic, label]) => (
                <button key={id} className={`uk-seg${role === id ? " on" : ""}`} style={{ flex: 1, justifyContent: "center" }} onClick={() => setRole(id)}><MIcon name={ic} size={15} /> {label}</button>
              ))}
            </div>
            <div className="uk-field" style={{ marginBottom: 12 }}><label>Ad Soyad</label><div className="uk-inputwrap"><MIcon name="user" size={18} style={{ color: "var(--muted)" }} /><input placeholder="Adın ve soyadın" value={name} onChange={(e) => setName(e.target.value)} /></div></div>
            <div className="uk-field" style={{ marginBottom: 12 }}><label>E-posta veya telefon</label><div className="uk-inputwrap"><MIcon name="mail" size={18} style={{ color: "var(--muted)" }} /><input placeholder="ornek@eposta.com / 05XX…" value={contact} onChange={(e) => setContact(e.target.value)} /></div></div>
            <div className="uk-field"><label>Kurum adı veya davet kodu</label><div className="uk-inputwrap"><MIcon name="cap" size={18} style={{ color: "var(--muted)" }} /><input placeholder="Örn. Kampüs Koç" value={org} onChange={(e) => setOrg(e.target.value)} /></div></div>
            <button className="uk-btn uk-btn-primary uk-btn-block" style={{ marginTop: 18 }} disabled={!ok} onClick={() => setSent(true)}><MIcon name="send" size={17} /> Talep gönder</button>
            <button className="uk-btn uk-btn-light uk-btn-block" style={{ marginTop: 10, height: 48, boxShadow: "none" }} onClick={onClose}>Vazgeç</button>
          </>
        )}
        <div style={{ height: 6 }} />
      </div>
    </div>
  );
}

/* ============================================================
   GİRİŞ — telefon + SMS (ana) / e-posta (alternatif)
   ============================================================ */
function LoginScreen({ onDone, defaultMode = "phone" }) {
  const [mode, setMode] = useState(defaultMode); // phone | email
  const [step, setStep] = useState("enter"); // enter | otp | forgot | register
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [otp, setOtp] = useState("");
  const [reg, setReg] = useState({ name: "", phone: "", email: "", pass: "" });
  const [remember, setRemember] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);

  // Cep numarasını normalize et: baştaki 0'ları ve yanlışlıkla yazılan 90 ülke kodunu at, 10 haneye kırp.
  const normPhone = (v) => {
    let d = (v || "").replace(/\D/g, "");
    if (d.startsWith("90")) d = d.slice(2);   // +90 / 90 yapıştırıldıysa
    d = d.replace(/^0+/, "");                  // baştaki 0'lar (05xx)
    return d.slice(0, 10);
  };
  const rawDigits = phone.replace(/\D/g, "");
  const normDigits = normPhone(phone);
  const hadLeadingZero = rawDigits.startsWith("0") || rawDigits.startsWith("90");
  const wrongStart = normDigits.length > 0 && normDigits[0] !== "5";
  const phoneValid = normDigits.length === 10 && normDigits[0] === "5";
  const emailValid = /\S+@\S+\.\S+/.test(email) && pass.length >= 4;

  const fmtPhone = (v) => {
    const d = normPhone(v);
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
        <h1 style={{ marginTop: 26 }}>{step === "otp" ? "Kodu doğrula" : step === "forgot" ? "Şifre sıfırlama" : step === "register" ? "Aramıza katıl" : "Hedefe giden\nyolda yanındayız"}</h1>
        <p>{step === "otp" ? `${mode === "phone" ? "+90 " + fmtPhone(phone) : email} adresine kod gönderildi` : step === "forgot" ? "Hesabına 6 haneli kod gönderelim." : step === "register" ? "Birkaç adımda hesabını oluştur." : "Koçunla, ödevlerinle ve denemelerinle tek yerde."}</p>
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
            {hadLeadingZero ? (
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 9, fontSize: 12.5, fontWeight: 600, color: "var(--info)" }}>
                <MIcon name="checkCircle" size={15} /> Baştaki 0'ı yazmana gerek yok — otomatik kaldırdık.
              </div>
            ) : wrongStart ? (
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 9, fontSize: 12.5, fontWeight: 600, color: "var(--warning)" }}>
                <MIcon name="help" size={15} /> Cep numarası 5 ile başlamalı.
              </div>
            ) : null}
            <button type="button" className="uk-remember" onClick={() => setRemember(!remember)} style={{ marginTop: 18 }}>
              <span className={`uk-chk${remember ? " on" : ""}`}>{remember ? <MIcon name="check" size={13} stroke={3} /> : null}</span>
              Beni hatırla
            </button>
            <button className="uk-btn uk-btn-primary uk-btn-block" style={{ marginTop: 14 }} disabled={!phoneValid} onClick={() => setStep("otp")}>
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
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
              <button type="button" className="uk-remember" onClick={() => setRemember(!remember)}>
                <span className={`uk-chk${remember ? " on" : ""}`}>{remember ? <MIcon name="check" size={13} stroke={3} /> : null}</span>
                Beni hatırla
              </button>
              <button onClick={() => setStep("forgot")} style={{ background: "none", border: "none", color: "var(--primary-600)", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>Şifremi unuttum?</button>
            </div>
            <button className="uk-btn uk-btn-primary uk-btn-block" style={{ marginTop: 14 }} disabled={!emailValid} onClick={onDone}>
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

        {step === "forgot" && (
          <MForgotFlow method0={mode} id0={mode === "phone" ? phone : email} onBack={() => setStep("enter")} />
        )}

        {step === "register" && (
          <div className="uk-rise">
            <div className="uk-field" style={{ marginBottom: 14 }}>
              <label>Ad Soyad</label>
              <div className="uk-inputwrap">
                <MIcon name="user" size={18} style={{ color: "var(--muted)" }} />
                <input placeholder="Adın ve soyadın" value={reg.name} onChange={(e) => setReg({ ...reg, name: e.target.value })} />
              </div>
            </div>
            <div className="uk-field" style={{ marginBottom: 14 }}>
              <label>Telefon</label>
              <div className="uk-inputwrap">
                <span className="pre">🇹🇷 +90</span>
                <input inputMode="numeric" placeholder="5__ ___ __ __" value={fmtPhone(reg.phone)} onChange={(e) => setReg({ ...reg, phone: e.target.value })} />
              </div>
            </div>
            <div className="uk-field" style={{ marginBottom: 14 }}>
              <label>E-posta</label>
              <div className="uk-inputwrap">
                <MIcon name="mail" size={18} style={{ color: "var(--muted)" }} />
                <input type="email" placeholder="ornek@eposta.com" value={reg.email} onChange={(e) => setReg({ ...reg, email: e.target.value })} />
              </div>
            </div>
            <div className="uk-field">
              <label>Şifre</label>
              <div className="uk-inputwrap">
                <MIcon name="shield" size={18} style={{ color: "var(--muted)" }} />
                <input type="password" placeholder="En az 6 karakter" value={reg.pass} onChange={(e) => setReg({ ...reg, pass: e.target.value })} />
              </div>
            </div>
            <button className="uk-btn uk-btn-primary uk-btn-block" style={{ marginTop: 22 }}
              disabled={!(reg.name.trim().length > 2 && normPhone(reg.phone).length === 10 && /\S+@\S+\.\S+/.test(reg.email) && reg.pass.length >= 6)}
              onClick={onDone}>
              <MIcon name="checkCircle" size={17} /> Hesabı oluştur
            </button>
            <div style={{ textAlign: "center", marginTop: 18, fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>
              Zaten hesabın var mı? <button onClick={() => setStep("enter")} style={{ background: "none", border: "none", color: "var(--primary-600)", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>Giriş yap</button>
            </div>
          </div>
        )}

        {step === "enter" && (
          <div style={{ textAlign: "center", marginTop: 18, fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>
            <div>Hesabın yok mu? <button onClick={() => setStep("register")} style={{ background: "none", border: "none", color: "var(--primary-600)", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>Kayıt ol</button></div>
            <div style={{ marginTop: 7, fontSize: 12 }}>Kurumun mu var? <button onClick={() => setInviteOpen(true)} style={{ background: "none", border: "none", color: "var(--primary-600)", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Kurumundan davet iste</button></div>
          </div>
        )}

        <div style={{ marginTop: "auto", textAlign: "center", fontSize: 11.5, color: "var(--faint)", fontWeight: 600, paddingTop: 20, lineHeight: 1.5 }}>
          Devam ederek <b style={{ color: "var(--muted)" }}>Kullanım Koşulları</b> ve<br /><b style={{ color: "var(--muted)" }}>Gizlilik Politikası</b>'nı kabul edersin.
        </div>
      </div>
      {inviteOpen && <MRequestInviteSheet onClose={() => setInviteOpen(false)} />}
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
        <MAvatar name={M_STUDENT.name} initials="EY" size={46} avatarKey="me:student" />
        <div>
          <div className="hi">İyi çalışmalar,</div>
          <div className="nm">{M_STUDENT.first} 👋</div>
        </div>
        <div className="uk-head-actions">
          <button className="uk-iconbtn" onClick={() => window.dispatchEvent(new CustomEvent("uk-open-notif"))}><MIcon name="bell" size={20} /><span className="dot" /></button>
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

/* ============================================================
   BİLDİRİMLER — sheet (zil)
   ============================================================ */
function NotificationsSheet({ onClose }) {
  const toneBg = { primary: "var(--primary-soft)", success: "var(--success-soft)", warning: "var(--warning-soft)", info: "var(--info-soft)", danger: "var(--danger-soft)" };
  const toneFg = { primary: "var(--primary-600)", success: "var(--success)", warning: "var(--warning)", info: "var(--info)", danger: "var(--danger)" };
  return (
    <div className="uk-sheet-overlay" onClick={onClose}>
      <div className="uk-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="uk-grip" />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ fontSize: 17, fontWeight: 800 }}>Bildirimler</div>
          <button className="link-btn" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--primary-600)", background: "none", border: "none" }} onClick={() => ukToast("Tümü okundu olarak işaretlendi")}>Tümünü okundu yap</button>
        </div>
        <div>
          {M_NOTIFS.map((n, i) => (
            <div key={i} className={`uk-notif${n.unread ? " unread" : ""}`}>
              <span className="nic" style={{ background: toneBg[n.tone], color: toneFg[n.tone] }}><MIcon name={n.icon} size={18} fill={n.icon === "flame"} /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="nt">{n.title}</div>
                <div className="nd">{n.desc}</div>
                <div className="ntime">{n.time}</div>
              </div>
            </div>
          ))}
        </div>
        <button className="uk-btn uk-btn-light uk-btn-block" style={{ marginTop: 14, height: 48, boxShadow: "none" }} onClick={onClose}>Kapat</button>
      </div>
    </div>
  );
}

Object.assign(window, { LoginScreen, HomeScreen, OdevlerScreen, OdevCardM, ResultSheet, UKMark, NotificationsSheet });
