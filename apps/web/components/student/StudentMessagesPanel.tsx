"use client";

import { MessagesPanel } from "@/components/shared/MessagesPanel";

export function StudentMessagesPanel() {
  return (
    <MessagesPanel
      apiBase="/api/student/messages"
      selfRole="STUDENT"
      title="Mesajlar"
      subtitle="Koc ile yazisma"
      testId="student-messages-panel"
    />
  );
}
