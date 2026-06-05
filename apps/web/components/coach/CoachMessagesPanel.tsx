"use client";

import { MessagesPanel } from "@/components/shared/MessagesPanel";

export function CoachMessagesPanel() {
  return (
    <MessagesPanel
      apiBase="/api/coach/messages"
      selfRole="COACH"
      title="Mesajlar"
      subtitle="Ogrenci ve veli ile yazisma"
      testId="coach-messages-panel"
      threadMeta={(thread) =>
        `${thread.studentId ? "Ogrenci" : "Veli"} · ${thread.messages[thread.messages.length - 1]?.body ?? "Mesaj yok"}`
      }
    />
  );
}
