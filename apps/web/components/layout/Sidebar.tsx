"use client";

import type { AppRole } from "@uyanik/tokens";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { KiIcon } from "@/components/design/KiIcon";
import { UkAvatar } from "@/components/design/UkAvatar";
import {
  dashboardHref,
  findUkNavItem,
  getProfileHref,
  getUkGeneralNavItems,
  getUkNavItems,
  UK_ROLE_CRUMB,
} from "@/lib/navigation/uk-nav";

type SidebarProps = {
  role: AppRole;
};

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const path = pathname ?? dashboardHref(role);
  const isYonetimCoach = role === "coach" && path.startsWith("/yonetim");
  const [motivationEnabled, setMotivationEnabled] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (role !== "student") {
      return;
    }

    async function loadMotivation() {
      const response = await fetch("/api/student/motivation", { credentials: "same-origin" });
      if (response.ok) {
        const data = (await response.json()) as { motivation: { enabled: boolean } };
        setMotivationEnabled(data.motivation.enabled);
      }
    }

    void loadMotivation();
  }, [role]);

  const items = useMemo(() => {
    if (isYonetimCoach) {
      return [
        { href: "/yonetim/dashboard", label: "Lisansım", icon: "ki-shield-tick" },
        { href: "/yonetim/license", label: "Lisans & Kontrol", icon: "ki-chart-pie-simple" },
      ];
    }
    const base = getUkNavItems(role);
    if (role !== "student" || motivationEnabled) {
      return base;
    }
    return base.filter((item) => item.href !== "/student/motivation");
  }, [role, motivationEnabled, isYonetimCoach]);

  const generalItems = isYonetimCoach ? [] : getUkGeneralNavItems(role);
  const activeItem = isYonetimCoach
    ? items.find((item) => path === item.href || path.startsWith(`${item.href}/`))
    : findUkNavItem(role, path);
  const profileHref = isYonetimCoach ? "/yonetim/dashboard" : getProfileHref(role);
  const dash = isYonetimCoach ? "/yonetim/dashboard" : dashboardHref(role);
  const bottomNavTargets = useMemo(() => {
    if (role === "student") {
      return [
        { href: "/student/dashboard", label: "Ana Sayfa" },
        { href: "/student/schedule", label: "Program" },
        { href: "/student/assignments", label: "Ödevler" },
        { href: "/student/messages", label: "Mesajlar" },
      ];
    }
    if (role === "coach" && !isYonetimCoach) {
      return [
        { href: "/coach/dashboard", label: "Ana Sayfa" },
        { href: "/coach/students", label: "Öğrenciler" },
        { href: "/coach/assignments", label: "Ödevler" },
        { href: "/coach/messages", label: "Mesajlar" },
      ];
    }
    if (role === "parent") {
      return [
        { href: "/parent/dashboard", label: "Genel" },
        { href: "/parent/exams", label: "Denemeler" },
        { href: "/parent/messages", label: "Mesajlar" },
        { href: "/parent/appointments", label: "Randevu" },
      ];
    }
    return [];
  }, [role, isYonetimCoach]);
  const bottomNavItems = bottomNavTargets
    .map((target) => {
      const item = items.find((entry) => entry.href === target.href);
      return item ? { ...item, label: target.label } : null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
  const mobileDrawerItems = [
    ...items.filter((item) => !bottomNavItems.some((bottomItem) => bottomItem.href === item.href)),
    ...generalItems,
  ];

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [path]);

  return (
    <>
    <aside className="sidebar theme-fade">
      <div className="sidebar-logo">
        <span className="logo-mark">
          <KiIcon name="ki-flash" size={18} className="text-white" />
        </span>
        <span className="logo-text">
          <b>Uyanık Koç</b>
          <span>Akıllı koçluk</span>
        </span>
      </div>

      <nav className="nav">
        <div className="nav-label">Menu</div>
        {items.map((item) => {
          const active =
            path === item.href || (item.href !== dash && path.startsWith(`${item.href}/`));

          return (
            <Link key={item.href} href={item.href} className={`nav-item${active ? " active" : ""}`}>
              <KiIcon name={item.icon} size={18} />
              <span>{item.label}</span>
              {item.tag ? <span className="nav-tag">{item.tag}</span> : null}
            </Link>
          );
        })}

        {generalItems.length > 0 ? (
          <>
            <div className="nav-label">Genel</div>
            {generalItems.map((item) => {
              const active = path === item.href || path.startsWith(`${item.href}/`);
              return (
                <Link key={item.href} href={item.href} className={`nav-item${active ? " active" : ""}`}>
                  <KiIcon name={item.icon} size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </>
        ) : null}
      </nav>

      <div className="sidebar-foot">
        <Link href={profileHref} className="user-card">
          <UkAvatar name={UK_ROLE_CRUMB[role]} size={38} />
          <div className="user-meta">
            <b>{activeItem?.label ?? "Dashboard"}</b>
            <span>{UK_ROLE_CRUMB[role]}</span>
          </div>
          <KiIcon name="ki-right" size={16} style={{ color: "var(--faint)" }} />
        </Link>
      </div>
    </aside>
    {bottomNavItems.length > 0 ? (
      <>
        <nav className="bottom-nav theme-fade" aria-label="Mobil navigasyon">
          {bottomNavItems.map((item) => {
            const active = path === item.href || (item.href !== dash && path.startsWith(`${item.href}/`));
            return (
              <Link key={item.href} href={item.href} className={`bn-item${active ? " active" : ""}`}>
                <span className="bn-ic">
                  <KiIcon name={item.icon} size={20} />
                </span>
                <span className="bn-label">{item.label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            className={`bn-item${mobileMenuOpen ? " active" : ""}`}
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Menü"
          >
            <span className="bn-ic">
              <KiIcon name="ki-element-11" size={20} />
            </span>
            <span className="bn-label">Menü</span>
          </button>
        </nav>

        {mobileMenuOpen ? (
          <>
            <button
              type="button"
              className="bn-dim"
              aria-label="Menüyü kapat"
              onClick={() => setMobileMenuOpen(false)}
            />
            <nav className="bn-sheet" aria-label="Mobil menü">
              <div className="bn-sheet-handle" />
              <div className="bn-sheet-head">
                <b>Menü</b>
                <button type="button" className="icon-btn" onClick={() => setMobileMenuOpen(false)} aria-label="Kapat">
                  <KiIcon name="ki-cross" size={17} />
                </button>
              </div>
              <div className="bn-sheet-list">
                {mobileDrawerItems.map((item) => {
                  const active = path === item.href || (item.href !== dash && path.startsWith(`${item.href}/`));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`nav-item${active ? " active" : ""}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <KiIcon name={item.icon} size={18} />
                      <span>{item.label}</span>
                      {item.tag ? <span className="nav-tag">{item.tag}</span> : null}
                    </Link>
                  );
                })}
              </div>
            </nav>
          </>
        ) : null}
      </>
    ) : null}
    </>
  );
}
