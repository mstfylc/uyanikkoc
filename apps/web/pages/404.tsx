export default function NotFoundPage() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ maxWidth: 420, textAlign: "center" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Sayfa bulunamadi</h1>
        <p style={{ marginTop: 10, color: "#64748b" }}>Aradiginiz adres mevcut degil.</p>
        <a href="/login" style={{ display: "inline-block", marginTop: 16, color: "#4f46e5", fontWeight: 700 }}>
          Giris sayfasina don
        </a>
      </div>
    </main>
  );
}
