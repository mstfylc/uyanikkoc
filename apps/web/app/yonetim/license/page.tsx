"use client";

import { useSession } from "next-auth/react";

import { BranchLicense } from "@/components/admin/branch/BranchLicense";
import { CoachLicensePanel } from "@/components/coach/CoachLicensePanel";

export default function YonetimLicensePage() {
  const { data: session } = useSession();

  if (session?.user?.role === "coach") {
    return <CoachLicensePanel />;
  }

  return <BranchLicense />;
}
