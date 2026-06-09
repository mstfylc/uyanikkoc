import "@/styles/uk-admin.css";

import { Suspense } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { YonetimShell } from "@/components/admin/YonetimShell";
import { resolveActiveLicenseForUser } from "@/lib/auth/resolve-license";
import { ROLE_HOME_PATH, loginHrefForPath } from "@/lib/rbac";

export default async function YonetimLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user?.role) {
    redirect(loginHrefForPath("/yonetim/dashboard"));
  }

  if (session.user.role !== "admin" && session.user.role !== "branch" && session.user.role !== "coach") {
    redirect(ROLE_HOME_PATH[session.user.role]);
  }

  const license = await resolveActiveLicenseForUser({
    id: session.user.id,
    role: session.user.role,
    organizationId: session.user.organizationId ?? null,
    branchId: session.user.branchId ?? null,
    studentId: session.user.studentId ?? null,
    coachId: session.user.coachId ?? null,
    parentId: session.user.parentId ?? null,
  });

  if (!license.hasActiveLicense) {
    redirect(`/license/erisim-yok?reason=${encodeURIComponent(license.reason)}`);
  }

  return (
    <Suspense fallback={<div className="card card-pad muted" style={{ margin: 24 }}>Yukleniyor...</div>}>
      <YonetimShell>{children}</YonetimShell>
    </Suspense>
  );
}
