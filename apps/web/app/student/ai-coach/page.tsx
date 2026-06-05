import { KiIcon } from "@/components/design/KiIcon";

import { UkBadge } from "@/components/design/UkBadge";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";

const AI_FEATURES = [
  {
    icon: "ki-target",
    title: "Zayif konu tespiti",
    desc: "Deneme ve odev verinden en cok hata yaptigin konulari otomatik bulur.",
  },
  {
    icon: "ki-calendar",
    title: "Akilli program",
    desc: "Sana ozel, gune ve net hedefine gore guncellenen calisma plani.",
  },
  {
    icon: "ki-message-text",
    title: "7/24 soru cozumu",
    desc: "Takildigin soruyu fotografla, adim adim cozum ve benzer sorular gelsin.",
  },
  {
    icon: "ki-chart-line-up",
    title: "Net tahmini",
    desc: "Gidisatina gore sinav netini ve siralamani tahmin eder.",
  },
];

export default function StudentAiCoachPage() {
  return (
    <div className="stack rise" data-testid="ai-coach-coming-soon">
      <UkPageHead
        title="AI Koc"
        sub="Kisisel yapay zeka kocun — cok yakinda"
        actions={
          <UkBadge tone="primary" dot>
            Yakinda
          </UkBadge>
        }
      />

      <div className="hero" style={{ display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap" }}>
        <span
          className="glass"
          style={{
            width: 76,
            height: 76,
            borderRadius: 20,
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <KiIcon name="ki-technology-2" size={38} />
        </span>
        <div style={{ flex: 1, minWidth: 240 }}>
          <h2 style={{ fontSize: 24 }}>Senin icin dusunen bir koc</h2>
          <p style={{ marginTop: 8, maxWidth: 560 }}>
            Uyanik AI Koc; netlerini, odevlerini ve calisma aliskanliklarini analiz ederek sana ozel oneriler ve
            program cikaracak.
          </p>
        </div>
      </div>

      <div className="grid g-2">
        {AI_FEATURES.map((feature) => (
          <div key={feature.title} className="card">
            <div className="card-pad" style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <span className="stat-icon tone-primary" style={{ flexShrink: 0 }}>
                <KiIcon name={feature.icon} />
              </span>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 700 }}>{feature.title}</div>
                <div className="muted" style={{ fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>
                  {feature.desc}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <UkSection title="Onizleme" sub="AI Koc sohbeti — demo">
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{
              alignSelf: "flex-end",
              maxWidth: "75%",
              background: "var(--primary)",
              color: "#fff",
              padding: "11px 15px",
              borderRadius: "14px 14px 4px 14px",
              fontSize: 13.5,
            }}
          >
            Turev konusunda hep hata yapiyorum, ne yapmaliyim?
          </div>
          <div
            style={{
              alignSelf: "flex-start",
              maxWidth: "78%",
              background: "var(--surface-3)",
              padding: "11px 15px",
              borderRadius: "14px 14px 14px 4px",
              fontSize: 13.5,
              lineHeight: 1.55,
            }}
          >
            <div className="row" style={{ gap: 7, marginBottom: 6 }}>
              <span className="ai-orb" style={{ width: 24, height: 24, borderRadius: 8 }}>
                <KiIcon name="ki-technology-2" size={13} />
              </span>
              <b style={{ fontSize: 12.5 }}>AI Koc</b>
            </div>
            Son 3 denemende turevde ortalama 4 yanlisin var. Once turev alma kurallarini tekrar et.
          </div>
          <div className="row" style={{ gap: 10, opacity: 0.6, marginTop: 4 }}>
            <input className="input" style={{ flex: 1 }} placeholder="Mesaj yaz... (yakinda aktif)" disabled />
            <button type="button" className="btn btn-primary" disabled style={{ width: 44, padding: 0 }}>
              <KiIcon name="ki-send" />
            </button>
          </div>
          <p className="muted" style={{ fontSize: 12 }}>
            Canli AI yanitlari su an devre disi. Ozellik acildiginda bu sayfadan erisilebilecek.
          </p>
        </div>
      </UkSection>
    </div>
  );
}
