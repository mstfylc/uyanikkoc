"use client";

import { useSession } from "next-auth/react";

import { BranchDashboard } from "@/components/admin/branch/BranchDashboard";
import { SuperOverview } from "@/components/admin/super/SuperOverview";
import { CoachLicensePanel } from "@/components/coach/CoachLicensePanel";

export function YonetimDashboardContent() {
  const { data: session } = useSession();

  if (session?.user?.role === "admin") {
    return <SuperOverview />;
  }
  if (session?.user?.role === "coach") {
    return <CoachLicensePanel />;
  }

  return <BranchDashboard />;
}

export default function YonetimDashboardPage() {
  return <YonetimDashboardContent />;
}
