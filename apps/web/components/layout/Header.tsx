"use client";

import type { AppRole } from "@uyanik/tokens";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { UkAvatar } from "@/components/design/UkAvatar";
import {
  NotificationBell,
  shouldShowNotificationBell,
} from "@/components/shared/NotificationBell";
import { findUkNavItem, UK_ROLE_CRUMB } from "@/lib/navigation/uk-nav";

type HeaderProps = {
  role: AppRole;
};

export function Header({ role }: HeaderProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const displayName = session?.user?.name ?? session?.user?.email ?? "Kullanici";
  const activeItem = findUkNavItem(role, pathname);
  const pageTitle = activeItem?.label ?? "Dashboard";

  return (
    <header className="topbar theme-fade">
      <div className="crumb">
        <b>{pageTitle}</b>
        <span>{UK_ROLE_CRUMB[role]}</span>
      </div>

      <div className="searchbox">
        <i className="ki-filled ki-magnifier" />
        <input placeholder={role === "coach" ? "Ogrenci ara..." : "Odev veya konu ara..."} readOnly />
        <kbd>K</kbd>
      </div>

      <div className="topbar-actions">
        {shouldShowNotificationBell(role) ? <NotificationBell role={role} /> : (
          <button type="button" className="icon-btn" aria-label="Bildirimler">
            <i className="ki-filled ki-notification-on" />
          </button>
        )}

        <div style={{ position: "relative" }}>
          <button
            type="button"
            className="user-menu-btn"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Hesap menusu"
          >
            <UkAvatar name={displayName} size={40} />
          </button>
          {menuOpen ? (
            <>
              <div
                style={{ position: "fixed", inset: 0, zIndex: 40 }}
                onClick={() => setMenuOpen(false)}
                aria-hidden
              />
              <div className="user-pop">
                <div
                  className="row"
                  style={{ gap: 11, padding: "4px 8px 12px", borderBottom: "1px solid var(--border)" }}
                >
                  <UkAvatar name={displayName} size={40} />
                  <div style={{ minWidth: 0 }}>
                    <b
                      style={{
                        fontSize: 13.5,
                        display: "block",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {displayName}
                    </b>
                    <span className="muted" style={{ fontSize: 11.5 }}>
                      {session?.user?.email}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="pop-item danger"
                  onClick={() => {
                    setMenuOpen(false);
                    void signOut({ callbackUrl: "/login" });
                  }}
                >
                  <i className="ki-filled ki-exit-right" />
                  Cikis Yap
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
