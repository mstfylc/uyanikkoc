"use client";

import { useState } from "react";
import { createPortal } from "react-dom";

import { KiIcon } from "@/components/design/KiIcon";

const aiFeatures = [
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
    desc: "Takildigin soruyu fotograflayip adim adim cozum ve benzer soru onerileri alirsin.",
  },
  {
    icon: "ki-chart-line-up",
    title: "Net tahmini",
    desc: "Gidisatina gore sinav netini ve siralama hedefini tahmin eder.",
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
      <PageHead title="AI Koc" sub="Kisisel yapay zeka kocun - cok yakinda" actions={<Badge tone="primary" dot>Yakinda</Badge>} />

      <div className="hero" style={{ display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap" }}>
        <span className="glass" style={{ width: 76, height: 76, borderRadius: 20, display: "grid", placeItems: "center", flexShrink: 0 }}>
          <KiIcon name="ki-technology-2" size={38} />
        </span>
        <div style={{ flex: 1, minWidth: 240 }}>
          <h2 style={{ fontSize: 24 }}>Senin icin dusunen bir koc</h2>
          <p style={{ marginTop: 8, maxWidth: 560 }}>
            Uyanik AI Koc; netlerini, odevlerini ve calisma aliskanliklarini analiz ederek sana ozel oneriler ve program cikaracak. Beta erisimi icin siraya gir.
          </p>
          <div className="row" style={{ gap: 10, marginTop: 18, flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn btn-white"
              onClick={() => setJoined(true)}
              style={joined ? { opacity: 0.85 } : undefined}
            >
              <KiIcon name={joined ? "ki-check" : "ki-flash"} size={16} />
              {joined ? "Siraya eklendin" : "Erken erisime katil"}
            </button>
            <button type="button" className="btn" style={{ background: "rgba(255,255,255,.14)", color: "#fff" }} onClick={() => setHowOpen(true)}>
              Nasil calisir?
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

      <Section title="Onizleme" sub="AI Koc sohbeti - demo">
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ alignSelf: "flex-end", maxWidth: "75%", background: "var(--primary)", color: "#fff", padding: "11px 15px", borderRadius: "14px 14px 4px 14px", fontSize: 13.5 }}>
            Turev konusunda hep hata yapiyorum, ne yapmaliyim?
          </div>
          <div style={{ alignSelf: "flex-start", maxWidth: "78%", background: "var(--surface-3)", padding: "11px 15px", borderRadius: "14px 14px 14px 4px", fontSize: 13.5, lineHeight: 1.55 }}>
            <div className="row" style={{ gap: 7, marginBottom: 6 }}>
              <span className="ai-orb" style={{ width: 24, height: 24, borderRadius: 8 }}>
                <KiIcon name="ki-technology-2" size={13} />
              </span>
              <b style={{ fontSize: 12.5 }}>AI Koc</b>
            </div>
            Son 3 denemende turevde ortalama 4 yanlisin var. Once <b>turev alma kurallarini</b> tekrar et, ardindan sana 20 soruluk bir set hazirlayayim mi?
          </div>
          <div className="row" style={{ gap: 10, opacity: 0.6, marginTop: 4 }}>
            <div className="searchbox" style={{ flex: 1, display: "flex" }}>
              <input placeholder="Mesaj yaz... (yakinda aktif)" disabled />
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
                      <h3 style={{ fontSize: 15.5, fontWeight: 800 }}>AI Koc nasil calisir?</h3>
                      <div className="muted" style={{ fontSize: 12 }}>3 adimda kisisel asistanin</div>
                    </div>
                  </div>
                  <button type="button" className="icon-btn" style={{ width: 36, height: 36 }} onClick={() => setHowOpen(false)} aria-label="Kapat">
                    <KiIcon name="ki-cross" size={18} />
                  </button>
                </div>
                <div className="modal-body" style={{ padding: 20, gap: 16 }}>
                  {[
                    ["ki-chart-line-up", "Verini analiz eder", "Denemelerini, odev sonuclarini ve calisma aliskanliklarini inceler."],
                    ["ki-target", "Zayif noktalari bulur", "En cok hata yaptigin konulari ve eksiklerini tespit eder."],
                    ["ki-calendar", "Plan onerir", "Sana ozel, guncellenen bir calisma programi ve soru seti hazirlar."],
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
                    Erken erisime katil
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
