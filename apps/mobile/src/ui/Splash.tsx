/* Açılış / bootstrap bekleme ekranı. */
import { UKMark } from "./UKMark";

export function Splash() {
  return (
    <div className="uk-login">
      <div className="uk-login-art" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <span
          style={{
            width: 64,
            height: 64,
            borderRadius: 20,
            display: "grid",
            placeItems: "center",
            background: "rgba(255,255,255,.16)",
            border: "1px solid rgba(255,255,255,.22)",
          }}
        >
          <UKMark size={38} />
        </span>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.02em" }}>Uyanık Koç</div>
        <div className="uk-spinner" aria-label="Yükleniyor" />
      </div>
    </div>
  );
}
