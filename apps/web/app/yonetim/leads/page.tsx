import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { SuperLeads } from "@/components/admin/super/SuperLeads";
import { ROLE_HOME_PATH } from "@/lib/rbac";

export default async function YonetimLeadsPage() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    redirect(session?.user?.role ? ROLE_HOME_PATH[session.user.role] : "/login");
  }
  return <SuperLeads />;
}
