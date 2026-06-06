"use client";

import { use } from "react";

import { BranchCoachDetail } from "@/components/admin/branch/BranchCoachDetail";
import { YonetimRolePage } from "@/components/admin/YonetimRolePage";
import { SuperCoachProfile } from "@/components/admin/super/SuperCoachProfile";

export default function YonetimCoachDetailPage({
  params,
}: {
  params: Promise<{ coachId: string }>;
}) {
  const { coachId } = use(params);
  return (
    <YonetimRolePage
      admin={<SuperCoachProfile coachId={coachId} />}
      branch={<BranchCoachDetail coachId={coachId} />}
    />
  );
}
