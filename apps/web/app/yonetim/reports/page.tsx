"use client";

import { useSession } from "next-auth/react";

import { BranchReports } from "@/components/admin/branch/BranchReports";
import { SuperReports } from "@/components/admin/super/SuperReports";

export default function YonetimReportsPage() {
  const { data: session } = useSession();

  if (session?.user?.role === "admin") {
    return <SuperReports />;
  }

  return <BranchReports />;
}
