"use client";

import { useState } from "react";
import { createPortal } from "react-dom";

import { KiIcon } from "@/components/design/KiIcon";

const aiFeatures = [
  {
    icon: "ki-target",
    title: "Zayıf konu tespiti",
    desc: "Deneme ve ödev verinden en çok hata yaptığın konuları otomatik bulur.",
  },
  {
    icon: "ki-calendar",
    title: "Akıllı program",
    desc: "Sana özel, güne ve net hedefine göre güncellenen çalışma planı.",
  },
  {
    icon: "ki-message-text",
    title: "7/24 soru çözümü",
    desc: "Takıldığın soruyu fotoğraflayıp adım adım çözüm ve benzer soru önerileri alırsın.",
  },
  {
    icon: "ki-chart-line-up",
    title: "Net tahmini",
    desc: "Gidişatına göre sınav netini ve sıralama hedefini tahmin eder.",
  },
];

function Badge({
  tone = "primary",
  dot = false,
  children,
}: {
  tone?: "primary" | "success" | "warning" | "muted";
  dot?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span className={`badge badge-${tone}`}>
      {dot ? <span className="dot-live" /> : null}
      {children}
    </span>
  );
}

function PageHead({ title, sub, actions }: { title: string; sub: string; actions?: React.ReactNode }) {
  return (
    <div className="between" style={{ alignItems: "flex-end", gap: 16 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.02em" }}>{title}</h1>
        <div className="muted" style={{ fontSize: 13, marginTop: 4, fontWeight: 500 }}>{sub}</div>
      </div>
      {actions}
    </div>
  );
}

function Section({
  title,
  sub,
  children,
}: {
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card">
      <div className="card-head">
        <div>
          <h3>{title}</h3>
          <p className="sub">{sub}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export default function StudentAiCoachPage() {
  const [joined, setJoined] = useState(false);
  const [howOpen, setHowOpen] = useState(false);

  return (
    <div className="stack rise" data-testid="ai-coach-coming-soon">
      <PageHead title="AI Koç" sub="Kişisel yapay zeka koçun - çok yakında" actions={<Badge tone="primary" dot>Yakında</Badge>} />

      <div className="hero" style={{ display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap" }}>
        <span className="glass" style={{ width: 76, height: 76, borderRadius: 20, display: "grid", placeItems: "center", flexShrink: 0 }}>
          <KiIcon name="ki-technology-2" size={38} />
        </span>
        <div style={{ flex: 1, minWidth: 240 }}>
          <h2 style={{ fontSize: 24 }}>Senin icin dusunen bir koc</h2>
          <p style={{ marginTop: 8, maxWidth: 560 }}>
            Uyanık AI Koç; netlerini, ödevlerini ve çalışma alışkanlıklarını analiz ederek sana özel öneriler ve program çıkaracak. Beta erişimi için sıraya gir.
          </p>
          <div className="row" style={{ gap: 10, marginTop: 18, flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn btn-white"
              onClick={() => setJoined(true)}
              style={joined ? { opacity: 0.85 } : undefined}
            >
              <KiIcon name={joined ? "ki-check" : "ki-flash"} size={16} />
              {joined ? "Sıraya eklendin" : "Erken erişime katıl"}
            </button>
            <button type="button" className="btn" style={{ background: "rgba(255,255,255,.14)", color: "#fff" }} onClick={() => setHowOpen(true)}>
              Nasıl çalışır?
            </button>
          </div>
        </div>
      </div>

      <div className="grid g-2">
        {aiFeatures.map((feature) => (
          <div key={feature.title} className="card">
            <div className="card-pad" style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <span className="stat-icon tone-primary" style={{ flexShrink: 0 }}>
                <KiIcon name={feature.icon} size={22} />
              </span>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 700 }}>{feature.title}</div>
                <div className="muted" style={{ fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>{feature.desc}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Section title="Önizleme" sub="AI Koç sohbeti - demo">
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ alignSelf: "flex-end", maxWidth: "75%", background: "var(--primary)", color: "#fff", padding: "11px 15px", borderRadius: "14px 14px 4px 14px", fontSize: 13.5 }}>
            Türev konusunda hep hata yapıyorum, ne yapmalıyım?
          </div>
          <div style={{ alignSelf: "flex-start", maxWidth: "78%", background: "var(--surface-3)", padding: "11px 15px", borderRadius: "14px 14px 14px 4px", fontSize: 13.5, lineHeight: 1.55 }}>
            <div className="row" style={{ gap: 7, marginBottom: 6 }}>
              <span className="ai-orb" style={{ width: 24, height: 24, borderRadius: 8 }}>
                <KiIcon name="ki-technology-2" size={13} />
              </span>
              <b style={{ fontSize: 12.5 }}>AI Koç</b>
            </div>
            Son 3 denemende türevde ortalama 4 yanlışın var. Önce <b>türev alma kurallarını</b> tekrar et, ardından sana 20 soruluk bir set hazırlayayım mı?
          </div>
          <div className="row" style={{ gap: 10, opacity: 0.6, marginTop: 4 }}>
            <div className="searchbox" style={{ flex: 1, display: "flex" }}>
              <input placeholder="Mesaj yaz... (yakında aktif)" disabled />
            </div>
            <button type="button" className="btn btn-primary" disabled>
              <KiIcon name="ki-send" size={16} />
            </button>
          </div>
        </div>
      </Section>

      {howOpen
        ? createPortal(
            <div className="modal-overlay" onClick={() => setHowOpen(false)}>
              <div className="modal-panel" style={{ maxWidth: 460 }} onClick={(event) => event.stopPropagation()}>
                <div className="modal-head">
                  <div className="row" style={{ gap: 11 }}>
                    <span className="ai-orb" style={{ width: 38, height: 38 }}>
                      <KiIcon name="ki-technology-2" size={19} />
                    </span>
                    <div>
                      <h3 style={{ fontSize: 15.5, fontWeight: 800 }}>AI Koç nasıl çalışır?</h3>
                      <div className="muted" style={{ fontSize: 12 }}>3 adımda kişisel asistanın</div>
                    </div>
                  </div>
                  <button type="button" className="icon-btn" style={{ width: 36, height: 36 }} onClick={() => setHowOpen(false)} aria-label="Kapat">
                    <KiIcon name="ki-cross" size={18} />
                  </button>
                </div>
                <div className="modal-body" style={{ padding: 20, gap: 16 }}>
                  {[
                    ["ki-chart-line-up", "Verini analiz eder", "Denemelerini, ödev sonuçlarını ve çalışma alışkanlıklarını inceler."],
                    ["ki-target", "Zayıf noktaları bulur", "En çok hata yaptığın konuları ve eksiklerini tespit eder."],
                    ["ki-calendar", "Plan önerir", "Sana özel, güncellenen bir çalışma programı ve soru seti hazırlar."],
                  ].map(([icon, title, desc], index) => (
                    <div key={title} className="row" style={{ gap: 13, alignItems: "flex-start" }}>
                      <span className="stat-icon tone-primary" style={{ width: 36, height: 36, flexShrink: 0 }}>
                        <KiIcon name={icon} size={17} />
                      </span>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 700 }}>{index + 1}. {title}</div>
                        <div className="muted" style={{ fontSize: 12.5, marginTop: 2, lineHeight: 1.45 }}>{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="modal-foot">
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ marginLeft: "auto" }}
                    onClick={() => {
                      setHowOpen(false);
                      setJoined(true);
                    }}
                  >
                    <KiIcon name="ki-flash" size={16} />
                    Erken erişime katıl
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
