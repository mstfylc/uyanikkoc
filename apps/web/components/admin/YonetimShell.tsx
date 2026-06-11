"use client";

import type { AppRole } from "@uyanik/tokens";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect } from "react";

import { AdminStoreProvider } from "@/components/admin/AdminStore";
import { AppLayout } from "@/components/layout/AppLayout";
import { loginHrefForPath } from "@/lib/rbac";

export function YonetimShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const path = pathname ?? "/yonetim/dashboard";
  const needSuperAdmin = searchParams?.get("need") === "superadmin";
  const needBranch = searchParams?.get("need") === "branch";
  const needCoach = searchParams?.get("need") === "coach";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(loginHrefForPath(path));
    }
  }, [status, path, router]);

  if (status === "loading") {
    return <div className="card card-pad muted" style={{ margin: 24 }}>Yükleniyor...</div>;
  }

  if (status === "unauthenticated") {
    return null;
  }

  const userRole = session?.user?.role;
  if (userRole !== "admin" && userRole !== "branch" && userRole !== "coach") {
    return (
      <div className="card card-pad stack" style={{ margin: 24, maxWidth: 520, gap: 12 }}>
        <b style={{ fontSize: 16 }}>Yönetim paneline erişim yok</b>
        <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.55 }}>
          Bu alan yalnızca Super Admin, Kurum yöneticisi veya Koç hesapları içindir.
        </p>
        <div className="alert-strip" style={{ background: "var(--surface-2)" }}>
          <div style={{ fontSize: 12.5, lineHeight: 1.6 }}>
            <div><b>Super Admin</b> - admin@uyanik.local</div>
            <div><b>Kurum</b> - branch@uyanik.local</div>
            <div><b>Koç</b> - coach@uyanik.local</div>
            <div className="muted">Şifre: uyanik123</div>
          </div>
        </div>
        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <Link href={loginHrefForPath(path, "admin")} className="btn btn-primary">
            Super Admin ile giriş
          </Link>
          <Link href={loginHrefForPath(path, "branch")} className="btn btn-light">
            Kurum ile giriş
          </Link>
          <Link href={loginHrefForPath("/yonetim/dashboard", "coach")} className="btn btn-light">
            Koç ile giriş
          </Link>
        </div>
      </div>
    );
  }

  const role: AppRole = userRole;

  return (
    <AppLayout role={role}>
      <AdminStoreProvider>
        {needSuperAdmin && userRole === "branch" ? (
          <div
            className="alert-strip"
            style={{ marginBottom: 16, background: "var(--warning-soft)", borderColor: "var(--warning)" }}
          >
            <span className="as-ic" style={{ background: "var(--warning)", color: "#fff" }}>
              !
            </span>
            <div style={{ flex: 1, fontSize: 13 }}>
              <b>Bu sayfa Super Admin içindir.</b> Kurum hesabıyla erişemezsiniz.
            </div>
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={() => void signOut({ callbackUrl: loginHrefForPath("/yonetim/dashboard", "admin") })}
            >
              Super Admin ile gir
            </button>
          </div>
        ) : null}
        {needBranch && userRole === "admin" ? (
          <div
            className="alert-strip"
            style={{ marginBottom: 16, background: "var(--info-soft)", borderColor: "var(--info)" }}
          >
            <span className="as-ic" style={{ background: "var(--info)", color: "#fff" }}>
              i
            </span>
            <div style={{ flex: 1, fontSize: 13 }}>
              <b>Bu sayfa Kurum yöneticisi içindir.</b> Super Admin hesabıyla erişemezsiniz.
            </div>
            <button
              type="button"
              className="btn btn-sm btn-light"
              onClick={() => void signOut({ callbackUrl: loginHrefForPath("/yonetim/dashboard", "branch") })}
            >
              Kurum ile gir
            </button>
          </div>
        ) : null}
        {needCoach && userRole === "coach" ? (
          <div
            className="alert-strip"
            style={{ marginBottom: 16, background: "var(--info-soft)", borderColor: "var(--info)" }}
          >
            <span className="as-ic" style={{ background: "var(--info)", color: "#fff" }}>
              i
            </span>
            <div style={{ flex: 1, fontSize: 13 }}>
              <b>Koç yönetim alanı lisans ve kontrol ekranıyla sınırlıdır.</b>
            </div>
          </div>
        ) : null}
        {children}
      </AdminStoreProvider>
    </AppLayout>
  );
}
