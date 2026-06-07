type ErrorPageProps = {
  statusCode: number;
};

export default function ErrorPage({ statusCode }: ErrorPageProps) {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ maxWidth: 420, textAlign: "center" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Bir hata olustu</h1>
        <p style={{ marginTop: 10, color: "#64748b" }}>
          {statusCode ? `Hata kodu: ${statusCode}` : "Beklenmeyen bir hata olustu."}
        </p>
        <a href="/login" style={{ display: "inline-block", marginTop: 16, color: "#4f46e5", fontWeight: 700 }}>
          Giris sayfasina don
        </a>
      </div>
    </main>
  );
}

ErrorPage.getInitialProps = ({ res, err }: { res?: { statusCode: number }; err?: { statusCode: number } }) => {
  const statusCode = res?.statusCode ?? err?.statusCode ?? 404;
  return { statusCode };
};
