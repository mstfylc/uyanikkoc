import type { DbRole } from "@uyanik/tokens";
import { hashSync } from "bcryptjs";

export const DEMO_ORG_ID = "org_demo_001";
export const DEMO_BRANCH_ID = "branch_demo_001";
export const DEMO_COACH_ID = "coach_001";
export const KAMPUS_KOC_ORG_ID = "akademi-yildiz";
export const KAMPUS_KOC_BRANCH_ID = "ay-kadikoy";
export const DEMO_PASSWORD = "uyanik123";

/** Runtime hash — repodaki eski statik hash uyanik123 ile eşleşmiyordu (8cf8f9f regresyonu). */
export const DEMO_PASSWORD_HASH = hashSync(DEMO_PASSWORD, 10);

export type DemoUser = {
  id: string;
  email: string;
  name?: string;
  phone?: string;
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
    name: "Elif Yıldız",
    phone: "0533 214 55 80",
    passwordHash: DEMO_PASSWORD_HASH,
    role: "STUDENT",
    organizationId: DEMO_ORG_ID,
    branchId: DEMO_BRANCH_ID,
    studentId: "student_001",
  },
  {
    id: "user_student_002",
    email: "student2@uyanik.local",
    name: "Mert Demir",
    phone: "0533 214 55 81",
    passwordHash: DEMO_PASSWORD_HASH,
    role: "STUDENT",
    organizationId: DEMO_ORG_ID,
    branchId: DEMO_BRANCH_ID,
    studentId: "student_002",
  },
  {
    id: "user_coach_001",
    email: "coach@uyanik.local",
    name: "Dilek Emen",
    phone: "0532 118 44 02",
    passwordHash: DEMO_PASSWORD_HASH,
    role: "COACH",
    organizationId: DEMO_ORG_ID,
    branchId: DEMO_BRANCH_ID,
    coachId: "coach_001",
  },
  {
    id: "user_parent_001",
    email: "parent@uyanik.local",
    name: "Ayşe Yıldız",
    phone: "0535 904 21 33",
    passwordHash: DEMO_PASSWORD_HASH,
    role: "PARENT",
    organizationId: DEMO_ORG_ID,
    branchId: DEMO_BRANCH_ID,
    parentId: "parent_001",
  },
  {
    id: "user_branch_001",
    email: "branch@uyanik.local",
    name: "Şube Yöneticisi",
    passwordHash: DEMO_PASSWORD_HASH,
    role: "BRANCH_MANAGER",
    organizationId: DEMO_ORG_ID,
    branchId: DEMO_BRANCH_ID,
  },
  {
    id: "user_admin_001",
    email: "admin@uyanik.local",
    name: "Sistem Yöneticisi",
    passwordHash: DEMO_PASSWORD_HASH,
    role: "ORG_ADMIN",
    organizationId: DEMO_ORG_ID,
    branchId: DEMO_BRANCH_ID,
  },
  {
    id: "user_kampus_koc_owner",
    email: "incisel@kampuskoc.com",
    passwordHash: DEMO_PASSWORD_HASH,
    role: "BRANCH_MANAGER",
    organizationId: KAMPUS_KOC_ORG_ID,
    branchId: KAMPUS_KOC_BRANCH_ID,
  },
  /** Super Admin alias — ayni ORG_ADMIN oturumu (platform yonetimi). */
  {
    id: "user_superadmin_001",
    email: "superadmin@uyanik.local",
    passwordHash: DEMO_PASSWORD_HASH,
    role: "ORG_ADMIN",
    organizationId: DEMO_ORG_ID,
    branchId: DEMO_BRANCH_ID,
  },
];
