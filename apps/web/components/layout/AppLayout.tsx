"use client";

import type { AppRole } from "@uyanik/tokens";

import { useMetronic } from "@/hooks/useMetronic";

import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

type AppLayoutProps = {
  role: AppRole;
  children: React.ReactNode;
};

export function AppLayout({ role, children }: AppLayoutProps) {
  useMetronic();

  return (
    <div className="flex grow min-h-screen">
      <Sidebar role={role} />
      <div className="kt-wrapper flex grow flex-col lg:ps-[--tw-sidebar-width,280px]">
        <Header role={role} />
        <main className="kt-container-fixed flex flex-col grow pt-5 lg:pt-[calc(var(--tw-header-height,70px)+1.25rem)] pb-5">
          {children}
        </main>
      </div>
    </div>
  );
}
