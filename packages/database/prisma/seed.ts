import { hashSync } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const DEMO_ORG_ID = "org_demo_001";
const DEMO_BRANCH_ID = "branch_demo_001";
const DEMO_PASSWORD_HASH = hashSync("uyanik123", 10);

const prisma = new PrismaClient();

async function main() {
  await prisma.organization.upsert({
    where: { id: DEMO_ORG_ID },
    update: { name: "Uyanik Demo Org" },
    create: { id: DEMO_ORG_ID, name: "Uyanik Demo Org" },
  });

  await prisma.branch.upsert({
    where: { id: DEMO_BRANCH_ID },
    update: { name: "Uyanik Demo Branch", organizationId: DEMO_ORG_ID },
    create: {
      id: DEMO_BRANCH_ID,
      name: "Uyanik Demo Branch",
      organizationId: DEMO_ORG_ID,
    },
  });

  const users = [
    {
      id: "user_student_001",
      email: "student@uyanik.local",
      role: "STUDENT" as const,
      studentId: "student_001",
      parentId: "parent_001",
    },
    {
      id: "user_coach_001",
      email: "coach@uyanik.local",
      role: "COACH" as const,
      coachId: "coach_001",
    },
    {
      id: "user_parent_001",
      email: "parent@uyanik.local",
      role: "PARENT" as const,
      parentId: "parent_001",
    },
    {
      id: "user_branch_001",
      email: "branch@uyanik.local",
      role: "BRANCH_MANAGER" as const,
    },
    {
      id: "user_admin_001",
      email: "admin@uyanik.local",
      role: "ORG_ADMIN" as const,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        email: user.email,
        passwordHash: DEMO_PASSWORD_HASH,
        role: user.role,
        organizationId: DEMO_ORG_ID,
        branchId: DEMO_BRANCH_ID,
      },
      create: {
        id: user.id,
        email: user.email,
        passwordHash: DEMO_PASSWORD_HASH,
        role: user.role,
        organizationId: DEMO_ORG_ID,
        branchId: DEMO_BRANCH_ID,
      },
    });
  }

  await prisma.studentProfile.upsert({
    where: { id: "student_001" },
    update: { userId: "user_student_001", parentId: "parent_001" },
    create: { id: "student_001", userId: "user_student_001", parentId: "parent_001" },
  });

  await prisma.coachProfile.upsert({
    where: { id: "coach_001" },
    update: { userId: "user_coach_001" },
    create: { id: "coach_001", userId: "user_coach_001" },
  });

  await prisma.parentProfile.upsert({
    where: { id: "parent_001" },
    update: { userId: "user_parent_001" },
    create: { id: "parent_001", userId: "user_parent_001" },
  });

  console.log("Seed completed: demo org, branch, users, profiles");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
