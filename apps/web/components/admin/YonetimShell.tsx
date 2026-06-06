"use client";

import type { AppRole } from "@uyanik/tokens";
import { useSession } from "next-auth/react";

import { AdminStoreProvider } from "@/components/admin/AdminStore";
import { AppLayout } from "@/components/layout/AppLayout";

export function YonetimShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="card card-pad muted" style={{ margin: 24 }}>Yukleniyor…</div>;
  }

  const userRole = session?.user?.role;
  if (userRole !== "admin" && userRole !== "branch") {
    return null;
  }

  const role: AppRole = userRole;

  return (
    <AppLayout role={role}>
      <AdminStoreProvider>{children}</AdminStoreProvider>
    </AppLayout>
  );
}
