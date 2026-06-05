"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

import { UkBadge } from "@/components/design/UkBadge";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import type { SupportTicketRecord } from "@uyanik/database";

export function SupportPanel() {
  const [tickets, setTickets] = useState<SupportTicketRecord[]>([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    if (!subject.trim() || !message.trim()) {
      return;
    }

    setIsSubmitting(true);
    const response = await fetch("/api/support", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject: subject.trim(), message: message.trim() }),
    });
    setIsSubmitting(false);

    if (!response.ok) {
      setError("Destek talebi gonderilemedi.");
      return;
    }

    setSubject("");
    setMessage("");
    await load();
  }

  return (
    <div className="stack rise" data-testid="support-panel">
      <UkPageHead title="Destek" sub="Teknik destek talebi olustur" />

      <UkSection title="Yeni talep">
        <form onSubmit={handleSubmit} className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="field">
            <label className="label" htmlFor="support-subject">
              Konu
            </label>
            <input
              id="support-subject"
              className="input"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Kisa konu basligi"
            />
          </div>
          <div className="field">
            <label className="label" htmlFor="support-message">
              Mesaj
            </label>
            <textarea
              id="support-message"
              className="input"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Sorununuzu aciklayin"
            />
          </div>
          <button type="submit" disabled={isSubmitting} className="btn btn-primary w-fit">
            {isSubmitting ? "Gonderiliyor..." : "Talep gonder"}
          </button>
          {error ? (
            <p className="badge badge-danger" style={{ height: "auto", padding: "10px 12px" }}>
              {error}
            </p>
          ) : null}
        </form>
      </UkSection>

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
                  <i className="ki-filled ki-message-text" />
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
