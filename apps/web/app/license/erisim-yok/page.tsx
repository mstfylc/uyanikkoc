import Link from "next/link";

const REASON_COPY: Record<string, string> = {
  missing_owner: "Hesabiniz icin lisans sahibi bilgisi bulunamadi.",
  not_found: "Hesabiniza bagli aktif bir lisans bulunamadi.",
  inactive_status: "Lisansiniz aktif durumda degil.",
  expired: "Lisans sureniz dolmus.",
  role_not_licensed: "Bu rol icin yonetim lisansi tanimli degil.",
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
            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Lisans erisimi yok</h1>
            <p className="muted" style={{ fontSize: 14, lineHeight: 1.6 }}>
              {body} Yonetim alanina devam etmek icin lisans durumunu kontrol edin veya yetkili hesapla giris yapin.
            </p>
          </div>
          <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
            <Link className="btn btn-primary" href="/coach/license">
              Lisansimi kontrol et
            </Link>
            <Link className="btn btn-light" href="/login?role=coach">
              Farkli hesapla gir
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
