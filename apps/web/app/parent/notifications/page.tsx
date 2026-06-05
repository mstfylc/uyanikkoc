"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import type { NotificationRecord } from "@uyanik/database";

export default function ParentNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    const response = await fetch("/api/parent/notifications", { credentials: "same-origin" });
    if (response.ok) {
      const data = (await response.json()) as { notifications: NotificationRecord[] };
      setNotifications(data.notifications);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function markRead(id: string) {
    const response = await fetch("/api/parent/notifications", {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (response.ok) {
      await load();
    }
  }

  return (
    <div className="flex flex-col gap-5" data-testid="parent-notifications">
      <div>
        <h1 className="text-xl font-semibold text-mono">Bildirimler</h1>
        <p className="text-sm text-muted-foreground">Odev hatirlatmalari</p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Yukleniyor...</p>
      ) : notifications.length === 0 ? (
        <p className="text-sm text-muted-foreground">Bildirim yok.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={`kt-card ${notification.read ? "opacity-70" : "border-primary/30"}`}
            >
              <div className="kt-card-body p-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-medium">{notification.title}</h3>
                  <p className="text-sm text-muted-foreground">{notification.body}</p>
                </div>
                {!notification.read ? (
                  <button
                    type="button"
                    className="kt-btn kt-btn-sm kt-btn-light shrink-0"
                    onClick={() => void markRead(notification.id)}
                  >
                    Okundu
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Link href="/parent/dashboard" className="kt-btn kt-btn-sm kt-btn-light w-fit">
        Dashboard
      </Link>
    </div>
  );
}
