"use client";

import type { AppRole } from "@uyanik/tokens";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { KiIcon } from "@/components/design/KiIcon";
import { UkAvatar } from "@/components/design/UkAvatar";
import { MobileNavSheet } from "@/components/layout/MobileNavSheet";
import {
  NotificationBell,
  shouldShowNotificationBell,
} from "@/components/shared/NotificationBell";
import { dashboardHref, findUkNavItem, getProfileHref, UK_ROLE_CRUMB } from "@/lib/navigation/uk-nav";

type HeaderProps = {
  role: AppRole;
};

const THEME_KEY = "uk_theme_v1";
type ThemeChoice = "light" | "dark";

function applyTheme(choice: ThemeChoice) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", choice);
}

function loadTheme(): ThemeChoice {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "dark") return "dark";
  if (stored === "light") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function saveTheme(choice: ThemeChoice) {
  if (typeof window === "undefined") return;
  localStorage.setItem(THEME_KEY, choice);
}

export function Header({ role }: HeaderProps) {
  const pathname = usePathname();
  const path = pathname ?? dashboardHref(role);
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeChoice>("light");

  const displayName = session?.user?.name ?? session?.user?.email ?? "Kullanıcı";
  const activeItem = findUkNavItem(role, path);
  const pageTitle = activeItem?.label ?? "Dashboard";
  const profileHref = getProfileHref(role);

  useEffect(() => {
    const initialTheme = loadTheme();
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  function toggleTheme() {
    const next: ThemeChoice = theme === "dark" ? "light" : "dark";
    setTheme(next);
    saveTheme(next);
    applyTheme(next);
  }

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
        <input placeholder={role === "coach" ? "Öğrenci ara..." : "Ödev veya konu ara..."} readOnly />
        <kbd>K</kbd>
      </div>

      <div className="topbar-actions">
        <button
          type="button"
          className="icon-btn"
          aria-label={theme === "dark" ? "Açık tema" : "Koyu tema"}
          title={theme === "dark" ? "Açık tema" : "Koyu tema"}
          onClick={toggleTheme}
        >
          <KiIcon name={theme === "dark" ? "ki-sun" : "ki-moon"} size={19} />
        </button>
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
                <Link
                  href={profileHref}
                  className="pop-item"
                  onClick={() => setMenuOpen(false)}
                >
                  <KiIcon name="ki-profile-circle" size={18} />
                  Profil
                </Link>
                <button
                  type="button"
                  className="pop-item danger"
                  onClick={() => {
                    setMenuOpen(false);
                    void signOut({ callbackUrl: "/login" });
                  }}
                >
                  <KiIcon name="ki-exit-right" size={18} />
                  Çıkış Yap
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
