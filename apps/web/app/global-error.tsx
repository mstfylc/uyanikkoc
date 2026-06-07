"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="tr">
      <body>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
          <div style={{ maxWidth: 420, textAlign: "center" }}>
            <h1 style={{ fontSize: 22, fontWeight: 800 }}>Bir hata olustu</h1>
            <p style={{ marginTop: 10, color: "#64748b", lineHeight: 1.6 }}>
              Islem tamamlanamadi. Lutfen tekrar deneyin.
            </p>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                marginTop: 16,
                padding: "10px 16px",
                borderRadius: 10,
                border: "none",
                background: "#4f46e5",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Tekrar dene
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
