"use client";

import { KiIcon } from "@/components/design/KiIcon";
import { FormEvent, useCallback, useEffect, useState } from "react";

import { UkBadge } from "@/components/design/UkBadge";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import {
  SUPPORT_CATEGORIES,
  SUPPORT_FAQ,
  type SupportCategory,
} from "@/lib/design/support-faq";
import type { SupportTicketRecord } from "@uyanik/database";

type SupportPanelProps = {
  role: "student" | "coach" | "parent";
};

export function SupportPanel({ role }: SupportPanelProps) {
  const [tickets, setTickets] = useState<SupportTicketRecord[]>([]);
  const [category, setCategory] = useState<SupportCategory>("teknik");
  const [message, setMessage] = useState("");
  const [openFaq, setOpenFaq] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const faqItems = SUPPORT_FAQ[role];

  const load = useCallback(async () => {
    const response = await fetch("/api/support", { credentials: "same-origin" });
    if (response.ok) {
      const data = (await response.json()) as { tickets: SupportTicketRecord[] };
      setTickets(data.tickets);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (message.trim().length < 5) {
      return;
    }

    setIsSubmitting(true);
    const response = await fetch("/api/support", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: SUPPORT_CATEGORIES[category],
        message: message.trim(),
      }),
    });
    setIsSubmitting(false);

    if (!response.ok) {
      setError("Destek talebi gonderilemedi.");
      return;
    }

    setMessage("");
    setSent(true);
    setTimeout(() => setSent(false), 2600);
    await load();
  }

  return (
    <div className="stack rise" data-testid="support-panel">
      <UkPageHead title="Destek" sub="Sik sorulan sorular, yardim ve iletisim" />

      <div className="grid g-3">
        {[
          { icon: "ki-message-text", title: "Canli Destek", desc: "Hafta ici 09:00 – 18:00", tone: "primary" },
          { icon: "ki-notification-on", title: "E-posta", desc: "destek@uyanikkoc.com", tone: "info" },
          { icon: "ki-technology-2", title: "Yardim Merkezi", desc: "Rehber ve videolar", tone: "success" },
        ].map((item) => (
          <div key={item.title} className="card">
            <div className="card-pad" style={{ display: "flex", gap: 13, alignItems: "center" }}>
              <span className={`stat-icon tone-${item.tone}`} style={{ width: 46, height: 46, borderRadius: 14 }}>
                <KiIcon name={item.icon} size={22} />
              </span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{item.title}</div>
                <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>
                  {item.desc}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid col-main">
        <UkSection title="Sik Sorulan Sorular" sub="En cok merak edilenler">
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {faqItems.map((item, index) => {
              const active = openFaq === index;
              return (
                <div key={item.question} className={`acc-item${active ? " open" : ""}`}>
                  <button type="button" className="acc-head" onClick={() => setOpenFaq(active ? -1 : index)}>
                    <span
                      className="lr-icon"
                      style={{ width: 30, height: 30, background: "var(--primary-soft)", color: "var(--primary-600)" }}
                    >
                      <KiIcon name="ki-message-text" size={15} />
                    </span>
                    <span style={{ fontWeight: 700, fontSize: 13.5, flex: 1, textAlign: "left" }}>{item.question}</span>
                    <KiIcon
                      name="ki-arrow-down"
                      size={16}
                      style={{
                        color: "var(--faint)",
                        transform: active ? "rotate(180deg)" : "none",
                        transition: "transform .2s",
                      }}
                    />
                  </button>
                  {active ? (
                    <div style={{ padding: "0 16px 14px 58px", fontSize: 13, color: "var(--text-2)", lineHeight: 1.55 }}>
                      {item.answer}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </UkSection>

        <UkSection title="Destek Talebi Olustur" sub="Sorununu ilet, ekibimiz donus yapsin">
          <form onSubmit={handleSubmit} className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="field">
              <label className="label">Konu</label>
              <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
                {(Object.entries(SUPPORT_CATEGORIES) as Array<[SupportCategory, string]>).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    className={`type-chip${category === key ? " on" : ""}`}
                    onClick={() => setCategory(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <label className="label" htmlFor="support-message">
                Mesajin
              </label>
              <textarea
                id="support-message"
                className="input"
                rows={4}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Yasadigin sorunu veya onerini detaylica yaz..."
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || message.trim().length < 5}
              className="btn btn-primary w-fit"
            >
              <KiIcon name={sent ? "ki-check" : "ki-send"} size={16} />
              {isSubmitting ? "Gonderiliyor..." : sent ? "Talebin alindi" : "Gonder"}
            </button>
            {sent ? (
              <UkBadge tone="success">En gec 24 saat icinde donus yapilacak</UkBadge>
            ) : null}
            {error ? (
              <UkBadge tone="danger">{error}</UkBadge>
            ) : null}
          </form>
        </UkSection>
      </div>

      <UkSection title="Taleplerim" sub={`${tickets.length} kayit`}>
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {isLoading ? (
            <p className="muted" style={{ fontSize: 13 }}>
              Yukleniyor...
            </p>
          ) : tickets.length === 0 ? (
            <p className="muted" style={{ fontSize: 13 }}>
              Henuz destek talebi yok.
            </p>
          ) : (
            tickets.map((ticket) => (
              <div key={ticket.id} className="lrow">
                <span className="lr-icon" style={{ background: "var(--surface-3)" }}>
                  <KiIcon name="ki-message-text" />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="lr-title">{ticket.subject}</div>
                  <div className="lr-meta">
                    <span className="d">{ticket.message}</span>
                    <span className="d">{new Date(ticket.createdAt).toLocaleDateString("tr-TR")}</span>
                  </div>
                </div>
                <UkBadge tone={ticket.status === "open" ? "warning" : "success"}>
                  {ticket.status === "open" ? "Acik" : "Kapali"}
                </UkBadge>
              </div>
            ))
          )}
        </div>
      </UkSection>
    </div>
  );
}
