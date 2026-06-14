import Link from "next/link";

const REASON_COPY: Record<string, string> = {
  missing_owner: "Hesabınız için lisans sahibi bilgisi bulunamadı.",
  not_found: "Hesabınıza bağlı aktif bir lisans bulunamadı.",
  inactive_status: "Lisansınız aktif durumda değil.",
  expired: "Lisans süreniz dolmuş.",
  role_not_licensed: "Bu rol için yönetim lisansı tanımlı değil.",
};

export default async function LicenseAccessDeniedPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const params = await searchParams;
  const reason = params.reason ?? "not_found";
  const body = REASON_COPY[reason] ?? REASON_COPY.not_found;

  return (
    <main className="auth-wrap">
      <section className="auth-form-side" style={{ minHeight: "100vh" }}>
        <div className="auth-card stack" style={{ gap: 16, maxWidth: 460 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Lisans erişimi yok</h1>
            <p className="muted" style={{ fontSize: 14, lineHeight: 1.6 }}>
              {body} Yönetim alanına devam etmek için lisans durumunu kontrol edin veya yetkili hesapla giriş yapın.
            </p>
          </div>
          <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
            <Link className="btn btn-primary" href="/coach/license">
              Lisansımı kontrol et
            </Link>
            <Link className="btn btn-light" href="/login?role=coach">
              Farklı hesapla gir
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
