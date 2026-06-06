"use client";

import { BranchCoaches } from "@/components/admin/branch/BranchCoaches";
import { YonetimRolePage } from "@/components/admin/YonetimRolePage";
import { SuperCoaches } from "@/components/admin/super/SuperCoaches";

export default function YonetimCoachesPage() {
  return <YonetimRolePage admin={<SuperCoaches />} branch={<BranchCoaches />} />;
}
