import { KiIcon } from "@/components/design/KiIcon";
import { UkPageHead } from "@/components/design/UkPageHead";

export default function StudentAiCoachPage() {
  return (
    <div className="stack rise" data-testid="ai-coach-coming-soon">
      <UkPageHead title="AI Koç Yakında" sub="Kişisel AI koç desteği alpha sürümünde hazırlanıyor" />

      <div className="card">
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="row" style={{ gap: 13, alignItems: "flex-start" }}>
            <span className="stat-icon tone-primary" style={{ width: 48, height: 48, flexShrink: 0 }}>
              <KiIcon name="ki-technology-2" size={22} />
            </span>
            <div>
              <b style={{ fontSize: 15 }}>Yakında burada</b>
              <p className="muted" style={{ fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>
                Ödev planlama, motivasyon ve çalışma önerileri için AI koç modülü geliştiriliyor.
              </p>
            </div>
          </div>

          <ul className="muted" style={{ display: "flex", flexDirection: "column", gap: 6, paddingLeft: 18, fontSize: 13 }}>
            <li>Ödev ve hedef takibi için akıllı öneriler</li>
            <li>Haftalık çalışma planı özeti</li>
            <li>Koçunuzla uyumlu rehberlik (canlı AI henüz kapalı)</li>
          </ul>

          <p className="muted" style={{ fontSize: 12 }}>
            Canlı AI yanıtları şu an devre dışı. Özellik açıldığında bu sayfadan erişilebilecek.
          </p>
        </div>
      </div>
    </div>
  );
}
