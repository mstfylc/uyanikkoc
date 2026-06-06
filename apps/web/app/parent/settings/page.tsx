import { Suspense } from "react";

import { SettingsPanel } from "@/components/shared/SettingsPanel";

export default function ParentSettingsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsPanel role="parent" />
    </Suspense>
  );
}
