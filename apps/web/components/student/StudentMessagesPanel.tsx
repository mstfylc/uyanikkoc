"use client";

import { MessagesPanel } from "@/components/shared/MessagesPanel";

export function StudentMessagesPanel() {
  return (
    <MessagesPanel
      apiBase="/api/student/messages"
      selfRole="STUDENT"
      title="Mesajlar"
      subtitle="Koç ve gruplar"
      testId="student-messages-panel"
      enableGroupTabs
      dmSectionLabel="Kocun"
    />
  );
}
