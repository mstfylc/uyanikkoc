import { Suspense } from "react";

import { SettingsPanel } from "@/components/shared/SettingsPanel";

export default function CoachSettingsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsPanel role="coach" />
    </Suspense>
  );
}
