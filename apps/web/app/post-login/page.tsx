import { redirect } from "next/navigation";

import { auth } from "../../auth";
import { ROLE_HOME_PATH } from "../../lib/rbac";

export default async function PostLoginPage() {
  const session = await auth();

  if (!session?.user?.role) {
    redirect("/login");
  }

  redirect(ROLE_HOME_PATH[session.user.role]);
}
