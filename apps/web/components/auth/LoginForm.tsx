"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

const FEATURES = [
  "YKS ve LGS odaklı koçluk",
  "Ödev ve görev takibi",
  "Veli bildirimleri",
  "İlerleme raporları",
];

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/post-login";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      setError("E-posta veya şifre hatalı.");
      return;
    }

    router.push(nextPath);
    router.refresh();
  }

  return (
    <div className="grid lg:grid-cols-2 grow min-h-screen">
      <div
        className="hidden lg:flex flex-col justify-between p-10 xl:p-16 text-white order-1"
        style={{ background: "linear-gradient(135deg, #534AB7 0%, #3d3585 100%)" }}
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">Uyanık Koç</h1>
          <p className="text-white/80 text-sm">Uyanık Kütüphane · Akıllı koçluk platformu</p>
        </div>
        <ul className="space-y-4">
          {FEATURES.map((feature) => (
            <li key={feature} className="flex items-center gap-3 text-sm">
              <span className="flex size-6 items-center justify-center rounded-full bg-white/20">
                <i className="ki-filled ki-check text-xs" />
              </span>
              {feature}
            </li>
          ))}
        </ul>
        <p className="text-xs text-white/60">© Uyanık Kütüphane</p>
      </div>

      <div className="flex justify-center items-center p-8 lg:p-10 order-2">
        <div className="kt-card max-w-[370px] w-full">
          <form className="kt-card-content flex flex-col gap-5 p-10" onSubmit={handleSubmit}>
            <div className="text-center mb-2.5">
              <h3 className="text-lg font-medium text-mono leading-none mb-2.5">Giriş Yap</h3>
              <p className="text-sm text-secondary-foreground">Uyanık Koç hesabınızla devam edin</p>
            </div>

            <div className="flex flex-col gap-1">
              <label className="kt-form-label font-normal text-mono" htmlFor="email">
                E-posta
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className="kt-input"
                placeholder="ornek@uyanik.local"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="kt-form-label font-normal text-mono" htmlFor="password">
                Şifre
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                className="kt-input"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            {error ? (
              <div className="kt-alert kt-alert-danger text-sm" role="alert">
                {error}
              </div>
            ) : null}

            <button type="submit" className="kt-btn kt-btn-primary w-full" disabled={isSubmitting}>
              {isSubmitting ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>

            <p className="text-xs text-center text-muted-foreground">
              Demo: coach@uyanik.local / uyanik123
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
