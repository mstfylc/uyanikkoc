"use client";

import type { AppRole } from "@uyanik/tokens";
import Link from "next/link";
import { usePathname } from "next/navigation";

type MenuItem = {
  href: string;
  label: string;
  icon: string;
};

const MENU_BY_ROLE: Record<"coach" | "student" | "parent" | "branch" | "admin", MenuItem[]> = {
  coach: [
    { href: "/coach/dashboard", label: "Dashboard", icon: "ki-element-11" },
    { href: "/coach/dashboard", label: "Öğrencilerim", icon: "ki-people" },
    { href: "/coach/assignments/create", label: "Ödev & Görev", icon: "ki-notepad-edit" },
    { href: "/coach/dashboard", label: "Denemeler", icon: "ki-chart-simple" },
    { href: "/coach/dashboard", label: "Mesajlar", icon: "ki-messages" },
    { href: "/coach/dashboard", label: "Raporlar", icon: "ki-graph-up" },
  ],
  student: [
    { href: "/student/dashboard", label: "Dashboard", icon: "ki-element-11" },
    { href: "/student/dashboard", label: "Çalışma Programı", icon: "ki-calendar" },
    { href: "/student/dashboard", label: "Konu Takibi", icon: "ki-book-open" },
    { href: "/student/dashboard", label: "Denemeler", icon: "ki-chart-simple" },
    { href: "/student/assignments", label: "Ödevlerim", icon: "ki-notepad-edit" },
    { href: "/student/ai-coach", label: "AI Koç · Yakında", icon: "ki-technology-2" },
    { href: "/student/dashboard", label: "Motivasyon", icon: "ki-star" },
  ],
  parent: [
    { href: "/parent/dashboard", label: "Dashboard", icon: "ki-element-11" },
    { href: "/parent/dashboard", label: "Raporlar", icon: "ki-graph-up" },
    { href: "/parent/dashboard", label: "Koça Mesaj", icon: "ki-messages" },
    { href: "/parent/dashboard", label: "Bildirimler", icon: "ki-notification-on" },
  ],
  branch: [
    { href: "/branch/dashboard", label: "Dashboard", icon: "ki-element-11" },
    { href: "/branch/dashboard", label: "Öğrenciler", icon: "ki-people" },
    { href: "/branch/dashboard", label: "Koçlar", icon: "ki-profile-circle" },
    { href: "/branch/dashboard", label: "Raporlar", icon: "ki-graph-up" },
  ],
  admin: [
    { href: "/admin/dashboard", label: "Dashboard", icon: "ki-element-11" },
    { href: "/admin/dashboard", label: "Kullanıcılar", icon: "ki-people" },
    { href: "/admin/dashboard", label: "Sistem Sağlığı", icon: "ki-shield-tick" },
  ],
};

type SidebarProps = {
  role: AppRole;
};

const ROLE_DASHBOARD_PATHS = new Set([
  "/coach/dashboard",
  "/student/dashboard",
  "/parent/dashboard",
  "/branch/dashboard",
  "/admin/dashboard",
]);

function isActive(pathname: string, href: string): boolean {
  if (ROLE_DASHBOARD_PATHS.has(href)) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const items = MENU_BY_ROLE[role as keyof typeof MENU_BY_ROLE] ?? [];

  return (
    <div
      className="kt-sidebar dark bg-background border-e border-e-border fixed top-0 bottom-0 z-20 hidden lg:flex flex-col items-stretch shrink-0 [--kt-drawer-enable:true] lg:[--kt-drawer-enable:false]"
      data-kt-drawer="true"
      data-kt-drawer-class="kt-drawer kt-drawer-start top-0 bottom-0"
      id="sidebar"
    >
      <div
        className="kt-sidebar-header hidden lg:flex items-center relative justify-between px-3 lg:px-6 shrink-0"
        id="sidebar_header"
      >
        <div className="kt-sidebar-logo min-w-0">
          <Link href={items[0]?.href ?? "/"}>
            <span className="text-lg font-semibold text-foreground">Uyanık Koç</span>
          </Link>
        </div>
        <div data-kt-toggle="body" data-kt-toggle-class="kt-sidebar-collapse" id="sidebar_toggle">
          <button
            type="button"
            className="kt-btn kt-btn-outline kt-btn-icon size-[30px] rounded-lg absolute start-full top-2/4 z-40 -translate-x-2/4 -translate-y-2/4"
            aria-label="Kenar çubuğunu daralt"
          >
            <i className="ki-filled ki-black-left-line kt-toggle-active:rotate-180 transition-all duration-300" />
          </button>
        </div>
      </div>

      <div className="kt-sidebar-content flex grow shrink-0 py-5 pe-2" id="sidebar_content">
        <div
          className="kt-scrollable-y-hover grow shrink-0 flex ps-2 lg:ps-5 pe-1 lg:pe-3"
          data-kt-scrollable="true"
          data-kt-scrollable-dependencies="#sidebar_header"
          data-kt-scrollable-height="auto"
          data-kt-scrollable-wrappers="#sidebar_content"
          id="sidebar_scrollable"
        >
          <div
            className="kt-menu flex flex-col grow gap-1"
            data-kt-menu="true"
            data-kt-menu-accordion-expand-all="false"
            id="sidebar_menu"
          >
            {items.map((item) => {
              const active = isActive(pathname, item.href);

              return (
                <div
                  key={`${item.href}-${item.label}`}
                  className={`kt-menu-item${active ? " here active" : ""}`}
                >
                  <Link
                    className="kt-menu-link flex items-center grow border border-transparent gap-[10px] ps-[10px] pe-[10px] py-[6px]"
                    href={item.href}
                  >
                    <span className="kt-menu-icon items-start text-muted-foreground w-[20px]">
                      <i className={`ki-filled ${item.icon} text-lg`} />
                    </span>
                    <span className="kt-menu-title text-sm font-medium text-foreground kt-menu-item-active:text-primary kt-menu-link-hover:!text-primary">
                      {item.label}
                    </span>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
