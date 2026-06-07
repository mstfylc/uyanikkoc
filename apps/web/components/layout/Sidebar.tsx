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
  const [motivationEnabled, setMotivationEnabled] = useState(true);

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
    const base = getUkNavItems(role);
    if (role !== "student" || motivationEnabled) {
      return base;
    }
    return base.filter((item) => item.href !== "/student/motivation");
  }, [role, motivationEnabled]);

  const generalItems = getUkGeneralNavItems(role);
  const activeItem = findUkNavItem(role, path);
  const profileHref = getProfileHref(role);
  const dash = dashboardHref(role);

  return (
    <aside className="sidebar theme-fade">
      <div className="sidebar-logo">
        <span className="logo-mark">
          <KiIcon name="ki-flash" size={18} className="text-white" />
        </span>
        <span className="logo-text">
          <b>Uyanik Koc</b>
          <span>Akilli kocluk</span>
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
  );
}
