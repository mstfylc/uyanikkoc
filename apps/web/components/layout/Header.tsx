"use client";

import type { AppRole } from "@uyanik/tokens";
import { signOut, useSession } from "next-auth/react";

const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Admin",
  branch: "Şube",
  coach: "Koç",
  student: "Öğrenci",
  parent: "Veli",
};

type HeaderProps = {
  role: AppRole;
};

export function Header({ role }: HeaderProps) {
  const { data: session } = useSession();
  const displayName = session?.user?.name ?? session?.user?.email ?? "Kullanıcı";

  return (
    <header
      className="kt-header fixed top-0 z-10 start-0 end-0 flex items-stretch shrink-0 bg-background border-b border-border lg:start-[280px]"
      data-kt-sticky="true"
      data-kt-sticky-class="border-b border-border"
      data-kt-sticky-name="header"
      id="header"
    >
      <div className="kt-container-fixed flex justify-between items-stretch lg:gap-4 w-full" id="headerContainer">
        <div className="flex gap-2.5 lg:hidden items-center -ms-1">
          <span className="text-sm font-semibold text-foreground">Uyanık Koç</span>
          <button
            type="button"
            className="kt-btn kt-btn-icon kt-btn-ghost"
            data-kt-drawer-toggle="#sidebar"
            aria-label="Menüyü aç"
          >
            <i className="ki-filled ki-menu" />
          </button>
        </div>

        <div className="hidden lg:flex items-center">
          <span className="text-sm text-muted-foreground">Uyanık Koç Paneli</span>
        </div>

        <div className="flex items-center gap-2 ms-auto">
          <span className="kt-badge kt-badge-sm kt-badge-outline kt-badge-primary hidden sm:inline-flex">
            {ROLE_LABELS[role]}
          </span>

          <div className="relative" data-kt-menu="true" data-kt-menu-placement="bottom-end">
            <button
              type="button"
              className="kt-btn kt-btn-light flex items-center gap-2"
              data-kt-menu-trigger="click"
            >
              <span className="text-sm font-medium text-foreground">{displayName}</span>
              <i className="ki-filled ki-down text-xs" />
            </button>
            <div className="kt-menu-dropdown kt-menu-default w-48 py-2 hidden" data-kt-menu-dismiss="true">
              <div className="px-4 py-2 text-xs text-muted-foreground">{session?.user?.email}</div>
              <div className="border-b border-border my-1" />
              <button
                type="button"
                className="kt-menu-link w-full text-start px-4 py-2 text-sm text-danger hover:bg-muted"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
