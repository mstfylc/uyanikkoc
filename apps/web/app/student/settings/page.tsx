import { Suspense } from "react";

import { SettingsPanel } from "@/components/shared/SettingsPanel";

export default function StudentSettingsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsPanel role="student" />
    </Suspense>
  );
}
