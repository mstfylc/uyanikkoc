"use client";

import { useCallback, useEffect, useState } from "react";

import { GroupCreateModal } from "@/components/coach/GroupCreateModal";
import { KiIcon } from "@/components/design/KiIcon";
import { MessagesPanel } from "@/components/shared/MessagesPanel";
import type { CoachRosterEntry } from "@uyanik/database";

export function CoachMessagesPanel() {
  const [students, setStudents] = useState<CoachRosterEntry[]>([]);
  const [groupOpen, setGroupOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const loadStudents = useCallback(async () => {
    const response = await fetch("/api/coach/students", { credentials: "same-origin" });
    if (response.ok) {
      const data = (await response.json()) as { students: CoachRosterEntry[] };
      setStudents(data.students);
    }
  }, []);

  useEffect(() => {
    void loadStudents();
  }, [loadStudents]);

  return (
    <>
      <MessagesPanel
        key={reloadKey}
        apiBase="/api/coach/messages"
        selfRole="COACH"
        title="Mesajlar"
        subtitle="Ogrenci, veli ve gruplar"
        testId="coach-messages-panel"
        enableGroupTabs
        headerAction={
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setGroupOpen(true)}>
            <KiIcon name="ki-people" />
            Grup olustur
          </button>
        }
        threadMeta={(thread) =>
          thread.kind === "group"
            ? `Grup · ${thread.messages[thread.messages.length - 1]?.body ?? "Mesaj yok"}`
            : `${thread.studentId ? "Ogrenci" : "Veli"} · ${thread.messages[thread.messages.length - 1]?.body ?? "Mesaj yok"}`
        }
      />

      <GroupCreateModal
        open={groupOpen}
        students={students}
        onClose={() => setGroupOpen(false)}
        onCreated={() => setReloadKey((value) => value + 1)}
      />
    </>
  );
}
