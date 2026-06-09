"use client";

import { KiIcon } from "@/components/design/KiIcon";
import { UkSparkline } from "@/components/design/UkSparkline";
import { yonetimLoginRoleHint } from "@/lib/rbac";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

type DemoRole = "student" | "coach" | "parent" | "admin" | "branch";

const DEMO_BY_ROLE: Record<DemoRole, { email: string; password: string; label: string }> = {
  student: { email: "student@uyanik.local", password: "uyanik123", label: "Ogrenci" },
  coach: { email: "coach@uyanik.local", password: "uyanik123", label: "Koc" },
  parent: { email: "parent@uyanik.local", password: "uyanik123", label: "Veli" },
  admin: { email: "admin@uyanik.local", password: "uyanik123", label: "Super Admin" },
  branch: { email: "branch@uyanik.local", password: "uyanik123", label: "Kurum" },
};

const DEMO_ROLE_ICON: Record<DemoRole, string> = {
  student: "ki-book",
  coach: "ki-people",
  parent: "ki-heart",
  admin: "ki-shield-tick",
  branch: "ki-office-bag",
};

const DEMO_LOGIN_ENABLED = process.env.NODE_ENV !== "production";

function resolveDemoRole(nextPath: string, roleParam: string | null): DemoRole {
  return yonetimLoginRoleHint(nextPath, roleParam) ?? "student";
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const nextPath = searchParams?.get("next") ?? "/post-login";
  const roleParam = searchParams?.get("role") ?? null;
  const initialRole = useMemo(() => resolveDemoRole(nextPath, roleParam), [nextPath, roleParam]);
  const initialDemo = DEMO_BY_ROLE[initialRole];
  const yonetimHint = yonetimLoginRoleHint(nextPath, roleParam);

  const [demoRole, setDemoRole] = useState<DemoRole>(initialRole);
  const [email, setEmail] = useState(DEMO_LOGIN_ENABLED && yonetimHint ? initialDemo.email : "");
  const [password, setPassword] = useState(DEMO_LOGIN_ENABLED && yonetimHint ? initialDemo.password : "");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetSubmitting, setIsResetSubmitting] = useState(false);

  useEffect(() => {
    const role = resolveDemoRole(nextPath, roleParam);
    const hint = yonetimLoginRoleHint(nextPath, roleParam);
    setDemoRole(role);
    if (DEMO_LOGIN_ENABLED && hint) {
      setEmail(DEMO_BY_ROLE[role].email);
      setPassword(DEMO_BY_ROLE[role].password);
    }
  }, [nextPath, roleParam]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsSubmitting(false);

    if (!result || result.error || result.ok === false) {
      setError("E-posta veya sifre hatali.");
      return;
    }

    window.location.assign(nextPath);
  }

  function selectDemoRole(role: DemoRole) {
    setDemoRole(role);
    const demo = DEMO_BY_ROLE[role];
    setEmail(demo.email);
    setPassword(demo.password);
  }

  async function requestReset() {
    setError(null);
    setResetMessage(null);
    setResetUrl(null);
    const resetEmail = email.trim();
    if (!resetEmail) {
      setError("Sifre sifirlama icin e-posta adresini gir.");
      return;
    }

    setIsResetSubmitting(true);
    const response = await fetch("/api/auth/password-reset/request", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: resetEmail }),
    });
    setIsResetSubmitting(false);

    const data = (await response.json().catch(() => ({}))) as {
      error?: string;
      message?: string;
      resetUrl?: string;
    };

    if (!response.ok) {
      setError(data.error ?? "Sifre sifirlama talebi olusturulamadi.");
      return;
    }

    setResetMessage(data.message ?? "Sifre sifirlama talebi olusturuldu.");
    setResetUrl(data.resetUrl ?? null);
  }

  return (
    <div className="auth-wrap">
      <div className="auth-art">
        <span className="auth-orb auth-orb-1" aria-hidden="true" />
        <span className="auth-orb auth-orb-2" aria-hidden="true" />
        <div className="auth-grid" aria-hidden="true" />

        <div className="auth-art-inner">
          <div className="auth-brand">
            <span className="auth-logo">
              <KiIcon name="ki-flash text-white text-xl" size={27} />
            </span>
            <div className="auth-brand-text">
              <b>Uyanik Koc</b>
              <span>Akilli kocluk platformu</span>
            </div>
          </div>

          <div className="auth-stage" aria-hidden="true">
            <div className="auth-pcard auth-pcard-main">
              <div className="ap-head">
                <div>
                  <div className="ap-kicker">Deneme net gelisimi</div>
                  <div className="ap-val">
                    147,5<span> net</span>
                  </div>
                </div>
                <span className="ap-delta">
                  <KiIcon name="ki-arrow-up" size={13} />
                  +53
                </span>
              </div>
              <div className="ap-spark">
                <UkSparkline data={[58, 64, 71, 69, 82, 96, 110, 121, 147]} color="#ffffff" height={64} width={300} />
              </div>
              <div className="ap-axis">
                <span>Eyl</span>
                <span>Kas</span>
                <span>Oca</span>
                <span>Mar</span>
                <span>May</span>
              </div>
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
              <span className="ap-chip-ic">
                <KiIcon name="ki-flame" size={17} />
              </span>
              <div className="ap-chip-text">
                <b>12 gun seri</b>
                <span>Bugunun odevleri tamam</span>
              </div>
            </div>
          </div>

          <div className="auth-foot">
            <h2>
              Hedefe giden yolu
              <br />
              birlikte planlayalim.
            </h2>
            <p>
              Koc, ogrenci ve veliyi tek ekranda bulusturan; deneme analizleri, konu takibi ve soru
              hedefleriyle calisan kocluk sistemi.
            </p>
            <div className="auth-stats">
              {[
                ["18", "Aktif ogrenci"],
                ["%74", "Ort. tamamlama"],
                ["+53", "Net gelisimi"],
              ].map(([value, label]) => (
                <div className="auth-stat" key={label}>
                  <div className="tnum auth-stat-v">{value}</div>
                  <div className="auth-stat-l">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <form className="auth-card" onSubmit={handleSubmit}>
          <div style={{ marginBottom: 22 }}>
            <h1 style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-.02em" }}>Tekrar hos geldin 👋</h1>
            <p className="muted" style={{ fontSize: 13.5, marginTop: 4 }}>
              Devam etmek icin giris yap
            </p>
          </div>

          {yonetimHint ? (
            <div
              className="alert-strip"
              style={{ marginBottom: 14, background: "var(--primary-soft)", borderColor: "var(--primary)" }}
            >
              <span className="as-ic" style={{ background: "var(--primary)", color: "#fff" }}>
                <KiIcon name="ki-shield-tick" size={14} />
              </span>
              <div style={{ flex: 1, fontSize: 12.5, lineHeight: 1.5 }}>
                <b>Yonetim paneli girisi.</b>{" "}
                {yonetimHint === "admin"
                  ? DEMO_LOGIN_ENABLED
                    ? "Super Admin hesabi secildi (admin@uyanik.local)."
                    : "Super Admin hesabinla giris yap."
                  : DEMO_LOGIN_ENABLED
                    ? "Kurum yoneticisi hesabi secildi (branch@uyanik.local)."
                    : "Kurum yoneticisi hesabinla giris yap."}
              </div>
            </div>
          ) : null}

          {DEMO_LOGIN_ENABLED ? (
            <div className="seg" style={{ width: "100%", marginBottom: 18, flexWrap: "wrap" }}>
              {(["student", "coach", "parent", "admin", "branch"] as DemoRole[]).map((role) => (
                <button
                  key={role}
                  type="button"
                  className={demoRole === role ? "on" : ""}
                  style={{ flex: "1 1 auto", minWidth: 88, justifyContent: "center" }}
                  onClick={() => selectDemoRole(role)}
                >
                  <KiIcon name={DEMO_ROLE_ICON[role]} />
                  {DEMO_BY_ROLE[role].label}
                </button>
              ))}
            </div>
          ) : null}

          <div className="field" style={{ marginBottom: 14 }}>
            <label className="label" htmlFor="email">
              E-posta
            </label>
            <input
              id="email"
              name="email"
              className="input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={DEMO_LOGIN_ENABLED ? DEMO_BY_ROLE[demoRole].email : "ornek@uyanikkoc.com"}
              required
            />
          </div>

          <div className="field" style={{ marginBottom: 14 }}>
            <label className="label" htmlFor="password">
              Sifre
            </label>
            <input
              id="password"
              name="password"
              className="input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="between" style={{ marginBottom: 20 }}>
            <button
              type="button"
              className="row"
              style={{
                gap: 8,
                background: "none",
                border: "none",
                color: "var(--text-2)",
                fontSize: 12.5,
                fontWeight: 600,
              }}
              onClick={() => setRemember(!remember)}
            >
              <span className={`chk sm${remember ? " done" : ""}`}>
                <KiIcon name="ki-check text-xs" />
              </span>
              Beni hatirla
            </button>
            <button
              type="button"
              className="link-btn"
              onClick={requestReset}
              disabled={isResetSubmitting}
            >
              {isResetSubmitting ? "Gonderiliyor..." : "Sifremi unuttum"}
            </button>
          </div>

          {error ? (
            <div className="badge badge-danger" style={{ marginBottom: 14, height: "auto", padding: "10px 12px" }}>
              {error}
            </div>
          ) : null}

          {resetMessage ? (
            <div className="badge badge-success" style={{ marginBottom: 14, height: "auto", padding: "10px 12px", display: "block" }}>
              {resetMessage}
              {resetUrl ? (
                <>
                  {" "}
                  <a href={resetUrl} className="link-btn">
                    Sifreyi yenile
                  </a>
                </>
              ) : null}
            </div>
          ) : null}

          <button type="submit" className="btn btn-primary" style={{ width: "100%", height: 46 }} disabled={isSubmitting}>
            <KiIcon name="ki-entrance-right" />
            {isSubmitting ? "Giris yapiliyor..." : "Giris Yap"}
          </button>

          <div className="muted" style={{ fontSize: 12, textAlign: "center", marginTop: 20 }}>
            Hesabin yok mu?{" "}
            <a href="/register" className="link-btn" style={{ display: "inline" }}>
              Uye ol
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
