"use client";

import { useCallback, useEffect, useState } from "react";

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

  return (
    <div className="flex flex-col gap-5" data-testid={testId}>
      <div>
        <h1 className="text-xl font-semibold text-mono">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Yukleniyor...</p>
      ) : threads.length === 0 ? (
        <p className="text-sm text-muted-foreground">Henuz mesaj yok.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ul className="flex flex-col gap-2 lg:col-span-1">
            {threads.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={`kt-card w-full text-start ${selectedId === item.id ? "border-primary" : ""}`}
                  onClick={() => setSelectedId(item.id)}
                >
                  <div className="kt-card-body p-3">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {threadMeta ? threadMeta(item) : item.messages[item.messages.length - 1]?.body ?? "Mesaj yok"}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>

          <div className="lg:col-span-2 kt-card">
            <div className="kt-card-body p-4 flex flex-col gap-4 min-h-[320px]">
              {thread ? (
                <>
                  <h2 className="text-base font-medium">{thread.title}</h2>
                  <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
                    {thread.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`rounded-lg px-3 py-2 text-sm max-w-[85%] ${
                          message.senderRole === selfRole ? "ms-auto bg-primary/10" : "bg-muted"
                        }`}
                      >
                        <p className="text-xs text-muted-foreground mb-1">{message.senderRole}</p>
                        <p>{message.body}</p>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleSend} className="flex gap-2">
                    <input
                      type="text"
                      value={messageBody}
                      onChange={(event) => setMessageBody(event.target.value)}
                      placeholder="Mesajinizi yazin..."
                      className="flex-1 rounded-md border border-border px-3 py-2 text-sm"
                    />
                    <button
                      type="submit"
                      disabled={isSending}
                      className="kt-btn kt-btn-primary kt-btn-sm"
                    >
                      Gonder
                    </button>
                  </form>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Thread secin.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
