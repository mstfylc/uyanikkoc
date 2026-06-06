"use client";

import { useSession } from "next-auth/react";

import { BranchDashboard } from "@/components/admin/branch/BranchDashboard";
import { SuperOverview } from "@/components/admin/super/SuperOverview";

export default function YonetimDashboardPage() {
  const { data: session } = useSession();

  if (session?.user?.role === "admin") {
    return <SuperOverview />;
  }

  return <BranchDashboard />;
}
