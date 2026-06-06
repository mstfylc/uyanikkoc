"use client";

import type { NotificationRecord } from "@uyanik/database";
import type { AppRole } from "@uyanik/tokens";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { KiIcon } from "@/components/design/KiIcon";
import {
  getNotificationMeta,
  isToday,
  relTime,
  settingsPath,
} from "@/lib/design/notification-ui";

type NotificationRole = "student" | "parent" | "coach";

type NotificationBellProps = {
  role: NotificationRole;
};

function notificationsApiPath(role: NotificationRole): string {
  return `/api/${role}/notifications`;
}

function NotificationRow({
  notification,
  role,
  onSelect,
}: {
  notification: NotificationRecord;
  role: NotificationRole;
  onSelect: (notification: NotificationRecord) => void;
}) {
  const meta = getNotificationMeta(role, notification);

  return (
    <button
      type="button"
      className={`notif-row${notification.read ? "" : " unread"}`}
      onClick={() => onSelect(notification)}
    >
      <span className={`notif-ic tone-${meta.tone}`}>
        <KiIcon name={meta.icon} size={16} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="notif-title">{notification.title}</div>
        <div className="notif-desc">{notification.body}</div>
        <div className="notif-time">{relTime(notification.createdAt)}</div>
      </div>
      {!notification.read ? <span className="notif-dot" /> : null}
    </button>
  );
}

export function NotificationBell({ role }: NotificationBellProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    const response = await fetch(notificationsApiPath(role), { credentials: "same-origin" });
    if (response.ok) {
      const data = (await response.json()) as {
        notifications: NotificationRecord[];
        unreadCount: number;
      };
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    }
    setIsLoading(false);
  }, [role]);

  useEffect(() => {
    void load();
  }, [load]);

  const { today, earlier } = useMemo(() => {
    return {
      today: notifications.filter((item) => isToday(item.createdAt)),
      earlier: notifications.filter((item) => !isToday(item.createdAt)),
    };
  }, [notifications]);

  async function markRead(notification: NotificationRecord) {
    if (!notification.read) {
      await fetch(notificationsApiPath(role), {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: notification.id }),
      });
    }
    setOpen(false);
    const meta = getNotificationMeta(role, notification);
    router.push(meta.href);
  }

  async function markAllRead() {
    await fetch(notificationsApiPath(role), {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
    await load();
  }

  return (
    <div style={{ position: "relative" }} data-testid="notification-bell">
      <button
        type="button"
        className="icon-btn"
        aria-label="Bildirimler"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <KiIcon name="ki-notification-on" size={19} />
        {unreadCount > 0 ? (
          <span className="notif-badge tnum">{unreadCount > 9 ? "9+" : unreadCount}</span>
        ) : null}
      </button>

      {open ? (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 40 }}
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="notif-pop">
            <div className="notif-pop-head">
              <div className="row" style={{ gap: 8 }}>
                <b style={{ fontSize: 14 }}>Bildirimler</b>
                {unreadCount > 0 ? (
                  <span className="badge badge-primary" style={{ height: 20, fontSize: 10.5 }}>
                    {unreadCount} yeni
                  </span>
                ) : null}
              </div>
              {unreadCount > 0 ? (
                <button type="button" className="link-btn" style={{ fontSize: 12 }} onClick={() => void markAllRead()}>
                  Tumunu okundu isaretle
                </button>
              ) : null}
            </div>

            <div className="notif-list">
              {isLoading ? (
                <div style={{ padding: "36px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
                  Yukleniyor...
                </div>
              ) : notifications.length === 0 ? (
                <div style={{ padding: "36px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
                  <KiIcon name="ki-notification-on" size={26} style={{ color: "var(--faint)" }} />
                  <div style={{ marginTop: 8 }}>Yeni bildirim yok</div>
                </div>
              ) : (
                <>
                  {today.length > 0 ? <div className="notif-sec">Bugun</div> : null}
                  {today.map((notification) => (
                    <NotificationRow
                      key={notification.id}
                      notification={notification}
                      role={role}
                      onSelect={(item) => void markRead(item)}
                    />
                  ))}
                  {earlier.length > 0 ? <div className="notif-sec">Daha once</div> : null}
                  {earlier.map((notification) => (
                    <NotificationRow
                      key={notification.id}
                      notification={notification}
                      role={role}
                      onSelect={(item) => void markRead(item)}
                    />
                  ))}
                </>
              )}
            </div>

            <Link href={settingsPath(role)} className="notif-foot" onClick={() => setOpen(false)}>
              <KiIcon name="ki-setting-2" size={15} />
              Bildirim ayarlari
            </Link>
          </div>
        </>
      ) : null}
    </div>
  );
}

export function shouldShowNotificationBell(role: AppRole): role is NotificationRole {
  return role === "student" || role === "parent" || role === "coach";
}
