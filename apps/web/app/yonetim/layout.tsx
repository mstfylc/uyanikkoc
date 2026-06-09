import "@/styles/uk-admin.css";

import { redirect } from "next/navigation";
import { Suspense } from "react";

import { auth } from "@/auth";
import { YonetimShell } from "@/components/admin/YonetimShell";
import { loginHrefForPath, ROLE_HOME_PATH } from "@/lib/rbac";

// Yonetim alani icin server-side guard (ana savunma hatti). Client guard
// (YonetimShell/useSession) tasarim ve gecisler icin korunur; ancak icerigin
// bir an flash etmesini ve JS kapaliyken baypaslanmasini onlemek icin yetki
// kontrolu sunucuda da yapilir.
export default async function YonetimLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // 1) Oturum yoksa girise yonlendir.
  if (!session?.user?.role) {
    redirect(loginHrefForPath("/yonetim/dashboard"));
  }

  // 2) Rol yonetim alanina yetkili degilse (admin/branch/coach disi) kendi
  // alanina/erisim-yok ekranina yonlendir.
  const role = session.user.role;
  if (role !== "admin" && role !== "branch" && role !== "coach") {
    redirect(ROLE_HOME_PATH[role]);
  }

  // 3) Lisans kontrolu: kullanicinin bireysel koc lisansi VEYA bagli kurumunun
  // aktif lisansi yoksa lisans/erisim-yok ekranina yonlendirilmesi gerekir.
  // Prisma semasinda henuz bir lisans modeli (License/orgLicense/coachLicense)
  // bulunmadigindan bu kontrol Codex'e devredilmistir.
  // TODO(codex): Prisma'ya lisans modeli eklendiginde burada
  // (coach lisansi || organizasyon aktif lisansi) dogrulanip yoksa
  // lisans/erisim-yok ekranina redirect edilecek.

  return (
    <Suspense fallback={<div className="card card-pad muted" style={{ margin: 24 }}>Yukleniyor…</div>}>
      <YonetimShell>{children}</YonetimShell>
    </Suspense>
  );
}
