"use client";

import { MessagesPanel } from "@/components/shared/MessagesPanel";

export function StudentMessagesPanel() {
  return (
    <MessagesPanel
      apiBase="/api/student/messages"
      selfRole="STUDENT"
      title="Mesajlar"
      subtitle="Koçun ve grupların"
      testId="student-messages-panel"
      enableGroupTabs
      dmSectionLabel="Koçun"
    />
  );
}
