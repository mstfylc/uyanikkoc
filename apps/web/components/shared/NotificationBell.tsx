"use client";

import type { AppRole } from "@uyanik/tokens";
import Link from "next/link";
import { useEffect, useState } from "react";

type NotificationBellProps = {
  role: "student" | "parent";
};

function notificationsPath(role: NotificationBellProps["role"]): string {
  return role === "student" ? "/student/notifications" : "/parent/notifications";
}

function notificationsApiPath(role: NotificationBellProps["role"]): string {
  return role === "student" ? "/api/student/notifications" : "/api/parent/notifications";
}

export function NotificationBell({ role }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function load() {
      const response = await fetch(notificationsApiPath(role), { credentials: "same-origin" });
      if (response.ok) {
        const data = (await response.json()) as { unreadCount: number };
        setUnreadCount(data.unreadCount);
      }
    }

    void load();
  }, [role]);

  return (
    <Link
      href={notificationsPath(role)}
      className="kt-btn kt-btn-icon kt-btn-ghost relative"
      aria-label="Bildirimler"
      data-testid="notification-bell"
    >
      <i className="ki-filled ki-notification-on" />
      {unreadCount > 0 ? (
        <span className="absolute -top-1 -end-1 flex size-4 items-center justify-center rounded-full bg-danger text-[10px] font-semibold text-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      ) : null}
    </Link>
  );
}

export function shouldShowNotificationBell(role: AppRole): role is "student" | "parent" {
  return role === "student" || role === "parent";
}
