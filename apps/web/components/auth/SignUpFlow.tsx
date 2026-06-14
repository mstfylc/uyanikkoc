"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { KiIcon } from "@/components/design/KiIcon";
import { UkLogoGlyph } from "@/components/design/UkLogo";

type SignUpRole = "student" | "coach";

type Step = "role" | "info" | "plan" | "verify" | "done";

export function SignUpFlow() {
  const [step, setStep] = useState<Step>("role");
  const [role, setRole] = useState<SignUpRole>("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [plan, setPlan] = useState("pro");
  const [code, setCode] = useState("");

  function handleInfoSubmit(event: FormEvent) {
    event.preventDefault();
    if (role === "coach") {
      setStep("plan");
      return;
    }
    setStep("verify");
  }

  return (
    <div className="auth-wrap">
      <div className="auth-art">
        <div className="auth-art-inner">
          <div className="row" style={{ gap: 12 }}>
            <span className="logo-mark" style={{ width: 44, height: 44, borderRadius: 13 }}>
              <UkLogoGlyph size={24} className="text-white" />
            </span>
            <div className="logo-text">
              <b style={{ fontSize: 19, color: "#fff" }}>Uyanık Koç</b>
              <span style={{ color: "rgba(255,255,255,.7)" }}>Hesap oluştur</span>
            </div>
          </div>
          <div style={{ marginTop: "auto" }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-.02em", lineHeight: 1.2 }}>
              Dakikalar icinde basla.
            </h2>
            <p style={{ fontSize: 14.5, color: "rgba(255,255,255,.8)", marginTop: 14, maxWidth: 420, lineHeight: 1.6 }}>
              Öğrenci veya bireysel koç olarak kayıt ol. Demo ortamda kod doğrulama herhangi 6 hane ile çalışır.
            </p>
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          {step === "role" ? (
            <>
              <h1 style={{ fontSize: 23, fontWeight: 800, marginBottom: 16 }}>Rolünü seç</h1>
              <div className="seg" style={{ width: "100%", marginBottom: 18 }}>
                {(["student", "coach"] as SignUpRole[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={role === item ? "on" : ""}
                    style={{ flex: 1, justifyContent: "center" }}
                    onClick={() => setRole(item)}
                  >
                    {item === "student" ? "Öğrenci" : "Bireysel Koç"}
                  </button>
                ))}
              </div>
              <button type="button" className="btn btn-primary" style={{ width: "100%", height: 46 }} onClick={() => setStep("info")}>
                Devam et
              </button>
            </>
          ) : null}

          {step === "info" ? (
            <form onSubmit={handleInfoSubmit}>
              <h1 style={{ fontSize: 23, fontWeight: 800, marginBottom: 16 }}>Bilgilerin</h1>
              <div className="field" style={{ marginBottom: 12 }}>
                <label className="label">Ad Soyad</label>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="field" style={{ marginBottom: 12 }}>
                <label className="label">E-posta</label>
                <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="field" style={{ marginBottom: 12 }}>
                <label className="label">Telefon</label>
                <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
              <div className="field" style={{ marginBottom: 16 }}>
                <label className="label">Şifre</label>
                <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
              </div>
              <div className="row" style={{ gap: 10 }}>
                <button type="button" className="btn btn-light" onClick={() => setStep("role")}>Geri</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Devam et</button>
              </div>
            </form>
          ) : null}

          {step === "plan" ? (
            <>
              <h1 style={{ fontSize: 23, fontWeight: 800, marginBottom: 16 }}>Koç planı seç</h1>
              <div className="stack" style={{ gap: 10, marginBottom: 16 }}>
                {[
                  { id: "starter", name: "Baslangic", price: "990 TL/ay" },
                  { id: "pro", name: "Pro", price: "1.490 TL/ay" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`plan-card${plan === item.id ? " popular" : ""}`}
                    style={{ textAlign: "left", cursor: "pointer" }}
                    onClick={() => setPlan(item.id)}
                  >
                    <b>{item.name}</b>
                    <div className="muted" style={{ fontSize: 12 }}>{item.price}</div>
                  </button>
                ))}
              </div>
              <div className="row" style={{ gap: 10 }}>
                <button type="button" className="btn btn-light" onClick={() => setStep("info")}>Geri</button>
                <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={() => setStep("verify")}>Devam et</button>
              </div>
            </>
          ) : null}

          {step === "verify" ? (
            <>
              <h1 style={{ fontSize: 23, fontWeight: 800, marginBottom: 8 }}>Kod doğrulama</h1>
              <p className="muted" style={{ fontSize: 13, marginBottom: 16 }}>{email || phone} adresine kod gönderildi (demo).</p>
              <input
                className="input tnum"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="6 haneli kod"
                style={{ letterSpacing: ".35em", textAlign: "center", fontWeight: 700, marginBottom: 16 }}
              />
              <div className="row" style={{ gap: 10 }}>
                <button type="button" className="btn btn-light" onClick={() => setStep(role === "coach" ? "plan" : "info")}>Geri</button>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={code.length < 6}
                  onClick={() => setStep("done")}
                >
                  Dogrula
                </button>
              </div>
            </>
          ) : null}

          {step === "done" ? (
            <div style={{ textAlign: "center" }}>
              <span className="stat-icon tone-success" style={{ width: 56, height: 56, margin: "0 auto 14px" }}>
                <KiIcon name="ki-check" size={28} />
              </span>
              <h1 style={{ fontSize: 23, fontWeight: 800 }}>Hesabın hazır</h1>
              <p className="muted" style={{ fontSize: 13.5, margin: "8px 0 18px" }}>
                Demo ortamda kayıt tamamlandı. Giriş yaparak devam edebilirsin.
              </p>
              <Link href="/login" className="btn btn-primary" style={{ width: "100%", height: 46, display: "inline-flex", justifyContent: "center" }}>
                Giriş yap
              </Link>
            </div>
          ) : null}

          {step !== "done" ? (
            <div className="muted" style={{ fontSize: 12, textAlign: "center", marginTop: 20 }}>
              Zaten hesabın var mı? <Link href="/login" className="link-btn">Giriş yap</Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
