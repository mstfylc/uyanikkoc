"use client";

import { useSession } from "next-auth/react";

import { BranchSettings } from "@/components/admin/branch/BranchSettings";
import { SuperSettings } from "@/components/admin/super/SuperSettings";

export function YonetimSettingsContent() {
  const { data: session } = useSession();
  if (session?.user?.role === "admin") {
    return <SuperSettings />;
  }
  return <BranchSettings />;
}
