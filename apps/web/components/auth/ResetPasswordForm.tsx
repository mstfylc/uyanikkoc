"use client";

import { KiIcon } from "@/components/design/KiIcon";
import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    const response = await fetch("/api/auth/password-reset/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    setIsSubmitting(false);

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Sifre sifirlanamadi.");
      return;
    }

    setPassword("");
    setMessage("Sifren guncellendi. Yeni sifrenle giris yapabilirsin.");
  }

  return (
    <div className="auth-wrap">
      <div className="auth-form-side" style={{ margin: "0 auto" }}>
        <form className="auth-card" onSubmit={submit}>
          <div style={{ marginBottom: 22 }}>
            <h1 style={{ fontSize: 23, fontWeight: 800 }}>Sifre sifirla</h1>
            <p className="muted" style={{ fontSize: 13.5, marginTop: 4 }}>
              Yeni sifren en az 6 karakter olmali.
            </p>
          </div>

          <div className="field" style={{ marginBottom: 14 }}>
            <label className="label" htmlFor="new-password">
              Yeni sifre
            </label>
            <input
              id="new-password"
              className="input"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              disabled={!token}
            />
          </div>

          {!token ? (
            <div className="badge badge-danger" style={{ marginBottom: 14, height: "auto", padding: "10px 12px" }}>
              Sifre sifirlama baglantisi eksik.
            </div>
          ) : null}
          {error ? (
            <div className="badge badge-danger" style={{ marginBottom: 14, height: "auto", padding: "10px 12px" }}>
              {error}
            </div>
          ) : null}
          {message ? (
            <div className="badge badge-success" style={{ marginBottom: 14, height: "auto", padding: "10px 12px" }}>
              {message}
            </div>
          ) : null}

          <button type="submit" className="btn btn-primary" style={{ width: "100%", height: 46 }} disabled={isSubmitting || !token}>
            <KiIcon name="ki-lock-2" />
            {isSubmitting ? "Guncelleniyor..." : "Sifreyi guncelle"}
          </button>

          <a href="/login" className="btn btn-light" style={{ width: "100%", marginTop: 10 }}>
            Girise don
          </a>
        </form>
      </div>
    </div>
  );
}
