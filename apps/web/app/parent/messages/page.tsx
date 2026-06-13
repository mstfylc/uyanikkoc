"use client";

import { MessagesPanel } from "@/components/shared/MessagesPanel";

export default function ParentMessagesPage() {
  return (
    <MessagesPanel
      apiBase="/api/parent/messages"
      selfRole="PARENT"
      title="Mesajlar"
      subtitle="Koçun ve grupların"
      testId="parent-messages-panel"
      enableGroupTabs
      dmSectionLabel="Koçun"
    />
  );
}
