"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

type DemoRole = "student" | "coach" | "parent";

const DEMO_BY_ROLE: Record<DemoRole, { email: string; password: string }> = {
  student: { email: "student@uyanik.local", password: "uyanik123" },
  coach: { email: "coach@uyanik.local", password: "uyanik123" },
  parent: { email: "parent@uyanik.local", password: "uyanik123" },
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/post-login";

  const [demoRole, setDemoRole] = useState<DemoRole>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    if (result?.error) {
      setError("E-posta veya sifre hatali.");
      return;
    }

    router.push(nextPath);
    router.refresh();
  }

  function fillDemo() {
    const demo = DEMO_BY_ROLE[demoRole];
    setEmail(demo.email);
    setPassword(demo.password);
  }

  return (
    <div className="auth-wrap">
      <div className="auth-art">
        <div className="auth-art-inner">
          <div className="row" style={{ gap: 12 }}>
            <span className="logo-mark" style={{ width: 44, height: 44, borderRadius: 13 }}>
              <i className="ki-filled ki-flash text-white text-xl" />
            </span>
            <div className="logo-text">
              <b style={{ fontSize: 19, color: "#fff" }}>Uyanik Koc</b>
              <span style={{ color: "rgba(255,255,255,.7)" }}>Akilli kocluk platformu</span>
            </div>
          </div>
          <div style={{ marginTop: "auto" }}>
            <h2 style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-.02em", lineHeight: 1.18 }}>
              Hedefe giden yolu
              <br />
              birlikte planlayalim.
            </h2>
            <p
              style={{
                fontSize: 14.5,
                color: "rgba(255,255,255,.8)",
                marginTop: 14,
                maxWidth: 420,
                lineHeight: 1.6,
              }}
            >
              Koc, ogrenci ve veliyi tek ekranda bulusturan; deneme analizleri, konu takibi ve odev
              takibi ile calisan kocluk sistemi.
            </p>
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <form className="auth-card" onSubmit={handleSubmit}>
          <div style={{ marginBottom: 22 }}>
            <h1 style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-.02em" }}>Tekrar hos geldin</h1>
            <p className="muted" style={{ fontSize: 13.5, marginTop: 4 }}>
              Devam etmek icin giris yap
            </p>
          </div>

          <div className="seg" style={{ width: "100%", marginBottom: 18 }}>
            {(["student", "coach", "parent"] as DemoRole[]).map((role) => (
              <button
                key={role}
                type="button"
                className={demoRole === role ? "on" : ""}
                style={{ flex: 1, justifyContent: "center" }}
                onClick={() => setDemoRole(role)}
              >
                <i className={`ki-filled ${role === "student" ? "ki-book" : role === "coach" ? "ki-people" : "ki-heart"}`} />
                {role === "student" ? "Ogrenci" : role === "coach" ? "Koc" : "Veli"}
              </button>
            ))}
          </div>

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
              placeholder={DEMO_BY_ROLE[demoRole].email}
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
                <i className="ki-filled ki-check text-xs" />
              </span>
              Beni hatirla
            </button>
          </div>

          {error ? (
            <div className="badge badge-danger" style={{ marginBottom: 14, height: "auto", padding: "10px 12px" }}>
              {error}
            </div>
          ) : null}

          <button type="submit" className="btn btn-primary" style={{ width: "100%", height: 46 }} disabled={isSubmitting}>
            <i className="ki-filled ki-entrance-right" />
            {isSubmitting ? "Giris yapiliyor..." : "Giris Yap"}
          </button>

          <button type="button" className="btn btn-light" style={{ width: "100%", marginTop: 10 }} onClick={fillDemo}>
            <i className="ki-filled ki-flash" />
            Demo bilgileriyle doldur
          </button>
        </form>
      </div>
    </div>
  );
}
