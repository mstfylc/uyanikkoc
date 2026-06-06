"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { KiIcon } from "@/components/design/KiIcon";
import { UkAvatar } from "@/components/design/UkAvatar";
import { demoUsers } from "@/lib/auth/demo-users";
import { MOTIVATION_TEMPLATES } from "@/lib/design/motivation-ui";
import type { CoachRosterEntry, MessageThreadRecord } from "@uyanik/database";

type TargetMode = "all" | "group" | "pick";

type MotivationSendModalProps = {
  open: boolean;
  onClose: () => void;
  onSent?: (count: number) => void;
};

function studentIdsFromUserIds(userIds: string[]): string[] {
  const ids = new Set<string>();
  for (const userId of userIds) {
    const user = demoUsers.find((item) => item.id === userId && item.studentId);
    if (user?.studentId) ids.add(user.studentId);
  }
  return [...ids];
}

export function MotivationSendModal({ open, onClose, onSent }: MotivationSendModalProps) {
  const [mounted, setMounted] = useState(false);
  const [students, setStudents] = useState<CoachRosterEntry[]>([]);
  const [groups, setGroups] = useState<MessageThreadRecord[]>([]);
  const [mode, setMode] = useState<TargetMode>("all");
  const [groupId, setGroupId] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setMode("all");
    setPicked([]);
    setText("");
    setError(null);

    async function load() {
      const [studentsResponse, threadsResponse] = await Promise.all([
        fetch("/api/coach/students", { credentials: "same-origin" }),
        fetch("/api/coach/messages", { credentials: "same-origin" }),
      ]);
      if (studentsResponse.ok) {
        const data = (await studentsResponse.json()) as { students: CoachRosterEntry[] };
        setStudents(data.students);
      }
      if (threadsResponse.ok) {
        const data = (await threadsResponse.json()) as { threads: MessageThreadRecord[] };
        const groupThreads = data.threads.filter((thread) => thread.kind === "group");
        setGroups(groupThreads);
        setGroupId(groupThreads[0]?.id ?? "");
      }
    }

    void load();
  }, [open]);

  const targets = useMemo(() => {
    if (mode === "all") {
      return students.map((student) => student.studentId);
    }
    if (mode === "group") {
      const group = groups.find((item) => item.id === groupId);
      return studentIdsFromUserIds(group?.memberUserIds ?? []);
    }
    return picked;
  }, [mode, students, groups, groupId, picked]);

  const valid = text.trim().length > 3 && targets.length > 0;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!valid) return;

    setIsSending(true);
    setError(null);
    const response = await fetch("/api/coach/motivation", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentIds: targets, message: text.trim() }),
    });
    setIsSending(false);

    if (!response.ok) {
      setError("Motivasyon gonderilemedi.");
      return;
    }

    const data = (await response.json()) as { sent: number };
    onSent?.(data.sent);
    onClose();
  }

  if (!open || !mounted) {
    return null;
  }

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel"
        style={{ maxWidth: 500, height: "min(680px, calc(100vh - 40px))" }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-head">
          <div className="row" style={{ gap: 11 }}>
            <span className="stat-icon tone-danger" style={{ width: 38, height: 38 }}>
              <KiIcon name="ki-heart" size={18} />
            </span>
            <div>
              <h3 style={{ fontSize: 15.5, fontWeight: 800 }}>Motivasyon Gonder</h3>
              <div className="muted" style={{ fontSize: 12 }}>Ogrencilerine moral ve hatirlatma yolla</div>
            </div>
          </div>
          <button type="button" className="icon-btn" style={{ width: 36, height: 36 }} onClick={onClose} aria-label="Kapat">
            <KiIcon name="ki-plus" size={18} style={{ transform: "rotate(45deg)" }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body" style={{ padding: "16px 20px", gap: 14 }}>
          <div className="field">
            <label className="label">Kime</label>
            <div className="seg" style={{ width: "fit-content", flexWrap: "wrap" }}>
              <button type="button" className={mode === "all" ? "on" : ""} onClick={() => setMode("all")}>
                Tum ogrenciler
              </button>
              <button type="button" className={mode === "group" ? "on" : ""} onClick={() => setMode("group")}>
                Grup
              </button>
              <button type="button" className={mode === "pick" ? "on" : ""} onClick={() => setMode("pick")}>
                Ogrenci sec
              </button>
            </div>
          </div>

          {mode === "group" ? (
            <div className="field">
              <label className="label">Grup</label>
              <select className="select" value={groupId} onChange={(event) => setGroupId(event.target.value)}>
                {groups.length === 0 ? <option value="">Grup yok</option> : null}
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.title}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {mode === "pick" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 180, overflowY: "auto" }}>
              {students.map((student) => {
                const on = picked.includes(student.studentId);
                return (
                  <button
                    key={student.studentId}
                    type="button"
                    className="src-item"
                    style={{ background: on ? "var(--primary-soft)" : undefined }}
                    onClick={() =>
                      setPicked((current) =>
                        current.includes(student.studentId)
                          ? current.filter((id) => id !== student.studentId)
                          : [...current, student.studentId],
                      )
                    }
                  >
                    <UkAvatar name={student.displayName} size={26} />
                    <span
                      style={{
                        flex: 1,
                        textAlign: "left",
                        fontWeight: 600,
                        color: on ? "var(--primary-600)" : "var(--text)",
                      }}
                    >
                      {student.displayName}
                    </span>
                    <span className={`chk sm${on ? " done" : ""}`}>
                      <KiIcon name="ki-check" size={11} />
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}

          <div className="field">
            <label className="label">Mesaj</label>
            <textarea
              className="textarea"
              rows={3}
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Motive edici bir mesaj yaz..."
            />
          </div>

          <div>
            <div className="muted" style={{ fontSize: 11.5, fontWeight: 700, marginBottom: 7 }}>
              HAZIR MESAJLAR
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {MOTIVATION_TEMPLATES.map((template) => (
                <button key={template} type="button" className="motiv-tpl" onClick={() => setText(template)}>
                  {template}
                </button>
              ))}
            </div>
          </div>

          {error ? (
            <p className="badge badge-danger" style={{ height: "auto", padding: "8px 10px" }}>
              {error}
            </p>
          ) : null}

          <div className="modal-foot">
            <span className="muted" style={{ fontSize: 12, fontWeight: 600 }}>
              {targets.length} alici
            </span>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!valid || isSending}
              style={{ marginLeft: "auto", opacity: valid ? 1 : 0.5 }}
            >
              <KiIcon name="ki-send" size={16} />
              {isSending ? "Gonderiliyor..." : "Gonder"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
