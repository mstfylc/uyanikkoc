/* Yükleniyor / hata durumları (uk-m stiliyle). */

export function Loading() {
  return (
    <div style={{ padding: "60px 30px", display: "grid", placeItems: "center" }}>
      <div className="uk-spinner" style={{ borderColor: "var(--border-strong)", borderTopColor: "var(--primary)" }} />
    </div>
  );
}

export function ErrorState({ message, reload }: { message: string; reload: () => void }) {
  return (
    <div style={{ padding: "40px 30px", textAlign: "center" }}>
      <div className="uk-error" style={{ marginBottom: 14 }}>{message}</div>
      <button className="uk-btn uk-btn-light" onClick={reload}>
        Tekrar dene
      </button>
    </div>
  );
}
