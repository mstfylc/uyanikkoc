"use client";

import { KiIcon } from "@/components/design/KiIcon";
import { UkBadge } from "@/components/design/UkBadge";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import type { NotificationRecord } from "@uyanik/database";
import { useCallback, useEffect, useState } from "react";

type NotificationsPanelProps = {
  role: "student" | "coach" | "parent";
};

const ROLE_SUB: Record<NotificationsPanelProps["role"], string> = {
  student: "Odev hatirlatmalari ve guncellemeler",
  coach: "Ogrenci aksiyonlari, sistem ve kocluk guncellemeleri",
  parent: "Odev hatirlatmalari ve cocuk guncellemeleri",
};

export function NotificationsPanel({ role }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    const response = await fetch(`/api/${role}/notifications`, { credentials: "same-origin" });
    if (response.ok) {
      const data = (await response.json()) as { notifications: NotificationRecord[] };
      setNotifications(data.notifications);
    }
    setIsLoading(false);
  }, [role]);

  useEffect(() => {
    void load();
  }, [load]);

  async function markRead(id: string) {
    const response = await fetch(`/api/${role}/notifications`, {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (response.ok) {
      await load();
    }
  }

  async function markAllRead() {
    const response = await fetch(`/api/${role}/notifications`, {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });

    if (response.ok) {
      await load();
    }
  }

  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <div className="stack rise" data-testid={`${role}-notifications`}>
      <UkPageHead
        title="Bildirimler"
        sub={ROLE_SUB[role]}
        actions={
          unreadCount > 0 ? (
            <button type="button" className="btn btn-light btn-sm" onClick={() => void markAllRead()}>
              <KiIcon name="ki-check" size={14} />
              Tumunu okundu yap
            </button>
          ) : null
        }
      />

      {unreadCount > 0 ? (
        <div className="row" style={{ gap: 8 }}>
          <UkBadge tone="primary" dot>
            {unreadCount} okunmamis
          </UkBadge>
        </div>
      ) : null}

      <UkSection title="TÃ¼m bildirimler" sub={`${notifications.length} kayÄ±t`}>
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {isLoading ? (
            <p className="muted" style={{ fontSize: 13 }}>
              YÃ¼kleniyor...
            </p>
          ) : notifications.length === 0 ? (
            <p className="muted" style={{ fontSize: 13 }}>
              Bildirim yok.
            </p>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className="lrow"
                style={notification.read ? { opacity: 0.72 } : undefined}
              >
                <span
                  className="lr-icon"
                  style={{
                    background: notification.read ? "var(--surface-3)" : "var(--primary-soft)",
                    color: notification.read ? "var(--muted)" : "var(--primary-600)",
                  }}
                >
                  <KiIcon name="ki-notification-on" />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="lr-title">{notification.title}</div>
                  <div className="lr-meta">
                    <span className="d">{notification.body}</span>
                    <span className="d">{new Date(notification.createdAt).toLocaleString("tr-TR")}</span>
                  </div>
                </div>
                {!notification.read ? (
                  <button
                    type="button"
                    className="btn btn-light btn-sm"
                    onClick={() => void markRead(notification.id)}
                  >
                    <KiIcon name="ki-check" size={14} />
                    Okundu
                  </button>
                ) : (
                  <UkBadge tone="muted">Okundu</UkBadge>
                )}
              </div>
            ))
          )}
        </div>
      </UkSection>
    </div>
  );
}
