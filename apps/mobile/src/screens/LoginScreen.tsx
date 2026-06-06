/* GİRİŞ — telefon + SMS (ana) / e-posta (alternatif).
 * NOT: OTP akışı şimdilik simülasyon. Login diliminde gerçek
 * /api/auth/otp/request|verify uçlarına bağlanacak. */
import { useEffect, useState } from "react";
import { MIcon } from "../ui/MIcon";
import { UKMark } from "../ui/UKMark";

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

export function LoginScreen({ onDone }: { onDone: () => void }) {
  const [mode, setMode] = useState<Mode>("phone");
  const [step, setStep] = useState<Step>("enter");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [otp, setOtp] = useState("");

  const phoneValid = phone.replace(/\D/g, "").length >= 10;
  const emailValid = /\S+@\S+\.\S+/.test(email) && pass.length >= 4;

  // OTP otomatik dolum simülasyonu (geçici)
  useEffect(() => {
    if (step !== "otp") return;
    setOtp("");
    let n = 0;
    const seq = "428913";
    const iv = setInterval(() => {
      n++;
      setOtp(seq.slice(0, n));
      if (n >= 6) {
        clearInterval(iv);
        setTimeout(onDone, 480);
      }
    }, 320);
    return () => clearInterval(iv);
  }, [step, onDone]);

  return (
    <div className="uk-login">
      <div className="uk-login-art">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              display: "grid",
              placeItems: "center",
              background: "rgba(255,255,255,.16)",
              border: "1px solid rgba(255,255,255,.22)",
              backdropFilter: "blur(6px)",
            }}
          >
            <UKMark size={30} />
          </span>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.02em" }}>Uyanık Koç</div>
        </div>
        <h1 style={{ marginTop: 26 }}>{step === "otp" ? "Kodu doğrula" : "Hedefe giden\nyolda yanındayız"}</h1>
        <p>
          {step === "otp"
            ? `${mode === "phone" ? "+90 " + fmtPhone(phone) : email} adresine kod gönderildi`
            : "Koçunla, ödevlerinle ve denemelerinle tek yerde."}
        </p>
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
                  <div key={i} className={`box${otp[i] ? " filled" : ""}${otp.length === i ? " cursor" : ""}`}>
                    {otp[i] || ""}
                  </div>
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
          Devam ederek <b style={{ color: "var(--muted)" }}>Kullanım Koşulları</b> ve<br />
          <b style={{ color: "var(--muted)" }}>Gizlilik Politikası</b>'nı kabul edersin.
        </div>
      </div>
    </div>
  );
}
