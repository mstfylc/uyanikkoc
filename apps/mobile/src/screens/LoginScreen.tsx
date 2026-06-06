/* GİRİŞ — telefon + SMS OTP (ana) / e-posta (alternatif).
 * Gerçek akış: useSession().requestOtp / verifyOtp / loginEmail.
 * USE_MOCK=true iken iç-süreç mock backend yanıt verir (herhangi 6 haneli kod geçer). */
import { useEffect, useRef, useState } from "react";
import { MIcon } from "../ui/MIcon";
import { UKMark } from "../ui/UKMark";
import { useSession } from "../lib/session";
import { ApiError } from "../lib/api-error";

type Mode = "phone" | "email";
type Step = "enter" | "otp";

function fmtPhone(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 10);
  const p: string[] = [];
  if (d.length > 0) p.push(d.slice(0, 3));
  if (d.length > 3) p.push(d.slice(3, 6));
  if (d.length > 6) p.push(d.slice(6, 8));
  if (d.length > 8) p.push(d.slice(8, 10));
  return p.join(" ");
}

function errText(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  return "Bir şeyler ters gitti. Tekrar dene.";
}

export function LoginScreen() {
  const { requestOtp, verifyOtp, loginEmail } = useSession();
  const [mode, setMode] = useState<Mode>("phone");
  const [step, setStep] = useState<Step>("enter");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const otpRef = useRef<HTMLInputElement>(null);

  const phoneValid = phone.replace(/\D/g, "").length >= 10;
  const emailValid = /\S+@\S+\.\S+/.test(email) && pass.length >= 4;

  useEffect(() => {
    if (step === "otp") otpRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const iv = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(iv);
  }, [resendIn]);

  const sendOtp = async () => {
    setBusy(true);
    setError(null);
    try {
      const { resendInMs } = await requestOtp(phone);
      setCode("");
      setStep("otp");
      setResendIn(Math.round(resendInMs / 1000));
    } catch (err) {
      setError(errText(err));
    } finally {
      setBusy(false);
    }
  };

  const submitOtp = async (value: string) => {
    setBusy(true);
    setError(null);
    try {
      await verifyOtp(phone, value);
      // başarı → SessionProvider status'u "authed" yapar, App yeniden çizer
    } catch (err) {
      setError(errText(err));
      setCode("");
      otpRef.current?.focus();
    } finally {
      setBusy(false);
    }
  };

  const doEmail = async () => {
    setBusy(true);
    setError(null);
    try {
      await loginEmail(email, pass);
    } catch (err) {
      setError(errText(err));
    } finally {
      setBusy(false);
    }
  };

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
        <p>{step === "otp" ? `+90 ${fmtPhone(phone)} numarasına kod gönderildi` : "Koçunla, ödevlerinle ve denemelerinle tek yerde."}</p>
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
            {error && <div className="uk-error">{error}</div>}
            <button className="uk-btn uk-btn-primary uk-btn-block" style={{ marginTop: 22 }} disabled={!phoneValid || busy} onClick={sendOtp}>
              {busy ? <span className="uk-spinner" /> : <><MIcon name="message" size={18} /> SMS Kodu Gönder</>}
            </button>
            <div className="uk-or">veya</div>
            <button className="uk-btn uk-btn-light uk-btn-block" disabled={busy} onClick={() => { setMode("email"); setError(null); }}>
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
            {error && <div className="uk-error">{error}</div>}
            <button className="uk-btn uk-btn-primary uk-btn-block" style={{ marginTop: 22 }} disabled={!emailValid || busy} onClick={doEmail}>
              {busy ? <span className="uk-spinner" /> : "Giriş Yap"}
            </button>
            <div className="uk-or">veya</div>
            <button className="uk-btn uk-btn-light uk-btn-block" disabled={busy} onClick={() => { setMode("phone"); setError(null); }}>
              <MIcon name="phone" size={18} /> Telefon ile giriş
            </button>
          </div>
        )}

        {step === "otp" && (
          <div className="uk-rise">
            <div className="uk-field">
              <label>6 haneli kod</label>
              <div className="uk-otp" style={{ position: "relative" }} onClick={() => otpRef.current?.focus()}>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={`box${code[i] ? " filled" : ""}${code.length === i ? " cursor" : ""}`}>
                    {code[i] || ""}
                  </div>
                ))}
                <input
                  ref={otpRef}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  disabled={busy}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setCode(v);
                    if (v.length === 6) void submitOtp(v);
                  }}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, border: "none", background: "transparent", cursor: "pointer" }}
                />
              </div>
            </div>
            {error && <div className="uk-error">{error}</div>}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 22, color: "var(--muted)", fontSize: 13, fontWeight: 600 }}>
              {busy ? <><span className="uk-spinner" style={{ borderColor: "var(--border-strong)", borderTopColor: "var(--primary)" }} /> Doğrulanıyor…</> : <><MIcon name="clock" size={15} /> Kodu gir</>}
            </div>
            <button className="uk-btn uk-btn-light uk-btn-block" style={{ marginTop: 22 }} disabled={busy || resendIn > 0} onClick={sendOtp}>
              {resendIn > 0 ? `Kodu tekrar gönder (${resendIn})` : "Kodu tekrar gönder"}
            </button>
            <button className="uk-btn uk-btn-light uk-btn-block" style={{ marginTop: 10, boxShadow: "none" }} disabled={busy} onClick={() => { setStep("enter"); setError(null); }}>
              Numarayı değiştir
            </button>
          </div>
        )}

        <div style={{ marginTop: "auto", textAlign: "center", fontSize: 11.5, color: "var(--faint)", fontWeight: 600, paddingTop: 20, lineHeight: 1.5 }}>
          Devam ederek <b style={{ color: "var(--muted)" }}>Kullanım Koşulları</b> ve<br />
          <b style={{ color: "var(--muted)" }}>Gizlilik Politikası</b>'nı kabul edersin.
        </div>
      </div>
    </div>
  );
}
