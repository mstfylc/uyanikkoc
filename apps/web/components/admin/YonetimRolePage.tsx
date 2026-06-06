"use client";

import type { ReactNode } from "react";
import { useSession } from "next-auth/react";

type YonetimRolePageProps = {
  admin: ReactNode;
  branch?: ReactNode;
};

export function YonetimRolePage({ admin, branch = null }: YonetimRolePageProps) {
  const { data: session } = useSession();

  if (session?.user?.role === "admin") {
    return admin;
  }

  return branch;
}
