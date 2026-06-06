// Destek talebi konuşma dizisi — yanıt yaz + çözümle/yeniden aç. apps/web/components/admin/super/TicketThread.tsx
"use client";

import { useState } from "react";

import { Icon } from "@/components/admin/AdminKit";
import { useAdminStore } from "@/components/admin/AdminStore";
import { Modal } from "@/components/admin/dialogs";
import { UkAvatar } from "@/components/design/UkAvatar";
import { fmtShort } from "@/lib/admin/format";
import type { SupportTicket, TicketStatus } from "@/lib/admin/types";

const STATUS_META: Record<TicketStatus, { label: string; tone: string }> = {
  open: { label: "Açık", tone: "warning" },
  answered: { label: "Yanıtlandı", tone: "info" },
  resolved: { label: "Çözüldü", tone: "success" },
};

const AGENT = "Destek Ekibi";

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  const m = STATUS_META[status];
  return <span className={`badge badge-${m.tone}`} style={{ height: 22 }}>{m.label}</span>;
}

export function TicketThread({ ticket, onClose }: { ticket: SupportTicket; onClose: () => void }) {
  const { mutate, toast } = useAdminStore();
  const [reply, setReply] = useState("");

  const sendReply = async () => {
    if (!reply.trim()) return;
    await mutate({ kind: "replyTicket", ticketId: ticket.id, text: reply.trim(), author: AGENT });
    setReply("");
    toast("Yanıt gönderildi", { icon: "ki-send" });
  };

  const setStatus = async (status: TicketStatus, msg: string) => {
    await mutate({ kind: "setTicketStatus", ticketId: ticket.id, status });
    toast(msg, { icon: status === "resolved" ? "ki-check-circle" : "ki-arrows-circle", tone: status === "resolved" ? "success" : "primary" });
  };

  return (
    <Modal
      title={ticket.subj}
      sub={`${ticket.id} · ${ticket.org} · ${ticket.priority} öncelik`}
      width={620}
      onClose={onClose}
      foot={
        <>
          {ticket.status === "resolved" ? (
            <button type="button" className="btn btn-light" onClick={() => setStatus("open", ticket.id + " yeniden açıldı")}>
              <Icon name="refresh" size={16} />Yeniden aç
            </button>
          ) : (
            <button type="button" className="btn btn-light" onClick={() => setStatus("resolved", ticket.id + " çözümlendi")}>
              <Icon name="checkCircle" size={16} />Çözümlendi işaretle
            </button>
          )}
          <button type="button" className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={sendReply} disabled={!reply.trim()}>
            <Icon name="send" size={16} />Yanıtla
          </button>
        </>
      }
    >
      <div className="row" style={{ gap: 8, alignItems: "center" }}>
        <TicketStatusBadge status={ticket.status} />
        <span className="muted" style={{ fontSize: 12 }}>{ticket.time} açıldı</span>
      </div>

      <div className="stack" style={{ gap: 12, maxHeight: 340, overflowY: "auto", paddingRight: 4 }}>
        {ticket.messages.map((msg) => {
          const agent = msg.role === "agent";
          return (
            <div key={msg.id} className="row" style={{ gap: 10, alignItems: "flex-start", flexDirection: agent ? "row-reverse" : "row" }}>
              <UkAvatar name={msg.author} size={32} />
              <div style={{ maxWidth: "78%" }}>
                <div
                  style={{
                    background: agent ? "var(--primary)" : "var(--surface-3)",
                    color: agent ? "#fff" : "var(--text)",
                    padding: "10px 14px",
                    borderRadius: agent ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                    fontSize: 13,
                    lineHeight: 1.5,
                  }}
                >
                  {msg.text}
                </div>
                <div className="muted" style={{ fontSize: 10.5, marginTop: 4, textAlign: agent ? "right" : "left" }}>
                  {msg.author} · {fmtShort(msg.date)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <textarea
        className="input"
        rows={3}
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        placeholder="Yanıtınızı yazın…"
        style={{ resize: "vertical" }}
      />
    </Modal>
  );
}
