"use client";

import { KiIcon } from "@/components/design/KiIcon";
import { useCallback, useEffect, useMemo, useState } from "react";

import { UkAvatar } from "@/components/design/UkAvatar";
import { UkPageHead } from "@/components/design/UkPageHead";
import type { MessageRecord, MessageThreadRecord } from "@uyanik/database";

type ThreadFilter = "all" | "dm" | "group";

type MessagesPanelProps = {
  apiBase: string;
  selfRole: MessageRecord["senderRole"];
  title: string;
  subtitle: string;
  testId?: string;
  threadMeta?: (thread: MessageThreadRecord) => string;
  enableGroupTabs?: boolean;
  headerAction?: React.ReactNode;
  groupSectionLabel?: string;
  dmSectionLabel?: string;
};

export function MessagesPanel({
  apiBase,
  selfRole,
  title,
  subtitle,
  testId = "messages-panel",
  threadMeta,
  enableGroupTabs = false,
  headerAction,
  groupSectionLabel = "Gruplar",
  dmSectionLabel = "Birebir",
}: MessagesPanelProps) {
  const [threads, setThreads] = useState<MessageThreadRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [thread, setThread] = useState<MessageThreadRecord | null>(null);
  const [messageBody, setMessageBody] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [threadFilter, setThreadFilter] = useState<ThreadFilter>("all");
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
    if (enableGroupTabs) {
      if (threadFilter === "dm" && item.kind === "group") return false;
      if (threadFilter === "group" && item.kind !== "group") return false;
    }
    const query = searchQuery.trim().toLocaleLowerCase("tr-TR");
    if (!query) {
      return true;
    }
    return item.title.toLocaleLowerCase("tr-TR").includes(query);
  });

  const { groupThreads, dmThreads } = useMemo(() => {
    return {
      groupThreads: filteredThreads.filter((item) => item.kind === "group"),
      dmThreads: filteredThreads.filter((item) => item.kind !== "group"),
    };
  }, [filteredThreads]);

  function renderThreadButton(item: MessageThreadRecord) {
    const active = item.id === selectedId;
    const last = item.messages[item.messages.length - 1];
    const preview = threadMeta
      ? threadMeta(item)
      : item.kind === "group"
        ? `Grup · ${last?.body ?? "Mesaj yok"}`
        : last?.body ?? "Mesaj yok";

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => setSelectedId(item.id)}
        className={`chan-row${active ? " on" : ""}`}
      >
        {item.kind === "group" ? (
          <span className="chan-gico">
            <KiIcon name="ki-people" size={18} />
          </span>
        ) : (
          <UkAvatar name={item.title} size={42} />
        )}
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
          <div
            style={{
              fontSize: 12,
              color: "var(--muted)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              marginTop: 2,
            }}
          >
            {preview}
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="stack rise" data-testid={testId}>
      <UkPageHead title={title} sub={subtitle} actions={headerAction} />

      {enableGroupTabs ? (
        <div className="seg" style={{ width: "fit-content" }}>
          <button type="button" className={threadFilter === "all" ? "on" : ""} onClick={() => setThreadFilter("all")}>
            Tumu
          </button>
          <button type="button" className={threadFilter === "dm" ? "on" : ""} onClick={() => setThreadFilter("dm")}>
            Birebir
          </button>
          <button type="button" className={threadFilter === "group" ? "on" : ""} onClick={() => setThreadFilter("group")}>
            Gruplar
          </button>
        </div>
      ) : null}

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
          <div className="msg-shell">
            <div className="msg-list">
              <div style={{ padding: 12, borderBottom: "1px solid var(--border)" }}>
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
                {enableGroupTabs && groupThreads.length > 0 ? (
                  <div className="msg-sec">{groupSectionLabel}</div>
                ) : null}
                {(enableGroupTabs ? groupThreads : filteredThreads.filter((item) => item.kind === "group")).map(
                  renderThreadButton,
                )}
                {enableGroupTabs && dmThreads.length > 0 ? (
                  <div className="msg-sec">{dmSectionLabel}</div>
                ) : null}
                {(enableGroupTabs ? dmThreads : filteredThreads.filter((item) => item.kind !== "group")).map(
                  renderThreadButton,
                )}
              </div>
            </div>

            <div className="msg-thread">
              <div
                className="row"
                style={{ gap: 12, padding: "13px 18px", borderBottom: "1px solid var(--border)" }}
              >
                {activeThread?.kind === "group" ? (
                  <span className="chan-gico" style={{ width: 40, height: 40 }}>
                    <KiIcon name="ki-people" size={18} />
                  </span>
                ) : (
                  <UkAvatar name={activeThread?.title ?? "Mesaj"} size={40} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <b style={{ fontSize: 14, fontWeight: 700 }}>{activeThread?.title ?? "Mesaj"}</b>
                  {activeThread?.kind === "group" ? (
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--muted)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      Grup sohbeti
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="msg-body">
                {activeThread?.kind === "group" ? (
                  <div className="msg-day">Grup · {activeThread.title}</div>
                ) : null}
                {thread ? (
                  thread.messages.map((message) => {
                    const mine = message.senderRole === selfRole;
                    return (
                      <div
                        key={message.id}
                        style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "74%" }}
                      >
                        {!mine && activeThread?.kind === "group" ? (
                          <div
                            style={{
                              fontSize: 10.5,
                              fontWeight: 700,
                              color: "var(--primary-600)",
                              margin: "0 0 3px 4px",
                            }}
                          >
                            {message.senderRole === "COACH"
                              ? "Koc"
                              : message.senderRole === "PARENT"
                                ? "Veli"
                                : "Ogrenci"}
                          </div>
                        ) : null}
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
                  placeholder={
                    activeThread?.kind === "group"
                      ? `${activeThread.title} grubuna yaz...`
                      : `${activeThread?.title ?? "Kisi"}'a mesaj yaz...`
                  }
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
