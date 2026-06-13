import type { AppRole } from "@uyanik/tokens";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: AppRole;
      organizationId?: string | null;
      branchId?: string | null;
      studentId?: string | null;
      coachId?: string | null;
      parentId?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: AppRole;
    name?: string | null;
    organizationId?: string | null;
    branchId?: string | null;
    studentId?: string | null;
    coachId?: string | null;
    parentId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: AppRole;
    name?: string | null;
    organizationId?: string | null;
    branchId?: string | null;
    studentId?: string | null;
    coachId?: string | null;
    parentId?: string | null;
  }
}
