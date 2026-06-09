import { Suspense } from "react";

import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="muted" style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
          Giriş yükleniyor...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
