"use client";

import type { AppRole } from "@uyanik/tokens";
import { useSession } from "next-auth/react";

import { AdminStoreProvider } from "@/components/admin/AdminStore";
import { AppLayout } from "@/components/layout/AppLayout";

export function YonetimShell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const role: AppRole = session?.user?.role === "admin" ? "admin" : "branch";

  return (
    <AppLayout role={role}>
      <AdminStoreProvider>{children}</AdminStoreProvider>
    </AppLayout>
  );
}
