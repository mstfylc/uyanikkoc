import type { DbRole } from "@uyanik/tokens";

export const DEMO_ORG_ID = "org_demo_001";
export const DEMO_BRANCH_ID = "branch_demo_001";

/** bcryptjs.hashSync("uyanik123", 10) */
export const DEMO_PASSWORD_HASH =
  "$2b$10$IC1Jmqu4yzbuTg4gNWszNusmd/F1X3Z4pxWLLx1A6QJHNSFfQfgrC";

export type DemoUser = {
  id: string;
  email: string;
  passwordHash: string;
  role: DbRole;
  organizationId: string;
  branchId: string;
  studentId?: string;
  coachId?: string;
  parentId?: string;
};

export const demoUsers: DemoUser[] = [
  {
    id: "user_student_001",
    email: "student@uyanik.local",
    passwordHash: DEMO_PASSWORD_HASH,
    role: "STUDENT",
    organizationId: DEMO_ORG_ID,
    branchId: DEMO_BRANCH_ID,
    studentId: "student_001",
  },
  {
    id: "user_coach_001",
    email: "coach@uyanik.local",
    passwordHash: DEMO_PASSWORD_HASH,
    role: "COACH",
    organizationId: DEMO_ORG_ID,
    branchId: DEMO_BRANCH_ID,
    coachId: "coach_001",
  },
  {
    id: "user_parent_001",
    email: "parent@uyanik.local",
    passwordHash: DEMO_PASSWORD_HASH,
    role: "PARENT",
    organizationId: DEMO_ORG_ID,
    branchId: DEMO_BRANCH_ID,
    parentId: "parent_001",
  },
  {
    id: "user_branch_001",
    email: "branch@uyanik.local",
    passwordHash: DEMO_PASSWORD_HASH,
    role: "BRANCH_MANAGER",
    organizationId: DEMO_ORG_ID,
    branchId: DEMO_BRANCH_ID,
  },
  {
    id: "user_admin_001",
    email: "admin@uyanik.local",
    passwordHash: DEMO_PASSWORD_HASH,
    role: "ORG_ADMIN",
    organizationId: DEMO_ORG_ID,
    branchId: DEMO_BRANCH_ID,
  },
];
