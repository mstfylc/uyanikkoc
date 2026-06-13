/* Auth (Login / Logout) + Profil.
   Oturum kalıcılığı: "Beni hatırla" açık → localStorage (kalıcı),
   kapalı → sessionStorage (sekme kapanınca silinir, tekrar giriş ister). */

const AUTH_KEY = "uk_auth_v1";
const DEMO_USERS = {
  student: { name: "Elif Yıldız", email: "elif@uyanikkoc.com", phone: "0533 214 55 80", role: "student", sub: "11. Sınıf · Sayısal" },
  coach: { name: "Dilek Emen", email: "dilek@uyanikkoc.com", phone: "0532 118 44 02", role: "coach", sub: "YKS & LGS Koçu" },
  parent: { name: "Ayşe Yıldız", email: "ayse@uyanikkoc.com", phone: "0535 904 21 33", role: "parent", sub: "Veli · Elif'in annesi" },
};

function loadAuth() {
  try {
    const l = localStorage.getItem(AUTH_KEY); if (l) return JSON.parse(l);
    const s = sessionStorage.getItem(AUTH_KEY); if (s) return JSON.parse(s);
  } catch (e) {}
  return null;
}
function saveAuth(a) {
  try {
    localStorage.removeItem(AUTH_KEY); sessionStorage.removeItem(AUTH_KEY);
    if (a) (a.remember === false ? sessionStorage : localStorage).setItem(AUTH_KEY, JSON.stringify(a));
  } catch (e) {}
}
function meKey(u) { return u ? "u:" + (u.email || u.phone || u.role) : null; }

/* ---- Şifremi unuttum akışı (e-posta & telefon ortak) ---- */
function ForgotFlow({ method, identifier, onBack, onDone }) {
  const [step, setStep] = useState("send"); // send → code → reset → ok
  const [id, setId] = useState(identifier || "");
  const [code, setCode] = useState("");
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const isPhone = method === "phone";
  const channel = isPhone ? "SMS" : "e-posta";
  const idValid = isPhone ? id.replace(/\D/g, "").length >= 10 : /.+@.+\..+/.test(id);
  const codeValid = code.replace(/\D/g, "").length === 6;
  const passValid = pass.length >= 6 && pass === pass2;

  return (
    <div className="uk-rise">
      <button type="button" className="row" onClick={onBack} style={{ gap: 6, background: "none", border: "none", color: "var(--text-2)", fontSize: 12.5, fontWeight: 700, cursor: "pointer", marginBottom: 16 }}>
        <Icon name="chevronRight" size={15} style={{ transform: "scaleX(-1)" }} />Girişe dön
      </button>

      {step === "send" && (
        <>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.02em" }}>Şifreni mi unuttun?</h1>
          <p className="muted" style={{ fontSize: 13.5, marginTop: 4, marginBottom: 18 }}>{isPhone ? "Telefonuna SMS ile" : "E-posta adresine"} 6 haneli doğrulama kodu gönderelim.</p>
          <div className="field" style={{ marginBottom: 16 }}>
            <label className="label">{isPhone ? "Telefon" : "E-posta"}</label>
            <input className="input" type={isPhone ? "tel" : "email"} value={id} onChange={(e) => setId(e.target.value)} placeholder={isPhone ? "05XX XXX XX XX" : "ornek@uyanikkoc.com"} />
          </div>
          <button type="button" className="btn btn-primary" style={{ width: "100%", height: 46 }} disabled={!idValid} onClick={() => { setStep("code"); if (typeof toast === "function") toast(channel + " ile kod gönderildi", { icon: isPhone ? "phone" : "message" }); }}>
            <Icon name="send" size={16} />Kodu gönder
          </button>
        </>
      )}

      {step === "code" && (
        <>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.02em" }}>Kodu gir</h1>
          <p className="muted" style={{ fontSize: 13.5, marginTop: 4, marginBottom: 18 }}><b style={{ color: "var(--text)" }}>{id}</b> adresine gönderilen 6 haneli kodu yaz.</p>
          <div className="field" style={{ marginBottom: 14 }}>
            <label className="label">Doğrulama kodu</label>
            <input className="input tnum" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} placeholder="••••••" style={{ letterSpacing: ".5em", fontSize: 18, textAlign: "center", fontWeight: 700 }} />
          </div>
          <div className="between" style={{ marginBottom: 18 }}>
            <button type="button" className="link-btn" style={{ fontSize: 12.5 }} onClick={() => { if (typeof toast === "function") toast("Kod yeniden gönderildi", { icon: "refresh" }); }}>Kodu tekrar gönder</button>
            <span className="muted" style={{ fontSize: 12 }}>Demo: herhangi 6 hane</span>
          </div>
          <button type="button" className="btn btn-primary" style={{ width: "100%", height: 46 }} disabled={!codeValid} onClick={() => setStep("reset")}><Icon name="check" size={16} />Doğrula</button>
        </>
      )}

      {step === "reset" && (
        <>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.02em" }}>Yeni şifre belirle</h1>
          <p className="muted" style={{ fontSize: 13.5, marginTop: 4, marginBottom: 18 }}>En az 6 karakter olmalı.</p>
          <div className="field" style={{ marginBottom: 14 }}><label className="label">Yeni şifre</label><input className="input" type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="••••••••" /></div>
          <div className="field" style={{ marginBottom: 18 }}><label className="label">Yeni şifre (tekrar)</label><input className="input" type="password" value={pass2} onChange={(e) => setPass2(e.target.value)} placeholder="••••••••" />{pass2 && pass !== pass2 ? <span style={{ fontSize: 11.5, color: "var(--danger)", marginTop: 4 }}>Şifreler eşleşmiyor</span> : null}</div>
          <button type="button" className="btn btn-primary" style={{ width: "100%", height: 46 }} disabled={!passValid} onClick={() => { setStep("ok"); if (typeof toast === "function") toast("Şifren güncellendi", { icon: "checkCircle" }); }}><Icon name="lock" size={16} />Şifreyi güncelle</button>
        </>
      )}

      {step === "ok" && (
        <div style={{ textAlign: "center", padding: "10px 0" }}>
          <span className="stat-icon tone-success" style={{ width: 56, height: 56, margin: "0 auto 14px" }}><Icon name="checkCircle" size={28} /></span>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.02em" }}>Şifren güncellendi</h1>
          <p className="muted" style={{ fontSize: 13.5, marginTop: 6, marginBottom: 20 }}>Yeni şifrenle giriş yapabilirsin.</p>
          <button type="button" className="btn btn-primary" style={{ width: "100%", height: 46 }} onClick={onDone}><Icon name="logout" size={16} style={{ transform: "scaleX(-1)" }} />Girişe dön</button>
        </div>
      )}
    </div>
  );
}

/* ---- Kurumdan davet iste modalı ---- */
function RequestInviteModal({ onClose }) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [org, setOrg] = useState("");
  const [role, setRole] = useState("student");
  const [sent, setSent] = useState(false);
  const ok = name.trim() && contact.trim() && org.trim();

  return ReactDOM.createPortal((
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
        {sent ? (
          <div className="modal-body" style={{ padding: 28, textAlign: "center", gap: 12 }}>
            <span className="stat-icon tone-success" style={{ width: 54, height: 54, margin: "0 auto" }}><Icon name="send" size={26} /></span>
            <h3 style={{ fontSize: 18, fontWeight: 800 }}>Davet talebin iletildi</h3>
            <p className="muted" style={{ fontSize: 13, lineHeight: 1.5 }}><b style={{ color: "var(--text)" }}>{org}</b> kurumuna talebin ulaştı. Onaylandığında <b style={{ color: "var(--text)" }}>{contact}</b> üzerinden bir davet bağlantısı alacaksın.</p>
            <button className="btn btn-primary" style={{ marginTop: 4 }} onClick={onClose}>Tamam</button>
          </div>
        ) : (
          <>
            <div className="modal-head">
              <div><h3 style={{ fontSize: 17, fontWeight: 800 }}>Kurumundan davet iste</h3><p className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>Bilgilerini bırak, kurumun seni sisteme davet etsin.</p></div>
              <button className="icon-btn" onClick={onClose} aria-label="Kapat" style={{ width: 34, height: 34 }}><Icon name="plus" size={18} style={{ transform: "rotate(45deg)" }} /></button>
            </div>
            <div className="modal-body" style={{ padding: "18px 20px", gap: 14 }}>
              <div className="seg" style={{ width: "100%" }}>
                <button type="button" className={role === "student" ? "on" : ""} style={{ flex: 1, justifyContent: "center" }} onClick={() => setRole("student")}><Icon name="cap" size={15} />Öğrenci</button>
                <button type="button" className={role === "parent" ? "on" : ""} style={{ flex: 1, justifyContent: "center" }} onClick={() => setRole("parent")}><Icon name="heart" size={15} />Veli</button>
                <button type="button" className={role === "coach" ? "on" : ""} style={{ flex: 1, justifyContent: "center" }} onClick={() => setRole("coach")}><Icon name="users" size={15} />Koç</button>
              </div>
              <div className="field"><label className="label">Ad Soyad</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Adın ve soyadın" /></div>
              <div className="field"><label className="label">E-posta veya telefon</label><input className="input" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="ornek@eposta.com / 05XX..." /></div>
              <div className="field"><label className="label">Kurum adı veya davet kodu</label><input className="input" value={org} onChange={(e) => setOrg(e.target.value)} placeholder="Örn. Kampüs Koç" /></div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-light" onClick={onClose}>Vazgeç</button>
              <button className="btn btn-primary" style={{ marginLeft: "auto" }} disabled={!ok} onClick={() => setSent(true)}><Icon name="send" size={15} />Talep gönder</button>
            </div>
          </>
        )}
      </div>
    </div>
  ), document.body);
}

/* ---- Üye ol (kayıt) akışı: rol → bilgiler → (koç) plan → doğrulama → bitti ---- */
const COACH_SIGNUP_PLANS = [
  { id: "c-baslangic", name: "Başlangıç", color: "var(--info)", monthly: 499, annual: 4990, seats: "15",
    tagline: "Koçluğa yeni başlayanlar", features: ["15 öğrenciye kadar", "Deneme analizi & net takibi", "Ödev ve konu takibi", "Koç–öğrenci mesajlaşma"] },
  { id: "c-pro", name: "Pro", color: "var(--primary)", monthly: 999, annual: 9990, seats: "40", popular: true,
    tagline: "Aktif çalışan koçlar için", features: ["40 öğrenciye kadar", "Başlangıç’taki her şey", "Veli paneli & raporlar", "Randevu + online deneme"] },
  { id: "c-sinirsiz", name: "Sınırsız", color: "var(--warning)", monthly: 1799, annual: 17990, seats: "∞",
    tagline: "Profesyonel koçlar & kadrolar", features: ["Sınırsız öğrenci", "Pro’daki her şey", "AI Koç önerileri", "Envanter, testler & öncelikli destek"] },
];
function coachSignupPlanById(id) { return COACH_SIGNUP_PLANS.find((p) => p.id === id) || COACH_SIGNUP_PLANS[1]; }
const liraFmt = (n) => (typeof TRY === "function" ? TRY(n) : "₺" + n.toLocaleString("tr-TR"));

function SignUpStepper({ steps, current }) {
  return (
    <div className="signup-steps" aria-hidden="true">
      {steps.map((s, i) => {
        const done = i < current, on = i === current;
        return (
          <React.Fragment key={s}>
            {i > 0 ? <span className={`sbar${i <= current ? " done" : ""}`} /> : null}
            <span className={`sdot${on ? " on" : done ? " done" : ""}`} title={s}>{done ? <Icon name="check" size={13} stroke={3} /> : i + 1}</span>
          </React.Fragment>
        );
      })}
    </div>
  );
}

function SignUpFlow({ onLogin, onBack }) {
  const [role, setRole] = useState(null);          // coach | student
  const [step, setStep] = useState("role");        // role · info · plan · verify · done
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pass, setPass] = useState("");
  const [invite, setInvite] = useState("");
  const [kvkk, setKvkk] = useState(false);
  const [planId, setPlanId] = useState("c-pro");
  const [cycle, setCycle] = useState("annual");
  const [code, setCode] = useState("");

  const isCoach = role === "coach";
  const stepNames = isCoach ? ["Rol", "Bilgiler", "Plan", "Doğrulama"] : ["Rol", "Bilgiler", "Doğrulama"];
  const stepIndex = { role: 0, info: 1, plan: 2, verify: isCoach ? 3 : 2 }[step] ?? 0;

  const emailValid = /.+@.+\..+/.test(email);
  const phoneValid = phone.replace(/\D/g, "").length >= 10;
  const infoValid = name.trim().length >= 2 && (emailValid || phoneValid) && pass.length >= 6 && kvkk;
  const codeValid = code.replace(/\D/g, "").length === 6;
  const channel = emailValid ? "e-posta" : "SMS";
  const target = emailValid ? email : phone;

  const back = () => {
    if (step === "role") return onBack();
    if (step === "info") return setStep("role");
    if (step === "plan") return setStep("info");
    if (step === "verify") return setStep(isCoach ? "plan" : "info");
  };
  const sendCode = () => { setStep("verify"); if (typeof toast === "function") toast(channel + " ile doğrulama kodu gönderildi", { icon: emailValid ? "message" : "phone" }); };
  const afterInfo = () => { if (isCoach) setStep("plan"); else sendCode(); };
  const finish = () => {
    const base = DEMO_USERS[role];
    const p = coachSignupPlanById(planId);
    onLogin({
      ...base,
      name: name.trim() || base.name,
      email: emailValid ? email.trim() : base.email,
      phone: phoneValid ? phone.trim() : base.phone,
      sub: isCoach ? p.name + " · Bireysel Koç" : base.sub,
      remember: true,
    });
  };

  const p = coachSignupPlanById(planId);
  const planAmount = cycle === "annual" ? p.annual : p.monthly;
  const planMonthly = cycle === "annual" ? Math.round(p.annual / 12) : p.monthly;
  const wide = step === "plan";

  return (
    <div className="auth-card uk-rise" style={{ maxWidth: wide ? 520 : 420, transition: "max-width .2s" }}>
      <button type="button" className="row" onClick={back} style={{ gap: 6, background: "none", border: "none", color: "var(--text-2)", fontSize: 12.5, fontWeight: 700, cursor: "pointer", marginBottom: 16 }}>
        <Icon name="chevronRight" size={15} style={{ transform: "scaleX(-1)" }} />{step === "role" ? "Girişe dön" : "Geri"}
      </button>

      {step !== "done" ? <SignUpStepper steps={stepNames} current={stepIndex} /> : null}

      {/* 1 — Rol seçimi */}
      {step === "role" && (
        <>
          <h1 style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-.02em" }}>Hesabını oluştur</h1>
          <p className="muted" style={{ fontSize: 13.5, marginTop: 4, marginBottom: 20 }}>Seni en iyi tanımlayan seçeneği seç.</p>
          <div className="role-choice">
            <button type="button" className={`role-card${role === "coach" ? " on" : ""}`} onClick={() => { setRole("coach"); setStep("info"); }}>
              <span className="rc-ic"><Icon name="users" size={23} /></span>
              <span style={{ flex: 1 }}><span className="rc-tt">Bireysel Koç</span><span className="rc-sub" style={{ display: "block" }}>Kendi öğrencilerini yönet, lisans satın al</span></span>
              <Icon name="chevronRight" size={18} className="rc-chev" />
            </button>
            <button type="button" className={`role-card${role === "student" ? " on" : ""}`} onClick={() => { setRole("student"); setStep("info"); }}>
              <span className="rc-ic"><Icon name="cap" size={23} /></span>
              <span style={{ flex: 1 }}><span className="rc-tt">Öğrenci</span><span className="rc-sub" style={{ display: "block" }}>Koçunla çalış, deneme ve ödevlerini takip et</span></span>
              <Icon name="chevronRight" size={18} className="rc-chev" />
            </button>
          </div>
          <p className="muted" style={{ fontSize: 11.5, textAlign: "center", marginTop: 18, lineHeight: 1.5 }}>
            Veli misin? Hesabın öğrencinin koçu tarafından oluşturulur.<br />Kurumdaysan <button type="button" className="link-btn" style={{ display: "inline" }} onClick={onBack}>davet iste</button>.
          </p>
        </>
      )}

      {/* 2 — Bilgiler */}
      {step === "info" && (
        <>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.02em" }}>{isCoach ? "Koç hesabı bilgileri" : "Öğrenci bilgileri"}</h1>
          <p className="muted" style={{ fontSize: 13.5, marginTop: 4, marginBottom: 18 }}>Giriş için kullanacağın bilgileri gir.</p>
          <div className="field" style={{ marginBottom: 13 }}><label className="label">Ad Soyad</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Adın ve soyadın" /></div>
          <div className="field" style={{ marginBottom: 13 }}><label className="label">E-posta</label><input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@uyanikkoc.com" /></div>
          <div className="field" style={{ marginBottom: 13 }}><label className="label">Telefon <span className="muted" style={{ fontWeight: 600 }}>(opsiyonel)</span></label><input className="input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05XX XXX XX XX" /></div>
          <div className="field" style={{ marginBottom: 13 }}><label className="label">Şifre</label><input className="input" type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="En az 6 karakter" />{pass && pass.length < 6 ? <span style={{ fontSize: 11.5, color: "var(--danger)", marginTop: 4 }}>Şifre en az 6 karakter olmalı</span> : null}</div>
          {!isCoach ? (
            <div className="field" style={{ marginBottom: 13 }}><label className="label">Koç davet kodu <span className="muted" style={{ fontWeight: 600 }}>(varsa)</span></label><input className="input" value={invite} onChange={(e) => setInvite(e.target.value)} placeholder="Örn. DILEK-2026" /></div>
          ) : null}
          <button type="button" className="row" onClick={() => setKvkk(!kvkk)} style={{ gap: 9, alignItems: "flex-start", background: "none", border: "none", textAlign: "left", cursor: "pointer", margin: "6px 0 18px", padding: 0 }}>
            <span className={`chk sm${kvkk ? " done" : ""}`} style={{ marginTop: 1 }}><Icon name="check" size={12} stroke={3} /></span>
            <span className="muted" style={{ fontSize: 12, lineHeight: 1.5 }}><b style={{ color: "var(--text)" }}>Aydınlatma metnini</b> ve <b style={{ color: "var(--text)" }}>kullanım koşullarını</b> okudum, onaylıyorum.</span>
          </button>
          <button type="button" className="btn btn-primary" style={{ width: "100%", height: 46 }} disabled={!infoValid} onClick={afterInfo}>{isCoach ? <>Plan seç<Icon name="chevronRight" size={16} /></> : <>Devam et<Icon name="chevronRight" size={16} /></>}</button>
        </>
      )}

      {/* 3 — Plan (yalnızca koç) */}
      {step === "plan" && (
        <>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.02em" }}>Planını seç</h1>
          <p className="muted" style={{ fontSize: 13.5, marginTop: 4, marginBottom: 16 }}>7 gün ücretsiz dene; istediğin zaman değiştir.</p>
          <div className="pricing-toggle-wrap" style={{ marginBottom: 16 }}>
            <div className="seg pricing-toggle">
              <button type="button" className={cycle === "monthly" ? "on" : ""} onClick={() => setCycle("monthly")}>Aylık</button>
              <button type="button" className={cycle === "annual" ? "on" : ""} onClick={() => setCycle("annual")}>Yıllık <span className="save-pill">2 ay bedava</span></button>
            </div>
          </div>
          <div className="plan-rows">
            {COACH_SIGNUP_PLANS.map((pl) => {
              const m = cycle === "annual" ? Math.round(pl.annual / 12) : pl.monthly;
              const on = pl.id === planId;
              return (
                <button type="button" key={pl.id} className={`plan-row${on ? " on" : ""}`} onClick={() => setPlanId(pl.id)}>
                  <span className="pr-radio"><Icon name="check" size={12} stroke={3} /></span>
                  <span className="plan-dot" style={{ background: pl.color }} />
                  <span>
                    <span className="pr-name">{pl.name}{pl.popular ? <span className="pr-pop">Popüler</span> : null}</span>
                    <span className="pr-sub" style={{ display: "block" }}>{pl.tagline}</span>
                  </span>
                  <span className="pr-price"><span className="pr-amt tnum">{liraFmt(m)}</span><span className="pr-per">/ay</span></span>
                </button>
              );
            })}
          </div>
          <ul className="signup-feat">
            {p.features.map((f, i) => <li key={i}><Icon name="check" size={14} stroke={2.5} style={{ color: p.color }} />{f}</li>)}
          </ul>
          <div className="between" style={{ margin: "16px 0 14px", padding: "0 2px" }}>
            <span className="muted" style={{ fontSize: 12.5 }}>{cycle === "annual" ? "Yıllık toplam" : "Aylık ücret"}</span>
            <b className="tnum" style={{ fontSize: 15 }}>{liraFmt(planAmount)}{cycle === "annual" ? <span className="muted" style={{ fontWeight: 600, fontSize: 12 }}> · {liraFmt(planMonthly)}/ay</span> : null}</b>
          </div>
          <button type="button" className="btn btn-primary" style={{ width: "100%", height: 46 }} onClick={sendCode}><Icon name="shield" size={16} />7 gün ücretsiz başla</button>
          <p className="muted" style={{ fontSize: 11, textAlign: "center", marginTop: 12, lineHeight: 1.5 }}>Deneme bitmeden iptal edersen ücret alınmaz. Ödeme bilgini panelden eklersin.</p>
        </>
      )}

      {/* 4 — Doğrulama */}
      {step === "verify" && (
        <>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.02em" }}>Kodu gir</h1>
          <p className="muted" style={{ fontSize: 13.5, marginTop: 4, marginBottom: 18 }}><b style={{ color: "var(--text)" }}>{target}</b> adresine gönderilen 6 haneli kodu yaz.</p>
          <div className="field" style={{ marginBottom: 14 }}>
            <label className="label">Doğrulama kodu</label>
            <input className="input tnum" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} placeholder="••••••" style={{ letterSpacing: ".5em", fontSize: 18, textAlign: "center", fontWeight: 700 }} />
          </div>
          <div className="between" style={{ marginBottom: 18 }}>
            <button type="button" className="link-btn" style={{ fontSize: 12.5 }} onClick={() => { if (typeof toast === "function") toast("Kod yeniden gönderildi", { icon: "refresh" }); }}>Kodu tekrar gönder</button>
            <span className="muted" style={{ fontSize: 12 }}>Demo: herhangi 6 hane</span>
          </div>
          <button type="button" className="btn btn-primary" style={{ width: "100%", height: 46 }} disabled={!codeValid} onClick={() => { setStep("done"); if (typeof toast === "function") toast("Hesabın oluşturuldu", { icon: "checkCircle" }); }}><Icon name="check" size={16} />Doğrula ve bitir</button>
        </>
      )}

      {/* 5 — Bitti */}
      {step === "done" && (
        <div style={{ textAlign: "center", padding: "6px 0" }}>
          <span className="stat-icon tone-success" style={{ width: 58, height: 58, margin: "0 auto 16px" }}><Icon name="checkCircle" size={30} /></span>
          <h1 style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-.02em" }}>Hoş geldin{name.trim() ? ", " + name.trim().split(" ")[0] : ""}! 🎉</h1>
          <p className="muted" style={{ fontSize: 13.5, marginTop: 8, marginBottom: 18, lineHeight: 1.55 }}>
            {isCoach
              ? <><b style={{ color: "var(--text)" }}>{p.name}</b> planıyla 7 günlük ücretsiz denemen başladı. Panelinden hemen öğrenci eklemeye başlayabilirsin.</>
              : <>Hesabın hazır. {invite.trim() ? <>Koç davetin işleniyor; </> : null}panelinden deneme ve ödevlerini takip etmeye başlayabilirsin.</>}
          </p>
          {isCoach ? (
            <div className="card" style={{ background: "var(--surface-2)", marginBottom: 18, textAlign: "left" }}><div className="card-pad" style={{ padding: 14 }}>
              <div className="between"><span className="row" style={{ gap: 8 }}><span className="plan-dot" style={{ background: p.color }} /><b style={{ fontSize: 13 }}>{p.name}</b></span><b className="tnum" style={{ fontSize: 13 }}>{liraFmt(planMonthly)}/ay</b></div>
              <div className="muted" style={{ fontSize: 12, marginTop: 5 }}>{p.seats === "∞" ? "Sınırsız" : p.seats} öğrenci · {cycle === "annual" ? "yıllık fatura" : "aylık fatura"} · 7 gün ücretsiz</div>
            </div></div>
          ) : null}
          <button type="button" className="btn btn-primary" style={{ width: "100%", height: 46 }} onClick={finish}><Icon name="logout" size={16} style={{ transform: "scaleX(-1)" }} />Panele gir</button>
        </div>
      )}
    </div>
  );
}

/* ---- Login ekranı ---- */
function LoginScreen({ onLogin }) {
  const [role, setRole] = useState("student");
  const [method, setMethod] = useState("email"); // email | phone
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pass, setPass] = useState("");
  const [remember, setRemember] = useState(true);
  const [view, setView] = useState("login"); // login | forgot
  const [inviteOpen, setInviteOpen] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    const u = DEMO_USERS[role];
    onLogin({ ...u, email: (method === "email" && email.trim()) || u.email, phone: (method === "phone" && phone.trim()) || u.phone, remember });
  };
  const fillDemo = () => { setEmail(DEMO_USERS[role].email); setPhone(DEMO_USERS[role].phone); setPass("demo1234"); };

  return (
    <div className="auth-wrap">
      <div className="auth-art">
        <span className="auth-orb auth-orb-1" aria-hidden="true" />
        <span className="auth-orb auth-orb-2" aria-hidden="true" />
        <div className="auth-grid" aria-hidden="true" />

        <div className="auth-art-inner">
          {/* marka */}
          <div className="auth-brand">
            <span className="auth-logo"><UKLogoGlyph size={27} /></span>
            <div className="auth-brand-text">
              <b>Uyanık Koç</b>
              <span>Akıllı koçluk platformu</span>
            </div>
          </div>

          {/* ürün önizleme sahnesi */}
          <div className="auth-stage" aria-hidden="true">
            <div className="auth-pcard auth-pcard-main">
              <div className="ap-head">
                <div>
                  <div className="ap-kicker">Deneme net gelişimi</div>
                  <div className="ap-val">147,5<span> net</span></div>
                </div>
                <span className="ap-delta"><Icon name="arrowUp" size={13} stroke={2.6} />+53</span>
              </div>
              <div className="ap-spark"><Sparkline data={[58, 64, 71, 69, 82, 96, 110, 121, 147]} color="#ffffff" h={64} w={300} /></div>
              <div className="ap-axis"><span>Eyl</span><span>Kas</span><span>Oca</span><span>Mar</span><span>May</span></div>
            </div>

            <div className="auth-pcard auth-pcard-ring">
              <div className="ap-ring">
                <svg viewBox="0 0 48 48">
                  <circle className="ap-ring-track" cx="24" cy="24" r="20" />
                  <circle className="ap-ring-val" cx="24" cy="24" r="20" />
                </svg>
                <b>74%</b>
              </div>
              <div className="ap-ring-lab">Konu tamamlama</div>
            </div>

            <div className="auth-pcard auth-pcard-chip">
              <span className="ap-chip-ic"><Icon name="flame" size={17} fill /></span>
              <div className="ap-chip-text">
                <b>12 gün seri</b>
                <span>Bugünün ödevleri tamam 🎉</span>
              </div>
            </div>
          </div>

          {/* alt: başlık + istatistik */}
          <div className="auth-foot">
            <h2>Hedefe giden yolu<br />birlikte planlayalım.</h2>
            <p>Koç, öğrenci ve veliyi tek ekranda buluşturan; deneme analizleri, konu takibi ve soru hedefleriyle çalışan koçluk sistemi.</p>
            <div className="auth-stats">
              {[["18", "Aktif öğrenci"], ["%74", "Ort. tamamlama"], ["+53", "Net gelişimi"]].map(([v, l]) => (
                <div className="auth-stat" key={l}><div className="tnum auth-stat-v">{v}</div><div className="auth-stat-l">{l}</div></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        {view === "signup" ? (
          <SignUpFlow onLogin={onLogin} onBack={() => setView("login")} />
        ) : view === "forgot" ? (
          <div className="auth-card">
            <ForgotFlow method={method} identifier={method === "phone" ? phone : email} onBack={() => setView("login")} onDone={() => setView("login")} />
          </div>
        ) : (
          <form className="auth-card" onSubmit={submit}>
            <div style={{ marginBottom: 20 }}>
              <h1 style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-.02em" }}>Tekrar hoş geldin 👋</h1>
              <p className="muted" style={{ fontSize: 13.5, marginTop: 4 }}>Devam etmek için giriş yap</p>
            </div>

            <div className="seg" style={{ width: "100%", marginBottom: 16 }}>
              <button type="button" className={role === "student" ? "on" : ""} style={{ flex: 1, justifyContent: "center" }} onClick={() => setRole("student")}><Icon name="cap" size={16} />Öğrenci</button>
              <button type="button" className={role === "coach" ? "on" : ""} style={{ flex: 1, justifyContent: "center" }} onClick={() => setRole("coach")}><Icon name="users" size={16} />Koç</button>
              <button type="button" className={role === "parent" ? "on" : ""} style={{ flex: 1, justifyContent: "center" }} onClick={() => setRole("parent")}><Icon name="heart" size={16} />Veli</button>
            </div>

            {/* giriş yöntemi: e-posta / telefon */}
            <div className="auth-method">
              <button type="button" className={`auth-method-tab${method === "email" ? " on" : ""}`} onClick={() => setMethod("email")}><Icon name="message" size={15} />E-posta</button>
              <button type="button" className={`auth-method-tab${method === "phone" ? " on" : ""}`} onClick={() => setMethod("phone")}><Icon name="phone" size={15} />Telefon</button>
            </div>

            {method === "email" ? (
              <div className="field" style={{ marginBottom: 14 }}>
                <label className="label">E-posta</label>
                <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={DEMO_USERS[role].email} />
              </div>
            ) : (
              <div className="field" style={{ marginBottom: 14 }}>
                <label className="label">Telefon</label>
                <input className="input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={DEMO_USERS[role].phone} />
              </div>
            )}
            <div className="field" style={{ marginBottom: 14 }}>
              <label className="label">Şifre</label>
              <input className="input" type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="••••••••" />
            </div>
            <div className="between" style={{ marginBottom: 20 }}>
              <button type="button" className="row" style={{ gap: 8, background: "none", border: "none", color: "var(--text-2)", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }} onClick={() => setRemember(!remember)}>
                <span className={`chk sm${remember ? " done" : ""}`}><Icon name="check" size={12} stroke={3} /></span>Beni hatırla
              </button>
              <button type="button" className="link-btn" style={{ whiteSpace: "nowrap" }} onClick={() => setView("forgot")}>Şifremi unuttum</button>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%", height: 46 }}><Icon name="logout" size={17} style={{ transform: "scaleX(-1)" }} />Giriş Yap</button>

            <div className="muted" style={{ fontSize: 12.5, textAlign: "center", marginTop: 20 }}>
              Hesabın yok mu? <button type="button" className="link-btn" style={{ display: "inline", fontWeight: 800 }} onClick={() => setView("signup")}>Üye ol</button>
            </div>
            <div className="muted" style={{ fontSize: 11.5, textAlign: "center", marginTop: 7 }}>
              Kurumun mu var? <button type="button" className="link-btn" style={{ display: "inline" }} onClick={() => setInviteOpen(true)}>Kurumundan davet iste</button>
            </div>
          </form>
        )}
      </div>
      {inviteOpen ? <RequestInviteModal onClose={() => setInviteOpen(false)} /> : null}
    </div>
  );
}

/* ---- Profil sayfası ---- */
function ProfilePage({ auth, role, onLogout, theme, setTheme }) {
  const isCoach = role === "coach";
  const u = auth || DEMO_USERS[role];
  const aKey = meKey(u);
  const [name, setName] = useState(u.name);
  const [email, setEmail] = useState(u.email);
  const [phone, setPhone] = useState(u.phone || (isCoach ? "0532 000 00 00" : "0533 000 00 00"));
  const [saved, setSaved] = useState(false);
  const [notif, setNotif] = useState(() => { try { return localStorage.getItem("uk_pref_notif") !== "0"; } catch (e) { return true; } });
  const toggleNotif = () => setNotif((v) => { const nv = !v; try { localStorage.setItem("uk_pref_notif", nv ? "1" : "0"); } catch (e) {} if (typeof toast === "function") toast(nv ? "Bildirimler açıldı" : "Bildirimler kapatıldı", { icon: "bell" }); return nv; });
  const save = () => { setSaved(true); if (typeof toast === "function") toast("Profil güncellendi", { icon: "checkCircle" }); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="stack rise">
      <PageHead title="Profil" sub="Hesap bilgilerin ve tercihlerin" />

      <div className="grid col-rail">
        {/* sol kart */}
        <div className="card" style={{ alignSelf: "start", overflow: "hidden" }}>
          <div style={{ height: 84, background: "linear-gradient(135deg, var(--primary), var(--primary-700))" }} />
          <div className="card-pad" style={{ paddingTop: 0, textAlign: "center" }}>
            <div style={{ marginTop: -38, display: "flex", justifyContent: "center" }}>
              <div style={{ border: "4px solid var(--surface)", borderRadius: "50%" }}><Avatar name={name} size={76} avatarKey={aKey} /></div>
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, marginTop: 10 }}>{name}</div>
            <div className="muted" style={{ fontSize: 12.5 }}>{u.sub}</div>
            <div className="row" style={{ justifyContent: "center", marginTop: 10 }}>
              <Badge tone={isCoach ? "primary" : "success"} icon={isCoach ? "users" : "cap"}>{isCoach ? "Koç" : role === "parent" ? "Veli" : "Öğrenci"}</Badge>
            </div>
            <hr className="hr" style={{ margin: "16px 0" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 12, textAlign: "left" }}>
              {(isCoach
                ? [["users", "18 öğrenci"], ["target", "%74 ort. tamamlama"], ["calendar", "Üye: Eyl 2024"]]
                : [["cap", "11. Sınıf · Sayısal"], ["target", "Hedef: YKS 2026"], ["flame", "12 gün seri"]]
              ).map(([ic, t]) => (
                <div className="row" key={t} style={{ gap: 10, fontSize: 13, alignItems: "center" }}><Icon name={ic} size={16} style={{ color: "var(--muted)", flexShrink: 0 }} /><span style={{ fontWeight: 600 }}>{t}</span></div>
              ))}
            </div>
          </div>
        </div>

        {/* sağ: profil resmi + form + tercihler */}
        <div className="stack">
          <Section title="Profil Fotoğrafı" sub="Hazır bir ikon seç ya da kendi fotoğrafını yükle">
            <div className="card-body"><AvatarPicker name={name} avatarKey={aKey} /></div>
          </Section>

          <Section title="Hesap Bilgileri" action={<button className="btn btn-primary btn-sm" onClick={save}><Icon name={saved ? "check" : "settings"} size={15} />{saved ? "Kaydedildi" : "Kaydet"}</button>}>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="grid g-2" style={{ gap: 12 }}>
                <div className="field"><label className="label">Ad Soyad</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></div>
                <div className="field"><label className="label">Telefon</label><input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
              </div>
              <div className="field"><label className="label">E-posta</label><input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              {!isCoach ? <div className="field"><label className="label">Koç</label><input className="input" value="Dilek Emen" disabled /></div> : null}
            </div>
          </Section>

          <Section title="Tercihler">
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div className="between" style={{ padding: "10px 0" }}>
                <div className="row" style={{ gap: 12 }}><span className="lr-icon" style={{ width: 38, height: 38, background: "var(--surface-3)" }}><Icon name={theme === "dark" ? "moon" : "sun"} size={18} /></span><div><div style={{ fontSize: 13.5, fontWeight: 700 }}>Koyu tema</div><div className="muted" style={{ fontSize: 12 }}>Göz yorgunluğunu azalt</div></div></div>
                <button type="button" className={`switch${theme === "dark" ? " on" : ""}`} onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Tema"><span /></button>
              </div>
              <hr className="hr" />
              <div className="between" style={{ padding: "10px 0" }}>
                <div className="row" style={{ gap: 12 }}><span className="lr-icon" style={{ width: 38, height: 38, background: "var(--surface-3)" }}><Icon name="bell" size={18} /></span><div><div style={{ fontSize: 13.5, fontWeight: 700 }}>Bildirimler</div><div className="muted" style={{ fontSize: 12 }}>Ödev ve deneme hatırlatmaları</div></div></div>
                <button type="button" className={`switch${notif ? " on" : ""}`} onClick={toggleNotif} aria-label="Bildirimler"><span /></button>
              </div>
            </div>
          </Section>

          <Section title="Hesap">
            <div className="card-body">
              <button className="btn btn-light" style={{ width: "100%", color: "var(--danger)", justifyContent: "center" }} onClick={onLogout}>
                <Icon name="logout" size={17} />Çıkış Yap
              </button>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { loadAuth, saveAuth, meKey, DEMO_USERS, LoginScreen, ProfilePage });
