"use client";

import type { AppRole } from "@uyanik/tokens";

import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

type AppLayoutProps = {
  role: AppRole;
  children: React.ReactNode;
};

export function AppLayout({ role, children }: AppLayoutProps) {
  return (
    <div className="app theme-fade">
      <Sidebar role={role} />
      <div className="main">
        <Header role={role} />
        <div className="content rise">{children}</div>
      </div>
    </div>
  );
}
