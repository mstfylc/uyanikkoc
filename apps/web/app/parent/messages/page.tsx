"use client";

import { MessagesPanel } from "@/components/shared/MessagesPanel";

export default function ParentMessagesPage() {
  return (
    <MessagesPanel
      apiBase="/api/parent/messages"
      selfRole="PARENT"
      title="Mesajlar"
      subtitle="Koc ile yazisma"
      testId="parent-messages-panel"
    />
  );
}
