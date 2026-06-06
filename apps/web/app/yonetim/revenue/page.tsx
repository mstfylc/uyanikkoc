"use client";

import { BranchRevenue } from "@/components/admin/branch/BranchRevenue";
import { YonetimRolePage } from "@/components/admin/YonetimRolePage";
import { SuperRevenue } from "@/components/admin/super/SuperRevenue";

export default function YonetimRevenuePage() {
  return <YonetimRolePage admin={<SuperRevenue />} branch={<BranchRevenue />} />;
}
