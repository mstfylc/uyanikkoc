"use client";

import type { AppRole } from "@uyanik/tokens";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { KiIcon } from "@/components/design/KiIcon";
import { UkAvatar } from "@/components/design/UkAvatar";
import { MobileNavSheet } from "@/components/layout/MobileNavSheet";
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
  const [navOpen, setNavOpen] = useState(false);

  const displayName = session?.user?.name ?? session?.user?.email ?? "Kullanici";
  const activeItem = findUkNavItem(role, pathname);
  const pageTitle = activeItem?.label ?? "Dashboard";

  return (
    <>
    <header className="topbar theme-fade">
      <button
        type="button"
        className="icon-btn mobile-nav-btn"
        style={{ width: 40, height: 40, flexShrink: 0 }}
        aria-label="Menu"
        onClick={() => setNavOpen(true)}
      >
        <KiIcon name="ki-element-11" size={20} />
      </button>
      <div className="crumb">
        <b>{pageTitle}</b>
        <span>{UK_ROLE_CRUMB[role]}</span>
      </div>

      <div className="searchbox">
        <KiIcon name="ki-magnifier" size={18} />
        <input placeholder={role === "coach" ? "Ogrenci ara..." : "Odev veya konu ara..."} readOnly />
        <kbd>K</kbd>
      </div>

      <div className="topbar-actions">
        {shouldShowNotificationBell(role) ? <NotificationBell role={role} /> : null}

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
                {(role === "student" || role === "parent") ? (
                  <Link
                    href={`/${role}/billing`}
                    className="pop-item"
                    onClick={() => setMenuOpen(false)}
                  >
                    <KiIcon name="ki-wallet" size={18} />
                    Abonelik
                  </Link>
                ) : role === "coach" ? (
                  <Link
                    href="/coach/revenue"
                    className="pop-item"
                    onClick={() => setMenuOpen(false)}
                  >
                    <KiIcon name="ki-dollar" size={18} />
                    Gelir & Tahsilat
                  </Link>
                ) : null}
                <button
                  type="button"
                  className="pop-item danger"
                  onClick={() => {
                    setMenuOpen(false);
                    void signOut({ callbackUrl: "/login" });
                  }}
                >
                  <KiIcon name="ki-exit-right" size={18} />
                  Cikis Yap
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </header>
    <MobileNavSheet role={role} open={navOpen} onClose={() => setNavOpen(false)} />
    </>
  );
}
