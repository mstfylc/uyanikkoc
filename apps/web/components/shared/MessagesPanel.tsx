"use client";

import { KiIcon } from "@/components/design/KiIcon";
import { useCallback, useEffect, useState } from "react";

import { UkAvatar } from "@/components/design/UkAvatar";
import { UkPageHead } from "@/components/design/UkPageHead";
import type { MessageRecord, MessageThreadRecord } from "@uyanik/database";

type MessagesPanelProps = {
  apiBase: string;
  selfRole: MessageRecord["senderRole"];
  title: string;
  subtitle: string;
  testId?: string;
  threadMeta?: (thread: MessageThreadRecord) => string;
};

export function MessagesPanel({
  apiBase,
  selfRole,
  title,
  subtitle,
  testId = "messages-panel",
  threadMeta,
}: MessagesPanelProps) {
  const [threads, setThreads] = useState<MessageThreadRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [thread, setThread] = useState<MessageThreadRecord | null>(null);
  const [messageBody, setMessageBody] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const loadThreads = useCallback(async () => {
    const response = await fetch(apiBase, { credentials: "same-origin" });
    if (response.ok) {
      const data = (await response.json()) as { threads: MessageThreadRecord[] };
      setThreads(data.threads);
      setSelectedId((current) => current ?? data.threads[0]?.id ?? null);
    }
    setIsLoading(false);
  }, [apiBase]);

  const loadThread = useCallback(async () => {
    if (!selectedId) {
      setThread(null);
      return;
    }

    const response = await fetch(`${apiBase}/${selectedId}`, { credentials: "same-origin" });
    if (response.ok) {
      const data = (await response.json()) as { thread: MessageThreadRecord };
      setThread(data.thread);
    }
  }, [apiBase, selectedId]);

  useEffect(() => {
    void loadThreads();
  }, [loadThreads]);

  useEffect(() => {
    void loadThread();
  }, [loadThread]);

  async function handleSend(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedId || !messageBody.trim()) {
      return;
    }

    setIsSending(true);
    const response = await fetch(`${apiBase}/${selectedId}`, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: messageBody.trim() }),
    });
    setIsSending(false);

    if (response.ok) {
      setMessageBody("");
      await loadThread();
      await loadThreads();
    }
  }

  const activeThread = threads.find((item) => item.id === selectedId);
  const filteredThreads = threads.filter((item) => {
    const query = searchQuery.trim().toLocaleLowerCase("tr-TR");
    if (!query) {
      return true;
    }
    return item.title.toLocaleLowerCase("tr-TR").includes(query);
  });

  return (
    <div className="stack rise" data-testid={testId}>
      <UkPageHead title={title} sub={subtitle} />

      {isLoading ? (
        <p className="muted" style={{ fontSize: 13 }}>
          Yukleniyor...
        </p>
      ) : threads.length === 0 ? (
        <p className="muted" style={{ fontSize: 13 }}>
          Henuz mesaj yok.
        </p>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", height: 600 }}>
            <div
              style={{
                borderRight: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
              }}
            >
              <div style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>
                <div className="searchbox" style={{ minWidth: 0, margin: 0, display: "flex" }}>
                  <KiIcon name="ki-magnifier" size={16} />
                  <input
                    placeholder="Sohbet ara..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                  />
                </div>
              </div>
              <div style={{ overflowY: "auto", flex: 1, padding: 8 }}>
                {filteredThreads.map((item) => {
                  const active = item.id === selectedId;
                  const last = item.messages[item.messages.length - 1];
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      style={{
                        display: "flex",
                        gap: 12,
                        padding: "11px 12px",
                        borderRadius: 12,
                        width: "100%",
                        textAlign: "left",
                        border: "none",
                        background: active ? "var(--surface-3)" : "none",
                        cursor: "pointer",
                        alignItems: "center",
                      }}
                    >
                      <UkAvatar name={item.title} size={42} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="between" style={{ gap: 6 }}>
                          <b
                            style={{
                              fontSize: 13.5,
                              fontWeight: 700,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {item.title}
                          </b>
                          <span style={{ fontSize: 11, color: "var(--faint)", flexShrink: 0 }}>
                            {last ? new Date(last.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }) : ""}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: 12,
                            color: "var(--muted)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "block",
                          }}
                        >
                          {threadMeta
                            ? threadMeta(item)
                            : last?.body ?? "Mesaj yok"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
              <div
                className="row"
                style={{ gap: 12, padding: "14px 18px", borderBottom: "1px solid var(--border)" }}
              >
                <UkAvatar name={activeThread?.title ?? "Mesaj"} size={40} />
                <div style={{ flex: 1 }}>
                  <b style={{ fontSize: 14, fontWeight: 700 }}>{activeThread?.title ?? "Mesaj"}</b>
                </div>
              </div>

              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "20px 18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  background: "var(--surface-2)",
                }}
              >
                {thread ? (
                  thread.messages.map((message) => {
                    const mine = message.senderRole === selfRole;
                    return (
                      <div
                        key={message.id}
                        style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "72%" }}
                      >
                        <div
                          style={{
                            background: mine ? "var(--primary)" : "var(--surface)",
                            color: mine ? "#fff" : "var(--text)",
                            border: mine ? "none" : "1px solid var(--border)",
                            padding: "10px 14px",
                            borderRadius: mine ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                            fontSize: 13.5,
                            lineHeight: 1.5,
                            boxShadow: "var(--shadow-sm)",
                          }}
                        >
                          {message.body}
                        </div>
                        <div
                          style={{
                            fontSize: 10.5,
                            color: "var(--faint)",
                            marginTop: 4,
                            textAlign: mine ? "right" : "left",
                          }}
                        >
                          {new Date(message.createdAt).toLocaleTimeString("tr-TR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="muted" style={{ fontSize: 13 }}>
                    Thread secin.
                  </p>
                )}
              </div>

              <form
                onSubmit={handleSend}
                className="row"
                style={{ gap: 10, padding: 14, borderTop: "1px solid var(--border)" }}
              >
                <input
                  className="input"
                  style={{ flex: 1 }}
                  value={messageBody}
                  onChange={(event) => setMessageBody(event.target.value)}
                  placeholder="Mesaj yaz..."
                />
                <button
                  type="submit"
                  disabled={isSending}
                  className="btn btn-primary"
                  style={{ width: 44, padding: 0, flexShrink: 0 }}
                >
                  <KiIcon name="ki-send" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
