import "@/styles/uk-admin.css";

import { Suspense } from "react";

import { YonetimShell } from "@/components/admin/YonetimShell";

export default function YonetimLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="card card-pad muted" style={{ margin: 24 }}>Yukleniyor…</div>}>
      <YonetimShell>{children}</YonetimShell>
    </Suspense>
  );
}
